"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import Sidebar from "@/components/sidebar";
import { Box, Heading, Text, Spinner, Center, Link as ChakraLink } from "@chakra-ui/react";
import { PiSparkle } from "react-icons/pi";
import { FiPlus } from "react-icons/fi";

// --- Define Interfaces for your data ---
interface Project {
  id: string; // Required as per your interface
  name: string;
}

interface DbTask {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  project_id: string;
  assigned_to: string | null;
  status: string;
}

interface UserProfile {
  id: string; // Required as per your interface
  full_name: string;
}

// Interface to represent the combined data structure after the Supabase join
type TaskWithRelations = DbTask & {
  projects?: Project | null; // Use the Project interface
  profiles?: UserProfile | null; // Use the UserProfile interface
};

// --- Utility for date formatting (DD/MM/YYYY) ---
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


export default function ProjectTaskDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const taskId = params.part as string;

  const [task, setTask] = useState<DbTask | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [assignedUser, setAssignedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathName = usePathname();

  useEffect(() => {
    async function fetchData() {
      if (!projectId || !taskId) {
        setLoading(false);
        setError("Project ID or Task ID not provided in URL.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ⭐ FIX: Select 'id' for both projects and profiles
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("*, projects(id, name), profiles(id, full_name)") // <-- CHANGED THIS LINE
          .eq("id", taskId)
          .single();

        if (taskError) {
          console.error("Error fetching task:", taskError.message);
          setError("Failed to load task details: " + taskError.message);
          setLoading(false);
          return;
        }

        const typedTaskData = taskData as TaskWithRelations | null;

        if (!typedTaskData) {
          setError("Task not found.");
          setLoading(false);
          return;
        }

        setTask(typedTaskData);
        setProject(typedTaskData?.projects || null);
        setAssignedUser(typedTaskData?.profiles || null);

      } catch (err: unknown) {
        console.error("Unexpected error:", err);
        if (err instanceof Error) {
          setError("An unexpected error occurred: " + err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId, taskId]);

  const displayType = task?.status === 'goal' ? 'Goal' : 'Task';

  return (
    <>
      <Box>
        <Sidebar selected={2}>
          {loading ? (
            <Center minH="200px">
              <Spinner size="xl" />
              <Text ml={4}>Loading task details...</Text>
            </Center>
          ) : error ? (
            <Center minH="200px">
              <Text color="red.500" fontSize="lg">
                {error}
              </Text>
            </Center>
          ) : !task ? (
            <Center minH="200px">
              <Text fontSize="lg" color="gray.600">
                Task not found.
              </Text>
            </Center>
          ) : (
            <>
              <Box
                flexDir="column"
                flexWrap="wrap"
                gap={5}
                overflow={"wrap"}
                bg="white"
                p="5"
                rounded="md"
              >
                <Heading size="5xl" fontSize={"5xl"} display="flex" gap={2}>
                  <Box fontWeight={"bold"}>{displayType}:</Box> {task.title}
                </Heading>
                <Heading size="3xl" fontSize={"3xl"} display="flex" gap={2}>
                  <Box fontWeight={"bold"}>From:</Box> {project?.name || "N/A"}
                </Heading>
                <Box display="flex" gap={2}>
                  <Box fontWeight={"bold"}>From:</Box>
                  {formatDate(task.start_time)}
                  <Box fontWeight={"bold"}>By:</Box>
                  {formatDate(task.end_time)}
                </Box>
                <Box display="flex" gap={2}>
                  <Box fontWeight={"bold"}>Allocated:</Box>
                  {assignedUser?.full_name || "Unassigned"}
                </Box>
                <Box display="flex" gap={2}>
                  <Box fontWeight={"bold"}>Description:</Box>
                  {task.description || "No description provided."}
                </Box>
                <Box display="flex" gap={2}>
                  <Box fontWeight={"bold"}>Status:</Box>
                  {task.status}
                </Box>
              </Box>

              <Box mt={5} display="flex" gap={5}>
                <ChakraLink
                  href={`${pathName}/aibreakdown`}
                  padding={5}
                  bg={"white"}
                  rounded="md"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <PiSparkle />AI BREAKDOWN
                </ChakraLink>
                <ChakraLink
                  href={`${pathName}/edit`}
                  padding={5}
                  bg={"white"}
                  rounded="md"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <FiPlus />Edit
                </ChakraLink>
              </Box>
            </>
          )}
        </Sidebar>
      </Box>
    </>
  );
}