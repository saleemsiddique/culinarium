/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth, db } from '@/lib/firebase-admin';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let uid: string;

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      uid = decodedToken.uid;
    } catch {
      return NextResponse.json({ error: 'Token de autenticación inválido' }, { status: 401 });
    }

    // Verificar que el usuario tiene recetas disponibles y determinar tier
    const userDoc = await db.collection('user').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    const userData = userDoc.data();

    // Dual-read fallback para extra_recipes
    const extraRecipes = userData?.extra_recipes ?? Math.floor((userData?.extra_tokens || 0) / 10);
    const totalRecipes =
      (userData?.monthly_recipes ?? Math.floor((userData?.monthly_tokens || 0) / 10)) + extraRecipes;

    if (totalRecipes <= 0) {
      return NextResponse.json({ error: 'Sin recetas disponibles' }, { status: 403 });
    }

    // Determinar tier: premium si tiene suscripción activa o extra recipes
    const isPremium = userData?.isSubscribed || extraRecipes > 0;

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

    if (isPremium) {
      // PREMIUM: DALL-E 3 1024×1024 con fallback a gpt-image-1
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
        console.error('[API /api/recipe-image] dall-e-3 falló (premium), probando gpt-image-1', err);
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
          console.error('[API /api/recipe-image] gpt-image-1 también falló (premium)', err2);
        }
      }
    } else {
      // FREE: DALL-E 2 512×512, sin fallback caro
      try {
        const result = await openai.images.generate({
          model: 'dall-e-2',
          prompt,
          size: '512x512',
          n: 1,
          response_format: 'b64_json',
        } as any);
        b64 = (result as any)?.data?.[0]?.b64_json;
      } catch (err) {
        console.error('[API /api/recipe-image] dall-e-2 falló (free)', err);
        // Free tier: no fallback caro, devolver sin imagen (no es un error crítico)
        return NextResponse.json({ img_url: '' });
      }
    }

    if (!b64) {
      return NextResponse.json({ img_url: '' });
    }

    const dataUrl = `data:image/png;base64,${b64}`;
    return NextResponse.json({ img_url: dataUrl });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error interno al generar la imagen.', details: error?.message }, { status: 500 });
  }
}
