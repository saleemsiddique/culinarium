/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Cantidad de tokens inválida' }, { status: 400 });
    }

    // Get and verify the authentication token
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

    // Get the user's current token data
    const userRef = db.collection('user').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (!userData) {
      return NextResponse.json({ error: 'Datos de usuario no válidos' }, { status: 404 });
    }

    const currentMonthlyTokens = userData.monthly_tokens || 0;
    const currentExtraTokens = userData.extra_tokens || 0;
    const totalTokens = currentMonthlyTokens + currentExtraTokens;

    // Check if user has enough tokens
    if (totalTokens < amount) {
      return NextResponse.json({ 
        error: 'Tokens insuficientes',
        required: amount,
        available: totalTokens 
      }, { status: 400 });
    }

    // Deduct tokens - monthly tokens first, then extra tokens
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
      remainingToDeduct -= deductFromExtra;
    }

    // Update the user document with new token values
    await userRef.update({
      monthly_tokens: newMonthlyTokens,
      extra_tokens: newExtraTokens,
    });

    console.log(`✅ Tokens deducidos para usuario ${uid}: ${amount} tokens. Nuevos valores: monthly=${newMonthlyTokens}, extra=${newExtraTokens}`);

    return NextResponse.json({
      message: 'Tokens deducidos correctamente',
      deducted: amount,
      updatedUser: {
        monthly_tokens: newMonthlyTokens,
        extra_tokens: newExtraTokens,
      }
    });

  } catch (error: any) {
    console.error('Error al descontar tokens:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor al descontar tokens',
      details: error.message 
    }, { status: 500 });
  }
}
