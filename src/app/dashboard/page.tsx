"use client";
import Sidebar from "@/components/sidebar";
import { Box /*Heading, Button*/ } from "@chakra-ui/react";

export default function Dashboard() {
  return (
    <>
      <Box>
        <Sidebar selected={1}>
          <Box>This will become the dashboard</Box>
        </Sidebar>
      </Box>
    </>
  );
}
