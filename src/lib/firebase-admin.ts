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
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      ...(storageBucket ? { storageBucket } : {}),
    });
    if (!storageBucket) {
      console.warn('WARN: FIREBASE_STORAGE_BUCKET no está configurado. Storage usará el bucket por defecto si existe.');
    }
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (initError: unknown) { // Cambiado 'any' a 'unknown' para mayor seguridad de tipos
    let errorMessage = 'An unknown error occurred during Firebase Admin SDK initialization.';
    if (initError instanceof Error) {
        errorMessage = initError.message;
    }
    console.error('ERROR: Failed to initialize Firebase Admin SDK:', errorMessage);
    console.error('Full initialization error details:', initError);
    // Volver a lanzar el error para asegurar que el servidor no se inicie con una configuración de Firebase Admin rota
    throw new Error(`Firebase Admin SDK initialization failed: ${errorMessage}`);
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
