// src/lib/firebase/serverApp.ts

// 1. Core Firebase Imports for Server-Side App Initialization
import { initializeServerApp, getApp, getApps, initializeApp, FirebaseApp } from "firebase/app";

// 2. Firebase Authentication Service
import { getAuth, User } from "firebase/auth";

// 3. Next.js Utility for Reading Cookies in Server Components
import { cookies } from "next/headers";

// --- Firebase Configuration ---
// IMPORTANT: Never hardcode sensitive API keys directly in your code.
// Use environment variables (e.g., in a .env.local file) for production.
// NEXT_PUBLIC_ prefix is important for client-side access, but for server-side
// only functions like this, it's good practice to stick to standard env vars
// without NEXT_PUBLIC_ if they are truly server-only and not exposed to the browser.
// However, Firebase's initializeApp often expects a full config, which is generally fine
// to be exposed if it's limited to your Firebase project.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Add any other config specific to your project, like databaseURL, measurementId etc.
};

// --- Server-Side Firebase Authentication Function ---

/**
 * Initializes a server-side Firebase App instance for the current user
 * based on their session cookie. This is used in Next.js Server Components
 * to get authenticated user information.
 *
 * @returns {Promise<{ firebaseServerApp: FirebaseApp, currentUser: User | null }>}
 *          An object containing the server-side Firebase App instance and the
 *          authenticated Firebase User (or null if unauthenticated/invalid session).
 */
export async function getAuthenticatedAppForUser(): Promise<{ firebaseServerApp: FirebaseApp; currentUser: User | null }> {
  // 1. Get the session cookie from the incoming request headers.
  // The '__session' cookie is typically set by Firebase when using session cookies
  // for framework integrations (e.g., Next.js with Firebase Hosting).
  const authIdToken = (await cookies()).get("__session")?.value;

  // 2. Initialize a *base* Firebase App instance for the server-side context.
  // This ensures that `initializeServerApp` has a Firebase App context to work with.
  // We use `getApps().length ? getApp() : initializeApp()` to prevent
  // multiple initializations if this function is called multiple times within
  // the same server process execution cycle.
  let clientApp: FirebaseApp;
  if (getApps().length === 0) {
    // If no Firebase app has been initialized in this server environment yet, initialize it.
    console.log("Initializing base Firebase App for server-side context...");
    clientApp = initializeApp(firebaseConfig);
  } else {
    // Otherwise, retrieve the existing one.
    console.log("Reusing existing base Firebase App for server-side context.");
    clientApp = getApp();
  }

  // 3. Create the specialized `FirebaseServerApp` instance.
  // This is where the session cookie (authIdToken) is passed to Firebase,
  // allowing it to internally verify the token and establish the server-side
  // authentication context.
  const firebaseServerApp = initializeServerApp(
    clientApp, // Pass the already initialized base FirebaseApp
    { authIdToken: authIdToken || undefined } // Pass the session cookie or undefined if not present
  );

  // 4. Get the Auth instance for this server-side app.
  const auth = getAuth(firebaseServerApp);

  // 5. Wait for the authentication state to be ready.
  // This is crucial! It tells Firebase to process the `authIdToken`.
  // If the token is valid, `auth.currentUser` will be populated.
  // If it's invalid, expired, or revoked, `auth.currentUser` will be null.
  console.log("Waiting for auth state to be ready (verifying session cookie)...");
  await auth.authStateReady();

  // 6. Return the server app and the current user.
  if (auth.currentUser) {
    console.log(`User authenticated: ${auth.currentUser.email || auth.currentUser.uid}`);
  } else {
    console.log("No authenticated user found for this session (token invalid or missing).");
  }

  return { firebaseServerApp, currentUser: auth.currentUser };
}

