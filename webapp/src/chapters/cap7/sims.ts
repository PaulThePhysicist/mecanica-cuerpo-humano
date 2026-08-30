// ═══════════════════════════════════════════════════════════════
//   Capítulo 7 · Motor de simulaciones 2D y cálculos físicos (TypeScript)
//   "Presión de Fluidos, Flujo y Movimiento en Fluidos" — I. P. Herman
// ═══════════════════════════════════════════════════════════════

import * as AB from './ab';
import { espan } from './ab';

export interface ModuleDef {
  id: number;
  name: string;
  slides: number[];
  ico: string;
}

export const TOTAL = 23;

export const MODULES: ModuleDef[] = [
  { id: 0, name: 'Inicio',            slides: [0],           ico: '🏠' },
  { id: 1, name: 'Presión',           slides: [1, 2, 3],     ico: '🩸' },
  { id: 2, name: 'Leyes de fluidos',  slides: [4, 5, 6],     ico: '⚖️' },
  { id: 3, name: 'Bernoulli',         slides: [7, 8, 9],     ico: '🌊' },
  { id: 4, name: 'Poiseuille',        slides: [10, 11, 12],  ico: '🧪' },
  { id: 5, name: 'Compliancia',       slides: [13, 14],      ico: '🎈' },
  { id: 6, name: 'Arrastre',          slides: [15, 16],      ico: '🪂' },
  { id: 7, name: 'Difusión',          slides: [17, 18],      ico: '🫧' },
  { id: 8, name: 'Cuerpo en fluidos', slides: [19, 20, 21, 22], ico: '🏊' },
];

export interface SimParams {
  // S1
  mn_rho: number;
  mn_h: number;
  // S2
  ps_sel: string;
  // S3
  bp_p: number;
  // S4
  pa_mode: 'pascal' | 'arquimedes';
  pa_rho: number;
  // S5
  lc_r: number;
  lc_p: number;
  // S6
  ls_g: number;
  // S7
  ry_fl: string;
  ry_u: number;
  // S8
  ve_u: number;
  ve_a: number;
  // S9
  st_s: number;
  // S10
  vs_fl: number;
  vs_v: number;
  // S11
  po_r: number;
  po_e: number;
  po_p: number;
  // S12
  rs_r1: number;
  rs_r2: number;
  // S13
  cm_y: number;
  cm_p: number;
  // S14
  in_u: number;
  // S15
  dr_r: number;
  dr_u: number;
  // S16
  li_b: number;
  // S17
  df_d: number;
  // S18
  d2_x: number;
  // S20
  bl_v: number;
  // S21
  sw_h: number;
  sw_b: number;
  // S22
  ft_s: number;
  ft_f: number;
}

export const DEFAULT_PARAMS: SimParams = {
  mn_rho: 13600,
  mn_h: 40,
  ps_sel: 'all',
  bp_p: 160,
  pa_mode: 'pascal',
  pa_rho: 0.9,
  lc_r: 3,
  lc_p: 60,
  ls_g: 0.7,
  ry_fl: 'sangre',
  ry_u: 20,
  ve_u: 30,
  ve_a: 0.5,
  st_s: 60,
  vs_fl: 0.001,
  vs_v: 40,
  po_r: 2,
  po_e: 0.004,
  po_p: 60,
  rs_r1: 2,
  rs_r2: 1,
  cm_y: 0.6,
  cm_p: 60,
  in_u: 50,
  dr_r: 0.01,
  dr_u: 50,
  li_b: 8,
  df_d: 0.3,
  d2_x: 100,
  bl_v: 200,
  sw_h: 1.8,
  sw_b: 60,
  ft_s: 1,
  ft_f: 3,
};

export interface SimFlags {
  spPlaying: boolean;
  spT: number;
  ryPlaying: boolean;
  ryT: number;
  inPlaying: boolean;
  inT: number;
  dfPlaying: boolean;
  dfT: number;
  flPlaying: boolean;
  flT: number;
  swPlaying: boolean;
  swT: number;
  veT: number;
  stT: number;
}

export const DEFAULT_FLAGS: SimFlags = {
  spPlaying: false,
  spT: 0,
  ryPlaying: false,
  ryT: 0,
  inPlaying: false,
  inT: 0,
  dfPlaying: false,
  dfT: 0,
  flPlaying: false,
  flT: 0,
  swPlaying: false,
  swT: 0,
  veT: 0,
  stT: 0,
};

export type OutFn = (id: string, text: string) => void;

function getCanvas(id: string): HTMLCanvasElement | null {
  const cv = document.getElementById(id) as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return null;
  return cv;
}

/* ═══════════════════════════════════════════════════════════
   S1 · Manómetro de tubo en U (eq. 7.1)
   ═══════════════════════════════════════════════════════════ */
export function drawManometer(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-manometer');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const rho = params.mn_rho || 1000;
  const cm = Math.max(0, Math.min(120, params.mn_h ?? 40));
  out('mn_hv', espan(cm, 0) + ' cm');

  const hM = cm / 100;
  const P = rho * 9.8 * hM;
  const PmmHg = P / 133.3;

  // tubo en U estilizado
  const cx = w * 0.5;
  const base = h * 0.78;
  const tubeW = w * 0.22;
  const colW = w * 0.075;
  const xL = cx - tubeW / 2;
  const xR = cx + tubeW / 2;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(xL, base);
  ctx.lineTo(xL, h * 0.3);
  ctx.moveTo(xR, base);
  ctx.lineTo(xR, h * 0.3);
  ctx.moveTo(xL, base);
  ctx.lineTo(xR, base);
  ctx.stroke();

  // columna desplazada (derecha sube, izquierda baja)
  const k = (h * 0.42) / 120; // escala: 120 cm → 42% de alto
  const rise = Math.min(h * 0.4, cm * k);
  ctx.fillStyle = AB.PAL.teal;
  ctx.fillRect(xR - colW / 2, base - rise, colW, rise + 4);
  ctx.fillRect(xL - colW / 2, base - 4, colW, 4);

  // marca de referencia
  AB.dashed(ctx, cx - tubeW, base, cx + tubeW, base, { color: AB.PAL.ink3 });
  AB.text(ctx, 'ref', xR + colW / 2 + 6, base, { size: 7, color: AB.PAL.ink3, align: 'left' });

  // flecha de presión sobre la columna
  AB.arrow(ctx, xR + colW / 2 + 12, base - rise / 2, xR + colW / 2 + 12, base - rise - 16, {
    color: AB.PAL.blood,
    width: 2.5,
  });
  AB.text(ctx, 'P = ρgh', xR + colW / 2 + 20, base - rise - 18, {
    size: 8,
    weight: '700',
    color: AB.PAL.blood,
    align: 'left',
  });

  // resultados
  AB.text(ctx, 'P = ρ·g·h = ' + espan(P, 0) + ' Pa', w / 2, h * 0.2, { size: 11, weight: '700', color: AB.PAL.ink });
  AB.text(
    ctx,
    '= ' + espan(PmmHg, 1) + ' mmHg · ρ = ' + espan(rho, 0) + ' kg/m³ · g = 9,8 m/s²',
    w / 2,
    h * 0.3,
    { size: 8, color: AB.PAL.ink3 }
  );
  AB.text(ctx, 'P_ref + ρgh: cada 10 m de agua ≈ 1 atm ≈ 760 mmHg', w / 2, h * 0.92, {
    size: 7.5,
    color: AB.PAL.ink3,
  });

  out('mn_out', 'ρgh = ' + espan(P, 0) + ' Pa · ' + espan(PmmHg, 1) + ' mmHg');
}

/* ═══════════════════════════════════════════════════════════
   S2 · Mapa de presiones del cuerpo (Tabla 7.1, escala log)
   ═══════════════════════════════════════════════════════════ */
export function drawPressures(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-pressures');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const rows: [string, number, string][] = [
    ['Arterial sistólica', 120, AB.PAL.blood],
    ['Arterial diastólica', 80, AB.PAL.blood],
    ['Capilar', 30, AB.PAL.teal],
    ['Venosa', 5, AB.PAL.teal],
    ['Ocular', 20, AB.PAL.amber],
    ['LCR', 8, AB.PAL.amber],
    ['Vejiga', 20, AB.PAL.sagittal],
    ['Piernas (de pie)', 7600, AB.PAL.ink2],
    ['Intratorácica', -10, AB.PAL.ink3],
  ];

  const sel = params.ps_sel || 'all';
  // escala log de 1 a 10000
  const log1 = 4;
  const lx = w * 0.3;
  const lw = w * 0.62;
  const gy = h * 0.16;
  const gH = h * 0.6;
  const Y = (p: number) => {
    const l = p > 0 ? Math.log10(Math.max(1, p)) : 0;
    return gy + gH * (1 - l / log1);
  };

  // eje
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(lx, gy);
  ctx.lineTo(lx, gy + gH);
  ctx.lineTo(lx + lw, gy + gH);
  ctx.stroke();

  AB.text(ctx, 'mmHg (escala log)', lx, gy - 8, { size: 8, color: AB.PAL.ink3, align: 'left' });
  [1, 10, 100, 1000, 10000].forEach((v) => {
    const y = Y(v);
    AB.dashed(ctx, lx, y, lx + lw, y, { color: AB.PAL.line });
    AB.text(ctx, espan(v, 0), lx - 6, y, { size: 7, color: AB.PAL.ink3, align: 'right' });
  });

  const bw = Math.max(8, (lx + lw) / rows.length - 6);

  // barras
  rows.forEach((r, i) => {
    const x = lx + (i * lw) / rows.length;
    const y = r[1] > 0 ? Y(r[1]) : gy + gH;
    const bh = r[1] > 0 ? gy + gH - y : 14;
    const isSel =
      sel === 'all' ||
      sel === r[0].toLowerCase().split(' ')[0] ||
      (sel === 'pierna' && r[0].includes('Piernas')) ||
      (sel === 'lcr' && r[0].includes('LCR'));

    ctx.fillStyle = r[2] + (isSel ? '' : '44');
    ctx.fillRect(x + 3, y, bw, Math.max(1, bh));
    if (r[1] > 0) ctx.fillRect(x + 3, y, Math.max(2, bw), bh);
    else ctx.fillRect(x + 3, y, Math.max(2, bw), bh);
    ctx.fillStyle = r[2];
    ctx.fillRect(x + 3, y, bw, Math.max(2, bh));
    AB.text(ctx, isSel ? r[0] : r[0].slice(0, 4) + '…', x + bw / 2 + 3, gy + gH + 12, {
      size: isSel ? 7 : 6,
      weight: isSel ? '700' : '400',
      color: isSel ? AB.PAL.ink : AB.PAL.ink3,
    });
    if (isSel) {
      AB.text(ctx, r[1] > 0 ? espan(r[1], 0) + ' mmHg' : '-10 mmHg', x + bw / 2 + 3, y - 8, {
        size: 8,
        weight: '700',
        color: r[2],
      });
    }
  });

  AB.text(ctx, 'La presión cae a lo largo del árbol vascular: arterias → capilares → venas', w / 2, h * 0.9, {
    size: 8,
    color: AB.PAL.ink3,
  });

  const matched = rows.find((r) => (sel === 'pierna' ? r[0].includes('Piernas') : r[0].toLowerCase().includes(sel)));
  out('ps_out', sel === 'all' ? 'gradiente: 120 → 0 mmHg' : (matched ? matched[1] : '?') + ' mmHg');
}

