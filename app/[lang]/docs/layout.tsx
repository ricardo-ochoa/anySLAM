import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { auth } from '@clerk/nextjs/server';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { HoverBot } from '@/components/hover-bot';

export default async function Layout({ params, children }: LayoutProps<'/[lang]/docs'>) {
  // Toda la documentación queda detrás de la sesión. La comprobación va aquí,
  // en el layout que envuelve cada página, y no en el middleware: así protege
  // el recurso y no un patrón de ruta que puede dejar de coincidir.
  await auth.protect();

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
