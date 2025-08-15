// app/api/consent/link/route.ts
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import "@/lib/firebase-admin";

const MAX_BATCH = 500;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { anonymous_id } = body;

    if (!anonymous_id) {
      return NextResponse.json({ error: "anonymous_id es requerido" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (err) {
      console.error("Token inválido:", err);
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    const uid = decodedToken.uid;

    const db = getFirestore();
    const consentsRef = db.collection("consents");
    const snapshot = await consentsRef.where("user_id", "==", anonymous_id).get();

    if (snapshot.empty) {
      return NextResponse.json({
        ok: true,
        updated: 0,
        message: "No se encontraron consentimientos para ese anonymous_id",
      });
    }

    const docs = snapshot.docs;
    let updatedCount = 0;

    // Procesamos en chunks/batches de MAX_BATCH
    for (let i = 0; i < docs.length; i += MAX_BATCH) {
      const chunk = docs.slice(i, i + MAX_BATCH);
      const batch = db.batch();

      chunk.forEach((docSnap) => {
        const ref = docSnap.ref;
        const data = docSnap.data();

        // Si ya pertenece al uid, saltamos
        if (data.user_id === uid) {
          return;
        }

        // Actualizamos in-place y añadimos auditoría de enlace
        batch.update(ref, {
          prev_user_id: anonymous_id,
          linked_at: FieldValue.serverTimestamp(),
          user_id: uid,
        });

        updatedCount++;
      });

      await batch.commit();
    }

    return NextResponse.json({ ok: true, updated: updatedCount, total: docs.length });
  } catch (error) {
    console.error("Error en /api/consent/link:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
