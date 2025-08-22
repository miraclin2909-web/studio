// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "teacher-attendance-track-3o694",
  appId: "1:620617620811:web:2eed0ff7adfe940fa81cce",
  storageBucket: "teacher-attendance-track-3o694.firebasestorage.app",
  apiKey: "AIzaSyB4nw6A7LQ5HtkNbZHO8KF7nNOfGzLZTH4",
  authDomain: "teacher-attendance-track-3o694.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "620617620811",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
