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

export const metadata: Metadata = {
  title: {
    default: 'anySLAM',
    template: '%s | anySLAM',
  },
  description:
    'Portal central de documentacion del proyecto de investigacion SLAM sobre el robot ANYmal D.',
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
