"use client";
import Sidebar from "@/components/sidebar";
import { Box, Button, Heading, Link } from "@chakra-ui/react";
import { PiSparkle } from "react-icons/pi";
import { FiPlus } from "react-icons/fi";
export default function ProjectIDTask() {
  return (
    <>
      <Box>
        <Sidebar selected={2}>
          <Box
            flexDir="row"
            flexWrap="wrap"
            gap={5}
            overflow={"wrap"}
            bg="white"
            p="5"
            rounded="md">
            {/*
             type="Goal"
              name="Finish everything"
              project="Project Planner"
              time="5/9/2025"
              link="github.com/ski3r3n/project_planner"
              taskId={3}
               */}
            {/* replace with project specific tasks */}
            <Heading size="5xl" fontSize={"5xl"} display="flex" gap={2}>
              <Box fontWeight={"bold"}>Goal:</Box> {"Finish everything"}
            </Heading>
            <Heading size="3xl" fontSize={"3xl"} display="flex" gap={2}>
              <Box fontWeight={"bold"}>From:</Box> {"Project Planner"}
            </Heading>
            <Box display="flex" gap={2}>
              <Box fontWeight={"bold"}>By:</Box> {"30/5/2025 13:05"}
            </Box>
            <Box display="flex" gap={2}>
              <Box fontWeight={"bold"}>Allocated:</Box>{" "}
              {"Kie Ren, Ryan, Yuzhong"}
            </Box>
            <Box display="flex" gap={2}>
              <Box fontWeight={"bold"}>Description:</Box>{" "}
              {
                "This is a goal to finish everything. It is a very long. I never anticipated this! I am so surprised! I am so shocked! I am so amazed! I am so astounded! I am so flabbergasted! I am so dumbfounded! I am so astonished! I am so staggered! I am so bowled over! I am so taken aback! I am so overwhelmed! I am so blown away! I am so floored! I am so speechless! I am so awestruck! I am so thunderstruck! I am so flummoxed! I am so perplexed! I am so bewildered! I am so confounded! I am so bamboozled! I am so nonplussed! I am so dazed! I am so stunned!"
              }
            </Box>
            <Link
              color="blue.500"
              textDecor="underline"
              href="https://github.com/ski3r3n/project_planner">
              github.com/ski3r3n/project_planner
            </Link>
          </Box>
          <Box>
            <Button padding={5} mr={5} mt={5} bg={"white"}>
              <PiSparkle></PiSparkle>AI BREAKDOWN
            </Button>
            <Button padding={5} mr={5} mt={5} bg={"white"}>
              <FiPlus></FiPlus>Edit
            </Button>
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}
