"use client";
import Sidebar from "@/components/sidebar";
// import TaskCard from "@/components/taskcard";
import {
  Box,
  Flex,
  Heading,
  Button,
  Stack,
  Textarea,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { FiLock } from "react-icons/fi";
const tasks = [
  { title: "CREATE DASHBOARD UI", due: "31/3/2025 2:00" },
  { title: "CREATE PROJECT PAGE UI", due: "31/3/2025 20:00" },
  { title: "CREATE CALENDER UI", due: "31/3/2025 23:59" },
  { title: "PROOFCHECK UI", due: "1/4/2025 11:59" },
];
export default function ProjectID() {
  return (
    <>
      <Box>
        <Sidebar selected={2}>
          <Box
            display="flex"
            flexDir="column"
            flexWrap="wrap"
            gap={5}
            overflow={"wrap"}>
            {" "}
            {/* replace with project specific tasks */}
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="5xl" fontSize="5xl">Task Breakdown:</Heading>
              
            </Flex>
            <Stack /*spacing={3}*/>
              {tasks.map((task, idx) => (
                <Flex
                  key={idx}
                  p={3}
                  bg="white"
                  borderRadius="md"
                  boxShadow="sm"
                  justify="space-between"
                  align="center">
                  <Text>
                    <b>TITLE:</b> {task.title}, <b>DUE BY:</b> {task.due}
                  </Text>
                  <IconButton size="sm" aria-label="Locked" variant="ghost">
                    <FiLock />
                  </IconButton>
                </Flex>
              ))}
            </Stack>
            <Flex mt={6} align="center" gap={2} >
              <Textarea placeholder="Prompt (for regeneration):" size="sm" border="2px solid" p="1" autoresize/>
              <Button bg="white" variant="outline" p="3"  fontSize="lg">
                - REGENERATE
              </Button><Button bg="green.400" p="3"  fontSize={"xl"}>
                CONFIRM TASKS
              </Button>
            </Flex>
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}
