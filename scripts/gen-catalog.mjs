#!/usr/bin/env node
/**
 * Genera las tablas del catálogo de repositorios a partir de
 * `data/repositories.yaml`, que es la fuente única de verdad.
 *
 * Salida:
 *   docs/03-repositories/repository-catalog.mdx      (español)
 *   docs/03-repositories/repository-catalog.en.mdx   (inglés)
 *
 * Uso: npm run gen:catalog   (se ejecuta solo en predev y prebuild)
 *
 * Es idempotente: correrlo dos veces no cambia el diff de git.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'docs', '03-repositories');

const data = parse(readFileSync(join(root, 'data', 'repositories.yaml'), 'utf8'));

const L = {
  es: {
    title: 'Catálogo de repositorios',
    description:
      'Todos los repositorios que forman el proyecto anySLAM, con su área, su responsable y su estado.',
    generated:
      'Esta página se genera automáticamente desde `data/repositories.yaml`. No la edites a mano: edita el YAML y ejecuta `npm run gen:catalog`.',
    reposHeading: 'Repositorios',
    resourcesHeading: 'Otros recursos del proyecto',
    detailHeading: 'Detalle por repositorio',
    cols: ['Repositorio', 'Área', 'Responsable', 'Estado', 'Acceso', 'Confianza'],
    resCols: ['Recurso', 'Tipo', 'Responsable'],
    fields: {
      repo: 'Repositorio',
      area: 'Área',
      owner: 'Responsable',
      status: 'Estado',
      language: 'Lenguaje principal',
      license: 'Licencia',
      last_push: 'Último push',
      visibility: 'Acceso',
      confidence: 'Confianza del dato',
    },
    visibility: { public: 'Público', private: 'Privado' },
    status: { Active: 'Activo', Development: 'En desarrollo', Experimental: 'Experimental', Research: 'Investigación', Deprecated: 'Obsoleto' },
    confidence: {
      confirmed: 'Confirmado',
      inferred: 'Inferido',
      unknown: 'Sin datos',
    },
    unknown: 'Por confirmar',
    legend: [
      '**Confirmado** — leído directamente del repositorio o de una fuente pública.',
      '**Inferido** — deducido del contexto. Debe verificarse con el responsable.',
      '**Sin datos** — no tenemos acceso al repositorio. Pendiente de su responsable.',
    ],
    missingLink:
      'Lo que falta por documentar y de quién depende está en [datos pendientes](/es/docs/03-repositories/missing-data).',
  },
  en: {
    title: 'Repository catalog',
    description:
      'Every repository that makes up the anySLAM project, with its area, maintainer and status.',
    generated:
      'This page is generated from `data/repositories.yaml`. Do not edit it by hand: edit the YAML and run `npm run gen:catalog`.',
    reposHeading: 'Repositories',
    resourcesHeading: 'Other project resources',
    detailHeading: 'Repository details',
    cols: ['Repository', 'Area', 'Maintainer', 'Status', 'Access', 'Confidence'],
    resCols: ['Resource', 'Kind', 'Maintainer'],
    fields: {
      repo: 'Repository',
      area: 'Area',
      owner: 'Maintainer',
      status: 'Status',
      language: 'Primary language',
      license: 'License',
      last_push: 'Last push',
      visibility: 'Access',
      confidence: 'Data confidence',
    },
    visibility: { public: 'Public', private: 'Private' },
    status: { Active: 'Active', Development: 'Development', Experimental: 'Experimental', Research: 'Research', Deprecated: 'Deprecated' },
    confidence: {
      confirmed: 'Confirmed',
      inferred: 'Inferred',
      unknown: 'No data',
    },
    unknown: 'To confirm',
    legend: [
      '**Confirmed** — read directly from the repository or from a public source.',
      '**Inferred** — deduced from context. Must be verified with the maintainer.',
      '**No data** — we have no access to the repository. Pending on its owner.',
    ],
    missingLink:
      'What is still undocumented, and who it depends on, is tracked in [missing data](/en/docs/03-repositories/missing-data).',
  },
};

/** Escapa el carácter de tubería para que no rompa las tablas markdown. */
const cell = (v) => String(v ?? '').replaceAll('|', '\\|');

const norm = (t, v) => (v === 'Unknown' || v == null ? t.unknown : v);

