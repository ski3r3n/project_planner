"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/sidebar";
import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Field,
  NativeSelect,
} from "@chakra-ui/react";
import { FiUserPlus } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster"; // Assuming you have a toaster component for notifications
export default function AddMemberByUuidPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();

  const [userUuid, setUserUuid] = useState("");
  const [selectedRole, setSelectedRole] = useState("editor");
  const [loading, setLoading] = useState(false);
  const [uuidError, setUuidError] = useState<string | null>(null);

  const isValidUuid = (uuid: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      uuid
    );

  const handleUuidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setUserUuid(val);
    setUuidError(val && !isValidUuid(val) ? "Invalid UUID." : null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setUuidError(null);
    if (!userUuid || !isValidUuid(userUuid)) {
      setUuidError("Please enter a valid UUID.");
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: userUuid,
          role: selectedRole,
        });

      if (insertError) {
        if (insertError.code === "23505") throw new Error("Already a member.");
        if (insertError.code === "23503")
          throw new Error("User does not exist.");
        throw insertError;
      }

      toaster.create({
        title: "Member Added!",
        description: `Added as ${selectedRole}`,
        type: "success",
        duration: 3000,
        closable: true,
      });
      router.push(`/dashboard/project/${projectId}/members`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toaster.create({
          title: "Error",
          description: err.message || "Failed to add member.",
          type: "error",
          duration: 5000,
          closable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Sidebar selected={2}>
        <VStack align="stretch" p={8}>
          <Heading>Add Project Member</Heading>
          <Field.Root invalid={!!uuidError} disabled={loading}>
            <Field.Label>User UUID</Field.Label>
            <Input
              placeholder="UUID (e.g. f3d8a5c7-1e2b-4a9c-8d1f-0b3a6e5f8d9c)"
              value={userUuid}
              onChange={handleUuidChange}
              border="2px solid"
            />
            {uuidError && <Field.ErrorText>{uuidError}</Field.ErrorText>}
          </Field.Root>

          <Field.Root disabled={loading}>
            <Field.Label>Assign Role</Field.Label>
            <NativeSelect.Root size="md" width="full">
              <NativeSelect.Field
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.currentTarget.value)}
                placeholder="Select role">
                <option value="owner">Owner</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>

          <Button
            colorPalette="blue"
            size="lg"
            onClick={handleSubmit}
            loading={loading}
            disabled={!userUuid || !!uuidError || loading}>
            Add Member <FiUserPlus />
          </Button>
        </VStack>
      </Sidebar>
    </Box>
  );
}
