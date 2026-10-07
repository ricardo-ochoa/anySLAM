'use client';

import { useRef, useState } from 'react';

export interface EmbedLabels {
  activate: string;
  release: string;
  open: string;
}

/**
 * El marco de una presentación incrustada.
 *
 * Nace inerte —`pointer-events:none` sobre el <iframe>— y hay que hacer clic
 * para usarlo. No es un trámite: las barajas ocupan el alto completo del marco
 * y capturan la rueda del ratón, así que sin esta capa alguien que solo baja
 * leyendo la página se queda atrapado pasando diapositivas. Soltarlo devuelve
 * el scroll a la página.
 *
 * El clic además mueve el foco al documento incrustado, que es lo que hace que
 * respondan sus flechas y su barra espaciadora.
 */
export function EmbedClient({
  src,
  title,
  height,
  labels,
}: {
  src: string;
  title: string;
  height: number;
  labels: EmbedLabels;
}) {
  const [active, setActive] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  const activate = () => {
    setActive(true);
    requestAnimationFrame(() => frame.current?.focus());
  };

  return (
    <figure className="anyslam-embed">
      <figcaption className="anyslam-embed-bar">
        <span>{title}</span>
        <span className="anyslam-embed-actions">
          {active && (
            <button type="button" onClick={() => setActive(false)}>
              {labels.release}
            </button>
          )}
          <a href={src} target="_blank" rel="noreferrer">
            {labels.open} ↗
          </a>
        </span>
      </figcaption>

      <div className="anyslam-embed-stage" style={{ height: `min(${height}px, 80vh)` }}>
        <iframe
          ref={frame}
          src={src}
          title={title}
          loading="lazy"
          data-active={active || undefined}
          allowFullScreen
        />
        {!active && (
          <button type="button" className="anyslam-embed-veil" onClick={activate}>
            <span>{labels.activate}</span>
          </button>
        )}
      </div>
    </figure>
  );
}
