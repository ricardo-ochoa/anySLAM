import { buildLLMsIndex } from '@/lib/llms';
import { canReadDocsFeed, docsFeedDenied } from '@/lib/docs-access';

/**
 * `/llms.txt` — el índice que leen los asistentes de IA (llmstxt.org).
 *
 * Va en la raíz y en español, que es el idioma original del portal. El propio
 * archivo explica que cada página existe también en inglés y cómo pedir
 * cualquiera de las dos en Markdown.
 *
 * `proxy.ts` tiene que dejar pasar esta ruta: el middleware de idioma la
 * mandaría a /es/llms.txt y los rastreadores la piden sin prefijo.
 */
// Ya no se puede prerrenderizar: la respuesta depende de quién la pide.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await canReadDocsFeed(request))) return docsFeedDenied();

  return new Response(buildLLMsIndex('es'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Privada: la respuesta depende de la credencial, así que no debe
      // quedarse en ninguna caché compartida.
      'Cache-Control': 'private, no-store',
    },
  });
}
