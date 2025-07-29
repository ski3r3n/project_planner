// app/dashboard/project/[id]/[part]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import Sidebar from "@/components/sidebar";
import {
  Box,
  Button,
  Heading,
  Textarea,
  Portal,
  Spinner,
  Center,
  Text,
  Input,
  createListCollection,
  Select,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

// --- Interfaces ---
interface Project {
  id: string;
  name: string;
}

interface DbTask {
  id?: string;
  title: string;
  description: string | null;
  start_time: string; // YYYY-MM-DD
  end_time: string; // YYYY-MM-DD
  project_id: string;
  assigned_to: string | null;
  status: string; // This is for workflow status (e.g., 'todo', 'done', 'in_progress')
  parent_task_id: string | null;
  hierarchy_type: string; // ⭐ NEW: Add hierarchy_type
}

interface UserProfile {
  id: string;
  full_name: string;
}

type TaskWithRelations = DbTask & {
  projects?: Project | null;
  profiles?: UserProfile | null;
};

export default function TaskFormPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const taskId = params.part as string;

  const isNewMode = taskId === "new";

  // --- State for form fields ---
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedProjectId] = useState<string>(projectId);
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [existingParentTaskId, setExistingParentTaskId] = useState<string | null>(null);

  // State for workflow status (e.g., 'todo', 'in_progress', 'done')
  const [workflowStatus, setWorkflowStatus] = useState<string>("todo");

  // ⭐ NEW STATE: To display the fetched hierarchy type (Goal, Task, Subtask) in UI
  const [displayHierarchyType, setDisplayHierarchyType] = useState<string>("goal"); // Default for new tasks

  // --- Data for Select dropdowns ---
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);

  // --- UI states ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Effect to fetch initial data (task for edit, profiles) ---
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all profiles for the 'Allocated:' dropdown
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name");
        if (profilesError) throw profilesError;
        setAllProfiles(profilesData || []);

        // If in EDIT mode, fetch the existing task data
        if (!isNewMode) {
          const { data: taskData, error: taskError } = await supabase
            .from("tasks")
            // ⭐ Ensure you select 'hierarchy_type'
            .select("*, projects(id, name), profiles(id, full_name)")
            .eq("id", taskId)
            .single();

          if (taskError) throw taskError;
          if (!taskData) {
            setError("Task not found.");
            return;
          }

          const typedTaskData = taskData as TaskWithRelations;

          // Populate form fields with fetched data
          setTitle(typedTaskData.title);
          setDescription(typedTaskData.description || "");
          setSelectedAssignedTo(typedTaskData.assigned_to || "");
          setWorkflowStatus(typedTaskData.status || "todo"); // Set workflow status from fetched data

          setStartDate(typedTaskData.start_time ? new Date(typedTaskData.start_time).toISOString().split("T")[0] : "");
          setEndDate(typedTaskData.end_time ? new Date(typedTaskData.end_time).toISOString().split("T")[0] : "");
          setExistingParentTaskId(typedTaskData.parent_task_id || null);

          // ⭐ Set the hierarchy type from the fetched data
          setDisplayHierarchyType(typedTaskData.hierarchy_type);

        } else {
          // New mode defaults:
          const today = new Date().toISOString().split("T")[0];
          setStartDate(today);
          setEndDate(today);
          setExistingParentTaskId(null);
          setWorkflowStatus("todo"); // Default workflow status for new tasks
          // ⭐ Default hierarchy type for new tasks (DB trigger will set it to 'goal' upon insert)
          setDisplayHierarchyType("goal");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error fetching initial data:", err.message);
          setError(err.message || "Failed to load form data.");
        } else {
          console.error("Unexpected error:", err);
          setError("An unknown error occurred while loading form data.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, [projectId, taskId, isNewMode]);

  // --- Handle Form Submission ---
  const handleSubmit = async () => {
    setSaving(true);
    setError(null);

    // Basic validation
    if (!title || !startDate || !endDate || !selectedProjectId) {
      setError("Please fill in all required fields (Title, Dates, Project).");
      setSaving(false);
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      setSaving(false);
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("User not authenticated. Please log in.");
      }

      // Prepare common data for insertion/update
      // ⭐ Omit 'hierarchy_type' from the payload; the database trigger will set it.
      const baseTaskData: Omit<DbTask, "id" | "hierarchy_type"> = {
        title: title,
        description: description,
        start_time: new Date(startDate).toISOString(),
        end_time: new Date(endDate).toISOString(),
        project_id: selectedProjectId,
        assigned_to: selectedAssignedTo || null,
        status: workflowStatus, // Using the state for workflow status
        parent_task_id: existingParentTaskId, // Add parent_task_id to satisfy type
      };

      let operationError;
      let newOrUpdatedTaskId = taskId;

      if (isNewMode) {
        // --- INSERT New Task ---
        const taskToInsert = {
          ...baseTaskData,
          parent_task_id: null, // New tasks created via this form are top-level parents
        };

        const { data, error: insertError } = await supabase
          .from("tasks")
          .insert([taskToInsert])
          .select("id")
          .single();

        if (insertError) {
          operationError = insertError;
        } else if (data) {
          newOrUpdatedTaskId = data.id;
        } else {
          throw new Error("Failed to retrieve new task ID after creation.");
        }

        if (!operationError) {
          router.push(`/dashboard/project/${projectId}/${newOrUpdatedTaskId}/aibreakdown`);
        }

      } else {
        // --- UPDATE Existing Task ---
        const taskToUpdate = {
          ...baseTaskData,
          parent_task_id: existingParentTaskId, // Preserve original parent_task_id
        };

        const { error: updateError } = await supabase
          .from("tasks")
          .update(taskToUpdate)
          .eq("id", taskId);

        operationError = updateError;

        if (!operationError) {
          router.push(`/dashboard/project/${projectId}/${taskId}`);
        }
      }

      if (operationError) {
        throw operationError;
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error saving task:", err.message);
        setError(err.message || "Failed to save task.");
      } else {
        setError("An unknown error occurred while saving task.");
      }
    } finally {
      setSaving(false);
    }
  };

  // --- Render Loading/Error States ---
  if (loading) {
    return (
      <Box>
        <Sidebar selected={2}>
          <Center minH="200px">
            <Spinner size="xl" />
            <Text ml={4}>Loading form...</Text>
          </Center>
        </Sidebar>
      </Box>
    );
  }

  if (error && !saving) {
    return (
      <Box>
        <Sidebar selected={2}>
          <Center minH="200px">
            <Text color="red.500" fontSize="lg">
              {error}
            </Text>
          </Center>
        </Sidebar>
      </Box>
    );
  }

  // --- Render the Form ---
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
        >
          {/* Page Heading */}
          <Heading size="lg" mb={5}>
            {isNewMode ? "Create New Task" : `Edit Task: ${title}`}
          </Heading>

          {/* ⭐ Display Hierarchy Type */}
          <Box mb={4}>
            <Text fontSize="md" fontWeight="bold">
              Hierarchy Type: <Text as="span" textTransform="capitalize" color="teal.500">{displayHierarchyType}</Text>
            </Text>
          </Box>

          {/* Task Title */}
          <Box display="flex" flexDirection={{ base: "column", md: "row" }} gap={2} mb={5} alignItems="flex-start">
            <b>Name:</b>
            <Textarea
              border="2px solid"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              flex="1"
              minH="unset"
            />
          </Box>

          {/* Start and End Dates */}
          <Box display="flex" flexDirection={{ base: "column", md: "row" }} gap={2} mb={5} alignItems={{ base: "flex-start", md: "center" }}>
            <Box fontWeight="bold" flexShrink={0}>Start Date:</Box>
            <Input
              type="date"
              border="2px solid"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              flex="1"
            />
            <Box fontWeight="bold" flexShrink={0}>End Date:</Box>
            <Input
              type="date"
              border="2px solid"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              flex="1"
            />
          </Box>

          {/* Assigned To User Selection */}
          <Box display="flex" flexDirection={{ base: "column", md: "row" }} gap={2} mb={5} alignItems={{ base: "flex-start", md: "center" }}>
            <Box fontWeight="bold" flexShrink={0}>Allocated:</Box>
            <Select.Root
              collection={createListCollection({
                items: [{ label: "Unassigned", value: "" }].concat(
                  allProfiles.map((p) => ({ label: p.full_name, value: p.id }))
                ),
              })}
              size="sm"
              width={{ base: "100%", md: "320px" }}
              value={[selectedAssignedTo]}
              onValueChange={({ value }) => setSelectedAssignedTo(value[0])}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select User" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {[{ label: "Unassigned", value: "" }].concat(allProfiles.map((profile) => ({ label: profile.full_name, value: profile.id }))).map((item) => (
                      <Select.Item
                        item={item}
                        key={item.value}
                      >
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>

          {/* Workflow Status Selection */}
          <Box display="flex" flexDirection={{ base: "column", md: "row" }} gap={2} mb={5} alignItems={{ base: "flex-start", md: "center" }}>
            <Box fontWeight="bold" flexShrink={0}>Workflow Status:</Box>
            <Select.Root
              collection={createListCollection({
                items: [
                  { label: "To Do", value: "todo" },
                  { label: "In Progress", value: "in_progress" },
                  { label: "Done", value: "done" },
                ],
              })}
              size="sm"
              width={{ base: "100%", md: "320px" }}
              value={[workflowStatus]}
              onValueChange={({ value }) => setWorkflowStatus(value[0])}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select Workflow Status" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {[
                      { label: "To Do", value: "todo" },
                      { label: "In Progress", value: "in_progress" },
                      { label: "Done", value: "done" },
                    ].map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>

          {/* Description Textarea */}
          <Box display="flex" flexDirection={{ base: "column", md: "row" }} gap={2} width="100%" alignItems="flex-start">
            <Box fontWeight="bold" flexShrink={0}>Description:</Box>
            <Textarea
              border="2px solid"
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              flex="1"
              minH="100px"
            />
          </Box>
        </Box>

        {/* Save Button */}
        <Box>
          <Button
            padding={5}
            mr={5}
            mt={5}
            bg="white"
            w="100%"
            onClick={handleSubmit}
            loading={saving}
            loadingText={isNewMode ? "Creating..." : "Saving..."}
            disabled={!title || saving}
          >
            <FiPlus /> {isNewMode ? "Create Task" : "Save Changes"}
          </Button>
          {error && (
            <Text color="red.500" mt={2} textAlign="center">
              {error}
            </Text>
          )}
        </Box>
      </Sidebar>
    </Box>
  );
}