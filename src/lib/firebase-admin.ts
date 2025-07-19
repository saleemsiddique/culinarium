// lib/firebase-admin.ts
// Importar funciones específicas de firebase-admin
import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth'; // Importar getAuth para la autenticación de Admin SDK

// Importar el módulo completo de firebase-admin para FieldValue y otras utilidades si es necesario
// Esto es importante porque 'admin.firestore.FieldValue' se usa en tus rutas API.
import * as admin from 'firebase-admin';

let firebaseAdminApp: App;
let dbInstance: Firestore;
let authInstance: Auth;

// Verificar si la aplicación ya ha sido inicializada para evitar errores en Next.js (hot-reloading)
if (getApps().length === 0) {
  // Verificar que todas las variables de entorno necesarias estén presentes.
  // Es crucial que estos valores no sean undefined o vacíos.
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    const missingVars = [];
    if (!process.env.FIREBASE_PROJECT_ID) missingVars.push('FIREBASE_PROJECT_ID');
    if (!process.env.FIREBASE_CLIENT_EMAIL) missingVars.push('FIREBASE_CLIENT_EMAIL');
    // Check if privateKey is empty after replacement, not just undefined
    if (!process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').trim() === '') {
      missingVars.push('FIREBASE_PRIVATE_KEY');
    }
    throw new Error(`Missing required Firebase Admin SDK environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
  }

  try {
    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Asegurarse de que los saltos de línea se interpreten correctamente
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (initError: any) {
    console.error('ERROR: Failed to initialize Firebase Admin SDK:', initError.message);
    console.error('Full initialization error details:', initError);
    // Re-throw the error to ensure the server doesn't start with a broken Firebase Admin setup
    throw new Error(`Firebase Admin SDK initialization failed: ${initError.message}`);
  }
} else {
  // Si ya está inicializada, obtener la primera instancia
  firebaseAdminApp = getApps()[0];
  console.log('Firebase Admin SDK already initialized (retrieved existing app).');
}

// Obtener las instancias de Firestore y Auth del Admin SDK
dbInstance = getFirestore(firebaseAdminApp);
authInstance = getAuth(firebaseAdminApp);

// Exportar las instancias y el módulo admin completo
export const db = dbInstance;
export const auth = authInstance;
export { admin }; // Exportar el módulo 'admin' completo para FieldValue, etc.