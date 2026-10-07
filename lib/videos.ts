import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import type { Lang } from '@/lib/commands';

export interface Chapter {
  /** El sello tal y como se escribe en la descripción: `24:47`. */
  at: string;
  /** El mismo sello en segundos, que es lo que entiende YouTube. */
  seconds: number;
  label: string;
}

export interface Video {
  /** Identificador del video en YouTube. */
  id: string;
  title: string;
  note: string;
  /** Idioma hablado. Si no es el de la página, la guía lo advierte. */
  spoken: Lang;
  chapters: Chapter[];
}

interface RawVideo {
  id: string;
  spoken?: Lang;
  title: string;
  title_en?: string;
  note?: string;
  note_en?: string;
  chapters?: string[];
}

const DATA_DIR = path.join(process.cwd(), 'data', 'videos');
const cache = new Map<string, Video>();

/** El nombre del archivo viene de una prop de MDX; aun así no se confía en él. */
function dataFile(name: string): string {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Nombre de video inválido: ${name}`);
  return path.join(DATA_DIR, `${name}.yaml`);
}

/** `48:55` y `1:02:30` son los dos formatos que usa YouTube. */
function toSeconds(stamp: string): number {
  return stamp.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

/**
 * Una línea de capítulo es la que se copia de la descripción de YouTube:
 * el sello, un espacio y el título. Si alguna no tiene esa forma se rompe el
 * build a propósito: vale más eso que publicar una lista a medias.
 */
function toChapter(line: string, file: string): Chapter {
  const parts = /^(\d{1,2}(?::\d{2}){1,2})\s+(.+)$/.exec(line.trim());
  if (!parts) throw new Error(`Capítulo sin formato "m:ss Título" en ${file}: ${line}`);
  return { at: parts[1], seconds: toSeconds(parts[1]), label: parts[2] };
}

/**
 * Lee `data/videos/<name>.yaml` y devuelve el video en un solo idioma.
 *
 * Se ejecuta en el servidor durante el build y se cachea, porque el mismo video
 * aparece en la página española y en la inglesa.
 */
export function loadVideo(name: string, lang: Lang): Video {
  const key = `${name}:${lang}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const file = dataFile(name);
  const raw = parse(readFileSync(file, 'utf8')) as RawVideo;
  const en = lang === 'en';

  const video: Video = {
    id: raw.id,
    title: (en ? raw.title_en : raw.title) ?? raw.title,
    note: (en ? raw.note_en : raw.note) ?? raw.note ?? '',
    spoken: raw.spoken ?? 'es',
    chapters: (raw.chapters ?? []).map((line) => toChapter(line, file)),
  };

  cache.set(key, video);
  return video;
}
