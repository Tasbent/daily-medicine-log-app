// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Fetch the Firebase configuration from the server
async function getFirebaseConfig() {
  const response = await fetch('/getFirebaseConfig');
  if (!response.ok) {
    throw new Error('Failed to fetch Firebase config');
  }
  return response.json();
}

// Initialize Firebase and export the db object
let db;
let app;

try {
    const firebaseConfig = await getFirebaseConfig();
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

export { db };
