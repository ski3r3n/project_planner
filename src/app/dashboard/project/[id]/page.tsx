// app/dashboard/project/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Your Supabase client instance

// You might also import your generated Supabase types if using them more broadly
// import { Database } from '@/types/supabase'; // Adjust path if needed

import Sidebar from "@/components/sidebar";
import TaskCard from "@/components/taskcard";
import { Box, Heading, Text, Spinner, Center } from "@chakra-ui/react";

interface Project {
  id: string;
  name: string;
  description: string | null;
}

interface DbTask {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  hierarchy_type: string; // Assuming 'hierarchy_type' is a string in your schema
  project_id: string;
  assigned_to: string | null;
  status: string;
}

interface TaskCardProps {
  projectId: string;
  hierarchy_type: string;
  name: string;
  project: string;
  startTime: string;
  endTime: string;
  taskId: string;
  status?: string;
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!projectId) {
        setLoading(false);
        setError("No project ID provided.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("id, name, description")
          .eq("id", projectId)
          .single();

        if (projectError) {
          console.error("Error fetching project:", projectError.message);
          setError("Failed to load project details: " + projectError.message);
          setLoading(false);
          return;
        }
        if (!projectData) {
          setError("Project not found.");
          setLoading(false);
          return;
        }
        setProject(projectData as Project);

        // ⭐ FIX THIS LINE: Remove generic from 'from', add .returns<DbTask[]>() ⭐
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks") // NO GENERIC HERE
          .select("id, title, description, start_time, end_time, status, hierarchy_type")
          .eq("project_id", projectId)
          .returns<DbTask[]>(); // <--- ADD THIS to type the returned array

        if (tasksError) {
          console.error("Error fetching tasks:", tasksError.message);
          setError("Failed to load tasks: " + tasksError.message);
        } else {
          const formattedTasks: TaskCardProps[] = (tasksData || []).map((dbTask) => ({
            projectId: projectData.id,
            hierarchy_type: dbTask.hierarchy_type,
            name: dbTask.title,
            project: projectData.name,
            startTime: dbTask.start_time,
            endTime: dbTask.end_time,
            taskId: dbTask.id,
            status: dbTask.status,
          }));
          setTasks(formattedTasks);
        }
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
  }, [projectId]);

  return (
    <>
      <Box>
        <Sidebar selected={2}>
          {loading ? (
            <Center minH="200px">
              <Spinner size="xl" />
              <Text ml={4}>Loading project details and tasks...</Text>
            </Center>
          ) : error ? (
            <Center minH="200px">
              <Text color="red.500" fontSize="lg">
                {error}
              </Text>
            </Center>
          ) : (
            <>
              <Heading size="xl" mb={6}>
                {project ? project.name : "Project Details"}
              </Heading>
              {project && project.description && (
                <Text fontSize="md" color="gray.600" mb={8}>
                  {project.description}
                </Text>
              )}

              <Heading size="md" mb={4}>
                Tasks
              </Heading>
              {tasks.length === 0 ? (
                <Center py={5}>
                  <Text fontSize="md" color="gray.600">
                    No tasks found for this project.
                  </Text>
                </Center>
              ) : (
                <Box
                  display="flex"
                  flexDir="row"
                  flexWrap="wrap"
                  gap={5}
                  overflow={"wrap"}
                >
                  {tasks.map((task) => (
                    <TaskCard key={task.taskId} {...task} />
                  ))}
                </Box>
              )}
            </>
          )}
        </Sidebar>
      </Box>
    </>
  );
}