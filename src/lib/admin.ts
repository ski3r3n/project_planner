// src/lib/firebase/admin.ts

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore'; // Example: if you use Firestore

// Check if a Firebase Admin app has already been initialized.
// This is crucial for Next.js development mode where modules might be reloaded
// and you don't want to try initializing the app multiple times.
let adminApp;
const keys = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: keys.project_id,
      clientEmail: keys.client_email,
      privateKey: keys.private_key.replace(/\\n/g, '\n'), // Ensure newlines are correctly formatted
    }),
  });
} else {
  // If an app already exists (e.g., during hot module reloading in development),
  // retrieve the existing default app.
  adminApp = getApp();
}

// Now, get the specific Firebase Admin services you need from this initialized app.
const adminAuth = getAuth(adminApp);
const adminFirestore = getFirestore(adminApp); // Example

export { adminApp, adminAuth, adminFirestore };
