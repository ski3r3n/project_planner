"use client";

import { Box, Heading, Link } from "@chakra-ui/react";
export default function TaskCard({
  type,
  project,
  name,
  startTime,
  endTime,
  taskId,
}: {
  type: string;
  project: string;
  startTime: React.ReactNode;
  endTime: React.ReactNode;
  name: string;
  link?: string;
  taskId: number;
}) {
  const projectId = project.split(" ").join("_").toLowerCase();
  return (
    <>
      <Box
        transition="transform 0.2s, box-shadow 0.2s"
        _hover={{
          transform: "scale(1.03)",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          zIndex: 1,
        }}>
        <Box
          h={"fit"}
          w={"sm"}
          bg={"gray.100"}
          p={4}
          display="flex"
          flexDir="column"
          justifyContent="center">
          <Heading w="fit" fontSize="2xl" mt={5} mb={5}>
            <Link href={`/dashboard/project/${projectId}/${taskId}`}>
              {type}: {name}
              <br />
              From: {project}
            </Link>
          </Heading>
          From {startTime} to {endTime}
        </Box>
      </Box>
    </>
  );
}
