"use client";

import {
  Box,
  Button,
  Heading,
  Link,
  Text,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabaseClient";

export default function Sidebar({
  children,
  selected,
}: {
  children: React.ReactNode;
  selected: number;
}) {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();

  const tabItems = [
    { name: "Overview", route: "/dashboard", id: 1 },
    { name: "Project", route: "/dashboard/project", id: 2 },
    { name: "Calendar", route: "/dashboard/project/1/calendar", id: 3 },
  ];

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
        justifyContent="space-between"
      >
        {/* Top Section */}
        <Box>
          <Heading
            fontSize="2xl"
            mb={6}
            textAlign="center"
            color="#1A1A1A"
            letterSpacing="-0.5px"
          >
            Project Hub
          </Heading>

          <VStack align="stretch" mb={4}>
            <Link href="/dashboard/project/1">
              <Button
                w="100%"
                colorScheme={selected === 1 ? "blue" : "gray"}
                variant={selected === 1 ? "solid" : "ghost"}
                justifyContent="flex-start"
                fontWeight="medium"
              >
                Project Planner
              </Button>
            </Link>

            <Button
              display="flex"
              alignItems="center"
              gap={2}
              bg="#4C8EFF"
              color="white"
              _hover={{ bg: "#3B6EDC" }}
              fontWeight="medium"
              justifyContent="flex-start"
            >
              <FiPlus />
              Create Project
            </Button>
          </VStack>

          {/* Substitute for Divider */}
          <Box h="1px" bg="#CBD5E0" my={4} />
        </Box>

        {/* Sign Out Button */}
        <Box>
          <Button
            w="100%"
            bg="#FF5C5C"
            color="white"
            _hover={{ bg: "#E74646" }}
            loading={logoutLoading}
            loadingText="Signing out..."
            onClick={handleSignOut}
            fontWeight="medium"
          >
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
          borderBottom="1px solid #CBD5E0"
        >
          <Flex height="100%" alignItems="center">
            {tabItems.map((tab, index) => (
              <Box
                key={tab.id}
                onClick={() => router.push(tab.route)}
                cursor="pointer"
                px={4}
                py={2}
                borderRight={
                  index !== tabItems.length - 1
                    ? "1px solid #CBD5E0"
                    : "none"
                }
                bg={selected === tab.id ? "#E2E8F0" : "transparent"}
                _hover={{
                  transform: "translateY(1px)",
                  bg: selected === tab.id ? "#E2E8F0" : "#F0F4F8",
                }}
                transition="all 0.15s ease-in-out"
                borderRadius="md"
              >
                <Text
                  fontSize="lg"
                  fontWeight={selected === tab.id ? "bold" : "medium"}
                  color="#1A1A1A"
                >
                  {tab.name}
                </Text>
              </Box>
            ))}
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
