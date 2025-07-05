// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (provided by you)
const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "medicine-tracker-6f4ca.firebaseapp.com",
  databaseURL: "https://medicine-tracker-6f4ca-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "medicine-tracker-6f4ca",
  storageBucket: "medicine-tracker-6f4ca.appspot.com",
  messagingSenderId: "526944861480",
  appId: "1:526944861480:web:0235aef69ff7f16169a41d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Firestore database
export const db = getFirestore(app);
