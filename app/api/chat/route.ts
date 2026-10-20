import { auth } from '@clerk/nextjs/server';

/**
 * Puente entre el portal y el Company Brain.
 *
 * El Brain no está expuesto a internet: vive detrás de un túnel y solo acepta
 * peticiones que traigan el token compartido. Ese token existe únicamente en
 * las variables de entorno de Vercel y en el servidor del Brain — nunca llega
 * al navegador, que es la razón de que esta ruta exista en lugar de que la
 * página llame directamente.
 *
 * Quién pregunta se reenvía en `X-Brain-User`. Conviene tener claro lo que esa
 * cabecera es y lo que no: el Brain se la cree porque confía en quien trae el
 * token, no porque venga firmada. Mientras el único portador del token sea este
 * portal, eso basta. Si algún día lo tiene algo más, la cabecera deja de ser
 * una identidad y pasa a ser una sugerencia; el cambio entonces es reenviar el
 * JWT de Clerk y que el Brain lo verifique contra el JWKS público.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const base = process.env.BRAIN_API_URL;
  const token = process.env.BRAIN_API_TOKEN;
  if (!base || !token) {
    return Response.json(
      { error: 'El Company Brain todavía no está conectado a este portal.' },
      { status: 503 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${base.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Brain-User': userId,
      },
      body: await request.text(),
      cache: 'no-store',
    });
  } catch {
    // Un Brain apagado o un túnel caído no deben devolver un 500 anónimo: desde
    // el navegador son indistinguibles de un fallo del portal.
    return Response.json({ error: 'No se pudo contactar al Company Brain.' }, { status: 502 });
  }

  // `upstream.body` se devuelve tal cual para conservar el streaming: la
  // respuesta son eventos SSE y rehacerla con `.text()` los convertiría en un
  // único bloque que llega al final.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'text/event-stream',
      'Cache-Control': 'no-store',
    },
  });
}
