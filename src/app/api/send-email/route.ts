import { NextResponse } from "next/server";
import { Resend } from "resend";

// ✅ Usa las plantillas puras desde /lib
import { WelcomeEmailHtml } from "@/lib/emails/Welcome";
import { UnsubscribeEmailHtml } from "@/lib/emails/UnsuscribedEmail";

// Fuerza runtime Node (Resend no funciona en Edge)
export const runtime = "nodejs";
// Si prefieres evitar caching en build:
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { type, to, data } = await req.json();

    if (!to) {
      return NextResponse.json({ error: "Falta 'to'" }, { status: 400 });
    }

    let subject = "";
    let html = "";

    switch (type) {
      case "welcome": {
        const firstName = data?.firstName ?? "Cocinillas";
        subject = "Bienvenido a Culinarium";
        html = WelcomeEmailHtml({ name: firstName });
        break;
      }
      case "unsubscribe": {
        const name = data?.name;
        const endDate = data?.endDate;
        if (!name || !endDate) {
          return NextResponse.json(
            { error: "Faltan datos para el correo de desuscripción" },
            { status: 400 }
          );
        }
        subject = "Confirmación de Cancelación de Suscripción";
        html = UnsubscribeEmailHtml({ name, endDate });
        break;
      }
      default:
        return NextResponse.json(
          { error: "Tipo de email no válido" },
          { status: 400 }
        );
    }

    const result = await resend.emails.send({
      from: "Culinarium <noreply@culinarium.io>",
      to,
      subject,
      html,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API][send-email] ERROR:", error);
    return NextResponse.json({ error: "Error enviando email" }, { status: 500 });
  }
}
