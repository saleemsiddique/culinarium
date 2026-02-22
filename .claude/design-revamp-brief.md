# Culinarium — Design Revamp Brief para Antigravity
> Fecha: 2026-02-22 | Autor: Claude Code | Destino: sesión Antigravity

---

## 1. CONTEXTO DEL PROYECTO

**Culinarium** es un generador de recetas con IA. El usuario introduce ingredientes, preferencias y restricciones, y la IA (GPT-4 + DALL-E 3) genera una receta personalizada con imagen.

**URL producción**: culinarium.io
**Stack**: Next.js 15.3.4 App Router, Tailwind CSS 4 + DaisyUI 5, Framer Motion, Firebase Auth + Firestore, Stripe, react-i18next (ES/EN)

### Modelo de negocio
- **Gratuito**: 5 recetas/mes
- **Pay-as-you-go**: €4.99 = 15 recetas
- **Premium mensual**: €9.99/mes = recetas ilimitadas
- **Premium anual**: €79.99/año = recetas ilimitadas

### Paleta de colores actual (CSS variables en `src/app/globals.css`)
```
--background: #FDF5E6    (crema/off-white)
--foreground: #4A2C2A    (marrón oscuro)
--text: #4A2C2A
--text2: #FFFFFF
--primary: #2C3E50       (azul oscuro/pizarra)
--highlight: #E67E22     (naranja vibrante)
--highlight-dark: #C2651A (naranja oscuro)
--radius: 0.625rem
```

**IMPORTANTE**: Las variables CSS deben RESPETARSE. Todo el diseño debe construirse sobre ellas para mantener consistencia. Puedes añadir nuevas variables si las necesitas, pero no elimines las existentes.

---

## 2. FILOSOFÍA DEL REDISEÑO

### Objetivo principal
Transformar Culinarium de "funcional pero genérico" a **"plataforma gastronómica premium que da confianza y deseo de suscribirse**". El usuario debe sentir:
1. **Seguridad**: "Esta plataforma es seria y profesional"
2. **Deseo**: "Quiero cocinar esto ahora mismo"
3. **Urgencia suave**: "Debería aprovechar el plan gratuito / hacer upgrade"

### Dirección estética
**Editorial gastronómica de lujo accesible** — como si Bon Appétit y Linear tuvieran un hijo. Cálido, sofisticado, orgánico. Nada de dashboards fríos. El naranja es el alma del diseño, el azul oscuro es el contrapunto de confianza.

- **Tipografía**: Fraunces (serif editorial, para títulos) + Plus Jakarta Sans (sans-serif limpio, para cuerpo). Ambas disponibles en Google Fonts pero se cargan vía `next/font/google` en `src/app/layout.tsx`, NO via `@import url()` en CSS (eso rompe Tailwind v4).
- **Iconografía**: Ya existen `react-icons`, `lucide-react`, `@mdi/react`. Puedes añadir `phosphor-react` si lo consideras más completo. **NUNCA usar emojis como iconos en UI** — sustituirlos todos por iconos de librería con aria-label.
- **Movimiento**: Framer Motion ya está instalado. Úsalo. Animaciones de entrada staggered, parallax suave, hover con depth, transiciones de página fluidas.

---

## 3. MAPA DE ARCHIVOS A REVISAR/REDISEÑAR

```
src/
├── app/
│   ├── globals.css                    ← Añadir variables tipográficas, keyframes
│   ├── layout.tsx                     ← Añadir next/font/google (Fraunces + Plus Jakarta Sans)
│   ├── page.tsx                       ← Landing completa (no logueado)
│   └── kitchen/
│       └── KitchenContent.tsx         ← Formulario principal (700+ líneas)
├── components/
│   ├── hero.tsx                       ← Hero section landing
│   ├── infoBox.tsx                    ← Sección features (4 cards)
│   ├── pricing.tsx                    ← 3 planes de precios
│   ├── faq.tsx                        ← Accordion FAQ
│   ├── header.tsx                     ← Header navegación
│   └── onboarding.tsx                 ← Modal onboarding 4 pasos
└── public/
    └── locales/
        ├── es/translation.json        ← i18n español ← AUDITAR TOKENS
        └── en/translation.json        ← i18n inglés ← AUDITAR TOKENS
```

