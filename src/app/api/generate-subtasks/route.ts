// app/api/generate-subtasks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer"; // IMPORTANT: Ensure this correctly creates a SERVER-SIDE Supabase client
import Groq from "groq-sdk";
import { randomUUID } from "crypto"; // Import randomUUID from Node.js crypto module

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// Frontend sends these types as `existingSubtasks`
type ClientSubtask = {
  id?: string;
  title: unknown;
  description: unknown;
  start_time: unknown; // Unix ms from frontend
  end_time: unknown; // Unix ms from frontend
  locked?: unknown;
};

// AI response and validated subtasks in backend should match this structure internally
// Note: start_time and end_time are numbers (Unix ms) from AI
type ValidSubtask = {
  id?: string;
  title: string;
  description: string;
  start_time: number; // Unix milliseconds
  end_time: number; // Unix milliseconds
  locked: boolean;
};

// This matches your DbTask for Supabase insert/update
// Note: start_time and end_time are strings (YYYY-MM-DD) for Supabase 'date' columns
type SupabaseTask = {
  id?: string; // Optional for new inserts, required for updates
  title: string;
  description: string | null;
  start_time: string; // YYYY-MM-DD
  end_time: string; // YYYY-MM-DD
  parent_task_id: string;
  project_id: string;
  status: string;
};

