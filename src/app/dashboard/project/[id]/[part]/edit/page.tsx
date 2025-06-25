"use client";
import Sidebar from "@/components/sidebar";
import {
  Box,
  Button,
  Heading,
  Link,
  Textarea,
  Select,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

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
          flexDir="row"
          flexWrap="wrap"
          gap={5}
          bg="white"
          p="5"
          rounded="md">
          <Heading size="5xl" fontSize="5xl" display="flex" gap={2} mb={5}>
            <Select.Root
              collection={frameworks}
              size="sm"
              width="320px"
              defaultValue={["goal"]}>
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select framework" />
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

            <Textarea border="2px solid" defaultValue="Finish everything" />
          </Heading>

          <Heading size="3xl" fontSize="3xl" display="flex" gap={2} mb={5}>
            <Box fontWeight="bold">From:</Box>
            <Textarea border="2px solid" defaultValue="Project Planner" />
          </Heading>

          <Box display="flex" gap={2} mb={5}>
            <Box fontWeight="bold">By:</Box>
            <Textarea border="2px solid" defaultValue="30/5/2025 13:05" />
          </Box>

          <Box display="flex" gap={2} mb={5}>
            <Box fontWeight="bold">Allocated:</Box>
            <Textarea
              border="2px solid"
              defaultValue="Kie Ren, Ryan, Yuzhong"
            />
          </Box>

          <Box display="flex" gap={2}>
            <Box fontWeight="bold">Description:</Box>
            <Textarea
              border="2px solid"
              defaultValue={
                "This is a goal to finish everything. It is a very long. I never anticipated this! I am so surprised! I am so shocked! I am so amazed! I am so astounded! I am so flabbergasted! I am so dumbfounded! I am so astonished! I am so staggered! I am so bowled over! I am so taken aback! I am so overwhelmed! I am so blown away! I am so floored! I am so speechless! I am so awestruck! I am so thunderstruck! I am so flummoxed! I am so perplexed! I am so bewildered! I am so confounded! I am so bamboozled! I am so nonplussed! I am so dazed! I am so stunned!"
              }
            />
          </Box>

          <Link
            color="blue.500"
            textDecor="underline"
            href="https://github.com/ski3r3n/project_planner">
            github.com/ski3r3n/project_planner
          </Link>
        </Box>

        <Box>
          <Button padding={5} mr={5} mt={5} bg="white" w="100%">
            <FiPlus /> Save
          </Button>
        </Box>
      </Sidebar>
    </Box>
  );
}
