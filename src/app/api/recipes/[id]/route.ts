/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/recipes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';

interface Params {
  params: {
    id: string;
  };
}

// --- GET /api/recipes/[id] ---
// Obtiene una receta específica por su ID, verificando el propietario.
export async function GET(
  request: NextRequest,
  { params }: Params // Usamos la interfaz definida
) {
  try {
    const recipeId = params.id;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Falta el ID de la receta en la URL.' },
        { status: 400 }
      );
    }

    // Obtener el ID token del encabezado de autorización
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Formato de autorización inválido.' },
        { status: 401 }
      );
    }

    const idToken = authorization.split(' ')[1];
    let uid: string;

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      uid = decodedToken.uid;
    } catch (authError) {
      console.error('Error al verificar el token:', authError);
      return NextResponse.json(
        { error: 'Token inválido o expirado.' },
        { status: 401 }
      );
    }

    const docRef = db.collection('created_recipes').doc(recipeId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return NextResponse.json(
        { error: 'Receta no encontrada.' },
        { status: 404 }
      );
    }

    const recipeData = docSnapshot.data();

    if (recipeData?.user_id !== uid) {
      return NextResponse.json(
        { error: 'No tienes permiso para acceder a esta receta.' },
        { status: 403 }
      );
    }

    // Eliminar campos sensibles antes de devolver
    const { user_id, ...safeRecipeData } = recipeData;

    return NextResponse.json(
      {
        id: docSnapshot.id,
        ...safeRecipeData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al obtener la receta:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}