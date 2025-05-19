"use client";
import Sidebar from "@/components/sidebar";
import TaskCard from "@/components/taskcard";
import { Box } from "@chakra-ui/react";

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
            <Box
              position="relative"
              transition="transform 0.2s, box-shadow 0.2s"
              _hover={{
                transform: "scale(1.03)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 1
              }}>
              <TaskCard
                type="Meeting"
                name="Discuss stuff"
                project="Project Planner"
                time="3/5/2025 13:05"
                link="meet.google.com"
                taskId={1}
              />
            </Box>
            <Box
              position="relative"
              transition="transform 0.2s, box-shadow 0.2s"
              _hover={{
                transform: "scale(1.03)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 1
              }}>
              <TaskCard
                type="Task"
                name="Finish UI"
                project="Project Planner"
                time="10/6/2025"
                link="github.com/ski3r3n/project_planner"
                taskId={2}
              />
            </Box>
            <Box
              position="relative"
              transition="transform 0.2s, box-shadow 0.2s"
              _hover={{
                transform: "scale(1.03)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 1
              }}>
              <TaskCard
                type="Goal"
                name="Finish everything"
                project="Project Planner"
                time="5/9/2025"
                link="github.com/ski3r3n/project_planner"
                taskId={3}
              />
            </Box>
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}