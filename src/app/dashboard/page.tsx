"use client";
import Sidebar from "@/components/sidebar";
import TaskCard from "@/components/taskcard";
import { Box /*Heading, Button*/ } from "@chakra-ui/react";

export default function Dashboard() {
  return (
    <>
      <Box>
        <Sidebar selected={1}>
          <Box display="flex" flexDir="row" flexWrap="wrap" gap={5} overflow={"wrap"}>
            <TaskCard
              type="Meeting"
              name="Discuss stuff"
              project="Project Planner"
              time="3/5/2025 13:05"
              link="meet.google.com"
            />
            <TaskCard
              type="Task"
              name="Finish UI"
              project="Project Planner"
              time="10/6/2025"
              link="github.com/ski3r3n/project_planner"
            />
            <TaskCard
              type="Goal"
              name="Finish everything"
              project="Project Planner"
              time="5/9/2025"
              link="github.com/ski3r3n/project_planner"
            />
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}
