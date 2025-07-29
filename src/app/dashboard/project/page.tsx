"use client"; // This directive is still necessary for client-side components

import { useState, useEffect } from "react"; // Import useState and useEffect
import { supabase } from "@/lib/supabaseClient"; 
import Sidebar from "@/components/sidebar";
import { Box, Heading, Text, Spinner, Center } from "@chakra-ui/react";
import {
  LinkBox,
  LinkOverlay,
  chakra,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
const MotionBox = motion(chakra.div);

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
          flexWrap="wrap"
          gap={8}
          justifyContent={{ base: "center", md: "flex-start" }}
        >
          {projects.map((project: Project, index) => (

            <MotionBox
              key={project.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              cursor="pointer"
            >
                <LinkBox

                as="article"
                w={{ base: "100%", sm: "340px", md: "400px" }}
                p={8}
                borderRadius="2xl"
                bg="#F4F6FA"
                border="1px solid #D0D7E2"
                boxShadow="md"
                _hover={{
                  bg: "#E8EDF5",
                  boxShadow: "xl",
                }}
                transition="all 0.2s ease"
              >
                <LinkOverlay href={`/dashboard/project/${project.id}`}>

                  <Text fontSize="2xl" fontWeight="bold" color="#2D3748">
                    {project.name}
                  </Text>
                </LinkOverlay>

                <Text mt={3} fontSize="md" color="gray.500">
                  {project.description || "No description available."}
                </Text>
              </LinkBox>
                     </MotionBox>   
              ))}
            </Box>
          )}
        </Sidebar>
      </Box>
    </>

  );
}