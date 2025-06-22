// app/dashboard/layout.tsx

import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Initialize Firebase Admin SDK (ensure this is done only once, perhaps in a separate utility file)
// For example:
// if (typeof window === 'undefined' && !getApps().length) {
//   initializeApp({
//     credential: cert(require('../path/to/your/serviceAccountKey.json'))
//   });
// }

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = cookies();
  const idToken = (await cookieStore).get('session')?.value; // Make sure your client-side sets this cookie after sign-in
  console.log("ID Token from cookie:", idToken);
  let user = null;
  try {
    if (idToken) {
      // Verify the ID token using Firebase Admin SDK
      const decodedToken = await getAuth().verifySessionCookie(idToken);
      user = decodedToken;
    }
  } catch (error) {
    console.error("Error verifying ID token on server:", error);
    user = null; // Token invalid or expired
  }

  if (!user) {
    // If not authenticated, redirect to the login page
    // This is a server-side redirect, happens before the client component renders
    redirect('/login'); // Make sure you have a /login page
  }

  // If authenticated, render the children (your Client Component Dashboard page)
  return (
    <main>
      {/* You can pass user info down to children if needed, e.g., via React Context */}
      {children}
    </main>
  );
}
