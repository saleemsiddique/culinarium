/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'No se proporcionó ID de sesión' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({ 
      session: {
        status: session.status
      }
    });

  } catch (error: any) {
    console.error('Error retrieving session:', error);
    return NextResponse.json({ 
      error: 'Error al verificar la sesión de pago',
      details: error.message 
    }, { status: 500 });
  }
}
