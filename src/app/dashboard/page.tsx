"use client";

import Sidebar from "@/components/sidebar";
import TaskCard from "@/components/taskcard";
import { Box } from "@chakra-ui/react";
const tasks = [ // import from database in the future
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
    <>
      <Box>
        <Sidebar selected={1}>
          <Box
            display="flex"
            flexDir="row"
            flexWrap="wrap"
            gap={5}
            overflow={"wrap"}>
            {" "}
            {/* load tasks and meetings of user */}
            
            {tasks.map((task) => (
            <TaskCard key={task.taskId} {...task} />
          ))}
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}