import { readFileSync } from 'node:fs';
import path from 'node:path';
import { source } from '@/lib/source';
import { siteUrl } from '@/lib/site';
import { getLLMText } from '@/lib/get-llm-text';
import type { Lang } from '@/lib/commands';

/**
 * Generación de `/llms.txt` — el índice que leen los asistentes de IA.
 *
 * El formato es el de llmstxt.org: un H1 con el nombre del sitio, una cita con
 * el resumen de una línea, prosa de contexto y secciones `##` con listas de
 * enlaces. Los enlaces apuntan a la versión Markdown de cada página (`.md`),
 * que es lo que pide la convención: así quien lo lea recibe el texto y no el
 * HTML del portal.
 *
 * Se arma recorriendo el árbol de páginas de Fumadocs, no a mano. Una página
 * nueva aparece en el índice sin que nadie se acuerde de añadirla, que es la
 * única forma de que un archivo así siga siendo cierto dentro de seis meses.
 */

const COPY = {
  es: {
    summary:
      'Portal central de documentación del proyecto de investigación anySLAM: SLAM, navegación y locomoción aprendida sobre el robot cuadrúpedo ANYmal D de ANYbotics, en el Tecnológico de Monterrey, Campus Monterrey.',
    scope:
      'Este portal explica qué existe en el sistema, quién mantiene cada parte y cómo encajan las piezas. No reemplaza la documentación técnica de los repositorios del equipo: para instalar, configurar o ejecutar un componente, la fuente es el repositorio de ese componente, y desde aquí se enlaza.',
    markdown:
      'Cualquier página se puede leer en Markdown añadiendo `.md` a su URL. Los enlaces de esta lista ya apuntan a esa versión; quitando el `.md` se llega a la página del portal.',
    languages:
      'El contenido existe en español (`/es/…`) y en inglés (`/en/…`). El español es el original; la traducción al inglés puede ir por detrás. Esta lista enumera la versión en español.',
    full: (url: string) =>
      `El texto completo de toda la documentación, en un solo archivo, está en ${url}.`,
    entry: 'Punto de entrada',
  },
  en: {
    summary:
      'Documentation hub for the anySLAM research project: SLAM, navigation and learned locomotion on the ANYmal D quadruped by ANYbotics, at Tecnológico de Monterrey, Campus Monterrey.',
    scope:
      'This portal explains what exists in the system, who maintains each part, and how the pieces fit together. It does not replace the technical documentation of the team repositories: to install, configure or run a component, the source is that component’s repository, linked from here.',
    markdown:
      'Any page can be read as Markdown by appending `.md` to its URL. The links below already point to that version; drop the `.md` to reach the portal page.',
    languages:
      'Content exists in Spanish (`/es/…`) and English (`/en/…`). Spanish is the original; the English translation may lag behind. This list enumerates the English version.',
    full: (url: string) => `The full text of the whole documentation, in a single file, is at ${url}.`,
    entry: 'Start here',
  },
} as const;

interface FolderMeta {
  title?: string;
  pages?: string[];
}

/**
 * El título y el orden de una sección salen de su `meta.json`, no del árbol de
 * páginas de Fumadocs. El árbol obedece al `meta.json` raíz, y ese deja fuera a
 * propósito algunas secciones —Repositorios y Onboarding viven en la barra
 * superior, no en la lateral—, así que recorrerlo dejaría fuera del índice
 * páginas que sí queremos que un modelo encuentre.
 */
function folderMeta(folder: string, lang: Lang): FolderMeta {
  const dir = path.join(process.cwd(), 'docs', folder);
  for (const name of lang === 'en' ? ['meta.en.json', 'meta.json'] : ['meta.json']) {
    try {
      return JSON.parse(readFileSync(path.join(dir, name), 'utf8')) as FolderMeta;
    } catch {
      // La siguiente, y si no queda ninguna se usa el nombre de la carpeta.
    }
  }
  return {};
}

/** `04-hardware` → `hardware`, por si una sección no tuviera `meta.json`. */
const folderName = (folder: string) => folder.replace(/^\d+-/, '');

/** Las descripciones de una línea no pueden traer saltos: cada enlace es una fila. */
const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();

type Page = ReturnType<typeof source.getPages>[number];

function pageLine(page: Page): string {
  const description = page.data.description ? `: ${oneLine(page.data.description)}` : '';
  return `- [${page.data.title}](${siteUrl}${page.url}.md)${description}`;
}

export function buildLLMsIndex(lang: Lang): string {
  const t = COPY[lang] ?? COPY.es;
  const pages = source.getPages(lang);

  const parts: string[] = [
    '# anySLAM',
    '',
    `> ${t.summary}`,
    '',
    t.scope,
    '',
    t.markdown,
    '',
    t.languages,
    '',
    t.full(`${siteUrl}/llms-full.txt`),
  ];

  // La bienvenida no cuelga de ninguna sección: es la raíz de /docs.
  const root = pages.filter((page) => page.slugs.length === 0);
  if (root.length > 0) {
    parts.push('', `## ${t.entry}`, '', ...root.map(pageLine));
  }

  // Las carpetas vienen numeradas (`01-introduction`, `02-architecture`…), así
  // que ordenarlas por nombre las deja en el orden en que se leen.
  const folders = new Map<string, Page[]>();
  for (const page of pages) {
    if (page.slugs.length === 0) continue;
    const folder = page.slugs[0];
    const group = folders.get(folder);
    if (group) group.push(page);
    else folders.set(folder, [page]);
  }

  for (const folder of [...folders.keys()].sort()) {
    const meta = folderMeta(folder, lang);
    const group = folders.get(folder) ?? [];
    const order = meta.pages ?? [];

    const position = (page: Page) => {
      const index = order.indexOf(page.slugs[page.slugs.length - 1]);
      return index === -1 ? order.length : index;
    };
    group.sort((a, b) => position(a) - position(b) || a.url.localeCompare(b.url));

    parts.push('', `## ${meta.title ?? folderName(folder)}`, '', ...group.map(pageLine));
  }

  return `${parts.join('\n')}\n`;
}

/**
 * `/llms-full.txt`: toda la documentación concatenada, separada por reglas
 * horizontales. Es lo que se le pasa a un modelo cuando se quiere que tenga el
 * portal entero en contexto, sin ir pidiendo página por página.
 */
export async function buildLLMsFull(lang: Lang): Promise<string> {
  const pages = source.getPages(lang);
  const bodies = await Promise.all(pages.map((page) => getLLMText(page)));

  return `${bodies.join('\n\n---\n\n')}\n`;
}
