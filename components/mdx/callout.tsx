import type { ComponentProps, ReactNode } from 'react';
import { Callout as FumaCallout } from 'fumadocs-ui/components/callout';
import { asMarkdown, md } from 'fumadocs-core/server';

/**
 * El Callout de fumadocs-ui no define su forma en Markdown, así que al exportar
 * una página aparecería como JSX crudo. Este envoltorio lo convierte en una
 * cita, que es legible en cualquier visor de Markdown.
 */
export function Callout({
  title,
  children,
  ...props
}: ComponentProps<typeof FumaCallout> & { title?: ReactNode }) {
  if (asMarkdown()) {
    return title
      ? md.linePrefix('> ')`**${title}**\n\n${children}`
      : md.linePrefix('> ')`${children}`;
  }

  return (
    <FumaCallout title={title} {...props}>
      {children}
    </FumaCallout>
  );
}
