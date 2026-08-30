// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 6 · Motor de simulaciones 2D y cálculos físicos (TypeScript)
//  "Metabolismo: Energía, Calor, Trabajo y Potencia" (I. P. Herman)
// ═══════════════════════════════════════════════════════════════════════════

import * as AB from './ab';

export interface ModuleDef {
  id: number;
  name: string;
  slides: number[];
  ico: string;
}

export const TOTAL = 23;

export const MODULES: ModuleDef[] = [
  { id: 0, name: 'Inicio',             slides: [0],           ico: '🏠' },
  { id: 1, name: 'Energía · Calor',    slides: [1, 2],        ico: '🔥' },
  { id: 2, name: 'Combustibles',       slides: [3, 4],        ico: '🍩' },
  { id: 3, name: 'Almacenamiento',     slides: [5, 6, 7],     ico: '🔋' },
  { id: 4, name: 'Tasa basal',         slides: [8, 9],        ico: '💤' },
  { id: 5, name: 'Locomoción',         slides: [10, 11, 12, 13], ico: '🏃' },
  { id: 6, name: 'Trabajo · Potencia', slides: [14, 15, 16],  ico: '⚙️' },
  { id: 7, name: 'Pérdida de calor',   slides: [17, 18, 19, 20], ico: '❄️' },
  { id: 8, name: 'Temperatura',        slides: [21, 22],      ico: '🌡️' },
];

export interface SimParams {
  bl_w: number;
  he_mat: string;
  he_d: number;
  ox_fuel: string;
  at_g: number;
  sy_race: string;
  rs_f: number;
  kl_m: number;
  ac_act: number;
  lo_v: number;
  br_s: number;
  me_act: string;
  pw_d: number;
  bn_act: number;
  ls_f: number;
  ra_t: number;
  cv_w: number;
  cv_c: number;
  sw_h: number;
  th_t: number;
  co_t: number;
  co_c: number;
}

export const DEFAULT_PARAMS: SimParams = {
  bl_w: 20,
  he_mat: '0.19',
  he_d: 3,
  ox_fuel: 'glucosa',
  at_g: 14,
  sy_race: '400',
  rs_f: 1,
  kl_m: 70,
  ac_act: 1,
  lo_v: 2,
  br_s: 3,
  me_act: '8',
  pw_d: 12,
  bn_act: 688,
  ls_f: 0,
  ra_t: 24,
  cv_w: 2,
  cv_c: 1,
  sw_h: 50,
  th_t: 20,
  co_t: 20,
  co_c: 1,
};

export interface SimFlags {
  oxPlaying: boolean;
  oxT: number;
  dnPlaying: boolean;
  dnT: number;
  atPlaying: boolean;
  atT: number;
  syPlaying: boolean;
  syT: number;
  orPlaying: boolean;
  orT: number;
  efPlaying: boolean;
  efT: number;
  bnPlaying: boolean;
  bnT: number;
  swPlaying: boolean;
  swT: number;
}

export const DEFAULT_FLAGS: SimFlags = {
  oxPlaying: false,
  oxT: 0,
  dnPlaying: false,
  dnT: 0,
  atPlaying: false,
  atT: 0,
  syPlaying: false,
  syT: 0,
  orPlaying: false,
  orT: 0,
  efPlaying: false,
  efT: 0,
  bnPlaying: false,
  bnT: 0,
  swPlaying: false,
  swT: 0,
};

export type OutFn = (id: string, text: string) => void;

// ═══════════════════════════════════════════════════════════════════════════
// S1 · Balance energético del cuerpo
// ═══════════════════════════════════════════════════════════════════════════
export function drawBalance(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-balance') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const wf = params.bl_w ?? 20;
  if (out) {
    out('bl_wv', `${wf} %`);
    out('bl_out', `W = ${wf} % · calor = ${100 - wf} %`);
  }

  const bx = w * 0.12,
    bw = w * 0.76,
    by = h * 0.2,
    bh = h * 0.3;
  // entrada metabólica
  ctx.fillStyle = AB.PAL.teal;
  ctx.fillRect(bx, by, bw, bh);
  AB.text(ctx, 'Q_met · metabolismo (100 %)', bx + bw / 2, by + bh / 2, { size: 10, weight: '700', color: '#fbf8f0' });
  AB.text(ctx, 'Q_met', bx + bw / 2, by - 14, { size: 9, weight: '700', color: AB.PAL.teal });

  // desglose
  const y2 = h * 0.6,
    b2h = h * 0.26;
  const wf2 = (bw * wf) / 100,
    hf2 = bw - wf2;
  ctx.fillStyle = AB.PAL.teal;
  ctx.fillRect(bx, y2, wf2, b2h);
  ctx.fillStyle = AB.PAL.blood;
  ctx.fillRect(bx + wf2, y2, hf2, b2h);
  AB.text(ctx, 'W · trabajo', bx + wf2 / 2, y2 + b2h / 2, { size: 9, weight: '700', color: '#fbf8f0' });
  AB.text(ctx, 'Q_loss · calor', bx + wf2 + hf2 / 2, y2 + b2h / 2, { size: 9, weight: '700', color: '#fbf8f0' });
  AB.text(ctx, `trabajo ${wf} %`, bx - 8, y2 + b2h / 2, { size: 8, color: AB.PAL.ink2, align: 'right' });
  AB.text(ctx, `calor ${100 - wf} %`, bx - 8, y2 + b2h + bh * 0.12, { size: 8, color: AB.PAL.ink2, align: 'right' });
  AB.text(ctx, 'ΔU = Q_met − Q_loss − W = 0 (estado estacionario)', w / 2, h * 0.94, { size: 9, weight: '700', color: AB.PAL.ink });
}

