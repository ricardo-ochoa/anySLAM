'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { SlamLogo } from '@/components/slam-logo';

/**
 * La 404 del portal.
 *
 * Va como componente de cliente porque `not-found.tsx` no recibe `params`: el
 * idioma se saca del primer segmento de la ruta, que el middleware de i18n
 * garantiza que siempre está. `HomeLayout` de Fumadocs también es de cliente,
 * así que la barra superior se puede montar aquí igual que en el inicio.
 *
 * El logo va en modo `always`: aquí el robot buscando la página es el chiste,
 * y no se puede depender de que alguien pase el cursor por encima para verlo.
 */
const content = {
  es: {
    code: 'Error 404',
    title: 'Estás perdido sin tu SLAM',
    lead: 'El robot mapeó el portal entero y esta página no aparece en el mapa. Muévele el cursor por encima si quieres ayudarlo a buscarla.',
    cta: 'Volver al inicio',
  },
  en: {
    code: 'Error 404',
    title: 'You are lost without your SLAM',
    lead: 'The robot mapped the whole portal and this page is nowhere on the map. Move the cursor over it if you want to help it look.',
    cta: 'Back to home',
  },
} as const;

export default function NotFound() {
  const lang = usePathname().split('/')[1] === 'en' ? 'en' : 'es';
  const t = content[lang];

  return (
    <HomeLayout {...baseOptions(lang)}>
      <main className="anyslam-hero anyslam-404">
        <SlamLogo className="anyslam-logo-hero" scan="always" />
        <span className="anyslam-eyebrow">{t.code}</span>
        <h1>{t.title}</h1>
        <p className="lead">{t.lead}</p>
        <div className="anyslam-actions">
          <Link className="anyslam-btn anyslam-btn-primary" href={`/${lang}`}>
            {t.cta}
          </Link>
        </div>
      </main>
    </HomeLayout>
  );
}
