import * as React from 'react';

export default function PasswordResetEmail({ resetLink }: { resetLink: string }) {
  return (
    <div>
      <h1>Recupera tu contraseña</h1>
      <p>Haz clic en el siguiente enlace para restablecerla:</p>
      <a href={resetLink}>{resetLink}</a>
    </div>
  );
}
