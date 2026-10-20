import { SignIn } from '@clerk/nextjs';

/**
 * La ruta es comodín porque Clerk navega dentro de ella para los pasos
 * intermedios —verificación por correo, segundo factor, recuperación—; con una
 * ruta fija, esos pasos darían 404.
 *
 * El nombre de la carpeta es el que genera `clerk init`, a propósito: si
 * alguien vuelve a correrlo, lo reconoce y no crea un duplicado. Dos comodines
 * en la misma carpeta impiden que Next arranque.
 */
export default function SignInPage() {
  return (
    <main className="anyslam-auth">
      <SignIn />
    </main>
  );
}