---

## 4. AUDITORÍA CRÍTICA: "TOKENS" → "RECETAS"

### El problema
La UI muestra "recetas" (`floor(tokens/10)`) pero muchos strings i18n todavía dicen "tokens". El usuario ve inconsistencias que rompen la confianza.

### Strings a cambiar en `public/locales/es/translation.json`

Busca y corrige TODOS los siguientes (grep por "token"):

| Ubicación | Texto actual | Texto correcto |
|-----------|-------------|---------------|
| `header.tokens.popup.title` | (revisa) | "Tus Recetas disponibles" |
| `header.tokens.popup.monthly` | (revisa) | "Recetas del plan" |
| `header.tokens.popup.extra` | (revisa) | "Recetas extra" |
| `header.tokens.popup.total` | (revisa) | "Total" |
| `header.tokens.buyMore` | (revisa) | "Conseguir más recetas" |
| `header.tokens.buy` | (revisa) | "Comprar recetas" |
| `profile.tokens.title` | "💰 Compras de Tokens" | "Recetas adicionales compradas" |
| `profile.tokens.subtitle` | "Historial de todas tus compras de tokens" | "Historial de paquetes de recetas" |
| `profile.tokens.tokens` | "Tokens" | "Recetas" |
| `culinarium.form.buttons.generate.cost` | "Costo: {{cost}} tokens" | "Usa 1 receta" |
| `culinarium.form.messages.tokenError` | "Necesitas {{tokens}} tokens..." | "Necesitas recetas disponibles para {{action}}. Te quedan {{current}}..." |
| `culinarium.form.messages.success` | "Se han descontado {{tokens}} tokens" | "Se ha usado 1 receta" |
| `culinarium.form.messages.authError` | "...gestionar tus tokens" | "...gestionar tus recetas" |
| `faq` - preguntas sobre tokens | (varias) | Reescribir en términos de recetas |
| `privacy` / `terms` - referencias técnicas a tokens | Mantener como están (son legales) | Solo cambiar los textos UI-facing |
| `tokens.currentTokens` | "Recetas disponibles:" | OK, este ya está bien |

**IMPORTANTE**: En los documentos legales (`privacy`, `terms`) puedes mantener "tokens" porque son términos técnicos del contrato. El objetivo es solo la UI que ve el usuario día a día.

Haz lo mismo en `public/locales/en/translation.json`.

### Componentes con emojis como iconos (sustituir por iconos de librería)

En `KitchenContent.tsx`:
- `🍳` (ingredientes) → `<PiCookingPotFill />` de react-icons/pi
- `☀️` (momento del día) → `<Sun />` de lucide-react
- `👨‍👩‍👧‍👦` (comensales) → `<Users />` de lucide-react
- `🚫` (restricciones) → `<ShieldOff />` o `<Ban />` de lucide-react
- `🌍` (estilo de cocina) → `<Globe />` de lucide-react
- `🎯` (dificultad) → `<Target />` de lucide-react
- `☕🍲🌙🍎` (meal time buttons) → iconos de `react-icons/pi` o similar

En `onboarding.tsx`:
- `STEP_ICONS = ["👋", "🍳", "🎁", "🚀"]` → reemplazar con componentes de icono

En `header.tsx`:
- `✨` junto al contador de recetas → `<Sparkles />` de lucide-react (ya importado: solo añadirlo)

---

## 5. REDISEÑO LANDING PAGE (`src/app/page.tsx` + `src/components/hero.tsx`)

