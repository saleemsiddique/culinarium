/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/recipes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, auth, admin } from '@/lib/firebase-admin';

export async function GET(req: Request, { params }: any) {
  const { id } = params as { id: string };

  try {
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID de la receta en la URL.' }, { status: 400 });
    }

    // Obtener el ID token del encabezado de autorización
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json({ error: 'No se proporcionó token de autenticación.' }, { status: 401 });
    }

    let uid: string;
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      uid = decodedToken.uid;
    } catch (authError) {
      console.error('Error al verificar el token de autenticación:', authError);
      return NextResponse.json({ error: 'Token de autenticación inválido o expirado.' }, { status: 401 });
    }

    const docRef = db.collection('created_recipes').doc(id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return NextResponse.json({ error: 'Receta no encontrada.' }, { status: 404 });
    }

    const recipeData = docSnapshot.data();

    if (recipeData?.user_id !== uid) {
      return NextResponse.json({ error: 'Acceso denegado. No eres el propietario de esta receta.' }, { status: 403 });
    }

    return NextResponse.json(
      { recipe: { id: docSnapshot.id, ...recipeData } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al obtener la receta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener la receta.', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/recipes/[id] - Update an existing recipe (e.g., add image)
export async function PUT(req: NextRequest, { params }: any) {
  const { id } = params as { id: string };

  try {
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID de la receta en la URL.' }, { status: 400 });
    }

    const body = await req.json();
    const { recipe, idToken } = body;

    if (!recipe || !idToken) {
      return NextResponse.json({ error: 'Faltan datos de la receta o el token de autenticación.' }, { status: 400 });
    }

    // Verify authentication
    let uid: string;
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      uid = decodedToken.uid;
    } catch (authError) {
      console.error('Error al verificar el token de autenticación:', authError);
      return NextResponse.json({ error: 'Token de autenticación inválido o expirado.' }, { status: 401 });
    }

    // Check if recipe exists and user owns it
    const docRef = db.collection('created_recipes').doc(id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return NextResponse.json({ error: 'Receta no encontrada.' }, { status: 404 });
    }

    const existingData = docSnapshot.data();
    if (existingData?.user_id !== uid) {
      return NextResponse.json({ error: 'Acceso denegado. No eres el propietario de esta receta.' }, { status: 403 });
    }

    // Update the recipe with new data (preserve original timestamps and user_id)
    const updatedRecipe = {
      ...recipe,
      user_id: uid,
      created_at: existingData?.created_at, // Preserve original creation timestamp
      updated_at: admin.firestore.FieldValue.serverTimestamp(), // Add update timestamp
    };

    await docRef.update(updatedRecipe);

    console.log(`✅ Receta ${id} actualizada exitosamente para usuario ${uid}`);

    return NextResponse.json({ 
      message: 'Receta actualizada exitosamente', 
      id: id, 
      recipe: updatedRecipe 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error al actualizar la receta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar la receta.', details: error.message },
      { status: 500 }
    );
  }
}
