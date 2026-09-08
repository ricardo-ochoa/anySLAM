import type { ReactNode } from 'react';
import { asMarkdown, md } from 'fumadocs-core/server';

/**
 * Resalta un texto corto en Doto ExtraBold — la fuente de matriz de puntos del
 * portal. Para etiquetas, nombres propios y cifras sueltas: un párrafo entero
 * en Doto no se lee.
 *
 * Al exportar la página a Markdown degrada a negrita, que es lo más cercano
 * que existe en Markdown a "esto va resaltado".
 */
export function Pixel({ children }: { children: ReactNode }) {
  if (asMarkdown()) {
    return md`**${children}**`;
  }

  return <span className="anyslam-pixel">{children}</span>;
}
