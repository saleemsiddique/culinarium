# Culinarium — Master Action Plan (vivo)

> Actualizado: 2026-02-22

## Sprint 1 — SEGURIDAD CRÍTICA ✅

- [x] Auth en `/api/recipe-image`
- [x] IDOR fix en `/api/billing` (auth + uid === userId)
- [x] Auth en `/api/payment-methods/delete` + verificar ownership
- [x] Auth en `/api/payment-methods/default`
- [x] Auth en `/api/payment-methods/attach`
- [x] Race condition en `/api/deduct-tokens` → Firestore transaction
- [x] Idempotencia en `/api/stripe-webhook` (colección `processed_webhooks`)
- [x] Auth en `/api/embedded-checkout`
- [x] Validar tokens server-side en `/api/openai` antes de llamar OpenAI
- [x] Timeout 30s en `/api/openai`
- [x] Mejoras al prompt: max_tokens, steps por dificultad, título creativo, Celsius

## Sprint 2 — SEO CRÍTICO ✅

- [x] Fix `lang="es"` en `src/app/layout.tsx`
- [x] Crear `public/og-image.png` 1200×630
- [x] H1 en `src/components/hero.tsx`
- [x] Metadata en `/kitchen`, `/profile`, `/auth/*` pages
- [x] JSON-LD Organization + WebApplication en layout
- [x] JSON-LD FAQPage + PriceRange en páginas
- [x] Sitemap completar con `/consent/*`
- [x] hreflang alternates en layout
- [x] `<img>` → `<Image>` en recipes/list

## Sprint 3 — MONETIZACIÓN ✅

- [x] Actualizar stripe-webhook: nuevo price Chef Pro, tokens dinámicos
- [x] Reemplazar "tokens" → "recetas" en i18n ES + EN
- [x] Actualizar `pricing.tsx` a 3 planes
- [x] CTA → `/auth/register` en pricing y hero
- [x] Actualizar `PremiumModal.tsx` (eliminar €7.99 hardcodeado)
- [x] Actualizar `TokensModal.tsx` a 1 pack €4.99
- [x] Actualizar `header.tsx` para mostrar recetas (`floor(tokens/10)`)

## Sprint 4 — CONSENTIMIENTO GDPR + ONBOARDING ✅

- [x] Rediseñar `ConsentModal.tsx` (Rechazar, granular, ARIA, focus trap)
- [x] Llamar `/api/consent/link` tras login/loginWithGoogle en user-context
- [x] Fix redirección post-registro a `?onboarding=1` (ya existe en AuthForm/SocialAuth)
- [x] Rediseñar onboarding (4 pasos sin tokens, con brand colors)
- [x] Crear `src/app/error.tsx`
- [x] Crear `src/app/loading.tsx`
- [x] Mejorar empty state de recetas

## Sprint 5 — DISEÑO + LANZAMIENTO ✅ (parcial)

- [ ] Mejoras landing (`src/app/page.tsx` + `hero.tsx`) — pendiente
- [x] `next.config.ts` con security headers + WebP/AVIF image optimization
- [x] Actualizar `resend` → ^4.8.0 (estable, antes era 6.2.0-preview)
- [x] Actualizar README.md con stack real
- [x] `tsconfig.json` excluir `scripts/` de compilación
- [ ] Test E2E con Playwright — pendiente

## ⭐ Stripe ✅ (hecho en sesión 2)

- [x] Crear precio Premium €9.99/mes → `price_1T3Px2RpBiBhmezmuzwSwoki` (`STRIPE_PRICE_PREMIUM`)
- [x] Crear precio Premium Anual €79.99/año → `price_1T3Px8RpBiBhmezmwz57sixq` (`STRIPE_PRICE_PREMIUM_ANNUAL`)
- [x] Crear pack pay-as-you-go €4.99 (150 tokens) → `price_1T3PxZRpBiBhmezm2Gu9MNHA` (`STRIPE_PRICE_PAYG`)

## Pendiente — Configuración Producción

- [ ] Añadir las 6 env vars de Stripe en Vercel dashboard (producción):
  - `STRIPE_PRICE_PREMIUM` + `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM`
  - `STRIPE_PRICE_PREMIUM_ANNUAL` + `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL`
  - `STRIPE_PRICE_PAYG` + `NEXT_PUBLIC_STRIPE_PRICE_PAYG`
- [ ] Stripe Dashboard → Settings → Branding: subir logo, color `#F97316`

## Pendiente — Landing & Contenido

- [x] Rediseño landing: hero dark editorial, wizard form 3 pasos, page.tsx restructurado, fonts DM Sans + Fraunces
- [ ] Bloque 4c — Testimonios (placeholders realistas)
- [ ] Bloque 5b — Modal post-primera-receta (`FirstRecipeModal.tsx`)

## Pendiente — Analytics & QA

- [ ] Configurar Google Analytics 4 + Search Console (Bloque 7)
- [ ] Test E2E flujo completo: registro → kitchen → generar receta → upgrade

## Pendiente — Lanzamiento

- [ ] ProductHunt: preparar ficha (logo 240px, screenshots, GIF demo)
- [ ] Reddit r/SideProject, r/spain, r/cocina
- [ ] Hacker News: "Show HN"
