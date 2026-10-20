'use client';

import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';

/**
 * El control de sesión de la barra superior: «Entrar» sin sesión, el avatar de
 * Clerk con ella.
 *
 * Va en el cliente y no en el servidor porque `baseOptions()` —donde se monta—
 * también lo usa la página 404, que es un componente de cliente, y desde ahí no
 * se puede renderizar un componente de servidor asíncrono.
 *
 * Ojo si vienes de ejemplos viejos: `<SignedIn>` y `<SignedOut>` ya no existen
 * en Core 3 del paquete. Los tipos siguen exportándose, así que TypeScript los
 * acepta sin rechistar y el fallo solo aparece al pedir la página. El sustituto
 * es `useAuth()`.
 */
export function AuthNav() {
  const { isLoaded, isSignedIn } = useAuth();

  // Mientras Clerk resuelve, el hueco se queda vacío pero reservado: el ancho
  // mínimo está en CSS para que la barra no dé un salto al decidirse.
  if (!isLoaded) return <span className="anyslam-authnav" aria-hidden="true" />;

  return (
    <span className="anyslam-authnav">
      {isSignedIn ? (
        <UserButton />
      ) : (
        <SignInButton mode="modal">
          <button type="button" className="anyslam-authnav-btn">
            Entrar
          </button>
        </SignInButton>
      )}
    </span>
  );
}
