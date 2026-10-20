import { clerkMiddleware } from '@clerk/nextjs/server';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

const locale = createI18nMiddleware(i18n);

/**
 * Rutas que no llevan prefijo de idioma: las de API y las que leen los
 * asistentes de IA. El middleware de idioma las mandaría a /es/... y las
 * convertiría en 404, así que solo pasan por Clerk.
 *
 * El guion del grupo final es por `llms-full.txt`: sin él, el nombre no casaba
 * y la ruta acababa redirigida a /es/llms-full.txt.
 */
const SIN_IDIOMA = /^\/(?:api|llms)(?:[-./]|$)/;

/**
 * Clerk primero, idioma después.
 *
 * Aquí NO se decide quién puede ver qué. Clerk marcó `createRouteMatcher` como
 * obsoleto por una buena razón: proteger comparando rutas en el middleware
 * depende de que ese patrón coincida exactamente con cómo Next resuelve las
 * URLs, y en cuanto divergen queda un recurso protegido accesible sin que nadie
 * se entere. El permiso se comprueba en cada página y en cada ruta, junto al
 * dato que protege.
 *
 * Lo único que hace este archivo es establecer la sesión —para que `auth()`
 * funcione más adelante— y resolver el idioma.
 */
export default clerkMiddleware((_auth, request, event) => {
  if (SIN_IDIOMA.test(request.nextUrl.pathname)) return;
  return locale(request, event);
});

export const config = {
  // Se excluyen solo los archivos estáticos de public/: no hay nada que
  // autenticar en ellos y hacerlos pasar por Clerk sería latencia regalada.
  // El icono y la imagen de Open Graph quedan fuera a propósito: si se
  // protegieran, al compartir el enlace del inicio no se vería la miniatura.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|og.jpg|images|lottie|slides).*)',
  ],
};
