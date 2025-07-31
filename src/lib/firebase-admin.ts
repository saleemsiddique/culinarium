/* eslint-disable @typescript-eslint/no-explicit-any */

// lib/firebase-admin.ts
import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

let firebaseAdminApp: App;

// Verificar si la aplicación ya ha sido inicializada para evitar errores en Next.js (hot-reloading)
if (getApps().length === 0) {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    const missingVars = [];
    if (!process.env.FIREBASE_PROJECT_ID) missingVars.push('FIREBASE_PROJECT_ID');
    if (!process.env.FIREBASE_CLIENT_EMAIL) missingVars.push('FIREBASE_CLIENT_EMAIL');
    if (
      !process.env.FIREBASE_PRIVATE_KEY ||
      process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').trim() === ''
    ) {
      missingVars.push('FIREBASE_PRIVATE_KEY');
    }
    throw new Error(
      `Missing required Firebase Admin SDK environment variables: ${missingVars.join(', ')}. Please check your .env file.`
    );
  }

  try {
    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (initError: any) {
    console.error('ERROR: Failed to initialize Firebase Admin SDK:', initError.message);
    console.error('Full initialization error details:', initError);
    throw new Error(`Firebase Admin SDK initialization failed: ${initError.message}`);
  }
} else {
  firebaseAdminApp = getApps()[0];
  console.log('Firebase Admin SDK already initialized (retrieved existing app).');
}

// ✅ Usar const porque no se reasignan
const dbInstance: Firestore = getFirestore(firebaseAdminApp);
const authInstance: Auth = getAuth(firebaseAdminApp);

export const db = dbInstance;
export const auth = authInstance;
export { admin };
