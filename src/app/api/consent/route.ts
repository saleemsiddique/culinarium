// app/api/consent/route.ts
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import "@/lib/firebase-admin";

const POLICY_VERSION = process.env.POLICY_VERSION || "1.0.0";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();

    const {
      type,       // ej: 'privacy_policy', 'terms', 'cookies'
      version = POLICY_VERSION,
      granted,
      details = null,
      origin = null,
      ref = null,
    } = body;

    if (!type || typeof granted !== "boolean") {
      return NextResponse.json({ error: "Campos obligatorios faltantes" }, { status: 400 });
    }

    // Obtener IP y User-Agent de headers
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("remote_addr") || null;
    const userAgent = req.headers.get("user-agent") || null;

    const db = getFirestore();
    const consentData = {
      user_id: userId,
      type,
      version,
      granted,
      details,
      timestamp: FieldValue.serverTimestamp(),
      ip,
      user_agent: userAgent,
      meta: {
        origin,
        ref,
      },
    };

    // Guardamos en colección "consents"
    await db.collection("consents").add(consentData);

    // También puedes actualizar la info de consentimiento en el doc user (opcional)
    await db.collection("users").doc(userId).set(
      {
        last_consent_type: type,
        last_consent_version: version,
        last_consent_granted: granted,
        last_consent_at: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en POST /api/consent:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
