import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Firebase Analytics solo se puede usar en el cliente (browser)
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Firebase Auth
const auth = getAuth(app);

// Firestore Database
const db = getFirestore(app);

// Connect to emulators in development (opcional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Emulator connections only run once
  try {
    if (!auth._delegate._config.emulator) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    }
  } catch {
    // Emulator already connected
  }
  
  try {
    if (!db._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch {
    // Emulator already connected
  }
}

export { app, analytics, auth, db };
