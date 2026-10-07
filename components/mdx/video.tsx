import { asMarkdown, md } from 'fumadocs-core/server';
import { loadVideo } from '@/lib/videos';
import type { Lang } from '@/lib/commands';
import { VideoClient } from '@/components/mdx/video-client';

const LABELS = {
  es: {
    chapters: 'Capítulos',
    jump: 'Reproducir desde',
    watch: 'Ver en YouTube',
    spoken: 'La clase está hablada en español.',
  },
  en: {
    chapters: 'Chapters',
    jump: 'Play from',
    watch: 'Watch on YouTube',
    spoken: 'The class is spoken in Spanish.',
  },
} as const;

/**
 * Una clase grabada, con su lista de capítulos, leída de
 * `data/videos/<name>.yaml`.
 *
 * Al exportar la página como Markdown —el botón "Copiar Markdown" y las rutas
 * `.md` que consumen los modelos— no puede ir un reproductor, así que se
 * serializa como el enlace al video y una lista de capítulos enlazados por
 * `&t=`, que es la forma de YouTube de abrir en un minuto concreto.
 */
export function Video({ name, lang = 'es' }: { name: string; lang?: Lang }) {
  const video = loadVideo(name, lang);
  const t = LABELS[lang] ?? LABELS.es;
  const url = `https://www.youtube.com/watch?v=${video.id}`;

  if (asMarkdown()) {
    const chapters = video.chapters
      .map((c) => `- [${c.at}](${url}&t=${c.seconds}s) — ${c.label}`)
      .join('\n');

    return md`${[`**[${video.title}](${url})**`, video.note, chapters]
      .filter(Boolean)
      .join('\n\n')}`;
  }

  return (
    <figure className="anyslam-video-wrap">
      <VideoClient
        id={video.id}
        title={video.title}
        chapters={video.chapters}
        labels={{ chapters: t.chapters, jump: t.jump }}
      />
      <figcaption>
        {video.note}{' '}
        {video.spoken !== lang && <span className="anyslam-video-spoken">{t.spoken}</span>}{' '}
        <a href={url} target="_blank" rel="noreferrer">
          {t.watch} ↗
        </a>
      </figcaption>
    </figure>
  );
}
