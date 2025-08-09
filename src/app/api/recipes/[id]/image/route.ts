/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';

type Params = { params: { id: string } };

// PATCH /api/recipes/[id]/image
// Actualiza la receta con una imagen en base64 (data URL). Requiere idToken.
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const { img_url, idToken } = await request.json();

    if (!id || !img_url || !idToken) {
      return NextResponse.json({ error: 'Faltan parámetros: id, img_url o idToken.' }, { status: 400 });
    }

    // Verificar token y obtener uid
    let uid: string | null = null;
    try {
      const decoded = await auth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch (e) {
      console.log('Error al verificar el token de autenticación:', e);
      return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 401 });
    }

    if (!uid) {
      return NextResponse.json({ error: 'No se pudo determinar el usuario.' }, { status: 401 });
    }

    // Verificar propiedad del documento antes de actualizar
    const docRef = db.collection('created_recipes').doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Receta no encontrada.' }, { status: 404 });
    }
    const data = snap.data() as any;
    if (data?.user_id !== uid) {
      return NextResponse.json({ error: 'No autorizado para modificar esta receta.' }, { status: 403 });
    }

    // Actualizar el campo img_url con el data URL base64 (comprimido desde el cliente)
    await docRef.update({ img_url });

    return NextResponse.json({ message: 'Imagen guardada en Firestore (base64).', id, img_url });
  } catch (error: any) {
    console.error('[PATCH /api/recipes/:id/image] Error:', error);
    return NextResponse.json({ error: 'Error al guardar la imagen.', details: error?.message }, { status: 500 });
  }
}


