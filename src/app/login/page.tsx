"use client";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Field,
} from "@chakra-ui/react"; // Chakra v3 Field API :contentReference[oaicite:1]{index=1}
import { useState } from "react";
import { toaster } from "@/components/ui/toaster"; // Import the toaster utility
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = () => {
    
    console.log("Login attempt with:", { email, password });
    if (email === "kieren.siew@gmail.com" && password === "Invalid") { // hahaha get it invalid credentials (replace with actual backend)
      toaster.create({
        description: "Logged in successfully",
        type: "success",
        closable: true,
      });
      // Redirect to dashboard or perform further actions
      window.location.href = "/dashboard"; // Replace with your actual dashboard route
    } else {
      toaster.create({
        description: "Invalid credentials",
        type: "error",
        closable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="offwhite">
      <Box bg="white" p={8} rounded="lg" w={{ base: "90%", sm: "400px" }}>
        <Heading size="4xl" fontSize="2xl" textAlign="center">
          Login to Project Planner
        </Heading>
        <Stack>
          {/* Email field */}
          <Field.Root border="2px solid" borderColor="gray.200" p={4}>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </Field.Root>

          <Button colorScheme="blue" bg="blue.400" onClick={handleLogin}>
            Sign In
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
}
