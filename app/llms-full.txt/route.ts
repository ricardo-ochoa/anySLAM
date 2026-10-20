import { buildLLMsFull } from '@/lib/llms';
import { canReadDocsFeed, docsFeedDenied } from '@/lib/docs-access';

/**
 * `/llms-full.txt` — toda la documentación en un solo archivo de texto.
 *
 * Es el complemento habitual de llms.txt: sirve para pasarle el portal entero a
 * un modelo de una vez, en lugar de que vaya pidiendo página por página.
 */
// Ya no se puede prerrenderizar: la respuesta depende de quién la pide.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await canReadDocsFeed(request))) return docsFeedDenied();

  return new Response(await buildLLMsFull('es'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Privada: la respuesta depende de la credencial, así que no debe
      // quedarse en ninguna caché compartida.
      'Cache-Control': 'private, no-store',
    },
  });
}
