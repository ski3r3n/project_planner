// app/components/sidebar.tsx (or wherever your Sidebar component is located)

"use client";

import {
  Box,
  Button,
  Heading,
  Link,
  Text,
  VStack,
  Center,
  Flex,
  Spinner, // Added Spinner for loading state
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react"; // Import useEffect
import { useRouter, usePathname } from "next/navigation"; // Import usePathname for dynamic highlighting
import { toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabaseClient";

// Interface for a project fetched from the database
interface Project {
  id: string;
  name: string;
  // Add any other project properties you might need
}

export default function Sidebar({
  children,
  selected, // This is for the main tabs (Overview, Project, Calendar)
}: // activeProjectId, // We can derive this from the URL path instead of passing it
{
  children: React.ReactNode;
  selected: number; // For main tab highlighting
  // activeProjectId?: string; // Optional: If you want to pass it explicitly
}) {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname(); // Hook to get the current URL path

  // Determine the active project ID from the URL path
  // Assumes URLs like /dashboard/project/[projectId]/...
  const activeProjectId = pathname.includes("/dashboard/project/")
    ? pathname.split("/")[3] // e.g., /dashboard/project/123-abc/part -> 123-abc
    : undefined;

  const tabItems = [
    { name: "Overview", route: "/dashboard", id: 1 },
    { name: "Project", route: "/dashboard/project", id: 2 }, // This might change as project links are dynamic
    // { name: "Calendar", route: "/dashboard/project/1/calendar", id: 3 }, // This needs dynamic project ID
  ];

  // Effect to fetch user's projects
  useEffect(() => {
    async function fetchUserProjects() {
      setProjectsLoading(true);
      setProjectsError(null);

      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData?.user) {
          throw new Error("User not authenticated. Please log in.");
        }
        const currentUserId = userData.user.id;

        // Fetch project IDs the user is a member of
        const { data: memberProjects, error: memberError } = await supabase
          .from("project_members")
          .select("project_id")
          .eq("user_id", currentUserId);

        if (memberError) {
          throw memberError;
        }

        const projectIds = memberProjects.map((pm) => pm.project_id);

        if (projectIds.length === 0) {
          setUserProjects([]);
          return;
        }

        // Fetch the actual project details for those IDs
        const { data: projectsData, error: projectsDataError } = await supabase
          .from("projects")
          .select("id, name") // Select only id and name for the sidebar
          .in("id", projectIds)
          .order("name", { ascending: true }); // Order projects alphabetically

        if (projectsDataError) {
          throw projectsDataError;
        }

        setUserProjects(projectsData || []);
      } catch (err: unknown) {
        console.error("Error fetching user projects:", err);
        if (err instanceof Error) {
          setProjectsError(err.message || "Failed to load projects.");
        } else {
          setProjectsError("An unknown error occurred while loading projects.");
        }
      } finally {
        setProjectsLoading(false);
      }
    }

    fetchUserProjects();
  }, []); // Run once on component mount

  async function handleSignOut() {
    try {
      setLogoutLoading(true);
      await supabase.auth.signOut();
      toaster.create({
        description:
          "Signed out successfully! Thank you for using Project Planner.",
        type: "info",
        closable: true,
      });
      window.location.href = "/login";
    } catch (error) {
      if (error instanceof Error) {
        alert(`Sign out failed: ${error.message}`);
        setLogoutLoading(false);
      }
    }
  }

  return (
    <Box display="flex" position="fixed" left={0} top={0} w="100%" h="100vh">
      {/* Sidebar */}
      <Box
        h="100vh"
        w="260px"
        bg="#E9EFF6"
        p={5}
        borderRight="1px solid #CBD5E0"
        display="flex"
        flexDirection="column"
        justifyContent="space-between">
        {/* Top Section */}
        <Box>
          <Heading
            fontSize="2xl"
            mb={6}
            textAlign="center"
            color="#1A1A1A"
            letterSpacing="-0.5px">
            Project Hub
          </Heading>

          <VStack align="stretch" mb={4}>
            {/* Main Navigation Tabs */}
            {tabItems.map((tab) => (
              <Link
                key={tab.id}
                href={tab.route}
                w="100%"
                _hover={{ textDecoration: "none" }}>
                <Button
                  w="100%"
                  colorScheme={selected === tab.id ? "blue" : "gray"}
                  variant={selected === tab.id ? "solid" : "ghost"}
                  justifyContent="flex-start"
                  fontWeight="medium">
                  {tab.name}
                </Button>
              </Link>
            ))}

            {/* Divider */}
            <Box h="1px" bg="#CBD5E0" my={4} />

            {/* Dynamically Loaded Projects */}
            <Text fontSize="md" fontWeight="bold" color="gray.600" mb={2}>
              Your Projects
            </Text>
            {projectsLoading ? (
              <Center py={4}>
                <Spinner size="sm" mr={2} />
                <Text fontSize="sm" color="gray.500">
                  Loading projects...
                </Text>
              </Center>
            ) : projectsError ? (
              <Text fontSize="sm" color="red.500">
                Error: {projectsError}
              </Text>
            ) : userProjects.length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                No projects yet.
              </Text>
            ) : (
              userProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/project/${project.id}`}
                  w="100%"
                  _hover={{ textDecoration: "none" }}>
                  <Button
                    w="100%"
                    colorScheme={
                      activeProjectId === project.id ? "teal" : "gray"
                    } // Highlight active project
                    variant={activeProjectId === project.id ? "solid" : "ghost"}
                    justifyContent="flex-start"
                    fontWeight="medium">
                    {project.name}
                  </Button>
                </Link>
              ))
            )}

            <Button
              display="flex"
              alignItems="center"
              gap={2}
              bg="#4C8EFF"
              color="white"
              _hover={{ bg: "#3B6EDC" }}
              fontWeight="medium"
              justifyContent="flex-start"
              mt={4} // Margin top to separate from project list
              onClick={() => router.push("/dashboard/project/new")} // Assuming a route for creating new projects
            >
              <FiPlus />
              Create New Project
            </Button>
          </VStack>
        </Box>

        {/* Sign Out Button */}
        <Box>
          <Button
            w="100%"
            bg="#FF5C5C"
            color="white"
            _hover={{ bg: "#E74646" }}
            loadingText="Signing out..."
            loading={logoutLoading} // Correct Chakra UI prop is isLoading
            onClick={handleSignOut}
            fontWeight="medium">
            Sign Out
          </Button>
        </Box>
      </Box>

      {/* Main Panel */}
      <Box flex="1" bg="#F8FAFC">
        {/* Tab Navigation (topbar retained) */}
        <Box
          h="60px"
          px={10}
          py={3}
          bg="#EDF2F7"
          boxShadow="sm"
          borderBottom="1px solid #CBD5E0">
          <Flex height="100%" alignItems="center">
            {tabItems.map((tab, index) => {
              // Adjust "Project" tab route if needed, or remove it if project links suffice
              const isProjectTab = tab.name === "Project";
              const currentRoute =
                isProjectTab && activeProjectId
                  ? `/dashboard/project/${activeProjectId}` // If on a project page, link to current project
                  : tab.route;

              return (
                <Box
                  key={tab.id}
                  onClick={() => router.push(currentRoute)}
                  cursor="pointer"
                  px={4}
                  py={2}
                  borderRight={
                    index !== tabItems.length - 1 ? "1px solid #CBD5E0" : "none"
                  }
                  bg={selected === tab.id ? "#E2E8F0" : "transparent"}
                  _hover={{
                    transform: "translateY(1px)",
                    bg: selected === tab.id ? "#E2E8F0" : "#F0F4F8",
                  }}
                  transition="all 0.15s ease-in-out"
                  borderRadius="md">
                  <Text
                    fontSize="lg"
                    fontWeight={selected === tab.id ? "bold" : "medium"}
                    color="#1A1A1A">
                    {tab.name}
                  </Text>
                </Box>
              );
            })}
            {/* Calendar tab will need a dynamic project ID too, consider how you handle it */}
            {activeProjectId && (
              <Box
                onClick={() =>
                  router.push(`/dashboard/project/${activeProjectId}/calendar`)
                }
                cursor="pointer"
                px={4}
                py={2}
                borderRight={"none"} // Last item
                bg={selected === 3 ? "#E2E8F0" : "transparent"} // Assuming 3 is for Calendar
                _hover={{
                  transform: "translateY(1px)",
                  bg: selected === 3 ? "#E2E8F0" : "#F0F4F8",
                }}
                transition="all 0.15s ease-in-out"
                borderRadius="md">
                <Text
                  fontSize="lg"
                  fontWeight={selected === 3 ? "bold" : "medium"}
                  color="#1A1A1A">
                  Calendar
                </Text>
              </Box>
            )}
          </Flex>
        </Box>

        {/* Content Area */}
        <Box p={10} overflowY="auto" h="calc(100vh - 60px)">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
