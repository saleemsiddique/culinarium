import { buffer } from "micro";
import { db } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);

  let event;

  try{
    event= stripe.webhooks.constructEvent(
        buf,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET!
    );
  }catch(err: any){
    console.log('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if(event.type === 'checkout.session.completed'){
    const session = event.data.object;

    const customerId = session.customer;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error('Missing userId in session metadata');
      return res.status(400).send('Missing userId in session metadata');
    }

    await db.collection('users').doc(userId).collection('subscriptions').add({
        customerId,
        sessionId: session.id,
        status: session.status,
        createdAt: new Date(),
    });
  }

  res.json({received: true});
}
