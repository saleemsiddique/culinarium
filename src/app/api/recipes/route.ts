/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/recipes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, auth, admin } from '@/lib/firebase-admin'; // Import 'admin' for FieldValue

// --- POST /api/recipes ---
// Guarda una nueva receta en Firestore
export async function POST(request: NextRequest) {
  try {
    const { recipe, idToken } = await request.json();

    if (!recipe || !idToken) {
      return NextResponse.json({ error: 'Faltan datos de la receta o el token de autenticación.' }, { status: 400 });
    }

    let uid: string | null = null;
    try {
      // Verify ID token using Firebase Admin Auth
      const decodedToken = await auth.verifyIdToken(idToken);
      uid = decodedToken.uid;
    } catch (authError) {
      console.error('Error al verificar el token de autenticación:', authError);
      return NextResponse.json({ error: 'Token de autenticación inválido o expirado.' }, { status: 401 });
    }

    if (!uid) {
      return NextResponse.json({ error: 'No se pudo obtener el ID de usuario del token.' }, { status: 401 });
    }

    // Add user_id to the recipe before saving it
    const recipeWithUserId = {
      ...recipe,
      user_id: uid,
      created_at: admin.firestore.FieldValue.serverTimestamp(), // Corrected: Use admin.firestore.FieldValue
    };

    const docRef = await db.collection('created_recipes').add(recipeWithUserId);

    return NextResponse.json({ message: 'Receta guardada exitosamente', id: docRef.id, recipe: recipeWithUserId }, { status: 201 });
  } catch (error: any) {
    console.error('Error al guardar la receta:', error);
    return NextResponse.json({ error: 'Error interno del servidor al guardar la receta.', details: error.message }, { status: 500 });
  }
}

// --- GET /api/recipes ---
// Gets all recipes for a specific user (requires idToken)
export async function GET(request: NextRequest) {
  try {
    // Get ID token from Authorization header
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json({ error: 'No se proporcionó token de autenticación.' }, { status: 401 });
    }

    let uid: string | null = null;
    try {
      // Verify ID token using Firebase Admin Auth
      const decodedToken = await auth.verifyIdToken(idToken);
      uid = decodedToken.uid;
    } catch (authError) {
      console.error('Error al verificar el token de autenticación:', authError);
      return NextResponse.json({ error: 'Token de autenticación inválido o expirado.' }, { status: 401 });
    }

    if (!uid) {
      return NextResponse.json({ error: 'No se pudo obtener el ID de usuario del token.' }, { status: 401 });
    }

    // Query Firestore for recipes belonging to the authenticated user
    const recipesSnapshot = await db.collection('created_recipes')
      .where('user_id', '==', uid)
      .orderBy('created_at', 'desc') // Order by creation date
      .get();

    const recipes = recipesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ recipes }, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener las recetas:', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener las recetas.', details: error.message }, { status: 500 });
  }
}