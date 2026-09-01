import { defineConfig } from 'fumadocs-mdx/config';
import { remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';

/**
 * `remarkMdxMermaid` convierte los bloques ```mermaid en el componente
 * <Mermaid />. Eso permite escribir los diagramas como bloques de codigo
 * normales, que GitHub renderiza de forma nativa, sin sacrificar el
 * renderizado en el portal.
 */
export default defineConfig({
  mdxOptions: {
    remarkPlugins: (plugins) => [remarkMdxMermaid, ...plugins],
  },
});