/* ═══════════════════════════════════════════════════════════
   S3 · Esfigmomanómetro y sonidos de Korotkoff
   ═══════════════════════════════════════════════════════════ */
export function drawBp(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-bp');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const P = Math.max(0, Math.min(160, params.bp_p ?? 160));
  out('bp_pv', espan(P, 0) + ' mmHg');

  const SYS = 120;
  const DIA = 80;
  const phase =
    P > SYS ? 'ocluido — sin sonido' : P > DIA ? 'Korotkoff — golpes rítmicos' : 'flujo suave — sin sonido';

  // manómetro: arco con aguja
  const gx = w * 0.3;
  const gy = h * 0.36;
  const R = Math.min(54, h * 0.26);
  const a0 = Math.PI * 0.75;
  const a1 = Math.PI * 2.25;

  ctx.strokeStyle = AB.PAL.paper;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(gx, gy, R, a0, a1);
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(gx, gy, R, a0, a1);
  ctx.stroke();

  [SYS, DIA].forEach((v, i) => {
    const a = a0 + ((a1 - a0) * v) / 200;
    const col = i ? AB.PAL.amber : AB.PAL.blood;
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(gx + Math.cos(a) * (R - 7), gy + Math.sin(a) * (R - 7));
    ctx.lineTo(gx + Math.cos(a) * (R + 4), gy + Math.sin(a) * (R + 4));
    ctx.stroke();
    AB.text(ctx, v + (i ? ' diast' : ' sist'), gx + Math.cos(a) * (R + 12), gy + Math.sin(a) * (R + 12), {
      size: 7,
      weight: '700',
      color: col,
    });
  });

  const aP = a0 + ((a1 - a0) * Math.min(P, 200)) / 200;
  AB.arrow(ctx, gx, gy, gx + Math.cos(aP) * R, gy + Math.sin(aP) * R, { color: AB.PAL.teal, width: 2.6, head: 9 });
  AB.text(ctx, 'manguito', gx, gy - R - 16, { size: 8, weight: '700', color: AB.PAL.teal });

  // brazo + manguito
  const ax = w * 0.06;
  const ay = h * 0.72;
  const alen = w * 0.38;
  const aw = 20;
  AB.limbSkin(ctx, ax, ay, ax + alen, ay, aw);
  const cuffX = ax + alen * 0.55;
  ctx.fillStyle = P > DIA ? AB.PAL.blood : AB.PAL.teal;
  ctx.fillRect(cuffX - 6, ay - aw / 2 - 4, 14, aw + 8);
  AB.text(ctx, 'manguito', cuffX, ay - aw / 2 - 12, { size: 7, color: AB.PAL.ink3 });

  // arteria debajo: flujo
  const ay2 = h * 0.88;
  const lx0 = ax;
  const lx1 = ax + alen;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(lx0, ay2);
  ctx.lineTo(lx1, ay2);
  ctx.stroke();

  if (phase === 'Korotkoff — golpes rítmicos') {
    const p = (Date.now() % 600) / 600;
    for (let i = 0; i < 8; i++) {
      const t = (i / 8 + p) % 1;
      ctx.strokeStyle = t < 0.12 ? AB.PAL.blood : AB.PAL.ink3;
      ctx.lineWidth = t < 0.12 ? 5 : 2.5;
      const x = lx0 + t * (lx1 - lx0);
      ctx.beginPath();
      ctx.moveTo(x - 8, ay2);
      ctx.lineTo(x + 8, ay2);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = AB.PAL.tealLight;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx0, ay2);
    ctx.lineTo(lx1, ay2);
    ctx.stroke();
  }

  AB.text(ctx, 'arteria braquial', (lx0 + lx1) / 2, ay2 + 12, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, phase, w / 2, h * 0.56, {
    size: 11,
    weight: '700',
    color: phase === 'Korotkoff — golpes rítmicos' ? AB.PAL.blood : AB.PAL.teal,
  });
  AB.text(ctx, '1er golpe = sistólica · último golpe = diastólica', w / 2, h * 0.62, { size: 8, color: AB.PAL.ink3 });

  out('bp_out', 'sistólica 120 · diastólica 80 · ' + phase);
}

/* ═══════════════════════════════════════════════════════════
   S4 · Pascal y Arquímedes
   ═══════════════════════════════════════════════════════════ */
export function drawPascal(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-pascal');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const mode = params.pa_mode || 'pascal';
  const rho = Math.max(0.6, Math.min(1.3, params.pa_rho ?? 0.9));
  out('pa_rv', espan(rho, 2));

  if (mode === 'pascal') {
    // recipiente cerrado
    const rx = w * 0.2;
    const ry = h * 0.26;
    const rw = w * 0.6;
    const rh = h * 0.4;
    ctx.strokeStyle = AB.PAL.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.fillStyle = 'rgba(13,110,100,.12)';
    ctx.fillRect(rx, ry, rw, rh);

    // émbolo
    ctx.fillStyle = AB.PAL.ink2;
    ctx.fillRect(rx, ry - 10, rw, 12);
    AB.arrow(ctx, rx + rw / 2, ry - 26, rx + rw / 2, ry - 8, { color: AB.PAL.blood, width: 3 });
    AB.text(ctx, 'F aplicada', rx + rw / 2, ry - 34, { size: 8, weight: '700', color: AB.PAL.blood });

    // transmisión: flechas iguales en paredes
    AB.arrow(ctx, rx - 20, ry + rh / 2, rx - 4, ry + rh / 2, { color: AB.PAL.teal, width: 2.4 });
    AB.arrow(ctx, rx + rw + 4, ry + rh / 2, rx + rw + 20, ry + rh / 2, { color: AB.PAL.teal, width: 2.4 });
    AB.arrow(ctx, rx + rw / 2, ry + rh + 4, rx + rw / 2, ry + rh + 22, { color: AB.PAL.teal, width: 2.4 });
    AB.arrow(ctx, rx + rw / 2 - 40, ry + rh + 4, rx + rw / 2 - 40, ry + rh + 22, { color: AB.PAL.teal, width: 2.4 });
    AB.arrow(ctx, rx + rw / 2 + 40, ry + rh + 4, rx + rw / 2 + 40, ry + rh + 22, { color: AB.PAL.teal, width: 2.4 });

    AB.text(ctx, 'ΔP igual en todos los puntos', w / 2, ry + rh + 34, { size: 9, weight: '700', color: AB.PAL.teal });
    AB.text(ctx, 'Principio de Pascal: la presión se transmite íntegra al fluido confinado', w / 2, h * 0.92, {
      size: 7.5,
      color: AB.PAL.ink3,
    });
    out('pa_out', 'transmisión íntegra de ΔP');
    return;
  }

  // Arquímedes: tanque con cuerpo
  const tx = w * 0.12;
  const tw = w * 0.76;
  const water = h * 0.24;
  const surf = h * 0.42;
  const bottom = h * 0.82;

  ctx.fillStyle = 'rgba(45,125,79,.16)';
  ctx.fillRect(tx, surf, tw, bottom - surf);
  ctx.strokeStyle = AB.PAL.ink;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(tx, water, tw, bottom - water);

  // superficie ondulada
  ctx.strokeStyle = AB.PAL.coronal || '#2d7d4f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = tx; x <= tx + tw; x += 4) {
    const y = surf + Math.sin(x * 0.1) * 2.5;
    if (x === tx) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // cuerpo
  const cw = w * 0.16;
  const ch = h * 0.3;
  const floatOK = rho < 1;
  const cx2 = tx + tw / 2;
  const cyTop = floatOK ? surf - ch : surf + (bottom - surf - ch) / 2;

  ctx.fillStyle = AB.PAL.amber;
  ctx.strokeStyle = AB.PAL.amberDeep || '#7c4900';
  ctx.lineWidth = 2;
  ctx.fillRect(cx2 - cw / 2, cyTop, cw, ch);
  ctx.strokeRect(cx2 - cw / 2, cyTop, cw, ch);
  AB.text(ctx, 'ρ_cuerpo = ' + espan(rho, 2), cx2, cyTop + ch / 2, { size: 8, weight: '700', color: AB.PAL.paper });

  // empuje y peso
  const E = rho * 0.62;
  const W = rho * 0.62;
  AB.arrow(ctx, cx2 + cw / 2 + 16, cyTop + ch, cx2 + cw / 2 + 16, cyTop + ch - E * 90, {
    color: AB.PAL.teal,
    width: 3,
  });
  AB.text(ctx, 'E', cx2 + cw / 2 + 16, cyTop + ch - E * 90 - 12, { size: 8, weight: '700', color: AB.PAL.teal });
  AB.arrow(ctx, cx2 - cw / 2 - 16, cyTop, cx2 - cw / 2 - 16, cyTop + W * 90, { color: AB.PAL.blood, width: 3 });
  AB.text(ctx, 'P', cx2 - cw / 2 - 16, cyTop + W * 90 + 12, { size: 8, weight: '700', color: AB.PAL.blood });

  AB.text(ctx, floatOK ? 'flota — densidad < agua (1,0)' : 'se hunde — densidad ≥ agua', w / 2, h * 0.9, {
    size: 10,
    weight: '700',
    color: floatOK ? AB.PAL.teal : AB.PAL.blood,
  });
  AB.text(ctx, 'grasa 0,8 flota · músculo 1,0 · hueso 1,5–2,0 se hunde', w / 2, h * 0.965, {
    size: 7,
    color: AB.PAL.ink3,
  });
  out('pa_out', floatOK ? 'E = ρ_agua·g·V > P · flota' : 'E < P · se hunde');
}

