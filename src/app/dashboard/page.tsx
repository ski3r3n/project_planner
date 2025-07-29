// app/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Assuming this path is correct

import Sidebar from "@/components/sidebar";
import TaskCard from "@/components/taskcard";
import { Box, Spinner, Center, Text, Heading } from "@chakra-ui/react";

// --- Interfaces for fetched data from Supabase ---
// This represents the structure of a single row returned by your Supabase query
// when you select `*, projects(name)`
interface FetchedTaskWithProject {
  id: string;
  title: string;
  description: string | null;
  start_time: string; // YYYY-MM-DD or ISO string from DB
  end_time: string; // YYYY-MM-DD or ISO string from DB
  project_id: string;
  hierarchy_type: 'goal' | 'task' | 'subtask';
  status: string;
  parent_task_id: string | null;
  created_by: string; // Assuming this is always present for tasks
  projects: { // This matches the `projects(name)` part of your select
    name: string;
  } | null; // It could be null if a task somehow has no associated project
}

// Props expected by TaskCard (adjust if TaskCard's props are different)
interface TaskCardProps {
  projectId: string;
  hierarchy_type: string; // 'type' here maps to 'hierarchy_type' from DB
  name: string; // Maps to 'title' from DB
  project: string; // The project name string
  startTime: string; // YYYY-MM-DD
  endTime: string; // YYYY-MM-DD
  taskId: string; // Maps to 'id' from DB
  status?: string; // Add status to TaskCardProps if it uses it
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
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          throw new Error("User not authenticated. Please log in.");
        }
        const currentUserId = userData.user.id;

        // Fetch tasks and associated project names
        const { data, error: fetchError } = await supabase
          .from('tasks')
          .select(`
            *, // Select all columns from tasks
            projects(name) // Select the 'name' column from the 'projects' table via foreign key
          `)
          .eq('created_by', currentUserId) // Filter tasks created by the current user
          .is('parent_task_id', null) // Fetch only top-level tasks (Goals and standalone Tasks) for the main dashboard view
          .order('end_time', { ascending: true }) // Order by due date, for example
          .returns<FetchedTaskWithProject[]>(); // ⭐ Explicitly type the returned data here

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          // Map the fetched data (now correctly typed as FetchedTaskWithProject[])
          const formattedTasks: TaskCardProps[] = (data || []).map((dbTask) => ({
            projectId: dbTask.project_id,
            type: dbTask.hierarchy_type,
            name: dbTask.title,
            project: dbTask.projects ? dbTask.projects.name : "N/A", // Access nested project name
            startTime: dbTask.start_time,
            endTime: dbTask.end_time,
            hierarchy_type: dbTask.hierarchy_type, // Ensure this matches TaskCardProps
            taskId: dbTask.id,
            status: dbTask.status, // Pass the status if TaskCardProps expects it
          }));
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
  }, []); // Empty dependency array means this runs once on mount

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
          <Heading as="h1" size="xl" mb={6}>Your Dashboard</Heading>
          <Box
            display="flex"
            flexDir="row"
            flexWrap="wrap"
            gap={5}
            overflow="wrap"
          >
            {tasks.length === 0 ? (
              <Text fontSize="lg" color="gray.500">
                No tasks found. Start by creating a new project or task!
              </Text>
            ) : (
              tasks.map((task) => (
                <TaskCard key={task.taskId} {...task} />
              ))
            )}
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}