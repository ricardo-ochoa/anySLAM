import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { uiTranslations } from 'fumadocs-ui/i18n';
import { i18n } from '@/lib/i18n';

/**
 * Fumadocs no publica un language pack para español (@fumadocs/language solo
 * trae zh-cn y zh-tw), así que los textos de la interfaz en español se definen
 * aquí. Las claves son las cadenas en inglés, que ya son el valor por defecto
 * del locale `en`.
 */
export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    en: {
      displayName: 'English',
    },
    es: {
      "Ask AI(AI chat button)": "Preguntar a la IA",
      "Back to Home(404 page)": "Volver al inicio",
      "Choose a language(language switcher)": "Elegir idioma",
      "Choose a language(language switcher)(aria-label)": "Elegir idioma",
      "Close Banner(banner)(aria-label)": "Cerrar aviso",
      "Close Search(search dialog)(aria-label)": "Cerrar búsqueda",
      "Close Sidebar(aria-label)": "Cerrar barra lateral",
      "Close Sidebar(sidebar)(aria-label)": "Cerrar barra lateral",
      "Collapse Sidebar(sidebar)(aria-label)": "Contraer barra lateral",
      "Copied Text(code block)(aria-label)": "Texto copiado",
      "Copy Anchor Link(heading anchor)(aria-label)": "Copiar enlace de la sección",
      "Copy Link(accordion)(aria-label)": "Copiar enlace",
      "Copy Markdown(page actions)": "Copiar Markdown",
      "Copy Text(code block)(aria-label)": "Copiar texto",
      "Dark(theme switcher)(aria-label)": "Oscuro",
      "Default(type table)": "Valor por defecto",
      "Edit on GitHub(edit page)": "Editar en GitHub",
      "Hide Sidebar(sidebar)": "Ocultar barra lateral",
      "Last updated on(page footer)": "Última actualización",
      "Layout Tab(layout tab trigger)": "Pestaña de diseño",
      "Light(theme switcher)(aria-label)": "Claro",
      "Next Page(pagination)": "Página siguiente",
      "No Headings(table of contents)": "Sin encabezados",
      "No results found(search dialog)": "Sin resultados",
      "On this page(table of contents)": "En esta página",
      "Open Search(search trigger)(aria-label)": "Abrir búsqueda",
      "Open Sidebar(sidebar)(aria-label)": "Abrir barra lateral",
      "Open in ChatGPT(page actions)": "Abrir en ChatGPT",
      "Open in Claude(page actions)": "Abrir en Claude",
      "Open in Cursor(page actions)": "Abrir en Cursor",
      "Open in GitHub(page actions)": "Abrir en GitHub",
      "Open in Scira AI(page actions)": "Abrir en Scira AI",
      "Open(page actions)": "Abrir",
      "Page Not Found(404 page)": "Página no encontrada",
      "Parameters(type table)": "Parámetros",
      "Previous Page(pagination)": "Página anterior",
      "Prop(type table)": "Propiedad",
      "Read {url}, I want to ask questions about it.(page actions)":
        "Lee {url}, quiero hacer preguntas sobre eso.",
      "Returns(type table)": "Devuelve",
      "Search(search dialog)": "Buscar",
      "Search(search trigger)": "Buscar",
      "Show Sidebar(sidebar)": "Mostrar barra lateral",
      "System(theme switcher)(aria-label)": "Sistema",
      "Table of Contents(inline table of contents)": "Contenido",
      "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)":
        "La página que buscas pudo haber sido eliminada, renombrada o no está disponible temporalmente.",
      "Toggle Menu(mobile menu)(aria-label)": "Alternar menú",
      "Toggle Theme(theme switcher)(aria-label)": "Alternar tema",
      "Type(type table)": "Tipo",
      "View as Markdown(page actions)": "Ver como Markdown",
      "displayName": "Español",
    },
  });

const strings = {
  es: {
    docs: 'Documentación',
    catalog: 'Repositorios',
    onboarding: 'Onboarding',
  },
  en: {
    docs: 'Documentation',
    catalog: 'Repositories',
    onboarding: 'Onboarding',
  },
} as const;

export function baseOptions(locale: string): BaseLayoutProps {
  const t = strings[locale as keyof typeof strings] ?? strings.es;

  return {
    nav: {
      title: (
        <span style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
          any<span style={{ opacity: 0.6 }}>SLAM</span>
        </span>
      ),
      url: `/${locale}`,
    },
    links: [
      { type: 'main', text: t.docs, url: `/${locale}/docs` },
      { type: 'main', text: t.catalog, url: `/${locale}/docs/03-repositories/repository-catalog` },
      { type: 'main', text: t.onboarding, url: `/${locale}/docs/08-onboarding/getting-started` },
    ],
  };
}
