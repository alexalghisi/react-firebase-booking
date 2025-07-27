import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Your Firebase config from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBGdoqZ8kxZPV7crJDohkPfg3Q8vcwTA-U",
  authDomain: "react-booking-system-98447.firebaseapp.com",
  projectId: "react-booking-system-98447",
  storageBucket: "react-booking-system-98447.firebasestorage.app",
  messagingSenderId: "1057693391901",
  appId: "1:1057693391901:web:ec7aa85862a6495afffaf4",
  measurementId: "G-L8M186C6ET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