### Estado actual
La landing muestra `KitchenContent` (el formulario de cocina) como primer bloque para usuarios no logueados, seguido de InfoBox, Pricing y FAQ. El hero original (`hero.tsx`) tiene un video de fondo con overlay oscuro.

### Estructura propuesta

```
[HERO] → [DEMO/FEATURES] → [SOCIAL PROOF] → [PRICING] → [FAQ] → [CTA FINAL]
```

### 5a. Hero Section (`hero.tsx`)

**Objetivo**: Capturar atención en <3 segundos. Comunicar la propuesta de valor. Guiar al CTA.

**Diseño**:
- Fondo: el video existente (`/test-video.mp4`) + overlay gradiente dark (no sólido negro — usa `from-[#1a0a00]/80 via-[#2C3E50]/50 to-transparent`)
- Título H1 grande en Fraunces: *"Convierte tus ingredientes en recetas increíbles"* (o lo que esté en i18n)
- Subtítulo en Plus Jakarta Sans
- DOS CTAs: "Empezar gratis" (→ `/auth/register`, naranja sólido) + "Ver cómo funciona" (scroll suave a demo, outline blanco)
- **Trust indicators debajo del CTA**: `✓ Sin tarjeta de crédito · ✓ 5 recetas gratis cada mes · ✓ Cancela cuando quieras`
- Contador animado: "Más de 10.000 recetas generadas" (número animado al entrar en viewport)
- Ingrediente pills flotantes animadas (loop sutil): tomate, pollo, pasta, limón, etc. — posicionadas en el background con z-index intermedio

**Animaciones**:
- Entry: título aparece con `clipPath` reveal de izquierda a derecha (no fade simple)
- Pills: flotan con `translateY` oscilatoria infinita con delays escalonados
- CTA: pulso suave en el botón naranja cada 4s para llamar atención

### 5b. Demo / Features Section (`infoBox.tsx`)

**Objetivo**: Mostrar QUÉ hace la app y generar deseo.

**Diseño actual**: 4 cards en grid, fondo crema, estilos inline.
**Propuesto**:
- Migrar de estilos inline a clases Tailwind
- Layout alternado: feature izquierda + mockup derecha (tipo "bento")
- Las 4 features en formato **horizontal stacked con icono grande a la izquierda**: más espacio para respirar
- Fondo: crema original `var(--background)` para contraste con el hero dark
- Badge "IA Generativa" en naranja pill arriba del título
- Añadir número/stat visual a cada feature (ej: "15+ estilos culinarios", "5 niveles de macros")
- Animación: cada card entra con `slideInFromLeft` / `slideInFromRight` alternado

### 5c. Pricing (`pricing.tsx`)

**Objetivo principal de conversión**: Que el usuario haga clic en "Premium".

**Diseño actual**: 3 cards sobre fondo `#4B3F2F`. Funciona pero puede mejorar.
**Propuesto**:
- Mantener el fondo oscuro marrón (es el más diferente y llama atención)
- Añadir **microcopy de urgencia** bajo el plan Premium: "El plan más popular · Cancela cuando quieras"
- **Plan gratuito**: hacer que parezca un punto de entrada, no un destino. Reducir visualmente.
- **Plan Premium**: escalar más (scale-110 en desktop), añadir badge "RECOMENDADO" con glow naranja
- **Plan PAYG**: reposicionar como "¿Prueba sin compromiso?" — copy más casual
- Toggle mensual/anual: más prominente, con la etiqueta "Ahorra 33%" en verde brillante
- Añadir **logos de confianza** bajo las cards: "Pago seguro con Stripe" + icono de candado
- Añadir al menos 1-2 **testimonios breves** (placeholders) entre Pricing y FAQ: `"Generé 3 recetas con lo que tenía en la nevera. Increíble." — María G.`
- CTA de cada plan debe llevar a `/auth/register`, NO a `/auth/login` — ya está así, verificar.

