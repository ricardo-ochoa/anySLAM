'use client';

import { useRef, useState } from 'react';
import { Streamdown } from 'streamdown';
import 'streamdown/styles.css';

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

interface Usage {
  input_tokens: number;
  output_tokens: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  usage?: Usage;
  cost?: number;
}

export interface ChatLabels {
  placeholder: string;
  send: string;
  sending: string;
  sources: string;
  /** Plantilla con los marcadores `{in}`, `{out}` y `{cost}`. */
  spend: string;
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

          let event: {
            type: string;
            text?: string;
            sources?: Source[];
            message?: string;
            usage?: Usage;
            cost?: number;
          };
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
          } else if (event.type === 'done') {
            const { usage, cost } = event;
            setMessages((prev) => {
              const last = prev.at(-1);
              if (last?.role !== 'assistant') return prev;
              return [...prev.slice(0, -1), { ...last, usage, cost }];
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
                /* Streamdown en vez de react-markdown porque entiende el
                   Markdown a medias: mientras llega el stream hay `**` sin
                   cerrar y enlaces partidos, y él los compone en vez de
                   enseñar los asteriscos durante medio segundo.

                   `linkSafety` desactivado a propósito: por defecto convierte
                   cada enlace en un botón que abre un modal de confirmación,
                   y aquí los enlaces van a la documentación del propio portal
                   — son justo lo que queremos que se pueda pulsar. */
                <Streamdown linkSafety={{ enabled: false }}>
                  {message.content || (busy && index === messages.length - 1 ? '…' : '')}
                </Streamdown>
              ) : (
                message.content
              )}
            </div>

            {message.usage && (
              <p className="anyslam-chat-spend">
                {labels.spend
                  .replace('{in}', String(message.usage.input_tokens))
                  .replace('{out}', String(message.usage.output_tokens))
                  .replace('{cost}', (message.cost ?? 0).toFixed(5))}
              </p>
            )}

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
