import { NextResponse } from "next/server";
import { Resend } from "resend";
import { WelcomeEmailHtml } from "@/app/emails/Welcome";

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
        emailContent = WelcomeEmailHtml({ name: data.name });
        break;
      case "reset-password":
        subject = "Restablece tu contraseña";
        // Si tienes la lógica de restablecer, la pondrías aquí de manera similar.
        emailContent = ``;
        break;
      default:
        return NextResponse.json({ error: "Tipo de email no válido" }, { status: 400 });
    }

    const result = await resend.emails.send({
      from: "Culinarium1 <noreply@onresend.com>", // Campo 'from' corregido
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
