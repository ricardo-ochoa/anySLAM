import { auth } from '@clerk/nextjs/server';
import { Chat } from '@/components/chat';

const content = {
  es: {
    title: 'Preguntar al Company Brain',
    lead: 'Pregunta por el estado del proyecto en lenguaje natural. Las respuestas salen de la documentación de este portal y vienen con sus fuentes.',
    labels: {
      placeholder: '¿Por qué el proyecto usa ROS 1 y ROS 2 a la vez?',
      send: 'Preguntar',
      cancel: 'Detener',
      copy: 'Copiar',
      reload: 'Reintentar',
      sources: 'Fuentes',
      empty: 'Todavía no has preguntado nada. Escribe abajo.',
      spent: 'Esta sesión lleva ${cost} USD.',
    },
  },
  en: {
    title: 'Ask the Company Brain',
    lead: 'Ask about the state of the project in plain language. Answers come from this portal’s documentation, with their sources.',
    labels: {
      placeholder: 'Why does the project use ROS 1 and ROS 2 at the same time?',
      send: 'Ask',
      cancel: 'Stop',
      copy: 'Copy',
      reload: 'Retry',
      sources: 'Sources',
      empty: 'Nothing asked yet. Type below.',
      spent: 'This session has cost ${cost} USD.',
    },
  },
} as const;

export default async function ChatPage({ params }: PageProps<'/[lang]/chat'>) {
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
