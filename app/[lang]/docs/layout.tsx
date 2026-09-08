import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { HoverBot } from '@/components/hover-bot';

export default async function Layout({ params, children }: LayoutProps<'/[lang]/docs'>) {
  const { lang } = await params;

  return (
    /* El robot va en el slot `footer` de la barra lateral porque es el único
       hueco disponible ahí abajo; `order: -1` en CSS lo sube por encima del
       selector de idioma, que es donde tiene que verse. La `key` es para
       Fumadocs, que mete el footer en un array de hijos sin asignarle una. */
    <DocsLayout
      {...baseOptions(lang)}
      tree={source.getPageTree(lang)}
      sidebar={{ footer: <HoverBot key="hover-bot" /> }}
    >
      {children}
    </DocsLayout>
  );
}