/** Estado del repositorio, traducido cuando conocemos el término. */
const status = (t, r) => t.status[r.status] ?? norm(t, r.status);

/**
 * Enlace al responsable. Por defecto se asume un usuario de GitHub; una entrada
 * puede sobrescribirlo con `owner_url` (p. ej. una organización de Azure DevOps),
 * o poner `owner_url: none` para mostrar el nombre sin enlace.
 */
function ownerLink(r) {
  const name = cell(r.owner_name);
  if (r.owner_url === 'none') return name;
  const url = r.owner_url ?? `https://github.com/${r.owner}`;
  return `[${name}](${cell(url)})`;
}

function slugAnchor(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function render(lang) {
  const t = L[lang];
  const desc = (r) => (lang === 'en' ? r.description_en : r.description).trim();
  const area = (r) => (lang === 'en' ? r.area_en : r.area);

  const lines = [];
  lines.push('---');
  lines.push(`title: ${t.title}`);
  lines.push(`description: ${t.description}`);
  lines.push('---');
  lines.push('');
  lines.push(`{/* GENERADO POR scripts/gen-catalog.mjs — NO EDITAR A MANO */}`);
  lines.push('');
  lines.push(t.generated);
  lines.push('');
  lines.push(`## ${t.reposHeading}`);
  lines.push('');
  lines.push(`| ${t.cols.join(' | ')} |`);
  lines.push(`| ${t.cols.map(() => '---').join(' | ')} |`);

  for (const r of data.repositories) {
    lines.push(
      `| [\`${cell(r.name)}\`](${cell(r.url)}) | ${cell(area(r))} | ${ownerLink(
        r,
      )} | ${cell(status(t, r))} | ${cell(
        t.visibility[r.visibility] ?? r.visibility,
      )} | ${cell(t.confidence[r.confidence] ?? r.confidence)} |`,
    );
  }

  lines.push('');
  for (const item of t.legend) lines.push(`- ${item}`);
  lines.push('');
  lines.push(t.missingLink);
  lines.push('');
  lines.push(`## ${t.detailHeading}`);
  lines.push('');

  for (const r of data.repositories) {
    lines.push(`### ${r.name}`);
    lines.push('');
    lines.push(desc(r));
    lines.push('');
    lines.push(`| | |`);
    lines.push(`| --- | --- |`);
    // Enlace explícito: MDX interpretaría un autolink <url> como JSX.
    lines.push(
      `| ${t.fields.repo} | [${cell(r.url.replace('https://', ''))}](${cell(r.url)}) |`,
    );
    lines.push(`| ${t.fields.area} | ${cell(area(r))} |`);
    lines.push(`| ${t.fields.owner} | ${ownerLink(r)} |`);
    lines.push(`| ${t.fields.status} | ${cell(status(t, r))} |`);
    lines.push(`| ${t.fields.language} | ${cell(norm(t, r.language))} |`);
    lines.push(`| ${t.fields.license} | ${cell(norm(t, r.license))} |`);
    lines.push(`| ${t.fields.last_push} | ${cell(norm(t, r.last_push))} |`);
    lines.push(`| ${t.fields.visibility} | ${cell(t.visibility[r.visibility] ?? r.visibility)} |`);
    lines.push(
      `| ${t.fields.confidence} | ${cell(t.confidence[r.confidence] ?? r.confidence)} |`,
    );
    lines.push('');
  }

  lines.push(`## ${t.resourcesHeading}`);
  lines.push('');
  lines.push(`| ${t.resCols.join(' | ')} |`);
  lines.push(`| ${t.resCols.map(() => '---').join(' | ')} |`);
  for (const r of data.resources ?? []) {
    lines.push(
      `| [${cell(r.name)}](${cell(r.url)}) | ${cell(
        lang === 'en' ? r.kind_en : r.kind,
      )} | ${ownerLink(r)} |`,
    );
  }
  lines.push('');

  return lines.join('\n');
}

for (const lang of ['es', 'en']) {
  const file = join(outDir, lang === 'es' ? 'repository-catalog.mdx' : 'repository-catalog.en.mdx');
  writeFileSync(file, render(lang), 'utf8');
  console.log(`gen-catalog: escrito ${file.replace(root + '/', '')}`);
}
