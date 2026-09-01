import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { asMarkdown, md } from 'fumadocs-core/server';
import { renderMermaidSVG } from 'beautiful-mermaid';

/**
 * Renderiza los diagramas en el servidor como SVG. Si un diagrama tiene un
 * error de sintaxis se muestra el código fuente en vez de romper la página.
 *
 * Al exportar la página como Markdown vuelve a ser un bloque ```mermaid, que es
 * como está escrito en el archivo original y como lo renderiza GitHub.
 */
export function Mermaid({ chart }: { chart: string }) {
  if (asMarkdown()) return md`\`\`\`mermaid\n${chart}\n\`\`\``;

  try {
    const svg = renderMermaidSVG(chart, {
      bg: 'var(--color-fd-background)',
      fg: 'var(--color-fd-foreground)',
      interactive: true,
      transparent: true,
    });

    return (
      <div
        style={{ overflowX: 'auto', margin: '1.5rem 0' }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  } catch {
    return (
      <CodeBlock title="Mermaid">
        <Pre>{chart}</Pre>
      </CodeBlock>
    );
  }
}
