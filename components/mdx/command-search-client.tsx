'use client';

import { useMemo, useRef, useState, useEffect, type ReactNode } from 'react';
import { copyToClipboard } from '@/components/copy-markdown';
import type { CommandSet } from '@/lib/commands';

export interface CommandSearchLabels {
  placeholder: string;
  aria: string;
  empty: string;
  tryWith: string;
  one: string;
  many: string;
  copy: string;
  copied: string;
  all: string;
  destructive: string;
  headers: readonly string[];
}

/** Minúsculas y sin acentos: "Volúmenes" y "volumenes" deben ser lo mismo. */
const norm = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

interface Row {
  group: string;
  cmd: string;
  does: string;
  example: string;
  destructive: boolean;
  haystack: string;
}

/** Fragmenta un texto en partes normales y coincidencias, para resaltarlas. */
function highlight(text: string, tokens: string[]): ReactNode {
  if (tokens.length === 0) return text;

  const hay = norm(text);
  const ranges: [number, number][] = [];
  for (const token of tokens) {
    let i = hay.indexOf(token);
    while (i !== -1) {
      ranges.push([i, i + token.length]);
      i = hay.indexOf(token, i + token.length);
    }
  }
  if (ranges.length === 0) return text;

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [ranges[0]];
  for (const range of ranges.slice(1)) {
    const last = merged[merged.length - 1];
    if (range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push(range);
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([start, end], index) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(<mark key={index}>{text.slice(start, end)}</mark>);
    cursor = end;
  });
  parts.push(text.slice(cursor));
  return parts;
}

/**
 * Buscador de comandos.
 *
 * Busca por el nombre del comando y por lo que hace: los sinónimos de
 * `data/commands/synonyms.yaml` expanden cada palabra escrita, así que
 * "eliminar" también encuentra los `prune` y los `rm`. Cuando se escriben
 * varias palabras deben coincidir todas, para que "eliminar volumen" no
 * devuelva todo lo que elimina algo.
 */
export function CommandSearchClient({
  set,
  labels,
}: {
  set: CommandSet;
  labels: CommandSearchLabels;
}) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const rows = useMemo<Row[]>(
    () =>
      set.groups.flatMap((g) =>
        g.commands.map((command) => ({
          group: g.name,
          cmd: command.cmd,
          does: command.does,
          example: command.example,
          destructive: command.destructive,
          haystack: norm([command.cmd, command.does, command.example, command.keywords, g.name].join(' ')),
        })),
      ),
    [set],
  );

  const synonyms = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const cluster of set.synonyms) {
      for (const word of cluster) {
        const key = word.trim();
        map.set(key, [...(map.get(key) ?? []), ...cluster]);
      }
    }
    return map;
  }, [set]);

  const tokens = useMemo(
    () => norm(query.trim()).split(/\s+/).filter(Boolean),
    [query],
  );

  const found = useMemo(() => {
    const expanded = tokens.map((token) => [...new Set([token, ...(synonyms.get(token) ?? [])])]);
    return rows.filter(
      (row) =>
        (group === null || row.group === group) &&
        expanded.every((variants) => variants.some((v) => row.haystack.includes(v))),
    );
  }, [rows, tokens, synonyms, group]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const active = document.activeElement;
      if (event.key === '/' && active !== input.current) {
        event.preventDefault();
        input.current?.focus();
      }
      if (event.key === 'Escape' && active === input.current) setQuery('');
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  async function copy(example: string) {
    try {
      await copyToClipboard(example);
      setCopied(example);
      setTimeout(() => setCopied((current) => (current === example ? null : current)), 1400);
    } catch {
      // sin portapapeles el ejemplo sigue visible para copiarlo a mano
    }
  }

  const groupNames = set.groups.map((g) => g.name);

  return (
    <div className="anyslam-cmd">
      <div className="anyslam-cmd-search">
        <span className="anyslam-cmd-prompt" aria-hidden="true">
          $
        </span>
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={labels.placeholder}
          aria-label={labels.aria}
          autoComplete="off"
          spellCheck={false}
        />
        <span className="anyslam-cmd-hint" aria-hidden="true">
          /
        </span>
      </div>

      <div className="anyslam-cmd-filters" role="group" aria-label={labels.aria}>
        {groupNames.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={group === name}
            onClick={() => setGroup((current) => (current === name ? null : name))}
          >
            {name}
          </button>
        ))}
      </div>

      <p className="anyslam-cmd-count">
        {found.length} {found.length === 1 ? labels.one : labels.many}
        {set.note ? ` · ${set.note}` : ''}
      </p>

      {found.length === 0 ? (
        <p className="anyslam-cmd-empty">
          {labels.empty} “{query}”. {labels.tryWith} <code>{labels.placeholder.split(' ')[0]}</code>.
        </p>
      ) : (
        set.groups.map((g) => {
          const groupRows = found.filter((row) => row.group === g.name);
          if (groupRows.length === 0) return null;
          return (
            <section key={g.id} className="anyslam-cmd-group">
              <h3>{g.name}</h3>
              {groupRows.map((row) => (
                <div
                  key={row.cmd}
                  className="anyslam-cmd-row"
                  data-destructive={row.destructive || undefined}
                >
                  <code className="anyslam-cmd-name">{highlight(row.cmd, tokens)}</code>
                  <button type="button" onClick={() => copy(row.example)}>
                    {copied === row.example ? labels.copied : labels.copy}
                  </button>
                  <p>{highlight(row.does, tokens)}</p>
                  <pre>{row.example}</pre>
                </div>
              ))}
            </section>
          );
        })
      )}

      <p className="anyslam-cmd-legend">{labels.destructive}</p>
    </div>
  );
}
