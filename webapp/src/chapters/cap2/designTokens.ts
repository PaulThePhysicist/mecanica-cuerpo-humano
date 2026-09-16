/**
 * S4-01: los lienzos 2D de cap2 reconstruían la paleta con literales hex/rgba()
 * copiados a mano en vez de leer los tokens de `:root` (src/chapters/cap2/cap2.css).
 * `readCap2Tokens()` los lee una vez por pasada de dibujo (no dentro del bucle de
 * trazos) vía `getComputedStyle`, para que un cambio de paleta en `:root` se
 * refleje sin tocar el código de cada canvas.
 *
 * Alcance deliberado: solo los literales que eran duplicados exactos de un token
 * ya existente. Las paletas ilustrativas (tonos de piel, chasis de osciloscopio,
 * sombreado de receptores) no se tocan — igual que decidió cap1 para sus propios
 * degradados de varias paradas.
 */

export interface Cap2Tokens {
  ink: string;
  ink2: string;
  ink3: string;
  paper: string;
  paper2: string;
  paper3: string;
  card: string;
  line: string;
  lineSoft: string;
  teal: string;
  tealDeep: string;
  blood: string;
  bloodDeep: string;
  amber: string;
  amberDeep: string;
}

export function readCap2Tokens(): Cap2Tokens {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    ink: v('--ink'),
    ink2: v('--ink-2'),
    ink3: v('--ink-3'),
    paper: v('--paper'),
    paper2: v('--paper-2'),
    paper3: v('--paper-3'),
    card: v('--card'),
    line: v('--line'),
    lineSoft: v('--line-soft'),
    teal: v('--teal'),
    tealDeep: v('--teal-deep'),
    blood: v('--blood'),
    bloodDeep: v('--blood-deep'),
    amber: v('--amber'),
    amberDeep: v('--amber-deep'),
  };
}

function hexToRgbTriplet(hex: string): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

/** `rgba(token, alpha)` — construye un rgba() a partir del hex de un token. */
export function tokenRgba(hex: string, alpha: number): string {
  return `rgba(${hexToRgbTriplet(hex)},${alpha})`;
}
