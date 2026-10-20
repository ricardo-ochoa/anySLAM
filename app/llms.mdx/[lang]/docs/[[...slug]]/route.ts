import { notFound } from 'next/navigation';
import { source } from '@/lib/source';
import { getLLMText } from '@/lib/get-llm-text';
import { canReadDocsFeed, docsFeedDenied } from '@/lib/docs-access';

/**
 * Sirve el Markdown crudo de cada página de documentación.
 *
 * No se accede a esta ruta directamente: `next.config.mjs` reescribe
 * `/{lang}/docs/{ruta}.md` hacia aquí. Eso permite que cualquier página del
 * portal se lea como Markdown añadiendo `.md` a su URL, y es lo que consume el
 * botón "Copiar Markdown".
 */
// Ya no se prerrenderiza: la respuesta depende de quién la pide.
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: RouteContext<'/llms.mdx/[lang]/docs/[[...slug]]'>,
) {
  if (!(await canReadDocsFeed(request))) return docsFeedDenied();

  const { lang, slug } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}
