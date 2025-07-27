"use client";

import Sidebar from "@/components/sidebar";
import TaskCard from "@/components/taskcard";
import { Box, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";

// Motion wrapper for animations
const MotionBox = motion(Box);

const tasks = [
  {
    type: "Task",
    name: "Finish UI",
    project: "Project Planner",
    startTime: "10/6/2025",
    endTime: "10/7/2025",
    taskId: 1,
  },
  {
    type: "Goal",
    name: "Finish everything",
    project: "Project Planner",
    startTime: "5/2/2025",
    endTime: "5/9/2025",
    taskId: 2,
  },
];

export default function Dashboard() {
  return (
    <Box bg="#F5F7FA" minH="100vh">
      <Sidebar selected={1}>
        <Box px={6} pt={6}>
          <Heading
            size="lg"
            color="#1A1A1A"
            fontWeight="semibold"
            mb={6}
            letterSpacing="-0.5px"
            transition="color 0.3s"
          >
            Smart Planner Board
          </Heading>

          <Box
            display="flex"
            flexWrap="wrap"
            gap={6}
            justifyContent="flex-start"
          >
            {tasks.map((task, i) => (
              <MotionBox
                key={task.taskId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <TaskCard {...task} />
              </MotionBox>
            ))}
          </Box>
        </Box>
      </Sidebar>
    </Box>
  );
}
