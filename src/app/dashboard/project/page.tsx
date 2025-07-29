"use client"; // This directive is still necessary for client-side components

import { useState, useEffect } from "react"; // Import useState and useEffect
import { supabase } from "@/lib/supabaseClient"; 
import Sidebar from "@/components/sidebar";
import { Box, Heading, Link, Text, Spinner, Center } from "@chakra-ui/react";

interface Project {
  id: string; // Assuming 'uuid' from DB maps to string in TS
  name: string;
  description: string | null; // description can be text or null from your schema
  // Add other properties if you select them, e.g., owner_id: string; created_at: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]); // <--- THIS IS THE CRUCIAL CHANGE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No need to initialize supabase here with createClientComponentClient
  // as you're importing your pre-configured client directly.

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        // ⭐ 3. (Optional but good practice) Add the type to the data variable from Supabase response
        const { data, error } = await supabase
          .from("projects")
          .select("id, name, description"); // Ensure you select the fields matching your interface

        if (error) {
          console.error("Error fetching projects:", error.message);
          setError("Failed to load projects. " + error.message);
        } else {
          // Cast the data to Project[] to ensure type compatibility
          // This cast is safe if you're selecting the fields correctly
          setProjects(data as Project[] || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);
  return (
    <>
      <Box>
        <Sidebar selected={2}>
          <Heading size="7xl" fontSize={"4xl"} mb={6}>
            Select Project
          </Heading>

          {loading ? (
            <Center py={10}>
              <Spinner size="xl" />
              <Text ml={4}>Loading projects...</Text>
            </Center>
          ) : error ? (
            <Center py={10}>
              <Text color="red.500" fontSize="lg">
                Error: {error}
              </Text>
            </Center>
          ) : projects.length === 0 ? (
            <Center py={10}>
              <Text fontSize="lg" color="gray.600">
                No projects available. Create a new one or join an existing project!
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
              {projects.map((project: Project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/project/${project.id}`}
                  h={"fit"}
                  w={"sm"}
                  bg={"gray.100"}
                  p={4}
                  fontSize={"2xl"}
                  transition="transform 0.2s, box-shadow 0.2s"
                  _hover={{
                    transform: "scale(1.03)",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    zIndex: 1,
                  }}
                >
                  <Box margin="auto">
                    {project.name}
                    {project.description && (
                      <Text fontSize="md" color="gray.600" mt={2}>
                        {project.description}
                      </Text>
                    )}
                  </Box>
                </Link>
              ))}
            </Box>
          )}
        </Sidebar>
      </Box>
    </>
  );
}