/* ═══════════════════════════════════════════════════════════
   S5 · Ley de Laplace: cilindro (T = ΔP·R)
   ═══════════════════════════════════════════════════════════ */
export function drawLaplaceCyl(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-laplace-cyl');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const R = Math.max(0.5, Math.min(10, params.lc_r ?? 3));
  out('lc_rv', espan(R, 1));
  const dP = Math.max(10, Math.min(120, params.lc_p ?? 60));
  out('lc_pv', espan(dP, 0));

  const T = R * dP;
  const cx = w * 0.5;
  const cy = h * 0.44;
  const Rmax = 10;
  const rpx = Math.min(64, Math.max(16, (R / Rmax) * (h * 0.22)));
  const wall = Math.min(34, 4 + (T / 1200) * (h * 0.24));

  // pared (anillo)
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(cx, cy, rpx + wall, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#8c1f16';
  ctx.beginPath();
  ctx.arc(cx, cy, rpx + wall, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = AB.PAL.paper;
  ctx.beginPath();
  ctx.arc(cx, cy, rpx, 0, Math.PI * 2);
  ctx.fill();

  // presión interna
  ctx.fillStyle = 'rgba(169,42,30,.10)';
  ctx.beginPath();
  ctx.arc(cx, cy, rpx, 0, Math.PI * 2);
  ctx.fill();

  // flechas de presión hacia fuera
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    AB.arrow(ctx, cx + Math.cos(a) * rpx * 0.55, cy + Math.sin(a) * rpx * 0.55, cx + Math.cos(a) * rpx, cy + Math.sin(a) * rpx, {
      color: AB.PAL.blood,
      width: 2.6,
      head: 8,
    });
  }

  // flechas de tensión en la pared
  ctx.strokeStyle = AB.PAL.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - rpx - wall - 14);
  ctx.lineTo(cx + 6, cy - rpx - wall - 14);
  ctx.stroke();

  AB.arrow(ctx, cx - 20, cy - rpx - wall - 14, cx - 8, cy - rpx - wall - 14, { color: AB.PAL.ink, width: 2.4 });
  AB.arrow(ctx, cx + 8, cy - rpx - wall - 14, cx + 20, cy - rpx - wall - 14, { color: AB.PAL.ink, width: 2.4 });
  AB.text(ctx, 'T = ΔP·R', cx, cy - rpx - wall - 26, { size: 9, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, 'ΔP = ' + espan(dP, 0), cx + 14, cy, { size: 8, weight: '700', color: AB.PAL.blood, align: 'left' });
  AB.text(ctx, 'R = ' + espan(R, 1), cx + rpx + 10, cy - 14, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'T = ΔP·R = ' + espan(T, 0), w / 2, h * 0.78, { size: 12, weight: '700', color: AB.PAL.blood });
  AB.text(ctx, 'a mayor radio, mayor tensión para la misma presión → el peligro del aneurisma', w / 2, h * 0.88, {
    size: 8,
    color: AB.PAL.ink3,
  });

  out('lc_out', 'T = ' + espan(T, 0) + ' (ΔP·R)');
}

/* ═══════════════════════════════════════════════════════════
   S6 · Ley de Laplace: esfera — burbujas conectadas
   ═══════════════════════════════════════════════════════════ */
export function drawLaplaceSphere(params: SimParams, flags: SimFlags, out: OutFn): void {
  const cv = getCanvas('sim-laplace-sphere');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const g = Math.max(0.1, Math.min(1.0, params.ls_g ?? 0.7));
  out('ls_gv', espan(g, 2));

  const t = flags.spT || 0;
  const R1s = 0.5;
  const R2s = 0.9;
  const drift = g > 0.45 ? Math.min(0.34, t * 0.5) : Math.min(0.06, t * 0.08);
  const R1 = Math.max(0.16, R1s - drift);
  const R2 = Math.min(1.35, R2s + drift * 0.5);
  const dP1 = (2 * g) / R1;
  const dP2 = (2 * g) / R2;
  const stable = g <= 0.45;

  const cx1 = w * 0.28;
  const cx2 = w * 0.72;
  const cy = h * 0.42;
  const s1 = Math.min(70, Math.max(16, R1 * 120));
  const s2 = Math.min(80, Math.max(20, R2 * 95));

  // tubo conector
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx1 + s1, cy);
  ctx.lineTo(cx2 - s2, cy);
  ctx.stroke();

  // burbujas
  [
    [cx1, cy, s1, dP1],
    [cx2, cy, s2, dP2],
  ].forEach((b, i) => {
    const [bx, by, br, dp] = b;
    ctx.strokeStyle = i ? AB.PAL.amber : AB.PAL.teal;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = i ? 'rgba(154,91,0,.10)' : 'rgba(13,110,100,.10)';
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();

    // flecha de presión interna
    AB.arrow(ctx, bx, by, bx, by + br * 0.8, { color: i ? AB.PAL.amber : AB.PAL.teal, width: 2.2 });
    AB.text(ctx, 'ΔP=' + espan(dp, 2), bx, by + br + 12, {
      size: 7.5,
      weight: '700',
      color: i ? AB.PAL.amber : AB.PAL.teal,
    });
    AB.text(ctx, i ? 'grande' : 'pequeña', bx, by - br - 8, { size: 7.5, color: AB.PAL.ink3 });
  });

  // resultado
  const msg = stable
    ? 'surfactante: ΔP₁ ≈ ΔP₂ → los alvéolos coexisten'
    : 'sin surfactante: ΔP₁ > ΔP₂ → el pequeño se vacía en el grande';
  AB.text(ctx, msg, w / 2, h * 0.74, { size: 10, weight: '700', color: stable ? AB.PAL.teal : AB.PAL.blood });
  AB.text(ctx, 'γ = ' + espan(g, 2) + ' (agua 0,7 · surfactante 0,1)', w / 2, h * 0.84, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, 'alvéolos · vejiga · estómago como esferas', w / 2, h * 0.94, { size: 7.5, color: AB.PAL.ink3 });

  out('ls_out', stable ? 'ΔP₁ ≈ ΔP₂ · estable (γ baja)' : 'ΔP₁ > ΔP₂ · colapso del pequeño');
}

/* ═══════════════════════════════════════════════════════════
   S7 · Reynolds: laminar ↔ turbulento
   ═══════════════════════════════════════════════════════════ */
