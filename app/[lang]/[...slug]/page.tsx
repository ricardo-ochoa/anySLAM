import { notFound } from 'next/navigation';

/**
 * Comodín para que cualquier ruta inexistente bajo /[lang] caiga en la 404 del
 * portal (app/[lang]/not-found.tsx).
 *
 * Sin esto Next trata las URLs sin coincidencia como un 404 de raíz y pinta su
 * propia pantalla en blanco: los `not-found.tsx` de segmento solo atienden a lo
 * que lanza `notFound()` dentro de su rama. Como este comodín sí es una ruta
 * que coincide, `notFound()` cae en el límite de `[lang]` y se ve la nuestra.
 *
 * Las rutas reales (`/[lang]`, `/[lang]/docs/...`) ganan por ser más
 * específicas, así que esto solo recoge lo que nadie más atiende.
 */
export default async function CatchAll() {
  notFound();
}