// ═══════════════════════════════════════════════════════════════════════════
// S2 · Conducción: dos placas y un aislante
// ═══════════════════════════════════════════════════════════════════════════
export function drawHeat(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-heat') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const K = parseFloat(params.he_mat || '0.19');
  const d = Math.max(1, params.he_d ?? 3);
  const TH = 34,
    TC = 0;
  const flux = (K * (TH - TC)) / (d / 1000); // W/m²

  if (out) {
    out('he_dv', `${AB.espan(d, 0)} mm`);
    out('he_out', `Q/A ≈ ${AB.espan(flux, 0)} W/m²`);
  }

  // placas
  const x1 = w * 0.16,
    x2 = w * 0.84;
  const grad = ctx.createLinearGradient(x1, 0, x2, 0);
  grad.addColorStop(0, AB.PAL.blood);
  grad.addColorStop(1, '#5b93a8');
  ctx.fillStyle = grad;
  ctx.fillRect(x1, h * 0.24, x2 - x1, h * 0.34);
  ctx.fillStyle = AB.PAL.ink3;
  ctx.fillRect(x1, h * 0.24, 6, h * 0.34);
  ctx.fillRect(x2 - 6, h * 0.24, 6, h * 0.34);

  // flecha de flujo
  const arrowW = Math.min(70, 6 + Math.log10(1 + Math.max(0, flux)) * 9);
  AB.arrow(ctx, x1 + 20, h * 0.62, x1 + 20 + arrowW, h * 0.62, { color: AB.PAL.teal, width: 3 });
  AB.text(ctx, 'flujo de calor', x1 + 20 + arrowW / 2, h * 0.62 + 16, { size: 8, color: AB.PAL.teal });
  AB.text(ctx, 'T_caliente = 34 °C (piel)', x1, h * 0.2, { size: 8, color: AB.PAL.blood });
  AB.text(ctx, 'T_frío = 0 °C', x2, h * 0.2, { size: 8, color: '#5b93a8' });
  AB.text(ctx, `Q/A = K·ΔT/d = ${AB.espan(flux, 0)} W/m²`, w / 2, h * 0.82, { size: 11, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, `K = ${AB.espan(K, 4)} W/m-°C · grosor d = ${AB.espan(d, 0)} mm`, w / 2, h * 0.9, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, 'grasa 3 mm: ~2000 W/m² · aire 3 mm: ~100 W/m²', w / 2, h * 0.965, { size: 7, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S3 · Oxidación de glucosa / palmítico
// ═══════════════════════════════════════════════════════════════════════════
export function drawOx(params: SimParams, flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-ox') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const fuel = params.ox_fuel || 'glucosa';
  const D =
    fuel === 'palmitico'
      ? { kcal: 2397, perG: 9.3, rer: 0.7, o2: 23, co2: 16, f1: 'C₁₆H₃₂O₂', f2: '+ 23 O₂', f3: '16 CO₂ + 16 H₂O', kcalL: '4,70' }
      : { kcal: 686, perG: 3.8, rer: 1.0, o2: 6, co2: 6, f1: 'C₆H₁₂O₆', f2: '+ 6 O₂', f3: '6 CO₂ + 6 H₂O', kcalL: '5,05' };

  const ph = (flags.oxT || 0) % 1;

  if (out) {
    out(
      'ox_out',
      fuel === 'palmitico' ? 'C₁₆H₃₂O₂ + 23 O₂ → 16 CO₂ + 16 H₂O + 2397 kcal' : 'C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + 686 kcal'
    );
  }

  // línea de reacción
  const yR = h * 0.22;
  AB.text(ctx, D.f1, w * 0.18, yR, { size: 12, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, D.f2, w * 0.34, yR, { size: 11, color: AB.PAL.teal });
  AB.text(ctx, '→', w * 0.47, yR, { size: 12, weight: '700', color: AB.PAL.ink3 });
  AB.text(ctx, D.f3, w * 0.6, yR, { size: 11, color: AB.PAL.ink3 });
  AB.text(ctx, `+ ${AB.espan(D.kcal, 0)} kcal`, w * 0.79, yR, { size: 12, weight: '700', color: AB.PAL.blood });

  // moléculas animadas: O2 → productos
  const n = D.o2;
  const lx = w * 0.2,
    rx = w * 0.78;
  for (let i = 0; i < n; i++) {
    const t = (ph * 2 + i / n) % 1;
    const x = lx + (rx - lx) * Math.min(1, t);
    const yy = h * 0.4 + (i % 2 ? 14 : -14);
    ctx.strokeStyle = AB.PAL.teal;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, yy, 7, 0, Math.PI * 2);
    ctx.stroke();
    AB.text(ctx, 'O₂', x, yy, { size: 7, color: AB.PAL.teal });
  }
  for (let i = 0; i < D.co2; i++) {
    const t = Math.max(0, ph * 2 + i / n - 0.5);
    const x = lx + (rx - lx) * Math.min(1, t);
    const yy = h * 0.58 + (i % 2 ? 14 : -14);
    ctx.strokeStyle = AB.PAL.ink3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, yy, 7, 0, Math.PI * 2);
    ctx.stroke();
    AB.text(ctx, 'CO₂', x, yy, { size: 7, color: AB.PAL.ink3 });
  }
  AB.text(ctx, 'O₂ consumido', (lx + rx) / 2, h * 0.4 - 24, { size: 8, color: AB.PAL.teal });
  AB.text(ctx, 'CO₂ producido', (lx + rx) / 2, h * 0.58 - 24, { size: 8, color: AB.PAL.ink3 });

  // panel de densidad energética
  const by = h * 0.7,
    bw = w * 0.74,
    bx = w * 0.13;
  const maxPerG = 9.3;
  AB.text(ctx, 'densidad energética (kcal/g)', bx + bw / 2, by - 12, { size: 9, weight: '700', color: AB.PAL.ink });
  const rows: [string, number, string][] = [
    ['glucosa', 3.8, AB.PAL.teal],
    ['palmítico', 9.3, AB.PAL.blood],
  ];
  rows.forEach((r, i) => {
    const y = by + i * 30;
    ctx.fillStyle = r[2];
    ctx.fillRect(bx, y, (bw * r[1]) / maxPerG, 18);
    AB.text(ctx, `${r[0]} · ${AB.espan(r[1], 1)} kcal/g`, bx + (bw * r[1]) / maxPerG + 8, y + 9, {
      size: 8,
      color: r[2],
      align: 'left',
    });
  });
  AB.text(ctx, 'RER: glucosa 1,0 · palmítico 0,7 · proteína 0,8', w / 2, by + 74, { size: 8, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S4 · Desglose del donut estándar
// ═══════════════════════════════════════════════════════════════════════════
export function drawDonut(_params: SimParams, flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-donut') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const data: [string, number, number, string][] = [
    ['grasa', 18, 162, AB.PAL.amber],
    ['carbohidrato', 29, 116, AB.PAL.teal],
    ['proteína', 2, 8, AB.PAL.blood],
  ];
  const active = Math.floor((flags.dnT || 0) * 1.5) % 3;

  if (out) {
    out('dn_out', `${data[active][0]} ${data[active][1]} g → ${data[active][2]} kcal`);
  }

  // donut dibujado como aro con cuñas
  const cx = w * 0.22,
    cy = h * 0.34,
    R = Math.min(58, h * 0.22),
    r = R * 0.5;
  let a0 = -Math.PI / 2;
  data.forEach((d, i) => {
    const frac = d[2] / 286;
    const a1 = a0 + frac * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, R, a0, a1);
    ctx.arc(cx, cy, r, a1, a0, true);
    ctx.closePath();
    ctx.fillStyle = i === active ? d[3] : 'rgba(107,120,133,.22)';
    ctx.fill();
    ctx.strokeStyle = '#f5f0e4';
    ctx.lineWidth = 2;
    ctx.stroke();
    a0 = a1;
  });
  AB.text(ctx, '286 ≈ 280 kcal', cx, cy, { size: 10, weight: '700', color: AB.PAL.ink });

  // barras
  const bx = w * 0.52,
    bw = w * 0.42,
    by = h * 0.12;
  data.forEach((d, i) => {
    const y = by + i * 26;
    ctx.fillStyle = i === active ? d[3] : AB.PAL.ink3;
    ctx.fillRect(bx, y, (bw * d[2]) / 162, 16);
    AB.text(ctx, `${d[0]} ${d[1]} g · ${d[2]} kcal`, bx + bw + 6, y + 8, {
      size: 8,
      color: i === active ? d[3] : AB.PAL.ink2,
      align: 'left',
    });
  });
  const pct = (data[active][2] / 286) * 100;
  AB.text(ctx, `${data[active][0]}: ${AB.espan(pct, 1)} % de las kcal`, bx, by + 82, {
    size: 9,
    weight: '700',
    color: data[active][3],
    align: 'left',
  });
  AB.text(ctx, '18×9 + 29×4 + 2×4 = 286', w / 2, h * 0.94, { size: 9, weight: '700', color: AB.PAL.ink });
}

// ═══════════════════════════════════════════════════════════════════════════
// S5 · Hidrólisis del ATP
// ═══════════════════════════════════════════════════════════════════════════
export function drawAtp(params: SimParams, flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-atp') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const G = params.at_g ?? 14;
  const ph = (flags.atT || 0) % 1;
  const split = ph > 0.45;

  if (out) {
    out('at_gv', AB.espan(G, 1));
    out('at_out', `ATP + H₂O → ADP + Pᵢ + ${AB.espan(G, 1)} kcal/mol`);
  }

  const cx = w * 0.34,
    cy = h * 0.34;
  // adenina + ribosa
  ctx.fillStyle = AB.PAL.sagittal;
  ctx.fillRect(cx - 52, cy - 14, 26, 28);
  AB.text(ctx, 'A', cx - 39, cy, { size: 9, color: '#fbf8f0' });
  ctx.fillStyle = AB.PAL.ink3;
  ctx.fillRect(cx - 26, cy - 9, 24, 18);
  AB.text(ctx, 'Ribosa', cx - 14, cy, { size: 8, color: '#fbf8f0' });

  // fosfatos
  const px0 = cx + 8;
  const Px = [px0, px0 + 26, px0 + 52];
  Px.forEach((px, i) => {
    const isLast = i === 2;
    const x = split && isLast ? px + 40 : px;
    ctx.fillStyle = isLast ? (split ? AB.PAL.blood : AB.PAL.amber) : AB.PAL.teal;
    ctx.beginPath();
    ctx.arc(x, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = AB.PAL.ink3;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    AB.text(ctx, 'P', x, cy, { size: 9, weight: '700', color: '#fbf8f0' });
    if (i < 2) {
      ctx.strokeStyle = AB.PAL.ink3;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x + 12, cy);
      ctx.lineTo(Px[i + 1] - 12 - (i === 1 && split ? 40 : 0), cy);
      ctx.stroke();
    }
  });

  // agua entrando
  const hx = split ? w * 0.66 : w * 0.55,
    hy = cy - 44;
  AB.text(ctx, 'H₂O', hx, hy, { size: 9, color: AB.PAL.teal });
  AB.arrow(ctx, hx - 14, hy + 2, hx - 14, hy - 14, { color: AB.PAL.teal, width: 2 });
  if (split) {
    AB.text(ctx, '+ energía', w * 0.66, cy + 34, { size: 11, weight: '700', color: AB.PAL.blood });
    const glow = Math.min(22, G * 1.5);
    ctx.fillStyle = 'rgba(169,42,30,.15)';
    ctx.beginPath();
    ctx.arc(w * 0.66, cy + 18, glow, 0, Math.PI * 2);
    ctx.fill();
    AB.text(ctx, `ΔG = ${AB.espan(G, 1)} kcal/mol`, w / 2, h * 0.7, { size: 11, weight: '700', color: AB.PAL.blood });
  } else {
    AB.text(ctx, 'ATP → ADP + Pᵢ', w / 2, h * 0.7, { size: 11, weight: '700', color: AB.PAL.teal });
  }
  AB.text(ctx, '7–14 kcal/mol · típico 12–14', w / 2, h * 0.82, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, split ? '¡se suelta el tercer fosfato!' : 'esperando H₂O…', w / 2, h * 0.92, { size: 8, color: AB.PAL.ink2 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S6 · Sistemas de energía según la prueba
// ═══════════════════════════════════════════════════════════════════════════
export function drawSystems(params: SimParams, flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-systems') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const race = params.sy_race || '400';
  const RACES: Record<string, { t: number; name: string; tw: string; s: number[] }> = {
    '100': { t: 10, name: '100 m', tw: '8 sacudidas', s: [1, 0, 0] },
    '400': { t: 45, name: '400 m', tw: '600 sacudidas', s: [1, 1, 0] },
    '1500': { t: 210, name: '1500 m', tw: '~', s: [1, 1, 1] },
    maraton: { t: 7800, name: 'Maratón', tw: '∞', s: [1, 1, 1] },
  };
  const R = RACES[race] || RACES['400'];

  if (out) {
    out('sy_out', `${R.name}: fosfágenos${R.s[1] ? ' + glucólisis' : ''}${R.s[2] && race !== '400' ? ' + aeróbico' : ''}`);
  }

  // perfil de tasa de ATP en el tiempo
  const gx = w * 0.12,
    g2 = w * 0.95,
    gy = h * 0.14,
    g0 = h * 0.52;
  const X = (t: number) => gx + ((g2 - gx) * t) / 7800;
  const Y = (p: number) => g0 - ((g0 - gy) * p) / 4;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();

  AB.text(ctx, 'tasa de ATP (mol/min)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'tiempo desde el inicio', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '1 s', gx - 4, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '30 min', g2 - 22, g0 + 14, { size: 7, color: AB.PAL.ink3 });

  // fosfágenos: pico que decae
  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const t = (15 * i) / 100;
    const p = 3.6 * Math.exp(-t / 4);
    const x = X(t),
      y = Y(p);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  AB.text(ctx, 'fosfágenos', X(6), gy - 8, { size: 8, color: AB.PAL.blood });

  // glucólisis: meseta que aparece y decae
  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const t = (180 * i) / 200;
    const p = 2.0 * (t > 10 ? 1 : 0) * Math.exp(-(t - 10) / 90);
    const x = X(t),
      y = Y(p);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  AB.text(ctx, 'glucólisis anaeróbica', X(70), Y(1.6) + 2, { size: 8, color: AB.PAL.amber });

  // aeróbico: rampa que se sostiene
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const t = (600 * i) / 200;
    const p = 1.0 * (1 - Math.exp(-t / 40));
    const x = X(t),
      y = Y(p);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  AB.text(ctx, 'aeróbico', X(500), Y(1.0) + 10, { size: 8, color: AB.PAL.teal });

  // marcador de la prueba
  const mark = Math.min(X(R.t), g2 - 2);
  ctx.fillStyle = AB.PAL.ink;
  ctx.beginPath();
  ctx.arc(mark, gy - 4, 4, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, mark, gy, mark, g0, { color: 'rgba(35,44,54,.35)' });

  // sistema dominante
  const ph2 = ((flags.syT || 0) * 4) % 4;
  const systems: [string, string][] = [
    ['fosfágenos · 3,6 mol/min', AB.PAL.blood],
    ['glucólisis · 1,6–2,5', AB.PAL.amber],
    ['aeróbico · 1,0', AB.PAL.teal],
    ['capacidad: 0,7 / 1,2 / 90 mol', AB.PAL.ink],
  ];
  const y0 = h * 0.62;
  systems.forEach((s, i) => {
    const y = y0 + i * 24;
    if (i === Math.floor(ph2)) {
      ctx.fillStyle = 'rgba(13,110,100,.10)';
      ctx.fillRect(gx - 6, y - 10, g2 - gx + 12, 22);
    }
    AB.text(ctx, s[0], gx, y, { size: 9, weight: '700', color: s[1], align: 'left' });
  });
  AB.text(ctx, `${R.name} · ${R.tw}`, w / 2, h * 0.95, { size: 9, weight: '700', color: AB.PAL.ink });
}

// ═══════════════════════════════════════════════════════════════════════════
// S7 · Reservas de energía
// ═══════════════════════════════════════════════════════════════════════════
export function drawReserves(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-reserves') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const f = params.rs_f ?? 1;
  const BMR = 1680 * f;
  const data: [string, number, string][] = [
    ['glucógeno hepático', 451, AB.PAL.amber],
    ['glucógeno muscular', 2050, AB.PAL.teal],
    ['grasa', 74833, AB.PAL.blood],
  ];

  if (out) {
    out('rs_fv', `${AB.espan(f, 1)}×`);
    out('rs_out', `grasa ≈ ${AB.espan(data[2][1] / BMR, 0)} días a ${AB.espan(BMR, 0)} kcal/día`);
  }

  const maxD = data[2][1] / BMR;
  const bx = w * 0.14,
    bw = w * 0.72,
    by = h * 0.16;
  data.forEach((d, i) => {
    const days = d[1] / BMR;
    const hgt = Math.min(bw * 0.5, 8 + (days / maxD) * (bw * 0.42));
    const y = by + i * 44;
    ctx.fillStyle = d[2];
    ctx.fillRect(bx, y, hgt, 18);
    AB.text(ctx, d[0], bx, y - 8, { size: 8, color: AB.PAL.ink2, align: 'left' });
    AB.text(ctx, `${AB.espan(days, days >= 10 ? 0 : 1)} días`, bx + hgt + 8, y + 9, {
      size: 9,
      weight: '700',
      color: d[2],
      align: 'left',
    });
  });
  AB.text(ctx, `a ${AB.espan(BMR, 0)} kcal/día`, w / 2, h * 0.92, { size: 9, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, 'hepático 110 g · muscular 500 g · grasa 7961 g', w / 2, h * 0.97, { size: 7, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S8 · Gasto basal por órgano
// ═══════════════════════════════════════════════════════════════════════════
export function drawOrgans(_params: SimParams, flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-organs') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const data: [string, number, string][] = [
    ['hígado · bazo', 27, AB.PAL.blood],
    ['cerebro', 19, AB.PAL.sagittal],
    ['músculo', 18, AB.PAL.muscle],
    ['riñón', 10, AB.PAL.amber],
    ['corazón', 7, AB.PAL.teal],
    ['resto', 19, AB.PAL.ink3],
  ];
  const active = Math.floor((flags.orT || 0) * 1.4) % 6;

  if (out) {
    out('or_out', `${data[active][0]} ${data[active][1]} %`);
  }

  // dona
  const cx = w * 0.3,
    cy = h * 0.44,
    R = Math.min(66, h * 0.3),
    r = R * 0.55;
  let a0 = -Math.PI / 2;
  data.forEach((d, i) => {
    const a1 = a0 + (d[1] / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, R, a0, a1);
    ctx.arc(cx, cy, r, a1, a0, true);
    ctx.closePath();
    ctx.fillStyle = i === active ? d[2] : 'rgba(107,120,133,.25)';
    ctx.fill();
    ctx.strokeStyle = '#f5f0e4';
    ctx.lineWidth = 2;
    ctx.stroke();
    a0 = a1;
  });
  AB.text(ctx, 'BMR', cx, cy - 8, { size: 10, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, '= 1680 kcal/día', cx, cy + 12, { size: 8, color: AB.PAL.ink3 });

  // leyenda
  const lx = w * 0.56,
    ly = h * 0.12;
  data.forEach((d, i) => {
    const y = ly + i * 24;
    if (i === active) {
      ctx.fillStyle = 'rgba(13,110,100,.10)';
      ctx.fillRect(lx - 8, y - 9, w * 0.38, 20);
    }
    ctx.fillStyle = d[2];
    ctx.fillRect(lx, y, 14, 12);
    AB.text(ctx, `${d[0]} · ${d[1]} %`, lx + 22, y + 6, {
      size: 8,
      color: i === active ? d[2] : AB.PAL.ink2,
      align: 'left',
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// S9 · Ley de Kleiber en escala log-log
// ═══════════════════════════════════════════════════════════════════════════
export function drawKleiber(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-kleiber') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const m = Math.pow(10, ((params.kl_m ?? 70) / 100) * 5.4 - 1.7); // 0.02 → 5000 (log)
  const BMR = 1500 * Math.pow(m / 65, 0.75);

  if (out) {
    const mvText = `${m >= 100 ? AB.espan(m, 0) : m < 1 ? AB.espan(m * 1000, 0) + ' g' : AB.espan(m, 1)} kg`;
    out('kl_mv', mvText);
    out('kl_out', `m = ${AB.espan(m, 1)} kg → BMR ≈ ${AB.espan(BMR, 0)} kcal/día`);
  }

  const gx = w * 0.14,
    g2 = w * 0.94,
    gy = h * 0.14,
    g0 = h * 0.78;
  const L = (x: number, a: number, b: number) => Math.log(x / a) / Math.log(b / a);
  const Xm = (mm: number) => gx + (g2 - gx) * L(mm, 0.02, 5000);
  const Yb = (b: number) => g0 - (g0 - gy) * L(b, 3, 70000);

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();

  AB.text(ctx, 'BMR (kcal/día, log)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'masa m_b (kg, log)', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '0,02', gx - 6, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '5000', g2 - 18, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '3', gx - 4, g0 + 6, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '70000', gx - 34, gy + 6, { size: 7, color: AB.PAL.ink3 });

  // línea m^1 (referencia, pendiente 1 a través del hombre)
  ctx.strokeStyle = 'rgba(35,44,54,.25)';
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(Xm(0.02), Yb((1500 * 0.02) / 65));
  ctx.lineTo(Xm(5000), Yb((1500 * 5000) / 65));
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'm_b^1', gx + 16, gy + 18, { size: 7, color: 'rgba(35,44,54,.5)', align: 'left' });

  // línea m^3/4
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const mm = Math.exp(Math.log(0.02) + (Math.log(250000) * i) / 100);
    const x = Xm(mm),
      y = Yb(1500 * Math.pow(mm / 65, 0.75));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  AB.text(ctx, 'm_b^3/4 · Kleiber', g2 - 10, gy + 16, { size: 7, color: AB.PAL.teal, align: 'right' });

  // puntos de especies
  const pts: [string, number, number][] = [
    ['ratón', 0.02, 3],
    ['mujer', 55, 1260],
    ['hombre', 65, 1500],
    ['elefante', 5000, 70000],
  ];
  pts.forEach((p) => {
    ctx.fillStyle = AB.PAL.blood;
    ctx.beginPath();
    ctx.arc(Xm(p[1]), Yb(p[2]), 4, 0, Math.PI * 2);
    ctx.fill();
    AB.text(ctx, p[0], Xm(p[1]) + 6, Yb(p[2]) - 6, { size: 7, color: AB.PAL.ink2, align: 'left' });
  });

  // punto actual
  ctx.fillStyle = AB.PAL.amber;
  ctx.beginPath();
  ctx.arc(Xm(m), Yb(BMR), 5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, Xm(m), Yb(BMR), Xm(m), g0, { color: AB.PAL.amber });
  AB.text(ctx, `${AB.espan(BMR, 0)} kcal/día`, Xm(m) + 8, Yb(BMR) + 14, { size: 9, weight: '700', color: AB.PAL.amber, align: 'left' });
  AB.text(ctx, 'BMR = c·m^3/4 (c ≈ 90)', w / 2, h * 0.92, { size: 9, weight: '700', color: AB.PAL.teal });
}

// ═══════════════════════════════════════════════════════════════════════════
// S10 · Actividades (Tabla 6.21)
// ═══════════════════════════════════════════════════════════════════════════
export const ACTIVITIES_DATA: [string, number, number, number][] = [
  ['Durmiendo', 71, 83, 0.24],
  ['Sentado', 103, 120, 0.34],
  ['De pie', 108, 125, 0.36],
  ['Caminar 5 km/h', 228, 265, 0.76],
  ['Ciclismo 15 km/h', 344, 400, 1.13],
  ['Natación moderada', 400, 465, 1.32],
  ['Fútbol', 500, 580, 1.65],
  ['Subir escaleras', 589, 685, 1.96],
  ['Baloncesto', 688, 800, 2.28],
  ['Ciclista de carreras', 1400, 1600, 4.62],
];

export function drawAct(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-act') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const idx = Math.min(ACTIVITIES_DATA.length - 1, Math.max(0, params.ac_act ?? 1));
  const D = ACTIVITIES_DATA[idx];
  const maxK = 1400;

  if (out) {
    out('ac_out', `${D[0]} · ${D[1]} kcal/h · ${D[2]} W · ${D[3]} L O₂/min`);
  }

  const bx = w * 0.12,
    bw = w * 0.7,
    by = h * 0.14,
    bh = h * 0.52;
  ACTIVITIES_DATA.forEach((d, i) => {
    const x = bx + i * (bw / ACTIVITIES_DATA.length);
    const hbar = Math.max(6, (d[1] / maxK) * bh);
    ctx.fillStyle = i === idx ? AB.PAL.teal : 'rgba(107,120,133,.28)';
    ctx.fillRect(x + 2, by + bh - hbar, bw / ACTIVITIES_DATA.length - 4, hbar);
    if (i % 2 === 0) {
      AB.text(ctx, d[0].split(' ')[0], x + bw / ACTIVITIES_DATA.length / 2, by + bh - hbar - 8, {
        size: 6.5,
        color: i === idx ? AB.PAL.teal : AB.PAL.ink3,
      });
    }
  });

  AB.text(
    ctx,
    `${D[0]}: ${AB.espan(D[1], 0)} kcal/h · ${AB.espan(D[2], 0)} W · ${AB.espan(D[3], 2)} L O₂/min`,
    w / 2,
    h * 0.84,
    { size: 11, weight: '700', color: AB.PAL.teal }
  );
  AB.text(ctx, 'rango: 71 → 1400 kcal/h (×20)', w / 2, h * 0.92, { size: 8, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S11 · Costo de caminar y correr
// ═══════════════════════════════════════════════════════════════════════════
export function drawLocom(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-locom') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const v = params.lo_v ?? 2;

  function cWalk(x: number): number {
    if (x < 1.2) return 2.13;
    if (x > 2.4) return 3.93 + (x - 2.4) * 6;
    return 2.13 + ((3.93 - 2.13) * (x - 1.2)) / 1.2;
  }
  const cRun = 3.4;
  const vc = 2.05;
  const walkCheap = cWalk(v) * v <= cRun * v;
  const useGait = walkCheap && v < vc ? 'caminar' : v > vc ? 'correr' : 'caminar';
  const cost = useGait === 'correr' ? cRun : cWalk(v);

  if (out) {
    out('lo_vv', `${AB.espan(v, 1)} m/s`);
    out('lo_out', `a ${AB.espan(v, 1)} m/s: ${useGait} ≈ ${AB.espan(cost, 2)} J/kg-m`);
  }

  const gx = w * 0.13,
    g2 = w * 0.95,
    gy = h * 0.14,
    g0 = h * 0.78;
  const X = (x: number) => gx + ((g2 - gx) * x) / 6;
  const Y = (p: number) => g0 - ((g0 - gy) * p) / 30;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();

  AB.text(ctx, 'potencia metabólica (W/kg)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'velocidad (m/s)', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '1', gx - 4, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '6', g2 - 8, g0 + 14, { size: 7, color: AB.PAL.ink3 });

  // caminar
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const x = (6 * i) / 200;
    const y = x * cWalk(x);
    const px = X(x),
      py = Y(y);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  AB.text(ctx, 'caminar', X(1.0), Y(1.0 * cWalk(1.0)) + 12, { size: 8, color: AB.PAL.teal });

  // correr
  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const x = (6 * i) / 200;
    const y = x * cRun;
    const px = X(x),
      py = Y(y);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  AB.text(ctx, 'correr (3,40 J/kg-m)', X(3.4), Y(3.4 * cRun) - 10, { size: 8, color: AB.PAL.blood });

  // cruce ~2,05 m/s
  ctx.fillStyle = AB.PAL.amber;
  ctx.beginPath();
  ctx.arc(X(vc), Y(vc * cWalk(vc)), 4, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, X(vc), gy, X(vc), g0, { color: AB.PAL.amber });
  AB.text(ctx, 'cruce ≈ 2,1 m/s', X(vc), gy + 10, { size: 7, color: AB.PAL.amber });

  // punto actual
  ctx.fillStyle = walkCheap && v < vc ? AB.PAL.teal : AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(v), Y(cost * v), 5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, X(v), Y(cost * v), X(v), g0, { color: 'rgba(35,44,54,.35)' });
  AB.text(ctx, `${AB.espan(cost, 2)} J/kg-m`, X(v) + 8, Y(cost * v) + 14, {
    size: 9,
    weight: '700',
    color: useGait === 'correr' ? AB.PAL.blood : AB.PAL.teal,
    align: 'left',
  });
  AB.text(ctx, `a ${AB.espan(v, 1)} m/s conviene ${useGait}`, w / 2, h * 0.9, { size: 9, weight: '700', color: AB.PAL.ink });
}

// ═══════════════════════════════════════════════════════════════════════════
// S12 · Protocolo de Bruce
// ═══════════════════════════════════════════════════════════════════════════
export const BRUCE_STAGES = [
  { n: 'I', mph: 1.7, gr: 0.1 },
  { n: 'II', mph: 2.5, gr: 0.12 },
  { n: 'III', mph: 3.4, gr: 0.14 },
  { n: 'IV', mph: 4.2, gr: 0.16 },
  { n: 'V', mph: 5.0, gr: 0.18 },
];

export function drawBruce(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-bruce') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const s = Math.min(4, Math.max(0, Math.round(params.br_s ?? 3) - 1));

  function tm(st: (typeof BRUCE_STAGES)[0]): number {
    const v = st.mph * 0.447;
    const sin = Math.sin((st.gr * Math.PI) / 2);
    return 100 + (2.4 + 22.8 * sin) * 75 * v;
  }
  const maxTM = tm(BRUCE_STAGES[4]);
  const t = tm(BRUCE_STAGES[s]);
  const vo2 = t / 5.05;

  if (out) {
    out('br_sv', BRUCE_STAGES[s].n);
    out('br_out', `Etapa ${BRUCE_STAGES[s].n}: TM ≈ ${AB.espan(t, 0)} kcal/h · ${AB.espan(vo2, 1)} L O₂/min`);
  }

  const bx = w * 0.14,
    bw = w * 0.6,
    by = h * 0.16,
    bh = h * 0.56;
  const barW = bw / 5;

  BRUCE_STAGES.forEach((st, i) => {
    const curT = tm(st);
    const hb = Math.max(10, (curT / maxTM) * bh);
    const x = bx + i * barW;
    ctx.fillStyle = i === s ? AB.PAL.teal : 'rgba(107,120,133,.30)';
    ctx.fillRect(x + 3, by + bh - hb, barW - 6, hb);
    ctx.fillStyle = i === s ? AB.PAL.teal : AB.PAL.ink3;
    AB.text(ctx, st.n, x + barW / 2, by + bh - hb - 10, { size: 8, weight: '700' });
  });

  AB.text(ctx, 'TM (kcal/h) · varón de 75 kg', bx + bw / 2, by - 10, { size: 9, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, '0', bx - 6, by + bh + 6, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, AB.espan(maxTM, 0), bx - 6, by, { size: 7, color: AB.PAL.ink3 });

  AB.text(ctx, `Etapa ${BRUCE_STAGES[s].n}: ${AB.espan(t, 0)} kcal/h`, w / 2, h * 0.78, { size: 11, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, `= ${AB.espan(vo2, 1)} L O₂/min (solo carbohidratos)`, w / 2, h * 0.85, { size: 8, color: AB.PAL.ink2 });
  AB.text(ctx, '100 + (2,4 + 22,8·sinθ)·75·v', w / 2, h * 0.93, { size: 8, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S13 · MET
// ═══════════════════════════════════════════════════════════════════════════
export function drawMet(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-met') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const MET = parseFloat(params.me_act || '8') || 1;
  const m = 70;
  const kcalh = (((3.5 * m * MET) / 1000) * 5 * 60);
  const vo2 = 3.5 * MET;

  if (out) {
    out('me_out', `MET ${AB.espan(MET, 1)} · 70 kg → ≈ ${AB.espan(kcalh, 0)} kcal/h`);
  }

  const gx = w * 0.12,
    g2 = w * 0.95,
    gy = h * 0.16,
    g0 = h * 0.72;
  const X = (p: number) => gx + ((g2 - gx) * p) / 20;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();

  AB.text(ctx, 'MET', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, '0', gx - 6, g0 + 6, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '20', g2 - 10, g0 + 6, { size: 7, color: AB.PAL.ink3 });

  // barra MET
  ctx.fillStyle = AB.PAL.teal;
  ctx.fillRect(gx, g0 - (Math.min(MET, 20) / 20) * (g0 - gy), X(MET) - gx, (Math.min(MET, 20) / 20) * (g0 - gy));
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(MET), g0 - (Math.min(MET, 20) / 20) * (g0 - gy), 5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, X(MET), gy, X(MET), g0, { color: AB.PAL.blood });

  AB.text(ctx, `MET ${AB.espan(MET, 1)}`, X(MET), g0 + 16, { size: 9, weight: '700', color: AB.PAL.blood });
  AB.text(ctx, `VO₂ = 3,5·MET = ${AB.espan(vo2, 1)} mL/kg-min`, w / 2, h * 0.8, { size: 9, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, `70 kg → ${AB.espan(kcalh, 0)} kcal/h`, w / 2, h * 0.88, { size: 9, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, 'TM = f·BMR · MET ≈ f/1,5', w / 2, h * 0.95, { size: 8, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S14 · Eficiencia del trabajo mecánico
// ═══════════════════════════════════════════════════════════════════════════
export function drawEff(_params: SimParams, flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-eff') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const data: [string, number, string][] = [
    ['natación libre', 5, AB.PAL.ink3],
    ['patinaje hielo', 11, AB.PAL.ink3],
    ['remo', 15, AB.PAL.ink3],
    ['vagoneteo', 17, AB.PAL.ink3],
    ['máq. vapor', 17, AB.PAL.sagittal],
    ['ciclismo cuesta', 19, AB.PAL.teal],
    ['escaladora', 23, AB.PAL.teal],
    ['ciclismo nivelado', 29, AB.PAL.teal],
    ['caminar horiz.', 27, AB.PAL.teal],
    ['gasolina', 38, AB.PAL.blood],
  ];
  const active = Math.floor((flags.efT || 0) * 1.6) % data.length;
  const eff = data[active][1];

  if (out) {
    out('ef_out', `${data[active][0]} ${eff} % · ${100 - eff} % → calor`);
  }

  const maxE = 40;
  const bx = w * 0.16,
    bw = w * 0.7,
    by = h * 0.1;
  data.forEach((d, i) => {
    const y = by + i * 22;
    ctx.fillStyle = i === active ? d[2] : 'rgba(107,120,133,.30)';
    ctx.fillRect(bx, y, (bw * d[1]) / maxE, 10);
    AB.text(ctx, d[0], bx - 8, y + 5, { size: 7.5, color: i === active ? d[2] : AB.PAL.ink3, align: 'right' });
    AB.text(ctx, `${d[1]} %`, bx + (bw * d[1]) / maxE + 4, y + 5, {
      size: 7.5,
      weight: '700',
      color: i === active ? d[2] : AB.PAL.ink2,
      align: 'left',
    });
  });

  AB.text(ctx, `${data[active][0]} ε = ${eff} % → ${100 - eff} % se vuelve calor`, w / 2, h * 0.9, {
    size: 10,
    weight: '700',
    color: data[active][2],
  });
  AB.text(ctx, 'casi todo el metabolismo termina como calor', w / 2, h * 0.96, { size: 8, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S15 · Potencia máxima vs duración
// ═══════════════════════════════════════════════════════════════════════════
export function drawPower(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-power') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const PTS: [number, number][] = [
    [1500, 6],
    [750, 60],
    [260, 2100],
    [150, 18000],
    [75, 28800],
  ];
  const d = Math.pow(10, 0.778 + (((params.pw_d ?? 12) - 1) / 59) * 4.22); // 6s → 100000s log

  function iP(t: number): number {
    for (let i = 1; i < PTS.length; i++) {
      const [p0, t0] = PTS[i - 1],
        [p1, t1] = PTS[i];
      if (t >= t0 && t <= t1) {
        return p0 * Math.pow(p1 / p0, Math.log(t / t0) / Math.log(t1 / t0));
      }
    }
    return t < PTS[0][1] ? PTS[0][0] : PTS[PTS.length - 1][0];
  }
  const P = iP(d);

  if (out) {
    const dText = d < 60 ? `${AB.espan(d, 0)} s` : d < 3600 ? `${AB.espan(d / 60, 1)} min` : `${AB.espan(d / 3600, 1)} h`;
    out('pw_dv', dText);
    out('pw_out', `${dText} · P ≈ ${AB.espan(P, 0)} W`);
  }

  const gx = w * 0.14,
    g2 = w * 0.94,
    gy = h * 0.14,
    g0 = h * 0.78;
  const L = (x: number, a: number, b: number) => Math.log(x / a) / Math.log(b / a);
  const X = (t: number) => gx + (g2 - gx) * L(t, 6, 100000);
  const Y = (p: number) => g0 - (g0 - gy) * L(p, 75, 1500);

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();

  AB.text(ctx, 'potencia (W, log)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'duración (log)', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '6 s', gx - 6, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '100 ks', g2 - 22, g0 + 14, { size: 7, color: AB.PAL.ink3 });

  // curva
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const t = Math.exp(Math.log(6) + (Math.log(100000 / 6) * i) / 200);
    const x = X(t),
      y = Y(iP(t));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  // puntos
  PTS.forEach((p) => {
    ctx.fillStyle = AB.PAL.blood;
    ctx.beginPath();
    ctx.arc(X(p[1]), Y(p[0]), 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // punto actual
  ctx.fillStyle = AB.PAL.amber;
  ctx.beginPath();
  ctx.arc(X(d), Y(P), 5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, X(d), Y(P), X(d), g0, { color: AB.PAL.amber });
  AB.text(ctx, `P ≈ ${AB.espan(P, 0)} W · E ≈ ${AB.espan((P * d) / 1000, 0)} kJ`, X(d) + 8, Y(P) + 16, {
    size: 9,
    weight: '700',
    color: AB.PAL.amber,
    align: 'left',
  });
  AB.text(ctx, 'anaeróbico → alto, breve · aeróbico → bajo, sostenible', w / 2, h * 0.9, { size: 8, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S16 · Quemar la dona
// ═══════════════════════════════════════════════════════════════════════════
export function drawBurn(params: SimParams, flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-burn') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const TM = params.bn_act ?? 688;
  const idle = TM <= 103;
  const excess = idle ? 1 : TM - 103;
  const hours = 280 / excess;
  const ph = idle ? 0 : Math.min(1, (flags.bnT || 0) % 1);

  const mins = hours * 60;
  const mm = Math.floor(mins),
    ss = Math.round((mins - mm) * 60);

  if (out) {
    out(
      'bn_out',
      idle
        ? 'sentado: nunca'
        : mm >= 60
        ? mm / 60 >= 1 && mm % 60 !== 0
          ? `${mm} min`
          : `${AB.espan(mm / 60, 1)} h (${AB.espan(mins, 0)} min)`
        : `${mm} min ${ss < 10 ? '0' : ''}${ss} s`
    );
  }

  // donut que se «consume»
  const cx = w * 0.28,
    cy = h * 0.34,
    R = Math.min(52, h * 0.24);
  ctx.fillStyle = AB.PAL.amber;
  ctx.beginPath();
  ctx.arc(cx, cy, R * (1 - ph * 0.35), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a87d2e';
  ctx.beginPath();
  ctx.arc(cx, cy, R * (0.45 - ph * 0.2), 0, Math.PI * 2);
  ctx.fill();
  AB.text(ctx, '280 kcal', cx, cy, { size: 9, weight: '700', color: '#fbf8f0' });
  AB.text(ctx, `consumido ${AB.espan(ph * 100, 0)} %`, cx, cy + R + 22, { size: 8, color: AB.PAL.amber });

  // barra de progreso
  const bx = w * 0.52,
    bw = w * 0.42,
    by = h * 0.18;
  ctx.fillStyle = 'rgba(107,120,133,.2)';
  ctx.fillRect(bx, by, bw, 16);
  ctx.fillStyle = AB.PAL.teal;
  ctx.fillRect(bx, by, bw * ph, 16);
  AB.text(ctx, `${AB.espan(ph * 280, 0)} / 280 kcal`, bx + bw / 2, by + 8, { size: 8, weight: '700', color: '#fbf8f0' });

  // tiempo
  AB.text(ctx, `${TM} kcal/h → exceso ${idle ? '—' : AB.espan(excess, 0) + ' kcal/h'}`, w / 2, h * 0.52, {
    size: 9,
    weight: '700',
    color: AB.PAL.ink,
  });
  AB.text(
    ctx,
    `tiempo: ${idle ? 'nunca (sin exceso)' : `${mm} min ${ss < 10 ? '0' : ''}${ss} s`}`,
    w / 2,
    h * 0.62,
    { size: 11, weight: '700', color: AB.PAL.teal }
  );
  AB.text(ctx, 'sentado serían 280/0 → nunca', w / 2, h * 0.72, { size: 8, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S17 · Los 4 modos de pérdida de calor
// ═══════════════════════════════════════════════════════════════════════════
export function drawLoss(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-loss') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const f = params.ls_f ?? 0;
  const rad = 0.8;
  const conv = 0.375 + 1.825 * f; // 0,375 kcal/min en reposo → 2,2 kcal/min intenso
  const swt = 0.105 + 11.895 * f; // 0,105 kcal/min en reposo → 12,0 kcal/min intenso
  const br = 0.21 - 0.21 * f; // 0,21 kcal/min en reposo → ~0 en intenso
  const total = rad + conv + swt + br;
  const segs: [string, number, string][] = [
    ['radiación', rad, AB.PAL.teal],
    ['convección', conv, AB.PAL.sagittal],
    ['sudor', swt, AB.PAL.blood],
    ['respiración', br, AB.PAL.amber],
  ];
  const dom = segs.reduce((a, b) => (a[1] > b[1] ? a : b));

  if (out) {
    out('ls_fv', f < 0.2 ? 'reposo' : f < 0.6 ? 'moderado' : 'intenso');
    out('ls_out', `total ≈ ${AB.espan(total, 1)} kcal/min · domina ${dom[0]}`);
  }

  // barras apiladas
  const bx = w * 0.12,
    bw = w * 0.6,
    by = h * 0.2,
    bh = h * 0.34;
  let acc = 0;
  segs.forEach((s) => {
    ctx.fillStyle = s[2];
    ctx.fillRect(bx, by + bh * acc, bw, (bh * s[1]) / total);
    acc += s[1] / total;
  });
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(bx, by, bw, bh);
  AB.text(ctx, `total ≈ ${AB.espan(total, 1)} kcal/min`, bx + bw + 10, by + bh / 2, {
    size: 9,
    weight: '700',
    color: AB.PAL.ink,
    align: 'left',
  });

  // leyenda con flechas
  segs.forEach((s, i) => {
    const y = h * 0.66 + i * 22;
    ctx.fillStyle = s[2];
    ctx.fillRect(w * 0.14, y, 14, 12);
    AB.text(ctx, `${s[0]} · ${AB.espan((s[1] / total) * 100, 0)} %`, w * 0.22, y + 6, {
      size: 8,
      color: AB.PAL.ink2,
      align: 'left',
    });
  });

  // figura: cilindro humano
  const hx = w * 0.8,
    hy = h * 0.52,
    hw = w * 0.1,
    hh = h * 0.3;
  ctx.fillStyle = AB.PAL.skin;
  ctx.beginPath();
  ctx.ellipse(hx, hy - hh / 2, hw / 2, hh / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(hx, hy - hh / 2 - hw * 0.18, hw * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  AB.text(ctx, 'cuerpo', hx, hy - hh / 2 - hw * 0.5, { size: 7, color: AB.PAL.ink3 });
  AB.arrow(ctx, hx, hy - hh / 2 - 8, hx + hw * 0.9, hy - hh / 2 - 26, { color: AB.PAL.teal, width: 2 });
  AB.arrow(ctx, hx + hw / 2 + 8, hy, hx + hw / 2 + 30, hy, { color: AB.PAL.sagittal, width: 2 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S18 · Radiación de cuerpo negro
// ═══════════════════════════════════════════════════════════════════════════
export function drawRad(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-rad') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const Troom = 273 + Math.max(0, Math.min(40, params.ra_t ?? 24));
  const Tskin = 307;
  const sig = 5.67e-8;
  const A = 1.85;
  const Remit = sig * Math.pow(Tskin, 4) * A;
  const Rgain = sig * Math.pow(Troom, 4) * A;
  const net = Remit - Rgain;

  if (out) {
    out('ra_tv', `${AB.espan(Troom - 273, 0)} °C`);
    out('ra_out', `${net > 0 ? 'pérdida neta' : 'ganancia neta'} ≈ ${AB.espan(Math.abs(net), 0)} W`);
  }

  // espectro de Planck
  const gx = w * 0.12,
    g2 = w * 0.95,
    gy = h * 0.14,
    g0 = h * 0.62;
  const X = (l: number) => gx + ((g2 - gx) * l) / 40;

  function planck(l: number, T: number): number {
    const a = 2 * 6.626e-34 * 3e8 * 3e8;
    const b = (6.626e-34 * 3e8) / (1.381e-23 * T);
    return a / (Math.pow(l * 1e-6, 5) * (Math.exp(b / (l * 1e-6)) - 1));
  }
  const skinPeak = planck(9.7, Tskin);

  function trace(T: number, col: string, lw?: number): void {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw || 2.2;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const l = 0.2 + (39.8 * i) / 300;
      const x = X(l),
        y = g0 - ((g0 - gy) * planck(l, T)) / skinPeak;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();

  AB.text(ctx, 'intensidad (λ,T)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'λ (μm)', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '0', gx - 4, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '40', g2 - 12, g0 + 14, { size: 7, color: AB.PAL.ink3 });

  trace(Tskin, AB.PAL.teal, 2.6);
  trace(Troom, AB.PAL.amber, 2.2);
  AB.text(ctx, 'piel 307 K (34 °C)', gx + 10, gy + 16, { size: 8, color: AB.PAL.teal, align: 'left' });
  AB.text(ctx, `ambiente ${AB.espan(Troom - 273, 0)} °C`, gx + 10, gy + 30, { size: 8, color: AB.PAL.amber, align: 'left' });

  // pico de Wien
  const lpk = 2898 / Tskin;
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(lpk), g0 - ((g0 - gy) * planck(lpk, Tskin)) / skinPeak, 4, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, X(lpk), gy, X(lpk), g0, { color: AB.PAL.blood });
  AB.text(ctx, 'pico ≈ 9,4 μm', X(lpk), gy + 8, { size: 7, color: AB.PAL.blood });

  // números
  AB.text(ctx, `emite ${AB.espan(Remit, 0)} W · recibe ${AB.espan(Rgain, 0)} W`, w / 2, h * 0.72, {
    size: 9,
    color: AB.PAL.ink2,
  });
  AB.text(
    ctx,
    net > 0 ? `pérdida neta ≈ ${AB.espan(net, 0)} W` : `ganancia neta ≈ ${AB.espan(-net, 0)} W`,
    w / 2,
    h * 0.8,
    { size: 12, weight: '700', color: net > 0 ? AB.PAL.teal : AB.PAL.blood }
  );
  AB.text(ctx, 'R = εσT⁴ · ε_piel ≈ 0,95 · A = 1,85 m²', w / 2, h * 0.9, { size: 8, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S19 · Convección, viento y ropa
// ═══════════════════════════════════════════════════════════════════════════
export function drawConv(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-conv') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const wind = params.cv_w ?? 2;
  const clo = params.cv_c ?? 1;
  const Tair = 20;
  const hc = 8.3 * Math.sqrt(Math.max(0, wind)); // W/m²-°C
  const loss = hc * (34 - Tair);
  const Iclothes = 0.155 * clo;
  const qcond = (37 - Tair) / (0.05 + Iclothes + 0.08);

  if (out) {
    out('cv_wv', `${AB.espan(wind, 1)} m/s`);
    out('cv_cv', `${AB.espan(clo, 1)} Clo`);
    out('cv_out', `h_c ≈ ${AB.espan(hc, 1)} W/m²-°C · q_ropa ≈ ${AB.espan(qcond, 0)} W/m²`);
  }

  // panel izquierdo: convección
  const px1 = w * 0.05,
    pw1 = w * 0.44,
    py1 = h * 0.12;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px1, py1);
  ctx.lineTo(px1, h * 0.8);
  ctx.lineTo(px1 + pw1, h * 0.8);
  ctx.stroke();
  AB.text(ctx, 'h_c (W/m²-°C)', px1 + 4, py1 + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  const X1 = (val: number) => px1 + (pw1 * val) / 27;
  ctx.fillStyle = AB.PAL.sagittal;
  ctx.fillRect(px1, py1 + 30, Math.min(pw1, X1(hc) - px1), h * 0.5);
  AB.text(ctx, AB.espan(hc, 1), X1(hc) + 6, py1 + 30 + h * 0.25, {
    size: 9,
    weight: '700',
    color: AB.PAL.sagittal,
    align: 'left',
  });
  AB.text(ctx, 'convección: h_c = 8,3√w', px1 + pw1 / 2, h * 0.86, { size: 8, color: AB.PAL.sagittal });
  AB.text(ctx, `pérdida ≈ ${AB.espan(loss, 0)} W/m²`, px1 + pw1 / 2, h * 0.93, { size: 8, color: AB.PAL.ink2 });

  // panel derecho: conducción a través de la ropa
  const px2 = w * 0.56,
    pw2 = w * 0.4,
    py2 = h * 0.12;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px2, py2);
  ctx.lineTo(px2, h * 0.8);
  ctx.lineTo(px2 + pw2, h * 0.8);
  ctx.stroke();
  AB.text(ctx, 'flujo con ropa (W/m²)', px2 + 4, py2 + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  ctx.fillStyle = AB.PAL.amber;
  ctx.fillRect(px2, py2 + 30, pw2, (qcond / 400) * h * 0.5);
  AB.text(ctx, AB.espan(qcond, 0), px2 + 8, py2 + 30 + (qcond / 400) * h * 0.5 + 14, {
    size: 9,
    weight: '700',
    color: AB.PAL.amber,
    align: 'left',
  });
  AB.text(ctx, 'q = ΔT/(0,05 + 0,155·Clo + 0,08)', px2 + pw2 / 2, h * 0.86, { size: 7.5, color: AB.PAL.amber });

  // sensación térmica
  const wkm = wind * 3.6;
  const Twc =
    Tair >= 0 && wkm >= 1
      ? 13.12 + 0.6215 * Tair - 11.37 * Math.pow(wkm, 0.16) + 0.3965 * Tair * Math.pow(wkm, 0.16)
      : Tair;
  AB.text(ctx, `wind chill: ${AB.espan(Twc, 1)} °C (T_aire 20 °C)`, w / 2, h * 0.96, {
    size: 8,
    weight: '700',
    color: AB.PAL.blood,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// S20 · Evaporación y humedad
// ═══════════════════════════════════════════════════════════════════════════
export function drawSweat(params: SimParams, flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-sweat') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const RH = params.sw_h ?? 50;
  // índice de calor a 32 °C
  const HI =
    RH <= 50 ? 32 + (3 * RH) / 50 : RH <= 75 ? 35 + (8 * (RH - 50)) / 25 : RH <= 100 ? 43 + (13 * (RH - 75)) / 25 : 56;
  const evap = Math.max(0.05, 1 - RH / 105);
  const ph = (flags.swT || 0) % 1;

  if (out) {
    out('sw_hv', `${RH} %`);
    out('sw_out', `32 °C + ${RH} % HR → se siente ${AB.espan(HI, 0)} °C`);
  }

  // gota que evapora
  const cx = w * 0.24,
    cy = h * 0.3;
  const dropR = Math.min(26, h * 0.12) * (1 - evap * 0.5) * (0.9 + 0.2 * Math.sin(ph * Math.PI * 2));
  ctx.fillStyle = 'rgba(45,125,79,' + (0.5 + 0.3 * Math.sin(ph * Math.PI * 2)) + ')';
  ctx.beginPath();
  ctx.ellipse(cx, cy, dropR, dropR * 1.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // vapor subiendo
  for (let i = 0; i < 4; i++) {
    const vy = cy - 30 - ((ph * 40 + i * 12) % 50);
    ctx.fillStyle = 'rgba(107,120,133,.4)';
    ctx.beginPath();
    ctx.arc(cx + (i % 2 ? 10 : -6), vy, 4 + evap * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  AB.text(ctx, 'sudor', cx, cy + dropR * 1.6 + 10, { size: 8, color: AB.PAL.ink2 });
  AB.text(ctx, `evaporación: ${AB.espan(evap * 100, 0)} %`, cx, cy + dropR * 1.6 + 24, {
    size: 8,
    weight: '700',
    color: AB.PAL.good,
  });

  // termómetro de sensación
  const tx = w * 0.56,
    ty = h * 0.16,
    th = h * 0.56;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx, ty + th);
  ctx.stroke();

  const Y = (T: number) => ty + th - ((T - 30) / (60 - 30)) * th;
  ctx.fillStyle = AB.PAL.blood;
  ctx.fillRect(tx - 6, Y(HI), 12, ty + th - Y(HI));

  AB.text(ctx, '32 °C real', tx, ty + th + 14, { size: 8, color: AB.PAL.ink2 });
  AB.text(ctx, HI > 45 ? 'peligro extremo' : HI > 41 ? 'peligro' : HI > 32 ? 'precaución extrema' : 'precaución', w / 2, h * 0.82, {
    size: 9,
    weight: '700',
    color: AB.PAL.blood,
  });
  AB.text(ctx, HI <= 40 ? `se siente ${AB.espan(HI, 0)} °C` : `¡se siente ${AB.espan(HI, 0)} °C!`, w / 2, h * 0.9, {
    size: 11,
    weight: '700',
    color: AB.PAL.blood,
  });
  AB.text(ctx, '540 kcal por L de agua evaporada', w / 2, h * 0.97, { size: 8, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S21 · Producción de calor vs temperatura ambiente
// ═══════════════════════════════════════════════════════════════════════════
export function drawThermo(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-thermo') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const T = Math.max(0, Math.min(45, params.th_t ?? 20));
  const Tc = 26,
    Th = 33;

  function H(x: number): number {
    if (x < Tc) return 7 + (Tc - x) * 0.35;
    if (x < Th) return 1;
    return 1 + (x - Th) * 0.55;
  }

  const ht = H(T);
  const state = T < Tc ? 'termogénesis: tiritando' : T < Th ? 'zona termoneutral: gasto mínimo' : 'calor: domina la evaporación';

  if (out) {
    out('th_tv', `${AB.espan(T, 0)} °C`);
    out('th_out', state);
  }

  const gx = w * 0.13,
    g2 = w * 0.95,
    gy = h * 0.14,
    g0 = h * 0.76;
  const X = (x: number) => gx + ((g2 - gx) * x) / 45;
  const Y = (p: number) => g0 - ((g0 - gy) * Math.min(p, 9)) / 9;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();

  AB.text(ctx, 'producción de calor (rel.)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'T ambiente (°C)', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '0', gx - 4, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '45', g2 - 12, g0 + 14, { size: 7, color: AB.PAL.ink3 });

  // zona termoneutral
  ctx.fillStyle = 'rgba(13,110,100,.10)';
  ctx.fillRect(X(Tc), gy, X(Th) - X(Tc), g0 - gy);

  // curva
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let i = 0; i <= 300; i++) {
    const x = (45 * i) / 300;
    const px = X(x),
      py = Y(H(x));
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();

  AB.text(ctx, 'tiritar', X(8), Y(H(8)), { size: 8, color: AB.PAL.teal });
  AB.text(ctx, 'termoneutral', (X(Tc) + X(Th)) / 2, gy + 12, { size: 8, color: AB.PAL.teal });
  AB.text(ctx, 'evaporación', X(40), Y(H(40)) + 12, { size: 8, color: AB.PAL.blood });
  AB.dashed(ctx, X(Tc), gy, X(Tc), g0, { color: AB.PAL.ink3 });
  AB.text(ctx, 'T_c=26', X(Tc), g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, 'T_h≈33', X(Th), g0 + 14, { size: 7, color: AB.PAL.ink3 });

  // punto actual
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(T), Y(ht), 5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, X(T), Y(ht), X(T), g0, { color: AB.PAL.blood });

  AB.text(ctx, state, w / 2, h * 0.86, { size: 10, weight: '700', color: AB.PAL.blood });
  AB.text(ctx, 'metabolismo de cumbre ≈ 7× el ayuno', w / 2, h * 0.94, { size: 8, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// S22 · Modelo en serie: núcleo → piel → ropa → aire
// ═══════════════════════════════════════════════════════════════════════════
export function drawCore(params: SimParams, _flags: SimFlags, out?: OutFn): void {
  const cv = document.getElementById('sim-core') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);

  const Tair = Math.max(-10, Math.min(40, params.co_t ?? 20));
  const clo = params.co_c ?? 1;
  const Tcore = 37;
  const It = 0.05,
    Ia = 0.08,
    Ic = 0.155 * clo;
  const q = (Tcore - Tair) / (It + Ic + Ia);
  const Tskin = Tcore - It * q;
  const Tcloth = Tskin - Ic * q;

  if (out) {
    out('co_tv', `${AB.espan(Tair, 0)} °C`);
    out('co_cv', `${AB.espan(clo, 1)} Clo`);
    out('co_out', `T_piel ≈ ${AB.espan(Tskin, 1)} °C · q ≈ ${AB.espan(q, 0)} W/m²`);
  }

  // regiones
  const zones: [string, number, string][] = [
    ['núcleo', Tcore, AB.PAL.blood],
    ['piel', Tskin, AB.PAL.teal],
    ['ropa', Tcloth, AB.PAL.amber],
    ['aire', Tair, AB.PAL.sagittal],
  ];
  const n = 4,
    zx = w * 0.16,
    zw = w * 0.68,
    zy = h * 0.18,
    zh = h * 0.52;
  zones.forEach((z, i) => {
    const x = zx + (i * zw) / n;
    ctx.fillStyle = z[2] + '22';
    ctx.fillRect(x, zy, zw / n + 1, zh);
    ctx.strokeStyle = AB.PAL.line;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x, zy, zw / n, zh);
    AB.text(ctx, z[0], x + zw / (2 * n), zy - 12, { size: 8, weight: '700', color: z[2] });
  });

  // perfil de temperatura
  ctx.strokeStyle = AB.PAL.ink;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  const pts: [string, number][] = [
    ['núcleo', Tcore],
    ['piel', Tskin],
    ['ropa', Tcloth],
    ['aire', Tair],
  ];
  pts.forEach((p, i) => {
    const x = zx + (zw * (i + 0.5)) / n;
    const y = zy + zh - ((p[1] - -15) / (55 - -15)) * zh;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();

  // puntos
  pts.forEach((p, i) => {
    const x = zx + (zw * (i + 0.5)) / n;
    const y = zy + zh - ((p[1] - -15) / (55 - -15)) * zh;
    ctx.fillStyle = AB.PAL.ink;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    AB.text(ctx, `${AB.espan(p[1], 1)} °C`, x, y - 12, { size: 8, weight: '700', color: AB.PAL.ink });
  });

  // flujo
  AB.arrow(ctx, zx + zw / 2, zy + zh + 12, zx + zw / 2 + 40, zy + zh + 12, { color: AB.PAL.blood, width: 2.4 });
  AB.text(ctx, `q ≈ ${AB.espan(q, 0)} W/m²`, zx + zw / 2 + 46, zy + zh + 12, {
    size: 8,
    weight: '700',
    color: AB.PAL.blood,
    align: 'left',
  });
  AB.text(ctx, 'T_núcleo − T_piel = I_t·q', w / 2, h * 0.84, { size: 9, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, 'aislamientos: tejido 0,05 · ropa 0,155·Clo · aire 0,08', w / 2, h * 0.92, { size: 7.5, color: AB.PAL.ink3 });
}

// ═══════════════════════════════════════════════════════════════════════════
// Despachador de redibujado por diapositiva
// ═══════════════════════════════════════════════════════════════════════════
export function redrawSlide(
  slide: number,
  _t: number,
  params: SimParams,
  flags: SimFlags,
  out?: OutFn
): void {
  switch (slide) {
    case 1:
      drawBalance(params, flags, out);
      break;
    case 2:
      drawHeat(params, flags, out);
      break;
    case 3:
      drawOx(params, flags, out);
      break;
    case 4:
      drawDonut(params, flags, out);
      break;
    case 5:
      drawAtp(params, flags, out);
      break;
    case 6:
      drawSystems(params, flags, out);
      break;
    case 7:
      drawReserves(params, flags, out);
      break;
    case 8:
      drawOrgans(params, flags, out);
      break;
    case 9:
      drawKleiber(params, flags, out);
      break;
    case 10:
      drawAct(params, flags, out);
      break;
    case 11:
      drawLocom(params, flags, out);
      break;
    case 12:
      drawBruce(params, flags, out);
      break;
    case 13:
      drawMet(params, flags, out);
      break;
    case 14:
      drawEff(params, flags, out);
      break;
    case 15:
      drawPower(params, flags, out);
      break;
    case 16:
      drawBurn(params, flags, out);
      break;
    case 17:
      drawLoss(params, flags, out);
      break;
    case 18:
      drawRad(params, flags, out);
      break;
    case 19:
      drawConv(params, flags, out);
      break;
    case 20:
      drawSweat(params, flags, out);
      break;
    case 21:
      drawThermo(params, flags, out);
      break;
    case 22:
      drawCore(params, flags, out);
      break;
    default:
      break;
  }
}
