/**
 * Simulaciones Físicas y Funciones de Dibujo 2D para el Capítulo 13
 * Sistemas de Retroalimentación y Control — Irving P. Herman (2016)
 */

import { AB } from './ab';

export const TOTAL = 24;

export interface ModuleInfo {
  id: number;
  name: string;
  slides: number[];
  ico: string;
}

export const MODULES: ModuleInfo[] = [
  { id: 0, name: 'Inicio', slides: [0], ico: '🏠' },
  { id: 1, name: 'Control y retroalimentación', slides: [1, 2, 3], ico: '🔁' },
  { id: 2, name: 'Regulación térmica', slides: [4, 5], ico: '🌡️' },
  { id: 3, name: 'Temperatura en reposo', slides: [6, 7, 8], ico: '🩺' },
  { id: 4, name: 'Sudoración y bucle cerrado', slides: [9, 10, 11, 12], ico: '💧' },
  { id: 5, name: 'Presión arterial', slides: [13, 14], ico: '❤️' },
  { id: 6, name: 'Ejercicio', slides: [15, 16], ico: '🏃' },
  { id: 7, name: 'La pupila', slides: [17, 18, 19], ico: '👁️' },
  { id: 8, name: 'Modelos y problemas', slides: [20, 21, 22], ico: '🧮' },
  { id: 9, name: 'Resumen', slides: [23], ico: '🧾' },
];

export interface SimParams {
  bi_sel: number;
  fb_sel: number;
  fb_dp: number;
  th_v: number;
  th_set: number;
  ptr_g: number;
  ptr_td: number;
  reg_g: number;
  reg_td: number;
  bq_f: number;
  bq_l: number;
  bq_c: number;
  oa_f: number;
  oa_th: number;
  cc_k: number;
  sw_t: number;
  sw_k: number;
  br_p: number;
  br_pt: number;
  ga_d: number;
  ga_g: number;
  ex_i: number;
  cv_i: number;
  pu_i: number;
  pu_t: number;
  ax_n: number;
  ax_th: number;
  po_i: number;
  po_t: number;
  pb_r: number;
  pb_b: number;
  pr_sel: number;
  map_sel: number;
}

export const DEFAULT_PARAMS: SimParams = {
  bi_sel: 0,
  fb_sel: 0,
  fb_dp: 3,
  th_v: 37,
  th_set: 37,
  ptr_g: 1.5,
  ptr_td: 1.0,
  reg_g: 1.5,
  reg_td: 1.0,
  bq_f: 1,
  bq_l: 25,
  bq_c: 0,
  oa_f: 1,
  oa_th: 21,
  cc_k: 750,
  sw_t: 38.0,
  sw_k: 750,
  br_p: 100,
  br_pt: 80,
  ga_d: 20,
  ga_g: 4.0,
  ex_i: 50,
  cv_i: 50,
  pu_i: 200,
  pu_t: 280,
  ax_n: 3.0,
  ax_th: 1.0,
  po_i: 400,
  po_t: 280,
  pb_r: 2.0,
  pb_b: 0.5,
  pr_sel: 0,
  map_sel: 0,
};

export interface SimFlags {
  blkStep: number;
  cc2Hot: boolean;
  ptrPlaying: boolean;
  oaPlaying: boolean;
  crPlaying: boolean;
  poPlaying: boolean;
  prPlaying: boolean;
  ptrT: number;
  oaT: number;
  crT: number;
  poT: number;
  prT: number;
}

export const DEFAULT_FLAGS: SimFlags = {
  blkStep: 0,
  cc2Hot: true,
  ptrPlaying: false,
  oaPlaying: false,
  crPlaying: false,
  poPlaying: false,
  prPlaying: false,
  ptrT: 0,
  oaT: 0,
  crT: 0,
  poT: 0,
  prT: 0,
};

// Paleta y constantes
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
  grid: '#dfd8c8',
};

export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

function _bg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, w, h);
}

interface TextOpt {
  color?: string;
  size?: number;
  bold?: boolean;
  w?: string;
  align?: CanvasTextAlign;
  base?: CanvasTextBaseline;
}

function _txt(ctx: CanvasRenderingContext2D, x: number, y: number, s: string, o?: TextOpt) {
  const a = o || {};
  ctx.fillStyle = a.color || C.ink;
  ctx.font = (a.bold ? '700 ' : a.w || '500 ') + (a.size || 12) + 'px Karla, Arial, sans-serif';
  ctx.textAlign = a.align || 'left';
  ctx.textBaseline = a.base || 'middle';
  ctx.fillText(s, x, y);
}

function _rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, rx?: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (rx && ctx.roundRect) {
    ctx.roundRect(x, y, w, h, rx);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
}

function _line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, lw?: number, dash?: number[]) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw || 1;
  ctx.setLineDash(dash || []);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function _axisX(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, labels: string[]) {
  const n = labels.length;
  _line(ctx, x0, y0, x1, y0, C.line, 1);
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1);
    _line(ctx, x, y0, x, y0 + 4, C.line, 1);
    _txt(ctx, x, y0 + 12, labels[i], { size: 9, align: 'center', color: C.muted });
  }
}

function _axisY(ctx: CanvasRenderingContext2D, x0: number, y0: number, y1: number, labels: string[]) {
  const n = labels.length;
  _line(ctx, x0, y0, x0, y1, C.line, 1);
  for (let i = 0; i < n; i++) {
    const y = y1 - ((y1 - y0) * i) / (n - 1);
    _line(ctx, x0 - 6, y, x0, y, C.line, 1);
    _txt(ctx, x0 - 8, y, labels[i], { size: 9, align: 'right', color: C.muted });
  }
}

type OutFn = (id: string, text: string) => void;

