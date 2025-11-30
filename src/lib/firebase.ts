// In a real application, you would initialize Firebase here and use environment variables.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "peerconnect-20kln",
  "appId": "1:875432017464:web:b2392f79dd2a48e99730cd",
  "storageBucket": "peerconnect-20kln.firebasestorage.app",
  "apiKey": "AIzaSyDhR9UJWlfO2aO7DiREV1RhSYRNzYAcZ0I",
  "authDomain": "peerconnect-20kln.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "875432017464"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
