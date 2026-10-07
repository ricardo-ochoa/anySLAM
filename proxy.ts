import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

export default createI18nMiddleware(i18n);

export const config = {
  // Nada de lo excluido aquí lleva prefijo de idioma, así que el middleware lo
  // mandaría a /es/... y lo convertiría en 404: los archivos de public/ —el
  // icono que pide el navegador, la imagen de Open Graph de las redes sociales,
  // las presentaciones que incrustan las guías— y todo lo que empieza por
  // `llms`, que son las rutas que leen los asistentes de IA: `llms.txt`,
  // `llms-full.txt` y el Markdown de cada página bajo `llms.mdx`.
  matcher: [
    '/((?!api|llms|_next/static|_next/image|favicon.ico|favicon.svg|og.jpg|images|lottie|slides).*)',
  ],
};
