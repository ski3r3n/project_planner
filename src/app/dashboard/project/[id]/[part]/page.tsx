"use client";

import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import Sidebar from "@/components/sidebar";
import { PiSparkle } from "react-icons/pi";
import { FiPlus } from "react-icons/fi";

// ...rest of the code

export default function ProjectIDTask() {
  const pathName = usePathname();

  return (
    <Box>
      <Sidebar selected={2}>
        <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
          <Heading fontSize="3xl" mb={6} color="gray.800" display="flex" alignItems="center" gap={2}>
            <Box as="span" fontWeight="bold" color="gray.600">
              Goal:
            </Box>
            Finish everything
          </Heading>

          <VStack align="start">
            <Text fontSize="md" color="gray.700">
              <strong>Project:</strong> Project Planner
            </Text>
            <Text fontSize="md" color="gray.700">
              <strong>From:</strong> 30/1/2025 &nbsp;&nbsp;&nbsp;
              <strong>By:</strong> 30/5/2025
            </Text>
            <Text fontSize="md" color="gray.700">
              <strong>Allocated:</strong> Kie Ren, Ryan, Yuzhong
            </Text>

            <Box w="100%" h="1px" bg="gray.200" my={4} />

            <Text fontSize="sm" fontWeight="bold" color="gray.600">
              Description:
            </Text>
            <Text fontSize="md" color="gray.700" whiteSpace="pre-wrap">
              This is a goal to finish everything. It is very long. I never anticipated this! I am so surprised! I am sorry I had to edit this long paragraph so I  will replac it with my own. did you know thast cheetas run and deers run but humans walk unless they runs away from running cheetas but running deers not so much because they can gun em down.
            </Text>
          </VStack>
        </Box>

        <Box mt={6} display="flex" gap={4}>
          <NextLink href={`${pathName}/aibreakdown`} passHref>
            <Button as="a" bg="gray.100" _hover={{ bg: "gray.200" }} fontWeight="medium">
              <Box display="flex" alignItems="center" gap={2}>
                <PiSparkle />
                AI Breakdown
              </Box>
            </Button>
          </NextLink>

          <NextLink href={`${pathName}/edit`} passHref>
            <Button as="a" bg="gray.100" _hover={{ bg: "gray.200" }} fontWeight="medium">
              <Box display="flex" alignItems="center" gap={2}>
                <FiPlus />
                Edit
              </Box>
            </Button>
          </NextLink>
        </Box>
      </Sidebar>
    </Box>
  );
}
