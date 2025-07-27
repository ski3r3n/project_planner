"use client";
import Sidebar from "@/components/sidebar";
import { Box, Heading, Link } from "@chakra-ui/react";

const projects = [
  // get from database in the future
  {
    name: "Project Planner",
  },
];

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
            {projects.map((project) => (
              <Link
                key={project.name}
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
                }}>
                <Box margin="auto">{project.name}</Box>
              </Link>
            ))}
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}
