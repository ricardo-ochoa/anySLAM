import 'fumadocs-ui/style.css';
import './global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { Doto, Inter, Mulish } from 'next/font/google';
import type { Metadata } from 'next';
import { translations } from '@/lib/layout.shared';

/**
 * Tres familias, tres papeles (el reparto se aplica en global.css):
 *   Inter    — cuerpo de texto. Es la única pensada para leer párrafos largos.
 *   Mulish   — titulares y chrome de navegación. Humanista, de caja estrecha.
 *   Doto     — resaltados cortos, en ExtraBold. Es una matriz de puntos: por
 *              debajo de ~14px se vuelve ilegible, así que nunca en texto corrido.
 */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mulish = Mulish({ subsets: ['latin'], variable: '--font-mulish' });
const doto = Doto({ subsets: ['latin'], weight: '800', variable: '--font-doto' });

/**
 * Dominio del sitio. Las etiquetas Open Graph necesitan URLs absolutas, así que
 * `metadataBase` es lo que convierte `/og.jpg` en un enlace que los buscadores
 * y las apps de mensajería pueden resolver.
 *
 * En producción hay que definir `NEXT_PUBLIC_SITE_URL` con el dominio real
 * (Vercel ya expone el suyo). Sin ninguna de las dos, se queda en localhost:
 * las previsualizaciones no funcionarán, pero nada se rompe.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

const description =
  'Portal central de documentacion del proyecto de investigacion SLAM sobre el robot ANYmal D.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'anySLAM',
    template: '%s | anySLAM',
  },
  description,
  // SVG en vez de .ico: escala a cualquier tamaño y se ve nítido en la pestaña
  // y en los marcadores. Los navegadores que no lo soporten (Safari por debajo
  // de 16) se quedan sin icono, no muestran uno roto.
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
  openGraph: {
    type: 'website',
    siteName: 'anySLAM',
    title: 'anySLAM',
    description,
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'anySLAM — el ANYmal D en el Tecnologico de Monterrey, Campus Monterrey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'anySLAM',
    description,
    images: ['/og.jpg'],
  },
};

export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${mulish.variable} ${doto.variable}`}
      suppressHydrationWarning
    >
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <RootProvider i18n={i18nProvider(translations, lang)}>{children}</RootProvider>
      </body>
    </html>
  );
}
