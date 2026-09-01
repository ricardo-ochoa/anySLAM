# Cómo contribuir a anySLAM

Este repositorio es el portal central de documentación del proyecto **anySLAM**. Aquí se
documenta la visión global del sistema; la documentación técnica de cada componente vive en su
propio repositorio.

## Qué se documenta aquí y qué no

| Aquí | En cada repositorio |
| --- | --- |
| Qué existe | Cómo funciona por dentro |
| Por qué existe | Cómo instalarlo |
| Dónde está | Cómo configurarlo |
| Quién lo mantiene | Cómo desarrollarlo |
| Cómo se relaciona con lo demás | Cómo probarlo |

Si la respuesta cambia cuando alguien hace un commit en un repositorio de componente, la
respuesta pertenece a ese repositorio, no aquí.

## Preparar el entorno

Necesitas Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

El portal queda en `http://localhost:3000`.

## Estructura

```
docs/          contenido bilingüe (.mdx = español, .en.mdx = inglés)
data/          repositories.yaml — fuente única del catálogo
templates/     plantilla de README y cuestionario de intake
scripts/       gen-catalog.mjs y bootstrap.sh
app/ lib/      la aplicación Next.js del portal
```

## Reglas al escribir

1. **Cada página existe en dos idiomas.** `pagina.mdx` en español y `pagina.en.mdx` en inglés. Si
   editas una, edita la otra.
2. **Nunca inventes.** Si no sabes algo, márcalo como pendiente con un `<Callout type="warn">` y
   añádelo a `docs/03-repositories/missing-data.mdx`, diciendo de quién depende el dato. Un hueco
   visible es mejor que una descripción plausible pero falsa.
3. **Cita la fuente de las cifras.** Si escribes un número, di de qué archivo salió.
4. **Diagramas en Mermaid**, en bloques ` ```mermaid `. Se ven bien en GitHub y en el portal.
5. **Todo debe leerse en GitHub.** Markdown plano; componentes JSX solo cuando de verdad aporten.
6. **Cuidado con los dos puntos en el frontmatter.** Un `title` o `description` que contenga `: `
   rompe el parseo del YAML. Usa una raya (`—`).

## Exportar una página como Markdown

Cualquier página se lee como Markdown añadiendo `.md` a su URL, y cada página tiene arriba un
botón **Copiar Markdown**. Lo sirve `app/llms.mdx/[lang]/docs/[[...slug]]/route.ts`, con la
reescritura declarada en `next.config.mjs`.

Para que el texto exportado se lea bien, `Mermaid` y `Callout` definen su forma en Markdown con
`asMarkdown()` (ver `components/mdx/`). Si añades un componente MDX propio que deba exportarse
como algo distinto a JSX, haz lo mismo.

## El catálogo de repositorios se genera

No edites `docs/03-repositories/repository-catalog.mdx` ni su versión en inglés: se sobrescriben.

```bash
# 1. edita data/repositories.yaml
# 2. regenera
npm run gen:catalog
# 3. commitea el YAML y las páginas generadas juntos
```

## Antes de abrir un Pull Request

```bash
npm run build
```

Debe pasar sin errores. El build valida el frontmatter, el MDX y todas las rutas.

## Añadir un repositorio al proyecto

1. Que cumpla el [estándar de repositorio](docs/07-standards/repository-standard.mdx).
2. Añade su entrada en `data/repositories.yaml`.
3. `npm run gen:catalog`.
4. Pull Request.

## Si mantienes un repositorio del proyecto

La forma más rápida de ayudar es llenar `templates/repo-intake.md`. Son doce preguntas y
desbloquean la mayor parte de lo que hoy falta en el portal.
