"use client";
import Sidebar from "@/components/sidebar";
import {
  Box,
  Heading,
  LinkBox,
  LinkOverlay,
  Text,
  chakra,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(chakra.div);

const projects = [
  {
    name: "Project Planner",
  },
];

export default function Dashboard() {
  return (
    <Box>
      <Sidebar selected={2}>
        <Heading fontSize="4xl" fontWeight="bold" mb={8} color="#1A1A1A">
          Select a Project
        </Heading>

        <Box
          display="flex"
          flexWrap="wrap"
          gap={8}
          justifyContent={{ base: "center", md: "flex-start" }}
        >
          {projects.map((project, index) => (
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
                <LinkOverlay href="/dashboard/project/1">
                  <Text fontSize="2xl" fontWeight="bold" color="#2D3748">
                    {project.name}
                  </Text>
                </LinkOverlay>

                <Text mt={3} fontSize="md" color="gray.500">
                  View tasks, timelines and team updates
                </Text>
              </LinkBox>
            </MotionBox>
          ))}
        </Box>
      </Sidebar>
    </Box>
  );
}
