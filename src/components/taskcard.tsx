"use client";

import {
  Heading,
  LinkBox,
  LinkOverlay,
  Badge,
  Text,
  VStack,
} from "@chakra-ui/react";

export default function TaskCard({
  type,
  project,
  name,
  startTime,
  endTime,
  taskId,
}: {
  type: string;
  project: string;
  startTime: React.ReactNode;
  endTime: React.ReactNode;
  name: string;
  link?: string;
  taskId: number;
}) {
  const projectId = project.split(" ").join("_").toLowerCase();
  const badgeColor = type === "Goal" ? "purple" : "blue";

  return (
    <LinkBox
      as="article"
      w="sm"
      bg="white"
      borderRadius="2xl"
      boxShadow="md"
      p={5}
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{
        transform: "scale(1.03)",
        boxShadow:
          "0 12px 20px -4px rgba(0, 0, 0, 0.12), 0 6px 10px -2px rgba(0, 0, 0, 0.08)",
        zIndex: 1,
      }}
      h={`/dashboard/project/${projectId}/${taskId}`}
    >
      <VStack align="start" >
        <Badge colorScheme={badgeColor} fontSize="0.75em" borderRadius="md">
          {type}
        </Badge>

        <Heading fontSize="lg" fontWeight="semibold" lineHeight="short">
          <LinkOverlay href={`/dashboard/project/${projectId}/${taskId}`}>
            {name}
          </LinkOverlay>
        </Heading>

        <Text fontSize="sm" color="gray.600">
          Project: <strong>{project}</strong>
        </Text>

        <Text fontSize="sm" color="gray.500">
          {startTime} → {endTime}
        </Text>
      </VStack>
    </LinkBox>
  );
}
