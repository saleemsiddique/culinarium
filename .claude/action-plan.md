# Culinarium — Master Action Plan

> Actualizado: 2026-02-26

## Completado ✅

### Seguridad
- Auth en todos los endpoints (`/api/recipe-image`, `/api/billing`, `/api/payment-methods/*`, etc.)
- Race condition en `/api/deduct-tokens` → Firestore transaction
- Idempotencia en `/api/stripe-webhook` (colección `processed_webhooks`)
- Validación server-side de tokens antes de llamar OpenAI
- Timeout 30s en `/api/openai`

### SEO
- `lang="es"` en layout, H1 en hero, metadata en todas las páginas
- JSON-LD (Organization, WebApplication, FAQPage, PriceRange)
- Sitemap completo, hreflang alternates

### Monetización
- Stripe: Premium €9.99/mes, Anual €79.99/año, PAYG €4.99 (15 recetas)
- Webhook actualizado con `PRICE_TO_TOKENS` y tokens dinámicos
- Precios legacy €7.99 mantenidos para suscriptores existentes

### UI/UX
- Tokens → Recetas en toda la UI y i18n (ES + EN)
- Onboarding rediseñado (4 pasos, brand colors, sin tokens)
- Landing: hero, pricing (3 planes), CTA final, FAQ mejorada
- Formulario kitchen completamente rediseñado:
  - Extraído a hook `useRecipeForm` + sub-componentes en `kitchenForm/`
  - Layout 2 columnas en desktop, 1 en mobile
  - Emojis → iconos lucide-react
  - Tabs de opciones avanzadas (Restricciones, Cocina, Macros, Utensilios)
  - Loading overlay con tips rotativos
- Header: bug "4 4 receta" corregido
- Tipografía: Fraunces (serif) + Plus Jakarta Sans en layout.tsx

### Infraestructura
- `next.config.ts`: security headers + WebP/AVIF optimization
- `resend` actualizado a versión estable
- GDPR: ConsentModal rediseñado, granular, ARIA

---

## Pendiente

### Optimización de Costes IA (-57% por receta)

**Contexto:** Coste actual ~$0.062/receta. Objetivo ~$0.027/receta.

#### Fase A — Migrar texto: GPT-4 Turbo → Claude Sonnet 4.6
**Archivo:** `src/app/api/openai/route.ts`

- [ ] `npm install @anthropic-ai/sdk`
- [ ] Añadir `ANTHROPIC_API_KEY=sk-ant-...` en `.env.local` y en Vercel Dashboard
- [ ] Reemplazar `import OpenAI from 'openai'` → `import Anthropic from '@anthropic-ai/sdk'`
- [ ] Reemplazar `new OpenAI(...)` → `new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })`
- [ ] Reemplazar la llamada `openai.chat.completions.create(...)` por:
  ```typescript
  const message = await withTimeout(
    anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: 'Eres un ayudante de recetas experto, preciso y que sigue instrucciones al pie de la letra. Responde ÚNICAMENTE con JSON válido, sin markdown, sin texto adicional.',
      messages: [{ role: 'user', content: prompt }],
    }),
    30000
  );
  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  ```
- [ ] El prompt completo (en español) se mantiene idéntico, pasa como `messages[0].content`
- [ ] El resto (validación tokens, Firestore counter, parser JSON) no cambia

**Ahorro:** $0.022 → $0.0088 por receta (-60%)

#### Fase B — Optimizar imágenes: Tier por plan
**Archivo:** `src/app/api/recipe-image/route.ts`

- [ ] Determinar tier con los datos de usuario ya leídos:
  ```typescript
  const isPremium = userData?.isSubscribed === true || (userData?.extra_tokens || 0) > 0;
  ```
- [ ] Si `isPremium`: lógica actual (DALL-E 3 1024×1024 + fallback gpt-image-1)
- [ ] Si Free:
  ```typescript
  const result = await openai.images.generate({
    model: 'dall-e-2',
    prompt,
    n: 1,
    size: '512x512',
    response_format: 'b64_json',
  } as any);
  ```
  Si falla: retornar `{ img_url: '' }` (receta se guarda sin imagen, igual que hoy)
- [ ] El contrato de respuesta `{ img_url }` no cambia → sin cambios en frontend

**Ahorro:** $0.040 → $0.018 por receta para usuarios free (-55%)

#### Verificación pre-deploy
- [ ] `npm install @anthropic-ai/sdk` sin conflictos
- [ ] `npx tsc --noEmit` — 0 errores TypeScript
- [ ] Test manual dev: generar receta → JSON válido con estructura `receta.titulo`
- [ ] Test manual dev: imagen free → 512×512 DALL-E 2
- [ ] Test manual dev: imagen premium → 1024×1024 DALL-E 3
- [ ] `npm run build` exitoso
- [ ] `ANTHROPIC_API_KEY` seteada en Vercel antes de deploy

---

### Limpieza y Sincronización de BDD con el Proyecto (tokens → recetas)

#### Contexto y diagnóstico

