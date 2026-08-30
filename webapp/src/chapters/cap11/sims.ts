// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 11 · Motor de simulaciones 2D y cálculos físicos (TypeScript)
//  "Luz, ojos y visión" — Física del Cuerpo Humano (I. P. Herman)
// ═══════════════════════════════════════════════════════════════════════════

import * as AB from './ab';

export interface ModuleDef {
  id: number;
  name: string;
  slides: number[];
  ico: string;
}

export const TOTAL = 24;

export const MODULES: ModuleDef[] = [
  { id: 0, name: 'Inicio', slides: [0], ico: '🏠' },
  { id: 1, name: 'Estructura del ojo', slides: [1, 2, 3], ico: '🧿' },
  { id: 2, name: 'Óptica geométrica', slides: [4, 5], ico: '🔭' },
  { id: 3, name: 'Superficies y lentes', slides: [6, 7, 8], ico: '💠' },
  { id: 4, name: 'El ojo como lente', slides: [9, 10, 11], ico: '👁️' },
  { id: 5, name: 'Agudeza visual', slides: [12, 13, 14], ico: '🎯' },
  { id: 6, name: 'Visión y corrección', slides: [15, 16], ico: '👓' },
  { id: 7, name: 'Luz y color', slides: [17, 18, 19], ico: '🌓' },
  { id: 8, name: 'Deterioro visual', slides: [20, 21], ico: '🩺' },
  { id: 9, name: 'Otros animales', slides: [22, 23], ico: '🐾' },
];

export interface SimParams {
  an_sel: number;
  rt_ex: number;
  ph_lam: number;
  le_d: number;
  le_f: number;
  sl_th: number;
  sl_n: number;
  if_R: number;
  if_n: number;
  fb_n: number;
  fb_R: number;
  ef_t: number;
  ef_P: number;
  oe_sel: number;
  ag_sel: number;
  ac_age: number;
  df_d: number;
  df_lam: number;
  ab_lam: number;
  va_line: number;
  my_sel: number;
  as_d: number;
  as_P: number;
  br_I: number;
  ci_lam: number;
  en_sel: number;
  gd_pio: number;
  av_sel: number;
  mp_sel: number;
}

export const DEFAULT_PARAMS: SimParams = {
  an_sel: 0,
  rt_ex: 0,
  ph_lam: 555,
  le_d: 80,
  le_f: 30,
  sl_th: 45,
  sl_n: 1.33,
  if_R: 7.8,
  if_n: 1.3771,
  fb_n: 1.5,
  fb_R: 40,
  ef_t: 15,
  ef_P: 5,
  oe_sel: 0,
  ag_sel: 0,
  ac_age: 25,
  df_d: 5,
  df_lam: 555,
  ab_lam: 555,
  va_line: 20,
  my_sel: 0,
  as_d: 14,
  as_P: -5,
  br_I: 100,
  ci_lam: 555,
  en_sel: 0,
  gd_pio: 15,
  av_sel: 0,
  mp_sel: 0,
};

export interface SimFlags {
  acPlaying: boolean;
  acT: number;
  ciPlaying: boolean;
  ciT: number;
  adPlaying: boolean;
  adT: number;
}

export const DEFAULT_FLAGS: SimFlags = {
  acPlaying: false,
  acT: 0,
  ciPlaying: false,
  ciT: 0,
  adPlaying: false,
  adT: 0,
};

// ===================== HELPERS DE CANVAS =====================
export const C = {
  paper: '#f8f4e9',
  ink: '#2d3a3a',
  teal: '#0e6e66',
  tealD: '#0a544e',
  blood: '#b3352a',
  amber: '#d97706',
  muted: '#8a8f8c',
  line: '#c9c2b2',
  violet: '#5d4fa8',
  blue: '#1f6fb2',
};

export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export function _bg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, w, h);
}

export function _txt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: string,
  o?: {
    color?: string;
    bold?: boolean;
    w?: string;
    size?: number;
    align?: CanvasTextAlign;
    base?: CanvasTextBaseline;
  }
) {
  const a = o || {};
  ctx.fillStyle = a.color || C.ink;
  ctx.font = (a.bold ? '700 ' : a.w || '500 ') + (a.size || 12) + 'px Karla, Arial, sans-serif';
  ctx.textAlign = a.align || 'left';
  ctx.textBaseline = a.base || 'middle';
  ctx.fillText(s, x, y);
}

export function _rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  rx?: number
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (rx && (ctx as any).roundRect) {
    (ctx as any).roundRect(x, y, w, h, rx);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
}

export function _line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lw?: number,
  dash?: number[]
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw || 1;
  ctx.setLineDash(dash || []);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function _poly(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  color: string,
  fill?: string
) {
  if (!pts.length) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.lineTo(pts[0].x, pts[0].y);
    ctx.fill();
  }
}

export function _axisX(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, labels: string[]) {
  const n = labels.length;
  _line(ctx, x0, y0, x1, y0, C.line, 1);
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1);
    _line(ctx, x, y0, x, y0 + 4, C.line, 1);
    _txt(ctx, x, y0 + 12, labels[i], { size: 9, align: 'center', color: C.muted });
  }
}

export function _axisY(ctx: CanvasRenderingContext2D, x0: number, y0: number, y1: number, labels: string[]) {
  const n = labels.length;
  _line(ctx, x0, y0, x0, y1, C.line, 1);
  for (let i = 0; i < n; i++) {
    const y = y1 - ((y1 - y0) * i) / (n - 1);
    _line(ctx, x0 - 6, y, x0, y, C.line, 1);
    _txt(ctx, x0 - 8, y, labels[i], { size: 9, align: 'right', color: C.muted });
  }
}

export function _gauss(x: number, c: number, w: number) {
  return Math.exp(-Math.pow((x - c) / w, 2));
}

export const CIE_SPECTRAL: [number, number, number][] = [
  [380, 0.174, 0.005],
  [400, 0.173, 0.006],
  [420, 0.171, 0.006],
  [440, 0.164, 0.011],
  [460, 0.144, 0.03],
  [480, 0.091, 0.133],
  [500, 0.008, 0.538],
  [520, 0.074, 0.834],
  [540, 0.229, 0.754],
  [560, 0.374, 0.615],
  [580, 0.513, 0.487],
  [600, 0.628, 0.351],
  [620, 0.691, 0.308],
  [640, 0.708, 0.292],
  [660, 0.73, 0.27],
  [700, 0.735, 0.265],
];

export function cieXY(lam: number): [number, number] {
  lam = clamp(lam, 380, 700);
  for (let i = 0; i < CIE_SPECTRAL.length - 1; i++) {
    const a = CIE_SPECTRAL[i],
      b = CIE_SPECTRAL[i + 1];
    if (lam <= b[0]) {
      const t = (lam - a[0]) / (b[0] - a[0]);
      return [a[1] + t * (b[1] - a[1]), a[2] + t * (b[2] - a[2])];
    }
  }
  const q = CIE_SPECTRAL[CIE_SPECTRAL.length - 1];
  return [q[1], q[2]];
}

export function lamRGB(lam: number): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0;
  if (lam < 440) {
    r = (lam - 380) / 60;
    b = 1;
  } else if (lam < 490) {
    g = (lam - 440) / 50;
    b = 1;
  } else if (lam < 510) {
    g = 1;
    b = 1 - (lam - 490) / 20;
  } else if (lam < 580) {
    g = 1;
    r = (lam - 510) / 70;
  } else if (lam < 645) {
    r = 1;
    g = 1 - (lam - 580) / 65;
  } else {
    r = 1;
  }
  const m = Math.max(r, g, b, 0.001);
  return [Math.round((r / m) * 255), Math.round((g / m) * 255), Math.round((b / m) * 255)];
}

export function acomodacion(age: number): number {
  const T = [
    [8, 13.8],
    [25, 9.9],
    [35, 7.3],
    [40, 5.8],
    [45, 3.6],
    [50, 1.9],
    [55, 1.3],
    [70, 0.5],
  ];
  if (age <= T[0][0]) return T[0][1];
  for (let i = 0; i < T.length - 1; i++) {
    if (age <= T[i + 1][0]) {
      const q = (age - T[i][0]) / (T[i + 1][0] - T[i][0]);
      return T[i][1] + q * (T[i + 1][1] - T[i][1]);
    }
  }
  return 0.3;
}

function getCanvasAndContext(
  id: string
): { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const cv = document.getElementById(id) as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return null;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = cv.getContext('2d');
  if (!ctx) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  return { cv, ctx, w, h };
}

