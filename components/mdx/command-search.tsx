import { asMarkdown, md } from 'fumadocs-core/server';
import { loadCommands, type Lang } from '@/lib/commands';
import { CommandSearchClient } from '@/components/mdx/command-search-client';

const LABELS = {
  es: {
    placeholder: 'eliminar volumen',
    aria: 'Buscar comandos',
    empty: 'Nada coincide con',
    tryWith: 'Prueba con',
    one: 'comando',
    many: 'comandos',
    copy: 'Copiar',
    copied: 'Copiado',
    all: 'Todo',
    destructive: 'Las filas marcadas en rojo borran cosas.',
    headers: ['Comando', 'Qué hace', 'Cómo se escribe'],
  },
  en: {
    placeholder: 'delete volume',
    aria: 'Search commands',
    empty: 'Nothing matches',
    tryWith: 'Try',
    one: 'command',
    many: 'commands',
    copy: 'Copy',
    copied: 'Copied',
    all: 'All',
    destructive: 'Rows marked in red delete things.',
    headers: ['Command', 'What it does', 'How you write it'],
  },
} as const;

/** Las tablas de Markdown se rompen con un `|` sin escapar. */
const cell = (value: string) => value.replaceAll('|', '\\|');

/**
 * Referencia de comandos con buscador, alimentada por `data/commands/<tech>.yaml`.
 *
 * En el navegador es un buscador: se escribe el comando o lo que se quiere
 * hacer ("eliminar volumen") y filtra por sinónimos. Sin nada escrito muestra
 * la lista completa agrupada por categoría, así que también sirve de tabla.
 *
 * Al exportar la página como Markdown —el botón "Copiar Markdown" y las rutas
 * `.md` que consumen los modelos— no puede haber un componente interactivo, así
 * que se serializa como tablas, una por categoría.
 */
export function CommandSearch({ tech, lang = 'es' }: { tech: string; lang?: Lang }) {
  const set = loadCommands(tech, lang);
  const t = LABELS[lang] ?? LABELS.es;

  if (asMarkdown()) {
    const tables = set.groups
      .map((group) => {
        const rows = group.commands
          .map(
            (c) =>
              `| \`${cell(c.cmd)}\` | ${cell(c.does)}${c.destructive ? ' ⚠️' : ''} | \`${cell(c.example)}\` |`,
          )
          .join('\n');
        return `### ${group.name}\n\n| ${t.headers.join(' | ')} |\n| --- | --- | --- |\n${rows}`;
      })
      .join('\n\n');

    return md`${`${set.note}\n\n${tables}\n\n${t.destructive}`}`;
  }

  return <CommandSearchClient set={set} labels={t} />;
}
