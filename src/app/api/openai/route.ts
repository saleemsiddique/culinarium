/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */


// app/api/openai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ingredients,
      availableTime,
      mealTime, // mealTime is already extracted here
      diners,
      dietaryRestrictions,
      excludedIngredients,
      cuisineStyle,
    } = body;

    // Monta el prompt robusto sin usar backticks internos ni fences
    const prompt = `Eres un asistente de recetas profesional y extremadamente preciso. Tu tarea es generar una receta basándote en los datos proporcionados por el usuario, adhiriéndote estrictamente al formato de salida JSON y a las reglas de validación.

    **REGLAS DE PROCESAMIENTO Y SALIDA:**

    1.  **Formato de Salida (JSON Estricto):**
        Debes devolver ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta. No incluyas ningún texto adicional, explicaciones, comentarios, etiquetas de markdown (como \`\`\`) ni caracteres antes o después del JSON.
        \`\`\`json
        {
          "receta": {
            "titulo": string,
            "descripcion": string,
            "ingredientes": [
              { "nombre": string, "cantidad": string, "unidad": string|null }
            ],
            "instrucciones": [
              { "paso": number, "texto": string }
            ],
            "tiempo_total_min": number,
            "porciones": number,
            "estilo": string|null,
            "restricciones": [string...],
            "excluidos": [string...],
            "momento_del_dia": string|null, // <-- NUEVA CLAVE AQUÍ
            "img_url": ''
          }
        }
        \`\`\`

    2.  **Manejo Inteligente de Ingredientes:**
        * **Filtrado de Ingredientes Disponibles:** De la lista de 'ingredients' proporcionados por el usuario, **ignora cualquier elemento que no sea un ingrediente alimenticio real o una palabra sin sentido** (ej: "dasdsa", "xyz"). Solo procesa y utiliza ingredientes válidos y reconocibles.
        * **Respuesta de Error por Ingredientes Inválidos:** Si después del filtrado, la lista de 'ingredients' disponibles queda **vacía** (es decir, el usuario solo proporcionó términos irreales o sin sentido), entonces el JSON de salida debe tener el siguiente formato específico para indicar que no se pudo generar una receta:
            \`\`\`json
            {
              "receta": {
                "titulo": "ERROR: No se pudo generar una receta",
                "descripcion": "No se encontraron ingredientes válidos para crear una receta. Por favor, revisa tu lista de ingredientes.",
                "ingredientes": [],
                "instrucciones": [
                  { "paso": 1, "texto": "Lo sentimos, no pudimos generar una receta con los ingredientes proporcionados. Por favor, asegúrate de que sean ingredientes reales." }
                ],
                "tiempo_total_min": 0,
                "porciones": 0,
                "estilo": null,
                "restricciones": [],
                "excluidos": [],
                "momento_del_dia": null, // <-- Asegúrate de que sea null en caso de error
                "img_url": ''
              }
            }
            \`\`\`
            En este caso, todas las demás claves deben seguir los valores por defecto o vacíos como se muestra.
        * **Límite de Ingredientes:** Si la lista de ingredientes válidos excede los **15**, selecciona los 15 más relevantes para una receta coherente.
        * **Ingredientes Excluidos:** De la lista 'excludedIngredients', ignora cualquier término que no sea un ingrediente real o una palabra sin sentido. Solo aplica las exclusiones para ingredientes válidos y reconocibles. Los ingredientes excluidos válidos no deben aparecer en la lista final de 'ingredientes' de la receta.

    3.  **Descripción del Plato (Nueva Característica):**
        Genera una 'descripcion' para la receta. Esta descripción debe ser:
        * **Detallada y Evocadora:** Describe el plato de forma que despierte el apetito y la curiosidad.
        * **Elegante y Exótica:** Utiliza un lenguaje sofisticado y un tono que haga que el plato, por muy simple que sea, suene especial y único. Evita descripciones genéricas.

    4.  **Detalle de Instrucciones (Paso a Paso):**
        Las instrucciones ('instrucciones') deben ser **extremadamente detalladas y precisas**. Para cada paso, incluye:
        * **Cantidades y Unidades:** Especifica cantidades exactas (ej: "2 cucharadas de", "500 gramos de") para los ingredientes usados en ese paso.
        * **Temperatura y Tiempos:** Incluye temperaturas de cocción (ej: "precalienta el horno a 180°C"), tiempos de cocción/preparación (ej: "cocina por 10 minutos", "reposar por 30 segundos").
        * **Utensilios:** Menciona utensilios clave si son relevantes (ej: "en una sartén grande", "usando una batidora").
        * **Técnicas Culinarias:** Describe la técnica (ej: "saltear", "dorar", "reducir", "cortar en cubos pequeños").
        * **Especias y Condimentos:** Detalla qué especias/condimentos se usan y en qué momento.
        * **Consejos Adicionales:** Pequeños trucos para mejorar el sabor o la textura.

    5.  **Prioridad y Creatividad en Estilo de Comida ('cuisineStyle'):**
        Aunque los ingredientes proporcionados por el usuario no tengan una relación directa con el 'cuisineStyle' solicitado, este campo **NO ES PRIORIDAD** para la selección de ingredientes principales. Sin embargo, debes esforzarte creativamente por **infundir el espíritu del 'cuisineStyle'** en la receta. Esto puede incluir:
        * Sugerir una salsa o aderezo típico de ese estilo.
        * Proponer una técnica de cocción característica.
        * Añadir un condimento o especia que evoque el sabor de esa cocina.
        * Modificar sutilmente los pasos para reflejar el estilo.
        * La idea es que el plato final, aunque use los ingredientes dados, tenga un **toque distintivo** del estilo solicitado.

    6.  **Validaciones Generales y Valores por Defecto:**
        * Si 'tiempo_total_min' no puede determinarse, usa **30**.
        * Si 'porciones' no puede determinarse o es inválido, usa **1**.
        * Las listas ('ingredientes', 'instrucciones', 'restricciones', 'excluidos') deben ser vacías si no hay datos válidos.
        * Asegúrate de que el JSON de salida sea **siempre válido** (comillas dobles para claves y valores de string, comas correctas, corchetes y llaves balanceados).
        * Deja la url_img vacia, de momento se le añadira en otro proceso mas tarde.
        
    7.  **Momento del Día ('momento_del_dia'):**
        * Este campo debe contener el valor de 'mealTime' proporcionado en los datos de entrada del usuario. Si 'mealTime' no está presente o es nulo, este campo debe ser null.

    8.  **Datos de Entrada (Objeto Recibido del Usuario):**
    \`\`\`json
    ${JSON.stringify(body, null, 2)}
    \`\`\`

    **OBJETIVO FINAL:** Genera una receta útil y lista para cocinar con la máxima precisión, detalle y un toque creativo, adhiriéndote estrictamente al formato JSON.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Consider 'gpt-4o' for potentially better instruction following
      messages: [
        { role: 'system', content: 'Eres un ayudante de recetas experto, preciso y que sigue instrucciones al pie de la letra.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" }, // Crucial for enforcing JSON output
    });

    const text = completion.choices[0].message?.content ?? '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Error al parsear la respuesta de IA:', parseError, 'Raw text:', text);
      return NextResponse.json(
        { error: 'Respuesta de IA no es JSON válido', raw: text, parseError: (parseError as Error).message },
        { status: 502 }
      );
    }

    // Optional: Add an extra check for the 'receta' key if desired, though response_format should help
    if (!data.receta) {
      console.error('La respuesta de IA no contiene la clave "receta":', data);
      return NextResponse.json(
        { error: 'La respuesta de IA no devolvió la estructura esperada (falta "receta")', raw: data },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error en /api/openai:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
