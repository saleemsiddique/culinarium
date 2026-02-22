/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Cantidad de tokens inválida' }, { status: 400 });
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
    // Dos requests simultáneos no pueden consumir los mismos tokens
    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDoc.data();
      if (!userData) {
        throw new Error('Datos de usuario no válidos');
      }

      const currentMonthlyTokens = userData.monthly_tokens || 0;
      const currentExtraTokens = userData.extra_tokens || 0;
      const totalTokens = currentMonthlyTokens + currentExtraTokens;

      if (totalTokens < amount) {
        throw new Error(`Tokens insuficientes: disponible=${totalTokens}, requerido=${amount}`);
      }

      let remainingToDeduct = amount;
      let newMonthlyTokens = currentMonthlyTokens;
      let newExtraTokens = currentExtraTokens;

      if (remainingToDeduct > 0 && newMonthlyTokens > 0) {
        const deductFromMonthly = Math.min(remainingToDeduct, newMonthlyTokens);
        newMonthlyTokens -= deductFromMonthly;
        remainingToDeduct -= deductFromMonthly;
      }

      if (remainingToDeduct > 0 && newExtraTokens > 0) {
        const deductFromExtra = Math.min(remainingToDeduct, newExtraTokens);
        newExtraTokens -= deductFromExtra;
      }

      transaction.update(userRef, {
        monthly_tokens: newMonthlyTokens,
        extra_tokens: newExtraTokens,
      });

      return { newMonthlyTokens, newExtraTokens };
    });

    return NextResponse.json({
      message: 'Tokens deducidos correctamente',
      deducted: amount,
      updatedUser: {
        monthly_tokens: result.newMonthlyTokens,
        extra_tokens: result.newExtraTokens,
      }
    });

  } catch (error: any) {
    console.error('Error al descontar tokens:', error);

    if (error.message?.includes('Tokens insuficientes')) {
      return NextResponse.json({ error: 'Tokens insuficientes' }, { status: 400 });
    }
    if (error.message === 'Usuario no encontrado') {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Error interno del servidor al descontar tokens',
      details: error.message
    }, { status: 500 });
  }
}
