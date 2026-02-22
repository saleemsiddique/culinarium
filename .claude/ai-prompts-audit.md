# Culinarium — AI Prompts Audit

## Prompt de Recetas (`/api/openai/route.ts`)

### Estado Actual
- Modelo: `gpt-4-turbo` con `response_format: { type: "json_object" }`
- Sin `max_tokens` definido → puede consumir hasta 4096 tokens por request
- Prompt robusto: utensilios, ingredientes, macros, estilo, dificultad, idioma
- **Sin** instrucción de steps por dificultad explícita
- **Sin** instrucción de título creativo explícita
- **Sin** forzar Celsius
- **Sin** timeout → petición puede quedarse colgada indefinidamente

### Costos Estimados

| Componente | Tokens aprox | Costo USD |
|-----------|-------------|-----------|
| System prompt | ~200 | $0.002 |
| User prompt con body | ~400-600 | $0.005 |
| Respuesta receta | ~800-1500 | $0.015 |
| **Total por receta** | **~1500-2300** | **~$0.022** |
| + DALL-E 3 imagen | — | $0.040 |
| **TOTAL por receta** | | **~$0.062 ≈ €0.057** |

### Mejoras Implementadas
- `max_tokens: 2000` — limitar respuesta
- Instrucción de steps por dificultad: Principiante ≤6 pasos, Intermedio 6-10, Chef 10+
- Instrucción de título creativo y evocador
- Instrucción: "Temperaturas siempre en Celsius"
- Timeout: `Promise.race([call, timeoutPromise(30000)])`
- Validación server-side de tokens antes de llamar OpenAI

## Prompt de Imágenes (`/api/recipe-image/route.ts`)

### Estado Actual
- Modelo: `dall-e-3`, fallback a `gpt-image-1`
- `size: '1024x1024'`, `quality: 'standard'`
- Prompt excelente: fotografía gastronómica hiperrealista, apariencia casera
- **Sin autenticación** → VULNERABILIDAD CRÍTICA (ya arreglada en Sprint 1)
- Costo: ~$0.040 por imagen DALL-E 3 standard

### Posible Optimización Futura
- Usar `size: '512x512'` para planes gratuitos → $0.018/imagen
- Usar `quality: 'hd'` solo para Premium → $0.080/imagen
- Actualmente: misma calidad para todos los planes

## Evaluación Cambio de Modelo GPT-4 Turbo → Claude Sonnet 4.6

| Criterio | GPT-4 Turbo | Claude Sonnet 4.6 |
|---------|-------------|-------------------|
| JSON mode | ✓ Fiable | ✓ (con prompt adecuado) |
| Coherencia narrativa | Buena | Excelente |
| Velocidad | ~8s | ~4s |
| Costo (1M tokens) | $10 input, $30 output | $3 input, $15 output |
| **Ahorro estimado** | — | ~60% |
| SDK | `openai` npm | `@anthropic-ai/sdk` npm |

**Recomendación:** Evaluar migración a Claude Sonnet 4.6 en Sprint 5 — potencial ahorro del 60% en costos de IA.

## Prompt Injection — Riesgo Identificado

El cuerpo del usuario (`body`) se embebe directamente en el prompt sin sanitización:
```
${JSON.stringify(body, null, 2)}
```

**Mitigación implementada:** El modelo ya filtra ingredientes inválidos. Riesgo bajo dado que el output es JSON estructurado. Mejora futura: whitelist de ingredientes y máximo de caracteres por campo.
