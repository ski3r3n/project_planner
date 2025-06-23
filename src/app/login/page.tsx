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
import { useRouter } from "next/navigation"; // For Next.js App Router navigation
import { supabase } from "@/lib/supabaseClient"; // you'll create this if not already

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // New state to manage loading
  const router = useRouter(); // Initialize Next.js router

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        throw error;
      }
      console.log("Login successful:", data);
      toaster.create({
        description: "Logged in successfully! Welcome back to Project Planner.",
        type: "success",
        closable: true,
      });
  
      router.push("/dashboard");
    } catch (error: unknown) {
      // Supabase error codes are simpler but still provide info
      console.error("Supabase Login Error:", error);
  
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        // General JavaScript Error Handling
        errorMessage = error.message || errorMessage;
      
        if (error?.message?.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password.";
        } else if (error?.message?.includes("User not confirmed")) {
          errorMessage = "Please confirm your email before logging in.";
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
