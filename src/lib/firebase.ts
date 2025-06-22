// Import the functions you need from the SDKs you need
// import "../envConfig.ts"   
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'; // Only if you're using Auth
import { getFirestore } from 'firebase/firestore'; // Only if you're using Firestore
import { getApps, getApp } from 'firebase/app'; // For checking if Firebase is already initialized
import { getStorage } from 'firebase/storage'; // Only if you're using Cloud Storage
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app); // Only if you're using Auth
export const db = getFirestore(app); // Only if you're using Firestore
export const storage = getStorage(app); // Only if you're using Cloud Storage
// export const analytics = getAnalytics(app);

export default app;