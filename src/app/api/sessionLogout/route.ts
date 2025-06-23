// app/api/sessionLogout/route.ts

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { adminAuth } from '@/lib/admin'; // Import your admin auth utility
import { NextResponse, /*NextRequest*/ } from 'next/server';
import { cookies } from 'next/headers'; // For interacting with cookies
import { toaster } from "@/components/ui/toaster"; // Import your toaster utility

// IMPORTANT: Ensure Firebase Admin SDK is initialized
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export async function POST() {
  // Get the incoming session cookie
  const cookieStore = cookies(); // Access the cookie store
  const sessionCookie = (await cookieStore).get('session')?.value || '';

  // First, tell the browser to delete the cookie by setting its maxAge to 0
  (await cookieStore).set('session', '', {
    maxAge: 0, // Immediately expires the cookie
    expires: new Date(0), // Another way to expire (for older browsers)
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure in prod, not dev (http)
    path: '/',
    sameSite: 'lax',
  });

  try {
    // If a session cookie existed, verify it to get the user's UID
    if (sessionCookie) {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      // Revoke all refresh tokens for this user.
      // This invalidates all sessions for this user on all devices.
      await adminAuth.revokeRefreshTokens(decodedClaims.uid);
      console.log(`Successfully revoked refresh tokens for UID: ${decodedClaims.uid}`);
    } else {
      console.log("No session cookie found, but still clearing client-side cookie.");
    }
    toaster.create({
      description: "Signed out successfully",
      type: "success",
      closable: true,
      
    });
    // Return a success response
    return NextResponse.json({ status: 'Signed out successfully!' });

  } catch (error) {
    // If the session cookie was invalid or expired, `verifySessionCookie` will throw.
    // In this case, we still return success because the user's session was
    // effectively invalid anyway, and we've cleared the client-side cookie.
    console.error('Error during session logout (cookie might be invalid/expired):', error);
    return NextResponse.json({ status: 'Signed out successfully (session was already invalid).' });
  }
}
