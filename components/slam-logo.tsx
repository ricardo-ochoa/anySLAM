'use client';

import { useEffect, useRef } from 'react';

/**
 * El logo de anySLAM, con un lidar dentro de la palabra SLAM.
 *
 * El gimmick no es una animación grabada: es un SLAM de juguete. El contorno de
 * las letras se rasteriza una sola vez a una rejilla de ocupación, y a partir de
 * ahí el robot —el cursor— lanza rayos que chocan contra los trazos como si
 * fueran paredes. De ahí salen las capas que se ven:
 *
 *   1. el polígono de visibilidad: el espacio libre que el robot alcanza desde
 *      donde está, iluminado con un degradado radial;
 *   2. el haz que gira, con su estela;
 *   3. la nube de puntos: cada choque del haz contra un trazo deja una marca,
 *      así que moviendo el cursor se va dibujando el mapa de las letras;
 *   4. la trayectoria recorrida, que es la parte de "odometría" del cuento.
 *
 * Por eso el interior de cada letra se comporta como una habitación cerrada: el
 * robot no ve a través de las paredes, y al salir de la letra empieza a mapear
 * los contornos por fuera.
 *
 * El dibujo va en un <canvas> por debajo del <svg>: las letras se quedan
 * vectoriales y nítidas a cualquier tamaño, y al ir encima recortan el haz sin
 * necesidad de máscaras.
 */

/** El viewBox del logo original (assets/anyslam_logo.svg). */
const VIEW_W = 162;
const VIEW_H = 76;

/** Celdas por unidad del viewBox en la rejilla de ocupación. El trazo más fino
 *  de las letras mide ~1 unidad, así que a 6 celdas por unidad ninguna pared
 *  queda por debajo del paso del rayo y no hay fugas. */
const CELL = 6;

/** Rayos del barrido completo: uno cada 1.8°. */
const RAYS = 200;

/** Alcance del lidar, en unidades del viewBox (el logo mide 162 de ancho). */
const RANGE = 40;

/** Vueltas por segundo del haz. */
const SPIN = 0.55;

/** Estela que arrastra el haz por detrás. */
const TRAIL = Math.PI / 2.6;

/** Radio del chasis: los rayos no chocan dentro de él, así que el robot sigue
 *  iluminando aunque el cursor se pare justo encima de un trazo. */
const BODY = 1.2;

/** Techo del escenario: la palabra SLAM empieza en y=26 del viewBox. Todo lo
 *  que dibuja el lidar se recorta a esa banda, así que el barrido nunca se
 *  derrama sobre "any" ni sale por arriba del logo. */
const FLOOR = 26;

/** Cuánto se separa del trazo cada marca del mapa, en unidades. */
const MARGIN = 0.9;

/** Tope de la nube de puntos. Al pasarlo se descarta el más antiguo. */
const MAX_POINTS = 700;

/** Muestras de trayectoria (una cada 40 ms). */
const MAX_TRACK = 40;

export type SlamLogoScan =
  /** Escanea mientras el puntero está encima. Es lo que se quiere en el header. */
  | 'hover'
  /** El robot patrulla solo y el cursor toma el control al entrar. Para el 404. */
  | 'always'
  /** Logo estático, sin canvas ni listeners. */
  | 'off';

export interface SlamLogoProps {
  scan?: SlamLogoScan;
  className?: string;
  /** Texto alternativo del logo. */
  label?: string;
}

interface Point {
  x: number;
  y: number;
  t: number;
}

