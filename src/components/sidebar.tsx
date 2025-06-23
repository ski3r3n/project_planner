"use client";

import { Box, Heading, Button, Link } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";
// On your dashboard page's client-side component (e.g., within DashboardPage.tsx)
import { supabase } from "@/lib/supabaseClient"; // you'll create this if not already
import { useState } from "react";

export default function Sidebar({
  children,
  selected,
}: {
  children: React.ReactNode;
  selected: number;
}) {
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function handleSignOut() {
    try {
      setLogoutLoading(true); // Set loading state to true
      await supabase.auth.signOut();

      // Invalidate the server-side session by calling another API route
      // const response = await fetch("/api/sessionLogout", { method: "POST" });

      // console.log("Signed out and session cleared!");
      toaster.create({
        description:
          "Signed out successfully! Thank you for using Project Planner.",
        type: "info",
        closable: true,
      });
      window.location.href = "/login"; // Redirect to login page
    } catch (error) {
      // console.error("Error during sign out:", error);
      if (error instanceof Error) {
        alert(`Sign out failed: ${error.message}`);
        setLogoutLoading(false); // Reset loading state regardless of success or failure

      }
    }
  }

  return (
    <>
      <Box display="flex" position="fixed" left={0} top={0} w="100%" h="100vh">
        <Box h={"100vh"} w={"250px"} bg={"gray.100"} p={4}>
          <Heading w="fit" fontSize="2xl" margin="auto" mt={5} mb={5}>
            Projects
          </Heading>
          <Link
            fontSize={"xl"}
            width="100%"
            height="28"
            _hover={{ bgColor: "ourBg" }}
            shadow={"md"}
            mt={5}
            href="/dashboard/project/1"
            display="flex"
            justifyContent={"center"}>
            <Button>Project Planner {/* replace with automation */}</Button>
          </Link>
          <Button
            fontSize={"xl"}
            width="100%"
            height="28"
            _hover={{ bgColor: "ourBg" }}
            shadow={"md"}
            mt={5}>
            <FiPlus></FiPlus>Create
          </Button>
        </Box>
        <Box flex="1">
          <Box
            h="60px"
            bg={"gray.100"}
            p={10}
            display="flex"
            flexDir={"row"}
            justifyContent={"flex-start"}>
            <Link
              w="fit"
              fontSize="xl"
              textDecor={"underline"}
              mr={20}
              href="/dashboard">
              {selected == 1 ? <b>Overview</b> : "Overview"}
            </Link>
            <Link
              w="fit"
              fontSize="xl"
              textDecor={"underline"}
              mr={20}
              href="/dashboard/project">
              {selected == 2 ? <b>Project</b> : "Project"}
            </Link>
            <Link
              w="fit"
              fontSize="xl"
              textDecor={"underline"}
              href="/dashboard/project/1/calendar">
              {selected == 3 ? <b>Calendar</b> : "Calendar"}
            </Link>
            <Link ml="auto">
              <Button
                p="2"
                bg="red"
                color="white"
                _hover={{ bg: "red.600" }}
                loading={logoutLoading}
                loadingText="Signing out..."
                onClick={handleSignOut}
                fontSize="xl">
                Sign Out
              </Button>
            </Link>
          </Box>
          <Box p="10" overflow="auto" h="calc(100vh - 60px)">
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}
