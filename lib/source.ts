import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { i18n } from '@/lib/i18n';

const docs = defineDocs({
  dir: 'docs',
  docs: {
    postprocess: {
      // Necesario para que `page.data.getText('processed')` devuelva el
      // Markdown de la página. Es lo que alimenta el botón "Copiar Markdown"
      // y las rutas .md. Ver lib/get-llm-text.ts
      // `output: 'function'` deja los componentes MDX como JSX para que cada
      // uno defina su propia forma en Markdown vía asMarkdown().
      // Ver components/mdx/mermaid.tsx y components/mdx/callout.tsx
      includeProcessedMarkdown: { output: 'function' },
    },
  },
});

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n,
});