El modelo de negocio se cambió: los usuarios ven "recetas", pero toda la base de datos sigue almacenando "tokens" (10 tokens internos = 1 receta visible). Hay una capa de traducción `floor(tokens/10)` repartida por todo el código que hay que eliminar para que BDD y lógica hablen el mismo idioma.

**Inventario de inconsistencias detectadas:**

| Dónde | Campo actual | Debe ser | Motivo |
|-------|-------------|----------|--------|
| Firestore `user` doc | `monthly_tokens: 50` | `monthly_recipes: 5` | Free tier = 5 recetas/mes |
| Firestore `user` doc | `monthly_tokens: 999` | `monthly_recipes: 99` | Premium (UI muestra ∞ via `isSubscribed`) |
| Firestore `user` doc | `monthly_tokens: 300` | `monthly_recipes: 30` | Premium legacy €7.99 |
| Firestore `user` doc | `extra_tokens: 150` | `extra_recipes: 15` | Pack PAYG = 15 recetas |
| Firestore `user` doc | `tokens_reset_date` | **eliminar** | Campo zombie: se setea en registro pero nunca se usa para nada — `lastRenewal` hace la misma función |
| Firestore `subscripcion` subdoc | `tokensIncluded` | `recipesIncluded` | Naming |
| Firestore `token_purchases` subdoc | `tokensAmount` | `recipesAmount` | Naming |
| `user-context.tsx` | `CustomUser.extra_tokens` / `monthly_tokens` | `extra_recipes` / `monthly_recipes` | Interface del tipo |
| `user-context.tsx` | `checkAndResetMonthlyTokens` → escribe `monthly_tokens: 50` | `monthly_recipes: 5` | Lógica de reset free |
| `user-context.tsx` | `hasEnoughTokens(10)` | `hasEnoughRecipes(1)` | Semántica |
| `user-context.tsx` | `deductTokens(10)` | `deductRecipes(1)` | Semántica |
| `deduct-tokens/route.ts` | Lee/escribe `monthly_tokens` + `extra_tokens` | `monthly_recipes` + `extra_recipes`, descuenta 1 | Lógica |
| `openai/route.ts` | `TOKENS_PER_RECIPE = 10`, valida `totalTokens < 10` | `totalRecipes < 1`, descuenta 1 | Simplificación |
| `recipe-image/route.ts` | Lee `monthly_tokens` + `extra_tokens` para check | `monthly_recipes` + `extra_recipes` | Consistencia |
| `stripe-webhook/route.ts` | `PRICE_TO_TOKENS` map, escribe `monthly_tokens`, `extra_tokens` | `PRICE_TO_RECIPES`, `monthly_recipes`, `extra_recipes` | Naming + valores /10 |
| `stripe-webhook/route.ts` | Cancel → `monthly_tokens: 50` | `monthly_recipes: 5` | Valor correcto |
| `stripe-webhook/route.ts` | `tokensIncluded`, `tokensAmount` en subdocs | `recipesIncluded`, `recipesAmount` | Naming |
| `stripe-webhook/route.ts` | `invoice.payment_succeeded` → `monthly_tokens: tokensToReset` | `monthly_recipes: Math.floor(tokensToReset/10)` | Conversión |

**Problema adicional — reset free tier es client-side:**
`checkAndResetMonthlyTokens` en `user-context.tsx` escribe directamente en Firestore desde el cliente (sin validación server-side). Si un usuario no hace login en 30 días, sus recetas no se resetean. Debería ser un endpoint server-side o una Cloud Function.

---

#### Fase 1 — Migración de datos en Firestore (script con MCP Firebase)

Conectar al proyecto `culinarium-cd1f5` vía MCP Firebase y ejecutar:

1. **Colección `user` — todos los documentos:**
   - Leer `monthly_tokens` → escribir `monthly_recipes = Math.floor(monthly_tokens / 10)`
   - Leer `extra_tokens` → escribir `extra_recipes = Math.floor(extra_tokens / 10)`
   - Borrar campos `monthly_tokens`, `extra_tokens`, `tokens_reset_date`
   - Verificar que `lastRenewal` existe en todos los docs (fallback: `created_at`)

2. **Subcolección `subscripcion` — todos los documentos de todos los usuarios:**
   - Renombrar `tokensIncluded` → `recipesIncluded` (valor = original / 10)

3. **Subcolección `token_purchases` — todos los documentos de todos los usuarios:**
   - Renombrar `tokensAmount` → `recipesAmount` (valor = original / 10)
   - (Opcional) Renombrar la subcolección a `recipe_purchases` — es costoso en Firestore (re-create docs), evaluar si compensa

4. **Verificación post-migración:**
   - Spot-check 3-5 usuarios aleatorios: tienen `monthly_recipes` y `extra_recipes`, no tienen `monthly_tokens`/`extra_tokens`/`tokens_reset_date`
   - El campo `lastRenewal` existe y es válido en todos

---

#### Fase 2 — Actualizar código (coordinar con migración)

**Orden recomendado:** migrar BDD → actualizar código → deploy (no dejar ventana donde código viejo lee campos nuevos vacíos)