export function SlamLogo({ scan = 'hover', className, label = 'anySLAM' }: SlamLogoProps) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const node = host.current;
    const cvs = canvas.current;
    if (!node || !cvs || scan === 'off') return;

    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    // Sin cursor que seguir, el modo `hover` no tiene nada que hacer: no se
    // monta nada y el logo se queda estático.
    const canHover = window.matchMedia('(hover: hover)').matches;
    if (scan === 'hover' && !canHover) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const grid = buildGrid();
    if (!grid) return;

    const gw = VIEW_W * CELL;
    const gh = VIEW_H * CELL;
    const STEP = (Math.PI * 2) / RAYS;
    const STEPS = Math.round(RANGE * CELL);
    const SKIP = Math.round(BODY * CELL);

    // --- estado -----------------------------------------------------------
    let scale = 1;
    let rgb = '0, 55, 255';
    let ink = '#000';
    let boost = 1;
    let raf = 0;
    let last = 0;
    let tracked = 0;
    let sweep = 0;
    let energy = 0; // 0 apagado, 1 a pleno
    let driven = false; // manda el cursor
    let awake = scan === 'always';

    let x = VIEW_W * 0.5;
    let y = VIEW_H * 0.72;
    let tx = x;
    let ty = y;

    const dist = new Float32Array(RAYS);
    const solid = new Uint8Array(RAYS);
    const cloud = new Map<number, Point>();
    const track: number[] = [];

    // Sobre fondo oscuro el azul se apaga: un alfa de 0.3 sobre negro apenas
    // se separa del fondo, mientras que sobre blanco ya es un tinte claro. El
    // refuerzo iguala las dos lecturas sin tocar cada valor a mano.
    const paint = (a: number) => `rgba(${rgb}, ${Math.min(a * boost, 1)})`;

    const wall = (px: number, py: number) => {
      const gx = px * CELL;
      const gy = py * CELL;
      if (gx < 0 || gy < 0 || gx >= gw || gy >= gh) return false;
      return grid[(gy | 0) * gw + (gx | 0)] === 1;
    };

    /** Lanza los 200 rayos desde donde está el robot y guarda dónde chocan. */
    const scanRound = () => {
      for (let i = 0; i < RAYS; i++) {
        const a = i * STEP;
        const dx = Math.cos(a) / CELL;
        const dy = Math.sin(a) / CELL;
        let px = x + dx * SKIP;
        let py = y + dy * SKIP;
        let hit = 0;
        let s = SKIP;

        for (; s <= STEPS; s++) {
          const gx = px * CELL;
          const gy = py * CELL;
          if (gx < 0 || gy < 0 || gx >= gw || gy >= gh) break; // se salió del logo
          if (grid[(gy | 0) * gw + (gx | 0)]) {
            hit = 1;
            break;
          }
          px += dx;
          py += dy;
        }

        dist[i] = Math.min(s, STEPS) / CELL;
        solid[i] = hit;
      }
    };

    /** Deja una marca en el mapa por cada rayo del tramo que chocó. */
    const record = (from: number, to: number, now: number) => {
      for (let i = from; i <= to; i++) {
        const b = ((i % RAYS) + RAYS) % RAYS;
        if (!solid[b]) continue;
        const a = b * STEP;
        // El punto se retira un poco del trazo: justo encima del choque queda
        // debajo de la letra, que se pinta por encima del canvas, y no se ve.
        const d = Math.max(dist[b] - MARGIN, 0);
        const px = x + Math.cos(a) * d;
        const py = y + Math.sin(a) * d;
        // Una marca por celda de una unidad: sin esto, al pararse el cursor
        // los puntos se apilan en el mismo sitio y engordan hasta ser manchas.
        const key = (py | 0) * 512 + (px | 0);
        if (cloud.has(key)) continue;
        cloud.set(key, { x: px, y: py, t: now });
        if (cloud.size > MAX_POINTS) {
          const oldest = cloud.keys().next().value;
          if (oldest !== undefined) cloud.delete(oldest);
        }
      }
    };

    /** ¿Hay línea recta libre entre dos puntos? */
    const clearPath = (ax: number, ay: number, bx: number, by: number) => {
      const steps = Math.ceil(Math.hypot(bx - ax, by - ay) * CELL);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        if (wall(ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
      }
      return true;
    };

    /**
     * Un destino nuevo dentro de la banda de la palabra SLAM. Tiene que estar en
     * espacio libre y verse en línea recta: si no, el robot atraviesa los trazos
     * y la trayectoria queda cruzando las letras como un tachón.
     */
    const roam = () => {
      for (let i = 0; i < 160; i++) {
        const px = 6 + Math.random() * (VIEW_W - 12);
        const py = 30 + Math.random() * (VIEW_H - 36);
        if (!wall(px, py) && clearPath(x, y, px, py)) {
          tx = px;
          ty = py;
          return;
        }
      }
      tx = x;
      ty = y;
    };

    const clear = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cvs.width, cvs.height);
    };

    const render = (now: number) => {
      clear();
      if (energy <= 0.002) return;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.beginPath();
      ctx.rect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.clip();

      const a = energy;

      // 1. Trayectoria recorrida.
      if (track.length >= 4) {
        ctx.beginPath();
        ctx.moveTo(track[0], track[1]);
        for (let i = 2; i < track.length; i += 2) ctx.lineTo(track[i], track[i + 1]);
        ctx.strokeStyle = paint(0.24 * a);
        ctx.lineWidth = 0.5;
        ctx.setLineDash([1.4, 1.6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Espacio libre: el polígono de visibilidad, con caída radial.
      ctx.beginPath();
      ctx.moveTo(x + dist[0], y);
      for (let i = 1; i < RAYS; i++) {
        const ang = i * STEP;
        ctx.lineTo(x + Math.cos(ang) * dist[i], y + Math.sin(ang) * dist[i]);
      }
      ctx.closePath();
      const glow = ctx.createRadialGradient(x, y, 0, x, y, RANGE);
      glow.addColorStop(0, paint(0.3 * a));
      glow.addColorStop(0.35, paint(0.12 * a));
      glow.addColorStop(1, paint(0));
      ctx.fillStyle = glow;
      ctx.fill();

      // 3. El haz y su estela, recortados por el mismo polígono de visibilidad.
      if (!reduced) {
        const first = Math.floor((sweep - TRAIL) / STEP);
        const lastB = Math.ceil(sweep / STEP);
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let i = first; i <= lastB; i++) {
          const b = ((i % RAYS) + RAYS) % RAYS;
          const ang = i * STEP;
          ctx.lineTo(x + Math.cos(ang) * dist[b], y + Math.sin(ang) * dist[b]);
        }
        ctx.closePath();
        ctx.fillStyle = coneFill(ctx, x, y, sweep, paint, a);
        ctx.fill();

        // Filo delantero del haz.
        const lead = dist[((Math.round(sweep / STEP) % RAYS) + RAYS) % RAYS];
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(sweep) * lead, y + Math.sin(sweep) * lead);
        ctx.strokeStyle = paint(0.95 * a);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // 4. El mapa. Los puntos recién detectados salen más grandes y brillantes.
      for (const p of cloud.values()) {
        const age = (now - p.t) / 420;
        const fresh = age < 1 ? 1 - age : 0;
        const size = 0.65 + fresh * 0.5;
        ctx.fillStyle = paint((0.7 + fresh * 0.3) * a);
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }

      // 5. El robot: un punto con su pulso.
      const ping = ((now / 1500) % 1) ** 0.6;
      ctx.beginPath();
      ctx.arc(x, y, 1 + ping * 7, 0, Math.PI * 2);
      ctx.strokeStyle = paint((1 - ping) * 0.65 * a);
      ctx.lineWidth = 0.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 1.7, 0, Math.PI * 2);
      ctx.fillStyle = paint(0.95 * a);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = ink;
      ctx.fill();
    };

    /** Un fotograma: física, escaneo y dibujo. Devuelve si hay que seguir. */
    const step = (now: number, instant = false) => {
      const dt = instant ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now;

      const goal = awake ? 1 : 0;
      energy = instant ? goal : energy + (goal - energy) * (1 - Math.exp(-dt / 0.16));
      if (Math.abs(goal - energy) < 0.004) energy = goal;

      if (!driven && scan === 'always' && !reduced) {
        if ((tx - x) ** 2 + (ty - y) ** 2 < 9) roam();
      }

      // El robot llega con inercia: rápido detrás del cursor, tranquilo cuando
      // patrulla solo.
      const tau = driven ? 0.09 : 0.55;
      const k = instant ? 1 : 1 - Math.exp(-dt / tau);
      x += (tx - x) * k;
      y += (ty - y) * k;

      if (energy > 0.01) {
        scanRound();

        if (reduced || instant) {
          // Sin animación no hay barrido que espere: el mapa aparece de golpe.
          record(0, RAYS - 1, now);
        } else {
          const before = sweep;
          sweep += Math.PI * 2 * SPIN * dt;
          const from = Math.floor(before / STEP) + 1;
          const to = Math.floor(sweep / STEP);
          if (to >= from) record(from, to, now);
          sweep %= Math.PI * 2;
        }

        if (now - tracked > 40) {
          tracked = now;
          track.push(x, y);
          if (track.length > MAX_TRACK * 2) track.splice(0, 2);
        }
      }

      render(now);

      if (energy === 0 && !awake) {
        cloud.clear();
        track.length = 0;
        sweep = 0;
        return false;
      }
      return true;
    };

    const frame = (now: number) => {
      raf = step(now) ? requestAnimationFrame(frame) : 0;
    };

    const run = () => {
      if (reduced) {
        step(performance.now(), true);
        return;
      }
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    // --- lienzo -----------------------------------------------------------
    const resize = () => {
      const box = node.getBoundingClientRect();
      if (!box.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.round(box.width * dpr);
      cvs.height = Math.round(box.height * dpr);
      scale = cvs.width / VIEW_W;
      if (raf || reduced) run();
    };

    const readColour = () => {
      const m = getComputedStyle(cvs).color.match(/-?[\d.]+/g);
      if (m && m.length >= 3) rgb = `${m[0]}, ${m[1]}, ${m[2]}`;
      // El chasis se pinta del color de las letras para que el robot se lea
      // como parte del logo y no como un punto azul más.
      ink = getComputedStyle(node).color;
      const l = ink.match(/-?[\d.]+/g);
      // Letras claras = fondo oscuro.
      boost = l && +l[0] + +l[1] + +l[2] > 384 ? 1.9 : 1;
    };

    // --- puntero ----------------------------------------------------------
    const aim = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      if (!box.width) return;
      tx = ((event.clientX - box.left) / box.width) * VIEW_W;
      ty = Math.max(((event.clientY - box.top) / box.height) * VIEW_H, FLOOR + 1.5);
    };

    const onPoint = (event: PointerEvent) => {
      const first = !driven;
      driven = true;
      awake = true;
      aim(event);
      // El robot aparece donde entró el cursor en lugar de venir volando desde
      // el centro.
      if (first && energy === 0) {
        x = tx;
        y = ty;
      }
      run();
    };

    const onLeave = () => {
      driven = false;
      if (scan === 'hover') awake = false;
      else roam();
      run();
    };

    node.addEventListener('pointerenter', onPoint);
    node.addEventListener('pointermove', onPoint, { passive: true });
    node.addEventListener('pointerleave', onLeave);

    const observer = new ResizeObserver(resize);
    observer.observe(node);

    // Fumadocs cambia de tema poniendo y quitando `.dark` en <html>, y el azul
    // de marca se aclara ahí. El canvas lee su propio `color`, que ya viene del
    // token CSS, cada vez que eso pasa.
    const theme = new MutationObserver(readColour);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    readColour();
    resize();
    if (scan === 'always') {
      roam();
      run();
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      theme.disconnect();
      node.removeEventListener('pointerenter', onPoint);
      node.removeEventListener('pointermove', onPoint);
      node.removeEventListener('pointerleave', onLeave);
    };
  }, [scan]);

  return (
    <span ref={host} className={['anyslam-logo', className].filter(Boolean).join(' ')}>
      <canvas ref={canvas} className="anyslam-logo-scan" aria-hidden="true" />
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={label} focusable="false">
        <path d={ANY} fill="currentColor" />
        <path d={SLAM} fill="currentColor" />
      </svg>
    </span>
  );
}

