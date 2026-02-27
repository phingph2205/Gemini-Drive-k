import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHkOjhz19b4vIrmVtrOB-rjRC8aPgdp8M",
  authDomain: "gemini-drive-f5c95.firebaseapp.com",
  projectId: "gemini-drive-f5c95",
  storageBucket: "gemini-drive-f5c95.firebasestorage.app",
  messagingSenderId: "809143945404",
  appId: "1:809143945404:web:21d990f00deed1068f28b9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
