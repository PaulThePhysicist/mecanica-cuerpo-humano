// ═══════════════════════════════════════════════════════════
// CAPÍTULO 12 · SIMULACIONES FÍSICAS Y DIBUJO EN CANVAS 2D
// Propiedades Eléctricas y Magnéticas · Herman (2016)
// ═══════════════════════════════════════════════════════════

import {
  AB,
  C,
  PAL,
  _bg,
  _txt,
  _rect,
  _line,
  _poly,
  _axisX,
  _axisY,
  _axisY12,
  _gauss,
  _arrow,
  sup,
  sci,
  fmtA,
  fmtR,
  formatRho,
  shortT,
  clamp,
  espan,
} from './ab';

export const TOTAL = 24;

export interface SimParams {
  // Slide 1
  bi_sel: number;
  // Slide 2
  cp_sel: number;
  cp_q: number;
  cp_th: number;
  // Slide 3
  oc_i1: number;
  oc_i2: number;
  // Slide 4
  cs_na: number;
  cs_k: number;
  cs_h: number;
  // Slide 5
  rt_sel: number;
  // Slide 6
  mr_sel: number;
  // Slide 7
  nr_z: number;
  nr_t: number;
  nr_lg: number;
  // Slide 8
  gd_a: number;
  // Slide 9
  ap_st: number;
  // Slide 10
  cb_a: number;
  cb_b: number;
  // Slide 11
  vl_a: number;
  // Slide 12
  dp_t: number;
  dp_l: number;
  // Slide 13
  hc_d: number;
  // Slide 14
  eq_g: number;
  // Slide 15
  eh_th: number;
  // Slide 16
  ec_hr: number;
  // Slide 18
  ar_sel: number;
  // Slide 19
  eg_sel: number;
  // Slide 20
  sh_v: number;
  sh_sel: number;
  // Slide 21
  bm_sel: number;
  bm_r: number;
  // Slide 22
  em_sel: number;
  // Slide 23
  mp_sel: number;
}

export interface SimFlags {
  apPlaying: boolean;
  apT: number;
  ehPlaying: boolean;
  ehT: number;
  ecPlaying: boolean;
  ecT: number;
  dcPlaying: boolean;
  dcT: number;
  egPlaying: boolean;
  egT: number;
}

export const DEFAULT_PARAMS: SimParams = {
  bi_sel: 0,
  cp_sel: 0,
  cp_q: 50,
  cp_th: 0,
  oc_i1: 40,
  oc_i2: 30,
  cs_na: 145,
  cs_k: 5,
  cs_h: 40,
  rt_sel: 0,
  mr_sel: 0,
  nr_z: 1,
  nr_t: 310,
  nr_lg: 0,
  gd_a: 0.02,
  ap_st: -60,
  cb_a: 5,
  cb_b: 6,
  vl_a: 5,
  dp_t: 1,
  dp_l: 1,
  hc_d: 0,
  eq_g: 0,
  eh_th: 0,
  ec_hr: 72,
  ar_sel: 0,
  eg_sel: 0,
  sh_v: 120,
  sh_sel: 0,
  bm_sel: 0,
  bm_r: 1,
  em_sel: 0,
  mp_sel: 0,
};

export const DEFAULT_FLAGS: SimFlags = {
  apPlaying: false,
  apT: 0,
  ehPlaying: false,
  ehT: 0,
  ecPlaying: false,
  ecT: 0,
  dcPlaying: false,
  dcT: 0,
  egPlaying: false,
  egT: 0,
};

export interface ModuleInfo {
  id: number;
  name: string;
  slides: number[];
  ico: string;
}

export const MODULES: ModuleInfo[] = [
  { id: 0, name: 'Inicio', slides: [0], ico: '🏠' },
  { id: 1, name: 'Repaso eléctrico', slides: [1, 2, 3], ico: '⚡' },
  { id: 2, name: 'Tejidos del cuerpo', slides: [4, 5], ico: '🩸' },
  { id: 3, name: 'La neurona y su membrana', slides: [6, 7, 8], ico: '🧠' },
  { id: 4, name: 'Potencial de acción y el cable', slides: [9, 10, 11, 12], ico: '🚀' },
  { id: 5, name: 'Células ciliadas y sentidos', slides: [13, 14], ico: '👂' },
  { id: 6, name: 'El corazón eléctrico', slides: [15, 16, 17, 18], ico: '❤️' },
  { id: 7, name: 'EEG y descargas', slides: [19, 20], ico: '🌊' },
  { id: 8, name: 'Magnetismo', slides: [21, 22], ico: '🧲' },
  { id: 9, name: 'Resumen', slides: [23], ico: '🧾' },
];

function el(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function num(id: string, fallback: number): number {
  const elem = el(id) as HTMLInputElement | HTMLSelectElement | null;
  return elem ? parseFloat(elem.value) : fallback;
}

// ===================== SLIDE 1 · BIOELECTRICIDAD =====================
export function drawBio(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-bi') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const k = +num('bi_sel', params.bi_sel) || 0;
  const SIG: [string, number, string][] = [
    ['ECG', 1e-3, '1 mV'],
    ['EEG', 5e-5, '50 µV'],
    ['EMG', 3e-4, '300 µV'],
    ['Membrana', 1e-1, '100 mV'],
    ['EOG', 5e-4, '500 µV'],
  ];
  const yTop = 18,
    y0 = h - 42;
  const yV = (v: number) => yTop + ((y0 - yTop) * (Math.log10(v) + 7)) / 7;

  _axisY12(ctx, 44, yTop, y0, ['0,1 µV', '1 µV', '10 µV', '100 µV', '1 mV', '10 mV', '100 mV', '1 V']);
  const bw = Math.min(48, (w - 90) / SIG.length);
  SIG.forEach((s, i) => {
    const x = 70 + i * (bw + 8);
    const y = yV(s[1]);
    _rect(ctx, x, y, bw - 4, y0 - y, i === k ? C.amber : C.teal, 3);
    _txt(ctx, x + bw / 2, y - 8, s[0], { size: 11, align: 'center', bold: i === k, color: i === k ? C.ink : C.muted });
    _txt(ctx, x + bw / 2, y0 + 14, s[2], { size: 10, align: 'center', bold: i === k, color: i === k ? C.amber : C.ink });
  });
  _txt(ctx, w / 2, h - 8, 'amplitud de las señales del cuerpo · escala log', { size: 9, align: 'center', color: C.muted });
  out('bi_out', SIG[k][0] + ' · ' + SIG[k][2]);
}

// ===================== SLIDE 2 · COULOMB, CAMPO Y POTENCIAL =====================
export function drawCoulomb(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-cp') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const mode = +num('cp_sel', params.cp_sel) || 0,
    q = +num('cp_q', params.cp_q),
    th = +num('cp_th', params.cp_th);
  const cx = w * 0.34,
    cy = h * 0.5;
  const qs = q < 0 ? -1 : 1;

  if (mode === 0) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      for (let r = 1; r <= 3; r++) {
        const rr = 28 * r,
          x1 = cx + Math.cos(a) * rr,
          y1 = cy + Math.sin(a) * rr,
          L = 7 / r;
        _line(ctx, x1, y1, x1 + Math.cos(a) * qs * L, y1 + Math.sin(a) * qs * L, C.teal, 1.5);
      }
    }
    for (let r = 1; r <= 4; r++) {
      ctx.beginPath();
      ctx.arc(cx, cy, 20 * r, 0, Math.PI * 2);
      ctx.strokeStyle = C.line;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const col = q < 0 ? C.blood : C.amber;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    _txt(ctx, cx, cy, q < 0 ? '−' : '+' + Math.abs(q), { size: 12, align: 'center', color: C.paper, bold: true });
    _txt(ctx, cx + 14, cy - 18, q < 0 ? 'carga negativa' : 'carga positiva', { size: 9, color: C.muted });
    const rP = Math.min(w * 0.28, h * 0.34),
      rad = (th * Math.PI) / 180;
    const px = cx + Math.cos(rad) * rP,
      py = cy + Math.sin(rad) * rP;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = C.ink;
    ctx.fill();
    _txt(ctx, px + 7, py - 6, 'p', { size: 11, color: C.ink, bold: true });
    const V = q / rP;
    out('cp_qv', q < 0 ? '−' + Math.abs(q) : '+' + q);
    out('cp_thv', th + '°');
    out('cp_out', 'carga única · V(prueba) = ' + (V >= 0 ? '+' : '−') + Math.abs(V).toFixed(1).replace('.', ',') + ' (kq/r)');
  } else {
    const d = 24,
      qa = Math.abs(q);
    const xp = cx - d,
      xn = cx + d;
    ctx.beginPath();
    ctx.arc(xp, cy, 9, 0, Math.PI * 2);
    ctx.fillStyle = C.amber;
    ctx.fill();
    _txt(ctx, xp, cy, '+', { size: 12, align: 'center', color: C.paper, bold: true });
    ctx.beginPath();
    ctx.arc(xn, cy, 9, 0, Math.PI * 2);
    ctx.fillStyle = C.blood;
    ctx.fill();
    _txt(ctx, xn, cy, '−', { size: 12, align: 'center', color: C.paper, bold: true });
    _txt(ctx, cx, cy + 22, 'P = q·d', { size: 9, align: 'center', color: C.muted });
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, 26 * r, 20 * r, 0, 0, Math.PI * 2);
      ctx.strokeStyle = C.line;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const rP = Math.min(w * 0.32, h * 0.36),
      rad = (th * Math.PI) / 180;
    const px = cx + Math.cos(rad) * rP,
      py = cy + Math.sin(rad) * rP;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = C.ink;
    ctx.fill();
    _txt(ctx, px + 7, py - 6, 'p', { size: 11, color: C.ink, bold: true });
    const rp = Math.max(20, Math.hypot(px - xp, py - cy)),
      rn = Math.max(20, Math.hypot(px - xn, py - cy));
    const V = qa / rp - qa / rn;
    out('cp_qv', q < 0 ? '−' + Math.abs(q) : '+' + q);
    out('cp_thv', th + '°');
    out('cp_out', 'dipolo · V(prueba) = ' + (V >= 0 ? '+' : '−') + Math.abs(V).toFixed(2).replace('.', ',') + ' (kP·cosθ/r²)');
  }
}

