/* eslint-disable react-hooks/rules-of-hooks */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { WelcomeEmailHtmlEN } from "@/app/emails/WelcomeEN"; //Welcome Email Ingles
import { WelcomeEmailHtmlES } from "@/app/emails/WelcomeES"; //Welcome Email Español
import { UnsubscribeEmailHtmlES } from "@/app/emails/UnsuscribedEmailES"; //Unsuscribed Email Español
import { UnsubscribeEmailHtmlEN } from "@/app/emails/UnsuscribedEmailEN"; //Unsuscribed Email Ingles
import { useTranslation } from "react-i18next";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { i18n } = useTranslation(); 
  
  try {
    const { type, to, data } = await req.json();

    let emailContent: string;
    let subject;

    switch (type) {
      case "welcome":
        subject = i18n.language == 'en' ? "Welcome to Culinarium" : "Bienvenido a Culinarium";
        // Ahora llamamos a la función que devuelve el HTML en forma de string
        emailContent = i18n.language == 'en' ? WelcomeEmailHtmlEN({ name: data.firstName }) : WelcomeEmailHtmlES({ name: data.firstName });
        break;
      case "unsubscribe":
        if (!data || !data.name || !data.endDate) {
          return NextResponse.json({ error: "Faltan datos para el correo de desuscripción" }, { status: 400 });
        }
        subject = i18n.language == 'en' ? "Unsubscribe Confirmation" : "Confirmación de Cancelación de Suscripción";
        emailContent = i18n.language == 'en' ? UnsubscribeEmailHtmlEN({ name: data.name, endDate: data.endDate }) : UnsubscribeEmailHtmlES({ name: data.name, endDate: data.endDate });
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
