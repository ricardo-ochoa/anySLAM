/**
 * Tailwind entra al proyecto solo para el chat.
 *
 * El resto del portal sigue estilándose con `fumadocs-ui/style.css` y las
 * clases `.anyslam-*` de global.css. La clave para que no se pisen está en
 * ese archivo: se importan las utilidades de Tailwind pero NO su `preflight`,
 * que es el reinicio global de estilos y lo único que habría cambiado el
 * aspecto de páginas que hoy funcionan.
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
