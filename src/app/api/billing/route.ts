// app/api/billing/route.ts

import { NextResponse } from 'next/server';
import { stripe } from "@/lib/stripe"; // Asegúrate de que tu instancia de Stripe esté bien configurada
import { db } from "@/lib/firebase-admin"; // Tu instancia de Firebase Admin

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 1. Verificar si el ID de usuario existe
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 2. Buscar el documento del usuario en la base de datos
    const userDoc = await db.collection("user").doc(userId).get();
    
    // Si el usuario no existe o no tiene un customerId, devolver un array vacío
    if (!userDoc.exists) {
      return NextResponse.json({ invoices: [] });
    }

    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    // Si el usuario existe pero no tiene un customerId, devolver un array vacío
    if (!customerId) {
      return NextResponse.json({ invoices: [] });
    }

    // 3. Obtener la lista de facturas de Stripe
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10, // Puedes ajustar el límite según tus necesidades
    });

    console.log(invoices.data);

    // 4. Devolver solo los datos de las facturas
    return NextResponse.json({
      invoices: invoices.data,
    });

  } catch (error) {
    console.error('Stripe API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}