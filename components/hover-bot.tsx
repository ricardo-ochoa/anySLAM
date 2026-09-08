'use client';

import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';

/**
 * El robot de la barra lateral. Sigue el cursor.
 *
 * La animación (public/lottie/hover-bot.json, de LottieFiles) no es un bucle: trae
 * marcadores con nombre, y cada uno es un tramo independiente de la línea de
 * tiempo. Ocho de ellos son poses direccionales, así que "seguir el cursor" es
 * calcular en qué octante cae el puntero respecto al robot y reproducir el
 * tramo correspondiente, que se queda congelado en su última imagen.
 *
 * Los números salen de `markers` del propio JSON: `tm` es el fotograma inicial
 * y `dr` la duración. Si se reemplaza el archivo, hay que releerlos.
 */
const SEGMENTS = {
  hello: [151, 253],
  idle: [1, 132],
  up: [605, 637],
  upRight: [642, 672],
  right: [677, 704],
  downRight: [710, 736],
  down: [741, 767],
  downLeft: [772, 800],
  left: [806, 837],
  upLeft: [844, 871],
} satisfies Record<string, [number, number]>;

/** Octantes en el orden en que los devuelve atan2, desde -180°. */
const OCTANTS = [
  'left',
  'upLeft',
  'up',
  'upRight',
  'right',
  'downRight',
  'down',
  'downLeft',
  'left',
] as const;

/** Tras este tiempo sin mover el ratón, el robot vuelve a su bucle de reposo. */
const IDLE_AFTER_MS = 2500;

/** Por debajo de este ancho no se monta: es un adorno, no vale su descarga. */
const DESKTOP = '(min-width: 768px)';

function octantFor(dx: number, dy: number): keyof typeof SEGMENTS {
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return OCTANTS[Math.round((deg + 180) / 45)];
}

export function HoverBot() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node || !window.matchMedia(DESKTOP).matches) return;

    let anim: AnimationItem | undefined;
    let cancelled = false;
    let facing: keyof typeof SEGMENTS | null = null;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const play = (name: keyof typeof SEGMENTS, loop: boolean) => {
      if (!anim) return;
      anim.loop = loop;
      anim.playSegments(SEGMENTS[name], true);
    };

    const rest = () => {
      facing = null;
      play('idle', true);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!anim) return;
      // Un solo cálculo por fotograma: pointermove dispara muy por encima de
      // la tasa de refresco y cada cambio de pose reinicia un tramo.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const box = node.getBoundingClientRect();
        const next = octantFor(
          event.clientX - (box.left + box.width / 2),
          event.clientY - (box.top + box.height / 2),
        );

        clearTimeout(idleTimer);
        idleTimer = setTimeout(rest, IDLE_AFTER_MS);

        if (next === facing) return;
        facing = next;
        play(next, false);
      });
    };

    void (async () => {
      const lottie = (await import('lottie-web/build/player/lottie_light')).default;
      if (cancelled) return;

      anim = lottie.loadAnimation({
        container: node,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/lottie/hover-bot.json',
      });

      anim.addEventListener('DOMLoaded', () => {
        if (cancelled) return;
        if (reduced) {
          // Sin movimiento: se congela en una pose de reposo y no escucha nada.
          anim?.goToAndStop(SEGMENTS.idle[0], true);
          return;
        }

        // Saluda una vez al entrar. `complete` salta al final de cualquier
        // tramo, así que este oyente se retira en cuanto se usa, y solo pasa a
        // reposo si el cursor no tomó ya el control del robot.
        const onHelloEnd = () => {
          anim?.removeEventListener('complete', onHelloEnd);
          if (facing === null) rest();
        };
        anim?.addEventListener('complete', onHelloEnd);
        play('hello', false);

        window.addEventListener('pointermove', onPointerMove, { passive: true });
      });
    })();

    return () => {
      cancelled = true;
      clearTimeout(idleTimer);
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      anim?.destroy();
    };
  }, []);

  return (
    <div className="anyslam-bot" aria-hidden="true">
      <div ref={host} className="anyslam-bot-stage" />
    </div>
  );
}
