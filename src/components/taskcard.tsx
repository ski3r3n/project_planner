"use client";
import { usePathname } from "next/navigation";
import { Box, Heading, Link } from "@chakra-ui/react";
export default function TaskCard({
  type,
  project,
  name,
  time,
  link = "#",
  taskId,
}: {
  type: string;
  project: string;
  time: React.ReactNode;
  name: string;
  link?: string;
  taskId: number;
}) {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const projectId = pathParts[3]; // replace with something better
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
          By: {time}
          <br />
          {link != "#" ? (
            <Link
              color="blue.500"
              textDecoration="underline"
              href={link.slice(0, 8) == "https://" ? link : "https://" + link}>
              {link}
            </Link>
          ) : (
            ""
          )}
        </Box>
      </Box>
    </>
  );
}
