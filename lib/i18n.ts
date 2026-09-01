import { defineI18n } from 'fumadocs-core/i18n';

/**
 * Configuracion bilingue del portal.
 *
 * - Los archivos sin sufijo son espanol: `overview.mdx`
 * - Las traducciones llevan sufijo:      `overview.en.mdx`
 * - `fallbackLanguage` evita 404 cuando una traduccion se atrasa:
 *   se sirve la version en espanol en lugar de romper la navegacion.
 */
export const i18n = defineI18n({
  defaultLanguage: 'es',
  languages: ['es', 'en'],
  fallbackLanguage: 'es',
});
