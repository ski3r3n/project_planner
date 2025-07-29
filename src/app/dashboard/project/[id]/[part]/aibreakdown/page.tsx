// app/dashboard/project/[id]/[part]/aibreakdown/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import Sidebar from "@/components/sidebar";
import {
  Box,
  Flex,
  Heading,
  Button,
  Stack,
  Textarea,
  IconButton,
  Text,
  Center,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { FiLock, FiUnlock } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";

// --- Interfaces for Frontend State and Display ---
type FrontendTask = {
  id?: string;
  title: string;
  description: string;
  start_time: string; // YYYY-MM-DD string
  end_time: string; // YYYY-MM-DD string
  locked: boolean;
};

// --- Interfaces for Backend API interaction (matches the types in your API route) ---
type ClientSubtaskForAPI = {
  id?: string;
  title: string;
  description: string;
  start_time: number; // Unix ms timestamp for API
  end_time: number; // Unix ms timestamp for API
  locked: boolean;
};

// Define the type for items received in the 'subtasks' array from the backend API response
type BackendSubtaskResponseItem = {
  id?: string;
  title: string;
  description?: string; // Backend might send null/undefined if not available
  start_time: string; // YYYY-MM-DD string from API
  end_time: string; // YYYY-MM-DD string from API
  locked?: boolean;
};

// --- Supabase DbTask type (matches your database schema for 'tasks') ---
interface DbTask {
  id?: string;
  title: string;
  description: string | null;
  start_time: string; // YYYY-MM-DD
  end_time: string; // YYYY-MM-DD
  parent_task_id: string | null;
  project_id: string;
  status: string;
  hierarchy_type: string; // ⭐ This is the crucial addition for this page's types
}

// --- Main Component ---
export default function TaskBreakdownPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;
  const parentTaskId = params.part as string;

  const [subtasks, setSubtasks] = useState<FrontendTask[]>([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [confirmingTasks, setConfirmingTasks] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [parentTaskDetails, setParentTaskDetails] = useState<{
    id: string;
    title: string;
    start_time: string;
    end_time: string;
  } | null>(null);

  // --- Effect to fetch Parent Task details and existing subtasks on load ---
  useEffect(() => {
    async function fetchParentTaskAndSubtasks() {
      setInitialLoading(true);
      setError(null);

      if (!parentTaskId || !projectId) {
        setError("Missing parent task ID or project ID in URL.");
        setInitialLoading(false);
        return;
      }

      try {
        // 1. Fetch parent task details
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("id, title, start_time, end_time")
          .eq("id", parentTaskId)
          .single();


        if (taskError || !taskData) {
          throw new Error(
            taskError?.message || "Parent task not found or unauthorized."
          );
        }
        setParentTaskDetails(taskData);

        // 2. Fetch existing subtasks for this parent task
        const { data: existingSubtasksData, error: subtasksError } =
          await supabase
            .from("tasks")
            .select("id, title, description, start_time, end_time")
            .eq("parent_task_id", parentTaskId);

        if (subtasksError) {
          throw new Error(
            subtasksError?.message || "Failed to fetch existing subtasks."
          );
        }

        const mappedSubtasks: FrontendTask[] = (existingSubtasksData || []).map(
          (dbTask) => ({
            id: dbTask.id,
            title: dbTask.title,
            description: dbTask.description || "",
            start_time: dbTask.start_time,
            end_time: dbTask.end_time,
            locked: false,
          })
        );
        setSubtasks(mappedSubtasks);
      } catch (err: unknown) {
        console.error("Error fetching initial data:", err);
        if (err instanceof Error) {
          setError(err.message || "Failed to load task breakdown.");
        } else {
          setError("An unknown error occurred while loading data.");
        }
      } finally {
        setInitialLoading(false);
      }
    }

    fetchParentTaskAndSubtasks();
  }, [projectId, parentTaskId]);

  // --- Toggle Lock Status of a Subtask ---
  const handleToggleLock = (idx: number) => {
    setSubtasks((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, locked: !t.locked } : t))
    );
  };

  // --- Handle AI Regeneration of Subtasks ---
  const handleRegenerate = async () => {
    setLoadingAI(true);
    setError(null);

    if (
      !parentTaskDetails ||
      !parentTaskDetails.id ||
      !parentTaskDetails.start_time ||
      !parentTaskDetails.end_time
    ) {
      setError("Parent task details are not fully loaded.");
      setLoadingAI(false);
      return;
    }

    try {
      const existingSubtasksForAPI: ClientSubtaskForAPI[] = subtasks.map(
        (task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          start_time: Date.parse(task.start_time),
          end_time: Date.parse(task.end_time),
          locked: task.locked,
        })
      );

      const res = await fetch("/api/generate-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentTaskId: parentTaskId,
          projectId: projectId,
          taskTitle: parentTaskDetails.title,
          parentStartTime: Date.parse(parentTaskDetails.start_time),
          parentEndTime: Date.parse(parentTaskDetails.end_time),
          existingSubtasks: existingSubtasksForAPI,
          prompt: userPrompt,
        }),
      });

      const data = (await res.json()) as { subtasks: BackendSubtaskResponseItem[]; error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate subtasks.");
      }

      const newSubtasks: FrontendTask[] = (
        data.subtasks as BackendSubtaskResponseItem[]
      ).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        start_time: task.start_time,
        end_time: task.end_time,
        locked: task.locked || false,
      }));
      setSubtasks(newSubtasks);

      toaster.create({
        description: "Subtasks regenerated successfully.",
        type: "success",
        closable: true,
      });
    } catch (err: unknown) {
      console.error("Regeneration error:", err);
      if (err instanceof Error) {
        toaster.create({
          description:
            err.message || "Something went wrong during regeneration.",
          type: "error",
          closable: true,
        });
        setError(err.message || "Regeneration failed.");
      } else {
        toaster.create({
          description: "An unknown error occurred during regeneration.",
          type: "error",
          closable: true,
        });
        setError("An unknown error occurred during regeneration.");
      }
    } finally {
      setLoadingAI(false);
    }
  };

  // --- Handle Confirming Tasks (Saving to Database) ---
  const handleConfirmTasks = async () => {
    setConfirmingTasks(true);
    setError(null);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("User not authenticated. Please log in.");
      }

      // ⭐ Omit 'hierarchy_type' from the payload for upsert. The DB trigger will set it.
      const subtasksToSave: Omit<DbTask, "hierarchy_type">[] = subtasks.map(
        (task) => ({
          id: task.id === "" || task.id === undefined ? undefined : task.id,
          title: task.title,
          description: task.description,
          start_time: task.start_time,
          end_time: task.end_time,
          parent_task_id: parentTaskId,
          project_id: projectId,
          status: "todo",
        })

      );

      const { error: upsertError } = await supabase
        .from("tasks")
        .upsert(subtasksToSave);

      if (upsertError) {
        throw upsertError;
      }

      toaster.create({
        description: "Subtasks confirmed and saved successfully!",
        type: "success",
        closable: true,
      });

      router.push(`/dashboard/project/${projectId}/${parentTaskId}`);
    } catch (err: unknown) {
      console.error("Confirmation error:", err);
      if (err instanceof Error) {
        toaster.create({
          description: err.message || "Something went wrong confirming tasks.",
          type: "error",
          closable: true,
        });
        setError(err.message || "Confirmation failed.");
      } else {
        toaster.create({
          description: "An unknown error occurred confirming tasks.",
          type: "error",
          closable: true,
        });
        setError("An unknown error occurred confirming tasks.");
      }
    } finally {
      setConfirmingTasks(false);
    }
  };

  // --- Render UI ---
  if (initialLoading) {
    return (
      <Box>
        <Sidebar selected={2}>
          <Center minH="200px">
            <Spinner size="xl" />
            <Text ml={4}>Loading task breakdown...</Text>
          </Center>
        </Sidebar>
      </Box>
    );
  }

  if (error && !loadingAI && !confirmingTasks) {
    return (
      <Box>
        <Sidebar selected={2}>
          <Center minH="200px">
            <Text color="red.500" fontSize="lg">
              {error}
            </Text>
          </Center>
        </Sidebar>
      </Box>
    );
  }

  return (
    <Box>
      <Sidebar selected={2}>
        <Box display="flex" flexDir="column" gap={5}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading fontSize="2xl">
              Breakdown for: {parentTaskDetails?.title || "Unknown Task"}
            </Heading>
          </Flex>

          <Stack>
            {subtasks.length === 0 && !loadingAI ? (
              <Text
                p={3}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
                textAlign="center">
                No subtasks yet. Use &quot;REGENERATE&quot; to get started.
              </Text>
            ) : (
              subtasks.map((task, idx) => (
                <Flex
                  key={task.id || `temp-${idx}`}
                  p={4}
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="md"
                  justify="space-between"
                  align="center"
                  _hover={{
                    boxShadow:
                      "0 8px 20px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)",
                    transform: "scale(1.01)",
                    transition: "0.2s",
                  }}>
                  <Box>
                    <Badge colorScheme={task.locked ? "red" : "green"} mb={1}>
                      {task.locked ? "Locked" : "Editable"}
                    </Badge>
                    <Text fontWeight="bold">{task.title}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {task.start_time} → {task.end_time}
                    </Text>
                  </Box>
                  <IconButton
                    size="sm"
                    aria-label={task.locked ? "Locked" : "Unlocked"}
                    variant="ghost"
                    onClick={() => handleToggleLock(idx)}>
                    {task.locked ? <FiLock /> : <FiUnlock />}
                  </IconButton>
                </Flex>
              ))
            )}
          </Stack>
          <Box
            position="sticky"
            bottom="0"
            width="100%"
            bg="white"
            boxShadow="0 -4px 12px rgba(0, 0, 0, 0.06)"
            px={6}
            py={4}
            zIndex={100}>
            <Flex mt={6} align="center" gap={2}>
              <Textarea
                placeholder="Prompt to refine the task breakdown..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                border="2px solid"
                p={3}
                resize="vertical"
                fontSize="sm"
                flex={1}
                borderColor="gray.200"
                _focus={{ borderColor: "blue.400", boxShadow: "sm" }}
              />
              <Stack direction={{ base: "column", md: "row" }} gap={2}>
                <Button
                  onClick={handleRegenerate}
                  bg="gray.100"
                  color="black"
                  fontWeight="semibold"
                  fontSize="sm"
                  px={6}
                  boxShadow="sm"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: "gray.200",
                    boxShadow: "md",
                    transform: "translateY(-1px)",
                  }}
                  _active={{ bg: "gray.300", transform: "scale(0.98)" }}
                  loading={loadingAI}
                  loadingText="Generating..."
                  disabled={!parentTaskDetails || loadingAI || confirmingTasks}>
                  <Spinner size="sm" mr={loadingAI ? 2 : 0} /> REGENERATE
                </Button>
                <Button
                  bg="green.500"
                  color="white"
                  fontWeight="bold"
                  fontSize="sm"
                  px={6}
                  boxShadow="sm"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: "green.600",
                    boxShadow: "md",
                    transform: "translateY(-1px)",
                  }}
                  _active={{ bg: "green.600", transform: "scale(0.98)" }}
                  onClick={handleConfirmTasks}
                  loading={confirmingTasks}
                  loadingText="Saving..."
                  disabled={
                    subtasks.length === 0 || loadingAI || confirmingTasks
                  }>
                  CONFIRM TASKS
                </Button>
              </Stack>
            </Flex>
          </Box>

        </Box>
      </Sidebar>
    </Box>
  );
}
