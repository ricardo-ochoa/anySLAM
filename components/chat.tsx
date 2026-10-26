'use client';

import { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * La interfaz de chat del portal.
 *
 * Habla con `/api/chat` —la ruta del propio portal—, que comprueba la sesión de
 * Clerk y reenvía al Company Brain con el token compartido. El token nunca
 * llega aquí: este componente corre en el navegador.
 *
 * La respuesta son eventos SSE, pero no se puede usar `EventSource` porque esa
 * API solo hace GET y aquí hay que mandar el historial en el cuerpo. Así que se
 * lee el stream de `fetch` a mano: los eventos vienen separados por una línea
 * en blanco, y cada uno es `data: {json}`.
 */

interface Source {
  title: string;
  url: string;
  score: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

export interface ChatLabels {
  placeholder: string;
  send: string;
  sending: string;
  sources: string;
  empty: string;
  failed: string;
  offline: string;
}

export function Chat({ labels }: { labels: ChatLabels }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scroll = () => requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: 'end' }));

  async function send() {
    const question = draft.trim();
    if (!question || busy) return;

    const history = [...messages, { role: 'user' as const, content: question }];
    setMessages(history);
    setDraft('');
    setError(null);
    setBusy(true);
    scroll();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok || !response.body) {
        // 503 es el caso esperado mientras el Brain no esté conectado; el resto
        // son fallos de verdad y conviene distinguirlos.
        setError(response.status === 503 ? labels.offline : labels.failed);
        setBusy(false);
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Un evento completo termina en línea en blanco. Lo que quede detrás
        // es un evento a medias y espera a la siguiente lectura.
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.split('\n').find((l) => l.startsWith('data: '));
          if (!line) continue;

          let event: { type: string; text?: string; sources?: Source[]; message?: string };
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (event.type === 'text' && event.text) {
            const text = event.text;
            // Sin mutar: se reemplaza el último mensaje por uno nuevo.
            //
            // React en StrictMode invoca dos veces cada actualizador para
            // destapar justo esto. Con `last.content += text` el texto salía
            // duplicado carácter por carácter en desarrollo — y en producción
            // no, que es lo que lo hacía peligroso.
            setMessages((prev) => {
              const last = prev.at(-1);
              if (last?.role !== 'assistant') return prev;
              return [...prev.slice(0, -1), { ...last, content: last.content + text }];
            });
            scroll();
          } else if (event.type === 'sources' && event.sources) {
            const sources = event.sources;
            setMessages((prev) => {
              const last = prev.at(-1);
              if (last?.role !== 'assistant') return prev;
              return [...prev.slice(0, -1), { ...last, sources }];
            });
          } else if (event.type === 'error') {
            setError(event.message ?? labels.failed);
          }
        }
      }
    } catch {
      setError(labels.failed);
    } finally {
      setBusy(false);
      scroll();
    }
  }

  return (
    <div className="anyslam-chat">
      <div className="anyslam-chat-log">
        {messages.length === 0 && <p className="anyslam-chat-empty">{labels.empty}</p>}

        {messages.map((message, index) => (
          <div key={index} className={`anyslam-chat-msg anyslam-chat-${message.role}`}>
            <div className="anyslam-chat-body">
              {message.role === 'assistant' ? (
                /* El modelo escribe en Markdown: negritas, listas, enlaces y
                   código. Sin renderizarlo se leían los asteriscos crudos.
                   Se reconstruye en cada fragmento del stream, y mientras el
                   Markdown está a medias —un `**` sin cerrar— se muestra tal
                   cual durante un instante y se resuelve al llegar el resto.

                   A propósito NO se habilita HTML embebido: esto es texto que
                   genera un modelo a partir de documentos, y tratarlo como no
                   confiable es gratis aquí. */
                <Markdown remarkPlugins={[remarkGfm]}>
                  {message.content || (busy && index === messages.length - 1 ? '…' : '')}
                </Markdown>
              ) : (
                message.content
              )}
            </div>

            {message.sources && message.sources.length > 0 && (
              <div className="anyslam-chat-sources">
                <span>{labels.sources}</span>
                <ul>
                  {message.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url}>{source.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {error && <p className="anyslam-chat-error">{error}</p>}
        <div ref={endRef} />
      </div>

      <div className="anyslam-chat-input">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // Enter envía; Shift+Enter hace salto de línea.
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          placeholder={labels.placeholder}
          rows={2}
          disabled={busy}
        />
        <button
          type="button"
          className="anyslam-btn anyslam-btn-primary"
          onClick={() => void send()}
          disabled={busy || !draft.trim()}
        >
          {busy ? labels.sending : labels.send}
        </button>
      </div>
    </div>
  );
}
