import { asMarkdown, md } from 'fumadocs-core/server';
import type { Lang } from '@/lib/commands';
import { siteUrl } from '@/lib/site';
import { EmbedClient } from '@/components/mdx/embed-client';

const LABELS = {
  es: {
    activate: 'Haz clic para usar la presentación',
    release: 'Soltar el marco',
    open: 'Abrir a pantalla completa',
  },
  en: {
    activate: 'Click to use the deck',
    release: 'Release frame',
    open: 'Open full screen',
  },
} as const;

/**
 * Incrusta una página HTML autocontenida de `public/slides` —las presentaciones
 * del equipo— dentro de una guía.
 *
 * Van en un <iframe> y no convertidas a MDX porque son documentos terminados,
 * con su tipografía, sus animaciones y su navegación por teclado: lo que se
 * quiere es consultarlas tal como se dieron en clase.
 *
 * El alto se pasa en píxeles porque cada baraja tiene el suyo, y se recorta a la
 * altura de la ventana para que nunca sea más alto que la pantalla. La columna
 * de documentación es estrecha para una presentación pensada en 1080p, así que
 * el enlace de pantalla completa no es un extra: es la forma de verla.
 *
 * Al exportar la página como Markdown queda el enlace al archivo, que es lo
 * único que sobrevive fuera del navegador.
 */
export function Embed({
  src,
  title,
  height = 560,
  lang = 'es',
}: {
  src: string;
  title: string;
  height?: number;
  lang?: Lang;
}) {
  // Absoluta: este Markdown se lee fuera del sitio, donde `/slides/...` no
  // resuelve contra nada.
  if (asMarkdown()) return md`${`[${title}](${new URL(src, siteUrl).href})`}`;

  return <EmbedClient src={src} title={title} height={height} labels={LABELS[lang] ?? LABELS.es} />;
}
