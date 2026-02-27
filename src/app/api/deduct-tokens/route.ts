/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let uid: string;

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      uid = decodedToken.uid;
    } catch (authError) {
      console.error('Error al verificar el token de autenticación:', authError);
      return NextResponse.json({ error: 'Token de autenticación inválido' }, { status: 401 });
    }

    const userRef = db.collection('user').doc(uid);

    // Usar Firestore transaction para evitar race condition
    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDoc.data();
      if (!userData) {
        throw new Error('Datos de usuario no válidos');
      }

      const currentMonthlyRecipes = userData.monthly_recipes || 0;
      const currentExtraRecipes = userData.extra_recipes || 0;
      const totalRecipes = currentMonthlyRecipes + currentExtraRecipes;

      if (totalRecipes < amount) {
        throw new Error(`Recetas insuficientes: disponible=${totalRecipes}, requerido=${amount}`);
      }

      let remainingToDeduct = amount;
      let newMonthlyRecipes = currentMonthlyRecipes;
      let newExtraRecipes = currentExtraRecipes;

      // Deducir primero de monthly, luego de extra
      if (remainingToDeduct > 0 && newMonthlyRecipes > 0) {
        const deductFromMonthly = Math.min(remainingToDeduct, newMonthlyRecipes);
        newMonthlyRecipes -= deductFromMonthly;
        remainingToDeduct -= deductFromMonthly;
      }

      if (remainingToDeduct > 0 && newExtraRecipes > 0) {
        const deductFromExtra = Math.min(remainingToDeduct, newExtraRecipes);
        newExtraRecipes -= deductFromExtra;
      }

      transaction.update(userRef, {
        monthly_recipes: newMonthlyRecipes,
        extra_recipes: newExtraRecipes,
      });

      return { newMonthlyRecipes, newExtraRecipes };
    });

    return NextResponse.json({
      message: 'Receta deducida correctamente',
      deducted: amount,
      updatedUser: {
        monthly_recipes: result.newMonthlyRecipes,
        extra_recipes: result.newExtraRecipes,
      }
    });

  } catch (error: any) {
    console.error('Error al descontar receta:', error);

    if (error.message?.includes('Recetas insuficientes')) {
      return NextResponse.json({ error: 'Recetas insuficientes' }, { status: 400 });
    }
    if (error.message === 'Usuario no encontrado') {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Error interno del servidor al descontar receta',
      details: error.message
    }, { status: 500 });
  }
}
