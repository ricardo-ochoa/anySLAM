'use client';

import {
  ActionBarPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useMessagePartSource,
  useMessagePartText,
} from '@assistant-ui/react';
import { Streamdown } from 'streamdown';
import 'streamdown/styles.css';

export interface ThreadLabels {
  placeholder: string;
  send: string;
  cancel: string;
  copy: string;
  reload: string;
  sources: string;
  empty: string;
  spent: string;
}

/** El texto del modelo, renderizado como Markdown mientras llega. */
function TextPart() {
  const { text } = useMessagePartText();
  return (
    <Streamdown linkSafety={{ enabled: false }}>{text}</Streamdown>
  );
}

/**
 * Una fuente. Llegan antes que el texto, así que se pintan en una fila propia
 * encima de la respuesta — así se ve de dónde va a salir antes de leerla.
 */
function SourcePart() {
  const source = useMessagePartSource();
  if (source.sourceType !== 'url') return null;
  return (
    <a className="anyslam-chat-source" href={source.url}>
      {source.title ?? source.url}
    </a>
  );
}

export function Thread({ labels, spent }: { labels: ThreadLabels; spent: number }) {
  return (
    <ThreadPrimitive.Root className="anyslam-chat">
      <ThreadPrimitive.Viewport className="anyslam-chat-log" autoScroll>
        <ThreadPrimitive.Empty>
          <p className="anyslam-chat-empty">{labels.empty}</p>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: () => (
              <MessagePrimitive.Root className="anyslam-chat-msg anyslam-chat-user">
                <div className="anyslam-chat-body">
                  <MessagePrimitive.Parts />
                </div>
              </MessagePrimitive.Root>
            ),
            AssistantMessage: () => (
              <MessagePrimitive.Root className="anyslam-chat-msg anyslam-chat-assistant">
                {/* Dos recorridos sobre las mismas partes: arriba solo las
                    fuentes, abajo solo el texto. Cada uno tiene que silenciar
                    lo que no le toca — si no, el de arriba pinta además el
                    texto con el componente por defecto y la respuesta sale
                    duplicada, una vez en Markdown crudo y otra renderizada. */}
                <div className="anyslam-chat-sources">
                  <MessagePrimitive.Parts
                    components={{ Source: SourcePart, Text: () => null }}
                  />
                </div>
                <div className="anyslam-chat-body">
                  <MessagePrimitive.Parts components={{ Text: TextPart, Source: () => null }} />
                </div>
                {/* Solo aparece cuando la respuesta terminó: a medio stream,
                    copiar o regenerar no tienen sentido. */}
                <ActionBarPrimitive.Root className="anyslam-chat-actions" hideWhenRunning>
                  <ActionBarPrimitive.Copy className="anyslam-chat-action">
                    {labels.copy}
                  </ActionBarPrimitive.Copy>
                  <ActionBarPrimitive.Reload className="anyslam-chat-action">
                    {labels.reload}
                  </ActionBarPrimitive.Reload>
                </ActionBarPrimitive.Root>
              </MessagePrimitive.Root>
            ),
          }}
        />
      </ThreadPrimitive.Viewport>

      <ComposerPrimitive.Root className="anyslam-chat-input">
        <ComposerPrimitive.Input
          className="anyslam-chat-field"
          placeholder={labels.placeholder}
          rows={2}
          submitOnEnter
        />
        {/* Enviar y cancelar ocupan el mismo sitio: la librería enseña uno u
            otro según si hay una respuesta en curso. */}
        <ThreadPrimitive.If running={false}>
          <ComposerPrimitive.Send className="anyslam-btn anyslam-btn-primary">
            {labels.send}
          </ComposerPrimitive.Send>
        </ThreadPrimitive.If>
        <ThreadPrimitive.If running>
          <ComposerPrimitive.Cancel className="anyslam-btn anyslam-btn-secondary">
            {labels.cancel}
          </ComposerPrimitive.Cancel>
        </ThreadPrimitive.If>
      </ComposerPrimitive.Root>

      {spent > 0 && (
        <p className="anyslam-chat-spend">
          {labels.spent.replace('{cost}', spent.toFixed(5))}
        </p>
      )}
    </ThreadPrimitive.Root>
  );
}