/**
 * Rasteriza las letras a una rejilla de ocupación: 1 = trazo (pared), 0 = hueco.
 *
 * Se hace una vez por montaje y con los mismos `d` que pinta el <svg>, así que
 * las paredes que ve el lidar son exactamente los píxeles negros del logo,
 * contrafomas incluidas (el ojo de la "A", la curva de la "S").
 */
function buildGrid(): Uint8Array | null {
  const off = document.createElement('canvas');
  off.width = VIEW_W * CELL;
  off.height = VIEW_H * CELL;

  const ctx = off.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.scale(CELL, CELL);
  ctx.fillStyle = '#000';
  ctx.fill(new Path2D(ANY));
  ctx.fill(new Path2D(SLAM));

  const { data } = ctx.getImageData(0, 0, off.width, off.height);
  const grid = new Uint8Array(off.width * off.height);
  for (let i = 0; i < grid.length; i++) grid[i] = data[i * 4 + 3] > 60 ? 1 : 0;
  return grid;
}

/**
 * El degradado de la estela. Un cónico centrado en el robot va de transparente
 * (cola) a brillante (filo del haz) sin costuras; si el navegador no lo tiene,
 * se cae a un relleno plano, que se ve peor pero se ve.
 */
function coneFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sweep: number,
  paint: (a: number) => string,
  a: number,
): CanvasGradient | string {
  if (typeof ctx.createConicGradient !== 'function') return paint(0.24 * a);

  const cone = ctx.createConicGradient(sweep - TRAIL, x, y);
  const end = TRAIL / (Math.PI * 2);
  cone.addColorStop(0, paint(0));
  cone.addColorStop(end * 0.6, paint(0.12 * a));
  cone.addColorStop(end * 0.92, paint(0.34 * a));
  cone.addColorStop(end, paint(0.55 * a));
  cone.addColorStop(Math.min(end + 0.004, 1), paint(0));
  cone.addColorStop(1, paint(0));
  return cone;
}

