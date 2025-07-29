// app/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar";
import TaskCard from "@/components/taskcard";
import { Box, Spinner, Center, Text, Heading } from "@chakra-ui/react";
const MotionBox = motion(Box);

// --- Interfaces for fetched data from Supabase ---
interface FetchedTaskWithProject {
  id: string;
  title: string;
  description: string | null;
  start_time: string; // YYYY-MM-DD or ISO string from DB
  end_time: string; // YYYY-MM-DD or ISO string from DB
  project_id: string;
  hierarchy_type: "goal" | "task" | "subtask";
  status: string;
  parent_task_id: string | null;
  projects: {
    name: string;
  } | null;
}

interface TaskCardProps {
  projectId: string;
  hierarchy_type: string; // Use 'hierarchy_type' directly
  name: string;
  project: string;
  startTime: string;
  endTime: string;
  taskId: string;
  status?: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<TaskCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      setError(null);

      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData?.user) {
          throw new Error("User not authenticated. Please log in.");
        }
        const currentUserId = userData.user.id;

        // First, get all project IDs the current user is a member of
        const { data: memberProjects, error: memberError } = await supabase
          .from("project_members")
          .select("project_id")
          .eq("user_id", currentUserId);

        if (memberError) {
          throw memberError;
        }

        // Extract the project IDs into an array
        const projectIds = memberProjects.map((pm) => pm.project_id);

        if (projectIds.length === 0) {
          setTasks([]); // User is not part of any projects, so no tasks
          setLoading(false);
          return;
        }

        // Now, fetch tasks that belong to these project IDs
        const { data, error: fetchError } = await supabase
          .from("tasks")
          .select(
            `
            *,
            projects(name)
          `
          )
          .in("project_id", projectIds) // Filter by projects the user is a member of
          .is("parent_task_id", null) // Still fetching only top-level tasks for dashboard
          .order("end_time", { ascending: true })
          .returns<FetchedTaskWithProject[]>();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          const formattedTasks: TaskCardProps[] = (data || []).map(
            (dbTask) => ({
              projectId: dbTask.project_id,
              hierarchy_type: dbTask.hierarchy_type,
              name: dbTask.title,
              project: dbTask.projects ? dbTask.projects.name : "N/A",
              startTime: dbTask.start_time,
              endTime: dbTask.end_time,
              taskId: dbTask.id,
              status: dbTask.status,
            })
          );
          setTasks(formattedTasks);
        }
      } catch (err: unknown) {
        console.error("Error fetching tasks:", err);
        if (err instanceof Error) {
          setError(err.message || "Failed to load tasks.");
        } else {
          setError("An unknown error occurred while loading tasks.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <Box>
        <Sidebar selected={1}>
          <Center minH="200px">
            <Spinner size="xl" />
            <Text ml={4}>Loading your tasks...</Text>
          </Center>
        </Sidebar>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Sidebar selected={1}>
          <Center minH="200px">
            <Text color="red.500" fontSize="lg">
              Error: {error}
            </Text>
          </Center>
        </Sidebar>
      </Box>
    );
  }

  return (
    <>
      <Box>
        <Sidebar selected={1}>
          <Heading as="h1" size="xl" mb={6}>
            Your Dashboard
          </Heading>
          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="sm"
            display="flex"
            flexDirection="column"
            gap={6}>
            {tasks.length === 0 ? (
              <Text fontSize="lg" color="gray.500">
                No tasks found. Start by creating a new project or task, or ask
                to be added to an existing project!
              </Text>
            ) : (
              tasks.map((task, i) => (
                <MotionBox
                  key={task.taskId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}>
                  <TaskCard {...task} />
                </MotionBox>
              ))
            )}
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}
