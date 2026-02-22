# Culinarium — UI/UX Audit

## Problemas Críticos

### 1. CTA hero y pricing → `/auth/login` (debería ser `/auth/register`)
- **Archivo:** `src/components/hero.tsx` y `src/components/pricing.tsx`
- **Prioridad:** CRÍTICO — pierde conversiones de nuevos usuarios
- **Fix:** Cambiar `href="/auth/login"` → `href="/auth/register"` en CTAs primarios

### 2. Abstracción "tokens" confusa
- **Archivos:** `header.tsx`, `TokensModal.tsx`, `PremiumModal.tsx`, traducciones
- **Prioridad:** CRÍTICO — nadie entiende "50 tokens"
- **Fix:** Mostrar siempre "5 recetas" → `floor(tokens/10)`

### 3. Precio hardcodeado €7.99 en PremiumModal
- **Archivo:** `src/components/SideMenu/PremiumModal.tsx`
- **Prioridad:** ALTO — cuando el precio cambie, habrá inconsistencia
- **Fix:** Mover precio a i18n

### 4. Onboarding no funcionaba (ya arreglado)
- AuthForm redirige a `/kitchen?onboarding=1` tras registro ✓
- SocialAuth redirige a `/kitchen?onboarding=1` para nuevos usuarios Google ✓

## Problemas Altos

### 5. Empty state de recetas — muy básico
- **Archivo:** `src/app/kitchen/recipes/list/page.tsx`
- **Fix:** Imagen ilustrativa + copy motivador + CTA prominente

### 6. Sin feedback visual tras primera receta
- **Fix:** Modal post-primera receta: "¡Primera receta! ¿Quieres 15 más?"

### 7. Landing sin social proof
- **Archivo:** `src/app/page.tsx`
- **Fix:** Añadir sección testimonios + contador "X recetas generadas"

## Problemas Medios

### 8. Onboarding desactualizado (menciona tokens)
- **Archivo:** `src/components/onboarding.tsx`
- **Fix:** Rediseñar 4 pasos con brand colors naranja, sin mencionar tokens

### 9. `<img>` raw en recipes/list (SEO + performance)
- **Archivo:** `src/app/kitchen/recipes/list/page.tsx` líneas 492-507
- **Fix:** Usar `<Image>` de Next.js

### 10. Formulario kitchen — sin tooltips en macros/utensilios
- **Archivos:** `kitchenForm/ControlMacronutrientes.tsx`
- **Fix:** Tooltips explicativos

## Principios de Diseño a Mantener

- Esquema naranja/ámbar existente: es fuerte y memorable, no cambiar
- CSS variables: `--highlight`, `--highlight-dark`, `--background`, `--text2`
- Añadir más whitespace
- Cards modernas en pricing (sombras, bordes sutiles)
- Verificar responsividad mobile en todas las páginas modificadas

## Archivos por Modificar (por prioridad)

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `src/components/hero.tsx` | CTA → `/auth/register`, `div` → `h1` | CRÍTICO |
| `src/components/pricing.tsx` | 3 planes, CTA → `/auth/register` | CRÍTICO |
| `src/components/header.tsx` | Mostrar recetas en vez de tokens | ALTO |
| `src/components/SideMenu/PremiumModal.tsx` | Quitar €7.99 hardcodeado | ALTO |
| `src/components/SideMenu/TokensModal.tsx` | 1 pack €4.99 | ALTO |
| `src/components/onboarding.tsx` | Rediseño completo | MEDIO |
| `src/app/kitchen/recipes/list/page.tsx` | Empty state + `<Image>` | MEDIO |