// ===================== SLIDE 1 · ANATOMÍA =====================
export function drawEye(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-eye');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const k = +params.an_sel || 0;
  const RX = w * 0.42,
    RY = Math.min(h * 0.34, RX * 0.6),
    cx = w * 0.52,
    cy = h * 0.5;
  // esclerótica / globo
  ctx.fillStyle = '#e7ddc9';
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, RX, RY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const fx = cx - RX; // frente (izquierda)
  // humor vítreo (interior) — resaltar si k===2
  if (k === 2) {
    ctx.fillStyle = 'rgba(14,110,102,0.20)';
    ctx.beginPath();
    ctx.ellipse(cx + 8, cy, RX - 30, RY - 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // córnea: abultamiento frontal
  const ccx = fx + 16,
    cr = 26;
  ctx.beginPath();
  ctx.arc(ccx, cy, cr, Math.PI * 0.72, Math.PI * 1.28);
  ctx.lineWidth = k === 0 ? 4 : 2;
  ctx.strokeStyle = k === 0 ? C.teal : '#cfd8d5';
  ctx.stroke();
  if (k === 0) {
    ctx.fillStyle = 'rgba(14,110,102,0.16)';
    ctx.beginPath();
    ctx.arc(ccx, cy, cr, Math.PI * 0.72, Math.PI * 1.28);
    ctx.lineTo(fx + cr, cy + cr * 0.35);
    ctx.closePath();
    ctx.fill();
  }
  // iris + pupila
  const ix = fx + 34;
  ctx.fillStyle = '#b98b3f';
  ctx.beginPath();
  ctx.ellipse(ix, cy, 5.5, RY * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#232c36';
  ctx.beginPath();
  ctx.ellipse(ix, cy, 2.8, RY * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  // cristalino
  const lx = fx + 47;
  ctx.fillStyle = k === 1 ? 'rgba(255,190,80,0.55)' : 'rgba(120,160,190,0.35)';
  ctx.strokeStyle = k === 1 ? C.amber : C.muted;
  ctx.lineWidth = k === 1 ? 3 : 1.5;
  ctx.beginPath();
  ctx.ellipse(lx, cy, 9, RY * 0.46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // retina (arco posterior) + fóvea
  const backX = cx + RX - 2;
  ctx.strokeStyle = k === 3 ? C.teal : C.muted;
  ctx.lineWidth = k === 3 ? 3.4 : 1.6;
  ctx.beginPath();
  ctx.ellipse(cx, cy, RX - 3, RY - 3, 0, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
  if (k === 3) {
    ctx.fillStyle = C.teal;
    ctx.beginPath();
    ctx.arc(backX, cy, 3.4, 0, Math.PI * 2);
    ctx.fill();
    _txt(ctx, backX, cy - RY * 0.5 - 4, 'fóvea ≈ 300 µm', {
      size: 9,
      align: 'center',
      color: C.teal,
      bold: true,
    });
  }
  // punto ciego + nervio óptico
  const na = 0.3;
  const px0 = backX - Math.cos(na) * 12,
    py0 = cy - Math.sin(na) * RY * 0.5;
  ctx.fillStyle = k === 4 ? C.blood : C.muted;
  ctx.beginPath();
  ctx.arc(px0, py0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = k === 4 ? C.blood : C.muted;
  ctx.lineWidth = k === 4 ? 3 : 1.6;
  ctx.beginPath();
  ctx.moveTo(px0, py0);
  ctx.lineTo(backX + 14, py0 + RY * 0.1);
  ctx.stroke();
  if (k === 4)
    _txt(ctx, backX + 22, py0 + RY * 0.1 - 8, 'punto ciego 13–18° nasal', {
      size: 9,
      color: C.blood,
      bold: true,
    });
  // etiquetas de región
  _txt(ctx, ccx, cy - cr - 8, 'córnea · n=1,3771', { size: 9, align: 'center', color: k === 0 ? C.teal : C.muted });
  _txt(ctx, lx, cy + RY * 0.55 + 6, 'cristalino', { size: 9, align: 'center', color: k === 1 ? C.amber : C.muted });
  _txt(ctx, cx, cy + RY * 0.62, 'humor vítreo · ~5 cm³', {
    size: 9,
    align: 'center',
    color: k === 2 ? C.teal : C.muted,
  });
  _txt(ctx, 12, h - 12, 'Globo de ~24 mm · la córnea aporta ~2/3 del enfoque · PIO ≈ 15 mmHg.', {
    size: 10,
    color: C.muted,
  });

  const TXT = [
    'Córnea · n = 1,3771 · ~2/3 del enfoque',
    'Cristalino · 66 % agua / 33 % proteínas · índice 1,36–1,41',
    'Humor vítreo · ~5 cm³ de los 7–8 cm³ del globo',
    'Retina + fóvea · ~120 M bastones + ~6,5 M conos · fóvea ~300 µm',
    'Punto ciego · 13–18° nasal · sin fotorreceptores',
  ];
  if (out) out('an_out', TXT[k]);
  else {
    const el = document.getElementById('an_out');
    if (el) el.textContent = TXT[k];
  }
}

// ===================== SLIDE 2 · RETINA =====================
export function drawRetina(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-retina');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const ex = +params.rt_ex || 0;
  const x0 = 44,
    x1 = w - 14;
  // panel superior: espectros de absorción
  const y0 = h * 0.4,
    top = 12;
  _axisX(ctx, x0, y0, x1, ['400', '450', '500', '550', '600', '650', '700 nm']);
  _axisY(ctx, x0, top, y0, ['0', '0,5', '1']);
  const fx = (lam: number) => x0 + ((x1 - x0) * (lam - 380)) / 340;
  const fy = (a: number) => y0 - (y0 - top - 8) * a;
  const curves: [string, number, number, string, number][] = [
    ['bastones · 500 nm', 500, 46, C.blood, 0.95],
    ['S · 445 nm', 445, 20, C.amber, 0.55],
    ['M · 535 nm', 535, 22, C.teal, 0.75],
    ['L · 570 nm', 570, 26, C.violet, 0.8],
  ];
  for (const q of curves) {
    ctx.strokeStyle = q[3];
    ctx.lineWidth = q[4] >= 0.9 ? 2.4 : 1.8;
    ctx.beginPath();
    for (let lam = 380; lam <= 700; lam += 3) {
      const y = fy(_gauss(lam, q[1], q[2]) * q[4]);
      if (lam === 380) ctx.moveTo(fx(lam), y);
      else ctx.lineTo(fx(lam), y);
    }
    ctx.stroke();
  }
  _txt(ctx, x0, top + 1, 'absorción de fotopigmentos (normalizada)', { size: 10, bold: true, color: C.ink });
  _txt(ctx, x0 + 8, y0 + 16, 'bastones (──) y conos S / M / L', { size: 9, color: C.muted });
  // panel inferior: densidad vs excentricidad
  const y2 = h - 10,
    yT = h * 0.52;
  _line(ctx, x0, y2, x1, y2, C.line, 1);
  for (let e = 0; e <= 80; e += 20) {
    const x = x0 + ((x1 - x0) * e) / 80;
    _line(ctx, x, y2, x, y2 + 3, C.line, 1);
    _txt(ctx, x, y2 + 11, String(e) + '°', { size: 9, align: 'center', color: C.muted });
  }
  _txt(ctx, x0, yT + 4, 'densidad vs excentricidad (×10³/mm²)', { size: 10, bold: true, color: C.ink });
  _line(ctx, x0, yT + 12, x0, y2, C.line, 1);
  const fx2 = (e: number) => x0 + ((x1 - x0) * e) / 80;
  const fy2 = (d: number) => y2 - ((y2 - yT - 16) * Math.log10(d + 1)) / 5.3;
  const cones = (e: number) => 160000 * Math.exp(-Math.pow(e / 11, 2)) + 4000;
  const rods = (e: number) => 150000 * Math.exp(-Math.pow((e - 20) / 28, 2)) * ((e * e) / (e * e + 2));
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let e = 0; e <= 80; e += 1) {
    const y = fy2(cones(e));
    if (e === 0) ctx.moveTo(fx2(e), y);
    else ctx.lineTo(fx2(e), y);
  }
  ctx.stroke();
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let e = 0; e <= 80; e += 1) {
    const y = fy2(rods(e));
    if (e === 0) ctx.moveTo(fx2(e), y);
    else ctx.lineTo(fx2(e), y);
  }
  ctx.stroke();
  _txt(ctx, x0 + 10, yT + 22, 'conos', { size: 10, color: C.teal, bold: true });
  _txt(ctx, x0 + 44, yT + 22, 'bastones', { size: 10, color: C.blood, bold: true });
  const mx = fx2(ex);
  _line(ctx, mx, yT + 12, mx, y2, C.amber, 1.6, [3, 3]);
  const c = cones(ex),
    r = rods(ex);
  _txt(ctx, mx, fy2(Math.max(c, r)) + 12, ex + '°', { size: 10, align: 'center', color: C.amber, bold: true });
  _txt(ctx, 12, h - 12, 'Fóvea: conos y agudeza · periferia: bastones y sensibilidad.', {
    size: 10,
    color: C.muted,
  });

  const exvText = ex === 0 ? '0° (fóvea)' : AB.espan(ex, 0) + '°';
  const outText = ex + '° · conos ≈ ' + AB.espan(c, 0) + '/mm² · bastones ≈ ' + AB.espan(r, 0) + '/mm²';
  if (out) {
    out('rt_exv', exvText);
    out('rt_out', outText);
  } else {
    const vEl = document.getElementById('rt_exv');
    if (vEl) vEl.textContent = exvText;
    const oEl = document.getElementById('rt_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 3 · FOTÓN =====================
export function drawPhoton(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-photon');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const lam = +params.ph_lam || 555;
  const x0 = 44,
    x1 = w - 14,
    y0 = h - 26,
    top = 14;
  const E = (l: number) => (6.626e-34 * 3e8) / (l * 1e-9);
  _axisX(ctx, x0, y0, x1, ['400', '450', '500', '550', '600', '650', '700 nm']);
  _axisY(ctx, x0, top, y0, ['0', '1', '2', '3', '4', '5']);
  ctx.fillStyle = 'rgba(13,110,100,0.08)';
  ctx.fillRect(x0, top, x1 - x0, y0 - top);
  const fx = (l: number) => x0 + ((x1 - x0) * (l - 400)) / 300;
  const fy = (v: number) => y0 - ((y0 - top) * (v - 2.5)) / 3.5;
  _txt(ctx, x0 + 4, top + 2, 'E = hc/λ (10⁻¹⁹ J) · banda visible 400–700 nm', {
    size: 10,
    bold: true,
    color: C.teal,
  });
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let l = 400; l <= 700; l += 2) {
    const y = fy(E(l) * 1e19);
    if (l === 400) ctx.moveTo(fx(l), y);
    else ctx.lineTo(fx(l), y);
  }
  ctx.stroke();
  // rodopsina (solapamiento)
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  for (let l = 400; l <= 700; l += 2) {
    const y = fy(2.6 + 1.6 * _gauss(l, 500, 60));
    if (l === 400) ctx.moveTo(fx(l), y);
    else ctx.lineTo(fx(l), y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  _txt(ctx, x0 + 4, y0 - 10, 'rodopsina (escala propia)', { size: 9, color: C.blood });
  const mx = fx(lam);
  const Ev = E(lam);
  _line(ctx, mx, top, mx, y0, C.amber, 1.4, [3, 3]);
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(mx, fy(Ev * 1e19), 4, 0, Math.PI * 2);
  ctx.fill();
  _txt(ctx, mx, fy(Ev * 1e19) - 10, AB.espan(lam, 0) + ' nm', {
    size: 10,
    align: 'center',
    color: C.amber,
    bold: true,
  });
  _txt(ctx, 12, h - 12, 'Solo ~50 % de la luz visible llega a la retina: reflexión, absorción y dispersión.', {
    size: 10,
    color: C.muted,
  });

  const lamvText = AB.espan(lam, 0) + ' nm';
  const outText =
    AB.espan(lam, 0) +
    ' nm · E ≈ ' +
    AB.espan(Ev * 1e19, 2) +
    '×10⁻¹⁹ J = ' +
    AB.espan(Ev / 1.6e-19, 2) +
    ' eV';
  if (out) {
    out('ph_lamv', lamvText);
    out('ph_out', outText);
  } else {
    const vEl = document.getElementById('ph_lamv');
    if (vEl) vEl.textContent = lamvText;
    const oEl = document.getElementById('ph_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 4 · LENTE =====================
export function drawLens(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-lens');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const d1 = +params.le_d || 80,
    f = +params.le_f || 30;
  const d2 = (f * d1) / (d1 - f);
  const M = d2 / d1;
  const cy = h * 0.52,
    lensX = w * 0.66,
    s = (w - 110) / 200;
  const objX = lensX - d1 * s,
    imgX = lensX + d2 * s;
  const oh = Math.min(56, h * 0.26);
  const objTop = cy - oh,
    imgTop = cy - M * oh;
  _line(ctx, 14, cy, w - 14, cy, C.line, 1);
  // focos
  _txt(ctx, lensX - f * s, cy + 14, 'F', { size: 10, align: 'center', color: C.muted });
  _txt(ctx, lensX + f * s, cy + 14, "F'", { size: 10, align: 'center', color: C.muted });
  _line(ctx, lensX - f * s, cy - 5, lensX - f * s, cy + 5, C.muted, 1);
  _line(ctx, lensX + f * s, cy - 5, lensX + f * s, cy + 5, C.muted, 1);
  // lente (biconvexa)
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(lensX, cy - oh * 0.9);
  ctx.quadraticCurveTo(lensX - 12, cy, lensX, cy + oh * 0.9);
  ctx.moveTo(lensX, cy - oh * 0.9);
  ctx.quadraticCurveTo(lensX + 12, cy, lensX, cy + oh * 0.9);
  ctx.stroke();
  // objeto
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(objX, cy);
  ctx.lineTo(objX, objTop);
  ctx.stroke();
  ctx.fillStyle = C.teal;
  ctx.beginPath();
  ctx.moveTo(objX - 4, objTop);
  ctx.lineTo(objX + 4, objTop);
  ctx.lineTo(objX, objTop - 9);
  ctx.fill();
  _txt(ctx, objX, objTop - 14, 'objeto · d₁ = ' + AB.espan(d1, 0) + ' cm', {
    size: 9,
    align: 'center',
    color: C.teal,
  });
  const real = d2 > 0;
  // rayos
  const ray = (x1: number, y1: number, x2: number, y2: number, color: string, width: number, dash?: number[]) => {
    _line(ctx, x1, y1, x2, y2, color, width, dash || []);
  };
  ray(objX, objTop, lensX, objTop, C.ink, 1.6); // paralelo
  ray(lensX, objTop, imgX, imgTop, C.ink, 1.6); // al foco imagen
  ray(objX, objTop, imgX, imgTop, C.teal, 1.6); // por el centro
  ray(lensX, objTop, lensX + 20, objTop, C.muted, 1, [4, 3]);
  ray(lensX + 20, objTop, lensX + 40, objTop, C.muted, 1, [4, 3]);
  // imagen
  if (real) {
    ctx.strokeStyle = C.blood;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(imgX, cy);
    ctx.lineTo(imgX, imgTop);
    ctx.stroke();
    ctx.fillStyle = C.blood;
    ctx.beginPath();
    ctx.moveTo(imgX - 4, imgTop);
    ctx.lineTo(imgX + 4, imgTop);
    ctx.lineTo(imgX, imgTop + 9);
    ctx.fill();
    _txt(ctx, imgX, imgTop + (imgTop < cy ? 12 : -14), 'imagen invertida', {
      size: 9,
      align: 'center',
      color: C.blood,
    });
  } else {
    _txt(ctx, lensX + 30, cy - 40, 'imagen virtual (derecha)', { size: 10, color: C.blood, bold: true });
  }
  _txt(ctx, 12, h - 12, '1/d₁ + 1/d₂ = 1/f · imagen real si d₁ > f, virtual si d₁ < f.', {
    size: 10,
    color: C.muted,
  });

  const dvText = AB.espan(d1, 0) + ' cm';
  const fvText = AB.espan(f, 0) + ' cm';
  const outText =
    'd₂ = ' +
    AB.espan(Math.abs(d2), 1) +
    ' cm ' +
    (real ? '(real) · M = ' + AB.espan(Math.abs(M), 2) : '(virtual) · M = ' + AB.espan(Math.abs(M), 2));
  if (out) {
    out('le_dv', dvText);
    out('le_fv', fvText);
    out('le_out', outText);
  } else {
    const dvEl = document.getElementById('le_dv');
    if (dvEl) dvEl.textContent = dvText;
    const fvEl = document.getElementById('le_fv');
    if (fvEl) fvEl.textContent = fvText;
    const oEl = document.getElementById('le_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 5 · SNELL =====================
export function drawSnell(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-snell');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const th = +params.sl_th || 45,
    n2 = +params.sl_n || 1.33;
  const thR = (th * Math.PI) / 180,
    n1 = 1;
  const th2 = Math.asin(clamp((n1 * Math.sin(thR)) / n2, -1, 1));
  const iy = h * 0.5,
    cx = w * 0.5;
  _line(ctx, 12, iy, w - 12, iy, C.ink, 2);
  _line(ctx, cx, 10, cx, h - 10, C.muted, 1, [4, 4]);
  const L = Math.min(150, iy - 20);
  const ix = cx - L * Math.sin(thR),
    iy0 = iy - L * Math.cos(thR);
  const rx = cx + L * Math.sin(thR),
    ry0 = iy - L * Math.cos(thR);
  const tx = cx + L * Math.sin(th2),
    ty0 = iy + L * Math.cos(th2);
  // rayo reflejado (punteado)
  _line(ctx, cx, iy, rx, ry0, C.muted, 1.2, [4, 3]);
  _txt(ctx, (cx + rx) / 2 + 6, (iy + ry0) / 2 - 6, 'reflejado', { size: 9, color: C.muted });
  // rayo refractado
  _line(ctx, cx, iy, tx, ty0, C.blood, 2.4);
  _txt(ctx, tx, ty0 + 14, 'θ₂ = ' + AB.espan((th2 * 180) / Math.PI, 1) + '°', {
    size: 10,
    align: 'center',
    color: C.blood,
    bold: true,
  });
  // rayo incidente
  _line(ctx, ix, iy0, cx, iy, C.teal, 2.4);
  _txt(ctx, ix, iy0 - 8, 'θ₁ = ' + AB.espan(th, 1) + '°', {
    size: 10,
    align: 'center',
    color: C.teal,
    bold: true,
  });
  // arcos de ángulo
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, iy, 26, Math.PI * 0.5, Math.PI * 0.5 + thR);
  ctx.stroke();
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, iy, 32, Math.PI * 0.5 - th2, Math.PI * 0.5);
  ctx.stroke();
  _txt(ctx, cx, 14, 'n₁ = 1', { size: 10, align: 'center', color: C.muted });
  _txt(ctx, cx, h - 12, 'n₂ = ' + AB.espan(n2, 2), { size: 10, align: 'center', color: C.muted });
  _txt(ctx, 12, 26, 'n₁ sin θ₁ = n₂ sin θ₂ · paraxial: n₁θ₁ ≈ n₂θ₂', { size: 10, color: C.muted });

  const thvText = AB.espan(th, 0) + '°';
  const nvText = AB.espan(n2, 2);
  const outText = 'θ₂ = ' + AB.espan((th2 * 180) / Math.PI, 1) + '° (n₂ = ' + AB.espan(n2, 2) + ')';
  if (out) {
    out('sl_thv', thvText);
    out('sl_nv', nvText);
    out('sl_out', outText);
  } else {
    const thvEl = document.getElementById('sl_thv');
    if (thvEl) thvEl.textContent = thvText;
    const nvEl = document.getElementById('sl_nv');
    if (nvEl) nvEl.textContent = nvText;
    const oEl = document.getElementById('sl_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 6 · INTERFAZ CURVA =====================
export function drawInterface(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-interface');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const R = +params.if_R || 7.8,
    n2 = +params.if_n || 1.3771,
    n1 = 1;
  const P = (n2 - n1) / (R * 0.001);
  const f2 = (n2 * R) / (n2 - n1);
  const s = 5,
    cx = w * 0.3,
    cy = h * 0.5,
    rr = R * s,
    Cx = cx + rr;
  const halfY = Math.min(h * 0.34, rr * 0.98),
    a0 = Math.asin(clamp(halfY / rr, -1, 1));
  // superficie esférica
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(Cx, cy, rr, Math.PI - a0, Math.PI + a0);
  ctx.stroke();
  // rayos paralelos → foco F₂
  const Fx = cx + f2 * s;
  const hs = [0.2, 0.42, 0.62];
  for (const q of hs) {
    for (const sg of [-1, 1]) {
      const y = cy + sg * halfY * q;
      _line(ctx, 14, y, cx + 6, y, C.muted, 1.1);
      _line(ctx, cx + 6, y, Fx, cy, C.teal, 1.4);
    }
  }
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(Fx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  _txt(ctx, Fx, cy + 16, 'F₂ · f₂ = ' + AB.espan(f2, 1) + ' mm', {
    size: 9,
    align: 'center',
    color: C.amber,
    bold: true,
  });
  _txt(ctx, cx - 8, cy - rr - 8, 'R = ' + AB.espan(R, 1) + ' mm', {
    size: 9,
    align: 'center',
    color: C.teal,
  });
  _txt(ctx, 12, h - 12, 'P₁₂ = (n₂−n₁)/R · f₂ = n₂·R/(n₂−n₁) — la córnea: P ≈ 48 D.', {
    size: 10,
    color: C.muted,
  });

  const rvText = AB.espan(R, 1) + ' mm';
  const nvText = AB.espan(n2, 4);
  const outText = 'P₁₂ = ' + AB.espan(P, 1) + ' D · f₂ = ' + AB.espan(f2, 1) + ' mm';
  if (out) {
    out('if_Rv', rvText);
    out('if_nv', nvText);
    out('if_out', outText);
  } else {
    const rEl = document.getElementById('if_Rv');
    if (rEl) rEl.textContent = rvText;
    const nEl = document.getElementById('if_nv');
    if (nEl) nEl.textContent = nvText;
    const oEl = document.getElementById('if_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 7 · ECUACIÓN DEL FABRICANTE =====================
export function drawMaker(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-maker');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const n = +params.fb_n || 1.5,
    R = +params.fb_R || 40;
  const f = R / (2 * (n - 1));
  const P = 1 / (f * 0.001);
  const s = Math.min(7, (w * 0.6) / f);
  const cx = w * 0.3,
    cy = h * 0.5,
    H = Math.min(88, h * 0.34),
    Fx = cx + f * s;
  // lente biconvexa
  ctx.fillStyle = 'rgba(120,160,190,0.35)';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - H);
  ctx.quadraticCurveTo(cx - 18, cy, cx, cy + H);
  ctx.quadraticCurveTo(cx + 18, cy, cx, cy - H);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // rayos paralelos
  for (const q of [0.3, 0.55, 0.78]) {
    for (const sg of [-1, 1]) {
      const y = cy + sg * H * q;
      _line(ctx, 14, y, cx, y, C.muted, 1.1);
      _line(ctx, cx, y, Fx, cy, C.teal, 1.4);
    }
  }
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(Fx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  _txt(ctx, Fx, cy + 16, 'F · f = ' + AB.espan(f, 0) + ' mm', {
    size: 9,
    align: 'center',
    color: C.amber,
    bold: true,
  });
  _txt(ctx, cx, cy - H - 8, 'lente simétrica · R₁₂ = R, R₂₃ = −R', {
    size: 9,
    align: 'center',
    color: C.muted,
  });
  _txt(ctx, 12, h - 12, '1/f = (n−1)(1/R₁₂ − 1/R₂₃) · para la simétrica: f = R/(2(n−1)).', {
    size: 10,
    color: C.muted,
  });

  const nvText = AB.espan(n, 2);
  const rvText = AB.espan(R, 0) + ' mm';
  const outText = 'f = ' + AB.espan(f, 0) + ' mm · P = ' + AB.espan(P, 1) + ' D';
  if (out) {
    out('fb_nv', nvText);
    out('fb_Rv', rvText);
    out('fb_out', outText);
  } else {
    const nEl = document.getElementById('fb_nv');
    if (nEl) nEl.textContent = nvText;
    const rEl = document.getElementById('fb_Rv');
    if (rEl) rEl.textContent = rvText;
    const oEl = document.getElementById('fb_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 8 · EFECTIVIDAD Y SISTEMAS =====================
export function drawEffect(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-effect');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const t = +params.ef_t || 15,
    Pb = +params.ef_P || 5,
    Pa = 15,
    n2 = 1;
  const P_eff = Pa + Pb - ((t * 0.001) / n2) * Pa * Pb;
  const s = Math.min(6, (w * 0.66) / 60),
    cy = h * 0.5;
  const xA = w * 0.18,
    xB = xA + t * s;
  _line(ctx, 14, cy, w - 14, cy, C.line, 1);
  // lente A
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(xA, cy - 58);
  ctx.lineTo(xA, cy + 58);
  ctx.stroke();
  _txt(ctx, xA, cy - 66, 'P_a = 15 D', { size: 9, align: 'center', color: C.teal, bold: true });
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.moveTo(xA - 5, cy - 52);
  ctx.lineTo(xA + 5, cy - 52);
  ctx.lineTo(xA, cy - 44);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(xA - 5, cy + 52);
  ctx.lineTo(xA + 5, cy + 52);
  ctx.lineTo(xA, cy + 44);
  ctx.fill();
  // lente B
  const colB = Pb >= 0 ? C.blood : C.violet;
  ctx.strokeStyle = colB;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(xB, cy - 58);
  ctx.lineTo(xB, cy + 58);
  ctx.stroke();
  _txt(ctx, xB, cy - 66, 'P_b = ' + AB.espan(Pb, 1) + ' D', {
    size: 9,
    align: 'center',
    color: colB,
    bold: true,
  });
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.moveTo(xB - 5, cy - 52);
  ctx.lineTo(xB + 5, cy - 52);
  ctx.lineTo(xB, cy - 44);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(xB - 5, cy + 52);
  ctx.lineTo(xB + 5, cy + 52);
  ctx.lineTo(xB, cy + 44);
  ctx.fill();
  // rayos
  const fE = P_eff !== 0 ? 1000 / P_eff : Infinity;
  for (const q of [0.3, 0.6]) {
    const y = cy + 58 * q;
    _line(ctx, 14, y, xA, y, C.muted, 1.1);
    _line(ctx, xA, y, xB, y, C.muted, 1.1);
    if (P_eff > 0) {
      _line(ctx, xB, y, xB + fE * s, cy, C.teal, 1.4);
    } else {
      _line(ctx, xB, y, xB + 90, cy - (cy - y) * 1.3, C.blood, 1.3);
    }
  }
  if (P_eff > 0 && fE * s < w * 0.8) {
    ctx.fillStyle = C.amber;
    ctx.beginPath();
    ctx.arc(xB + fE * s, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  _txt(ctx, w / 2, 14, 'P_eff = P_a + P_b − (t/n)P_aP_b', {
    size: 11,
    bold: true,
    color: C.teal,
    align: 'center',
  });
  _txt(ctx, w / 2, 28, 'separación t = ' + AB.espan(t, 0) + ' mm', {
    size: 9,
    color: C.muted,
    align: 'center',
  });
  _txt(ctx, 12, h - 12, 'Alejar las lentes resta poder: el término −(t/n)P_aP_b. Gafas vs contacto difieren así.', {
    size: 10,
    color: C.muted,
  });

  const tvText = AB.espan(t, 0) + ' mm';
  const pvText = (Pb >= 0 ? '+' : '−') + AB.espan(Math.abs(Pb), 1) + ' D';
  const outText = 'P_eff = ' + AB.espan(P_eff, 2) + ' D (P_a = 15 D)';
  if (out) {
    out('ef_tv', tvText);
    out('ef_Pv', pvText);
    out('ef_out', outText);
  } else {
    const tEl = document.getElementById('ef_tv');
    if (tEl) tEl.textContent = tvText;
    const pEl = document.getElementById('ef_Pv');
    if (pEl) pEl.textContent = pvText;
    const oEl = document.getElementById('ef_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 9 · OJO ESQUEMÁTICO =====================
export function drawSchematic(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-schematic');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const k = +params.oe_sel || 0;
  const P = [48.35, -6.11, 8.1, 14.0];
  const NAMES = ['aire → córnea', 'córnea → acuoso', 'acuoso → cristalino', 'cristalino → vítreo'];
  const NS = [
    ['aire', '1,000'],
    ['córnea', '1,3771'],
    ['acuoso', '1,3374'],
    ['cristalino', '1,42'],
    ['vítreo', '1,336'],
  ];
  const mm = (w - 64) / 24.5,
    ox = w * 0.14,
    cy = h * 0.5,
    RY = Math.min(h * 0.3, h * 0.3);
  // globo
  ctx.fillStyle = '#e7ddc9';
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(ox + 12.5 * mm, cy, 13.5 * mm, RY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // superficies 1..4 (posiciones en mm: 0, 0.6, 3.7, 7.4) y retina 24.3
  const pos = [0, 0.6, 3.7, 7.4],
    ret = 24.3;
  for (let i = 0; i < 4; i++) {
    const x = ox + pos[i] * mm;
    const col = i === k ? C.teal : C.muted;
    ctx.strokeStyle = col;
    ctx.lineWidth = i === k ? 3.2 : 1.6;
    ctx.beginPath();
    ctx.moveTo(x, cy - RY * 0.78);
    ctx.lineTo(x, cy + RY * 0.78);
    ctx.stroke();
    _txt(ctx, x, cy - RY * 0.82 - 6, 'P' + (i + 1) + (i + 1) + ' = ' + AB.espan(P[i], 2) + ' D', {
      size: 8,
      align: 'center',
      color: col,
      bold: i === k,
    });
  }
  // retina
  const rx = ox + ret * mm;
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(rx, cy - RY * 0.8);
  ctx.lineTo(rx, cy + RY * 0.8);
  ctx.stroke();
  _txt(ctx, rx, cy + RY * 0.9, 'retina · 24,3 mm', { size: 9, align: 'center', color: C.blood, bold: true });
  // rayos convergiendo a la retina
  for (const q of [0.3, 0.55]) {
    const y = cy - RY * 0.72 * q;
    _line(ctx, 12, y, ox + pos[0] * mm, y, C.muted, 1);
    _line(ctx, ox + pos[0] * mm, y, ox + pos[1] * mm, y, C.muted, 1);
    _line(ctx, ox + pos[1] * mm, y, ox + pos[2] * mm, y, C.muted, 1);
    _line(ctx, ox + pos[2] * mm, y, ox + pos[3] * mm, y, C.muted, 1);
    _line(ctx, ox + pos[3] * mm, y, rx, cy, C.teal, 1.3);
  }
  _txt(ctx, ox + pos[3] * mm, cy - RY * 0.7 - 8, 'cristalino', { size: 9, align: 'center', color: C.muted });
  _txt(ctx, ox + pos[0] * mm, cy - RY * 0.7 - 8, 'córnea', { size: 9, align: 'center', color: C.muted });
  _txt(ctx, 12, h - 12, 'P_córnea = 42,24 D · P_cristalino = 22,10 D · P_ojo = 64,34 D (f = 20,8 mm).', {
    size: 10,
    color: C.muted,
  });

  const outText =
    'P' +
    (k + 1) +
    (k + 1) +
    ' = ' +
    AB.espan(P[k], 2) +
    ' D · ' +
    NAMES[k] +
    ' (n: ' +
    NS[k][0] +
    ' → ' +
    NS[k][1] +
    ')';
  if (out) out('oe_out', outText);
  else {
    const el = document.getElementById('oe_out');
    if (el) el.textContent = outText;
  }
}

// ===================== SLIDE 10 · BAJO EL AGUA Y OJO REDUCIDO =====================
export function drawReduced(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-reduced');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const k = +params.ag_sel || 0,
    inWater = k === 1;
  const ne = 4 / 3,
    R = 5.55;
  const P = inWater ? 21.9 : 60;
  const f = (ne / P) * 1000;
  const s = (w * 0.66) / 22.22,
    x0 = w * 0.14,
    cy = h * 0.5,
    RY = Math.min(h * 0.3, h * 0.3);
  const retX = x0 + 22.22 * s;
  const focX = x0 + Math.min(f * s, w - x0 - 10);
  // globo
  ctx.fillStyle = inWater ? 'rgba(31,111,178,0.10)' : '#e7ddc9';
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x0 + 12.5 * s, cy, 13 * s, RY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // superficie esférica única
  const rr = R * 7;
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(
    x0 + rr,
    cy,
    rr,
    Math.PI - Math.asin(clamp(RY / rr, -1, 1)),
    Math.PI + Math.asin(clamp(RY / rr, -1, 1))
  );
  ctx.stroke();
  // retina
  ctx.strokeStyle = Math.abs(f - 22.22) < 1 ? C.teal : C.blood;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(retX, cy - RY * 0.82);
  ctx.lineTo(retX, cy + RY * 0.82);
  ctx.stroke();
  _txt(ctx, retX, cy - RY * 0.86 - 4, 'retina · 22,22 mm', { size: 9, align: 'center', color: C.muted });
  // rayos
  const ok = Math.abs(f - 22.22) < 1;
  for (const q of [0.3, 0.6]) {
    const y = cy - RY * 0.72 * q;
    _line(ctx, 12, y, x0 + 8, y, C.muted, 1.1);
    if (ok) {
      _line(ctx, x0 + 8, y, focX, cy, C.teal, 1.5);
    } else {
      _line(ctx, x0 + 8, y, retX, y + (f > 22.22 ? 6 : 6) * q * 0, C.muted, 1);
      _line(ctx, x0 + 8, y, focX, cy, C.blood, 1.5);
      ctx.fillStyle = C.blood;
      ctx.beginPath();
      ctx.arc(retX, cy - (cy - y) * (1 - q), 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = ok ? C.teal : C.blood;
  ctx.beginPath();
  ctx.arc(focX, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  _txt(ctx, focX, cy + 16, ok ? 'foco sobre la retina' : 'foco detrás: borroso', {
    size: 9,
    align: 'center',
    color: ok ? C.teal : C.blood,
    bold: true,
  });
  _txt(ctx, 12, 14, 'P = ' + (inWater ? '21,9' : '60,0') + ' D · f = ' + AB.espan(f, 1) + ' mm', {
    size: 12,
    bold: true,
    color: C.teal,
  });
  _txt(
    ctx,
    12,
    h - 12,
    inWater
      ? 'Bajo el agua la córnea pierde 42,4 D: el foco cae detrás de la retina.'
      : 'En el aire el ojo reducido (n = 4/3, R = 5,55 mm) enfoca en la retina.',
    { size: 10, color: C.muted }
  );

  const outText = inWater
    ? 'Agua · P_ojo = 21,9 D · foco detrás de la retina'
    : 'Aire · P_ojo = 60 D · foco en la retina';
  if (out) out('ag_out', outText);
  else {
    const el = document.getElementById('ag_out');
    if (el) el.textContent = outText;
  }
}

// ===================== SLIDE 11 · ACOMODACIÓN (ANIMADA) =====================
export function drawAccom(params: SimParams, flags: SimFlags, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-accom');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const age = +params.ac_age || 25;
  const A = acomodacion(age),
    PP = A > 0 ? 100 / A : 100;
  const ph = ((flags.acT || 0) % 2) / 2;
  const bulge = 0.62 + 0.38 * Math.sin(ph * 2 * Math.PI);
  const cy = h * 0.3,
    cx = w * 0.4,
    RY = Math.min(h * 0.16, h * 0.16);
  // globo (vista lateral simplificada)
  ctx.fillStyle = '#e7ddc9';
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx + 14, cy, RY * 2.6, RY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // cristalino (se abomba/aplana)
  const lx = cx + 14;
  ctx.fillStyle = 'rgba(255,190,80,0.75)';
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(lx, cy, 6 + 10 * bulge, RY * 0.55 * bulge, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // músculo ciliar (anillo)
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(lx, cy, RY * 0.85, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(lx, cy, RY * 0.85, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  _txt(ctx, lx, cy - RY - 6, bulge > 0.72 ? 'acomodando (cerca)' : 'relajado (lejos)', {
    size: 10,
    align: 'center',
    color: C.amber,
    bold: true,
  });
  _txt(ctx, 14, cy + 26, 'PP ≈ ' + AB.espan(PP, 0) + ' cm', { size: 11, color: C.blood, bold: true });
  _txt(ctx, 14, cy + 42, 'acomodación = ' + AB.espan(A, 1) + ' D', { size: 11, color: C.teal, bold: true });
  // gráfico: acomodación vs edad
  const x0 = w * 0.42,
    x1 = w - 14,
    y0 = h - 26,
    top = h * 0.56;
  _line(ctx, x0, y0, x1, y0, C.line, 1);
  for (let a = 0; a <= 70; a += 10) {
    const x = x0 + ((x1 - x0) * a) / 70;
    _line(ctx, x, y0, x, y0 + 3, C.line, 1);
    _txt(ctx, x, y0 + 11, String(a), { size: 9, align: 'center', color: C.muted });
  }
  _line(ctx, x0, top, x0, y0, C.line, 1);
  _txt(ctx, x0 - 6, y0 + 12, '0', { size: 9, align: 'right', color: C.muted });
  _txt(ctx, x0 - 6, top, '14 D', { size: 9, align: 'right', color: C.muted });
  _txt(ctx, x0 + 6, top - 2, 'Acomodación vs edad (Tabla 11.2)', { size: 10, bold: true, color: C.ink });
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let a = 8; a <= 70; a += 0.5) {
    const x = x0 + ((x1 - x0) * a) / 70,
      y = top + (y0 - top) * (1 - acomodacion(a) / 14);
    if (a === 8) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  const mx = x0 + ((x1 - x0) * age) / 70,
    my = top + (y0 - top) * (1 - A / 14);
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(mx, my, 4, 0, Math.PI * 2);
  ctx.fill();
  _line(ctx, mx, my, mx, y0, C.amber, 1.3, [3, 3]);
  _txt(ctx, mx, y0 + 11, age + ' años', { size: 9, align: 'center', color: C.amber, bold: true });
  _txt(ctx, 12, h - 12, 'La presbicia: a 55 años faltan +2,7 D para leer a 25 cm.', {
    size: 10,
    color: C.muted,
  });

  const agevText = age + ' años';
  const outText =
    age +
    ' años · acomodación ' +
    AB.espan(A, 1) +
    ' D · PP ≈ ' +
    AB.espan(PP, 0) +
    ' cm' +
    (flags.acPlaying ? ' · animando' : '');
  if (out) {
    out('ac_agev', agevText);
    out('ac_out', outText);
  } else {
    const vEl = document.getElementById('ac_agev');
    if (vEl) vEl.textContent = agevText;
    const oEl = document.getElementById('ac_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 12 · DIFRACCIÓN =====================
export function drawDiffraction(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-diffraction');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const d = +params.df_d || 5,
    lam = +params.df_lam || 555,
    f = 17;
  const D = 2.44 * (f / d) * (lam * 1e-6) * 1000; // µm
  const cy = h * 0.46;
  // abertura (pupila)
  const pr = 22 + d * 13;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(46, cy, pr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(35,44,54,0.08)';
  ctx.beginPath();
  ctx.arc(46, cy, pr - 2, 0, Math.PI * 2);
  ctx.fill();
  _txt(ctx, 46, cy + pr + 14, 'pupila d = ' + AB.espan(d, 1) + ' mm', {
    size: 10,
    align: 'center',
    color: C.ink,
    bold: true,
  });
  // rayos que convergen al disco
  const spotX = w * 0.62;
  _line(ctx, 46 - pr + 6, cy - pr + 8, spotX, cy, C.muted, 1, [3, 3]);
  _line(ctx, 46 + pr - 6, cy - pr + 8, spotX, cy, C.muted, 1, [3, 3]);
  _line(ctx, 46 - pr + 6, cy + pr - 8, spotX, cy, C.muted, 1, [3, 3]);
  _line(ctx, 46 + pr - 6, cy + pr - 8, spotX, cy, C.muted, 1, [3, 3]);
  // disco de Airy
  const sr = Math.max(3, D * 5);
  const grad = ctx.createRadialGradient(spotX, cy, 0, spotX, cy, sr * 1.6);
  grad.addColorStop(0, 'rgba(14,110,102,0.9)');
  grad.addColorStop(0.5, 'rgba(14,110,102,0.45)');
  grad.addColorStop(0.7, 'rgba(14,110,102,0.08)');
  grad.addColorStop(1, 'rgba(14,110,102,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(spotX, cy, sr * 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(spotX, cy, sr, 0, Math.PI * 2);
  ctx.stroke();
  _txt(ctx, spotX, cy + sr + 12, 'disco de Airy ≈ ' + AB.espan(D, 1) + ' µm', {
    size: 10,
    align: 'center',
    color: C.teal,
    bold: true,
  });
  // escala de cono 2 µm
  const bx = spotX - sr - 6,
    by = cy + sr + 24;
  _line(ctx, bx, by, bx + 10, by, C.blood, 2);
  _txt(ctx, bx + 5, by + 10, '2 µm ≈ cono foveal', { size: 8, align: 'center', color: C.blood });
  _txt(
    ctx,
    12,
    14,
    'D ≈ 2,44 (f/d) λ · f = 17 mm · d = ' + AB.espan(d, 1) + ' mm · λ = ' + AB.espan(lam, 0) + ' nm',
    { size: 11, bold: true, color: C.teal }
  );
  _txt(
    ctx,
    12,
    h - 12,
    'Pupila grande: difracción mínima (2,5 µm), pero aberraciones máximas. El ojo elige un compromiso.',
    { size: 10, color: C.muted }
  );

  const dvText = AB.espan(d, 1) + ' mm';
  const lamvText = AB.espan(lam, 0) + ' nm';
  const outText =
    'Disco de Airy ≈ ' +
    AB.espan(D, 1) +
    ' µm @ d = ' +
    AB.espan(d, 1) +
    ' mm' +
    (D < 3 ? ' · a la escala del cono foveal' : '');
  if (out) {
    out('df_dv', dvText);
    out('df_lamv', lamvText);
    out('df_out', outText);
  } else {
    const dEl = document.getElementById('df_dv');
    if (dEl) dEl.textContent = dvText;
    const lEl = document.getElementById('df_lamv');
    if (lEl) lEl.textContent = lamvText;
    const oEl = document.getElementById('df_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 13 · ABERRACIONES =====================
export function drawAberr(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-aberr');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const lam = +params.ab_lam || 555;
  const p = 1.7312,
    q = 0.63346,
    c = 0.2141;
  const Dlam = (l: number) => p - q / (l - c);
  const dRef = Dlam(0.578);
  const dLam = Dlam(lam / 1000) - dRef;
  const x0 = 44,
    x1 = w - 14,
    y0 = h - 30,
    top = 14;
  _axisX(ctx, x0, y0, x1, ['400', '450', '500', '550', '600', '650', '700 nm']);
  _axisY(ctx, x0, top, y0, ['−1', '0', '+1', '+2 D']);
  const fx = (l: number) => x0 + ((x1 - x0) * (l - 400)) / 300;
  const fy = (dv: number) => y0 - ((y0 - top - 8) * (dv + 0.7)) / 3;
  ctx.strokeStyle = C.violet;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let l = 400; l <= 700; l += 2) {
    const y = fy(Dlam(l / 1000) - dRef);
    if (l === 400) ctx.moveTo(fx(l), y);
    else ctx.lineTo(fx(l), y);
  }
  ctx.stroke();
  _txt(ctx, x0 + 6, top + 1, 'ΔD(λ) = D(λ) − D(578 nm) · cromática total ≈ 2 D', {
    size: 10,
    bold: true,
    color: C.violet,
  });
  // foco cromático: lente + rayos R/G/B
  const cx = w * 0.62,
    cy = h * 0.52,
    H = Math.min(64, h * 0.24);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - H);
  ctx.quadraticCurveTo(cx - 12, cy, cx, cy + H);
  ctx.moveTo(cx, cy - H);
  ctx.quadraticCurveTo(cx + 12, cy, cx, cy + H);
  ctx.stroke();
  _line(ctx, cx, cy + H * 0.5, w - 10, cy + H * 0.5, C.line, 1);
  const foff: [string, number, string][] = [
    ['450 nm', -9, C.blue],
    ['555 nm', 0, C.teal],
    ['650 nm', 9, C.blood],
  ];
  for (const qf of foff) {
    const fx2 = cx + 36 + qf[1] * 1.1;
    const y = cy - H * 0.75;
    _line(ctx, cx - 40, y, cx, y, C.muted, 1);
    _line(ctx, cx, y, fx2, cy, qf[2], 1.5);
    ctx.fillStyle = qf[2];
    ctx.beginPath();
    ctx.arc(fx2, cy, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  _txt(ctx, cx, cy + H * 0.8, 'esférica L·AE ∝ y² · T·AE ∝ y³ · coma · curvatura de campo', {
    size: 9,
    color: C.muted,
  });
  _txt(
    ctx,
    12,
    h - 12,
    'El azul enfoca antes que el rojo: ~2 D de cromática sobre el visible (D(λ) = p − q/(λ−c)).',
    { size: 10, color: C.muted }
  );

  const lamvText = AB.espan(lam, 0) + ' nm';
  const outText =
    AB.espan(lam, 0) +
    ' nm · ΔD ≈ ' +
    (dLam >= 0 ? '+' : '−') +
    AB.espan(Math.abs(dLam), 2) +
    ' D vs 578 nm';
  if (out) {
    out('ab_lamv', lamvText);
    out('ab_out', outText);
  } else {
    const lEl = document.getElementById('ab_lamv');
    if (lEl) lEl.textContent = lamvText;
    const oEl = document.getElementById('ab_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 14 · SNELLEN =====================
export function drawSnellen(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-snellen');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const line = +params.va_line || 20;
  const tot = (line / 20) * 5,
    detail = tot / 5,
    VA = 1 / detail;
  const hmm = 2 * 6000 * Math.tan(((tot / 60) * Math.PI) / 180 / 2);
  const hE = Math.min(h * 0.62, Math.max(34, hmm * 7));
  const cell = hE / 5;
  const bx = w / 2 - hE / 2,
    by = h * 0.3;
  const E = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ];
  for (let r = 0; r < 5; r++)
    for (let col = 0; col < 5; col++) {
      if (E[r][col]) {
        _rect(ctx, bx + col * cell, by + r * cell, cell, cell, C.teal);
      } else {
        _rect(ctx, bx + col * cell, by + r * cell, cell, cell, '#e9e1cd', 2);
      }
    }
  ctx.strokeStyle = C.muted;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(bx, by, hE, hE);
  _txt(ctx, w / 2, by + hE + 16, '20/' + line + ' · E de ' + AB.espan(hmm, 1) + ' mm @ 6 m', {
    size: 10,
    align: 'center',
    color: C.teal,
    bold: true,
  });
  // arco de ángulo total
  const angR = (((tot / 60) * Math.PI) / 180);
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(bx - 6, by + hE, 34, Math.PI * 0.5 - angR * 0.5, Math.PI * 0.5 + angR * 0.5);
  ctx.stroke();
  _txt(ctx, bx - 6, by + hE + 42, AB.espan(tot, 1) + '′ de arco', {
    size: 9,
    align: 'center',
    color: C.amber,
    bold: true,
  });
  _txt(ctx, 12, 12, 'Tabla de Snellen a 20 pies (6 m) · 480 lux · la E 20/20 subtiende 5′ (detalle 1′).', {
    size: 10,
    color: C.muted,
  });
  _txt(ctx, 12, h - 12, 'VA = 1/θ_min: 20/20 → VA 1,0 · 20/40 → VA 0,5 · 20/200 → VA 0,1.', {
    size: 10,
    color: C.muted,
  });

  const linevText = '20/' + line;
  const outText = '20/' + line + ' · VA = ' + AB.espan(VA, 2) + ' · θ = ' + AB.espan(tot, 1) + '′ de arco';
  if (out) {
    out('va_linev', linevText);
    out('va_out', outText);
  } else {
    const lEl = document.getElementById('va_linev');
    if (lEl) lEl.textContent = linevText;
    const oEl = document.getElementById('va_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 15 · MIOPÍA / HIPERMETROPÍA =====================
export function drawAmp(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-amp');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const k = +params.my_sel || 0;
  const cy = h * 0.5,
    RY = Math.min(h * 0.3, h * 0.3),
    cx = w * 0.28,
    rx = w * 0.72;
  const frel = [1.0, 0.84, 1.16][k]; // posición del foco en [0..1] del eje
  const retX = rx;
  const focX = cx + (retX - cx) * frel;
  // globo
  ctx.fillStyle = '#e7ddc9';
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse((cx + retX) / 2, cy, (retX - cx) / 2, RY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // cristalino
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - RY * 0.7);
  ctx.quadraticCurveTo(cx - 10, cy, cx, cy + RY * 0.7);
  ctx.moveTo(cx, cy - RY * 0.7);
  ctx.quadraticCurveTo(cx + 10, cy, cx, cy + RY * 0.7);
  ctx.stroke();
  // retina
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(retX, cy - RY * 0.8);
  ctx.lineTo(retX, cy + RY * 0.8);
  ctx.stroke();
  _txt(ctx, retX, cy - RY * 0.84 - 4, 'retina', { size: 9, align: 'center', color: C.blood });
  // rayos paralelos
  for (const q of [0.3, 0.62]) {
    const y = cy - RY * 0.68 * q;
    _line(ctx, 10, y, cx, y, C.muted, 1.1);
    _line(ctx, cx, y, focX, cy, C.amber, 1.6);
    _line(ctx, focX, cy, retX, cy - (cy - y) * (frel > 1 ? 0.25 : 0.3), C.amber, 1.2, [3, 3]);
  }
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(focX, cy, 3.6, 0, Math.PI * 2);
  ctx.fill();
  // lente correctora (dibujada frente al ojo cuando hace falta)
  if (k > 0) {
    const lx = w * 0.1;
    const col = k === 1 ? C.blood : C.teal;
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(lx, cy - RY * 0.5);
    ctx.lineTo(lx, cy + RY * 0.5);
    ctx.stroke();
    _txt(ctx, lx, cy - RY * 0.5 - 8, k === 1 ? 'lente −' : 'lente +', {
      size: 9,
      align: 'center',
      color: col,
      bold: true,
    });
    _line(ctx, lx - 4, cy - RY * 0.4, lx + 4, cy - RY * 0.4, C.ink, 1.4);
    _line(ctx, lx - 4, cy + RY * 0.4, lx + 4, cy + RY * 0.4, C.ink, 1.4);
  }
  const NAME = ['Emétrope', 'Míope', 'Hipermétrope'];
  _txt(
    ctx,
    12,
    14,
    NAME[k] + ': el foco cae ' + (k === 0 ? 'sobre la retina' : k === 1 ? 'antes de la retina' : 'detrás de la retina'),
    { size: 11, bold: true, color: C.amber }
  );
  _txt(
    ctx,
    12,
    h - 12,
    k === 1
      ? 'FP = 53 cm → anteojos −1,93 D · contacto −1,89 D'
      : k === 2
      ? 'NP = 190 cm → anteojos +3,67 D · contacto +3,47 D'
      : 'La emetropía: el ojo relajado enfoca el infinito en la retina.',
    { size: 10, color: C.muted }
  );

  const outText =
    NAME[k] +
    ' · ' +
    (k === 1
      ? 'corrección ≈ −1,9 D (divergente)'
      : k === 2
      ? 'corrección ≈ +3,6 D (convergente)'
      : 'foco sobre la retina');
  if (out) out('my_out', outText);
  else {
    const el = document.getElementById('my_out');
    if (el) el.textContent = outText;
  }
}

// ===================== SLIDE 16 · ASTIGMATISMO Y VÉRTICE =====================
export function drawToric(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-toric');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const D = +params.as_d || 14,
    P = +params.as_P || -5,
    n = 1.337;
  const Pc = P / (1 - (D * 0.001 * P) / n);
  const cy = h * 0.34,
    cx = w * 0.28,
    RY = Math.min(h * 0.22, h * 0.22);
  // córnea tórica: dos meridianos
  ctx.fillStyle = '#e7ddc9';
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse((cx + 0.34 * w) / 2 + 0.08 * w, cy, 0.24 * w, RY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // meridianos con focos distintos
  const f1 = cx + 0.3 * w,
    f2 = cx + 0.4 * w;
  for (const sg of [-1, 1]) {
    _line(ctx, cx, cy + sg * RY * 0.7, cx + 0.44 * w, cy, C.violet, 1.2);
  }
  _line(ctx, cx, cy, cx + 0.52 * w, cy, C.teal, 2);
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(f1, cy, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.blood;
  ctx.beginPath();
  ctx.arc(f2, cy, 3.4, 0, Math.PI * 2);
  ctx.fill();
  _line(ctx, f1, cy - RY, f1, cy + RY, C.amber, 1, [3, 3]);
  _line(ctx, f2, cy - RY, f2, cy + RY, C.blood, 1, [3, 3]);
  _txt(ctx, (f1 + f2) / 2, cy + RY + 6, 'dos líneas focales (meridianos desiguales)', {
    size: 9,
    align: 'center',
    color: C.muted,
  });
  _txt(ctx, cx, cy - RY - 8, 'córnea tórica', { size: 10, align: 'center', color: C.ink, bold: true });
  // gráfico: P_contacto vs distancia vértice
  const x0 = w * 0.14,
    x1 = w - 14,
    y0 = h - 22,
    top = h * 0.56;
  _line(ctx, x0, y0, x1, y0, C.line, 1);
  for (let d = 0; d <= 20; d += 5) {
    const x = x0 + ((x1 - x0) * d) / 20;
    _line(ctx, x, y0, x, y0 + 3, C.line, 1);
    _txt(ctx, x, y0 + 11, String(d), { size: 9, align: 'center', color: C.muted });
  }
  _line(ctx, x0, top, x0, y0, C.line, 1);
  _txt(ctx, x0 - 6, top, '+5 D', { size: 9, align: 'right', color: C.muted });
  _txt(ctx, x0 - 6, y0, '−5 D', { size: 9, align: 'right', color: C.muted });
  _txt(ctx, x0 + 6, top - 2, 'P_contacto vs distancia de vértice', { size: 10, bold: true, color: C.ink });
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let d = 0; d <= 20; d += 0.4) {
    const pc = P / (1 - (d * 0.001 * P) / n);
    const x = x0 + ((x1 - x0) * d) / 20,
      y = top + (y0 - top) * (0.5 - pc / 10);
    if (d === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  const mx = x0 + ((x1 - x0) * D) / 20,
    my = top + (y0 - top) * (0.5 - Pc / 10);
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(mx, my, 4, 0, Math.PI * 2);
  ctx.fill();
  _line(ctx, mx, my, mx, y0, C.amber, 1.3, [3, 3]);
  _txt(ctx, mx, y0 + 11, AB.espan(D, 0) + ' mm', { size: 9, align: 'center', color: C.amber, bold: true });
  _txt(
    ctx,
    12,
    h - 12,
    'El contacto (D ≈ 0) cambia la efectividad de la gafa: −5 D → −4,7 D · +5 D → +5,3 D.',
    { size: 10, color: C.muted }
  );

  const dvText = AB.espan(D, 0) + ' mm';
  const pvText = (P >= 0 ? '+' : '−') + AB.espan(Math.abs(P), 1) + ' D';
  const outText =
    (P >= 0 ? '+' : '−') +
    AB.espan(Math.abs(P), 1) +
    ' D @ ' +
    AB.espan(D, 0) +
    ' mm → ' +
    (Pc >= 0 ? '+' : '−') +
    AB.espan(Math.abs(Pc), 2) +
    ' D en contacto';
  if (out) {
    out('as_dv', dvText);
    out('as_Pv', pvText);
    out('as_out', outText);
  } else {
    const dEl = document.getElementById('as_dv');
    if (dEl) dEl.textContent = dvText;
    const pEl = document.getElementById('as_Pv');
    if (pEl) pEl.textContent = pvText;
    const oEl = document.getElementById('as_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 17 · BRILLO Y FOTOMETRÍA =====================
export function drawBright(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-bright');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const I = +params.br_I || 100,
    n = 0.4;
  const b = Math.pow(I, n);
  // curvas de luminosidad
  const y0 = h * 0.42,
    x0 = 44,
    x1 = w - 14,
    top = 12;
  _axisX(ctx, x0, y0, x1, ['400', '450', '500', '550', '600', '650', '700 nm']);
  _axisY(ctx, x0, top, y0, ['0', '0,5', '1']);
  const fx = (lam: number) => x0 + ((x1 - x0) * (lam - 380)) / 340;
  const fy = (a: number) => y0 - (y0 - top - 10) * a;
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let lam = 380; lam <= 700; lam += 3) {
    const y = fy(_gauss(lam, 555, 85));
    if (lam === 380) ctx.moveTo(fx(lam), y);
    else ctx.lineTo(fx(lam), y);
  }
  ctx.stroke();
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let lam = 380; lam <= 700; lam += 3) {
    const y = fy(_gauss(lam, 507, 88));
    if (lam === 380) ctx.moveTo(fx(lam), y);
    else ctx.lineTo(fx(lam), y);
  }
  ctx.stroke();
  _txt(ctx, fx(555), fy(_gauss(555, 555, 85)) + 12, '555 nm · 683 lm/W', {
    size: 9,
    align: 'center',
    color: C.teal,
    bold: true,
  });
  _txt(ctx, fx(507), fy(_gauss(507, 507, 88)) - 6, '507 nm · 1 700 lm/W', {
    size: 9,
    align: 'center',
    color: C.blood,
    bold: true,
  });
  _txt(ctx, x0 + 4, top + 1, 'fotópica (día) y escotópica (noche) · desplazamiento de Purkinje', {
    size: 10,
    bold: true,
    color: C.ink,
  });
  // Stevens
  const y2 = h - 10,
    yT = h * 0.52;
  _line(ctx, x0, y2, x1, y2, C.line, 1);
  _line(ctx, x0, yT + 8, x0, y2, C.line, 1);
  _txt(ctx, x0 + 6, yT + 4, 'Ley de Stevens: P = K·S^n, n ≈ 0,4', { size: 10, bold: true, color: C.ink });
  const lx = (s: number) => x0 + ((x1 - x0) * Math.log10(s)) / 3;
  const ly = (p: number) => y2 - ((y2 - yT - 16) * p) / 10;
  for (let s = 1; s <= 1000; s *= 10) {
    _line(ctx, lx(s), y2, lx(s), y2 + 3, C.line, 1);
    _txt(ctx, lx(s), y2 + 11, s >= 1000 ? '10³' : String(s) + '×', {
      size: 9,
      align: 'center',
      color: C.muted,
    });
  }
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let s = 1; s <= 1000; s *= 1.02) {
    const y = ly(Math.pow(s, n));
    if (s === 1) ctx.moveTo(lx(s), y);
    else ctx.lineTo(lx(s), y);
  }
  ctx.stroke();
  const mx = lx(I),
    my = ly(b);
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(mx, my, 4, 0, Math.PI * 2);
  ctx.fill();
  _line(ctx, mx, my, mx, y2, C.amber, 1.3, [3, 3]);
  _txt(ctx, mx, Math.max(my - 10, yT + 8), 'I ×' + AB.espan(I, 0), {
    size: 9,
    align: 'center',
    color: C.amber,
    bold: true,
  });
  _txt(ctx, 12, h - 12, 'El brillo es sublineal: ×10 de luz cuadruplica el brillo (10^0,4 ≈ 2,5).', {
    size: 10,
    color: C.muted,
  });

  const ivText = '×' + AB.espan(I, 0);
  const outText = 'I ×' + AB.espan(I, 0) + ' → brillo ×' + AB.espan(b, 2) + ' (n = 0,4)';
  if (out) {
    out('br_Iv', ivText);
    out('br_out', outText);
  } else {
    const iEl = document.getElementById('br_Iv');
    if (iEl) iEl.textContent = ivText;
    const oEl = document.getElementById('br_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 18 · CIE (ANIMADA) =====================
export function drawCIE(params: SimParams, flags: SimFlags, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-cie');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const lam = +params.ci_lam || 555;
  const [px, py] = cieXY(lam);
  const x0 = 34,
    x1 = w - 10,
    y0 = h - 24,
    top = 10;
  const X = (x: number) => x0 + ((x1 - x0) * x) / 0.85;
  const Y = (y: number) => y0 - ((y0 - top) * y) / 0.9;
  // diagrama de cromaticidad
  ctx.fillStyle = '#fdfbf4';
  ctx.beginPath();
  for (let i = 0; i < CIE_SPECTRAL.length; i++) {
    const q = CIE_SPECTRAL[i];
    const xx = X(q[1]),
      yy = Y(q[2]);
    if (i === 0) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // puntos de longitud de onda
  for (let i = 0; i < CIE_SPECTRAL.length; i += 2) {
    const q = CIE_SPECTRAL[i];
    _txt(ctx, X(q[1]), Y(q[2]) + 9, q[0] < 700 ? String(q[0]) : '', {
      size: 7,
      align: 'center',
      color: C.muted,
    });
  }
  // blanco (D65 aproximado)
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.arc(X(0.3127), Y(0.329), 3, 0, Math.PI * 2);
  ctx.fill();
  // marcador del color
  const [r, g, b] = lamRGB(lam);
  ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(X(px), Y(py), 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  _line(ctx, X(px), Y(py), X(px), Y(0.9), C.ink, 1, [2, 2]);
  _txt(ctx, X(px), Y(0.9) - 4, AB.espan(lam, 0) + ' nm', {
    size: 9,
    align: 'center',
    color: C.ink,
    bold: true,
  });
  _txt(ctx, x0 + 4, top + 1, 'Diagrama de cromaticidad CIE 1931 · blanco en el centro', {
    size: 9,
    bold: true,
    color: C.ink,
  });
  // parche de parpadeo (CFF)
  const fx0 = w - 70,
    fy0 = h - 52,
    fs = 34;
  const flick = flags.ciPlaying ? 0.5 + 0.5 * Math.sin((flags.ciT || 0) * 2 * Math.PI * 8) : 1;
  ctx.globalAlpha = flick;
  ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(fx0, fy0, fs, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;
  _txt(ctx, fx0, fy0 + fs + 8, 'CFF ≤ 60 Hz', { size: 8, align: 'center', color: C.muted });
  _txt(
    ctx,
    12,
    h - 12,
    'El parpadeo se funde por encima de ~60 Hz (fóvea) · ~20 Hz periferia · ~10 Hz con luz tenue.',
    { size: 10, color: C.muted }
  );

  const lamvText = AB.espan(lam, 0) + ' nm';
  const outText =
    AB.espan(lam, 0) +
    ' nm · x ≈ ' +
    AB.espan(px, 2) +
    ' · y ≈ ' +
    AB.espan(py, 2) +
    (flags.ciPlaying ? ' · parpadeando' : '');
  if (out) {
    out('ci_lamv', lamvText);
    out('ci_out', outText);
  } else {
    const lEl = document.getElementById('ci_lamv');
    if (lEl) lEl.textContent = lamvText;
    const oEl = document.getElementById('ci_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 19 · ADAPTACIÓN (ANIMADA) =====================
export function drawAdapt(flags: SimFlags, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-adapt');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const t = clamp(flags.adT || 0, 0, 30);
  const gC = 50 * (1 - Math.exp(-t / 2));
  const gR = t > 4 ? 1000 * (1 - Math.exp(-(t - 4) / 6)) : 0;
  const gain = 1 + gC + gR;
  const x0 = 48,
    x1 = w - 14,
    y0 = h - 26,
    top = 12;
  _axisX(ctx, x0, y0, x1, ['0', '5', '10', '15', '20', '25', '30 min']);
  _axisY(ctx, x0, top, y0, ['1', '10', '100', '1 000', '10 000×']);
  const fx = (tt: number) => x0 + ((x1 - x0) * tt) / 30;
  const fy = (g: number) => y0 - ((y0 - top - 8) * Math.log10(g)) / 4.6;
  const gainAt = (tt: number) => {
    const c = 50 * (1 - Math.exp(-tt / 2));
    const rr = tt > 4 ? 1000 * (1 - Math.exp(-(tt - 4) / 6)) : 0;
    return 1 + c + rr;
  };
  // segmento conos
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let tt = 0; tt <= 3; tt += 0.1) {
    const y = fy(gainAt(tt));
    if (tt === 0) ctx.moveTo(fx(tt), y);
    else ctx.lineTo(fx(tt), y);
  }
  ctx.stroke();
  // segmento bastones
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let tt = 3; tt <= 30; tt += 0.2) {
    const y = fy(gainAt(tt));
    if (tt === 3) ctx.moveTo(fx(tt), y);
    else ctx.lineTo(fx(tt), y);
  }
  ctx.stroke();
  _txt(ctx, x0 + 6, top + 1, 'ganancia de sensibilidad vs tiempo en la oscuridad', {
    size: 10,
    bold: true,
    color: C.ink,
  });
  _txt(ctx, fx(1), fy(gainAt(1)) + 14, 'conos τ≈2 min', { size: 9, color: C.teal, bold: true });
  _txt(ctx, fx(20), fy(gainAt(20)) + 14, 'bastones τ≈6 min', { size: 9, color: C.blood, bold: true });
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(fx(t), fy(gain), 5, 0, Math.PI * 2);
  ctx.fill();
  _line(ctx, fx(t), fy(gain), fx(t), y0, C.amber, 1.4, [3, 3]);
  _txt(ctx, fx(t), y0 + 11, AB.espan(t, 1) + ' min', { size: 9, align: 'center', color: C.amber, bold: true });
  _txt(ctx, 12, h - 12, 'Conos: ×50 en 5–10 min · bastones: ×1 000 en ~20 min · total ~30 min.', {
    size: 10,
    color: C.muted,
  });

  const outText =
    't = ' +
    AB.espan(t, 1) +
    ' min · sensibilidad ×' +
    AB.espan(gain, 0) +
    (flags.adPlaying ? ' · adaptando' : '');
  if (out) out('ad_out', outText);
  else {
    const el = document.getElementById('ad_out');
    if (el) el.textContent = outText;
  }
}

// ===================== SLIDE 20 · ENFERMEDADES =====================
export function drawDisease(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-disease');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const k = +params.en_sel || 0;
  const RX = w * 0.4,
    RY = Math.min(h * 0.32, RX * 0.58),
    cx = w * 0.5,
    cy = h * 0.5,
    fx = cx - RX;
  ctx.fillStyle = '#e7ddc9';
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, RX, RY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // retina (siempre)
  ctx.strokeStyle = C.muted;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(cx, cy, RX - 3, RY - 3, 0, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
  const backX = cx + RX - 3;
  // fóvea
  ctx.fillStyle = C.teal;
  ctx.beginPath();
  ctx.arc(backX, cy, 2.6, 0, Math.PI * 2);
  ctx.fill();
  const lx = fx + 52;
  if (k === 0) {
    // catarata: cristalino opaco
    ctx.fillStyle = 'rgba(154,91,0,0.55)';
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(lx, cy, 9, RY * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = 'rgba(154,91,0,0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx - 6 + i * 3, cy - RY * 0.4);
      ctx.lineTo(lx - 2 + i * 3, cy + RY * 0.4);
      ctx.stroke();
    }
    _txt(ctx, cx, cy - RY - 10, 'cristalino opaco → luz dispersada', {
      size: 10,
      align: 'center',
      color: C.amber,
      bold: true,
    });
  } else if (k === 1) {
    // degeneración macular
    ctx.fillStyle = 'rgba(179,53,42,0.30)';
    ctx.beginPath();
    ctx.arc(backX, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = C.blood;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(backX, cy, 15, 0, Math.PI * 2);
    ctx.stroke();
    _txt(ctx, backX, cy - 20, 'mácula ≈ 5 mm', { size: 10, align: 'center', color: C.blood, bold: true });
  } else if (k === 2) {
    // retinopatía diabética: vasos
    ctx.strokeStyle = C.blood;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(backX, cy);
    ctx.lineTo(backX - 34, cy - 16);
    ctx.lineTo(backX - 46, cy - 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(backX, cy);
    ctx.lineTo(backX - 34, cy + 16);
    ctx.lineTo(backX - 44, cy + 24);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(179,53,42,0.7)';
      ctx.beginPath();
      ctx.arc(backX - 28, cy - 12 + i * 12, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    _txt(ctx, cx, cy - RY - 10, 'neovascularizaciones que sangran', {
      size: 10,
      align: 'center',
      color: C.blood,
      bold: true,
    });
  } else if (k === 3) {
    // retinitis pigmentosa: periferia apagada
    ctx.fillStyle = 'rgba(90,30,24,0.30)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, RX - 3, RY - 3, 0, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.fill();
    ctx.fillStyle = C.teal;
    ctx.beginPath();
    ctx.arc(backX, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    _txt(ctx, cx, cy - RY - 10, 'bastones periféricos apagados · fóvea intacta', {
      size: 10,
      align: 'center',
      color: C.blood,
      bold: true,
    });
  } else {
    // desprendimiento: retina despegada abajo
    ctx.strokeStyle = C.blood;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, RX - 3, RY - 3, 0, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(backX - 6, cy + RY * 0.7);
    ctx.lineTo(backX + 6, cy + RY * 1.02);
    ctx.stroke();
    _txt(ctx, cx, cy + RY * 0.75, 'desprendimiento → líquido entre retina y coroides', {
      size: 10,
      align: 'center',
      color: C.blood,
      bold: true,
    });
  }
  const TXT = [
    'Catarata · cristalino opaco → luz dispersada',
    'Degeneración macular · mácula ≈ 5 mm · visión central',
    'Retinopatía diabética · neovascularización que sangra',
    'Retinitis pigmentosa · bastones periféricos primero',
    'Desprendimiento de retina · fotodetector sin nutrición',
  ];
  _txt(ctx, 12, h - 12, TXT[k], { size: 10, color: C.muted });
  if (out) out('en_out', TXT[k]);
  else {
    const el = document.getElementById('en_out');
    if (el) el.textContent = TXT[k];
  }
}

// ===================== SLIDE 21 · GLAUCOMA Y DAÑO POR LUZ =====================
export function drawGlaucoma(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-glaucoma');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const pio = +params.gd_pio || 15;
  const risk = Math.pow(40, (pio - 15) / 25);
  const x0 = 52,
    x1 = w - 14,
    y0 = h - 30,
    top = 12;
  _axisX(ctx, x0, y0, x1, ['10', '15', '20', '25', '30', '35', '40 mmHg']);
  _axisY(ctx, x0, top, y0, ['0', '10', '20', '30', '40×']);
  const fx = (p: number) => x0 + ((x1 - x0) * (p - 10)) / 30;
  const fy = (r: number) => y0 - ((y0 - top - 8) * r) / 45;
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let p = 10; p <= 40; p += 0.5) {
    const y = fy(Math.pow(40, (p - 15) / 25));
    if (p === 10) ctx.moveTo(fx(p), y);
    else ctx.lineTo(fx(p), y);
  }
  ctx.stroke();
  const mx = fx(pio),
    my = fy(risk);
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
  ctx.fill();
  _line(ctx, mx, my, mx, y0, C.amber, 1.3, [3, 3]);
  _txt(ctx, mx, Math.max(my - 10, top), AB.espan(pio, 0) + ' mmHg', {
    size: 9,
    align: 'center',
    color: C.amber,
    bold: true,
  });
  _txt(ctx, x0 + 6, top + 1, 'riesgo de glaucoma vs PIO (×40 a 40 mmHg)', {
    size: 10,
    bold: true,
    color: C.blood,
  });
  // bandas de daño espectral
  const y0b = h * 0.58,
    bx0 = w * 0.14,
    bx1 = w - 14;
  const lx = (nm: number) => bx0 + ((bx1 - bx0) * Math.log10(nm / 100)) / Math.log10(3000 / 100);
  _txt(ctx, bx0, y0b - 6, 'daño por la luz (longitud de onda)', { size: 10, bold: true, color: C.ink });
  const bands: [string, number, number, string, string, string][] = [
    ['UV 180–400', 180, 400, 'rgba(179,53,42,0.35)', C.blood, 'fotoqueratitis'],
    ['azul 400–500', 400, 500, 'rgba(217,119,6,0.35)', C.amber, 'fotoretinitis'],
    ['térmico 400–1400', 400, 1400, 'rgba(14,110,102,0.35)', C.teal, 'láser'],
    ['IR 800–3000', 800, 3000, 'rgba(93,79,168,0.35)', C.violet, 'quemadura'],
  ];
  for (const b of bands) {
    _rect(ctx, lx(b[1]), y0b, Math.max(6, lx(b[2]) - lx(b[1])), h * 0.14, b[3]);
    ctx.strokeStyle = b[4];
    ctx.lineWidth = 1.4;
    ctx.strokeRect(lx(b[1]), y0b, Math.max(6, lx(b[2]) - lx(b[1])), h * 0.14);
    _txt(ctx, (lx(b[1]) + lx(b[2])) / 2, y0b + h * 0.07, b[0], {
      size: 8,
      align: 'center',
      color: b[4],
      bold: true,
    });
  }
  _txt(ctx, bx0, y0b + h * 0.19, '180 nm ── 400 · 500 ── 1 400 ── 3 000 nm', { size: 8, color: C.muted });

  const piovText = AB.espan(pio, 0) + ' mmHg';
  const outText =
    'PIO ' + AB.espan(pio, 0) + ' mmHg · riesgo ×' + AB.espan(risk, 1) + (pio >= 25 ? ' · ¡elevado!' : '');
  if (out) {
    out('gd_piov', piovText);
    out('gd_out', outText);
  } else {
    const pEl = document.getElementById('gd_piov');
    if (pEl) pEl.textContent = piovText;
    const oEl = document.getElementById('gd_out');
    if (oEl) oEl.textContent = outText;
  }
}

// ===================== SLIDE 22 · OTROS ANIMALES =====================
export function drawAnimals(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-animals');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const k = +params.av_sel || 0;
  const NAMES = ['Humano', 'Gato (nocturno)', 'Pez (agua)', 'Ave buceadora', 'Anableps'];
  const cy = h * 0.5,
    RY = Math.min(h * 0.28, h * 0.28),
    cx = w * 0.46,
    rx = w * 0.72;
  const retX = w * 0.74;
  ctx.fillStyle = '#e7ddc9';
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse((cx + retX) / 2 + 0.02 * w, cy, (retX - cx) / 2, RY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // cristalino según especie
  const lensX = cx + 6;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  if (k === 2) {
    // pez: cristalino esférico grande
    ctx.fillStyle = 'rgba(120,160,190,0.6)';
    ctx.strokeStyle = C.teal;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(lensX, cy, RY * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (k === 3) {
    // ave buceadora: cristalino que se comprime (+70–80 D)
    ctx.fillStyle = 'rgba(120,160,190,0.6)';
    ctx.strokeStyle = C.teal;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(lensX, cy, 14, RY * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = C.blood;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(lensX, cy, RY * 0.78, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    _txt(ctx, lensX, cy - RY * 0.72, '+70–80 D', { size: 9, align: 'center', color: C.blood, bold: true });
  } else if (k === 4) {
    // anableps: ojo partido (dos mitades)
    ctx.strokeStyle = C.teal;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lensX - 10, cy - RY * 0.62);
    ctx.quadraticCurveTo(lensX + 2, cy, lensX - 10, cy + RY * 0.62);
    ctx.stroke();
    ctx.strokeStyle = C.blood;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lensX + 10, cy - RY * 0.62);
    ctx.quadraticCurveTo(lensX - 2, cy, lensX + 10, cy + RY * 0.62);
    ctx.stroke();
    _line(ctx, retX - 8, cy - RY * 0.6, retX - 8, cy + RY * 0.6, C.muted, 1, [3, 3]);
  } else {
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(lensX, cy - RY * 0.55);
    ctx.quadraticCurveTo(lensX - 9, cy, lensX, cy + RY * 0.55);
    ctx.moveTo(lensX, cy - RY * 0.55);
    ctx.quadraticCurveTo(lensX + 9, cy, lensX, cy + RY * 0.55);
    ctx.stroke();
  }
  // pupila (gato en hendidura)
  if (k === 1) {
    ctx.fillStyle = '#232c36';
    ctx.beginPath();
    ctx.ellipse(cx - RY * 0.06, cy, 2.5, RY * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // tapetum reflectante
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, (rx - cx) * 0.46, RY * 0.82, 0, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();
    _txt(ctx, cx, cy - RY - 8, 'tapetum lucidum (refleja la luz)', {
      size: 9,
      align: 'center',
      color: C.amber,
      bold: true,
    });
  } else {
    ctx.fillStyle = '#232c36';
    ctx.beginPath();
    ctx.ellipse(cx - RY * 0.06, cy, 3.4, RY * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // retina
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, (retX - cx) / 2, RY, 0, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
  const SUB = [
    'córnea 48 D + cristalino 22 D · diurno · color',
    'pupila en hendidura · tapetum · muchos bastones',
    'cristalino esférico (la córnea pierde poder en agua)',
    'acomodación +70–80 D comprimiendo el cristalino',
    'córnea partida: ve dentro y fuera del agua',
  ];
  _txt(ctx, 12, 14, NAMES[k], { size: 12, bold: true, color: C.teal });
  _txt(ctx, 12, h - 12, SUB[k], { size: 10, color: C.muted });

  const outText = NAMES[k] + ' · ' + SUB[k];
  if (out) out('av_out', outText);
  else {
    const el = document.getElementById('av_out');
    if (el) el.textContent = outText;
  }
}

// ===================== SLIDE 23 · MAPA =====================
export function drawMap(params: SimParams, out?: (id: string, text: string) => void) {
  const res = getCanvasAndContext('sim-map');
  if (!res) return;
  const { ctx, w, h } = res;
  _bg(ctx, w, h);
  const k = +params.mp_sel || 0;
  const N = [
    '1 · Recibir',
    '2 · Refractar',
    '3 · Enfocar',
    '4 · Resolver',
    '5 · Corregir',
    '6 · Percibir',
    '7 · Cuidar',
  ];
  const SUB = [
    'córnea + retina',
    'Snell · superficies',
    'potencias · acomodación',
    'difracción · Snellen',
    'miopía · astigmatismo',
    'brillo · color · CIE',
    'glaucoma · daño por luz',
  ];
  const bw = Math.min(150, w / 4 - 8),
    bh = 52;
  const pos = [
    [16, 44],
    [16 + bw + 18, 44],
    [16 + 2 * (bw + 18), 44],
    [16 + 3 * (bw + 18), 44],
    [36, 130],
    [w / 2 - bw / 2, 130],
    [w - 36 - bw, 130],
  ];
  for (let i = 0; i < 7; i++) {
    const x = pos[i][0],
      y = pos[i][1];
    const col = i === k ? C.amber : C.teal;
    _rect(ctx, x, y, bw, bh, col, 8);
    _txt(ctx, x + bw / 2, y + 18, N[i], { size: 12, bold: true, align: 'center', color: '#fff' });
    _txt(ctx, x + bw / 2, y + 37, SUB[i], { size: 8.5, align: 'center', color: '#f8f4e9' });
    if (i < 3) {
      const nx = pos[i + 1][0];
      ctx.strokeStyle = C.muted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + bw, y + bh / 2);
      ctx.lineTo(nx, pos[i + 1][1] + bh / 2);
      ctx.stroke();
      ctx.fillStyle = C.muted;
      ctx.beginPath();
      ctx.moveTo(nx, pos[i + 1][1] + bh / 2 - 4);
      ctx.lineTo(nx, pos[i + 1][1] + bh / 2 + 4);
      ctx.lineTo(nx + 8, pos[i + 1][1] + bh / 2);
      ctx.fill();
    }
    if (i === 3) {
      ctx.strokeStyle = C.muted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + bw / 2, y + bh);
      ctx.lineTo(pos[4][0] + bw / 2, pos[4][1]);
      ctx.stroke();
      ctx.fillStyle = C.muted;
      ctx.beginPath();
      ctx.moveTo(pos[4][0] + bw / 2 - 4, pos[4][1]);
      ctx.lineTo(pos[4][0] + bw / 2 + 4, pos[4][1]);
      ctx.lineTo(pos[4][0] + bw / 2, pos[4][1] - 8);
      ctx.fill();
    }
    if (i === 5) {
      ctx.strokeStyle = C.muted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + bw, y + bh / 2);
      ctx.lineTo(pos[6][0], pos[6][1] + bh / 2);
      ctx.stroke();
      ctx.fillStyle = C.muted;
      ctx.beginPath();
      ctx.moveTo(pos[6][0], pos[6][1] + bh / 2 - 4);
      ctx.lineTo(pos[6][0], pos[6][1] + bh / 2 + 4);
      ctx.lineTo(pos[6][0] + 8, pos[6][1] + bh / 2);
      ctx.fill();
    }
  }
  _txt(ctx, w / 2, 124, 'fotón → Snell → potencia → agudeza → color → clínica', {
    size: 10,
    align: 'center',
    color: C.muted,
  });
  _txt(ctx, 12, h - 12, 'Mismo mapa mental para resolver problemas del capítulo.', {
    size: 10,
    color: C.muted,
  });

  const outText = 'Etapa ' + (k + 1) + ' · ' + N[k];
  if (out) out('mp_out', outText);
  else {
    const el = document.getElementById('mp_out');
    if (el) el.textContent = outText;
  }
}

// ===================== REDRAW SLIDE =====================
export function redrawSlide(
  n: number,
  _t: number,
  params: SimParams,
  flags: SimFlags,
  out?: (id: string, text: string) => void
) {
  switch (n) {
    case 1:
      drawEye(params, out);
      break;
    case 2:
      drawRetina(params, out);
      break;
    case 3:
      drawPhoton(params, out);
      break;
    case 4:
      drawLens(params, out);
      break;
    case 5:
      drawSnell(params, out);
      break;
    case 6:
      drawInterface(params, out);
      break;
    case 7:
      drawMaker(params, out);
      break;
    case 8:
      drawEffect(params, out);
      break;
    case 9:
      drawSchematic(params, out);
      break;
    case 10:
      drawReduced(params, out);
      break;
    case 11:
      drawAccom(params, flags, out);
      break;
    case 12:
      drawDiffraction(params, out);
      break;
    case 13:
      drawAberr(params, out);
      break;
    case 14:
      drawSnellen(params, out);
      break;
    case 15:
      drawAmp(params, out);
      break;
    case 16:
      drawToric(params, out);
      break;
    case 17:
      drawBright(params, out);
      break;
    case 18:
      drawCIE(params, flags, out);
      break;
    case 19:
      drawAdapt(flags, out);
      break;
    case 20:
      drawDisease(params, out);
      break;
    case 21:
      drawGlaucoma(params, out);
      break;
    case 22:
      drawAnimals(params, out);
      break;
    case 23:
      drawMap(params, out);
      break;
    default:
      break;
  }
}