### 5d. FAQ (`faq.tsx`)

**Diseño actual**: Accordion limpio, funciona bien.
**Mejoras**:
- Añadir un CTA secundario dentro de la sección: "¿Tienes otra duda? Escríbenos" → mailto:culinariumofficial@gmail.com (ya existe en i18n)
- El botón final "Empezar ahora" debe ir a `/auth/register` (actualmente va a `/auth/login` — cambiar)
- Fondo: ligeramente diferente al resto (quizás `var(--background)` con un patrón sutil de puntos o líneas en naranja muy tenue)

### 5e. CTA Final Section (NUEVO — añadir antes del footer)

**Objetivo**: Última oportunidad de conversión antes de salir.

**Diseño propuesto**:
```
[Fondo naranja gradiente full-width]
[Icono chef grande centrado]
[H2] "¿Listo para empezar a cocinar mejor?"
[Párrafo] "Únete a miles de cocineros que ya generan recetas únicas cada día."
[Botón grande blanco] "Crear mi cuenta gratis →"
[Sub-texto] "Sin tarjeta de crédito · 5 recetas gratis al mes"
```

---

## 6. REDISEÑO DEL FORMULARIO DE COCINA (`src/app/kitchen/KitchenContent.tsx`)

### Estado actual
Grid de 3 columnas en desktop. Funciona bien pero se ve demasiado "formulario de empresa". Usa emojis como iconos. Algunos campos están colapsados y no se descubren fácilmente.

### Filosofía del rediseño
El formulario ES el producto. Debe sentirse como **jugar, no como rellenar un formulario**. Cada sección debe sentirse intuitiva y fluida. El usuario debe llegar al botón "Generar" con entusiasmo, no con fatiga.

### Propuesta de layout

**Desktop (≥ lg)**: Mantener 3 columnas pero con más carácter visual:
- Columna 1 (ingredientes + tiempo + dificultad): más protagonismo, fondo blanco con sombra suave
- Columna 2 (momento del día + comensales): tarjetas más grandes y expresivas
- Columna 3 (opciones avanzadas): más compacta, colapsables mejor señalizadas

**Mobile**: Una columna, scroll vertical, secciones bien separadas con `section` + `hr` visual.

### Mejoras específicas

#### Ingredientes (Col 1)
- El input ya funciona bien. Añadir placeholder rotatorio que sugiera: "Prueba con: tomate, pollo, arroz..."
- Las **tags de ingrediente** deben verse más como chips de app moderna: pill compacto, fondo naranja/10, borde naranja, icono × pequeño
- Quick suggestions: las pills de sugerencias rápidas deben ser más visuales — pequeño icono de "+" antes del texto

#### Momento del día (Col 2)
- Las 4 cards (desayuno/almuerzo/cena/merienda) deben ser más grandes y expresivas en desktop
- Sustituir emojis por iconos de librería (`Sun`, `UtensilsCrossed`, `Moon`, `Coffee` de lucide-react)
- Estado seleccionado: fondo naranja con texto blanco (ya existe pero hacerlo más dramático)
- Añadir descripción breve en cada card: "Desayuno · rápido y nutritivo"

#### Comensales (Col 2)
- El badge PREMIUM es lo correcto — pero hacerlo más atractivo, no punitivo
- Cuando no está suscrito: añadir tooltip/callout sutil: "Actualiza para cocinar para hasta 8 personas"
- El `-/número/+` debe tener animación más expresiva en el número al cambiar

#### Dificultad (Col 1)
- Los 3 botones de dificultad (Principiante/Intermedio/Chef) deben ser más visuales
- Añadir icono de librería a cada nivel: `Star`, `Zap`, `ChefHat` de lucide-react
- El estado seleccionado debe ser más obvio: background naranja brillante, no solo borde

