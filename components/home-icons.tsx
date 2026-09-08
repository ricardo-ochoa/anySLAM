/**
 * Iconos de las tarjetas del home.
 *
 * Provisionales: trazo geométrico de 24x24, `currentColor` y grosor uniforme,
 * pensados para sustituirse por los del branding sin tocar nada más. Basta
 * respetar el viewBox y seguir dibujando con `stroke`, no con `fill`.
 */

export type HomeIconName =
  | 'introduction'
  | 'architecture'
  | 'catalog'
  | 'onboarding'
  | 'standards'
  | 'research';

const paths: Record<HomeIconName, React.ReactNode> = {
  // Manual abierto.
  introduction: (
    <>
      <path d="M12 6.8C10.3 5.4 8.4 4.7 6.2 4.7H3.6v12.6h2.6c2.2 0 4.1.7 5.8 2.1" />
      <path d="M12 6.8c1.7-1.4 3.6-2.1 5.8-2.1h2.6v12.6h-2.6c-2.2 0-4.1.7-5.8 2.1" />
      <path d="M12 6.8v12.7" />
    </>
  ),
  // Grafo de nodos: tres piezas conectadas.
  architecture: (
    <>
      <circle cx="5.6" cy="6.6" r="2.6" />
      <circle cx="18.4" cy="6.6" r="2.6" />
      <circle cx="12" cy="17.4" r="2.6" />
      <path d="M8.2 6.6h7.6" />
      <path d="M7 8.8l3.7 6.4" />
      <path d="M17 8.8l-3.7 6.4" />
    </>
  ),
  // Capas apiladas: el catálogo visto como pila de repositorios.
  catalog: (
    <>
      <path d="M12 3.4 3.6 7.6 12 11.8l8.4-4.2z" />
      <path d="M3.6 12 12 16.2l8.4-4.2" />
      <path d="M3.6 16.4 12 20.6l8.4-4.2" />
    </>
  ),
  // Ruta por pasos, de un punto de partida a una salida.
  onboarding: (
    <>
      <circle cx="4.2" cy="19.8" r="1.7" />
      <path d="M5.9 19.8h3.6v-4.9h4.6V10h4.6V5.6" />
      <path d="M16.2 8.1l2.5-2.5 2.5 2.5" />
    </>
  ),
  // Documento con marca de verificación.
  standards: (
    <>
      <path d="M6 3.6h7.6L19 9v11.4H6z" />
      <path d="M13.6 3.6V9H19" />
      <path d="M9 14.3l2.2 2.2 4.3-4.4" />
    </>
  ),
  // Matraz de laboratorio.
  research: (
    <>
      <path d="M10 3.6v6.2l-5.4 8.9a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9.8V3.6" />
      <path d="M8.6 3.6h6.8" />
      <path d="M7.4 15.6h9.2" />
    </>
  ),
};

export function HomeIcon({ name }: { name: HomeIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
