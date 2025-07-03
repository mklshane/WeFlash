// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export const provider = new GoogleAuthProvider();

