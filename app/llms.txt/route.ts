import { buildLLMsIndex } from '@/lib/llms';

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
export const revalidate = false;
export const dynamic = 'force-static';

export function GET() {
  return new Response(buildLLMsIndex('es'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