/* Trazados del logo original, sin tocar. `any` va sólido; `SLAM` es contorno, y
   ese hueco interior es justo el escenario que recorre el robot. */

const ANY =
  'M62.5479 17.1895H62.8008L66.7969 0.317383H75.9941L67.1143 26.7031C66.6703 28.0457 66.0254 29.2516 65.1797 30.3193C64.3446 31.3974 63.2453 32.2484 61.8818 32.8721C60.5181 33.4958 58.8157 33.8076 56.7754 33.8076C55.7711 33.8076 54.8144 33.7279 53.9053 33.5693C52.9962 33.4213 52.1979 33.2154 51.5107 32.9512L53.4141 26.7354C54.1327 26.989 54.788 27.1526 55.3799 27.2266C55.9824 27.3006 56.4951 27.2582 56.918 27.0996C57.3513 26.9411 57.6632 26.6402 57.8535 26.1963L58.0439 25.752L49.4814 0.317383H58.6152L62.5479 17.1895ZM13.4014 0C15.1456 1.29231e-05 16.7099 0.206876 18.0947 0.619141C19.4795 1.02084 20.6583 1.58604 21.6309 2.31543C22.6034 3.03424 23.3432 3.88004 23.8506 4.85254C24.3686 5.81453 24.6279 6.86106 24.6279 7.99219V24.6738H16.4453V21.249H16.2559C15.7696 22.1581 15.1772 22.8929 14.4795 23.4531C13.7925 24.0133 13.005 24.4201 12.1172 24.6738C11.2398 24.9275 10.272 25.0547 9.21484 25.0547C7.66088 25.0547 6.28634 24.8004 5.0918 24.293C3.90798 23.775 2.97728 22.9927 2.30078 21.9463C1.62436 20.8998 1.28613 19.5674 1.28613 17.9502C1.28617 16.6183 1.51324 15.4818 1.96777 14.541C2.42234 13.5896 3.0571 12.8125 3.87109 12.21C4.68506 11.6074 5.63173 11.1482 6.70996 10.8311C7.79865 10.514 8.97171 10.3071 10.2295 10.2119C11.5929 10.1062 12.6872 9.97999 13.5117 9.83203C14.3469 9.67346 14.9503 9.4565 15.3203 9.18164C15.6902 8.89623 15.875 8.52072 15.875 8.05566V7.99219C15.875 7.35792 15.6318 6.87148 15.1455 6.5332C14.6592 6.19496 14.0355 6.02638 13.2744 6.02637C12.4393 6.02637 11.7571 6.21106 11.2285 6.58105C10.7107 6.94049 10.3987 7.49564 10.293 8.24609H2.23828C2.34399 6.76617 2.81435 5.40265 3.64941 4.15527C4.49513 2.89728 5.72633 1.89217 7.34375 1.1416C8.96116 0.380493 10.9806 0 13.4014 0ZM42.1787 0C43.9017 3.33469e-05 45.3975 0.396656 46.666 1.18945C47.9452 1.97174 48.9331 3.05052 49.6309 4.4248C50.3391 5.79901 50.6883 7.36849 50.6777 9.13379V24.6738H41.9248V10.9736C41.9354 9.76849 41.6286 8.82191 41.0049 8.13477C40.3918 7.44781 39.5357 7.10456 38.4365 7.10449C37.7177 7.10449 37.088 7.26294 36.5488 7.58008C36.0204 7.88664 35.6135 8.33081 35.3281 8.91211C35.0428 9.48293 34.8944 10.1703 34.8838 10.9736V24.6738H26.1309V0.317383H34.4404V4.94727H34.6943C35.2229 3.40418 36.1527 2.19373 37.4844 1.31641C38.8269 0.43898 40.3921 0 42.1787 0ZM15.9385 14.0176C15.706 14.1127 15.4575 14.2026 15.1934 14.2871C14.9396 14.3717 14.6642 14.4514 14.3682 14.5254C14.083 14.5993 13.7766 14.6681 13.4492 14.7314C13.1322 14.7949 12.7989 14.8534 12.4502 14.9062C11.7737 15.012 11.2186 15.1866 10.7852 15.4297C10.3623 15.6623 10.0444 15.9529 9.83301 16.3018C9.63233 16.6399 9.53223 17.0207 9.53223 17.4434C9.5323 18.1198 9.77045 18.6377 10.2461 18.9971C10.7218 19.3563 11.3295 19.5361 12.0693 19.5361C12.7353 19.5361 13.359 19.3989 13.9404 19.124C14.5324 18.8492 15.0138 18.4526 15.3838 17.9346C15.7536 17.4167 15.9384 16.7876 15.9385 16.0479V14.0176Z';

