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
  Badge,
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
  locked: boolean;
};

type BackendSubtask = {
  title: string;
  description?: string;
  start_time: number | string;
  end_time: number | string;
  locked?: boolean;
};

export default function ProjectID() {
  const [tasks, setTasks] = useState<Task[]>([
    { title: "CREATE DASHBOARD UI", start: "31/2/2025", due: "3/3/2025", locked: true },
    { title: "CREATE PROJECT PAGE UI", start: "4/3/2025", due: "10/3/2025", locked: false },
    { title: "CREATE CALENDAR UI", start: "11/3/2025", due: "16/3/2025", locked: false },
    { title: "PROOFCHECK UI", start: "17/3/2025", due: "20/3/2025", locked: true },
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
      const existingSubtasks = tasks.map((task: Task) => ({
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

      const data = (await res.json()) as { subtasks: BackendSubtask[]; error?: string };

      if (!res.ok) throw new Error(data.error || "Unknown error");

      setTasks(
        data.subtasks.map((task) => ({
          title: task.title,
          description: task.description,
          start: new Date(task.start_time).toLocaleDateString(),
          due: new Date(task.end_time).toLocaleDateString(),
          locked: task.locked || false,
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
        <Box px={4} py={6} bg="gray.50" pb="120px" minH="calc(100vh - 60px)">
          <Flex justify="space-between" align="center" mb={6}>
            <Heading fontSize="2xl">Task Breakdown</Heading>
          </Flex>

          <Stack gap={4}>
            {tasks.map((task, idx) => (
              <Flex
                key={idx}
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
                }}
              >
                <Box>
                  <Badge colorScheme={task.locked ? "red" : "green"} mb={1}>
                    {task.locked ? "Locked" : "Editable"}
                  </Badge>
                  <Text fontWeight="bold">{task.title}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {task.start} → {task.due}
                  </Text>
                </Box>

                <IconButton
                  aria-label="Toggle Lock"
                  variant="ghost"
                  size="md"
                  onClick={() =>
                    setTasks((prev) =>
                      prev.map((t, i) =>
                        i === idx ? { ...t, locked: !t.locked } : t
                      )
                    )
                  }
                >
                  {task.locked ? <FiLock /> : <FiUnlock />}
                </IconButton>
              </Flex>
            ))}
          </Stack>
        </Box>

        {/* Sticky Full-Width Bottom Bar */}
        <Box
          position="sticky"
          bottom="0"
          width="100%"
          bg="white"
          boxShadow="0 -4px 12px rgba(0, 0, 0, 0.06)"
          px={6}
          py={4}
          zIndex={100}
        >
          <Flex
            align="start"
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <Textarea
              placeholder="Prompt to refine the task breakdown..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
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
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : "Regenerate"}
              </Button>

              <Button
                bg="green.400"
                color="white"
                fontWeight="bold"
                fontSize="sm"
                px={6}
                boxShadow="sm"
                transition="all 0.2s ease"
                _hover={{
                  bg: "green.500",
                  boxShadow: "md",
                  transform: "translateY(-1px)",
                }}
                _active={{ bg: "green.600", transform: "scale(0.98)" }}
              >
                Confirm Tasks
              </Button>
            </Stack>
          </Flex>
        </Box>
      </Sidebar>
    </Box>
  );
}
