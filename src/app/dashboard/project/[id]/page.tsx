"use client";
import Sidebar from "@/components/sidebar";
import TaskCard from "@/components/taskcard";
import { Box /*Heading, Button*/ } from "@chakra-ui/react";

const tasks = [
  {
    type: "Task",
    name: "Finish UI",
    project: "Project Planner",
    startTime: "10/6/2025",
    endTime: "10/7/2025",
    link: "https://github.com/ski3r3n/project_planner",
    taskId: 1,
  },
  {
    type: "Goal",
    name: "Finish everything",
    project: "Project Planner",
    startTime: "5/2/2025",
    endTime: "5/9/2025",
    link: "https://github.com/ski3r3n/project_planner",
    taskId: 2,
  },
];
export default function ProjectID() {

  return (
    <>
      <Box>
        <Sidebar selected={2}>
          <Box
            display="flex"
            flexDir="row"
            flexWrap="wrap"
            gap={5}
            overflow={"wrap"}>
            {" "}
            {/* replace with project specific tasks */}
            {tasks.map((task) => (
            <TaskCard key={task.taskId} {...task} />
          ))}
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}
