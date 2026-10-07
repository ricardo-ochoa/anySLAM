/**
 * Dominio público del portal.
 *
 * Hace falta siempre que una URL tenga que funcionar fuera de la página: las
 * etiquetas de Open Graph y los enlaces a archivos dentro de las versiones en
 * Markdown, que se leen desde otro sitio o desde un modelo.
 *
 * En producción se define `NEXT_PUBLIC_SITE_URL` con el dominio real; en Vercel
 * basta con su propia variable. Sin ninguna de las dos se queda en localhost:
 * las previsualizaciones no funcionarán, pero nada se rompe.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');
