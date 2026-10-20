import { Waitlist } from '@clerk/nextjs';

/**
 * Quien llega por su cuenta deja su correo aquí y espera aprobación. Las
 * invitaciones directas que manda un admin desde el panel de Clerk no pasan por
 * esta página: ese correo lleva a crear la cuenta sin hacer cola.
 *
 * Para que esto funcione, en el panel de Clerk el modo de registro tiene que
 * estar en «Waitlist» (Restrictions → Sign-up mode).
 */
export default function WaitlistPage() {
  return (
    <main className="anyslam-auth">
      <Waitlist />
    </main>
  );
}
