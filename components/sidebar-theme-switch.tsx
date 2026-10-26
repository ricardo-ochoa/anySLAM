'use client';

import {
  ThemeSwitch,
  type ThemeSwitchProps,
} from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { AuthNav } from '@/components/auth-nav';

/**
 * El control de sesión, en la misma fila que el cambio de tema de la barra
 * lateral.
 *
 * Esa fila la arma Fumadocs y no es un slot: dentro van los enlaces de tipo
 * `icon` a la izquierda y el cambio de tema a la derecha (lo empuja con
 * `ms-auto`). El slot `footer` de la barra cuelga por debajo, así que desde ahí
 * no hay forma de entrar en la fila. Lo que sí se puede sustituir es el propio
 * cambio de tema (`slots.themeSwitch`), y es lo que hacemos: devolvemos el
 * avatar y, detrás, el `ThemeSwitch` de siempre con las clases que Fumadocs le
 * pasa. Así el avatar queda a la izquierda de la fila y el tema a la derecha.
 */
export function SidebarThemeSwitch(props: ThemeSwitchProps) {
  return (
    <>
      <AuthNav className="anyslam-authnav-sidebar" />
      <ThemeSwitch {...props} />
    </>
  );
}
