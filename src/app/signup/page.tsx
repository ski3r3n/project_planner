"use client"; // Important for Next.js App Router, as you already have it!

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text, // Added Text component for potential links/messages
} from "@chakra-ui/react";
// Assuming Field.Root and Field.Label are part of your custom Chakra v3 setup or a specific plugin.
// If you encounter issues, standard Chakra UI uses FormControl, FormLabel, FormHelperText.
// For now, we'll use your provided Field API structure directly.
import { Field } from "@chakra-ui/react"; // Chakra v3 Field API

import { useState } from "react";
import { toaster } from "@/components/ui/toaster"; // Import your toaster utility
// --- KEY CHANGE: Import createUserWithEmailAndPassword instead of signInWithEmailAndPassword ---
import { useRouter } from "next/navigation"; // For Next.js App Router navigation
import Link from "next/link"; // For linking to the login page
import { supabase } from "@/lib/supabaseClient"; // you'll create this if not already

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // New state to manage loading
  const router = useRouter(); // Initialize Next.js router

  const handleSignUp = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      console.log("Sign-Up successful:", data);
      toaster.create({
        description: "Account created! Please check your email to confirm.",
        type: "success",
        closable: true,
      });

      router.push("/login"); // Or redirect somewhere else after signup
    } catch (error: unknown) {
      console.error("Supabase Sign-Up Error:", error);

      let errorMessage =
        "An unexpected error occurred during sign-up. Please try again.";
      if (error instanceof Error) {
        if (error?.message?.includes("User already registered")) {
          errorMessage = "This email is already registered.";
        } else if (error?.message?.includes("Password should be at least")) {
          errorMessage = "Password must be at least 6 characters.";
        }

        toaster.create({
          description: errorMessage,
          type: "error",
          closable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Flex minH="100vh" align="center" justify="center" bg="offwhite">
      <Box bg="white" p={8} rounded="lg" w={{ base: "90%", sm: "400px" }}>
        {/* --- UI Change: Heading for Sign Up --- */}
        <Heading size="4xl" fontSize="2xl" textAlign="center" mb={6}>
          Sign Up for Project Planner
        </Heading>
        <Stack>
          {" "}
          {/* Added spacing between form elements */}
          {/* Email field */}
          <Field.Root border="2px solid" borderColor="gray.200" p={4}>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required // HTML5 validation for required field
            />
          </Field.Root>
          {/* Password field */}
          <Field.Root border="2px solid" borderColor="gray.200" p={4}>
            <Field.Label>Password</Field.Label>
            <Input
              type="password"
              placeholder="•••••••• (min 6 characters)" // Hint for password strength
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // HTML5 validation for required field
            />
          </Field.Root>
          <Button
            colorScheme="blue"
            bg="blue.400"
            onClick={handleSignUp} // Use the new handleSignUp function
            loading={loading} // Chakra UI uses 'isLoading' instead of 'loading' for buttons
            loadingText="Signing up..." // Text to show when loading
            width="full" // Make button full width
          >
            {/* --- UI Change: Button text for Sign Up --- */}
            Sign Up
          </Button>
          {/* --- Added: Link to Login Page --- */}
          <Text fontSize="sm" textAlign="center" mt={4}>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ color: "blue.500", textDecoration: "underline" }}>
              Login
            </Link>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
}
