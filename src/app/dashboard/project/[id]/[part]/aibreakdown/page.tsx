"use client";
import Sidebar from "@/components/sidebar";
// import TaskCard from "@/components/taskcard";
import { Box /*Heading, Button*/ } from "@chakra-ui/react";


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
            sigma
          </Box>
        </Sidebar>
      </Box>
    </>
  );
}
