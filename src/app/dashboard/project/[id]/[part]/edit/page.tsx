"use client";

import Sidebar from "@/components/sidebar";
import {
  Box,
  Button,
  Link,
  Textarea,
  Select,
  Portal,
  createListCollection,
} from "@chakra-ui/react";

const frameworks = createListCollection({
  items: [
    { label: "Goal", value: "goal" },
    { label: "Task", value: "task" },
    { label: "Subtask", value: "subtask" },
  ],
});

export default function ProjectIDTask() {
  return (
    <Box>
      <Sidebar selected={2}>
        <Box
          bg="white"
          p={8}
          borderRadius="xl"
          boxShadow="sm"
          display="flex"
          flexDirection="column"
          gap={6}
          maxW="3xl"
        >
          {/* Task Type + Title */}
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={4} alignItems="center">
              <Select.Root
                collection={frameworks}
                size="sm"
                defaultValue={["goal"]}
              >
                <Select.HiddenSelect />
                <Select.Control border="1px solid #CBD5E0" borderRadius="md">
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select type" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {frameworks.items.map((framework) => (
                        <Select.Item item={framework} key={framework.value}>
                          {framework.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>

              <Textarea
                defaultValue="Finish everything"
                fontSize="2xl"
                fontWeight="bold"
                resize="none"
                border="1px solid #CBD5E0"
                borderRadius="md"
                p={2}
              />
            </Box>
          </Box>

          {/* Project & Dates */}
          <Box display="flex" flexDirection="column" gap={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box fontWeight="bold" minW="60px">
                From:
              </Box>
              <Textarea
                defaultValue="Project Planner"
                resize="none"
                border="1px solid #CBD5E0"
                borderRadius="md"
                p={2}
              />
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Box fontWeight="bold" minW="60px">
                By:
              </Box>
              <Textarea
                defaultValue="30/5/2025 13:05"
                resize="none"
                border="1px solid #CBD5E0"
                borderRadius="md"
                p={2}
              />
            </Box>
          </Box>

          {/* People */}
          <Box display="flex" alignItems="center" gap={2}>
            <Box fontWeight="bold" minW="80px">
              Allocated:
            </Box>
            <Textarea
              defaultValue="Kie Ren, Ryan, Yuzhong"
              resize="none"
              border="1px solid #CBD5E0"
              borderRadius="md"
              p={2}
            />
          </Box>

          {/* Description */}
          <Box>
            <Box fontWeight="bold" mb={2}>
              Description:
            </Box>
            <Textarea
              defaultValue="This is a goal to finish everything. It is a very long..."
              minH="160px"
              resize="vertical"
              border="1px solid #CBD5E0"
              borderRadius="md"
              p={3}
            />
          </Box>

          {/* GitHub Link */}
          <Link
            href="https://github.com/ski3r3n/project_planner"
            color="blue.500"
            fontWeight="medium"
            _hover={{ textDecoration: "underline" }}
          >
            github.com/ski3r3n/project_planner
          </Link>
        </Box>

        {/* Save Button */}
        <Box mt={6} maxW="3xl">
          <Button
            colorScheme="blue"
            w="100%"
            size="lg"
            fontWeight="medium"
          >
            Save
          </Button>
        </Box>
      </Sidebar>
    </Box>
  );
}
