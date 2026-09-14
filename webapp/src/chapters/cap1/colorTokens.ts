/**
 * Constantes de color que reflejan tokens de `:root` (src/index.css) para los
 * sitios que no pueden leer variables CSS: materiales de Three.js y `fillStyle`/
 * `strokeStyle` de <canvas> 2D. Si un valor cambia en `:root`, actualizar aquí.
 */

/** Espejo de --sagittal/--coronal/--transverse. Planos anatómicos de A1/A2. */
export const PLANE_COLORS = {
  sagittal: '#5d4fa8',
  coronal: '#2d7d4f',
  transverse: '#b86a1e',
} as const;

/** Espejo de --amber. */
export const AMBER = '#9a5b00';

/**
 * Espejo de --series-1..7. Escala categórica para gráficas con varias curvas
 * sin relación jerárquica (hoy: las 7 sensaciones de Stevens en D4).
 */
export const SERIES_COLORS = [
  '#347435',
  '#017273',
  '#1e67a1',
  '#6c539b',
  '#92446d',
  '#98492a',
  '#776104',
] as const;

/**
 * Ocho tonos de --teal, de claro a oscuro, para la barra apilada de segmentos
 * corporales de C2 (sims.ts, stackedBar). Es una escala secuencial, no
 * categórica: el cuerpo tiene un orden natural cabeza→pie, así que un solo
 * tono variando en claridad describe mejor esa relación que colores sueltos.
 */
export const BODY_SEGMENT_SHADES = {
  cabeza: '#0f7e73',
  cuello: '#0e756b',
  brazo: '#0d6c62',
  antebrazo: '#0c635a',
  mano: '#0b5951',
  muslo: '#095049',
  pantorrilla: '#084740',
  pie: '#073e38',
} as const;
