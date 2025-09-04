/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recipe = body?.recipe;

    if (!recipe) {
      console.warn('[API /api/recipe-image] Falta recipe');
      return NextResponse.json({ error: 'Falta el objeto recipe en el cuerpo de la petición.' }, { status: 400 });
    }

    const titulo: string = recipe.titulo ?? '';
    const descripcion: string = recipe.descripcion ?? '';
    const estilo: string | null = recipe.estilo ?? null;
    const ingredientes: Array<{ nombre: string; cantidad?: string; unidad?: string | null }>
      = Array.isArray(recipe.ingredientes) ? recipe.ingredientes : [];

    const ingredientesLista = ingredientes
      .map((ing) => ing?.nombre)
      .filter(Boolean)
      .slice(0, 12)
      .join(', ');

    // Prompt en español enfocado a fotografía gastronómica hiperrealista
    /*const prompt = `Fotografía gastronómica hiperrealista de "${titulo}". ${descripcion}
Estilo de cocina: ${estilo ?? 'internacional'}.
Ingredientes clave visibles: ${ingredientesLista || 'presentación cuidada'}.
Características: iluminación natural suave, profundidad de campo marcada, enfoque nítido en el plato, fondo neutro y minimalista, estilismo culinario profesional, textura apetecible, 4K, realista, sin texto, sin marca de agua, sin manos, sin utensilios cubriendo el plato.`;
*/
    const prompt = `Fotografía gastronómica hiperrealista de "${titulo}". ${descripcion}
Estilo de cocina: ${estilo ?? 'internacional'}.
Ingredientes clave visibles: ${ingredientesLista || 'presentación cuidada'}.

Características: iluminación natural suave proveniente de una ventana, profundidad de campo moderada, enfoque nítido en el plato principal.
Composición sencilla y sin estilismo excesivo; apariencia casera y alcanzable, como la de una comida preparada por un cocinero principiante o estudiante universitario.
Incluye imperfecciones realistas como porciones irregulares, manchas pequeñas o disposición no perfectamente simétrica.
Plato y utensilios cotidianos, mesa o encimera común; sin escenografía elaborada ni fondos de estudio, ambiente doméstico o de residencia estudiantil.
Textura apetecible pero no retocada digitalmente; luz y color naturales, sin aspecto de anuncio profesional.

Restricciones: sin texto, sin marca de agua, sin manos, sin utensilios tapando el plato.`;
    
    let b64: string | undefined;
    try {
      const result = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
        response_format: 'b64_json',
      } as any);
      b64 = (result as any)?.data?.[0]?.b64_json;
    } catch (err) {
      console.error('[API /api/recipe-image] dall-e-3 falló, probando gpt-image-1', err);
      try {
        const fallback = await openai.images.generate({
          model: 'gpt-image-1',
          prompt,
          size: '512x512',
          quality: 'high',
          n: 1,
          response_format: 'b64_json',
        } as any);
        b64 = (fallback as any)?.data?.[0]?.b64_json;
      } catch (err2) {
        console.error('[API /api/recipe-image] gpt-image-1 también falló', err2);
      }
    }

    if (!b64) {
      return NextResponse.json({ error: 'No se pudo generar la imagen.' }, { status: 502 });
    }

    const dataUrl = `data:image/png;base64,${b64}`;

    // Devolvemos SIEMPRE base64 (sin usar Storage)
    return NextResponse.json({ img_url: dataUrl });
  } catch (error: any) {
    // console.error('Error en /api/recipe-image:', error);
    return NextResponse.json({ error: 'Error interno al generar la imagen.', details: error?.message }, { status: 500 });
  }
}

