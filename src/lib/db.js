// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJnR3VhBBjEP5gaQPfqyRMWqoIDP6Aj8c",
  authDomain: "culinarium-cd1f5.firebaseapp.com",
  projectId: "culinarium-cd1f5",
  storageBucket: "culinarium-cd1f5.firebasestorage.app",
  messagingSenderId: "154946523567",
  appId: "1:154946523567:web:ab0bf73456e81077b11f5a",
  measurementId: "G-BXZS1XQGEB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);