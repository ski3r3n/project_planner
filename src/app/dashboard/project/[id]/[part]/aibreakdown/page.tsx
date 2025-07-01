"use client";

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
  Spinner,
} from "@chakra-ui/react";
import { FiLock, FiUnlock } from "react-icons/fi";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";

type Task = {
  id?: string;
  title: string;
  description?: string;
  start: string;
  due: string;
  locked?: boolean;
};

export default function ProjectID() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      title: "CREATE DASHBOARD UI",
      start: "31/2/2025",
      due: "3/3/2025",
      locked: true,
    },
    {
      title: "CREATE PROJECT PAGE UI",
      start: "4/3/2025",
      due: "10/3/2025",
      locked: false,
    },
    {
      title: "CREATE CALENDAR UI",
      start: "11/3/2025",
      due: "16/3/2025",
      locked: false,
    },
    {
      title: "PROOFCHECK UI",
      start: "17/3/2025",
      due: "20/3/2025",
      locked: true,
    },
  ]);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const parentTaskId = "mock-task-id";
  const projectId = "mock-project-id";
  const taskTitle = "Project UI Implementation";
  const parentStartTime = Date.parse("2025-02-28");
  const parentEndTime = Date.parse("2025-03-21");

  const handleRegenerate = async () => {
    setLoading(true);

    try {
      const existingSubtasks = tasks.map((task) => ({
        title: task.title,
        description: task.description || task.title,
        start_time: Date.parse(task.start),
        end_time: Date.parse(task.due),
        locked: !!task.locked,
      }));

      const res = await fetch("/api/generate-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentTaskId,
          projectId,
          taskTitle,
          parentStartTime,
          parentEndTime,
          existingSubtasks,
          prompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unknown error");

      type BackendSubtask = {
        title: string;
        description?: string;
        start_time: number | string;
        end_time: number | string;
        locked?: boolean;
      };

      setTasks(
        (data.subtasks as BackendSubtask[]).map((task) => ({
          title: task.title,
          description: task.description,
          start: new Date(task.start_time).toLocaleDateString(),
          due: new Date(task.end_time).toLocaleDateString(),
          locked: task.locked,
        }))
      );

      toaster.create({
        description: "Subtasks regenerated successfully.",
        type: "success",
        closable: true,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toaster.create({
          description: err.message || "Something went wrong",
          type: "error",
          closable: true,
        });
      }
    }

    setLoading(false);
  };

  return (
    <Box>
      <Sidebar selected={2}>
        <Box display="flex" flexDir="column" gap={5}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg">Task Breakdown:</Heading>
          </Flex>

          <Stack>
            {tasks.map((task, idx) => (
              <Flex
                key={idx}
                p={3}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
                justify="space-between"
                align="center"
              >
                <Text>
                  <b>TITLE:</b> {task.title}, <b>START:</b> {task.start}{" "}
                  <b>DUE BY:</b> {task.due}
                </Text>
                <IconButton
                  size="sm"
                  aria-label={task.locked ? "Locked" : "Unlocked"}
                  variant="ghost"
                  onClick={() => {
                    setTasks((prev) =>
                      prev.map((t, i) =>
                        i === idx ? { ...t, locked: !t.locked } : t
                      )
                    );
                  }}
                >
                  {task.locked ? <FiLock /> : <FiUnlock />}
                </IconButton>
              </Flex>
            ))}
          </Stack>

          <Flex mt={6} align="center" gap={2}>
            <Textarea
              placeholder="Prompt (optional, for regeneration)"
              size="sm"
              border="2px solid"
              p="1"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              resize="vertical"
            />
            <Button
              bg="white"
              variant="outline"
              p="3"
              fontSize="lg"
              onClick={handleRegenerate}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "- REGENERATE"}
            </Button>
            <Button bg="green.400" p="3" fontSize="xl">
              CONFIRM TASKS
            </Button>
          </Flex>
        </Box>
      </Sidebar>
    </Box>
  );
}