function safeOut(out: OutFn | undefined, id: string, text: string) {
  if (out) {
    out(id, text);
  } else {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

/* ═══════════════════════════════════════════════════════════════
   FUNCIONES DE DIBUJO POR SLIDE (Capítulo 13)
   ═══════════════════════════════════════════════════════════════ */

/* ---- SLIDE 1 · Homeostasis: Líquido Extracelular y 8 Variables ---- */
export function drawHo(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = (document.getElementById('sim-ho') || document.getElementById('sim-bi')) as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  // Compartimentos LEC (1/3) vs LIC (2/3)
  const padX = 24;
  const topY = 28;
  const barH = 36;
  const usableW = w - padX * 2;
  const lecW = usableW * 0.333;
  const licW = usableW * 0.667;

  _rect(ctx, padX, topY, lecW - 3, barH, C.teal, 6);
  _rect(ctx, padX + lecW + 3, topY, licW - 3, barH, '#3f566a', 6);
  _txt(ctx, padX + (lecW - 3) / 2, topY + barH / 2 - 2, 'LEC ≈ 1/3 (14 L)', { size: 11, align: 'center', bold: true, color: '#fbf8f0' });
  _txt(ctx, padX + (lecW - 3) / 2, topY + barH / 2 + 10, 'Plasma + Intersticial', { size: 8, align: 'center', color: '#c8e2de' });
  _txt(ctx, padX + lecW + 3 + (licW - 3) / 2, topY + barH / 2, 'Líquido Intracelular (LIC) ≈ 2/3 (28 L)', { size: 11, align: 'center', bold: true, color: '#fbf8f0' });

  // Cuadrícula de las 8 variables homeostáticas controladas
  const vars = [
    { name: 'Temperatura', val: '37,0 °C', range: '36,5–37,5 °C', icon: '🌡️' },
    { name: 'Presión Arterial', val: '120/80', range: '90–140 mmHg', icon: '❤️' },
    { name: 'Gases (pO₂/pCO₂)', val: '95 / 40', range: 'mmHg arterial', icon: '🫁' },
    { name: 'pH sanguíneo', val: '7,40', range: '7,35–7,45', icon: '🧪' },
    { name: 'Electrolitos (Na⁺/K⁺)', val: '140 / 4,2', range: 'mEq/L', icon: '⚡' },
    { name: 'Volumen extracel.', val: '100%', range: '±5% volemia', icon: '💧' },
    { name: 'Osmolalidad', val: '290', range: '280–295 mOsm', icon: '🫧' },
    { name: 'Glucosa en ayuno', val: '90 mg/dL', range: '70–100 mg/dL', icon: '🩸' },
  ];

  const gridTop = topY + barH + 16;
  const cols = 2;
  const rows = 4;
  const cellW = (usableW - 12) / cols;
  const cellH = Math.max(22, (h - gridTop - 24) / rows);

  vars.forEach((v, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const cx = padX + c * (cellW + 12);
    const cy = gridTop + r * cellH;

    _rect(ctx, cx, cy, cellW, cellH - 4, '#f0e8d5', 4);
    _rect(ctx, cx + 2, cy + 2, 4, cellH - 8, C.teal, 2);
    _txt(ctx, cx + 12, cy + (cellH - 4) / 2, `${v.icon} ${v.name}:`, { size: 10, align: 'left', bold: true, color: C.ink });
    _txt(ctx, cx + cellW - 8, cy + (cellH - 4) / 2, `${v.val}`, { size: 10, align: 'right', bold: true, color: C.tealD });
  });

  _txt(ctx, w / 2, h - 8, '8 variables clave del LEC reguladas por retroalimentación continua', { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'ho_out', '8 variables en rango fisiológico');
}

/* Fallback drawBio */
export function drawBio(params: SimParams, flags: SimFlags, out?: OutFn) {
  drawHo(params, flags, out);
}

/* ---- SLIDE 2 · Diagrama de bloques (5 eslabones) ---- */
export function drawBl(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-bl') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.32;
  const nodes = ['① Sensor', '② Cerebro', '③ Efector', '④ Respuesta', '⑤ Feed-back'];
  const cols = [C.teal, C.violet, C.amber, C.blood, C.teal];
  const blk = flags.blkStep;

  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const x = cx + R * Math.cos(a);
    const y = cy + R * Math.sin(a);
    const on = i === blk;

    ctx.beginPath();
    ctx.arc(x, y, on ? 22 : 17, 0, Math.PI * 2);
    ctx.fillStyle = on ? cols[i] : '#efe3c8';
    ctx.fill();
    ctx.lineWidth = on ? 3 : 1.5;
    ctx.strokeStyle = cols[i];
    ctx.stroke();

    _txt(ctx, x, y + 1, (i + 1) + '', { size: 13, align: 'center', bold: true, color: on ? '#ffffff' : cols[i] });
    _txt(ctx, x, y - (on ? 28 : 24), nodes[i], { size: 10, align: 'center', bold: on, color: on ? cols[i] : C.muted });

    if (i < 5) {
      const a2 = -Math.PI / 2 + (i + 0.5) * (2 * Math.PI / 5);
      _txt(ctx, cx + R * 0.5 * Math.cos(a2), cy + R * 0.5 * Math.sin(a2), '→', { size: 14, align: 'center', color: C.muted });
    }
  }
  _txt(ctx, w / 2, h - 8, 'haz clic en un eslabón (lazo de control) · ⑤ retroalimentación', { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'bl_out', `${nodes[blk]} · resaltado`);
}

/* ---- SLIDE 3 · Retroalimentación negativa vs positiva ---- */
export function drawFb(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-fb') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const pos = Number(params.fb_sel) === 1;
  const dp = Number(params.fb_dp) || 0;
  const x0 = 50;
  const y0 = h - 34;
  const y1 = 22;
  const x1 = w - 20;

  _axisY(ctx, x0, y1, y0, ['P₀−6', 'P₀−3', 'P₀', 'P₀+3', 'P₀+6']);
  _line(ctx, x0, y0, x1, y0, C.line, 1);

  const P0 = (y0 + y1) / 2;
  _line(ctx, x0, P0, x1, P0, C.amber, 1.5, [4, 4]);
  _txt(ctx, x1 - 4, P0 - 8, 'P₀ (consigna)', { size: 9, align: 'right', color: C.amber });

  let y = P0 - (dp * (y0 - y1)) / 12;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  const steps = 50;
  for (let i = 1; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    if (pos) {
      y = y - (P0 - y) * 0.16;
    } else {
      y = y + (P0 - y) * 0.22;
    }
    y = Math.max(y1, Math.min(y0, y));
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = pos ? C.blood : C.teal;
  ctx.lineWidth = 2.8;
  ctx.stroke();

  _txt(ctx, x1 - 6, y1 + 12, pos ? 'DIVERGE (positiva)' : 'REGRESA a P₀ (negativa)', {
    size: 10,
    align: 'right',
    bold: true,
    color: pos ? C.blood : C.teal,
  });
  _txt(ctx, w / 2, h - 6, 'P(t) vs tiempo · termostato fisiológico vs bucle patológico', { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'fb_out', (pos ? 'positiva' : 'negativa') + ' · ' + (pos ? 'diverge' : 'regresa a P₀'));
}

/* ---- SLIDE 4 · Estabilidad térmica del cuerpo ---- */
export function drawTherm(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-th') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const curT = Number(params.th_v ?? params.th_set ?? 37);
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 24;
  const Tmin = 24;
  const Tmax = 48;

  const yT = (T: number) => y0 - ((T - Tmin) / (Tmax - Tmin)) * (y0 - y1);

  // Ejes y zonas térmicas
  for (let T = 26; T <= 46; T += 4) {
    const y = yT(T);
    _line(ctx, x0, y, x1, y, C.grid, 1);
    _txt(ctx, x0 - 8, y, `${T} °C`, { size: 9, align: 'right', color: C.muted });
  }

  // Zona segura: 35–39 °C
  ctx.fillStyle = 'rgba(13, 110, 100, 0.12)';
  ctx.fillRect(x0, yT(39), x1 - x0, yT(35) - yT(39));
  _txt(ctx, x1 - 6, yT(37) - 10, 'zona normal: 37 ± 2 °C', { size: 9, align: 'right', bold: true, color: C.teal });

  // Zonas de peligro
  _rect(ctx, x0, yT(48), x1 - x0, yT(45) - yT(48), 'rgba(169, 42, 30, 0.18)');
  _txt(ctx, x0 + 8, yT(46.5), '≥ 45 °C muerte celular (desnaturalización)', { size: 8.5, align: 'left', bold: true, color: C.blood });

  _rect(ctx, x0, yT(28), x1 - x0, yT(24) - yT(28), 'rgba(93, 79, 168, 0.18)');
  _txt(ctx, x0 + 8, yT(26), '≤ 28 °C fibrilación ventricular', { size: 8.5, align: 'left', bold: true, color: C.violet });

  // Marcador interactivo de temperatura
  const yMarker = yT(curT);
  _line(ctx, x0, yMarker, x1, yMarker, C.amber, 2, [5, 4]);
  ctx.beginPath();
  ctx.arc(x0 + (x1 - x0) * 0.5, yMarker, 5, 0, Math.PI * 2);
  ctx.fillStyle = curT > 41 || curT < 30 ? C.blood : curT > 39 || curT < 35 ? C.amber : C.teal;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  let desc = 'normal';
  if (curT >= 45) desc = 'muerte (desnaturalización)';
  else if (curT >= 41) desc = 'convulsiones (SNC)';
  else if (curT > 39) desc = 'fiebre / hipertermia';
  else if (curT < 28) desc = 'muerte (fibrilación)';
  else if (curT < 30) desc = 'falla el control térmico';
  else if (curT < 33) desc = 'pérdida de conocimiento';
  else if (curT < 35) desc = 'hipotermia leve';

  _txt(ctx, w / 2, h - 8, `T = ${curT.toFixed(1)} °C · ${desc}`, { size: 9.5, align: 'center', bold: true, color: C.ink });
  safeOut(out, 'th_out', `${curT.toFixed(1)} °C · ${desc}`);
}

/* ---- SLIDE 5 · Criterio de estabilidad g·τd ---- */
export function drawEc(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-ec') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const x0 = 48;
  const y0 = h - 34;
  const y1 = 18;
  const x1 = w - 20;
  const gmax = 6;
  const tdmax = 3;
  const xG = (g: number) => x0 + ((x1 - x0) * g) / gmax;
  const yT = (td: number) => y0 - ((y0 - y1) * td) / tdmax;

  // Región estable (bajo la curva g = π / (2·τd))
  ctx.fillStyle = 'rgba(13, 110, 100, 0.12)';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  for (let i = 1; i <= 80; i++) {
    const td = (tdmax * i) / 80;
    const g = Math.min(gmax, Math.PI / (2 * td));
    ctx.lineTo(xG(g), yT(td));
  }
  ctx.lineTo(x0, y0);
  ctx.fill();

  // Curva límite g·τd = π/2
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 1; i <= 80; i++) {
    const td = (tdmax * i) / 80;
    const g = Math.min(gmax, Math.PI / (2 * td));
    const x = xG(g);
    const y = yT(td);
    if (i === 1) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  _line(ctx, x0, y1, x0, y0, C.line, 1);
  _line(ctx, x0, y0, x1, y0, C.line, 1);
  _txt(ctx, x1 - 4, y0 - 6, 'g (ganancia)', { size: 9.5, align: 'right', color: C.muted });
  _txt(ctx, x0 + 6, y1 + 10, 'τd (retardo)', { size: 9.5, align: 'left', color: C.muted });
  _txt(ctx, x0 + (x1 - x0) * 0.3, y0 - (y0 - y1) * 0.35, 'REGIÓN ESTABLE\n(g·τd < π/2)', { size: 10, align: 'center', bold: true, color: C.tealD });
  _txt(ctx, x0 + (x1 - x0) * 0.7, y0 - (y0 - y1) * 0.7, 'INESTABLE\n(diverge)', { size: 10, align: 'center', bold: true, color: C.blood });

  _txt(ctx, w / 2, h - 6, 'criterio fundamental: g·τd ≤ π/2 ≈ 1,5708', { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'ec_out', 'g·τd = π/2 · límite de estabilidad');
}

/* ---- SLIDE 6 · p(t) con retardo (animada) ---- */
export function drawPtr(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-ptr') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const g = Number(params.ptr_g) || 1.5;
  const td = Number(params.ptr_td) || 1.0;
  const t = flags.ptrT;
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 18;
  const x1 = w - 20;
  const yC = (y0 + y1) / 2;

  _line(ctx, x0, yC, x1, yC, C.amber, 1.5, [5, 4]);
  _txt(ctx, x1 - 4, yC - 6, 'P₀ (consigna)', { size: 9, align: 'right', color: C.amber });

  const N = 100;
  const prod = g * td;
  const stable = prod < Math.PI / 2;

  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const tau = t + (i / N) * 6;
    let pVal = 0;
    if (prod < 1.4) {
      // Amortiguada
      pVal = Math.exp(-0.6 * tau) * Math.cos(1.2 * tau);
    } else if (prod <= 1.65) {
      // Oscilación límite
      pVal = Math.cos(1.5 * tau);
    } else {
      // Divergente
      pVal = Math.exp(0.45 * Math.min(tau, 5)) * Math.sin(1.8 * tau) * 0.4;
    }
    const x = x0 + ((x1 - x0) * i) / N;
    const y = yC - pVal * (y0 - y1) * 0.38;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = prod <= 1.57 ? C.teal : C.blood;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  _txt(ctx, w / 2, h - 6, `p(t) con retardo · g=${g.toFixed(1)}  τd=${td.toFixed(1)}s · g·τd=${prod.toFixed(2)} (${stable ? 'estable' : 'inestable'})`, {
    size: 9,
    align: 'center',
    color: C.muted,
  });
  safeOut(out, 'ptr_out', `g·τd = ${prod.toFixed(2)} · ${stable ? 'estable' : 'inestable'}`);
}

/* ---- SLIDE 7 · Mapa de estabilidad (g, τd) interactivo ---- */
export function drawReg(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-reg') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const g = Number(params.reg_g) || 1.5;
  const td = Number(params.reg_td) || 1.0;
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 18;
  const x1 = w - 20;
  const gmax = 6;
  const tdmax = 3;
  const xG = (gg: number) => x0 + ((x1 - x0) * gg) / gmax;
  const yT = (tt: number) => y0 - ((y0 - y1) * tt) / tdmax;

  ctx.fillStyle = 'rgba(13, 110, 100, 0.12)';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  for (let i = 1; i <= 60; i++) {
    const tt = (tdmax * i) / 60;
    const gg = Math.min(gmax, Math.PI / (2 * tt));
    ctx.lineTo(xG(gg), yT(tt));
  }
  ctx.lineTo(x0, y0);
  ctx.fill();

  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 1; i <= 60; i++) {
    const tt = (tdmax * i) / 60;
    const gg = Math.min(gmax, Math.PI / (2 * tt));
    const x = xG(gg);
    const y = yT(tt);
    if (i === 1) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  _line(ctx, x0, y1, x0, y0, C.line, 1);
  _line(ctx, x0, y0, x1, y0, C.line, 1);

  // Punto interactivo de prueba
  const prod = g * td;
  const stable = prod < Math.PI / 2;
  const px = xG(g);
  const py = yT(td);

  ctx.beginPath();
  ctx.arc(px, py, 7, 0, Math.PI * 2);
  ctx.fillStyle = stable ? C.teal : C.blood;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  _txt(ctx, w / 2, h - 6, `Punto (${g.toFixed(1)}, ${td.toFixed(1)}s) → g·τd = ${prod.toFixed(2)} · ${stable ? 'ESTABLE (verde)' : 'INESTABLE (rojo)'}`, {
    size: 9,
    align: 'center',
    color: C.muted,
  });
  safeOut(out, 'reg_out', `${stable ? 'estable' : 'inestable'} · g·τd = ${prod.toFixed(2)}`);
}

/* ---- SLIDE 8 · Balance de calor (barras) ---- */
export function drawBq(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-bq') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const f = Number(params.bq_f) || 1;
  const loss = Number(params.bq_l) || 25;
  const ctrl = Number(params.bq_c) || 0;
  const meta = f * 70;
  const neto = meta - loss + ctrl;

  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;

  const bars: [string, number, string][] = [
    ['Metabolismo', meta, C.blood],
    ['Pérdida pasiva', -loss, C.blue],
    ['Control cuerpo', ctrl, ctrl >= 0 ? C.amber : C.teal],
    ['NETO (dQ/dt)', neto, neto >= 0 ? C.blood : C.teal],
  ];

  const maxVal = Math.max(200, meta + 100, Math.abs(ctrl) + 50);
  const bw = (x1 - x0 - 40) / bars.length;
  const midY = (y0 + y1) / 2;

  _line(ctx, x0, midY, x1, midY, C.line, 1);

  bars.forEach((b, i) => {
    const x = x0 + 15 + i * (bw + 8);
    const val = b[1];
    const bh = (Math.abs(val) / maxVal) * (midY - y1);
    const yTop = val >= 0 ? midY - bh : midY;

    _rect(ctx, x, yTop, bw - 4, bh, b[2], 3);
    _txt(ctx, x + (bw - 4) / 2, y0 + 12, `${val.toFixed(0)}`, { size: 9.5, align: 'center', bold: true, color: b[2] });
    _txt(ctx, x + (bw - 4) / 2, val >= 0 ? yTop - 8 : yTop + bh + 8, b[0], { size: 8.5, align: 'center', bold: true, color: C.ink });
  });

  _txt(ctx, w / 2, h - 6, `dQ/dt neto = ${neto.toFixed(0)} kcal/h · dT/dt = ${(neto / 60).toFixed(2)} °C/h`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'bq_out', `neto = ${neto.toFixed(0)} kcal/h`);
}

/* ---- SLIDE 9 · Bucle abierto T(t) (animada) ---- */
export function drawOa(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-oa') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const f = Number(params.oa_f) || 1;
  const Thab = Number(params.oa_th) || 21;
  const t = flags.oaT;
  const Cth = 2.4;
  const Tss = Thab + 2.8 * f;
  const T0 = 37;

  const x0 = 48;
  const y0 = h - 34;
  const y1 = 18;
  const x1 = w - 20;
  const Tmin = 15;
  const Tmax = 55;
  const yT = (T: number) => y0 - ((T - Tmin) / (Tmax - Tmin)) * (y0 - y1);

  // Línea consigna 37 °C
  _line(ctx, x0, yT(37), x1, yT(37), C.teal, 1, [4, 4]);
  _txt(ctx, x1 - 4, yT(37) - 6, 'ideal: 37 °C', { size: 8.5, align: 'right', color: C.teal });

  // Curva T(t) abierta
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const tt = t + (i / 80) * 8;
    const T = Tss + (T0 - Tss) * Math.exp(-tt / Cth);
    const x = x0 + ((x1 - x0) * i) / 80;
    const y = yT(T);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Línea asíntota T_ss
  _line(ctx, x0, yT(Tss), x1, yT(Tss), C.amber, 1.5, [5, 4]);
  _txt(ctx, x1 - 4, yT(Tss) - 6, `T_ss ≈ ${Tss.toFixed(1)} °C`, { size: 9, align: 'right', bold: true, color: C.amber });

  _txt(ctx, w / 2, h - 6, `Bucle abierto (sin sudor) · τr = 2,4 h · f=${f} → estabiliza en ${Tss.toFixed(1)} °C`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'oa_out', `f=${f} · T_ss ≈ ${Tss.toFixed(1)} °C`);
}

/* ---- SLIDE 10 · τr abierto vs cerrado ---- */
export function drawCc(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-cc') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const K = Number(params.cc_k) || 750;
  const Cth = 60;
  const lam = 25;
  const trOpen = Cth / lam; // 2.4 h = 144 min
  const trClose = (Cth / (lam + K)) * 60; // en min

  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;
  const Tmin = 20;
  const Tmax = 40;
  const yT = (T: number) => y0 - ((T - Tmin) / (Tmax - Tmin)) * (y0 - y1);

  // Abierto (rojo lento)
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const tMin = (i / 60) * 120; // 0 a 120 min
    const T = 21 + (37 - 21) * (1 - Math.exp(-tMin / (trOpen * 60)));
    const x = x0 + ((x1 - x0) * i) / 60;
    const y = yT(T);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Cerrado (teal rápido)
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const tMin = (i / 60) * 120;
    const T = 21 + (37 - 21) * (1 - Math.exp(-tMin / trClose));
    const x = x0 + ((x1 - x0) * i) / 60;
    const y = yT(T);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.8;
  ctx.stroke();

  _line(ctx, x0, yT(37), x1, yT(37), C.amber, 1, [4, 4]);

  _txt(ctx, x1 - 6, yT(28), `Abierto: τr = ${trOpen.toFixed(1)} h`, { size: 9, align: 'right', color: C.blood, bold: true });
  _txt(ctx, x1 - 6, yT(36), `Cerrado: τr ≈ ${trClose.toFixed(1)} min`, { size: 9, align: 'right', color: C.teal, bold: true });

  _txt(ctx, w / 2, h - 6, `La sudoración (K=${K}) acelera la respuesta térmica un factor ~${(trOpen * 60 / trClose).toFixed(0)}×`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'cc_out', `τr: ${trOpen.toFixed(1)} h → ${trClose.toFixed(1)} min`);
}

/* ---- SLIDE 11 · Pérdida por sudoración vs T ---- */
export function drawSw(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-sw') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const T = Number(params.sw_t) || 38.0;
  const K = Number(params.sw_k) || 750;
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;
  const Tmin = 34;
  const Tmax = 42;
  const maxSw = 2500;

  // Recta de sudoración
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const tt = Tmin + ((Tmax - Tmin) * i) / 80;
    const sw = tt > 36.85 ? K * (tt - 36.85) : 0;
    const x = x0 + ((x1 - x0) * i) / 80;
    const y = y0 - (sw / maxSw) * (y0 - y1);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  _line(ctx, x0, y0, x1, y0, C.line, 1);
  _axisX(ctx, x0, y0, x1, ['34 °C', '36 °C', '36,85 °C', '38 °C', '40 °C', '42 °C']);

  // Marcador interactivo
  const swVal = T > 36.85 ? K * (T - 36.85) : 0;
  const xT = x0 + ((x1 - x0) * (T - Tmin)) / (Tmax - Tmin);
  const yMarker = y0 - (swVal / maxSw) * (y0 - y1);

  _line(ctx, xT, y1, xT, y0, C.ink, 1, [3, 3]);
  ctx.beginPath();
  ctx.arc(xT, yMarker, 5, 0, Math.PI * 2);
  ctx.fillStyle = C.blood;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  _txt(ctx, w / 2, h - 6, `T = ${T.toFixed(1)} °C  →  Pérdida por sudor = ${swVal.toFixed(0)} kcal/h (K=${K})`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'sw_out', `T ${T.toFixed(1)} °C · pérdida ${swVal.toFixed(0)} kcal/h`);
}

/* ---- SLIDE 12 · Comparativa τr (animada) ---- */
export function drawCr(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-cr') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const t = flags.crT;
  const trO = 2.4; // h
  const trC = 4.7 / 60; // h
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;
  const Tmin = 20;
  const Tmax = 40;
  const yT = (T: number) => y0 - ((T - Tmin) / (Tmax - Tmin)) * (y0 - y1);

  // Abierto vs Cerrado animadas
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const tt = Math.max(0, t) + (i / 80) * 5;
    const T = 21 + (37 - 21) * (1 - Math.exp(-tt / trO));
    const x = x0 + ((x1 - x0) * i) / 80;
    const y = yT(T);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const tt = Math.max(0, t) + (i / 80) * 5;
    const T = 21 + (37 - 21) * (1 - Math.exp(-tt / trC));
    const x = x0 + ((x1 - x0) * i) / 80;
    const y = yT(T);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  _line(ctx, x0, yT(37), x1, yT(37), C.amber, 1, [4, 4]);

  _txt(ctx, w / 2, h - 6, 'τr: 2,4 h (abierto, rojo) vs 4,7 min (cerrado, verde) · factor ~31×', { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'cr_out', 'abierto vs cerrado · factor 31×');
}

/* ---- SLIDE 13 · Barorreceptor ---- */
export function drawBr(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-br') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const pb = Number(params.br_p) || 100;
  const pt = Number(params.br_pt) || 80;
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;
  const Pmin = 40;
  const Pmax = 200;
  const yP = (PP: number) => y0 - ((PP - Pmin) / (Pmax - Pmin)) * (y0 - y1);

  _axisY(ctx, x0, y1, y0, ['40', '80', '120', '160', '200 mmHg']);
  _line(ctx, x0, yP(pt), x1, yP(pt), C.amber, 1.5, [4, 4]);
  _txt(ctx, x1 - 4, yP(pt) - 6, `umbral pt = ${pt} mmHg`, { size: 8.5, align: 'right', color: C.amber });

  // Curva de disparo F ∝ pb - pt
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const pp = Pmin + ((Pmax - Pmin) * i) / 80;
    const F = Math.max(0, pp - pt);
    const x = x0 + ((x1 - x0) * i) / 80;
    const y = y0 - (F / (Pmax - pt)) * (y0 - y1) * 0.9;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  // Presión actual
  const xPb = x0 + ((x1 - x0) * (pb - Pmin)) / (Pmax - Pmin);
  const curF = Math.max(0, pb - pt);
  const yMarker = y0 - (curF / (Pmax - pt)) * (y0 - y1) * 0.9;

  _line(ctx, xPb, y1, xPb, y0, C.ink, 1, [3, 3]);
  ctx.beginPath();
  ctx.arc(xPb, yMarker, 5, 0, Math.PI * 2);
  ctx.fillStyle = C.blood;
  ctx.fill();

  _txt(ctx, w / 2, h - 6, `Frecuencia F ∝ (pb − pt) = ${curF} mmHg (sobreimpulso según dpb/dt)`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'br_out', `F ∝ ${curF} mmHg`);
}

/* ---- SLIDE 14 · Ganancia de bucle ---- */
export function drawGa(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-ga') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const dpb = Number(params.ga_d) || 20;
  const g = Number(params.ga_g) || 4.0;
  const dpa = -g * dpb;

  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;
  const xm = 40;
  const yV = (v: number) => y0 - ((v + 160) / 320) * (y0 - y1);

  _line(ctx, x0, yV(0), x1, yV(0), C.line, 1);
  _txt(ctx, x1 - 4, yV(0) - 6, 'Δp = 0', { size: 8.5, align: 'right', color: C.muted });

  // Recta de ganancia
  ctx.beginPath();
  ctx.moveTo(x0, yV(g * xm));
  ctx.lineTo(x1, yV(-g * xm));
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // Punto seleccionado
  const xPt = x0 + ((x1 - x0) * (dpb + xm)) / (2 * xm);
  const yPt = yV(dpa);

  ctx.beginPath();
  ctx.arc(xPt, yPt, 5, 0, Math.PI * 2);
  ctx.fillStyle = C.teal;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  _txt(ctx, w / 2, h - 6, `Δpa = −g·Δpb · g=${g.toFixed(1)} · Δpb=+${dpb} mmHg → Δpa=${dpa.toFixed(0)} mmHg`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'ga_out', `Δpa = ${dpa.toFixed(0)} mmHg`);
}

/* ---- SLIDE 15 · Ejercicio: sistemas en paralelo ---- */
export function drawEx(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-ex') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const I = Number(params.ex_i) || 50;
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;

  const bars: [string, string, number][] = [
    ['Cardiovascular', C.blood, 0.35 + (0.65 * I) / 100],
    ['Ventilación', C.teal, 0.25 + (0.75 * I) / 100],
    ['Térmico / Sudor', C.amber, 0.4 + (0.6 * I) / 100],
  ];

  const bw = (x1 - x0 - 40) / bars.length;
  bars.forEach((b, i) => {
    const x = x0 + 15 + i * (bw + 10);
    const bh = (y0 - y1) * b[2];
    _rect(ctx, x, y0 - bh, bw - 6, bh, b[1], 4);
    _txt(ctx, x + (bw - 6) / 2, y0 - bh - 8, b[0], { size: 9.5, align: 'center', bold: true, color: b[1] });
    _txt(ctx, x + (bw - 6) / 2, y0 + 12, `${(b[2] * 100).toFixed(0)}%`, { size: 9.5, align: 'center', bold: true, color: C.ink });
  });

  _line(ctx, x0, y0, x1, y0, C.line, 1);
  _txt(ctx, w / 2, h - 6, `Intensidad de ejercicio: ${I}% · Tres lazos de control acoplados en paralelo`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'ex_out', 'PA ↑ · GC ↑ · ventilación ↑');
}

/* ---- SLIDE 16 · Curvas de ejercicio (GC, ventilación) ---- */
export function drawCv(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-cv') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const I = Number(params.cv_i) || 50;
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;
  const Imax = 100;
  const xI = (II: number) => x0 + ((x1 - x0) * II) / Imax;

  // Gasto cardíaco (lineal)
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const ii = (Imax * i) / 80;
    const v = 0.25 + (0.75 * ii) / Imax;
    const x = xI(ii);
    const y = y0 - v * (y0 - y1) * 0.9;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // Ventilación (quiebre en umbral anaeróbico ~60%)
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const ii = (Imax * i) / 80;
    const v = 0.15 + (ii < 60 ? (0.45 * ii) / 60 : 0.45 + (1.2 * (ii - 60)) / 40);
    const x = xI(ii);
    const y = y0 - (v / 1.65) * (y0 - y1) * 0.9;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  // Marcador interactivo
  _line(ctx, xI(I), y1, xI(I), y0, C.ink, 1, [3, 3]);

  _txt(ctx, x1 - 6, y1 + 12, 'Gasto cardíaco (rojo)', { size: 9, align: 'right', bold: true, color: C.blood });
  _txt(ctx, x1 - 6, y1 + 26, 'Ventilación V̇ (teal)', { size: 9, align: 'right', bold: true, color: C.teal });

  _txt(ctx, w / 2, h - 6, `GC (lineal) y Ventilación (umbral anaeróbico ~60%) vs Intensidad`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'cv_out', 'GC y ventilación suben');
}

/* ---- SLIDE 17 · Pupila: respuesta con retardo ---- */
export function drawPu(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-pu') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const I = Number(params.pu_i) || 200;
  const tau = Number(params.pu_t) || 280;
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;

  const A = I > 500 ? 2 : 8 - (6 * Math.log10(I / 50)) / Math.log10(20);
  const Aclip = Math.max(2, Math.min(8.5, A));

  // Estímulo luminoso (escalón)
  _line(ctx, x0, y0, x0 + (x1 - x0) * 0.2, y0, C.amber, 2);
  _line(ctx, x0 + (x1 - x0) * 0.2, y0, x0 + (x1 - x0) * 0.2, y1 + 15, C.amber, 2);
  _line(ctx, x0 + (x1 - x0) * 0.2, y1 + 15, x1, y1 + 15, C.amber, 2);
  _txt(ctx, x1 - 4, y1 + 8, `Luz I = ${I} lx`, { size: 8.5, align: 'right', color: C.amber });

  // Respuesta de contracción con latencia τ
  ctx.beginPath();
  const td = (tau / 600) * (x1 - x0) * 0.7;
  const stepX = x0 + (x1 - x0) * 0.2;

  for (let i = 0; i <= 80; i++) {
    const x = x0 + ((x1 - x0) * i) / 80;
    let aVal = 8.5; // pupila dilatada inicial
    if (x >= stepX + td) {
      const tt = (x - (stepX + td)) / ((x1 - x0) * 0.5);
      aVal = 8.5 - (8.5 - Aclip) * (1 - Math.exp(-tt * 4));
    }
    const y = y0 - ((aVal - 1.5) / 7.5) * (y0 - y1);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  _txt(ctx, w / 2, h - 6, `I = ${I} lx · Latencia τ = ${tau} ms → Área pupilar A = ${Aclip.toFixed(1)} mm²`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'pu_out', `A responde con retardo ${tau} ms`);
}

/* ---- SLIDE 18 · A(x) tipo Hill ---- */
export function drawAx(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-ax') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const n = Number(params.ax_n) || 3.0;
  const th = Number(params.ax_th) || 1.0;
  const A0 = 2;
  const A1 = 7;
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;
  const xm = 3.0;
  const yA = (a: number) => y0 - ((a - A0) / A1) * (y0 - y1);

  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const xv = (xm * i) / 80;
    const A = A0 + (A1 * Math.pow(th, n)) / (Math.pow(xv, n) + Math.pow(th, n));
    const x = x0 + ((x1 - x0) * i) / 80;
    const y = yA(A);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  _line(ctx, x0, y0, x1, y0, C.line, 1);
  _axisX(ctx, x0, y0, x1, ['0 (oscuridad)', 'θ (medio)', '2θ', '3θ (luz intensa)']);

  _txt(ctx, w / 2, h - 6, `A(x) = A₀ + A₁·θⁿ/(xⁿ+θⁿ) · n=${n.toFixed(1)} θ=${th.toFixed(1)} · función tipo Hill`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'ax_out', `A(x) tipo Hill · n=${n.toFixed(1)}`);
}

/* ---- SLIDE 19 · Oscilación pupilar (animada) ---- */
export function drawPo(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-po') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const I = Number(params.po_i) || 400;
  const tau = Number(params.po_t) || 280;
  const t = flags.poT;
  const unstable = I > 500 && tau > 350;

  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;
  const yMid = (y0 + y1) / 2;

  _line(ctx, x0, yMid, x1, yMid, C.amber, 1, [4, 4]);

  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const tt = t + (i / 80) * 4;
    let a: number;
    if (unstable) {
      a = 0.5 + 0.38 * Math.sin(tt * 3.5);
    } else {
      a = 0.5 + 0.32 * Math.exp(-tt * 0.7) * Math.sin(tt * 3.5);
    }
    const x = x0 + ((x1 - x0) * i) / 80;
    const y = y0 - a * (y0 - y1);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = unstable ? C.blood : C.teal;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  _txt(ctx, w / 2, h - 6, `${unstable ? 'INESTABLE · oscilación sostenida ("parpadeo")' : 'ESTABLE · área se asienta'} · I=${I} lx, τ=${tau} ms`, {
    size: 9,
    align: 'center',
    color: C.muted,
  });
  safeOut(out, 'po_out', unstable ? 'oscila (inestable)' : 'se asienta (estable)');
}

/* ---- SLIDE 20 · Diagrama contracorriente ---- */
export function drawCc2(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-cc2') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const hot = flags.cc2Hot;
  const xSuperficial = 70;
  const xProfundo = w - 70;

  // Vaso superficial
  _line(ctx, xSuperficial, 35, xSuperficial, h - 35, hot ? C.blood : '#d2c8b8', hot ? 5 : 2);
  // Vaso profundo (contracorriente)
  _line(ctx, xProfundo, 35, xProfundo, h - 35, !hot ? C.teal : '#d2c8b8', !hot ? 5 : 2);

  // Flechas de intercambio
  for (let y = 65; y < h - 45; y += 35) {
    if (!hot) {
      _line(ctx, xProfundo - 10, y, xSuperficial + 10, y, C.amber, 1.5, [3, 3]);
      _txt(ctx, w / 2, y, 'intercambio de calor', { size: 8, align: 'center', color: C.amber });
    }
  }

  _txt(ctx, xSuperficial, 22, 'Superficial (piel)', { size: 10, align: 'center', bold: true, color: hot ? C.blood : C.muted });
  _txt(ctx, xProfundo, 22, 'Profundo (núcleo)', { size: 10, align: 'center', bold: true, color: !hot ? C.teal : C.muted });
  _txt(ctx, w / 2, 22, hot ? '🔥 HACE CALOR: Flujo a superficie (disipa)' : '❄️ HACE FRÍO: Flujo a profundo (conserva)', {
    size: 10.5,
    align: 'center',
    bold: true,
    color: hot ? C.blood : C.teal,
  });

  _txt(ctx, w / 2, h - 8, 'haz clic para alternar calor / frío · mecanismo vasomotor a contracorriente', { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'cc2_out', hot ? 'superficial (pierde calor)' : 'profundo (conserva)');
}

/* ---- SLIDE 21 · Banda muerta 13.2 / 13.3 ---- */
export function drawPb(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-pb') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const rate = Number(params.pb_r) || 2.0;
  const band = Number(params.pb_b) || 0.5;
  const interval = (band / rate) * 60; // min

  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;

  // Líneas de banda muerta ±band
  const yMid = (y0 + y1) / 2;
  const bandH = (y0 - y1) * 0.35;
  _line(ctx, x0, yMid - bandH, x1, yMid - bandH, C.amber, 1.5, [4, 4]);
  _line(ctx, x0, yMid + bandH, x1, yMid + bandH, C.amber, 1.5, [4, 4]);
  _txt(ctx, x1 - 4, yMid - bandH - 6, `+${band.toFixed(1)} °C`, { size: 8.5, align: 'right', color: C.amber });
  _txt(ctx, x1 - 4, yMid + bandH + 10, `−${band.toFixed(1)} °C`, { size: 8.5, align: 'right', color: C.amber });

  // Señal diente de sierra
  ctx.beginPath();
  const N = 100;
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N;
    const ph = ((i / N) * 4) % 1;
    const v = (ph < 0.85 ? ph / 0.85 : 1 - (ph - 0.85) / 0.15) * 2 - 1;
    const y = yMid - v * bandH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  _txt(ctx, w / 2, h - 6, `Banda muerta ±${band.toFixed(1)} °C · Deriva ${rate.toFixed(1)} °C/h → Se activa cada ${interval.toFixed(0)} min`, {
    size: 9,
    align: 'center',
    color: C.muted,
  });
  safeOut(out, 'pb_out', `se activa cada ${interval.toFixed(0)} min`);
}

/* ---- SLIDE 22 · Enfriamiento / recalentamiento ---- */
export function drawPr(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-pr') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const sel = Number(params.pr_sel) || 0;
  const t = flags.prT;
  const Cth = 2.4;
  const Thab = 21;
  const x0 = 48;
  const y0 = h - 34;
  const y1 = 20;
  const x1 = w - 20;
  const Tmin = 18;
  const Tmax = 40;
  const yT = (TT: number) => y0 - ((TT - Tmin) / (Tmax - Tmin)) * (y0 - y1);

  _line(ctx, x0, yT(37), x1, yT(37), C.teal, 1, [4, 4]);
  _line(ctx, x0, yT(Thab), x1, yT(Thab), C.line, 1);

  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const tt = t + (i / 80) * 6;
    let TT = 37;
    if (sel === 0) {
      TT = Thab + (37 - Thab) * Math.exp(-tt / Cth);
    } else if (sel === 1) {
      TT = 28 + (37 - 28) * (1 - Math.exp(-tt / (Cth / 3)));
    } else {
      TT = 28 + (37 - 28) * (1 - Math.exp(-tt / (Cth / 6)));
    }
    const x = x0 + ((x1 - x0) * i) / 80;
    const y = yT(TT);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = sel === 0 ? C.blood : C.teal;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  const title = sel === 0 ? 'Enfriamiento sin metabolismo (τr = 2,4 h)' : sel === 1 ? 'Recalentamiento BMR normal' : 'Recalentamiento cumbre metabólica';
  _txt(ctx, w / 2, h - 6, `${title} · Ecuación (13.28) y Probs. 13.4/13.6`, { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'pr_out', sel === 0 ? 'T baja a 21 °C · τr 2,4 h' : 'T sube a 37 °C');
}

/* ---- SLIDE 23 · Mapa integrado de sistemas de control ---- */
export function drawMap(params: SimParams, flags: SimFlags, out?: OutFn) {
  const cv = document.getElementById('sim-map') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const k = Number(params.map_sel) || 0;
  const sys = [
    ['Temperatura', 'Bucle cerrado (sudor)', C.blood],
    ['Presión arterial', 'Barorreflejo (carotídeo)', C.teal],
    ['Ejercicio', 'Sistemas acoplados', C.amber],
    ['Pupila ocular', 'Lazo con latencia', C.violet],
  ];

  const bx = 40;
  const bw = (w - 80) / sys.length;
  sys.forEach((s, i) => {
    const x = bx + i * bw;
    const on = i === k;
    _rect(ctx, x + 4, h / 2 - 28, bw - 8, 56, on ? (s[2] as string) : '#ede4d0', 6);
    _txt(ctx, x + bw / 2, h / 2 - 6, s[0] as string, { size: 10.5, align: 'center', bold: true, color: on ? '#ffffff' : C.ink });
    _txt(ctx, x + bw / 2, h / 2 + 12, s[1] as string, { size: 8.5, align: 'center', color: on ? '#f0e8d5' : C.muted });
    if (i < sys.length - 1) {
      _txt(ctx, x + bw, h / 2, '↔', { size: 14, align: 'center', color: C.muted });
    }
  });

  _txt(ctx, w / 2, h - 8, 'Los cuatro sistemas fisiológicos comparten la arquitectura de la Fig. 13.2', { size: 9, align: 'center', color: C.muted });
  safeOut(out, 'map_out', `${sys[k][0]} · ${sys[k][1]}`);
}

/* Dispatcher general de redibujo */
export function redrawSlide(n: number, t: number, params: SimParams, flags: SimFlags, out?: OutFn): void {
  const fns: Record<number, () => void> = {
    1: () => drawHo(params, flags, out),
    2: () => drawBl(params, flags, out),
    3: () => drawFb(params, flags, out),
    4: () => drawTherm(params, flags, out),
    5: () => drawEc(params, flags, out),
    6: () => drawPtr(params, flags, out),
    7: () => drawReg(params, flags, out),
    8: () => drawBq(params, flags, out),
    9: () => drawOa(params, flags, out),
    10: () => drawCc(params, flags, out),
    11: () => drawSw(params, flags, out),
    12: () => drawCr(params, flags, out),
    13: () => drawBr(params, flags, out),
    14: () => drawGa(params, flags, out),
    15: () => drawEx(params, flags, out),
    16: () => drawCv(params, flags, out),
    17: () => drawPu(params, flags, out),
    18: () => drawAx(params, flags, out),
    19: () => drawPo(params, flags, out),
    20: () => drawCc2(params, flags, out),
    21: () => drawPb(params, flags, out),
    22: () => drawPr(params, flags, out),
    23: () => drawMap(params, flags, out),
  };

  const fn = fns[n];
  if (fn) fn();
}
