// app/api/generate-subtasks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

type ClientSubtask = {
  id?: string;
  title: unknown;
  description: unknown;
  start_time: unknown;
  end_time: unknown;
  locked?: unknown;
};

type ValidSubtask = {
  id?: string;
  title: string;
  description: string;
  start_time: number;
  end_time: number;
  locked: boolean;
};

// ✅ Reusable validation function
function isValidSubtask(obj: ClientSubtask): obj is ValidSubtask {
  return (
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.start_time === 'number' &&
    typeof obj.end_time === 'number' &&
    typeof obj.locked === 'boolean'
  );
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const {
    parentTaskId,
    projectId,
    taskTitle,
    parentStartTime,
    parentEndTime,
    existingSubtasks,
  } = body;

  // ✅ Basic input validation
  if (!parentTaskId || !projectId || !taskTitle || !parentStartTime || !parentEndTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!Array.isArray(existingSubtasks)) {
    return NextResponse.json({ error: '`existingSubtasks` must be an array' }, { status: 400 });
  }

  // ✅ Validate and split locked/unlocked
  const validSubtasks: ValidSubtask[] = [];
  for (const subtask of existingSubtasks) {
    if (!isValidSubtask(subtask)) {
      return NextResponse.json({ error: 'Invalid subtask format in `existingSubtasks`' }, { status: 400 });
    }
    validSubtasks.push(subtask);
  }

  const lockedSubtasks = validSubtasks.filter((s) => s.locked);
  // const unlockedSubtasks = validSubtasks.filter((s) => !s.locked);

  // ✅ Authorization check: does user own the parent task?
  const { data: parentTask, error: parentError } = await supabase
    .from('tasks')
    .select('id, created_by')
    .eq('id', parentTaskId)
    .single();

  if (parentError || parentTask?.created_by !== user.id) {
    return NextResponse.json({ error: 'Forbidden: Not your task' }, { status: 403 });
  }

  // 🧠 Build AI prompt
  const prompt = `You are a helpful project assistant.

Given a task and its timeframe (Unix timestamps in ms), and a list of existing locked subtasks:

- DO NOT change locked subtasks.
- Cover the remaining time with new subtasks.
- Each subtask must have title, description, start_time, end_time (Unix ms).
- Return an array with both locked and newly generated subtasks.

Locked subtasks:
${JSON.stringify(lockedSubtasks, null, 2)}

Task: "${taskTitle}"
Start: ${parentStartTime}
End: ${parentEndTime}`;

  let raw = '[]';
  try {
    const completion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: 'You help break down high-level project tasks into detailed subtasks.' },
        { role: 'user', content: prompt }
      ]
    });

    raw = completion.choices[0]?.message?.content ?? '[]';
  } catch (e) {
    return NextResponse.json({ error: `AI generation failed: ${e}` }, { status: 500 });
  }

  let parsed: ValidSubtask[] = [];
  try {
    const maybeParsed = JSON.parse(raw);

    if (!Array.isArray(maybeParsed)) throw new Error('Not an array');

    // ✅ Validate AI response
    parsed = maybeParsed.filter((s): s is ValidSubtask => isValidSubtask(s));
  } catch (e) {
    return NextResponse.json({ error: `Failed to parse AI response as JSON. ${e}` }, { status: 400 });
  }

  const subtasksToUpsert = parsed.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    start_time: t.start_time,
    end_time: t.end_time,
    parent_task_id: parentTaskId,
    project_id: projectId,
    created_by: user.id,
    status: 'todo',
  }));

  const { error: upsertError } = await supabase.from('tasks').upsert(subtasksToUpsert);

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Subtasks regenerated with locked subtasks preserved!',
    subtasks: subtasksToUpsert
  });
}
