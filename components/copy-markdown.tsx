'use client';

import { useCallback, useRef, useState } from 'react';

const LABELS = {
  es: {
    idle: 'Copiar Markdown',
    copying: 'Copiando…',
    done: '¡Copiado!',
    error: 'No se pudo copiar',
    view: 'Ver en Markdown',
  },
  en: {
    idle: 'Copy Markdown',
    copying: 'Copying…',
    done: 'Copied!',
    error: "Couldn't copy",
    view: 'View as Markdown',
  },
} as const;

type State = 'idle' | 'copying' | 'done' | 'error';

/**
 * Copia texto al portapapeles.
 *
 * `navigator.clipboard` no existe en contextos no seguros —por ejemplo si el
 * portal se sirve por HTTP en la red del laboratorio en vez de HTTPS— y algunos
 * navegadores deniegan el permiso. En esos casos se recurre a `execCommand`,
 * que está obsoleto pero sigue funcionando en todos ellos.
 */
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // permiso denegado: se intenta el método heredado
    }
  }

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '-9999px';
  document.body.appendChild(area);
  area.select();
  try {
    if (!document.execCommand('copy')) throw new Error('execCommand devolvió false');
  } finally {
    document.body.removeChild(area);
  }
}

/**
 * Copia al portapapeles el contenido completo de la página en Markdown.
 *
 * El texto se obtiene de `markdownUrl` (la propia URL de la página con `.md`),
 * que sirve app/llms.mdx/[lang]/docs/[[...slug]]/route.ts. Se cachea en memoria
 * para que copiar dos veces la misma página no vuelva a pedirla.
 */
export function CopyMarkdown({ markdownUrl, lang }: { markdownUrl: string; lang: string }) {
  const t = LABELS[lang as keyof typeof LABELS] ?? LABELS.es;
  const [state, setState] = useState<State>('idle');
  const cached = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  }, []);

  const onClick = useCallback(async () => {
    if (state === 'copying') return;
    setState('copying');
    try {
      let text = cached.current;
      if (text === null) {
        const res = await fetch(markdownUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
        cached.current = text;
      }
      await copyToClipboard(text);
      setState('done');
    } catch {
      setState('error');
    }
    reset();
  }, [markdownUrl, state, reset]);

  return (
    <div className="anyslam-pageactions">
      <button
        type="button"
        onClick={onClick}
        disabled={state === 'copying'}
        aria-live="polite"
        className="anyslam-pageaction"
        data-state={state}
      >
        {state === 'done' ? <CheckIcon /> : state === 'error' ? <AlertIcon /> : <CopyIcon />}
        {t[state]}
      </button>
      <a
        className="anyslam-pageaction"
        href={markdownUrl}
        target="_blank"
        rel="noreferrer"
        title={t.view}
      >
        <FileIcon />
        {t.view}
      </a>
    </div>
  );
}

const ICON = {
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function CopyIcon() {
  return (
    <svg {...ICON} aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...ICON} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg {...ICON} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg {...ICON} aria-hidden="true">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <path d="M14 2v5h5" />
    </svg>
  );
}
