// app/api/subscription/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId es requerido' },
        { status: 400 }
      );
    }

    // Solo cancelamos en Stripe; no tocamos Firestore aquí
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Obtener el período actual del primer item de suscripción
    const currentPeriodEnd = canceledSubscription.items?.data[0]?.current_period_end || null;
    return NextResponse.json({
      success: true,
      message: 'Suscripción marcada para cancelarse al final del período',
      subscription: {
        id: canceledSubscription.id,
        cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
        currentPeriodEnd: currentPeriodEnd,
      },
    });
  } catch (error: any) {
    console.error('Error al cancelar suscripción:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
