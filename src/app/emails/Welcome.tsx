// Este no es un componente de React, es una función que genera una cadena de texto HTML.

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmailHtml({ name }: WelcomeEmailProps) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: sans-serif;
            background-color: #f6f6f6;
            padding: 20px;
            color: #333333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          h1 {
            color: #213547;
            font-size: 28px;
            margin-bottom: 15px;
          }
          p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
          }
          .logo {
            width: 80px;
            height: auto;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://placehold.co/80x80/213547/ffffff?text=C" alt="Culinarium Logo" class="logo">
          <h1>¡Bienvenido a Culinarium, ${name}!</h1>
          <p>Gracias por registrarte. Esperamos que disfrutes de nuestras recetas con IA 🍽️</p>
          <p>Explora un mundo de sabores y creatividad culinaria. ¡Estamos emocionados de tenerte aquí!</p>
        </div>
      </body>
    </html>
  `;
}
