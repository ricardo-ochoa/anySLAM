'use client';

import { useState } from 'react';
import type { Chapter } from '@/lib/videos';

export interface VideoLabels {
  chapters: string;
  jump: string;
}

/**
 * El reproductor y su lista de capítulos.
 *
 * Saltar a un capítulo no usa la IFrame API de YouTube: basta con volver a
 * montar el <iframe> con `start` y `autoplay`, y eso evita cargar un script de
 * terceros en todas las páginas que lleven video. El `key` es lo que fuerza ese
 * remonte; sin él, React reutiliza el nodo y el src nuevo se ignora.
 *
 * El dominio es `youtube-nocookie.com` y el iframe es `lazy`: sin reproducir,
 * la página no deja nada en el navegador de quien solo pasaba leyendo.
 */
export function VideoClient({
  id,
  title,
  chapters,
  labels,
}: {
  id: string;
  title: string;
  chapters: Chapter[];
  labels: VideoLabels;
}) {
  const [at, setAt] = useState<number | null>(null);

  const src =
    `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` +
    (at === null ? '' : `&start=${at}&autoplay=1`);

  return (
    <div className="anyslam-video">
      <div className="anyslam-video-stage">
        <iframe
          key={at ?? 'inicio'}
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      {chapters.length > 0 && (
        <nav className="anyslam-video-chapters" aria-label={labels.chapters}>
          <p className="anyslam-video-head">{labels.chapters}</p>
          <ol>
            {chapters.map((chapter) => (
              <li key={chapter.seconds}>
                <button
                  type="button"
                  onClick={() => setAt(chapter.seconds)}
                  aria-current={at === chapter.seconds || undefined}
                  title={`${labels.jump} ${chapter.at}`}
                >
                  <span className="anyslam-video-at">{chapter.at}</span>
                  <span>{chapter.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
}
