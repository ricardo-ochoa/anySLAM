import { buildLLMsFull } from '@/lib/llms';

/**
 * `/llms-full.txt` — toda la documentación en un solo archivo de texto.
 *
 * Es el complemento habitual de llms.txt: sirve para pasarle el portal entero a
 * un modelo de una vez, en lugar de que vaya pidiendo página por página.
 */
export const revalidate = false;
export const dynamic = 'force-static';

export async function GET() {
  return new Response(await buildLLMsFull('es'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
