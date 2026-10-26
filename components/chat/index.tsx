'use client';

import { ChatRuntime, useSpend } from './runtime';
import { Thread, type ThreadLabels } from './thread';

/**
 * El chat completo: el puente con el Brain por fuera, la conversación por
 * dentro.
 *
 * Las etiquetas llegan como texto desde la página, que es un componente de
 * servidor. Nada de funciones: entre servidor y cliente solo cruzan datos
 * serializables, y una función no lo es.
 */
export function Chat({ labels }: { labels: ThreadLabels }) {
  const spend = useSpend();

  return (
    <ChatRuntime onSpend={spend.add}>
      <Thread labels={labels} spent={spend.total} />
    </ChatRuntime>
  );
}
