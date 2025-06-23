// app/api/sessionLogin/route.ts

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { adminAuth } from '@/lib/admin'; // Import your admin auth utility
import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest
import { cookies } from 'next/headers';

// IMPORTANT: Replace with your service account key file path or environment variable logic.
// This file should NOT be publicly accessible. Use environment variables in production.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

// Initialize Firebase Admin SDK only once
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

// Define the expected structure of the request body
interface SessionLoginRequestBody {
  idToken: string;
}

// Use NextRequest for the request parameter to get Next.js-specific methods and types
export async function POST(request: NextRequest) { // Changed Request to NextRequest
  let body: SessionLoginRequestBody;
  try {
    // Explicitly cast the result of request.json() to our defined interface
    body = (await request.json()) as SessionLoginRequestBody;
  } catch (error) {
    // Handle cases where the request body isn't valid JSON or is missing
    console.error("Failed to parse request body:", error);
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  
  const { idToken } = body; // Destructure from the typed body
  console.log("Server-side received ID Token:", idToken); 
  if (!idToken) {
    return NextResponse.json({ error: 'ID Token is required.' }, { status: 400 });
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
  const cookieMaxAge = expiresIn / 1000; // 5 days in seconds

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log("Session cookie created successfully:", sessionCookie);
    const cookieStore = await cookies();
    // test cookie
    cookieStore.set('testCookie', 'testValue', {
      maxAge: cookieMaxAge,
    })
    cookieStore.set('session', sessionCookie, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure this is false for http://localhost:3000
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ status: 'Session cookie set!' });

  } catch (error) {
    console.error('Error creating session cookie:', error);
    // Be more specific about the error if possible, e.g., if token verification fails.
    let errorMessage = 'Failed to create session cookie or ID Token invalid/expired.';
    if (error instanceof Error) {
        errorMessage = error.message; // Use the error message from Firebase if available
    }
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}
