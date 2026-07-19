import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Read configuration from environment variables, fallback to current defaults
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyANIR8elZmlA3YPyKH3EXbVUeFusfjA0Jo",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "mediaclear-4c164.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "mediaclear-4c164",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "mediaclear-4c164.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "691846643593",
  appId: env.VITE_FIREBASE_APP_ID || "1:691846643593:web:a90e48a45c9c5231f3ab58",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-4MV9GF2674"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
