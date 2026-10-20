import { createFromSource } from 'fumadocs-core/search/server';
import { auth } from '@clerk/nextjs/server';
import { source } from '@/lib/source';

// El modo `multilingual` por defecto indexa es y en por separado.
const search = createFromSource(source);

/**
 * El buscador devuelve títulos y fragmentos de las páginas, así que dejarlo
 * abierto mientras la documentación está cerrada sería una puerta trasera a lo
 * mismo que se está protegiendo.
 */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('No autorizado.\n', { status: 401 });

  return search.GET(request as never);
}
