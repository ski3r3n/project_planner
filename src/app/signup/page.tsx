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
import { FirebaseError } from "firebase/app";
// --- KEY CHANGE: Import createUserWithEmailAndPassword instead of signInWithEmailAndPassword ---
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase"; // Adjust this path based on where you've put your firebase.ts/js file
import { useRouter } from "next/navigation"; // For Next.js App Router navigation
import Link from "next/link"; // For linking to the login page

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // New state to manage loading
  const router = useRouter(); // Initialize Next.js router

  const handleSignUp = async () => {
    // Renamed function to reflect sign-up
    setLoading(true); // Start loading state
    console.log("Sign-up attempt with:", { email, password });

    try {
      // --- Firebase Authentication Core Logic for SIGN UP ---
      await createUserWithEmailAndPassword(auth, email, password);
      // If the above line succeeds, the user is created AND logged in!

      toaster.create({
        description:
          "Account created successfully! Welcome to Project Planner.",
        type: "success",
        closable: true,
      });

      // Redirect to the dashboard after successful sign-up
      router.push("/dashboard"); // Using Next.js router for better navigation
    } catch (error: unknown) {
      let errorMessage =
        "An unexpected error occurred during sign-up. Please try again.";
      if (error instanceof FirebaseError) {
        // --- Firebase Error Handling for SIGN UP ---
        console.error("Firebase Sign-Up Error:", error);
        errorMessage = error.message || errorMessage;
        // Map Firebase error codes to user-friendly messages for sign-up
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage =
              "This email address is already registered. Please sign in or use a different email.";
            break;
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          case "auth/weak-password":
            errorMessage =
              "The password is too weak. Please use a stronger password (e.g., at least 6 characters).";
            break;
          case "auth/operation-not-allowed":
            errorMessage =
              "Email/password sign-up is not enabled. Please contact support.";
            break;
          default:
            // Fallback for any other unexpected Firebase errors
            errorMessage = error.message || errorMessage;
        }
      }

      toaster.create({
        description: errorMessage,
        type: "error",
        closable: true,
      });
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
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
