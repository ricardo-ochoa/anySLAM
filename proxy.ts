import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

export default createI18nMiddleware(i18n);

export const config = {
  // `lottie` queda fuera igual que `images`: son archivos de public/, y el
  // middleware de idioma los redirigiría a /es/... convirtiéndolos en 404.
  matcher: ['/((?!api|llms.mdx|_next/static|_next/image|favicon.ico|images|lottie).*)'],
};
