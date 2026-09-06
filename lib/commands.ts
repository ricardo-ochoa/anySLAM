import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export type Lang = 'es' | 'en';

export interface CommandEntry {
  /** El comando en sí, por ejemplo `docker volume rm`. */
  cmd: string;
  /** Qué hace, en el idioma pedido. */
  does: string;
  /** Ejemplo completo de cómo se escribe. */
  example: string;
  /** Palabras con las que alguien lo buscaría sin saber su nombre. */
  keywords: string;
  /** Borra datos o recursos: la fila se marca en rojo. */
  destructive: boolean;
}

export interface CommandGroup {
  id: string;
  name: string;
  commands: CommandEntry[];
}

export interface CommandSet {
  tech: string;
  name: string;
  note: string;
  groups: CommandGroup[];
  synonyms: string[][];
}

interface RawCommand {
  cmd: string;
  does: string;
  does_en?: string;
  example: string;
  keywords?: string;
  keywords_en?: string;
  destructive?: boolean;
}

interface RawFile {
  tech: string;
  name: string;
  note?: string;
  note_en?: string;
  categories: { id: string; name: string; name_en?: string; commands: RawCommand[] }[];
}

const DATA_DIR = path.join(process.cwd(), 'data', 'commands');
const cache = new Map<string, CommandSet>();

/** El nombre del archivo viene de una prop de MDX; aun así no se confía en él. */
function dataFile(name: string): string {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Nombre de tecnología inválido: ${name}`);
  return path.join(DATA_DIR, `${name}.yaml`);
}

function readYaml<T>(file: string): T {
  return parse(readFileSync(file, 'utf8')) as T;
}

/**
 * Lee `data/commands/<tech>.yaml` y devuelve sus comandos en un solo idioma,
 * con los sinónimos de búsqueda que le corresponden.
 *
 * Se ejecuta en el servidor durante el build: el resultado se cachea porque la
 * misma tecnología aparece en la página española y en la inglesa.
 */
export function loadCommands(tech: string, lang: Lang): CommandSet {
  const key = `${tech}:${lang}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const raw = readYaml<RawFile>(dataFile(tech));
  const synonyms = readYaml<Record<Lang, string[][]>>(path.join(DATA_DIR, 'synonyms.yaml'));
  const en = lang === 'en';

  const set: CommandSet = {
    tech: raw.tech,
    name: raw.name,
    note: (en ? raw.note_en : raw.note) ?? raw.note ?? '',
    groups: raw.categories.map((category) => ({
      id: category.id,
      name: (en ? category.name_en : category.name) ?? category.name,
      commands: category.commands.map((command) => ({
        cmd: command.cmd,
        does: (en ? command.does_en : command.does) ?? command.does,
        example: command.example,
        keywords: (en ? command.keywords_en : command.keywords) ?? command.keywords ?? '',
        destructive: command.destructive === true,
      })),
    })),
    synonyms: synonyms[lang] ?? synonyms.es,
  };

  cache.set(key, set);
  return set;
}