- [ ] **`src/context/user-context.tsx`**
  - Renombrar `CustomUser.monthly_tokens` → `monthly_recipes`, `extra_tokens` → `extra_recipes`
  - Eliminar `tokens_reset_date` del interface
  - `checkAndResetMonthlyTokens`: escribe `monthly_recipes: 5` (no 50), compara con `lastRenewal`
  - Renombrar `hasEnoughTokens(amount)` → `hasEnoughRecipes(amount)` — compara `monthly_recipes + extra_recipes >= amount`
  - Renombrar `deductTokens(amount)` → `deductRecipes(amount)` — llama API con `amount: 1`
  - Actualizar `setUser` updates para usar los nuevos nombres

- [ ] **`src/app/api/deduct-tokens/route.ts`** (o renombrar a `deduct-recipes`)
  - Lee `monthly_recipes` + `extra_recipes`
  - Descuenta `amount` recetas (caller pasa `1`)
  - Responde `{ monthly_recipes, extra_recipes }`

- [ ] **`src/app/api/openai/route.ts`**
  - `TOKENS_PER_RECIPE = 10` → eliminar, usar `RECIPES_PER_CALL = 1`
  - `totalTokens = monthly_tokens + extra_tokens` → `totalRecipes = monthly_recipes + extra_recipes`
  - Validación: `totalRecipes < 1` → 402

- [ ] **`src/app/api/recipe-image/route.ts`**
  - `totalTokens = monthly_tokens + extra_tokens` → `totalRecipes = monthly_recipes + extra_recipes`
  - Para tier-check (Fase B de optimización): `isPremium = isSubscribed || extra_recipes > 0`

- [ ] **`src/app/api/stripe-webhook/route.ts`**
  - Renombrar `PRICE_TO_TOKENS` → `PRICE_TO_RECIPES`
  - Cambiar valores internos: `tokens: 300` → `recipes: 30`, `tokens: 999` → `recipes: 99`, `tokens: 150` → `recipes: 15`, packs legacy `/10`
  - `checkout.session.completed` (PAYG): `extra_tokens: FieldValue.increment(tokens)` → `extra_recipes: FieldValue.increment(recipes)`
  - `checkout.session.completed` (sub): `tokensIncluded` → `recipesIncluded`
  - `token_purchases.add`: `tokensAmount` → `recipesAmount`
  - `invoice.payment_succeeded`: `monthly_tokens: tokensToReset` → `monthly_recipes: recipesPerMonth` (valor ya en recipes del map)
  - `customer.subscription.deleted`: `monthly_tokens: 50` → `monthly_recipes: 5`

- [ ] **Cualquier componente que lea `user.monthly_tokens` o `user.extra_tokens` directamente** (header, modales, etc.)
  - Buscar con grep: `monthly_tokens|extra_tokens` en `src/`
  - Actualizar a `monthly_recipes` / `extra_recipes`

- [ ] **`npx tsc --noEmit`** — 0 errores
- [ ] **`npm run build`** — build exitoso
- [ ] Test manual: generar receta → `monthly_recipes` decrece en 1
- [ ] Test manual: comprar PAYG → `extra_recipes` sube en 15
- [ ] Test manual: renovación (simular webhook) → `monthly_recipes` se resetea a 99 (premium) o 5 (free)

---

#### Campos finales del documento `user` en Firestore (estado objetivo)

```
uid (doc ID)
email
firstName
lastName
created_at
last_active
lastRenewal             ← única fecha de referencia para reset free
monthly_recipes         ← 5 (free) | 99 (premium) | 30 (legacy)
extra_recipes           ← 0 por defecto, +15 por PAYG
isSubscribed
subscriptionStatus      ← 'active' | 'cancel_at_period_end' | 'cancelled' | 'payment_failed'
subscriptionCanceled
subscriptionId
stripeCustomerId
newsletterConsent
lastNewsletterConsentAt
lastNewsletterConsentCanceledAt
```

**Eliminados:** `monthly_tokens`, `extra_tokens`, `tokens_reset_date`

---

### Configuración Producción
- [ ] Añadir env vars de Stripe en Vercel dashboard (si no están ya):
  - `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_PREMIUM_ANNUAL`, `STRIPE_PRICE_PAYG`
  - Sus variantes `NEXT_PUBLIC_*`
- [ ] Stripe Dashboard → Branding: logo + color `#F97316`

### Contenido / Conversión
- [ ] Testimonios reales (actualmente solo placeholder de María G.)
- [ ] Modal post-primera-receta: "¡Primera receta! ¿Quieres 15 más?"
- [ ] Landing: contador dinámico "X recetas generadas" (requiere Firestore counter)

### Analytics & QA
- [ ] Google Analytics 4 + Search Console
- [ ] Test E2E flujo completo: registro → kitchen → generar receta → upgrade

### Lanzamiento
- [ ] ProductHunt: ficha lista (logo 240px, screenshots, GIF demo)
- [ ] Reddit: r/SideProject, r/spain, r/cocina
- [ ] Hacker News: "Show HN"
