// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB1LhspDeYvaKv3GHPbDZG4dKvaLShN0Hw",
  authDomain: "weflash-72de2.firebaseapp.com",
  projectId: "weflash-72de2",
  storageBucket: "weflash-72de2.firebasestorage.app",
  messagingSenderId: "639168759122",
  appId: "1:639168759122:web:792b7d7613fc96c1da268b",
  measurementId: "G-W930ZDZPCX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence);

export const provider = new GoogleAuthProvider();