// ===================== SLIDE 3 · CORRIENTE, OHM, KIRCHHOFF =====================
export function drawOhm(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-oc') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const i1 = +num('oc_i1', params.oc_i1) || 0,
    i2 = +num('oc_i2', params.oc_i2) || 0,
    i3 = i1 + i2;
  const cx = w * 0.5,
    cy = h * 0.5,
    sc = 0.85;
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fillStyle = C.tealD;
  ctx.fill();
  _txt(ctx, cx, cy, 'ΣI=0', { size: 8, align: 'center', color: C.paper, bold: true });
  const x1 = cx - 34 - i1 * sc,
    y1 = cy - 34 - i2 * sc,
    x3 = cx + 34 + i3 * sc;
  _arrow(ctx, x1, cy, cx - 9, cy, C.amber, 2);
  _arrow(ctx, cx, y1, cx, cy - 9, C.amber, 2);
  _arrow(ctx, cx + 9, cy, x3, cy, C.teal, 2);
  _txt(ctx, (x1 + cx - 9) / 2, cy - 12, 'I₁ = ' + i1 + ' mA', { size: 10, align: 'center', color: C.amber, bold: true });
  _txt(ctx, cx, (y1 + cy - 9) / 2 - 12, 'I₂ = ' + i2 + ' mA', { size: 10, align: 'center', color: C.amber, bold: true });
  _txt(ctx, (cx + 9 + x3) / 2, cy - 12, 'I₃ = ' + i3 + ' mA', { size: 10, align: 'center', color: C.teal, bold: true });
  _txt(ctx, w / 2, h - 12, 'nodo · 1.ª ley de Kirchhoff: I₁ + I₂ − I₃ = 0', { size: 10, align: 'center', color: C.muted });
  out('oc_i1v', i1 + ' mA');
  out('oc_i2v', i2 + ' mA');
  out('oc_out', 'I₃ = I₁ + I₂ = ' + i3 + ' mA · ΣI = 0');
}

// ===================== SLIDE 4 · CONDUCTIVIDAD DE LAS SOLUCIONES =====================
export function drawSigma(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-cs') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const na = +num('cs_na', params.cs_na) || 0,
    k = +num('cs_k', params.cs_k) || 0,
    hp = +num('cs_h', params.cs_h) || 0,
    cl = 115;
  const cNa = na * 50.1e-4,
    cK = k * 73.5e-4,
    cCl = cl * 76.3e-4,
    cH = hp * 1e-6 * 349.8e-4;
  const sig = cNa + cK + cCl + cH;
  const y0 = h - 34,
    yTop = 18;
  const yV = (v: number) => yTop + ((y0 - yTop) * (Math.log10(v) + 6)) / 7;
  const bars: [string, number, string, boolean][] = [
    ['Na⁺', cNa, C.teal, true],
    ['K⁺', cK, C.teal, true],
    ['H⁺', cH, C.amber, true],
    ['Cl⁻', cCl, C.muted, false],
  ];
  const bw = Math.min(66, (w - 40) / bars.length);
  bars.forEach((b, i) => {
    const x = 40 + i * (bw + 8);
    const y = yV(Math.max(b[1], 1e-6));
    _rect(ctx, x, y, bw - 6, Math.max(2, y0 - y), b[2], 3);
    _txt(ctx, x + bw / 2, y - 6, shortT(b[1]), { size: 9, align: 'center', color: C.ink });
    _txt(ctx, x + bw / 2, y0 + 14, b[0] + (b[3] ? ' ✎' : ''), { size: 11, align: 'center', bold: b[3] });
  });
  _axisY12(ctx, 24, yTop, y0, ['1 µS/m', '10 µS/m', '100 µS/m', '1 mS/m', '10 mS/m', '100 mS/m', '1 S/m', '10 S/m']);
  _txt(ctx, w / 2, h - 8, 'σ = Σ nᵢ·Λ₀ᵢ · Cl⁻ fijo 115 mM · log (H⁺ 40 nM: movible pero despreciable)', {
    size: 9,
    align: 'center',
    color: C.muted,
  });
  out('cs_nav', na + ' mM');
  out('cs_kv', k + ' mM');
  out('cs_hv', hp + ' nM');
  out('cs_out', 'σ ≈ ' + espan(sig, 2) + ' S/m');
}