const SLAM =
  'M20.7539 26.082C24.335 26.0821 27.5099 26.6435 30.2549 27.7969L30.7988 28.0352C32.7059 28.9097 34.3352 30.0339 35.6787 31.4062V26.71H50.1572V62.6191H66.2705L78.123 26.71H96.625L96.8525 27.3965L106.917 57.8877V26.71H124.118L134.399 51.7656L144.682 26.71H161.883V74.6738H147.674V51.4912L138.764 74.3145H130.034L121.126 51.3398V74.6738H96.8652L94.209 65.876H80.5391L77.8828 74.6738H35.6787V70.9199C34.4043 71.9717 32.907 72.8331 31.1953 73.5049L31.1943 73.5039C28.2802 74.6533 24.8207 75.2129 20.8428 75.2129C17.0075 75.2128 13.5894 74.6807 10.6064 73.5938L10.0156 73.3691L10.0137 73.3682C7.07555 72.1958 4.72044 70.417 2.98145 68.0283L2.6416 67.543L2.6377 67.5371C0.982017 65.0308 0.129507 61.9185 0.0166016 58.2578L0.00390625 57.5186L0 56.5146H13.8018L13.8525 57.4619C13.9201 58.7317 14.233 59.7326 14.7441 60.5117C15.2566 61.2927 15.9809 61.8965 16.9541 62.3193C17.9528 62.7467 19.1805 62.9785 20.6641 62.9785C21.9205 62.9785 22.9097 62.8221 23.6631 62.5459C24.4363 62.2624 24.9462 61.8975 25.2676 61.4932C25.5904 61.0869 25.7535 60.6388 25.7676 60.1172C25.7551 59.7096 25.6396 59.3658 25.417 59.0596L25.3135 58.9287L25.2939 58.9053C25.0076 58.5498 24.4604 58.1516 23.5322 57.7637L23.5205 57.7588C22.6018 57.3612 21.3183 56.9736 19.6445 56.6064L15.0664 55.6191H15.0654C11.1439 54.7685 7.92656 53.3692 5.46973 51.3779L4.98926 50.9717L4.98438 50.9678C2.40346 48.6681 1.15502 45.5412 1.1709 41.7109C1.15659 38.6045 1.9891 35.8459 3.69238 33.4775L3.69336 33.4766C5.39658 31.1146 7.73838 29.2952 10.6787 28.0059H10.6807L11.2402 27.7715C14.0627 26.6381 17.2397 26.082 20.7539 26.082ZM20.7539 27.082C17.1181 27.082 13.893 27.695 11.0801 28.9219C8.28235 30.1487 6.09081 31.8622 4.50488 34.0615C2.93386 36.246 2.15594 38.7972 2.1709 41.7148C2.15596 45.3057 3.31535 48.141 5.64941 50.2207C7.99844 52.2854 11.2077 53.7588 15.2773 54.6416L19.8555 55.6299C21.5611 56.0039 22.9155 56.4079 23.918 56.8418C24.9201 57.2606 25.6384 57.7389 26.0723 58.2773C26.5211 58.801 26.7536 59.4149 26.7686 60.1182L26.752 60.3945C26.6898 61.0312 26.4557 61.6046 26.0498 62.1152C25.586 62.6987 24.9055 63.1552 24.0078 63.4844L23.6611 63.6006C22.8282 63.8526 21.8291 63.9785 20.6641 63.9785L20.0791 63.9668C18.9304 63.9205 17.9037 63.7351 16.999 63.4111L16.5566 63.2373C15.4196 62.7436 14.5366 62.0181 13.9082 61.0605C13.2799 60.103 12.9283 58.921 12.8535 57.5146H1.00391C1.01887 61.3599 1.84182 64.5166 3.47266 66.9854C5.11849 69.4391 7.42227 71.2574 10.3848 72.4395C13.1762 73.5476 16.4148 74.1359 20.1006 74.2051L20.8428 74.2129C24.7328 74.2129 28.0622 73.6664 30.8301 72.5742C32.7888 71.8055 34.4278 70.7871 35.749 69.5215C36.0785 69.2059 36.3888 68.8757 36.6787 68.5293V73.6738H77.1396L79.7959 64.876H94.9521L97.6084 73.6738H120.126V46.9219H120.485L130.719 73.3145H138.081L148.314 47.1016H148.674V73.6738H160.883V27.71H145.353L134.669 53.7441H134.131L123.447 27.71H107.917V64.1084L106.917 61.0791V61.0781L95.9023 27.71H78.8457L66.9932 63.6191H49.1572V27.71H36.6787V34.251C36.6669 34.2328 36.6555 34.2144 36.6436 34.1963C36.3478 33.7406 36.025 33.3069 35.6787 32.8926V32.8916C34.4155 31.3806 32.8171 30.144 30.8818 29.1836L30.3818 28.9443C27.843 27.7801 24.8633 27.1616 21.4434 27.0889L20.7539 27.082ZM92.1338 55.54H82.6143L87.1943 40.3682H87.5537L92.1338 55.54ZM83.9609 54.54H90.7871L87.374 43.2314L83.9609 54.54ZM21.126 37.3203C22.9591 37.3694 24.3388 37.7868 25.2646 38.5723C26.2044 39.3577 26.7559 40.4329 26.9199 41.7969L26.9482 42.0742H36.6787V51.8809C36.5033 51.675 36.3195 51.4729 36.127 51.2754C35.996 51.1393 35.8601 51.006 35.7207 50.874C34.7866 49.9899 33.6624 49.1961 32.3467 48.4941L31.6836 48.1562C30.0994 47.3838 28.2344 46.7424 26.0889 46.2334L25.1523 46.0234L21.3818 45.2158C20.5626 45.0475 19.8276 44.8622 19.1768 44.6602L18.5537 44.4531C17.7608 44.1689 17.1102 43.8539 16.6016 43.5098C16.0929 43.1507 15.7189 42.7542 15.4795 42.3203C15.2552 41.8716 15.1576 41.3707 15.1875 40.8174C15.2006 40.2284 15.3569 39.6962 15.6562 39.2217L15.7939 39.0215C16.183 38.4979 16.7811 38.0863 17.5889 37.7871C18.4118 37.4729 19.4672 37.3154 20.7539 37.3154L21.126 37.3203ZM20.7539 38.3154C19.5379 38.3154 18.6147 38.4661 17.9453 38.7217L17.9365 38.7246C17.2531 38.9777 16.8385 39.2926 16.5967 39.6182C16.3355 39.9698 16.1981 40.3657 16.1875 40.8389L16.1865 40.8555V40.8711C16.1653 41.2643 16.2332 41.5862 16.3682 41.8613C16.5179 42.1228 16.7675 42.4004 17.1621 42.6816C17.4764 42.8943 17.8749 43.1054 18.3672 43.3096L18.8916 43.5117C19.6285 43.7759 20.5233 44.0186 21.583 44.2363L21.5918 44.2383L25.3623 45.0459H25.3613C27.962 45.5968 30.2201 46.3299 32.1211 47.2568C33.4665 47.9129 34.6554 48.6601 35.6787 49.5029V43.0742H26.0244L25.9512 42.1533C25.8494 40.8815 25.3883 39.9795 24.623 39.3398L24.6172 39.335C23.8876 38.7161 22.6623 38.3155 20.7539 38.3154Z';