#### Restricciones y exclusiones (Col 3, colapsable)
- El collapse button debe ser más claro — actualmente el icono de chevron está al revés en jerarquía visual
- Cuando está colapsado: mostrar un resumen de lo que hay seleccionado ("Vegano, sin gluten" en pill pequeños)
- Cuando está bloqueado (no premium): mensaje más motivador que restrictivo — "Con Premium puedes personalizar al máximo tu receta"

#### Estilo de cocina (Col 3, colapsable)
- Mismo feedback que restricciones
- Las cuisine cards podrían tener una foto de background sutil (o color de fondo temático) en vez de solo icono

#### Utensilios (Modal)
- El botón actual para abrir utensilios está arriba del formulario, difícil de encontrar
- **Propuesta**: Mover el trigger a dentro de Columna 1, después de Dificultad, como sección colapsable inline (no modal)
- Si se mantiene como modal, hacer el trigger más visual: card pequeña con icono de cuchillos

#### Botón de generación
- Ya tiene buen diseño. Mejoras:
  - Cuando el estado es idle: añadir una pequeña animación de "shimmer" en el gradiente
  - Mensaje "Usa 1 receta" en vez de "Costo: 10 tokens"
  - Si el usuario NO tiene recetas, el botón debe mostrar: "Obtén más recetas →" y abrir TokensModal

#### Loading overlay
- Actualizar el copy de loading para ser más gastronómico: "Cocinando tu receta con IA..." con animación de olla o similar
- Añadir tips rotativos mientras carga: "Sabías que... puedes pedir recetas keto con Premium"

---

## 7. HEADER (`src/components/header.tsx`)

### Mejoras

#### Logo "Culinarium"
- Añadir un icono SVG simple antes del texto (puede ser `<ChefHat />` de lucide-react)
- La fuente del logo debe usar Fraunces (serif) para diferenciarlo del resto del texto

#### Contador de recetas (usuario logueado)
- Sustituir `✨` emoji por `<Sparkles size={18} />` de lucide-react (ya importado en el proyecto)
- El tooltip/popup al hover debe tener mejor copy sin mencionar "tokens"
- Cuando las recetas son ≤ 2, añadir un estilo de "advertencia" (naranja más intenso, pulse animation)

#### CTA "Empezar" (usuario no logueado)
- Debe ir a `/auth/register`, no a `/auth/login` — **verificar y corregir**

---

## 8. ONBOARDING (`src/components/onboarding.tsx`)

### Mejoras
- Sustituir `STEP_ICONS = ["👋", "🍳", "🎁", "🚀"]` por iconos de lucide-react:
  `[<Hand />, <UtensilsCrossed />, <Gift />, <Rocket />]`
- El fondo del contenedor puede tener un patrón sutil de líneas diagonales en naranja/5
- Las ilustraciones de cada paso (si no cargan) deben tener un placeholder más atractivo que solo el emoji — un gradiente naranja→marrón con el icono del paso centrado en blanco

---

## 9. PRICING MODAL (`src/components/SideMenu/PremiumModal.tsx`) y TOKENS MODAL (`src/components/SideMenu/TokensModal.tsx`)

Lee estos archivos antes de modificar. Puntos a mejorar:
- Asegurarse de que **no aparezca la palabra "tokens"** en la UI — solo "recetas"
- En `TokensModal`: el pack debe llamarse "Pack de 15 Recetas" no "Pack de tokens"
- En `PremiumModal`: el copy debe enfatizar el valor ("recetas ilimitadas") no el mecanismo

---

## 10. INSTRUCCIONES TÉCNICAS CRÍTICAS

### ¿Cómo añadir tipografía personalizada?
**NO usar `@import url()` en `globals.css`** — Tailwind v4 lo rompe.
Usar `next/font/google` en `src/app/layout.tsx`:

```tsx
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

// En el return del layout, añadir las variables al <html>:
<html lang="es" className={`${fraunces.variable} ${plusJakarta.variable}`}>
```

