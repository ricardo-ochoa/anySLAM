import Link from 'next/link';
import { HomeIcon } from '@/components/home-icons';

const content = {
  es: {
    eyebrow: 'Tecnológico de Monterrey · Campus Monterrey',
    title: 'Portal central del proyecto anySLAM',
    lead: 'Punto único de entrada a la investigación de SLAM, navegación y locomoción aprendida sobre el robot cuadrúpedo ANYmal D. Este portal no reemplaza a los repositorios del equipo: explica qué existe, quién lo mantiene y cómo encajan las piezas.',
    primary: 'Empezar aquí',
    secondary: 'Ver los repositorios',
    cards: [
      {
        href: '/docs/01-introduction/overview',
        icon: 'introduction',
        title: 'Introducción',
        body: 'Qué es anySLAM, sus objetivos y dónde termina el alcance de este portal.',
      },
      {
        href: '/docs/02-architecture/system-overview',
        icon: 'architecture',
        title: 'Arquitectura',
        body: 'Cómo se conectan el robot, el puente gRPC, el SLAM y las políticas aprendidas.',
      },
      {
        href: '/docs/03-repositories/repository-catalog',
        icon: 'catalog',
        title: 'Catálogo de repositorios',
        body: 'Los repositorios que forman el sistema, con su responsable y su estado.',
      },
      {
        href: '/docs/08-onboarding/getting-started',
        icon: 'onboarding',
        title: 'Onboarding',
        body: 'De cero contexto a ejecutar el sistema, paso por paso.',
      },
      {
        href: '/docs/07-standards/readme-standard',
        icon: 'standards',
        title: 'Estándares',
        body: 'La plantilla de README y las convenciones que sigue cada repositorio.',
      },
      {
        href: '/docs/09-research/papers',
        icon: 'research',
        title: 'Investigación',
        body: 'Publicaciones, experimentos y datasets del equipo.',
      },
    ],
  },
  en: {
    eyebrow: 'Tecnológico de Monterrey · Campus Monterrey',
    title: 'anySLAM project hub',
    lead: 'The single entry point to the SLAM, navigation and learned-locomotion research running on the ANYmal D quadruped. This portal does not replace the team repositories: it explains what exists, who maintains it, and how the pieces fit together.',
    primary: 'Start here',
    secondary: 'Browse repositories',
    cards: [
      {
        href: '/docs/01-introduction/overview',
        icon: 'introduction',
        title: 'Introduction',
        body: 'What anySLAM is, its goals, and where the scope of this portal ends.',
      },
      {
        href: '/docs/02-architecture/system-overview',
        icon: 'architecture',
        title: 'Architecture',
        body: 'How the robot, the gRPC bridge, SLAM and the learned policies connect.',
      },
      {
        href: '/docs/03-repositories/repository-catalog',
        icon: 'catalog',
        title: 'Repository catalog',
        body: 'The repositories that make up the system, with owner and status.',
      },
      {
        href: '/docs/08-onboarding/getting-started',
        icon: 'onboarding',
        title: 'Onboarding',
        body: 'From zero context to running the system, step by step.',
      },
      {
        href: '/docs/07-standards/readme-standard',
        icon: 'standards',
        title: 'Standards',
        body: 'The README template and the conventions every repository follows.',
      },
      {
        href: '/docs/09-research/papers',
        icon: 'research',
        title: 'Research',
        body: 'Publications, experiments and datasets from the team.',
      },
    ],
  },
} as const;

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  const t = content[lang as keyof typeof content] ?? content.es;
  const prefix = `/${lang}`;

  return (
    <main style={{ flex: 1 }}>
      <div className="anyslam-hero">
        <span className="anyslam-eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p className="lead">{t.lead}</p>
        <div className="anyslam-actions">
          <Link
            className="anyslam-btn anyslam-btn-primary"
            href={`${prefix}/docs/08-onboarding/getting-started`}
          >
            {t.primary}
          </Link>
          <Link
            className="anyslam-btn anyslam-btn-secondary"
            href={`${prefix}/docs/03-repositories/repository-catalog`}
          >
            {t.secondary}
          </Link>
        </div>
      </div>

      <div className="anyslam-grid">
        {t.cards.map((card) => (
          <Link key={card.href} className="anyslam-card" href={`${prefix}${card.href}`}>
            <div className="anyslam-card-head">
              <span className="anyslam-card-icon">
                <HomeIcon name={card.icon} />
              </span>
              <h3>{card.title}</h3>
            </div>
            <p>{card.body}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
