/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/recipes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';

// Define el tipo del contexto de la ruta para acceder a los parámetros
interface Context {
  params: {
    id: string;
  };
}

// --- GET /api/recipes/[id] ---
// Obtiene una receta específica por su ID, verificando el propietario.
export async function GET(request: NextRequest, context: Context) {
  try {
    const recipeId = context.params.id;

    if (!recipeId) {
      return NextResponse.json({ error: 'Falta el ID de la receta en la URL.' }, { status: 400 });
    }

    // Obtener el ID token del encabezado de autorización
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json({ error: 'No se proporcionó token de autenticación.' }, { status: 401 });
    }

    let uid: string;
    try {
      // Verificar el token para obtener el UID del usuario
      const decodedToken = await auth.verifyIdToken(idToken);
      uid = decodedToken.uid;
    } catch (authError) {
      console.error('Error al verificar el token de autenticación:', authError);
      return NextResponse.json({ error: 'Token de autenticación inválido o expirado.' }, { status: 401 });
    }

    // Referencia al documento de la receta en Firestore
    const docRef = db.collection('created_recipes').doc(recipeId);
    const docSnapshot = await docRef.get();

    // 1. Verificar si la receta existe
    if (!docSnapshot.exists) {
      return NextResponse.json({ error: 'Receta no encontrada.' }, { status: 404 });
    }

    const recipeData = docSnapshot.data();

    // 2. Verificar que el usuario sea el propietario de la receta
    if (recipeData?.user_id !== uid) {
      return NextResponse.json({ error: 'Acceso denegado. No eres el propietario de esta receta.' }, { status: 403 });
    }

    const recipeWithId = {
      id: docSnapshot.id,
      ...recipeData,
    };

    return NextResponse.json({ recipe: recipeWithId }, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener la receta:', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener la receta.', details: error.message }, { status: 500 });
  }
}