"use client";
import Sidebar from "@/components/sidebar";
import TaskCard from "@/components/taskcard";
import { Box /*Heading, Button*/ } from "@chakra-ui/react";

const tasks = [
  {
    type: "Meeting",
    name: "Discuss stuff",
    project: "Project Planner",
    time: "3/5/2025 13:05",
    link: "https://meet.google.com",
    taskId: 1,
  },
  {
    type: "Task",
    name: "Finish UI",
    project: "Project Planner",
    time: "10/6/2025",
    link: "https://github.com/ski3r3n/project_planner",
    taskId: 2,
  },
  {
    type: "Goal",
    name: "Finish everything",
    project: "Project Planner",
    time: "5/9/2025",
    link: "https://github.com/ski3r3n/project_planner",
    taskId: 3,
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
