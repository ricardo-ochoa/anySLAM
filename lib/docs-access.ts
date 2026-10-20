import { timingSafeEqual } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';

/**
 * Quién puede leer las rutas que alimentan a los asistentes de IA
 * (`/llms.txt`, `/llms-full.txt` y el Markdown de cada página).
 *
 * Tienen dos públicos distintos y por eso aceptan dos credenciales:
 *
 *   - El Company Brain, que las pide desde un servidor sin navegador ni
 *     cookies. Se identifica con un token compartido que solo conocen él y
 *     el portal.
 *   - Una persona del equipo que quiera abrirlas a mano, ya con su sesión.
 *
 * Si no hay token configurado, la vía del token queda cerrada: vale más que el
 * Brain falle con un 401 evidente a que un despliegue sin variables deje la
 * documentación abierta sin que nadie lo note.
 */
export async function canReadDocsFeed(request: Request): Promise<boolean> {
  if (matchesToken(request.headers.get('authorization'))) return true;

  const { userId } = await auth();
  return Boolean(userId);
}

function matchesToken(header: string | null): boolean {
  const expected = process.env.DOCS_ACCESS_TOKEN;
  if (!expected || !header?.startsWith('Bearer ')) return false;

  // Comparación en tiempo constante: un `===` sobre un secreto filtra, por lo
  // que tarda en fallar, cuántos caracteres iniciales acertó quien lo prueba.
  const provided = Buffer.from(header.slice(7));
  const target = Buffer.from(expected);
  return provided.length === target.length && timingSafeEqual(provided, target);
}

/** La respuesta cuando no pasa ninguna de las dos vías. */
export const docsFeedDenied = () =>
  new Response('Esta ruta requiere sesión o un token de acceso.\n', {
    status: 401,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
