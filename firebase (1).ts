import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration with your credentials
const firebaseConfig = {
  apiKey: "AIzaSyDKeXaVaYtcwnrxYQWUYdZVy7yMdgdK7TQ",
  authDomain: "randybeats-2dfb0.firebaseapp.com",
  projectId: "randybeats-2dfb0",
  storageBucket: "randybeats-2dfb0.firebasestorage.app",
  messagingSenderId: "190194060319",
  appId: "1:190194060319:web:e4ca35186c0c2edbd1d92a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
