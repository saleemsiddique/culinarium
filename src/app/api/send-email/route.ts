import { NextResponse } from "next/server";
import { Resend } from "resend";
import { WelcomeEmailHtml } from "@/lib/emails/Welcome";
import { UnsubscribeEmailHtml } from "@/lib/emails/UnsuscribedEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { type, to, data } = await req.json();

    let emailContent: string;
    let subject;

    switch (type) {
      case "welcome":
        subject = "Bienvenido a Culinarium";
        // Ahora llamamos a la función que devuelve el HTML en forma de string
        emailContent = WelcomeEmailHtml({ name: data.firstName });
        break;
      case "unsubscribe":
        if (!data || !data.name || !data.endDate) {
          return NextResponse.json({ error: "Faltan datos para el correo de desuscripción" }, { status: 400 });
        }
        subject = "Confirmación de Cancelación de Suscripción";
        emailContent = UnsubscribeEmailHtml({ name: data.name, endDate: data.endDate });
        break;
      default:
        return NextResponse.json({ error: "Tipo de email no válido" }, { status: 400 });
    }

    const result = await resend.emails.send({
      from: "Culinarium <noreply@culinarium.io>",
      to,
      subject,
      html: emailContent, // Usamos la propiedad 'html'
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error enviando email" }, { status: 500 });
  }
}
