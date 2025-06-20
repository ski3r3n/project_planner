"use client";

import { Box, Heading, Button, Link } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
export default function Sidebar({
  children,
  selected,
}: {
  children: React.ReactNode;
  selected: number;
}) {
  return (
    <>
      <Box display="flex" position="fixed" left={0} top={0} w="100%" h="100vh">
        <Box h={"100vh"} w={"250px"} bg={"gray.100"} p={4}>
          <Heading w="fit" fontSize="2xl" margin="auto" mt={5} mb={5}>
            Projects
          </Heading>
          <Link
            fontSize={"xl"}
            width="100%"
            height="28"
            _hover={{ bgColor: "ourBg" }}
            shadow={"md"}
            mt={5}
            href="/dashboard/project/1"
            display="flex"
            justifyContent={"center"}>
            <Button>Project Planner {/* replace with automation */}</Button>
          </Link>
          <Button
            fontSize={"xl"}
            width="100%"
            height="28"
            _hover={{ bgColor: "ourBg" }}
            shadow={"md"}
            mt={5}>
            <FiPlus></FiPlus>Create
          </Button>
        </Box>
        <Box flex="1">
          <Box
            h="60px"
            bg={"gray.100"}
            p={10}
            display="flex"
            flexDir={"row"}
            justifyContent={"flex-start"}>
            <Link w="fit" fontSize="xl" textDecor={"underline"} mr={20} href="/dashboard">
              {selected == 1 ? <b>Overview</b> : "Overview"}
            </Link>
            <Link w="fit" fontSize="xl" textDecor={"underline"} mr={20} href="/dashboard/project">
              {selected == 2 ? <b>Project</b> : "Project"}
            </Link>
            <Link w="fit" fontSize="xl" textDecor={"underline"} href="/dashboard/project/1/calendar">
              {selected == 3 ? <b>Calendar</b> : "Calendar"}
            </Link>
          </Box>
          <Box p="10" overflow="auto" h="calc(100vh - 60px)">
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}