// ✅ Reusable validation function for AI output / incoming client subtasks
function isValidSubtask(obj: ClientSubtask): obj is ValidSubtask {
  return (
    typeof obj.title === "string" &&
    typeof obj.description === "string" &&
    typeof obj.start_time === "number" && // Expecting number (Unix ms)
    typeof obj.end_time === "number" && // Expecting number (Unix ms)
    typeof obj.locked === "boolean"
  );
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {
    parentTaskId,
    projectId,
    taskTitle,
    parentStartTime,
    parentEndTime,
    existingSubtasks,
    prompt: userPrompt,
  } = body;

  // ✅ Basic input validation
  if (
    !parentTaskId ||
    !projectId ||
    !taskTitle ||
    !parentStartTime ||
    !parentEndTime
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (
    typeof parentStartTime !== "number" ||
    typeof parentEndTime !== "number"
  ) {
    return NextResponse.json(
      { error: "Parent start/end times must be numbers (Unix ms)" },
      { status: 400 }
    );
  }

  if (!Array.isArray(existingSubtasks)) {
    return NextResponse.json(
      { error: "`existingSubtasks` must be an array" },
      { status: 400 }
    );
  }

  // ✅ Validate and split locked/unlocked
  const validSubtasksFromClient: ValidSubtask[] = [];
  for (const subtask of existingSubtasks) {
    if (!isValidSubtask(subtask)) {
      console.error("Invalid incoming subtask:", subtask);
      return NextResponse.json(
        { error: "Invalid subtask format in `existingSubtasks`" },
        { status: 400 }
      );
    }
    validSubtasksFromClient.push(subtask);
  }

  const lockedSubtasks = validSubtasksFromClient.filter((s) => s.locked);

  // --- NEW AUTHORIZATION CHECK: Verify user is a member of the project ---
  const { data: projectMember, error: memberError } = await supabase
    .from("project_members")
    .select("id") // We just need to know if a record exists
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single(); // Use single() because we expect at most one matching record

  if (memberError && memberError.code !== "PGRST116") {
    // PGRST116 is the error code for "no rows found" from .single()
    console.error("Supabase error checking project membership:", memberError);
    return NextResponse.json(
      { error: "Database error while verifying project membership." },
      { status: 500 }
    );
  }

  if (!projectMember) {
    // If projectMember is null, the user is not a member
    return NextResponse.json(
      { error: "Forbidden: You are not a member of this project." },
      { status: 403 }
    );
  }
  // --- END NEW AUTHORIZATION CHECK ---

  // Check that the parent task actually exists within this project
  // This check is for data integrity, not user authorization, as auth is done via project_members
  const { data: parentTask, error: parentError } = await supabase
    .from("tasks")
    .select("id") // Only select id, as we no longer need created_by for this auth
    .eq("id", parentTaskId)
    .eq("project_id", projectId) // Ensure the parent task belongs to the project
    .single();

  if (parentError || !parentTask) {
    console.error(
      "Supabase error fetching parent task for existence check:",
      parentError
    );
    return NextResponse.json(
      { error: "Parent task not found in this project or database error." },
      { status: 500 }
    );
  }

  // 🧠 Build AI prompt
  const promptContent = `You are a helpful project assistant.
Given a task and its timeframe (Unix timestamps in milliseconds), and a list of existing locked subtasks.
Your goal is to generate new subtasks to fill the remaining time.

Constraints:
- DO NOT change or remove any existing "locked" subtasks. Include them as-is in your final output.
- All new subtasks must have unique temporary IDs (e.g., "new-subtask-1", "new-subtask-2").
- Each subtask, whether locked or new, must have a 'title' (string), 'description' (string), 'start_time' (Unix timestamp in milliseconds), 'end_time' (Unix timestamp in milliseconds), and 'locked' (boolean).
- The 'description' should be concise but informative.
- Ensure the start_time and end_time of all generated subtasks fall within the parent task's timeframe (${parentStartTime} to ${parentEndTime}).
- If existing locked subtasks cover the entire parent task timeframe, do not generate new subtasks, but still return the locked subtasks.
- Ensure there are no significant gaps between subtasks, aim for continuity.

Here is the high-level task and its timeframe:
Task Title: "${taskTitle}"
Parent Start Time (Unix ms): ${parentStartTime}
Parent End Time (Unix ms): ${parentEndTime}

Existing Locked Subtasks (if any):
${JSON.stringify(lockedSubtasks, null, 2)}

${userPrompt ? `User's additional prompt/preference: "${userPrompt}"` : ""}

Provide your response as a JSON object with a single key "subtasks" which contains an array of subtask objects. Example:
{
  "subtasks": [
    {
      "id": "existing-locked-subtask-id-1",
      "title": "Existing Locked Task",
      "description": "This task was preserved.",
      "start_time": 1709251200000,
      "end_time": 1709424000000,
      "locked": true
    },
    {
      "id": "new-subtask-1",
      "title": "First New Subtask",
      "description": "Description for the first new task.",
      "start_time": 1709424000000,
      "end_time": 1709596800000,
      "locked": false
    }
  ]
}

`;

  let rawAiResponse = "[]";
  try {
    const completion = await groq.chat.completions.create({
      model: "mistral-saba-24b", // Or 'llama3-8b-8192', 'llama3-70b-8192' etc. based on your Groq access
      messages: [
        {
          role: "system",
          content:
            "You are an expert project manager and assistant, capable of breaking down large tasks into smaller, manageable subtasks with accurate timelines.",
        },
        { role: "user", content: promptContent },
      ],
      response_format: { type: "json_object" }, // Request JSON object output from Groq
      temperature: 0.7, // Adjust creativity
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI response content was empty.");
    }

    const parsedGroqResponse = JSON.parse(content);
    // Adjust this part based on how Groq consistently returns its JSON.
    // If it gives you an array directly, `parsedGroqResponse` will be the array.
    // If it wraps the array in a key (e.g., { "subtasks": [...] }), then use parsedGroqResponse.subtasks.
    if (Array.isArray(parsedGroqResponse)) {
      rawAiResponse = content; // It's a bare array
    } else if (
      parsedGroqResponse &&
      Array.isArray(parsedGroqResponse.subtasks)
    ) {
      rawAiResponse = JSON.stringify(parsedGroqResponse.subtasks); // It's wrapped in 'subtasks'
    } else {
      throw new Error(
        "AI response was not a valid JSON array or wrapped array."
      );
    }
  } catch (e: unknown) {
    console.error("Groq API call failed:", (e as Error).message);
    return NextResponse.json(
      { error: `AI generation failed: ${(e as Error).message}` },
      { status: 500 }
    );
  }

  let parsedSubtasks: ValidSubtask[] = [];
  try {
    const maybeParsed = JSON.parse(rawAiResponse);

    if (!Array.isArray(maybeParsed)) {
      throw new Error("AI response was not a JSON array.");
    }

    // ✅ Validate each subtask from AI response
    parsedSubtasks = maybeParsed.filter((s): s is ValidSubtask =>
      isValidSubtask(s)
    );

    if (parsedSubtasks.length === 0 && maybeParsed.length > 0) {
      console.warn("AI generated subtasks were all invalid:", rawAiResponse);
      return NextResponse.json(
        { error: "AI generated subtasks but none were in the correct format." },
        { status: 422 }
      );
    }
  } catch (e: unknown) {
    console.error(
      "Failed to parse or validate AI response:",
      (e as Error).message
    );
    return NextResponse.json(
      { error: `Failed to parse AI response: ${(e as Error).message}` },
      { status: 400 }
    );
  }
  const isUUID = (uuid: string | undefined | null): boolean => {
    if (!uuid) return false;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  // ✅ Convert Unix ms to YYYY-MM-DD for Supabase 'date' columns
  const subtasksToUpsert: SupabaseTask[] = parsedSubtasks.map((t) => ({
    id: isUUID(t.id) ? t.id : randomUUID(), // <--- THIS IS THE CHANGE
    title: t.title,
    description: t.description,
    // Convert Unix ms timestamp to YYYY-MM-DD string
    start_time: new Date(t.start_time).toISOString().split("T")[0],
    end_time: new Date(t.end_time).toISOString().split("T")[0],
    parent_task_id: parentTaskId,
    project_id: projectId,
    status: "todo", // Default status for new subtasks
  }));

  // const { error: upsertError } = await supabase
  //   .from("tasks")
  //   .upsert(subtasksToUpsert);

  // if (upsertError) {
  //   console.error("Supabase upsert failed:", upsertError);
  //   return NextResponse.json({ error: upsertError.message }, { status: 500 });
  // }

  return NextResponse.json({
    message: "Subtasks regenerated with locked subtasks preserved!",
    subtasks: subtasksToUpsert, // Return the formatted subtasks for frontend to display
  });
}
