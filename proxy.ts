import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

export default createI18nMiddleware(i18n);

export const config = {
  // Todo lo excluido aquí son archivos de public/: el middleware de idioma los
  // redirigiría a /es/... y los convertiría en 404. Se piden siempre sin prefijo
  // de idioma — el navegador pide el icono, las redes sociales la imagen de Open
  // Graph y los <iframe> de las guías las presentaciones de `slides`.
  matcher: [
    '/((?!api|llms.mdx|_next/static|_next/image|favicon.ico|favicon.svg|og.jpg|images|lottie|slides).*)',
  ],
};