Luego en `globals.css` puedes usar:
```css
body { font-family: var(--font-jakarta), system-ui, sans-serif; }
.font-display { font-family: var(--font-fraunces), serif; }
```

### CSS para keyframes (sí se pueden añadir a globals.css)
Los `@keyframes` y clases CSS normales son válidos en globals.css. Solo los `@import url()` son problemáticos.

### Framer Motion
Usa `whileInView` con `viewport={{ once: true }}` para todas las animaciones scroll-triggered. Ya está el patrón en `pricing.tsx` y `infoBox.tsx` — seguirlo.

### i18n
Para strings de arrays (features, FAQ):
```tsx
t("key.array", { returnObjects: true }) as string[]
```
Ya está implementado, seguir el patrón.

### Imágenes
Las imágenes de recetas son base64 en Firestore. Usar `<Image unoptimized />` de next/image para ellas. Para assets estáticos en `/public`, usar `<Image />` normal.

---

## 11. CHECKLIST DE CONSISTENCIA

Antes de terminar, verificar:

- [ ] ¿Aparece "tokens" en algún texto visible para el usuario? → cambiar a "recetas"
- [ ] ¿Todos los emojis usados como iconos UI tienen reemplazo de librería?
- [ ] ¿Los CTAs "Empezar" van a `/auth/register` (no `/auth/login`)?
- [ ] ¿El FAQ final CTA va a `/auth/register`?
- [ ] ¿Las fuentes Fraunces y Plus Jakarta Sans están cargadas via `next/font/google`?
- [ ] ¿El header muestra "recetas" no "tokens"?
- [ ] ¿Los modales PremiumModal y TokensModal dicen "recetas" no "tokens"?
- [ ] ¿Build sin errores TypeScript? → `npm run build` o `npx tsc --noEmit`
- [ ] ¿Responsive funciona en mobile? → probar breakpoints md: y lg:
- [ ] ¿Las variables CSS originales siguen existiendo en globals.css?

---

## 12. PRIORIDADES DE IMPLEMENTACIÓN

Implementar en este orden (de mayor a menor impacto):

1. **URGENTE — Tipografía**: Añadir Fraunces + Plus Jakarta Sans en layout.tsx
2. **URGENTE — Tokens→Recetas**: Auditar y corregir strings i18n ES + EN
3. **ALTA — Hero**: Rediseñar hero.tsx con los puntos del §5a
4. **ALTA — Formulario KitchenContent**: Mejoras visuales §6 (sin tocar la lógica)
5. **MEDIA — CTA Final**: Añadir sección CTA antes del footer en page.tsx
6. **MEDIA — Pricing**: Mejoras de conversión §5c
7. **MEDIA — InfoBox**: Rediseño layout §5b
8. **BAJA — Emojis**: Sustituir emojis por iconos §4
9. **BAJA — Header**: Mejoras §7
10. **BAJA — Onboarding**: Mejoras §8

---

## 13. NOTAS FINALES

- **No tocar la lógica de negocio** — solo UI/UX. La lógica de tokens, auth, Firebase, Stripe está bien y es producción.
- **No modificar APIs** (`src/app/api/`) bajo ningún concepto.
- **No commitear** — dejar los cambios unstaged para que el usuario los revise.
- **El formulario `KitchenContent.tsx` tiene 1600+ líneas** — leerlo completo antes de tocar nada.
- **react-i18next**: todos los textos van por i18n, no hardcodeados. Si añades un nuevo string UI, añádelo en ambos `locales/es/translation.json` y `locales/en/translation.json`.
- **Tailwind v4**: la sintaxis es ligeramente diferente a v3. Las utilidades con `/` para opacidad funcionan: `bg-orange-500/20`. Los `arbitrary values` también: `bg-[#E67E22]`.
- **Framer Motion**: `LayoutGroup` y `AnimatePresence` ya están en uso — úsalos cuando necesites transiciones entre estados.
