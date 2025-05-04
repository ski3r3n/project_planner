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
              href="/dashboard/project/1">
              <Heading fontSize="2xl">Project Planner</Heading>
            </Link>
            <Link
              h={"fit"}
              w={"sm"}
              bg={"gray.100"}
              p={4}
              display="flex"
              flexDir="column"
              justifyContent="center">
              <Heading fontSize="2xl">+ New Project</Heading>
            </Link>
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}
