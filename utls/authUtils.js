import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../Src/config/firebaseConfig'

export const monitorAuthState = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is signed in:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Anonymous",
      });
    } else {
      console.log("No user is signed in.");
    }
  });
};