// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDdPlDxuH5yHIC1hEV1-Dyg6ihTB5bJMmA",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "mediconnect-dc8e8",
  storageBucket: "mediconnect-dc8e8.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:1040551335338:android:49bd5836bff3f822d147d3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };