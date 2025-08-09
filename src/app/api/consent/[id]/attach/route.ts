// app/api/consent/[id]/attach/route.ts
import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = params;
    const body = await req.json();

    const updateData: any = {};
    // Campos opcionales que puede actualizar
    if (body.user_id) updateData.user_id = body.user_id;
    if (body.type) updateData.type = body.type;
    if (body.version) updateData.version = body.version;
    if (typeof body.granted === "boolean") updateData.granted = body.granted;
    if (body.details) updateData.details = body.details;
    if (body.origin) updateData["meta.origin"] = body.origin;
    if (body.ref) updateData["meta.ref"] = body.ref;

    updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();

    const docRef = admin.firestore().collection("consents").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Consentimiento no encontrado" }, { status: 404 });
    }

    await docRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
