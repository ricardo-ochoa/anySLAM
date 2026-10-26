import { auth } from '@clerk/nextjs/server';
import { Chat } from '@/components/chat';

const content = {
  es: {
    title: 'Preguntar al Company Brain',
    lead: 'Pregunta por el estado del proyecto en lenguaje natural. Las respuestas salen de la documentación de este portal y vienen con sus fuentes.',
    labels: {
      placeholder: '¿Por qué el proyecto usa ROS 1 y ROS 2 a la vez?',
      send: 'Preguntar',
      sending: 'Pensando…',
      sources: 'Fuentes',
      spend: (input: number, output: number, cost: string) =>
        `${input} tokens de entrada, ${output} de salida — $${cost} USD`,
      empty: 'Todavía no has preguntado nada. Escribe abajo.',
      failed: 'No se pudo generar la respuesta. Inténtalo de nuevo.',
      offline: 'El Company Brain todavía no está conectado a este portal.',
    },
  },
  en: {
    title: 'Ask the Company Brain',
    lead: 'Ask about the state of the project in plain language. Answers come from this portal’s documentation, with their sources.',
    labels: {
      placeholder: 'Why does the project use ROS 1 and ROS 2 at the same time?',
      send: 'Ask',
      sending: 'Thinking…',
      sources: 'Sources',
      spend: (input: number, output: number, cost: string) =>
        `${input} input tokens, ${output} output — $${cost} USD`,
      empty: 'Nothing asked yet. Type below.',
      failed: 'The answer could not be generated. Try again.',
      offline: 'The Company Brain is not connected to this portal yet.',
    },
  },
} as const;

export default async function ChatPage({ params }: PageProps<'/[lang]/chat'>) {
  // Misma comprobación que la documentación, junto al recurso que protege.
  await auth.protect();

  const { lang } = await params;
  const t = content[lang as keyof typeof content] ?? content.es;

  return (
    <main className="anyslam-hero">
      <h1>{t.title}</h1>
      <p className="lead">{t.lead}</p>
      <Chat labels={t.labels} />
    </main>
  );
}
