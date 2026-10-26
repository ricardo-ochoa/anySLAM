'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
  type ThreadAssistantMessagePart,
} from '@assistant-ui/react';

/**
 * El puente entre assistant-ui y el Company Brain.
 *
 * La librería no sabe nada de nuestro backend: solo pide un adaptador con un
 * método `run` que reciba los mensajes y vaya produciendo resultados. Eso nos
 * deja conservar el protocolo del Brain —eventos SSE `sources`, `text` y
 * `done`— en vez de doblarlo al de ninguna librería.
 *
 * El `abortSignal` que entrega la librería es lo que hace que el botón de
 * cancelar funcione: se lo pasamos a `fetch` y el stream se corta de verdad,
 * en vez de seguir generando tokens que ya nadie va a leer.
 */

interface Source {
  title: string;
  url: string;
}

export function ChatRuntime({
  children,
  onSpend,
}: {
  children: React.ReactNode;
  onSpend: (cost: number) => void;
}) {
  const adapter = useMemo<ChatModelAdapter>(
    () => ({
      async *run({ messages, abortSignal }) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortSignal,
          body: JSON.stringify({
            messages: messages.map((message) => ({
              role: message.role,
              content: message.content
                .filter((part) => part.type === 'text')
                .map((part) => part.text)
                .join(''),
            })),
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(
            response.status === 503
              ? 'El Company Brain todavía no está conectado a este portal.'
              : 'No se pudo generar la respuesta.',
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let text = '';
        let sources: ThreadAssistantMessagePart[] = [];

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Un evento termina en línea en blanco; lo que sobra es un evento a
          // medias y espera a la siguiente lectura.
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            const line = part.split('\n').find((l) => l.startsWith('data: '));
            if (!line) continue;

            let event: { type: string; text?: string; sources?: Source[]; cost?: number };
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue;
            }

            if (event.type === 'text' && event.text) {
              text += event.text;
            } else if (event.type === 'sources' && event.sources) {
              // `source` es un tipo de parte que la librería ya entiende, así
              // que las fuentes viajan como tales y no como metadatos sueltos.
              sources = event.sources.map((source) => ({
                type: 'source' as const,
                sourceType: 'url' as const,
                id: source.url,
                url: source.url,
                title: source.title,
              }));
            } else if (event.type === 'done') {
              if (event.cost) onSpend(event.cost);
            } else if (event.type === 'error') {
              throw new Error('No se pudo generar la respuesta.');
            }

            yield { content: [...sources, { type: 'text' as const, text }] };
          }
        }
      },
    }),
    [onSpend],
  );

  const runtime = useLocalRuntime(adapter);
  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>;
}

/** Lleva la cuenta de lo gastado en esta sesión del navegador. */
export function useSpend() {
  const [total, setTotal] = useState(0);
  const add = useCallback((cost: number) => setTotal((previous) => previous + cost), []);
  return { total, add };
}