export function drawReynolds(params: SimParams, flags: SimFlags, out: OutFn): void {
  const cv = getCanvas('sim-reynolds');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const fl = params.ry_fl || 'sangre';
  const eta = fl === 'agua' ? 0.001 : fl === 'aire' ? 0.000018 : 0.004;
  const rho = fl === 'aire' ? 1.2 : 1060;
  const u = Math.max(0, Math.min(100, params.ry_u ?? 20));
  out('ry_uv', espan(u, 0) + ' cm/s');

  const d = 0.01; // 1 cm
  const Re = (rho * (u / 100) * d) / eta;
  const turb = Re > 2000;
  const ty = h * 0.34;
  const th = h * 0.3;
  const tx0 = w * 0.1;
  const tx1 = w * 0.9;

  // tubo
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tx0, ty);
  ctx.lineTo(tx1, ty);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tx0, ty + th);
  ctx.lineTo(tx1, ty + th);
  ctx.stroke();

  AB.text(ctx, 'tubo · d = 1 cm', (tx0 + tx1) / 2, ty + th + 14, { size: 7.5, color: AB.PAL.ink3 });

  const t = flags.ryT || 0;
  const lines = turb ? 5 : 6;
  for (let li = 0; li < lines; li++) {
    const yy = ty + (th * (li + 1)) / (lines + 1);
    if (!turb) {
      ctx.strokeStyle = 'rgba(13,110,100,.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = tx0; x <= tx1; x += 6) {
        const px = tx0 + ((x - tx0 + t * (u / 100) * 120) % (tx1 - tx0));
        const y = yy + Math.sin(px * 0.06) * 1.5;
        if (x === tx0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
    } else {
      // vórtices
      for (let i = 0; i < 6; i++) {
        const x = tx0 + (((i * 0.16 + t * 0.5) % 1.0) * (tx1 - tx0));
        const rr = 5 + (i % 3) * 3;
        ctx.strokeStyle = 'rgba(169,42,30,.5)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, yy, rr, t * 6 + i, t * 6 + i + Math.PI * 0.9);
        ctx.stroke();
      }
    }
  }

  AB.text(ctx, 'Re = ρud/η', w * 0.14, ty - 16, { size: 9, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, 'Re = ' + espan(Re, 0), w * 0.86, ty - 16, {
    size: 10,
    weight: '700',
    color: turb ? AB.PAL.blood : AB.PAL.teal,
  });
  AB.text(ctx, turb ? 'turbulento — Re > 2000' : 'laminar — Re < 2000', w / 2, h * 0.78, {
    size: 11,
    weight: '700',
    color: turb ? AB.PAL.blood : AB.PAL.teal,
  });
  AB.text(ctx, fl + ': η = ' + eta + ' Pa·s · transición 1200–2500 · los soplos = turbulencia', w / 2, h * 0.88, {
    size: 8,
    color: AB.PAL.ink3,
  });

  out('ry_out', 'Re = ' + espan(Re, 0) + ' · ' + (turb ? 'turbulento' : 'laminar'));
}

/* ═══════════════════════════════════════════════════════════
   S8 · Continuidad y Bernoulli — tubo de Venturi
   ═══════════════════════════════════════════════════════════ */
export function drawVenturi(params: SimParams, flags: SimFlags, out: OutFn): void {
  const cv = getCanvas('sim-venturi');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const u1 = Math.max(5, Math.min(80, params.ve_u ?? 30));
  out('ve_uv', espan(u1, 0) + ' cm/s');
  const a = Math.max(0.2, Math.min(1, params.ve_a ?? 0.5));
  out('ve_av', Math.round(a * 100) + ' %');

  const u2 = u1 / a;
  const rho = 1060;
  const dP = 0.5 * rho * ((u2 / 100) ** 2 - (u1 / 100) ** 2); // Pa

  // tubo con garganta
  const yT = h * 0.3;
  const th = h * 0.18;
  const wf = w * 0.72;
  const x0 = w * 0.14;
  const seg = x0 + wf * 0.5;
  const h1 = th;
  const h2 = th * a;

  ctx.fillStyle = 'rgba(13,110,100,.14)';
  ctx.beginPath();
  ctx.moveTo(x0, yT - h1 / 2);
  ctx.lineTo(x0, yT + h1 / 2);
  ctx.lineTo(seg - h2 / 2, yT + h2 / 2);
  ctx.lineTo(seg - h2 / 2, yT - h2 / 2);
  ctx.lineTo(seg + h2 / 2, yT - h2 / 2);
  ctx.lineTo(seg + h2 / 2, yT + h2 / 2);
  ctx.lineTo(x0 + wf, yT + h1 / 2);
  ctx.lineTo(x0 + wf, yT - h1 / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // partículas (animación continua)
  const t = flags.veT || 0;
  for (let i = 0; i < 14; i++) {
    const phase = (i / 14 + t * 0.8) % 1;
    const x = x0 + phase * wf;
    const inGap = x > seg - h2 / 2 && x < seg + h2 / 2;
    const sp = inGap ? u2 : u1;
    const px = x + (((t * 300 * (sp / 30)) % 40) - 20);
    const yy = inGap ? yT + Math.sin(phase * 40) * h2 * 0.15 : yT + Math.sin(phase * 40) * h1 * 0.15;
    ctx.fillStyle = AB.PAL.teal;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(px, yy, 2.6, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  AB.text(ctx, 'u₁ = ' + espan(u1, 0), x0, yT - h1 / 2 - 14, { size: 8, color: AB.PAL.teal });
  AB.text(ctx, 'u₂ = ' + espan(u2, 0), seg, yT - h2 / 2 - 14, { size: 8, weight: '700', color: AB.PAL.blood });

  // línea de presión (Bernoulli)
  const py = h * 0.66;
  const pA = h * 0.82;
  AB.dashed(ctx, x0, py, x0 + wf, py, { color: AB.PAL.line });
  AB.text(ctx, 'P (presión)', x0, py - 10, { size: 7.5, color: AB.PAL.ink3, align: 'left' });

  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let x = x0; x <= x0 + wf; x += 4) {
    const inGap = x > seg - h2 / 2 && x < seg + h2 / 2;
    const sp = inGap ? u2 : u1;
    const dip = (0.5 * rho * ((sp / 100) ** 2 - (u1 / 100) ** 2)) / 60000;
    const y = py + (pA - py) * (0.15 + dip);
    if (x === x0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  AB.text(ctx, 'P + ½ρu² = const → la presión cae donde acelera', w / 2, h * 0.94, { size: 8, color: AB.PAL.ink3 });

  out('ve_out', 'u₂ = ' + espan(u2, 0) + ' cm/s · ΔP ≈ ' + espan(dP, 0) + ' Pa');
}

/* ═══════════════════════════════════════════════════════════
   S9 · Estenosis — el mismo Venturi, en un vaso
   ═══════════════════════════════════════════════════════════ */
export function drawStenosis(params: SimParams, flags: SimFlags, out: OutFn): void {
  const cv = getCanvas('sim-stenosis');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const S = Math.max(0, Math.min(90, params.st_s ?? 60));
  out('st_sv', espan(S, 0) + ' %');

  const a = Math.max(0.1, 1 - S / 100); // fracción de área restante
  const u1 = 20;
  const u2 = u1 / a;
  const yT = h * 0.3;
  const th = h * 0.16;
  const wf = w * 0.72;
  const x0 = w * 0.14;
  const seg = x0 + wf * 0.55;
  const h1 = th;
  const h2 = Math.max(4, th * a);

  // vaso
  ctx.fillStyle = 'rgba(13,110,100,.12)';
  ctx.beginPath();
  ctx.moveTo(x0, yT - h1 / 2);
  ctx.lineTo(x0, yT + h1 / 2);
  ctx.lineTo(seg - h2 / 2, yT + h2 / 2);
  ctx.lineTo(seg - h2 / 2, yT - h2 / 2);
  ctx.lineTo(seg + h2 / 2, yT - h2 / 2);
  ctx.lineTo(seg + h2 / 2, yT + h2 / 2);
  ctx.lineTo(x0 + wf, yT + h1 / 2);
  ctx.lineTo(x0 + wf, yT - h1 / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // placa
  ctx.fillStyle = AB.PAL.amber;
  ctx.beginPath();
  ctx.ellipse(seg, yT - h1 / 2, Math.max(3, h2 * 0.9), 9, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(seg, yT + h1 / 2, Math.max(3, h2 * 0.9), 9, 0, 0, Math.PI);
  ctx.fill();
  AB.text(ctx, 'placa', seg + 10, yT - h1 / 2 - 14, { size: 7, color: AB.PAL.amber });

  // partículas
  const t = flags.stT || 0;
  for (let i = 0; i < 12; i++) {
    const phase = (i / 12 + t * 0.7) % 1;
    const x = x0 + phase * wf;
    const inGap = x > seg - h2 / 2 && x < seg + h2 / 2;
    ctx.fillStyle = inGap ? AB.PAL.blood : AB.PAL.teal;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(x, yT + Math.sin(phase * 40) * (inGap ? h2 * 0.12 : h1 * 0.15), 2.6, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  AB.text(ctx, 'u₁=' + espan(u1, 0), x0, yT - h1 / 2 - 14, { size: 8, color: AB.PAL.teal });
  AB.text(ctx, 'u₂=' + espan(u2, 0), seg, yT - h2 / 2 - 14, { size: 8, weight: '700', color: AB.PAL.blood });

  // presión con Bernoulli, cayendo en la estenosis
  const py = h * 0.6;
  const pA = h * 0.8;
  AB.dashed(ctx, x0, py, x0 + wf, py, { color: AB.PAL.line });

  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let x = x0; x <= x0 + wf; x += 4) {
    const inGap = x > seg - h2 / 2 && x < seg + h2 / 2;
    const sp = inGap ? u2 : u1;
    const dip = (0.5 * 1060 * ((sp / 100) ** 2 - (u1 / 100) ** 2)) / 40000;
    const y = py + (pA - py) * (0.08 + dip);
    if (x === x0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // riesgo de colapso
  const dP0 = 0.5 * 1060 * ((u2 / 100) ** 2 - (u1 / 100) ** 2);
  const collapse = dP0 > 130;
  AB.text(
    ctx,
    collapse ? '¡la presión cae por debajo de la externa — el vaso puede colapsar!' : 'la presión local cae en la estenosis',
    w / 2,
    h * 0.9,
    { size: 9.5, weight: '700', color: collapse ? AB.PAL.blood : AB.PAL.teal }
  );

  out('st_out', 'u₂ = ' + espan(u2, 0) + ' cm/s · ' + (collapse ? 'riesgo de colapso' : 'caída local de presión'));
}

/* ═══════════════════════════════════════════════════════════
   S10 · Viscosidad: dos placas (ley de Newton)
   ═══════════════════════════════════════════════════════════ */
export function drawViscosity(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-viscosity');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const eta = Math.max(1e-5, Math.min(0.4, Number(params.vs_fl) || 0.001));
  const v = Math.max(0, Math.min(100, params.vs_v ?? 40));
  out('vs_vv', espan(v, 0));

  const gap = h * 0.42;
  const y0 = h * 0.24;

  // placas
  ctx.fillStyle = AB.PAL.ink2;
  ctx.fillRect(w * 0.1, y0 - 7, w * 0.8, 7);
  ctx.fillRect(w * 0.1, y0 + gap, w * 0.8, 7);
  AB.text(ctx, 'placa fija', w * 0.5, y0 + gap + 16, { size: 7.5, color: AB.PAL.ink3 });
  AB.text(ctx, 'placa móvil', w * 0.5, y0 - 14, { size: 7.5, color: AB.PAL.ink3 });

  // perfil de velocidad: flechas crecientes con altura
  const tau = (eta * v) / 100;
  for (let i = 1; i <= 9; i++) {
    const yy = y0 + (gap * i) / 10;
    const sp = (v / 100) * (i / 10);
    AB.arrow(ctx, w * 0.16, yy, w * 0.16 + Math.max(4, sp * 90), yy, { color: AB.PAL.teal, width: 1.8, head: 5 });
  }

  AB.text(ctx, 'v(y) = v·y/gap', w * 0.16, y0 + gap + 34, { size: 8, weight: '700', color: AB.PAL.teal, align: 'left' });
  AB.text(ctx, 'τ = η·dv/dy = η·v/y = ' + espan(tau, 4) + ' Pa', w / 2, h * 0.84, {
    size: 10,
    weight: '700',
    color: AB.PAL.ink,
  });
  AB.text(ctx, 'η = ' + espan(eta, 6) + ' Pa·s · newtoniano: perfil lineal', w / 2, h * 0.92, {
    size: 8,
    color: AB.PAL.ink3,
  });

  out('vs_out', 'τ = ' + espan(tau, 4) + ' Pa');
}

/* ═══════════════════════════════════════════════════════════
   S11 · Poiseuille: perfil parabólico y R⁴
   ═══════════════════════════════════════════════════════════ */
export function drawPoiseuille(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-poiseuille');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const R = Math.max(0.5, Math.min(5, params.po_r ?? 2));
  out('po_rv', espan(R, 1));
  const eta = Math.max(0.001, Math.min(0.006, params.po_e ?? 0.004));
  out('po_ev', espan(eta, 3));
  const dP = Math.max(10, Math.min(120, params.po_p ?? 60));
  out('po_pv', espan(dP, 0));

  // velocidad media modelo: u = 50 cm/s en el default
  const u = 50 * (R / 2) * (R / 2) * (dP / 60) * (0.004 / eta);
  const vmax = 2 * u;
  const cx = w * 0.3;
  const cy = h * 0.42;
  const rad = Math.min(54, h * 0.26) * (R / 2);

  // tubo (corte transversal)
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI * 2);
  ctx.stroke();

  // perfil parabólico
  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let i = 0; i <= 30; i++) {
    const r = rad * (1 - i / 30);
    const vr = vmax * (1 - (r / rad) * (r / rad));
    const xp = cx - r;
    const yp = cy - vr;
    if (i === 0) ctx.moveTo(xp, yp);
    else ctx.lineTo(xp, yp);
  }
  for (let i = 30; i <= 60; i++) {
    const r = rad * (1 - (60 - i) / 30);
    const vr = vmax * (1 - (r / rad) * (r / rad));
    const xp = cx + r;
    const yp = cy - vr;
    ctx.lineTo(xp, yp);
  }
  ctx.stroke();

  // flechas de velocidad dentro
  for (let i = -4; i <= 4; i++) {
    const r = rad * (Math.abs(i) / 5);
    const vr = Math.max(0, vmax * (1 - (r / rad) * (r / rad)));
    const y = cy - r * (i < 0 ? 1 : -1);
    AB.arrow(ctx, cx - (i < 0 ? -1 : 1) * (vr / 2 + 4), y, cx + (i < 0 ? 1 : -1) * (vr / 2 + 4), y, {
      color: AB.PAL.teal,
      width: 2.4,
      head: 6,
    });
  }

  AB.text(ctx, 'v(r) = 2u(1 − r²/R²)', cx, cy - rad - 16, { size: 9, weight: '700', color: AB.PAL.blood });

  // Q relativo
  const Qrel = (Math.pow(R, 4) * dP) / eta;
  AB.text(ctx, 'Q ∝ R⁴·ΔP/η', w * 0.72, h * 0.3, { size: 9, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, 'Q_rel = ' + espan(Qrel, 0), w * 0.72, h * 0.4, { size: 11, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, 'u = R²ΔP/8ηL', w * 0.72, h * 0.52, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, 'R a la mitad → Q a 1/16', w * 0.72, h * 0.62, { size: 8, weight: '700', color: AB.PAL.blood });
  AB.text(ctx, 'el radio manda: vasodilatación y vasoconstricción regulan el flujo', w / 2, h * 0.92, {
    size: 8,
    color: AB.PAL.ink3,
  });

  out('po_out', 'u ≈ ' + espan(u, 0) + ' cm/s · Q_rel = ' + espan(Qrel, 0));
}

/* ═══════════════════════════════════════════════════════════
   S12 · Resistencia: dos vasos en paralelo (Ohm)
   ═══════════════════════════════════════════════════════════ */
export function drawResistance(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-resistance');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const r1 = Math.max(0.5, Math.min(3, params.rs_r1 ?? 2));
  out('rs_r1v', espan(r1, 1));
  const r2 = Math.max(0.5, Math.min(3, params.rs_r2 ?? 1));
  out('rs_r2v', espan(r2, 1));

  const R1 = Math.pow(2 / r1, 4);
  const R2 = Math.pow(2 / r2, 4);
  const Req = 1 / (1 / R1 + 1 / R2);
  const f1 = 1 / R1 / (1 / R1 + 1 / R2);
  const f2 = 1 - f1;

  // vasos horizontales
  const x0 = w * 0.12;
  const x1 = w * 0.88;
  const y1 = h * 0.34;
  const y2 = h * 0.52;
  const hgt = (v: number) => Math.max(5, v * 14);

  ctx.fillStyle = 'rgba(13,110,100,.16)';
  ctx.fillRect(x0, y1 - hgt(r1) / 2, x1 - x0, hgt(r1));
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2;
  ctx.strokeRect(x0, y1 - hgt(r1) / 2, x1 - x0, hgt(r1));

  ctx.fillStyle = 'rgba(154,91,0,.16)';
  ctx.fillRect(x0, y2 - hgt(r2) / 2, x1 - x0, hgt(r2));
  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 2;
  ctx.strokeRect(x0, y2 - hgt(r2) / 2, x1 - x0, hgt(r2));

  AB.text(ctx, 'r₁ = ' + espan(r1, 1) + ' · R₁ = ' + espan(R1, 1), x0 - 6, y1, {
    size: 8,
    weight: '700',
    color: AB.PAL.teal,
    align: 'right',
  });
  AB.text(ctx, 'r₂ = ' + espan(r2, 1) + ' · R₂ = ' + espan(R2, 1), x0 - 6, y2, {
    size: 8,
    weight: '700',
    color: AB.PAL.amber,
    align: 'right',
  });

  // flujo: ancho de flecha ∝ fracción
  AB.arrow(ctx, x0 + 10, y1, x1 - 10, y1, { color: AB.PAL.teal, width: Math.max(2, 3 + 12 * f1) });
  AB.arrow(ctx, x0 + 10, y2, x1 - 10, y2, { color: AB.PAL.amber, width: Math.max(2, 3 + 12 * f2) });
  AB.text(ctx, Math.round(f1 * 100) + ' %', x1 - 8, y1, { size: 7, color: AB.PAL.paper, align: 'right' });
  AB.text(ctx, Math.round(f2 * 100) + ' %', x1 - 8, y2, { size: 7, color: AB.PAL.paper, align: 'right' });

  // salida común
  AB.text(ctx, 'R ∝ 1/r⁴ · 1/R_eq = 1/R₁ + 1/R₂', w / 2, h * 0.72, { size: 9, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, 'R_eq = ' + espan(Req, 2) + ' — el paralelo baja la resistencia total', w / 2, h * 0.82, {
    size: 8,
    color: AB.PAL.ink3,
  });
  AB.text(ctx, 'las arteriolas regulan el reparto: vasodilatación ↔ vasoconstricción', w / 2, h * 0.92, {
    size: 7.5,
    color: AB.PAL.ink3,
  });

  out('rs_out', 'R₁ = ' + espan(R1, 1) + ' · R₂ = ' + espan(R2, 1) + ' · R_eq = ' + espan(Req, 2));
}

/* ═══════════════════════════════════════════════════════════
   S13 · Compliancia y distensibilidad
   ═══════════════════════════════════════════════════════════ */
export function drawCompliance(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-compliance');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const Y = Math.max(0.2, Math.min(2, params.cm_y ?? 0.6));
  out('cm_yv', espan(Y, 2));
  const dP = Math.max(10, Math.min(120, params.cm_p ?? 60));
  out('cm_pv', espan(dP, 0));

  const expand = Math.min(0.85, 0.22 * (dP / 60) * (0.6 / Y));
  const x0 = w * 0.1;
  const x1 = w * 0.9;
  const cy = h * 0.44;
  const h0 = h * 0.26;

  // estado de referencia (rígido) en gris
  AB.dashed(ctx, x0, cy - h0 / 2, x1, cy - h0 / 2, { color: AB.PAL.line });
  AB.dashed(ctx, x0, cy + h0 / 2, x1, cy + h0 / 2, { color: AB.PAL.line });
  AB.text(ctx, 'r₀ (sin presión)', x0, cy - h0 / 2 - 10, { size: 7, color: AB.PAL.ink3, align: 'left' });

  // vaso inflado
  const hh = h0 * (1 + expand);
  ctx.fillStyle = 'rgba(169,42,30,.12)';
  ctx.beginPath();
  ctx.moveTo(x0, cy - hh / 2);
  ctx.quadraticCurveTo((x0 + x1) / 2, cy - (hh / 2) * (1 + expand * 1.2), x1, cy - hh / 2);
  ctx.lineTo(x1, cy + hh / 2);
  ctx.quadraticCurveTo((x0 + x1) / 2, cy + (hh / 2) * (1 + expand * 1.2), x0, cy + hh / 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(x0, cy - hh / 2);
  ctx.quadraticCurveTo((x0 + x1) / 2, cy - (hh / 2) * (1 + expand * 1.2), x1, cy - hh / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x0, cy + hh / 2);
  ctx.quadraticCurveTo((x0 + x1) / 2, cy + (hh / 2) * (1 + expand * 1.2), x1, cy + hh / 2);
  ctx.stroke();

  // flechas de presión
  AB.arrow(ctx, x0 + 40, cy - hh / 2, x0 + 40, cy - hh / 2 - 18, { color: AB.PAL.blood, width: 2.2 });
  AB.arrow(ctx, x0 + 40, cy + hh / 2, x0 + 40, cy + hh / 2 + 18, { color: AB.PAL.blood, width: 2.2 });
  AB.text(ctx, 'ΔP = ' + espan(dP, 0), x0 + 46, cy - hh / 2 - 14, { size: 8, color: AB.PAL.blood, align: 'left' });

  // métricas
  const Crel = (1 / 1) * (dP / 60) / (Y / 0.6);
  AB.text(ctx, 'C = ΔV/ΔP', w * 0.26, h * 0.72, { size: 9, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, 'C_rel = ' + espan(Crel, 2), w * 0.26, h * 0.82, { size: 11, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, 'D = 2r₀/wY', w * 0.7, h * 0.72, { size: 9, weight: '700', color: AB.PAL.amber });
  AB.text(ctx, 'Y ↑ → C ↓ (arteria rígida)', w * 0.7, h * 0.82, { size: 8, weight: '700', color: AB.PAL.blood });
  AB.text(ctx, 'elástica (Y bajo): reservorio · rígida (Y alto): pulso amplio', w / 2, h * 0.92, {
    size: 8,
    color: AB.PAL.ink3,
  });

  out('cm_out', 'expansión ΔV ∝ ΔP/Y · C_rel = ' + espan(Crel, 2));
}

/* ═══════════════════════════════════════════════════════════
   S14 · Inertancia y el arco aórtico
   ═══════════════════════════════════════════════════════════ */
export function drawInertance(params: SimParams, flags: SimFlags, out: OutFn): void {
  const cv = getCanvas('sim-inertance');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const u = Math.max(0, Math.min(100, params.in_u ?? 50));
  out('in_uv', espan(u, 0) + ' cm/s');

  // arco aórtico: semicírculo
  const cx = w * 0.3;
  const cy = h * 0.62;
  const R0 = Math.min(64, h * 0.3);
  const ri = R0 * 0.72;
  const ro = R0 * 1.18;

  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(cx, cy, R0, Math.PI, 0);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(169,42,30,.25)';
  ctx.lineWidth = Math.max(4, ro - ri);
  ctx.beginPath();
  ctx.arc(cx, cy, (ri + ro) / 2, Math.PI, 0);
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, ri, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, ro, Math.PI, 0);
  ctx.stroke();

  AB.text(ctx, 'arco aórtico', cx, cy - ri - 14, { size: 8, weight: '700', color: AB.PAL.blood });
  AB.arrow(ctx, cx - R0 - 16, cy, cx - ri, cy, { color: AB.PAL.teal, width: 2.6 });
  AB.arrow(ctx, cx + ri, cy, cx + R0 + 16, cy, { color: AB.PAL.teal, width: 2.6 });

  // partículas a lo largo del arco
  const t = flags.inT || 0;
  const radial = 0.35 + 0.65 * (u / 100);
  for (let i = 0; i < 16; i++) {
    const a = Math.PI - (((i / 16 + (flags.inPlaying ? t * 0.35 : 0)) % 1) * Math.PI);
    const r = ri + (ro - ri) * radial + Math.sin(i * 12.9898) * 2;
    ctx.fillStyle = AB.PAL.teal;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy - Math.sin(a) * r, 3, 0, 7);
    ctx.fill();
  }

  // leyenda de posición radial
  AB.text(ctx, 'u baja → partículas centradas', w * 0.72, h * 0.3, { size: 8, color: AB.PAL.teal });
  AB.text(ctx, 'u alta → se pegan a la pared exterior', w * 0.72, h * 0.4, { size: 8, weight: '700', color: AB.PAL.blood });
  AB.text(ctx, 'P_cent = 2ρu²R/ℛ', w * 0.72, h * 0.56, { size: 10, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, 'L_flujo = ρL/A = ρL/πr²', w * 0.72, h * 0.68, { size: 9, color: AB.PAL.ink });
  AB.text(ctx, 'ΔP = (ρL/A)·∂Q/∂t — solo importa si el flujo es pulsátil', w / 2, h * 0.9, {
    size: 8,
    color: AB.PAL.ink3,
  });

  out('in_out', u < 30 ? 'ΔP = (ρL/A)·∂Q/∂t · partículas centradas' : 'ΔP = (ρL/A)·∂Q/∂t · pared externa');
}

/* ═══════════════════════════════════════════════════════════
   S15 · Arrastre: Stokes e hidrodinámico
   ═══════════════════════════════════════════════════════════ */
export function drawDrag(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-drag');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const R = Math.max(0.001, Math.min(10, params.dr_r ?? 0.01));
  out('dr_rv', espan(R, 3));
  const u = Math.max(1, Math.min(200, params.dr_u ?? 50));
  out('dr_uv', espan(u, 0) + ' cm/s');

  const rho = 1000;
  const eta = 0.001;
  const Re = 200 * R * u;
  const uM = u / 100;
  const RM = R / 100;
  const Fst = 6 * Math.PI * RM * eta * uM;
  const Fhd = 0.5 * 0.5 * Math.PI * RM * RM * rho * uM * uM;
  const useStokes = Re < 100;
  const F = useStokes ? Fst : Fhd;

  const cx = w * 0.42;
  const cy = h * 0.52;
  const rs = Math.max(6, Math.min(52, 6 + Math.log10(1 + R) * 18));

  // esfera
  ctx.fillStyle = AB.PAL.amber;
  ctx.strokeStyle = AB.PAL.amberDeep || '#7c4900';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, rs, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // flechas de flujo
  for (let i = -3; i <= 3; i++) {
    const y = cy + i * (rs * 0.28);
    AB.arrow(ctx, w * 0.08, y, w * 0.24, y, { color: AB.PAL.tealLight, width: 1.8, head: 5 });
    AB.arrow(ctx, w * 0.6, y, w * 0.76, y, { color: AB.PAL.tealLight, width: 1.8, head: 5 });
  }

  // fuerza de arrastre
  AB.arrow(ctx, cx, cy - rs - 6, cx, cy - rs - 6 - (useStokes ? F * 4e3 : Math.min(70, F * 2)), {
    color: AB.PAL.blood,
    width: 3.4,
  });
  AB.text(ctx, 'F = ' + espan(F, useStokes ? 7 : 3) + ' N', cx, cy - rs - 24, {
    size: 9,
    weight: '700',
    color: AB.PAL.blood,
  });
  AB.text(ctx, useStokes ? 'Ley de Stokes: F = 6πRηu' : 'Arrastre hidrodinámico: F = ½C_DAρu²', w / 2, h * 0.8, {
    size: 10,
    weight: '700',
    color: useStokes ? AB.PAL.teal : AB.PAL.blood,
  });
  AB.text(ctx, 'Re = ρud/η = ' + espan(Re, 0), w / 2, h * 0.9, { size: 9, color: AB.PAL.ink });
  AB.text(ctx, 'Re < 100 → Stokes (lineal) · Re > 100 → hidrodinámico (u²)', w / 2, h * 0.965, {
    size: 7.5,
    color: AB.PAL.ink3,
  });

  out('dr_out', 'Re = ' + espan(Re, 0) + ' · ' + (useStokes ? 'Stokes' : 'hidrodinámico'));
}

/* ═══════════════════════════════════════════════════════════
   S16 · Sustentación y Strouhal
   ═══════════════════════════════════════════════════════════ */
export function drawLift(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-lift');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const beta = Math.max(-6, Math.min(20, params.li_b ?? 8));
  out('li_bv', espan(beta, 0) + '°');

  let Cs: number;
  if (beta <= -4) Cs = -0.4 - (beta + 4) * 0.2;
  else if (beta <= 12) Cs = -0.4 + (1.6 * (beta + 4)) / 16;
  else Cs = 1.2 - (beta - 12) * 0.12;

  const stall = beta > 12;

  // gráfico C vs β
  const gx = w * 0.12;
  const gy = h * 0.18;
  const gw = w * 0.36;
  const gh = h * 0.52;

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, gy + gh);
  ctx.lineTo(gx + gw, gy + gh);
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy + gh / 2);
  ctx.lineTo(gx + gw, gy + gh / 2);
  ctx.stroke();

  AB.text(ctx, 'C_sust', gx, gy - 8, { size: 7.5, color: AB.PAL.ink3 });
  AB.text(ctx, 'β (°)', gx + gw / 2, gy + gh + 12, { size: 7.5, color: AB.PAL.ink3 });

  const X = (b: number) => gx + ((b + 6) / 26) * gw;
  const Y = (c: number) => gy + gh - ((c + 0.6) / 1.8) * gh;

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let b = -6; b <= 20; b += 0.5) {
    let c: number;
    if (b <= -4) c = -0.4 - (b + 4) * 0.2;
    else if (b <= 12) c = -0.4 + (1.6 * (b + 4)) / 16;
    else c = 1.2 - (b - 12) * 0.12;
    if (b === -6) ctx.moveTo(X(b), Y(c));
    else ctx.lineTo(X(b), Y(c));
  }
  ctx.stroke();

  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(beta), Y(Cs), 5, 0, 7);
  ctx.fill();
  AB.dashed(ctx, X(beta), Y(Cs), X(beta), gy + gh, { color: AB.PAL.blood });
  AB.text(ctx, 'stall > 12°', X(16), Y(0.6) + 14, { size: 7, color: AB.PAL.blood });

  // perfil de ala
  const ax = w * 0.7;
  const ay = h * 0.48;
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate((beta * Math.PI) / 180);
  ctx.fillStyle = AB.PAL.ink2;
  ctx.beginPath();
  ctx.moveTo(-46, 0);
  ctx.quadraticCurveTo(-6, -16, 26, -12);
  ctx.quadraticCurveTo(42, -10, 50, 0);
  ctx.quadraticCurveTo(20, 14, -46, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // flujo horizontal
  for (let i = -2; i <= 2; i++) {
    const y = ay + i * 26;
    AB.arrow(ctx, ax - 86, y, ax - 60, y, { color: AB.PAL.tealLight, width: 1.6, head: 5 });
  }
  AB.text(ctx, 'viento relativo →', ax - 74, ay + 42, { size: 7, color: AB.PAL.teal });

  // sustentación
  AB.arrow(ctx, ax, ay - 30, ax, ay - 30 - (stall ? 14 : 70), {
    color: stall ? AB.PAL.amber : AB.PAL.teal,
    width: 3.4,
  });
  AB.text(ctx, stall ? 'pérdida (stall)' : 'sustentación', ax, ay - 30 - (stall ? 20 : 82), {
    size: 8,
    weight: '700',
    color: stall ? AB.PAL.amber : AB.PAL.teal,
  });
  AB.text(ctx, 'β = ' + espan(beta, 0) + '° · C_sust = ' + espan(Cs, 2), w / 2, h * 0.82, {
    size: 10,
    weight: '700',
    color: AB.PAL.ink,
  });
  AB.text(ctx, 'C_sust de −0,4 a 1,2 para β de −4° a 12° · St ≈ 0,12–0,23', w / 2, h * 0.92, {
    size: 8,
    color: AB.PAL.ink3,
  });

  out('li_out', 'C_sust = ' + espan(Cs, 2) + (stall ? ' · ¡stall!' : ''));
}

/* ═══════════════════════════════════════════════════════════
   S17 · Difusión: gaussiana que se ensancha (Fick)
   ═══════════════════════════════════════════════════════════ */
export function drawDiffusion(params: SimParams, flags: SimFlags, out: OutFn): void {
  const cv = getCanvas('sim-diffusion');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const D = Math.max(0.01, Math.min(2, params.df_d ?? 0.3));
  out('df_dv', espan(D, 2));

  const t = (flags.dfT || 0) * D;
  const sigma = Math.max(0.02, Math.sqrt(2 * 0.3 * t));
  const cx = w * 0.5;
  const g0 = h * 0.78;
  const gh = h * 0.5;

  // referencia: pico original
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx, g0 - gh * 0.9);
  ctx.lineTo(cx, g0);
  ctx.stroke();

  // gaussiana actual
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  const peak = Math.exp(0) / sigma;
  for (let i = 0; i <= 160; i++) {
    const x = cx - w * 0.42 + (i / 160) * (w * 0.84);
    const d = (x - cx) / w;
    const n = Math.exp(-(d * d) / (2 * sigma * sigma)) / sigma;
    const y = g0 - (n / peak) * gh;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // ancho σ
  const sx = sigma * w;
  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - sx, g0);
  ctx.lineTo(cx + sx, g0);
  ctx.stroke();
  AB.text(ctx, '2σ', cx + sx + 4, g0 - 4, { size: 7, color: AB.PAL.blood });
  AB.text(ctx, 't = ' + espan(t, 2) + ' (D·t) · σ = ' + espan(sigma, 3), w / 2, h * 0.88, {
    size: 9,
    weight: '700',
    color: AB.PAL.ink,
  });
  AB.text(ctx, 'n ∝ exp(−x²/4Dt) · σ² = 2Dt — el ancho crece como √t', w / 2, h * 0.955, {
    size: 7.5,
    color: AB.PAL.ink3,
  });

  out('df_out', 'σ = ' + espan(sigma, 3) + ' · t = ' + espan(t, 2));
}

/* ═══════════════════════════════════════════════════════════
   S18 · Escala de la difusión: t = x²/2D
   ═══════════════════════════════════════════════════════════ */
export function drawDiffusion2(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-diffusion2');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const x = Math.max(1, Math.min(1000, params.d2_x ?? 100));
  out('d2_xv', espan(x, 0) + ' μm');

  const xcm = x * 1e-4;
  const med: [string, number, string][] = [
    ['gas', 0.1, AB.PAL.teal],
    ['líquido', 1e-5, AB.PAL.amber],
    ['sólido', 1e-9, AB.PAL.blood],
  ];
  const ts = med.map((m) => (xcm * xcm) / (2 * m[1]));

  // escala log de tiempo: 1e-8 a 1e8 s
  const log0 = -8;
  const log1 = 8;
  const gy = h * 0.2;
  const gh = h * 0.52;
  const gx = w * 0.3;
  const gw = w * 0.6;

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, gy + gh);
  ctx.lineTo(gx + gw, gy + gh);
  ctx.stroke();

  AB.text(ctx, 't (s, escala log)', gx + gw + 6, gy + gh / 2, {
    size: 8,
    color: AB.PAL.ink3,
    align: 'left',
    base: 'middle',
  });

  [1e-6, 1, 3600, 86400, 1e6].forEach((v) => {
    const l = Math.log10(v);
    const y = gy + gh * (1 - (l - log0) / (log1 - log0));
    AB.dashed(ctx, gx, y, gx + gw, y, { color: AB.PAL.line });
    const lab = v < 100 ? (v === 1e-6 ? '1 µs' : v === 1 ? '1 s' : '1 min') : v === 86400 ? '1 d' : v === 1e6 ? '11 d' : '';
    AB.text(ctx, lab === '' ? espan(v, 0) : lab, gx - 6, y, { size: 7, color: AB.PAL.ink3, align: 'right' });
  });

  // barras por medio
  med.forEach((m, i) => {
    const l = Math.log10(Math.max(1e-8, ts[i]));
    const y = gy + gh * (1 - (l - log0) / (log1 - log0));
    const bh = Math.max(3, gy + gh - y);
    ctx.fillStyle = m[2];
    ctx.fillRect(gx + 16 + (i * gw) / 3 + 8, y, Math.max(6, gw / 3 - 16), bh);
    const lab =
      ts[i] < 1
        ? espan(ts[i] * 1000, 0) + ' ms'
        : ts[i] < 3600
        ? espan(ts[i], 1) + ' s'
        : ts[i] < 86400
        ? espan(ts[i] / 60, 0) + ' min'
        : espan(ts[i] / 86400, 1) + ' d';
    AB.text(ctx, m[0] + ': ' + lab, gx + 16 + (i * gw) / 3 + gw / 6, gy + gh + 14, {
      size: 7.5,
      weight: '700',
      color: m[2],
    });
  });

  AB.text(ctx, 't = x²/2D con x = ' + espan(x, 0) + ' μm (' + espan(xcm, 5) + ' cm)', w / 2, h * 0.84, {
    size: 9,
    weight: '700',
    color: AB.PAL.ink,
  });
  AB.text(ctx, 'difusión eficiente solo entre 1 y 100 μm · el resto lo lleva el flujo', w / 2, h * 0.92, {
    size: 8,
    color: AB.PAL.ink3,
  });

  out('d2_out', 't_líq = ' + espan(ts[1], 0) + ' s ≈ ' + espan(ts[1] / 3600, 1) + ' h');
}

/* ═══════════════════════════════════════════════════════════
   S19 · Peristalsis: el viaje del bocado
   ═══════════════════════════════════════════════════════════ */
export function drawFlows(flags: SimFlags, out: OutFn): void {
  const cv = getCanvas('sim-flows');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const segs: [string, number][] = [
    ['boca', 0.02],
    ['esófago', 0.06],
    ['estómago', 0.25],
    ['delgado', 0.4],
    ['grueso', 0.62],
    ['recto', 0.95],
  ];
  const x0 = w * 0.06;
  const x1 = w * 0.94;
  const cy = h * 0.46;

  // camino ondulado
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 14;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const x = x0 + t * (x1 - x0);
    const y = cy + Math.sin(t * Math.PI * 5) * h * 0.07;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const x = x0 + t * (x1 - x0);
    const y = cy + Math.sin(t * Math.PI * 5) * h * 0.07;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // hitos
  segs.forEach((s, i) => {
    const x = x0 + s[1] * (x1 - x0);
    const y = cy + Math.sin(s[1] * Math.PI * 5) * h * 0.07;
    ctx.fillStyle = AB.PAL.paper;
    ctx.strokeStyle = AB.PAL.ink3;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, 7);
    ctx.fill();
    ctx.stroke();
    AB.text(ctx, s[0], x, y - (i === 0 ? -16 : 16), { size: 7.5, weight: '700', color: AB.PAL.ink });
  });

  // bocado
  const t = (flags.flT || 0) % 1;
  const slow = (x: number) => 0.02 + x * 0.98;
  const bx = x0 + slow(t) * (x1 - x0);
  const by = cy + Math.sin(slow(t) * Math.PI * 5) * h * 0.07;
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(bx, by, 10, 0, 7);
  ctx.fill();
  AB.text(ctx, 'bocado', bx, by + 24, { size: 8, weight: '700', color: AB.PAL.blood });

  // tiempos
  AB.text(ctx, 'boca 1–10 s · esófago 5–20 s · estómago 2–6 h · delgado 3–5 h · grueso 10–20 h', w / 2, h * 0.8, {
    size: 8,
    color: AB.PAL.ink3,
  });
  AB.text(ctx, 'velocidad media ≈ 0,01 cm/s — de boca a recto: 16–32 h', w / 2, h * 0.9, {
    size: 8,
    weight: '700',
    color: AB.PAL.ink,
  });

  out('fl_out', 'peristalsis · boca → recto: 16–32 h');
}

/* ═══════════════════════════════════════════════════════════
   S20 · Vejiga: cistometrograma
   ═══════════════════════════════════════════════════════════ */
export function drawBladder(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-bladder');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const V = Math.max(0, Math.min(600, params.bl_v ?? 200));
  out('bl_vv', espan(V, 0) + ' mL');

  function P(vol: number) {
    if (vol < 30) return 5;
    if (vol < 300) return 5 + (vol - 30) * (15 / 270);
    return 20 + (vol - 300) * 0.12;
  }

  const p = P(V);
  const gx = w * 0.14;
  const gw = w * 0.76;
  const gy = h * 0.16;
  const gh = h * 0.6;

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, gy + gh);
  ctx.lineTo(gx + gw, gy + gh);
  ctx.stroke();

  AB.text(ctx, 'P (cmH₂O)', gx + 6, gy + 6, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'volumen (mL)', gx + gw / 2, gy + gh + 14, { size: 8, color: AB.PAL.ink3 });

  [0, 10, 20, 30, 40, 50].forEach((v) => {
    const y = gy + gh - (v / 55) * gh;
    AB.dashed(ctx, gx, y, gx + gw, y, { color: AB.PAL.line });
    AB.text(ctx, String(v), gx - 6, y, { size: 7, color: AB.PAL.ink3, align: 'right' });
  });

  // umbral "ganas de orinar"
  const yUr = gy + gh - (30 / 55) * gh;
  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(gx, yUr);
  ctx.lineTo(gx + gw, yUr);
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'ganas de orinar ≈ 30', gx + gw - 6, yUr - 6, { size: 7, color: AB.PAL.blood, align: 'right' });

  // curva
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  for (let v = 0; v <= 600; v += 10) {
    const x = gx + (v / 600) * gw;
    const y = gy + gh - (P(v) / 55) * gh;
    if (v === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // punto actual
  const px = gx + (V / 600) * gw;
  const py = gy + gh - (p / 55) * gh;
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(px, py, 6, 0, 7);
  ctx.fill();
  AB.dashed(ctx, px, py, px, gy + gh, { color: AB.PAL.blood });
  AB.text(ctx, 'V = ' + espan(V, 0) + ' mL', px, gy + gh + 14, { size: 8, color: AB.PAL.blood });

  // fases
  const fase = V < 30 ? 'relleno inicial: 5–10 cmH₂O' : V < 300 ? 'meseta: 200–300 mL con poco cambio' : 'ascenso rápido';
  AB.text(ctx, fase, w / 2, h * 0.86, { size: 10, weight: '700', color: V < 300 ? AB.PAL.teal : AB.PAL.blood });
  AB.text(ctx, 'σ ∝ V^⅓ (Laplace) → los sensores de llenado están en la pared, no en la presión', w / 2, h * 0.94, {
    size: 8,
    color: AB.PAL.ink3,
  });

  out('bl_out', 'P ≈ ' + espan(p, 0) + ' cmH₂O · σ ∝ V^⅓');
}

/* ═══════════════════════════════════════════════════════════
   S21 · Natación: la física de la brazada
   ═══════════════════════════════════════════════════════════ */
export function drawSwim(params: SimParams, flags: SimFlags, out: OutFn): void {
  const cv = getCanvas('sim-swim');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const H = Math.max(1.5, Math.min(2.1, params.sw_h ?? 1.8));
  out('sw_hv', espan(H, 2) + ' m');
  const B = Math.max(30, Math.min(90, params.sw_b ?? 60));
  out('sw_bv', espan(B, 0) + '/min');

  const l = 0.386 * H;
  const wm = 0.07 * H;
  const T = 60 / B;
  const F = (1000 * Math.PI * l * l * l * wm) / (4 * T * T);
  const A = 0.259 * H * 0.09 * H;
  const u = Math.sqrt((2 * F) / (1.0 * A * 1000));

  // superficie del agua
  const surf = h * 0.3;
  ctx.fillStyle = 'rgba(45,125,79,.14)';
  ctx.fillRect(0, surf, w, h - surf);
  ctx.strokeStyle = AB.PAL.coronal || '#2d7d4f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 5) {
    const y = surf + Math.sin(x * 0.05 + (flags.swT || 0) * 2) * 2.5;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // nadador: cabeza + torso
  const hx = w * 0.36;
  const hy = surf - 16;
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(hx, hy, 11, 0, 7);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = AB.PAL.muscle;
  ctx.strokeStyle = AB.PAL.muscleEdge;
  ctx.beginPath();
  ctx.ellipse(hx - 16, hy + 14, 20, 12, 0.3, 0, 7);
  ctx.fill();
  ctx.stroke();

  // brazo que barre
  const a = (flags.swT || 0) * Math.PI * 2;
  const shx = hx - 22;
  const shy = hy + 4;
  const elbow = shx + Math.cos(a) * 20;
  const elby = shy + Math.sin(a) * 18;
  const hndx = elbow + Math.cos(a) * 18;
  const hndy = elby + Math.sin(a) * 18 + 4;

  AB.limbSkin(ctx, shx, shy, elbow, elby, 7, { fill: AB.PAL.skin });
  AB.limbSkin(ctx, elbow, elby, hndx, hndy, 6, { fill: AB.PAL.skin });
  AB.hand(ctx, hndx, hndy + 4, 6);
  AB.joint(ctx, shx, shy, 5, { color: AB.PAL.blood });
  AB.joint(ctx, elbow, elby, 4, { color: AB.PAL.blood });
  AB.text(ctx, 'brazada', shx - 14, shy - 20, { size: 7.5, color: AB.PAL.teal });

  // flechas de fuerza
  AB.arrow(ctx, hndx - 8, hndy + 8, hndx - 26, hndy + 26, { color: AB.PAL.teal, width: 2.6 });
  AB.arrow(ctx, hx + 20, hy + 8, hx + 52, hy + 8, { color: AB.PAL.blood, width: 3.4 });
  AB.text(ctx, 'F_prop', hx + 44, hy - 2, { size: 8, weight: '700', color: AB.PAL.blood });
  AB.text(ctx, 'agua empujada →', hndx - 30, hndy + 34, { size: 7, color: AB.PAL.teal });

  // resultados
  AB.text(ctx, 'F ≈ ' + espan(F, 0) + ' N · u ≈ ' + espan(u, 1) + ' m/s', w / 2, h * 0.72, {
    size: 11,
    weight: '700',
    color: AB.PAL.ink,
  });
  AB.text(ctx, 'F = ρπl³w/4T² · l = 0,386H · w = 0,07H · 60 brazadas/min → 27 N → 0,8 m/s', w / 2, h * 0.82, {
    size: 8,
    color: AB.PAL.ink3,
  });
  AB.text(ctx, 'alometría u ≈ 0,5·m_b^0,19 m/s — un animal de 70 kg nada a ≈ 1 m/s', w / 2, h * 0.92, {
    size: 8,
    color: AB.PAL.ink3,
  });

  out('sw_out', 'F ≈ ' + espan(F, 0) + ' N · u ≈ ' + espan(u, 1) + ' m/s');
}

/* ═══════════════════════════════════════════════════════════
   S22 · Vuelo humano: la cuenta de fuerzas
   ═══════════════════════════════════════════════════════════ */
export function drawFlight(params: SimParams, out: OutFn): void {
  const cv = getCanvas('sim-flight');
  if (!cv) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  if (!ctx) return;

  const S = Math.max(0.5, Math.min(5, params.ft_s ?? 1));
  out('ft_sv', espan(S, 1) + ' m');
  const f = Math.max(1, Math.min(6, params.ft_f ?? 3));
  out('ft_fv', espan(f, 0) + ' /s');

  const A = S; // área efectiva de alas (m²)
  const F = 1.2 * A * 0.7 * 20 * f;
  const W = 700;
  const bars: [string, number, string][] = [
    ['peso (700 N)', W, AB.PAL.blood],
    ['brazos (6 N)', 6, AB.PAL.amber],
    ['alas ' + espan(A, 1) + ' m²', F, AB.PAL.teal],
  ];

  const bx = w * 0.2;
  const bw = w * 0.62;
  const gy = h * 0.22;
  const gH = h * 0.5;
  const Fmax = Math.max(W, F, 6);

  bars.forEach((b, i) => {
    const y = gy + i * (gH / 3.6);
    ctx.fillStyle = b[2];
    ctx.fillRect(bx, y, (bw * b[1]) / Fmax, 26);
    AB.text(ctx, b[0], bx - 8, y + 13, { size: 8, weight: '700', color: b[2], align: 'right' });
    AB.text(ctx, espan(b[1], 0) + ' N', bx + (bw * b[1]) / Fmax + 8, y + 13, {
      size: 8,
      weight: '700',
      color: AB.PAL.ink,
      align: 'left',
    });
  });

  // barrera
  AB.dashed(ctx, bx + 6, gy + gH * 0.4, bx + (bw * W) / Fmax, gy + gH * 0.4, { color: AB.PAL.line });

  // persona
  const px = w * 0.72;
  const py = h * 0.56;
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(px, py - 24, 9, 0, 7);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = AB.PAL.ink2;
  ctx.fillRect(px - 8, py - 12, 16, 22);
  AB.limbSkin(ctx, px - 8, py - 8, px - 26, py - 20, 6, { fill: AB.PAL.skin });
  AB.limbSkin(ctx, px + 8, py - 8, px + 26, py - 20, 6, { fill: AB.PAL.skin });
  AB.limbSkin(ctx, px - 6, py + 10, px - 12, py + 34, 6, { fill: AB.PAL.skin });
  AB.limbSkin(ctx, px + 6, py + 10, px + 12, py + 34, 6, { fill: AB.PAL.skin });

  // alas
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(px - 8, py - 8);
  ctx.lineTo(px - 44, py - 24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px + 8, py - 8);
  ctx.lineTo(px + 44, py - 24);
  ctx.stroke();

  // flechas de brazos
  AB.arrow(ctx, px - 30, py - 20, px - 38, py - 40, { color: AB.PAL.teal, width: 2.4 });
  AB.arrow(ctx, px + 30, py - 20, px + 38, py - 40, { color: AB.PAL.teal, width: 2.4 });
  AB.arrow(ctx, px, py + 34, px, py + 50, { color: AB.PAL.blood, width: 3 });
  AB.text(ctx, '700 N', px + 8, py + 46, { size: 7, color: AB.PAL.blood });
  AB.text(ctx, 'batir: ~0,1 m³ de aire por aleteo → 6 N', px, py + 58, { size: 7, color: AB.PAL.amber });

  const ok = F >= W;
  AB.text(
    ctx,
    ok ? '(no ocurre con alas humanas)' : 'F = ' + espan(F, 0) + ' N < peso 700 N — no despegamos',
    w / 2,
    h * 0.88,
    { size: 10.5, weight: '700', color: ok ? AB.PAL.teal : AB.PAL.blood }
  );
  AB.text(ctx, 'Gossamer Albatross (1979): 35,6 km en 2h49m con 125 W · efecto suelo', w / 2, h * 0.955, {
    size: 7.5,
    color: AB.PAL.ink3,
  });

  out('ft_out', 'F = ' + espan(F, 0) + ' N vs peso 700 N');
}

/* ═══════════════════════════════════════════════════════════
   Función maestra de redibujado de diapositivas
   ═══════════════════════════════════════════════════════════ */
export function redrawSlide(
  slide: number,
  _t: number,
  params: SimParams,
  flags: SimFlags,
  out: OutFn = () => {}
): void {
  switch (slide) {
    case 1:
      drawManometer(params, out);
      break;
    case 2:
      drawPressures(params, out);
      break;
    case 3:
      drawBp(params, out);
      break;
    case 4:
      drawPascal(params, out);
      break;
    case 5:
      drawLaplaceCyl(params, out);
      break;
    case 6:
      drawLaplaceSphere(params, flags, out);
      break;
    case 7:
      drawReynolds(params, flags, out);
      break;
    case 8:
      drawVenturi(params, flags, out);
      break;
    case 9:
      drawStenosis(params, flags, out);
      break;
    case 10:
      drawViscosity(params, out);
      break;
    case 11:
      drawPoiseuille(params, out);
      break;
    case 12:
      drawResistance(params, out);
      break;
    case 13:
      drawCompliance(params, out);
      break;
    case 14:
      drawInertance(params, flags, out);
      break;
    case 15:
      drawDrag(params, out);
      break;
    case 16:
      drawLift(params, out);
      break;
    case 17:
      drawDiffusion(params, flags, out);
      break;
    case 18:
      drawDiffusion2(params, out);
      break;
    case 19:
      drawFlows(flags, out);
      break;
    case 20:
      drawBladder(params, out);
      break;
    case 21:
      drawSwim(params, flags, out);
      break;
    case 22:
      drawFlight(params, out);
      break;
    default:
      break;
  }
}
