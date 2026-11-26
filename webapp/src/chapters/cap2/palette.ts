/**
 * Paleta de cap2 resuelta desde los tokens de `:root` (src/index.css).
 *
 * Los lienzos 2D, los SVG de los diales y los materiales/rótulos de Three.js no
 * entienden `var(--token)`, así que la paleta se lee UNA vez con
 * `getComputedStyle` al cargar el capítulo y se expone como hex. En el DOM se
 * puede usar indistintamente `C.teal` o `'var(--teal)'`: el valor es el mismo.
 *
 * Excepción documentada (BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md §3): los
 * materiales PBR anatómicos (hueso marfil, cartílago, músculo, tendón, piel) y
 * los degradados de varias paradas conservan sus literales; no son colores de
 * interfaz sino del modelo.
 */
import { tokenRgba } from './designTokens';

const FALLBACK: Record<string, string> = {
  '--paper': '#f5f0e4', '--paper-2': '#eee7d6', '--paper-3': '#e8dfc9', '--card': '#fbf8f0',
  '--ink': '#232c36', '--ink-2': '#43505c', '--ink-3': '#6b7885',
  '--line': '#cfc3a9', '--line-soft': '#e2d9c4',
  '--teal': '#0d6e64', '--teal-deep': '#0a5a52',
  '--blood': '#a92a1e', '--blood-deep': '#8c1f16',
  '--amber': '#9a5b00', '--amber-deep': '#7c4900', '--amber-tint': '#fbf2dc',
  '--sagittal': '#5d4fa8', '--coronal': '#2d7d4f', '--transverse': '#b86a1e', '--bone': '#b6a67f',
  '--series-3': '#1e67a1', '--series-4': '#6c539b',
};

function read(name: string): string {
  if (typeof document === 'undefined') return FALLBACK[name];
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return /^#[0-9a-f]{3,8}$/i.test(v) ? v : FALLBACK[name];
}

export const C = {
  paper: read('--paper'),
  paper2: read('--paper-2'),
  paper3: read('--paper-3'),
  card: read('--card'),
  ink: read('--ink'),
  ink2: read('--ink-2'),
  ink3: read('--ink-3'),
  line: read('--line'),
  lineSoft: read('--line-soft'),
  teal: read('--teal'),
  tealDeep: read('--teal-deep'),
  blood: read('--blood'),
  bloodDeep: read('--blood-deep'),
  amber: read('--amber'),
  amberDeep: read('--amber-deep'),
  amberTint: read('--amber-tint'),
  sagittal: read('--sagittal'),
  coronal: read('--coronal'),
  transverse: read('--transverse'),
  bone: read('--bone'),
  series3: read('--series-3'),
  series4: read('--series-4'),
};

/** rgba() a partir de un token de la paleta. */
export const ca = (hex: string, alpha: number): string => tokenRgba(hex, alpha);
