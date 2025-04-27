import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDdPlDxuH5yHIC1hEV1-Dyg6ihTB5bJMmA",
  authDomain: "mediconnect-dc8e8.firebaseapp.com",
  projectId: "mediconnect-dc8e8",
  storageBucket: "mediconnect-dc8e8.appspot.com",
  messagingSenderId: "1040551335338",
  appId: "1:1040551335338:android:49bd5836bff3f822d147d3",
  databaseURL: "https://mediconnect-dc8e8.firebaseio.com"
};

// Initialize Firebase
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export  const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);


// export { db, auth, storage }; 