// ===================== SLIDE 5 · RESISTIVIDAD DE LOS TEJIDOS =====================
export function drawResist(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-rt') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const k = +num('rt_sel', params.rt_sel) || 0;
  const RHO = [0.65, 0.7, 1.6, 2, 2.8, 20, 40, 1e5, 1e7];
  const NAMES = ['LCR', 'Plasma', 'Sangre', 'Músculo long.', 'Materia gris', 'Grasa', 'Hueso', 'Piel húmeda', 'Piel seca'];
  const rho = RHO[k];
  const yTop = 18,
    y0 = h - 46;
  const yV = (v: number) => yTop + ((y0 - yTop) * (7 - Math.log10(v))) / 8;
  _axisY12(ctx, 48, yTop, y0, ['0,1', '1', '10', '100', '1 k', '10 k', '100 k', '1 M', '10 M']);
  _txt(ctx, 40, yTop - 8, 'Ω·m', { size: 9, align: 'right', color: C.muted });
  RHO.forEach((r, i) => {
    const y = yV(r);
    ctx.beginPath();
    ctx.arc(w - 56, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = i === k ? C.amber : C.line;
    ctx.fill();
  });
  const y = yV(rho);
  _rect(ctx, 62, y, 14, y0 - y, C.amber, 2);
  _txt(ctx, 84, y, formatRho(rho) + ' Ω·m', { size: 12, color: C.ink, bold: true });
  _txt(ctx, 84, y + 16, NAMES[k], { size: 10, color: C.muted });
  _txt(ctx, w - 56, h - 8, '· resto de tejidos', { size: 9, align: 'center', color: C.muted });
  out('rt_out', NAMES[k] + ' · ' + formatRho(rho) + ' Ω·m');
}

// ===================== SLIDE 6 · MEMBRANA Y REPOSO =====================
export function drawMemb(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-mr') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const k = +num('mr_sel', params.mr_sel) || 0;
  const V = [-70, -60, -80][k];
  const states = ['Polarizada', 'Despolarizada', 'Hiperpolarizada'];
  const my = h * 0.5;
  _rect(ctx, 20, my - 3, w - 40, 6, C.teal, 2);
  _txt(ctx, 28, my - 16, 'exterior (0 V)', { size: 9, color: C.muted });
  _txt(ctx, 28, my + 20, 'interior (negativo)', { size: 9, color: C.muted });
  const IONS: [string, number, number, string][] = [
    ['Na⁺', 15, 145, C.amber],
    ['K⁺', 150, 5, C.teal],
    ['Cl⁻', 9, 125, C.blood],
  ];
  const maxM = 160,
    yIn = my + 50,
    yOut = my - 50,
    bw = Math.min(54, (w - 120) / IONS.length);
  IONS.forEach((ion, i) => {
    const x = 60 + i * (bw + 12);
    const hi = (ion[1] / maxM) * (h - my - 64),
      ho = (ion[2] / maxM) * (my - 64);
    _rect(ctx, x, yIn - hi, bw - 4, Math.max(2, hi), ion[3], 2);
    _txt(ctx, x + bw / 2, yIn - hi - 7, String(ion[1]), { size: 10, align: 'center', color: ion[3], bold: true });
    _rect(ctx, x, yOut, bw - 4, Math.max(2, ho), ion[3], 2);
    _txt(ctx, x + bw / 2, yOut + ho + 14, String(ion[2]), { size: 10, align: 'center', color: ion[3], bold: true });
    _txt(ctx, x + bw / 2, yOut - 14, ion[0], { size: 10, align: 'center', color: C.muted });
  });
  _txt(ctx, w / 2, yOut - 46, 'V = ' + V + ' mV · ' + states[k], {
    size: 13,
    align: 'center',
    bold: true,
    color: k === 1 ? C.amber : k === 2 ? C.blood : C.tealD,
  });
  out('mr_out', states[k].toLowerCase() + ' · ' + V + ' mV');
}

// ===================== SLIDE 7 · NERNST Y DONNAN =====================
export function drawNernst(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-nr') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const Z = +num('nr_z', params.nr_z) || 1,
    T = +num('nr_t', params.nr_t) || 310,
    lg = +num('nr_lg', params.nr_lg) || 0;
  const kTe = ((1.38e-23 * T) / 1.6e-19) * 1000;
  const Vn = -Z * kTe * Math.log(10) * lg;
  const y0 = h - 40,
    yTop = 30,
    x0 = 56,
    x1 = w - 18;
  const xV = (v: number) => x0 + ((x1 - x0) * (90 - v)) / 180;
  const refIons: [string, number, string][] = [
    ['Na⁺', 61, C.amber],
    ['Cl⁻', -70, C.blood],
    ['K⁺', -91, C.teal],
  ];
  refIons.forEach((r) => {
    const x = xV(r[1]);
    _line(ctx, x, yTop, x, y0, r[2], 1, [4, 4]);
    _txt(ctx, x, yTop - 8, r[0] + ' ' + r[1] + ' mV', { size: 9, align: 'center', color: r[2] });
  });
  const x = xV(clamp(Vn, -90, 90));
  _line(ctx, x, yTop, x, y0, C.ink, 2);
  ctx.beginPath();
  ctx.arc(x, yTop - 12, 4, 0, Math.PI * 2);
  ctx.fillStyle = C.ink;
  ctx.fill();
  _txt(ctx, x, yTop + 14, 'V = ' + espan(Vn, 1) + ' mV', { size: 12, bold: true, color: C.ink, align: 'center' });
  _axisX(ctx, x0, y0, x1, ['+90', '+45', '0', '−45', '−90 mV']);
  _txt(ctx, x0, yTop - 24, 'V de Nernst', { size: 9, color: C.muted });
  out('nr_zv', (Z >= 0 ? '+' : '') + Z);
  out('nr_tv', T + ' K');
  out('nr_lgv', espan(lg, 2));
  out('nr_out', 'Z = ' + (Z >= 0 ? '+' : '') + Z + ' · T = ' + T + ' K · ni/no = 10^' + espan(lg, 2) + ' → V = ' + espan(Vn, 1) + ' mV');
}

// ===================== SLIDE 8 · GOLDMAN =====================
export function drawGoldman(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-gd') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const a = +num('gd_a', params.gd_a) || 0;
  const nNaI = 15,
    nKI = 150,
    nNaO = 145,
    nKO = 5,
    kTq = 25.69;
  const Vg = (alpha: number) => {
    const r = (alpha * nNaI + nKI) / (alpha * nNaO + nKO);
    return -kTq * Math.log(r);
  };
  const yTop = 22,
    y0 = h - 40,
    x0 = 56,
    x1 = w - 20;
  const laMin = -3,
    laMax = 0;
  const xL = (v: number) => x0 + ((x1 - x0) * (v - laMin)) / (laMax - laMin);
  const yV = (v: number) => yTop + ((y0 - yTop) * (90 - v)) / 180;
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const la = laMin + ((laMax - laMin) * i) / 80;
    const v = Vg(Math.pow(10, la));
    const x = xL(la),
      y = yV(v);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2;
  ctx.stroke();
  _line(ctx, x0, yV(61), x1, yV(61), C.amber, 1, [4, 4]);
  _txt(ctx, x1, yV(61) + 3, 'Nernst Na⁺ +61', { size: 9, align: 'right', color: C.amber });
  _line(ctx, x0, yV(-91), x1, yV(-91), C.teal, 1, [4, 4]);
  _txt(ctx, x1, yV(-91) + 3, 'Nernst K⁺ −91', { size: 9, align: 'right', color: C.teal });
  _line(ctx, x0, yV(-70), x1, yV(-70), C.line, 1, [4, 4]);
  const mx = xL(Math.log10(Math.max(a, 1e-9))),
    my = yV(Vg(Math.max(a, 1e-9)));
  ctx.beginPath();
  ctx.arc(mx, my, 5, 0, Math.PI * 2);
  ctx.fillStyle = C.blood;
  ctx.fill();
  _txt(ctx, mx + 10, my, 'α = ' + espan(a, 3), { size: 10, color: C.blood, bold: true });
  _axisX(ctx, x0, y0, x1, ['0,001', '0,01', '0,1', '1']);
  _txt(ctx, x1, yTop - 6, 'α = pNa/pK (log)', { size: 9, align: 'right', color: C.muted });
  _txt(ctx, x0 - 8, yV(80) + 4, 'V (mV)', { size: 9, color: C.muted });
  out('gd_av', espan(a, 3));
  out('gd_out', 'α = ' + espan(a, 3) + ' · V ≈ ' + espan(Vg(Math.max(a, 1e-9)), 1) + ' mV');
}

// ===================== SLIDE 9 · EL POTENCIAL DE ACCIÓN =====================
export function drawAction(params: SimParams, flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-ap') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const st = +num('ap_st', params.ap_st) || -60;
  const x0 = 56,
    y0 = h - 44,
    yTop = 20;
  const xT = (v: number) => x0 + ((w - x0 - 14) * v) / 8;
  const yV = (v: number) => yTop + ((y0 - yTop) * (40 - v)) / 130;
  const resp = (t: number) =>
    st > -55 ? -70 + 90 * _gauss(t, 0.7, 0.5) - 12 * _gauss(t, 2.0, 0.8) : st + (-70 - st) * (1 - Math.exp(-t / 1.2));
  _line(ctx, x0, yV(-55), w - 14, yV(-55), C.amber, 1, [4, 4]);
  _txt(ctx, w - 14, yV(-55) + 3, 'umbral −55', { size: 9, align: 'right', color: C.amber });
  _line(ctx, x0, yV(-70), w - 14, yV(-70), C.line, 1, [3, 3]);
  _txt(ctx, w - 14, yV(-70) + 3, 'reposo −70', { size: 9, align: 'right', color: C.muted });
  _axisX(ctx, x0, y0, w - 14, ['0', '2', '4', '6', '8 ms']);
  _txt(ctx, x0 - 8, yV(35) + 4, 'V (mV)', { size: 9, color: C.muted });
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * 8;
    const x = xT(t),
      y = yV(resp(t));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = st > -55 ? C.blood : C.teal;
  ctx.lineWidth = 2;
  ctx.stroke();
  const tt = (flags.apT || (window as any).__apT || 0) % 8;
  ctx.beginPath();
  ctx.arc(xT(tt), yV(resp(tt)), 4, 0, Math.PI * 2);
  ctx.fillStyle = C.ink;
  ctx.fill();
  _line(ctx, x0 - 14, yV(st), x0, yV(st), C.amber, 1.5);
  _txt(ctx, x0 - 16, yV(st) - 6, 'estímulo', { size: 8, align: 'right', color: C.amber });
  out('ap_stv', st + ' mV');
  out('ap_out', 'estímulo ' + st + ' mV · ' + (st > -55 ? 'potencial de acción disparado' : 'subumbral · decae hacia −70'));
}

// ===================== SLIDE 10 · EL MODELO DE CABLE DEL AXÓN =====================
export function drawCable(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-cb') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const a = +num('cb_a', params.cb_a) || 5,
    b = +num('cb_b', params.cb_b) || 6;
  const am = a * 1e-6,
    bm = b * 1e-9;
  const ri = 0.5 / (Math.PI * am * am);
  const cm = (2 * Math.PI * 6.2e-11 * am) / bm;
  const my = h * 0.5;
  const rr = (Math.min(w * 0.2, 60) * a) / 5;
  ctx.beginPath();
  ctx.arc(w * 0.3, my, rr, 0, Math.PI * 2);
  ctx.fillStyle = '#efe9d8';
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = Math.min(12, 2 + Math.log10(b / 6) * 4);
  ctx.stroke();
  _txt(ctx, w * 0.3, my, 'axoplasma', { size: 10, align: 'center', color: C.muted });
  _txt(ctx, w * 0.3, my + 14, 'ρᵢ', { size: 10, align: 'center', color: C.teal });
  _txt(ctx, w * 0.3 + rr + 6, my - rr - 6, 'membrana · b = ' + b + ' nm', { size: 9, color: C.muted });
  _arrow(ctx, w * 0.6, my + 42, w * 0.9, my + 42, C.amber, 2);
  _txt(ctx, w * 0.75, my + 28, 'I', { size: 13, align: 'center', color: C.amber, bold: true });
  const tx = w * 0.64,
    ty = my - 48;
  _txt(ctx, tx, ty, 'rᵢ = ρᵢ/πa²', { size: 10, color: C.muted });
  _txt(ctx, tx, ty + 16, sci(ri) + ' Ω/m', { size: 13, bold: true, color: C.teal });
  _txt(ctx, tx, ty + 38, 'cₘ = 2πκε₀a/b', { size: 10, color: C.muted });
  _txt(ctx, tx, ty + 54, sci(cm) + ' F/m', { size: 13, bold: true, color: C.amber });
  _txt(ctx, w * 0.64, my + 70, 'Tabla 12.5 · a = 5 µm, b = 6 nm', { size: 9, color: C.muted });
  out('cb_av', espan(a, 1) + ' µm');
  out('cb_bv', b + ' nm');
  out('cb_out', 'rᵢ = ' + sci(ri) + ' Ω/m · cₘ = ' + sci(cm) + ' F/m');
}

// ===================== SLIDE 11 · VELOCIDAD DE CONDUCCIÓN =====================
export function drawVelo(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-vl') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const a = +num('vl_a', params.vl_a) || 5;
  const x0 = 56,
    y0 = h - 44,
    yTop = 20;
  const xA = (v: number) => x0 + ((w - x0 - 14) * v) / 10;
  const yU = (v: number) => yTop + ((y0 - yTop) * v) / 170;
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const aa = (i / 100) * 10;
    const x = xA(aa),
      y = yU(1.8 * Math.sqrt(aa));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const aa = (i / 100) * 10;
    const x = xA(aa),
      y = yU(17 * aa);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 2;
  ctx.stroke();
  const yc = yU(62.5),
    yc2 = yU(58.1);
  _rect(ctx, x0, Math.min(yc, yc2), w - x0 - 14, Math.abs(yc - yc2), 'rgba(13,110,102,0.10)', 0);
  _txt(ctx, w - 14, yc + 3, 'clínica 58–63 m/s', { size: 9, align: 'right', color: C.tealD });
  const m1 = clamp(a, 0.5, 10);
  const y1 = yU(1.8 * Math.sqrt(m1)),
    y2 = yU(17 * m1);
  _line(ctx, xA(m1), y0, xA(m1), yTop, C.line, 1, [3, 3]);
  ctx.beginPath();
  ctx.arc(xA(m1), y1, 4, 0, Math.PI * 2);
  ctx.fillStyle = C.teal;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(xA(m1), y2, 4, 0, Math.PI * 2);
  ctx.fillStyle = C.blood;
  ctx.fill();
  _txt(ctx, xA(m1) + 8, y1 - 6, 'amiel. ' + espan(1.8 * Math.sqrt(m1), 1), { size: 9, color: C.teal, bold: true });
  _txt(ctx, xA(m1) + 8, y2 - 6, 'miel. ' + espan(17 * m1, 0), { size: 9, color: C.blood, bold: true });
  _txt(ctx, w / 2, 12, 'u = 1,8·√a (amielínico) · u = 17a (mielínico)', { size: 10, align: 'center', color: C.muted });
  _axisX(ctx, x0, y0, w - 14, ['0', '2', '4', '6', '8', '10 µm']);
  _line(ctx, x0, y0, x0, yTop, C.line, 1);
  _txt(ctx, x0 - 8, yU(150) + 4, 'u (m/s)', { size: 9, color: C.muted });
  out('vl_av', espan(a, 1) + ' µm');
  out('vl_out', 'amielínico ' + espan(1.8 * Math.sqrt(a), 1) + ' m/s · mielínico ' + espan(17 * a, 0) + ' m/s');
}

// ===================== SLIDE 12 · DISPERSIÓN PASIVA =====================
export function drawDecay(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-dp') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const t = +num('dp_t', params.dp_t) || 1,
    l = +num('dp_l', params.dp_l) || 1;
  const D = l * l;
  const x0 = 56,
    y0 = h - 44,
    yTop = 24;
  const xX = (v: number) => x0 + ((w - x0 - 14) * v) / 3.2;
  const yV = (v: number) => yTop + (y0 - yTop) * (1 - v);
  const Vx = (x: number, tt: number) => Math.exp((-x * x) / (2 * D * tt)) * Math.exp(-tt);
  [0.1, 0.5, 1, 2, 5, 10].forEach((tt) => {
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * 3.2;
      const y = yV(Vx(x, tt)),
        px = xX(x);
      if (i === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const x = (i / 100) * 3.2;
    const y = yV(Vx(x, t)),
      px = xX(x);
    if (i === 0) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  const wdt = Math.sqrt(2 * D * t);
  const yh = yV(Vx(wdt, t));
  _line(ctx, xX(wdt), y0, xX(wdt), yh, C.amber, 1.5, [4, 3]);
  _txt(ctx, xX(wdt), yh - 8, '√(2Dt)', { size: 9, color: C.amber, align: 'center' });
  _txt(ctx, w / 2, 12, 'V(x,t) ∝ exp(−x²/2Dt)·exp(−t/τ) · en λ₀, τ = 1 ms', { size: 10, align: 'center', color: C.muted });
  _axisX(ctx, x0, y0, w - 14, ['0', '0,5', '1', '1,5', '2', '2,5', '3 λ']);
  out('dp_tv', espan(t, 1) + ' ms');
  out('dp_lv', espan(l, 1) + ' λ₀');
  out('dp_out', 't = ' + espan(t, 1) + ' ms · pico = ' + espan(Vx(0, t), 2) + ' · ancho √(2Dt) = ' + espan(wdt, 2) + ' λ');
}

// ===================== SLIDE 13 · LA CÉLULA CILIADA =====================
export function drawHair(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-hc') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const d = +num('hc_d', params.hc_d) || 0;
  const lean = (d / 100) * 0.35,
    baseX = w * 0.3,
    baseY = h * 0.46,
    N = 8;
  for (let i = 0; i < N; i++) {
    const H = 16 + (22 * i) / N,
      bx = baseX + i * 11;
    _line(ctx, bx, baseY, bx + Math.sin(lean) * H, baseY - Math.cos(lean) * H, C.tealD, 2);
    ctx.beginPath();
    ctx.arc(bx, baseY, 2, 0, Math.PI * 2);
    ctx.fillStyle = C.tealD;
    ctx.fill();
  }
  const kh = 44,
    kx = baseX + N * 11;
  _line(ctx, kx, baseY, kx + Math.sin(lean) * kh, baseY - Math.cos(lean) * kh, C.blood, 2.5);
  ctx.beginPath();
  ctx.arc(kx + Math.sin(lean) * kh, baseY - Math.cos(lean) * kh, 4, 0, Math.PI * 2);
  ctx.fillStyle = C.blood;
  ctx.fill();
  _txt(ctx, kx + 14, baseY + 6, 'kinocilio', { size: 9, color: C.blood });
  _rect(ctx, baseX - 12, baseY + 8, N * 11 + 24, 28, '#f5f1e4', 6);
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(baseX - 12, baseY + 8, N * 11 + 24, 28);
  const dV = 20 * Math.tanh(d / 40),
    V = -70 + dV;
  const gx = w * 0.7,
    gy = h * 0.42;
  _txt(ctx, gx, gy - 56, 'V de la célula', { size: 10, align: 'center', color: C.muted });
  const vY = (v: number) => gy + (0 - v) * 0.5;
  _line(ctx, gx - 30, vY(0), gx + 30, vY(0), C.line, 1);
  _line(ctx, gx - 30, vY(-70), gx + 30, vY(-70), C.line, 1, [4, 4]);
  _txt(ctx, gx + 34, vY(-70), '−70', { size: 9, color: C.muted });
  _txt(ctx, gx + 34, vY(0), '0', { size: 9, color: C.muted });
  _line(ctx, gx, vY(V), gx, vY(0), V < -70 ? C.blood : C.amber, 2);
  ctx.beginPath();
  ctx.arc(gx, vY(V), 5, 0, Math.PI * 2);
  ctx.fillStyle = V < -70 ? C.blood : C.amber;
  ctx.fill();
  _txt(ctx, gx, vY(V) + 16, 'V = ' + espan(V, 0) + ' mV', {
    size: 11,
    align: 'center',
    bold: true,
    color: V < -70 ? C.blood : C.amber,
  });
  _txt(ctx, gx, gy + 38, V < -70 ? 'hiperpolarizada' : V > -70 ? 'despolarizada' : 'reposo', {
    size: 10,
    align: 'center',
    color: C.muted,
  });
  out('hc_dv', d >= 0 ? '+' + d : String(d));
  out('hc_out', 'd = ' + (d >= 0 ? '+' : '') + d + ' · V ≈ ' + espan(V, 0) + ' mV · ' + (V < -70 ? 'hiperpolarizada' : V > -70 ? 'despolarizada' : 'reposo'));
}

// ===================== SLIDE 14 · EQUILIBRIO, GUSTO Y OLFATO =====================
export function drawEquil(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-eq') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const g = +num('eq_g', params.eq_g) || 0;
  const ang = (g / 100) * 30 * (Math.PI / 180),
    cy = h * 0.42;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, cy, 90, 70, ang, 0, Math.PI * 2);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.stroke();
  _txt(ctx, w * 0.5, cy - 88, 'vista superior de la cabeza', { size: 9, align: 'center', color: C.muted });
  const earLx = w * 0.5 - 95,
    earRx = w * 0.5 + 95;
  ctx.beginPath();
  ctx.ellipse(earLx, cy, 26, 52, 0, 0, Math.PI * 2);
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(earRx, cy, 26, 52, 0, 0, Math.PI * 2);
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2;
  ctx.stroke();
  _txt(ctx, earLx, cy - 68, 'oído izq.', { size: 9, align: 'center', color: C.muted });
  _txt(ctx, earRx, cy - 68, 'oído der.', { size: 9, align: 'center', color: C.muted });
  if (g > 0) {
    _txt(ctx, w * 0.5, cy + 44, 'giro a la derecha →', { size: 11, align: 'center', bold: true, color: C.ink });
    _txt(ctx, earRx, cy + 10, 'despolarizada +', { size: 10, align: 'center', color: C.amber, bold: true });
    _txt(ctx, earLx, cy + 10, 'hiperpolarizada −', { size: 10, align: 'center', color: C.blood, bold: true });
    _rect(ctx, earRx - 14, cy - 14, 10, 16 * Math.min(1, Math.abs(g) / 100), C.amber, 2);
  } else if (g < 0) {
    _txt(ctx, w * 0.5, cy + 44, '← giro a la izquierda', { size: 11, align: 'center', bold: true, color: C.ink });
    _txt(ctx, earLx, cy + 10, 'despolarizada +', { size: 10, align: 'center', color: C.amber, bold: true });
    _txt(ctx, earRx, cy + 10, 'hiperpolarizada −', { size: 10, align: 'center', color: C.blood, bold: true });
    _rect(ctx, earLx - 14, cy - 14, 10, 16 * Math.min(1, Math.abs(g) / 100), C.amber, 2);
  } else {
    _txt(ctx, w * 0.5, cy + 44, 'sin giro · ambos oídos en reposo', { size: 11, align: 'center', color: C.muted });
  }
  _txt(ctx, w * 0.5, h - 8, 'la inercia del fluido retrasa su movimiento en los canales semicirculares', {
    size: 9,
    align: 'center',
    color: C.muted,
  });
  out('eq_gv', g + (g > 0 ? '° → der' : g < 0 ? '° → izq' : '°'));
  out(
    'eq_out',
    g > 0
      ? 'giro a la derecha · oído der. despolarizada · oído izq. hiperpolarizada'
      : g < 0
      ? 'giro a la izquierda · oído izq. despolarizada · oído der. hiperpolarizada'
      : 'sin giro · ambos oídos en reposo'
  );
}

// ===================== SLIDE 15 · DIPOLO CARDÍACO Y EINTHOVEN =====================
export function drawEinhoven(params: SimParams, flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-eh') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  let th = +num('eh_th', params.eh_th) || 0;
  const playing = flags.ehPlaying || (window as any).__ehPlaying;
  const ehT = flags.ehT || (window as any).__ehT || 0;
  if (playing) {
    th = (ehT * 120) % 360;
  }
  const P = playing ? Math.abs(Math.sin(ehT * Math.PI * 2)) : 1;
  const cx = w * 0.28,
    cy = h * 0.26,
    R = 60;
  const pts = [
    { x: cx, y: cy - R },
    { x: cx + R * Math.cos((30 * Math.PI) / 180), y: cy + R * Math.sin((30 * Math.PI) / 180) },
    { x: cx - R * Math.cos((30 * Math.PI) / 180), y: cy + R * Math.sin((30 * Math.PI) / 180) },
  ];
  const RA = pts[2],
    LA = pts[0],
    LL = pts[1];
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  ctx.lineTo(pts[1].x, pts[1].y);
  ctx.lineTo(pts[2].x, pts[2].y);
  ctx.closePath();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  _txt(ctx, RA.x - 16, RA.y + 16, 'RA', { size: 10, align: 'center', color: C.muted });
  _txt(ctx, LA.x, LA.y - 12, 'LA', { size: 10, align: 'center', color: C.muted });
  _txt(ctx, LL.x + 12, LL.y + 16, 'LL', { size: 10, align: 'center', color: C.muted });
  const eI = [1, 0],
    eII = [Math.cos(Math.PI / 3), -Math.sin(Math.PI / 3)],
    eIII = [Math.cos((2 * Math.PI) / 3), -Math.sin((2 * Math.PI) / 3)];
  const leads: [string, number[], string][] = [
    ['I', eI, C.teal],
    ['II', eII, C.amber],
    ['III', eIII, C.blood],
  ];
  leads.forEach((r) => {
    const ex = cx + r[1][0] * 40,
      ey = cy + r[1][1] * 40;
    _line(ctx, cx, cy, ex, ey, r[2], 1, [4, 4]);
    _txt(ctx, ex, ey - 8, r[0], { size: 10, color: r[2], bold: true });
  });
  const rad = (th * Math.PI) / 180;
  const dx = Math.cos(rad) * 44,
    dy = Math.sin(rad) * 44;
  _arrow(ctx, cx, cy, cx + dx, cy + dy, C.ink, 2.5);
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = C.ink;
  ctx.fill();
  _txt(ctx, cx + dx + 8, cy + dy - 8, 'P', { size: 12, color: C.ink, bold: true });
  const VI = P * Math.cos(rad),
    VII = P * Math.cos(rad - Math.PI / 3),
    VIII = P * Math.cos(rad - (2 * Math.PI) / 3);
  const bx = w * 0.58,
    by = h - 34,
    bww = Math.min(w * 0.36, 160);
  _line(ctx, bx, by - 22, bx, by + 22, C.line, 1);
  leads.forEach((r, i) => {
    const val = [VI, VII, VIII][i];
    const yy = by - 6 - i * 26,
      v = clamp(val, -1, 1);
    _line(ctx, bx + 2, yy, bx + bww, yy, C.line, 0.5);
    _txt(ctx, bx - 6, yy, r[0] + ' ', { size: 10, align: 'right', color: r[2], bold: true });
    if (v >= 0) {
      _rect(ctx, bx + 4, yy - v * 38, bww - 6, v * 38, r[2], 2);
    } else {
      _rect(ctx, bx + 4, yy, bww - 6, -v * 38, r[2], 2);
    }
    _txt(ctx, bx + bww + 4, yy, 'V' + r[0] + ' = ' + espan(v, 1), { size: 9, color: r[2] });
  });
  _txt(ctx, bx + bww / 2, h - 10, 'proyección del dipolo sobre I · II · III', { size: 9, align: 'center', color: C.muted });
  out('eh_thv', Math.round(th) + '°');
  out('eh_out', 'θ = ' + Math.round(th) + '° · Vᵢ = ' + espan(VI, 1) + ' · Vᴵᴵ = ' + espan(VII, 1) + ' · Vᴵᴵᴵ = ' + espan(VIII, 1));
}

// ===================== SLIDE 16 · EL ECG NORMAL =====================
export function drawECG(params: SimParams, flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-ec') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const hr = +num('ec_hr', params.ec_hr) || 72,
    playing = flags.ecPlaying || (window as any).__ecPlaying;
  const ecT = flags.ecT || (window as any).__ecT || 0;
  const T = 60000 / hr;
  const beat = (t: number) => {
    const u = (t % T) / T;
    return (
      -0.05 +
      0.12 * _gauss(u, 0.12, 0.035) -
      0.22 * _gauss(u, 0.36, 0.02) +
      1.0 * _gauss(u, 0.4, 0.02) -
      0.15 * _gauss(u, 0.44, 0.02) +
      0.18 * _gauss(u, 0.62, 0.09)
    );
  };
  const x0 = 30,
    y0 = h - 36,
    yTop = 18;
  const yV = (v: number) => h * 0.52 - v * 34;
  const tEnd = 4000;
  for (let i = 0; i <= 40; i += 2) {
    const x = x0 + ((w - x0 - 10) * i) / 40;
    _line(ctx, x, yTop, x, y0, C.line, 0.5);
  }
  for (let j = 0; j <= 6; j++) {
    const y = yTop + ((y0 - yTop) * j) / 6;
    _line(ctx, x0, y, w - 10, y, C.line, 0.5);
  }
  const off = playing ? (ecT * 1000) % T : 0;
  ctx.beginPath();
  for (let px = 0; px <= w - x0 - 10; px++) {
    const t = (px / (w - x0 - 10)) * tEnd + off;
    const x = x0 + px,
      y = yV(beat(t));
    if (px === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.blood;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  _txt(ctx, x0 + (w - x0 - 10) * 0.115, yV(0.1) - 14, 'P', { size: 10, color: C.teal, align: 'center' });
  _txt(ctx, x0 + (w - x0 - 10) * 0.4, yV(1.0) + 14, 'QRS', { size: 10, color: C.teal, align: 'center' });
  _txt(ctx, x0 + (w - x0 - 10) * 0.62, yV(0.16) - 14, 'T', { size: 10, color: C.teal, align: 'center' });
  _txt(ctx, w - 14, y0 + 12, 'periodo = ' + espan(T / 1000, 2) + ' s · 25 mm/s', { size: 9, align: 'right', color: C.muted });
  out('ec_out', hr + ' lpm · periodo ' + espan(T, 0) + ' ms · P–QRS–T');
}

// ===================== SLIDE 17 · DESPOLARIZACIÓN DEL MIOCARDIO =====================
export function drawMyo(_params: SimParams, flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-dc') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const playing = flags.dcPlaying || (window as any).__dcPlaying;
  const dcT = flags.dcT || (window as any).__dcT || 0;
  const f = playing ? (dcT % 1.8) / 1.8 : 0.4;
  const fr = clamp(f, 0, 1);
  const mx0 = 40,
    mw = w - 80,
    my = h * 0.36,
    mh = 64;
  _rect(ctx, mx0, my - mh / 2, mw, mh, C.tealD, 6);
  _rect(ctx, mx0, my - mh / 2, Math.max(0, f * mw), mh, '#f5f1e4', 0);
  _rect(ctx, mx0 + f * mw, my - mh / 2, mw - f * mw, mh, '#cfc8b8', 6);
  _line(ctx, mx0 + f * mw, my - mh / 2, mx0 + f * mw, my + mh / 2, C.blood, 3);
  _txt(ctx, mx0 + f * mw, my - mh / 2 - 8, 'frente', { size: 9, align: 'center', color: C.blood });
  for (let i = 0; i < 6; i++) {
    _txt(ctx, mx0 + mw - (i + 0.5) * (mw / 6), my, '+  −', { size: 8, align: 'center', color: C.muted });
  }
  const sx0 = 40,
    sW = w - 80,
    sy0 = h - 24;
  const vf = (fx: number) => Math.exp(-Math.pow((fx - fr) / 0.18, 2)) * Math.sign(fr - fx + 0.001);
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const fx = i / 100;
    const x = sx0 + sW * fx,
      y = sy0 - vf(fx) * 32;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 2;
  ctx.stroke();
  const mx = sx0 + sW * fr,
    myy = sy0 - vf(fr) * 32;
  ctx.beginPath();
  ctx.arc(mx, myy, 4, 0, Math.PI * 2);
  ctx.fillStyle = C.blood;
  ctx.fill();
  _txt(ctx, sx0, 12, 'señal del electrodo: positiva al aproximarse, negativa al pasar', { size: 9, color: C.muted });
  out('dc_out', 'frente al ' + Math.round(f * 100) + ' % de la célula · señal ' + (fr < 0.5 ? 'positiva (aproxima)' : 'negativa (ha pasado)'));
}

// ===================== SLIDE 18 · ARRITMIAS E INFARTO =====================
export function drawInfarct(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-ar') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const k = +num('ar_sel', params.ar_sel) || 0;
  const SCEN: [number, number, string][] = [
    [72, 0, 'Normal · 72 lpm'],
    [150, 0, 'Taquicardia · 150 lpm'],
    [45, 0, 'Bradicardia · 45 lpm'],
    [72, 1, 'Infarto · ST elevado + Q'],
  ];
  const hr = SCEN[k][0],
    inf = SCEN[k][1],
    T = 60000 / hr;
  const beat = (t: number, infI: number) => {
    const u = (t % T) / T;
    const q = infI ? -0.5 * _gauss(u, 0.355, 0.025) : -0.22 * _gauss(u, 0.36, 0.02);
    const r = 1.0 * _gauss(u, 0.4, 0.02);
    const s = infI ? 0.3 * _gauss(u, 0.45, 0.03) : -0.15 * _gauss(u, 0.44, 0.02);
    const st = infI && u > 0.48 && u < 0.72 ? 0.45 * Math.sin((Math.PI * (u - 0.48)) / 0.24) : 0;
    return q + r + s + 0.18 * _gauss(u, 0.68, 0.08) + st;
  };
  const x0 = 30,
    y0 = h - 30,
    yTop = 20;
  const yV = (v: number) => h * 0.5 - v * 32;
  const tEnd = hr <= 50 ? 6000 : 2600;
  for (let i = 0; i <= 40; i += 2) {
    const x = x0 + ((w - x0 - 10) * i) / 40;
    _line(ctx, x, yTop, x, y0, C.line, 0.5);
  }
  for (let j = 0; j <= 6; j++) {
    const y = yTop + ((y0 - yTop) * j) / 6;
    _line(ctx, x0, y, w - 10, y, C.line, 0.5);
  }
  ctx.beginPath();
  for (let px = 0; px <= w - x0 - 10; px++) {
    const t = (px / (w - x0 - 10)) * tEnd;
    const x = x0 + px,
      y = yV(beat(t, inf));
    if (px === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = k === 3 ? C.amber : C.blood;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  if (k === 3) {
    _txt(ctx, w * 0.5, yV(0.5) - 14, 'ST elevado + Q patológica', { size: 10, align: 'center', color: C.amber, bold: true });
  }
  out('ar_out', SCEN[k][2]);
}

// ===================== SLIDE 19 · EL EEG Y SUS ONDAS =====================
export function drawEEG(params: SimParams, flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-eg') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const k = +num('eg_sel', params.eg_sel) || 0,
    playing = flags.egPlaying || (window as any).__egPlaying;
  const egT = flags.egT || (window as any).__egT || 0;
  const RHY: [string, number, number, string][] = [
    ['Alfa', 10, 40, C.teal],
    ['Beta', 18, 14, C.amber],
    ['Theta', 5, 60, C.tealD],
    ['Delta', 1.5, 100, C.blood],
  ];
  const f = RHY[k][1],
    A = RHY[k][2];
  const x0 = 30,
    y0 = h - 30,
    yTop = 20;
  const yV = (v: number) => h * 0.5 - v * 0.55;
  const off = playing ? egT * 2.4 : 0,
    tEnd = 2.4;
  ctx.beginPath();
  for (let px = 0; px <= w - x0 - 10; px++) {
    const t = (px / (w - x0 - 10)) * tEnd;
    const noise = 0.35 * Math.sin(37 * t) + 0.2 * Math.sin(61 * t + 1);
    const v = A * (0.75 * Math.sin(2 * Math.PI * f * t + off) + noise * 0.5);
    const x = x0 + px,
      y = yV(v);
    if (px === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = RHY[k][3];
  ctx.lineWidth = 1.5;
  ctx.stroke();
  _line(ctx, x0, yV(0), w - 10, yV(0), C.line, 1, [3, 3]);
  _txt(ctx, w - 14, y0 + 10, 'escala: ~' + espan(A, 0) + ' µV pico · ritmo ' + (f >= 8 ? 'rápido' : 'lento'), {
    size: 9,
    align: 'right',
    color: C.muted,
  });
  out('eg_out', RHY[k][0] + ' · ' + f + ' Hz · ~' + A + ' µV');
}

// ===================== SLIDE 20 · DESCARGAS ELÉCTRICAS =====================
export function drawShock(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-sh') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const V = +num('sh_v', params.sh_v) || 0,
    k = +num('sh_sel', params.sh_sel) || 0;
  const R = [5e5, 1e3, 500][k];
  const I = V / R;
  const x0 = 120,
    y0 = h - 36,
    yTop = 22;
  const yV = (a: number) => yTop + ((y0 - yTop) * (Math.log10(a) + 6)) / 8;
  const zones: [string, number, number, string][] = [
    ['sin peligro · umbral', 1e-6, 1e-3, '#e9e4d6'],
    ['cosquilleo → doloroso', 1e-3, 1e-2, '#f2e0b8'],
    ['no se puede soltar', 1e-2, 1e-1, '#f2c9c2'],
    ['fibrilación ventricular', 1e-1, 4, '#e0b7ad'],
    ['quemaduras · muerte', 4, 1e2, '#d8c4bb'],
  ];
  zones.forEach((z) => {
    const y1 = yV(z[1]),
      y2 = yV(z[2]);
    _rect(ctx, x0, Math.min(y1, y2), w - x0 - 24, Math.abs(y2 - y1), z[3], 0);
    _txt(ctx, x0 + 8, (y1 + y2) / 2, z[0], { size: 8.5, color: C.ink });
  });
  _line(ctx, x0, y0, x0, yTop, C.line, 1);
  [1e-6, 1e-4, 1e-2, 1, 1e2].forEach((v) => {
    const y = yV(v);
    _line(ctx, x0 - 6, y, x0, y, C.line, 1);
    _txt(ctx, x0 - 8, y, fmtA(v), { size: 9, align: 'right', color: C.muted });
  });
  _txt(ctx, x0, y0 + 16, 'I (amperios, log)', { size: 9, color: C.muted });
  const y = yV(clamp(I, 1e-6, 1e2));
  ctx.beginPath();
  ctx.arc(x0 + 44, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = C.blood;
  ctx.strokeStyle = C.paper;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fill();
  _txt(ctx, x0 + 58, y, 'I = ' + fmtA(I), { size: 11, bold: true, color: C.blood });
  _txt(ctx, 34, y0 + 16, '⚡', { size: 18, align: 'center' });
  ctx.beginPath();
  ctx.arc(34, y0 + 16, 16, 0, Math.PI * 2);
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  _txt(ctx, 34, y0 + 58, 'fuente de voltaje', { size: 8, align: 'center', color: C.muted });
  out('sh_vv', V + ' V');
  out(
    'sh_out',
    V +
      ' V / ' +
      fmtR(R) +
      ' = ' +
      fmtA(I) +
      ' · ' +
      (I >= 4
        ? '¡quemaduras graves y parálisis!'
        : I >= 0.1
        ? '¡fibrilación ventricular!'
        : I >= 0.01
        ? '¡no se puede soltar!'
        : I >= 0.001
        ? 'cosquilleo → doloroso'
        : 'baja corriente · umbral de percepción')
  );
}

// ===================== SLIDE 21 · CAMPOS BIOMAGNÉTICOS =====================
export function drawBioMag(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-bm') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const k = +num('bm_sel', params.bm_sel) || 0,
    R = +num('bm_r', params.bm_r) || 1;
  const B = [0.1, 1, 5, 10, 50, 5e7];
  const Baxon = ((4 * Math.PI * 1e-7 * 0.1) / (2 * Math.PI * (R * 1e-3) * 6.4e9 * 3.8e-4)) * 1e12;
  const NAMES = ['Campos evocados', 'MEG', 'MCG fetal', 'Miograma', 'MCG', 'Campo de la Tierra'];
  const yTop = 20,
    y0 = h - 46;
  const yV = (v: number) => yTop + ((y0 - yTop) * (8 - Math.log10(v))) / 10;
  _axisY12(ctx, 54, yTop, y0, ['0,01', '0,1', '1', '10', '100', '1k', '10k', '100k', '1M', '10M', '100M pT']);
  const bw = Math.min(40, (w - 150) / B.length);
  B.forEach((v, i) => {
    const x = 66 + i * (bw + 8),
      y = yV(v);
    _rect(ctx, x, y, bw - 4, y0 - y, i === k ? C.amber : C.teal, 3);
    _txt(ctx, x + bw / 2, y - 6, NAMES[i], { size: 8, align: 'center', color: C.muted });
    _txt(ctx, x + bw / 2, y0 + 14, shortT(v), { size: 9, align: 'center', color: i === k ? C.amber : C.ink, bold: i === k });
  });
  const cxx = w * 0.72,
    cy2 = yTop + 52;
  _txt(ctx, cxx, cy2 - 44, 'campo del axón ∝ 1/R', { size: 10, color: C.muted });
  _txt(ctx, cxx, cy2 - 28, 'B ≈ ' + espan(Baxon, 1) + ' pT a ' + espan(R, 1) + ' mm', { size: 12, bold: true, color: C.teal });
  ctx.beginPath();
  for (let i = 1; i <= 40; i++) {
    const rr = 0.5 + (i / 40) * 7.5,
      x = cxx + ((rr - 0.5) / 7.5) * 62,
      y = cy2 - 26 / rr;
    if (i === 1) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cxx + ((R - 0.5) / 7.5) * 62, cy2 - 26 / R, 4, 0, Math.PI * 2);
  ctx.fillStyle = C.blood;
  ctx.fill();
  _line(ctx, cxx, cy2, cxx + 64, cy2, C.line, 1);
  _txt(ctx, cxx + 64, cy2 + 6, 'R (mm)', { size: 8, color: C.muted });
  out('bm_rv', espan(R, 1) + ' mm');
  out('bm_out', NAMES[k] + ' · ' + shortT(B[k]) + ' pT · B del axón ≈ ' + espan(Baxon, 1) + ' pT @ ' + espan(R, 1) + ' mm');
}

// ===================== SLIDE 22 · SENTIDO MAGNÉTICO Y ONDAS EM =====================
export function drawEM(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-em') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const k = +num('em_sel', params.em_sel) || 0;
  const REG: [string, string, string, string][] = [
    ['Radio', '1 kHz–1 GHz', 'penetra todo el cuerpo', C.teal],
    ['Microondas', '2,45 GHz', 'absorción en agua (hornos)', C.amber],
    ['Infrarrojo', '300 GHz–400 THz', 'calor · casi opaco', C.blood],
    ['Visible', '400–800 THz', 'la vista · piel', C.tealD],
    ['UV', '10¹⁵ Hz', 'quemadura · mutaciones', C.blood],
    ['Rayos X', '10¹⁶–10¹⁹ Hz', 'penetrante · imagen', C.violet],
  ];
  const r = REG[k];
  const y0 = h * 0.28,
    bh = 44,
    bw = (w - 40) / REG.length;
  REG.forEach((reg, i) => {
    _rect(ctx, 20 + i * bw, y0, bw - 2, bh, reg[3], 3);
    _txt(ctx, 20 + i * bw + bw / 2, y0 + bh / 2, reg[0], { size: 10, align: 'center', color: C.paper, bold: i === k });
  });
  _txt(ctx, w / 2, y0 - 10, 'espectro electromagnético · frecuencia creciente →', { size: 10, align: 'center', color: C.muted });
  _txt(ctx, 20 + k * bw + bw / 2, y0 + bh + 14, '← ' + r[0] + ' · ' + r[1], { size: 10, align: 'center', color: r[3], bold: true });
  const cy = h * 0.72;
  _txt(ctx, w / 2, cy - 44, 'penetración en el cuerpo', { size: 10, align: 'center', color: C.muted });
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w * 0.22, cy - 8, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.22, cy + 2);
  ctx.lineTo(w * 0.22, cy + 32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.22, cy + 8);
  ctx.lineTo(w * 0.22 - 14, cy + 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.22, cy + 8);
  ctx.lineTo(w * 0.22 + 14, cy + 18);
  ctx.stroke();
  _txt(ctx, w * 0.22, cy + 46, 'cuerpo', { size: 9, align: 'center', color: C.muted });
  const depths = [1, 0.3, 0.5, 0.6, 0.3, 0.9],
    dp = depths[k];
  const ax = w * 0.5,
    aymax = cy + 34,
    aymin = cy - 26;
  _line(ctx, ax, aymin, ax, aymax, C.line, 1);
  const ay = aymin + (aymax - aymin) * (1 - dp);
  _rect(ctx, ax - 3, ay, (aymax - aymin) * dp, 5, r[3], 2);
  _txt(ctx, ax, ay - 8, Math.round(dp * 100) + ' %', { size: 9, align: 'center', color: r[3], bold: true });
  _txt(ctx, ax + 18, aymax - 30, 'profundidad', { size: 9, color: C.muted });
  _txt(ctx, ax, aymax + 14, r[2], { size: 10, align: 'center', color: C.ink });
  out('em_out', r[0] + ' · ' + r[1] + ' · ' + r[2]);
}

// ===================== SLIDE 23 · MAPA MENTAL =====================
export function drawMap12(params: SimParams, _flags: SimFlags, out: (id: string, text: string) => void): void {
  const cv = el('sim-mp') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  _bg(ctx, w, h);

  const k = +num('mp_sel', params.mp_sel) || 0;
  const STAGES: [string, string][] = [
    ['1 Recibir', '⚡'],
    ['2 Impulsar', '🧲'],
    ['3 Repartir', '🩸'],
    ['4 Guardar', '🧠'],
    ['5 Disparar', '🚀'],
    ['6 Sentir', '👂'],
    ['7 Leer', '❤️'],
    ['8 Medir', '🧭'],
    ['9 Proteger', '🛡️'],
  ];
  const cols = 3,
    bw = Math.min(94, (w - 40 - 2 * 16) / cols),
    bh = 54;
  const x0 = (w - (cols * bw + 2 * 16)) / 2,
    y0 = h * 0.5 - bh - 12;
  STAGES.forEach((s, i) => {
    const c = i % cols,
      r = Math.floor(i / cols);
    const x = x0 + c * (bw + 16),
      y = y0 + r * (bh + 16);
    const active = i === k;
    _rect(ctx, x, y, bw, bh, active ? C.teal : C.paper, 8);
    ctx.strokeStyle = active ? C.teal : C.line;
    ctx.lineWidth = active ? 2 : 1;
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(x, y, bw, bh, 8);
    } else {
      ctx.rect(x, y, bw, bh);
    }
    ctx.stroke();
    _txt(ctx, x + bw / 2, y + bh / 2 - 8, s[0], { size: 10, align: 'center', bold: active, color: active ? C.paper : C.ink });
    _txt(ctx, x + bw / 2, y + bh / 2 + 10, s[1], { size: 12, align: 'center' });
    if (c < cols - 1) {
      _arrow(ctx, x + bw, y + bh / 2, x + bw + 16, y + bh / 2, C.line, 1.5);
    } else if (r < 2) {
      _arrow(ctx, x + bw, y + bh / 2, x + bw + 16, y + bh / 2, C.line, 1.5);
      _arrow(ctx, w / 2, y + bh, w / 2, y + bh + 16, C.line, 1.5);
    }
  });
  _txt(ctx, w / 2, h - 8, 'del ion al diagnóstico: las 9 etapas del capítulo', { size: 9, align: 'center', color: C.muted });
  out('mp_out', 'Etapa ' + (k + 1) + ' · ' + STAGES[k][0]);
}

// ===================== DESPACHADOR DE REDIBUJO =====================
const fns: Record<number, (p: SimParams, f: SimFlags, out: (id: string, text: string) => void) => void> = {
  1: drawBio,
  2: drawCoulomb,
  3: drawOhm,
  4: drawSigma,
  5: drawResist,
  6: drawMemb,
  7: drawNernst,
  8: drawGoldman,
  9: drawAction,
  10: drawCable,
  11: drawVelo,
  12: drawDecay,
  13: drawHair,
  14: drawEquil,
  15: drawEinhoven,
  16: drawECG,
  17: drawMyo,
  18: drawInfarct,
  19: drawEEG,
  20: drawShock,
  21: drawBioMag,
  22: drawEM,
  23: drawMap12,
};

export function redrawSlide(
  n: number,
  _clock: number,
  params: SimParams,
  flags: SimFlags,
  out: (id: string, text: string) => void
): void {
  const fn = fns[n];
  if (fn) {
    fn(params, flags, out);
  }
}
