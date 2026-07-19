import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Placeholder configuration.
// Since automatic provisioning failed, the user will need to replace this
// with their actual Firebase configuration.
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

let app;
let auth;
let db;

try {
  // Only initialize if the user has replaced the config
  if (firebaseConfig.apiKey !== "REPLACE_ME") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error("Failed to initialize Firebase", error);
}

export { app, auth, db };
