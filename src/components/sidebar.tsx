"use client";

import { Box, Heading, Button } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
export default function Sidebar() {
  return (
    <>
      <Box h={"100vh"} w={"250px"} bg={"gray.100"} p={4}>
        <Heading w="fit" fontSize="2xl" margin="auto" mt={10}>
          Schedule
        </Heading>
        <Button
          fontSize={"xl"}
          width="100%"
          height="28"
          _hover={{ bgColor: "ourBg" }}
          shadow={"md"}
          mt={10}>
          <FiPlus></FiPlus>Create
        </Button>
      </Box>
    </>
  );
}
