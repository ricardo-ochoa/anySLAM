import { auth } from '@clerk/nextjs/server';

const content = {
  es: {
    title: 'Preguntar al Company Brain',
    lead: 'Pregunta en lenguaje natural por el estado del proyecto y recibe la respuesta con sus fuentes.',
    pending: 'Todavía no está conectado',
    body: 'El portal ya sabe quién eres y tiene lista la ruta que habla con el Company Brain, pero el Brain aún no está desplegado. En cuanto lo esté, bastará con definir BRAIN_API_URL y BRAIN_API_TOKEN en Vercel: esta página no cambia.',
  },
  en: {
    title: 'Ask the Company Brain',
    lead: 'Ask about the state of the project in plain language and get the answer with its sources.',
    pending: 'Not connected yet',
    body: 'The portal already knows who you are and the route that talks to the Company Brain is in place, but the Brain is not deployed yet. Once it is, setting BRAIN_API_URL and BRAIN_API_TOKEN in Vercel is all it takes — this page does not change.',
  },
} as const;

export default async function ChatPage({ params }: PageProps<'/[lang]/chat'>) {
  // Misma comprobación que la documentación, junto al recurso que protege.
  await auth.protect();

  const { lang } = await params;
  const t = content[lang as keyof typeof content] ?? content.es;
  const ready = Boolean(process.env.BRAIN_API_URL && process.env.BRAIN_API_TOKEN);

  return (
    <main className="anyslam-hero">
      <h1>{t.title}</h1>
      <p className="lead">{t.lead}</p>

      {!ready && (
        <div className="anyslam-card" style={{ marginTop: '1rem' }}>
          <h3>{t.pending}</h3>
          <p>{t.body}</p>
        </div>
      )}
    </main>
  );
}
