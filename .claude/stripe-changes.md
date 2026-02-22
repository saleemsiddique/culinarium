# Culinarium — Stripe Changes

## Price IDs Actuales

| ID | Nombre | Tipo | Tokens | Precio | Estado |
|----|--------|------|--------|--------|--------|
| `price_1RwHJCRpBiBhmezm4D1fPQt5` | Culinarium premium | Suscripción | 300 | €7.99/mes | **DEPRECAR** |
| `price_1RwHKLRpBiBhmezmK1AybT5C` | Pack 30 tokens | Único | 30 | €0.99 | Archivar |
| `price_1RwHL6RpBiBhmezmsEhJyMC1` | Pack 60 Tokens | Único | 60 | €1.99 | Archivar |
| `price_1RwHLWRpBiBhmezmY3vPGDxT` | Pack 120 Tokens | Único | 120 | €3.49 | Archivar |
| `price_1RwHLrRpBiBhmezmFamEW9Ct` | Pack 250 Tokens | Único | 250 | €6.49 | Archivar |
| `price_1RwHMCRpBiBhmezmRzyb4DAm` | Pack 600 Tokens | Único | 600 | €13.99 | Archivar |
| `price_1RwHMbRpBiBhmezmgyMbGrJq` | Pack 1200 Tokens | Único | 1200 | €24.99 | Archivar |

## Nuevos Prices a Crear (en Stripe Dashboard)

### 1. Premium €9.99/mes
- **Producto:** "Culinarium Premium"
- **Tipo:** Recurring — monthly
- **Precio:** €9.99
- **Tokens:** 999 (por decisión de webhook, no de Stripe)
- **Metadata:** `tokens: 999, name: "Culinarium Premium"`

### 2. Pack Pay-as-you-go €4.99
- **Producto:** "Culinarium Pack Recetas"
- **Tipo:** One-time
- **Precio:** €4.99
- **Tokens:** 150 (= 15 recetas)
- **Metadata:** `tokens: 150, name: "Pack 15 Recetas"`

## Cambios en Código

### `src/app/api/stripe-webhook/route.ts`
```typescript
const PRICE_TO_TOKENS = {
  // Premium €9.99 (nuevo)
  [process.env.STRIPE_PRICE_PREMIUM!]: {
    type: "subscription",
    tokens: 999,
    name: "Culinarium Premium",
    isSubscription: true,
    price: 9.99,
  },
  // Legacy Premium €7.99 (mantener para suscriptores existentes)
  price_1RwHJCRpBiBhmezm4D1fPQt5: {
    type: "subscription",
    tokens: 300,
    name: "Culinarium Premium Legacy",
    isSubscription: true,
    price: 7.99,
  },
  // Pack único €4.99 (nuevo)
  [process.env.STRIPE_PRICE_PAYG!]: {
    type: "tokens",
    tokens: 150,
    name: "Pack 15 Recetas",
    isSubscription: false,
    price: 4.99,
  },
};
```

### `invoice.payment_succeeded` — tokens dinámicos
Cambiar hardcoded `monthly_tokens: 300` por el valor del plan del usuario:
```typescript
// Obtener el precio de la suscripción para determinar los tokens
const subscription = await stripe.subscriptions.retrieve(invoice.parent.subscription_details.subscription);
const priceId = subscription.items.data[0]?.price?.id;
const planConfig = PRICE_TO_TOKENS[priceId];
const tokensToReset = planConfig?.tokens ?? 300;

await userDoc.ref.update({
  monthly_tokens: tokensToReset,
  ...
});
```

## Variables de Entorno Necesarias

Añadir a `.env.local` y a Vercel:
```
STRIPE_PRICE_PREMIUM=price_XXXXX  # nuevo precio €9.99
STRIPE_PRICE_PAYG=price_YYYYY     # pack €4.99
```

## ⚠️ Suscriptores Actuales en €7.99

1. Exportar lista de `user` donde `isSubscribed: true && subscriptionStatus: 'active'`
2. Enviar email informando del cambio 30 días antes
3. Migrar suscripciones manualmente o vía Stripe Migration API
