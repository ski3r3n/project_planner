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
  const projectId = pathParts[3]; // if it works it works surely
  return (
    <>
      <Box
        h={"fit"}
        w={"sm"}
        bg={"gray.100"}
        p={4}
        display="flex"
        flexDir="column"
        justifyContent="center">
        <Heading w="fit" fontSize="2xl" mt={5} mb={5}>
          <Link href={`./${projectId}/${taskId}`}>
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
    </>
  );
}
