"use client"; // Important for Next.js App Router, as you already have it!

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  Link,
} from "@chakra-ui/react";
// Assuming Field.Root and Field.Label are part of your custom Chakra v3 setup or a specific plugin.
// If you encounter issues, standard Chakra UI uses FormControl, FormLabel, FormHelperText.
// For now, we'll use your provided Field API structure directly.
import { Field } from "@chakra-ui/react"; // Chakra v3 Field API

import { useState } from "react";
import { toaster } from "@/components/ui/toaster"; // Import your toaster utility
import { FirebaseError } from "firebase/app";
// Import Firebase Authentication functions and your initialized 'auth' instance
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Adjust this path based on where you've put your firebase.ts/js file
import { useRouter } from "next/navigation"; // For Next.js App Router navigation

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // New state to manage loading
  const router = useRouter(); // Initialize Next.js router

  const handleLogin = async () => {
    setLoading(true); // Start loading state
    console.log("Login attempt with:", { email, password });

    try {
      // --- Firebase Authentication Core Logic ---
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // THIS IS THE FIREBASE USER OBJECT

    // Get the ID Token directly from this user object
    const firebaseIdToken = await user.getIdToken(); // <-- THIS IS THE TOKEN YOU NEED TO SEND
    console.log("Acquired Firebase ID Token:", firebaseIdToken); // Verify it here!

    // NOW, send THIS firebaseIdToken to your server
    const response = await fetch('/api/sessionLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseIdToken}`, // Optional: if your server expects an Authorization header
      },
      body: JSON.stringify({ idToken: firebaseIdToken }), // Make sure 'idToken' is this specific one
    });
      if (response.ok) {
        console.log("Session login successful");
        toaster.create({
          description: "Logged in successfully! Welcome back to Project Planner.",
          type: "success",
          closable: true,
          
        });
        router.push("/dashboard"); 
      }
      else {
        console.error("Session login failed:", response.statusText);
        toaster.create({
          description: "Failed to establish session. Please try again.",
          type: "error",
          closable: true,
        });
        return; // Exit if session login fails
      }

      // Redirect to the dashboard
      // Using Next.js router for better navigation
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof FirebaseError) {
        // --- Firebase Error Handling ---
        console.error("Firebase Login Error:", error);
        errorMessage = error.message || errorMessage;
        // Map Firebase error codes to user-friendly messages
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          case "auth/user-disabled":
            errorMessage = "This user account has been disabled.";
            break;
          case "auth/user-not-found":
            errorMessage = "No account found with this email address.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password. Please try again.";
            break;
          case "auth/invalid-credential": // Often occurs for bad email/password combination (newer Firebase versions)
            errorMessage =
              "Invalid credentials. Please check your email and password.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many login attempts. Please try again later.";
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
        <Heading size="4xl" fontSize="2xl" textAlign="center" mb={6}>
          Login to Project Planner
        </Heading>
        <Stack>
          {" "}
          {/* Added spacing between form elements */}
          {/* Email field */}
          {/* Using Field.Root and Field.Label as per your component structure */}
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // HTML5 validation for required field
            />
          </Field.Root>
          <Button
            colorScheme="blue"
            bg="blue.400"
            onClick={handleLogin}
            loading={loading} // Link button's loading state to our 'loading' state
            loadingText="Logging in..." // Text to show when loading
            width="full" // Make button full width
          >
            Log In
          </Button>
          <Text fontSize="sm" textAlign="center" mt={4}>
            No account?{" "}
            <Link
              href="/signup"
              style={{ color: "blue.500", textDecoration: "underline" }}>
              Sign up
            </Link>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
}
