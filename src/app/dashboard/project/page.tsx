"use client";
import Sidebar from "@/components/sidebar";
import { Box, Heading, Link } from "@chakra-ui/react";

export default function Dashboard() {
  return (
    <>
      <Box>
        <Sidebar selected={2}>
          <Heading size="7xl" fontSize={"4xl"}>
            Select Project
          </Heading>
          <Box
            display="flex"
            flexDir="row"
            flexWrap="wrap"
            gap={5}
            overflow={"wrap"}>
            {/* load avaliable projects to user */}
            <Link
              h={"fit"}
              w={"sm"}
              bg={"gray.100"}
              p={4}
              display="flex"
              flexDir="column"
              justifyContent="center"
              href="/dashboard/project/1"
              position="relative"
              transition="transform 0.2s, box-shadow 0.2s"
              _hover={{
                transform: "scale(1.03)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                bg: "gray.200",
                zIndex: 1,
                textDecoration: "none"
              }}>
              <Heading fontSize="2xl">Project Planner</Heading>
            </Link>
            <Link
              h={"fit"}
              w={"sm"}
              bg={"gray.100"}
              p={4}
              display="flex"
              flexDir="column"
              justifyContent="center"
              position="relative"
              transition="transform 0.2s, box-shadow 0.2s"
              _hover={{
                transform: "scale(1.03)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                bg: "gray.200",
                zIndex: 1,
                textDecoration: "none"
              }}>
              <Heading fontSize="2xl">+ New Project</Heading>
            </Link>
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}