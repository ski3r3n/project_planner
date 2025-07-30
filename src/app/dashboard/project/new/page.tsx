// app/dashboard/project/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Your Supabase client instance

import Sidebar from "@/components/sidebar";
import {
  Box,
  Button,
  Heading,
  Input,
  Textarea,
  VStack, // For showing success/error messages
  Field,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster"; // Assuming you have a toaster component for notifications
export default function CreateProjectPage() {
  const [projectName, setProjectName] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!projectName.trim()) {
      setError("Project name cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("User not authenticated. Please log in.");
      }
      const currentUserId = userData.user.id;

      // 1. Insert the new project into the 'projects' table
      const { data: newProject, error: projectInsertError } = await supabase
        .from("projects")
        .insert({
          name: projectName.trim(),
          description: projectDescription.trim() || null,
          owner_id: currentUserId, // Assuming your projects table has a created_by column
        })
        .select("id") // Select the ID of the newly created project
        .single();

      if (projectInsertError) {
        throw projectInsertError;
      }
      if (!newProject) {
        throw new Error("Failed to retrieve new project ID after creation.");
      }

      const newProjectId = newProject.id;

      // 2. Add the current user to the 'project_members' table for this new project
      const { error: memberInsertError } = await supabase
        .from("project_members")
        .insert({
          project_id: newProjectId,
          user_id: currentUserId,
          role: "owner", // Assign a role, e.g., 'owner'
        });

      if (memberInsertError) {
        // If this fails, consider rolling back the project creation or logging a critical error
        console.error(
          "Failed to add user to project_members:",
          memberInsertError
        );
        throw new Error(
          "Project created, but failed to add you as a member. Please contact support."
        );
      }

      toaster.create({
        title: "Project Created!",
        description: `"${projectName}" has been successfully created.`,
        type: "success",
        duration: 5000,
        closable: true,
      });

      // Redirect to the new project's main page or a relevant starting point
      // For now, redirecting to the project's overview page.
      // You might want to redirect to /dashboard/project/${newProjectId}/new/aibreakdown
      // if you want them to immediately create the first task with AI.
      router.push(`/dashboard/project/${newProjectId}`);
    } catch (err: unknown) {
      console.error("Error creating project:", err);
      if (err instanceof Error) {
        setError(err.message || "Failed to create project.");
      } else {
        setError("An unknown error occurred.");
      }
      toaster.create({
        title: "Error",
        description: error || "Failed to create project.",
        type: "error",
        duration: 5000,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Sidebar selected={2}>
        {" "}
        {/* Assuming 'Project' tab is selected */}
        <VStack p={8} align="stretch">
          <Heading size="xl">Create New Project</Heading>
          <Field.Root invalid={!!error} disabled={loading}>
            <Field.Label htmlFor="projectName">
              Project Name{!error && <Field.RequiredIndicator />}
            </Field.Label>
            <Input
              id="projectName"
              placeholder="e.g., Q3 Marketing Campaign"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              border="2px solid"
            />
            {/* Use Field.ErrorText only when there’s an error */}
            {error && <Field.ErrorText>{error}</Field.ErrorText>}
          </Field.Root>
          <Field.Root disabled={loading}>
            <Field.Label htmlFor="projectDescription">
              Description (Optional)
              {/* <Field.RequiredIndicator
                fallback={
                  "oops"
                }
              /> */}
            </Field.Label>
            <Textarea
              id="projectDescription"
              placeholder="Briefly describe your project goals and scope."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              minH="100px"
              border="2px solid"
            />
          </Field.Root>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleSubmit}
            loading={loading}
            loadingText="Creating..."
            disabled={!projectName.trim() || loading}>
            Create Project <FiPlus />
          </Button>
        </VStack>
      </Sidebar>
    </Box>
  );
}
