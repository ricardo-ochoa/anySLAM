import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

export default createI18nMiddleware(i18n);

export const config = {
  // `lottie`, `favicon.svg` y `og.jpg` quedan fuera igual que `images`: son
  // archivos de public/, y el middleware de idioma los redirigiría a /es/...
  // convirtiéndolos en 404. El icono y la imagen de Open Graph se piden siempre
  // sin prefijo de idioma, así que sin esta exclusión no cargarían nunca.
  matcher: [
    '/((?!api|llms.mdx|_next/static|_next/image|favicon.ico|favicon.svg|og.jpg|images|lottie).*)',
  ],
};
