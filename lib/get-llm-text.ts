import type { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx';

const HEADER = {
  es: 'Fuente',
  en: 'Source',
} as const;

/**
 * El serializador de Fumadocs (16.15.4) escapa el delimitador de apertura
 * cuando un énfasis empieza con puntuación Unicode (`*¿pregunta?*`) o contiene
 * código inline (`**sin \`sudo\`**`). El resultado es `&#x2A;*sin \`sudo\`**`,
 * que al volver a interpretarse pierde la negrita. mdast por sí solo no tiene
 * ese problema.
 *
 * Se revierte solo el escapado de los tres delimitadores de Markdown, nunca
 * otras entidades. Si algún día una página necesitara un asterisco literal,
 * habría que revisar esto.
 */
function unescapeDelimiters(markdown: string): string {
  return markdown
    .replaceAll('&#x2A;', '*')
    .replaceAll('&#x5F;', '_')
    .replaceAll('&#x60;', '`');
}

/**
 * Convierte una página del portal en Markdown plano, con un encabezado que
 * indica de dónde salió. Lo consumen la ruta `.md` de cada página y el botón
 * de "Copiar Markdown".
 *
 * Se le pasan los componentes MDX para que Mermaid y Callout se serialicen a
 * Markdown legible en vez de a JSX crudo.
 */
export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed', {
    components: getMDXComponents(),
  });

  const label = HEADER[page.locale as keyof typeof HEADER] ?? HEADER.es;
  const description = page.data.description ? `> ${page.data.description}\n>\n` : '';

  return `# ${page.data.title}

${description}> ${label}: anySLAM — ${page.url}

${unescapeDelimiters(processed)}`;
}
