# Culinarium — Project Overview

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15.3.4 (App Router) |
| Estilos | Tailwind CSS 4 + DaisyUI 5 |
| Auth | Firebase Authentication (email/password + Google) |
| DB | Firestore (Firebase Admin SDK en servidor) |
| IA recetas | OpenAI GPT-4 Turbo (json_object mode) |
| IA imágenes | DALL-E 3 (fallback: gpt-image-1) |
| Pagos | Stripe (Checkout hosted, Webhooks, SetupIntents) |
| Email | Resend (`6.2.0-preview` — actualizar a estable) |
| Analytics | Vercel Analytics (gated por consentimiento) |
| Deploy | Vercel |
| i18n | react-i18next, locales en `/public/locales/{es,en}/translation.json` |

## Funcionalidades Principales

- Generador de recetas personalizado (ingredientes, utensilios, restricciones, macros, estilo cocina, dificultad)
- Imagen automática con DALL-E 3 para cada receta generada
- Sistema de tokens: 10 tokens = 1 receta; monthly + extra tokens
- Plan Gratuito: 50 tokens/mes (5 recetas)
- Plan Premium: €7.99/mes → migrar a €9.99/mes con 300 tokens (30 recetas)
- Packs de tokens extra: 6 SKUs → simplificar a 1 pack €4.99 (150 tokens = 15 recetas)
- Historial de recetas con filtros (ingrediente, tipo, fecha)
- Perfil de usuario con facturación y gestión de tarjetas
- Sistema de consentimiento GDPR con cookies, analytics y newsletter separados
- Onboarding modal de 4 pasos para nuevos usuarios

## Estructura de Datos Firestore

```
user/{uid}/
  - email, firstName, lastName
  - monthly_tokens: number (reset mensual)
  - extra_tokens: number
  - isSubscribed: boolean
  - subscriptionStatus: string
  - subscriptionId: string
  - stripeCustomerId: string
  - lastRenewal: Timestamp
  - created_at: Timestamp
  - created_recipes: number (contador)

user/{uid}/subscripcion/{id}/
  - subscriptionId, status, planName, price, tokensIncluded
  - createdAt, updatedAt, endsAt, lastRenewal

user/{uid}/token_purchases/{id}/
  - productName, tokensAmount, sessionId, priceId, price, status, createdAt
```

## Archivos Clave

| Ruta | Descripción |
|------|-------------|
| `src/app/api/openai/route.ts` | Generación de recetas con GPT-4 Turbo |
| `src/app/api/recipe-image/route.ts` | Imagen con DALL-E 3 |
| `src/app/api/stripe-webhook/route.ts` | Manejo eventos Stripe |
| `src/app/api/deduct-tokens/route.ts` | Descuento de tokens (transacción Firestore) |
| `src/context/user-context.tsx` | Estado global de usuario |
| `src/components/ConsentModal.tsx` | Modal GDPR |
| `src/components/pricing.tsx` | Página de precios |
| `src/components/onboarding.tsx` | Onboarding 4 pasos |

## Deuda Técnica Detectada

### Crítica (bloquea lanzamiento)
- `resend` en versión preview (`6.2.0-preview`) — actualizar a estable
- Múltiples endpoints sin autenticación (ver security-audit)
- Race condition en `/api/deduct-tokens`
- Webhook Stripe sin idempotencia

### Alta
- Abstracción "tokens" confusa → migrar a "recetas" en UI
- Onboarding no se muestra automáticamente (ya arreglado en AuthForm/SocialAuth)
- PremiumModal con precio hardcodeado €7.99
- CTA landing va a `/auth/login` en vez de `/auth/register`

### Media
- `next.config.ts` vacío — sin optimizaciones de imagen ni headers de seguridad
- HTML `lang="en"` cuando el contenido es español
- `og-image.png` referenciada pero no existe en `/public`
- Ingredientes en `commonIngredients` tienen los idiomas cruzados (es↔en swapped)
