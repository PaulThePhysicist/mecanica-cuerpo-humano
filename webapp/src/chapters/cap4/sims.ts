// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 4 · Motor de simulaciones 2D y cálculos físicos (TypeScript)
//  "Propiedades mecánicas del cuerpo" — Física del Cuerpo Humano (I. P. Herman)
// ═══════════════════════════════════════════════════════════════════════════

import * as AB from './ab';
import { fmt, espan } from './ab';

export interface ModuleDef {
  id: number;
  name: string;
  slides: number[];
  ico: string;
}

export const TOTAL = 21;

export const MODULES: ModuleDef[] = [
  { id: 0, name: 'Inicio',           slides: [0],        ico: '🏠' },
  { id: 1, name: 'Componentes',      slides: [1, 2],     ico: '🦴' },
  { id: 2, name: 'Elásticos',        slides: [3, 4, 5],  ico: '🧲' },
  { id: 3, name: 'Energía',          slides: [6, 7],     ico: '⚡' },
  { id: 4, name: 'Materiales',       slides: [8, 9],     ico: '📈' },
  { id: 5, name: 'Flexión',          slides: [10, 11],   ico: '📐' },
  { id: 6, name: 'Viscoelasticidad', slides: [12, 13, 14], ico: '⏱️' },
  { id: 7, name: 'Fracturas',        slides: [15, 16, 17], ico: '💥' },
  { id: 8, name: 'Seguridad·Alim.',  slides: [18, 19, 20], ico: '⛑️' },
];

export interface SimParams {
  ts_ang: number;
  hk_F: number;
  fe_W: number;
  sh_g: number;
  en_e: number;
  to_e: number;
  bm_F: number;
  ho_r: number;
  md_tau: number;
  kl_T: number;
  bk_L: number;
  bk_P: number;
  cr_a: number;
  cr_s: number;
  fo_e: number;
}

export const DEFAULT_PARAMS: SimParams = {
  ts_ang: 0,
  hk_F: 350,
  fe_W: 700,
  sh_g: 3,
  en_e: 0.001,
  to_e: 6,
  bm_F: 1000,
  ho_r: 0.5,
  md_tau: 0.6,
  kl_T: 0,
  bk_L: 0.5,
  bk_P: 700,
  cr_a: 1,
  cr_s: 20,
  fo_e: 50,
};

export interface SimFlags {
  boneMat: 'compacto' | 'trabecular' | 'tendon' | 'cabello';
  curveMat: 'acero' | 'hueso' | 'trabecular' | 'granito';
  el_mode: 'spring' | 'dashpot';
  md_mode: 'maxwell' | 'voigt';
  fr_mode: 'traccion' | 'compresion' | 'torsion';
  hl_mat: 'A' | 'B' | 'C';
  fo_mode: 'dura' | 'tenaz';
  achPlaying: boolean;
  achT: number;
  mdPlaying: boolean;
  mdT: number;
  klPlaying: boolean;
  klT: number;
  frPlaying: boolean;
  frT: number;
  injPlaying: boolean;
  injT: number;
}

export const DEFAULT_FLAGS: SimFlags = {
  boneMat: 'compacto',
  curveMat: 'hueso',
  el_mode: 'spring',
  md_mode: 'maxwell',
  fr_mode: 'traccion',
  hl_mat: 'B',
  fo_mode: 'dura',
  achPlaying: false,
  achT: 0,
  mdPlaying: false,
  mdT: 0,
  klPlaying: false,
  klT: 0,
  frPlaying: false,
  frT: 0,
  injPlaying: false,
  injT: 0,
};

type OutFn = (id: string, text: string) => void;

function getCanvas(id: string): HTMLCanvasElement | null {
  return document.getElementById(id) as HTMLCanvasElement | null;
}

/* ═══════════════════════════════════════════════════════════
   S1 · Componentes del cuerpo — curvas σ–ε por tejido
   ═══════════════════════════════════════════════════════════ */
export const BONE_DATA: Record<string, { name: string; Y: number; uts?: number; ucs?: number; emax: number }> = {
  compacto:   { name: 'Hueso compacto',   Y: 17.9,  uts: 120, ucs: 170, emax: 2.0 },
  trabecular: { name: 'Hueso trabecular', Y: 0.076, uts: 1.6, ucs: 2.2, emax: 6.0 },
  tendon:     { name: 'Tendón',           Y: 0.25,  uts: 100, ucs: 0,   emax: 12 },
  cabello:    { name: 'Cabello',          Y: 2.5,   uts: 197, ucs: 0,   emax: 9 },
};

export function drawBone(flags: SimFlags, out: OutFn) {
  const cv = getCanvas('sim-bone');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const d = BONE_DATA[flags.boneMat] || BONE_DATA.compacto;

  const ex = w * 0.1, e2 = w * 0.94, ey = h * 0.1, e0 = h * 0.86;
  const smax = Math.max(220, ((d.ucs || 0) > (d.uts || 0) ? (d.ucs || 0) : (d.uts || 0)) * 1.15);
  const emax = Math.max(d.emax, 4);
  const X = (v: number) => ex + ((e2 - ex) * v) / emax;
  const Yv = (v: number) => e0 - ((e0 - ey) * v) / smax;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex, e0);
  ctx.lineTo(e2, e0);
  ctx.stroke();

  AB.text(ctx, '0', ex - 6, e0 + 10, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, 'ε (%)', e2 - 24, e0 + 14, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'σ (MPa)', ex + 6, ey + 6, { size: 8, color: AB.PAL.ink3, align: 'left' });

  for (let g = 1; g <= 3; g++) {
    AB.dashed(ctx, ex + ((e2 - ex) * g) / 4, ey, ex + ((e2 - ex) * g) / 4, e0, { color: 'rgba(35,44,54,.08)' });
  }

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const eps = (emax * i) / N;
    let s: number;
    if (d.ucs && d.ucs > 0 && eps * 0.01 * d.Y * 1000 >= d.ucs && d.emax < 8) {
      s = Math.min(d.ucs, eps * 0.01 * d.Y * 1000);
    } else if (d.uts && d.uts > 0) {
      s = d.uts > 100 ? Math.min(d.uts, eps * 12) : 197 * Math.min(1, eps / 9);
    } else {
      s = eps * 0.01 * d.Y * 1000;
    }
    const x = X(eps), y = Yv(s);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  if (d.uts) {
    ctx.fillStyle = AB.PAL.blood;
    ctx.beginPath();
    ctx.arc(X(d.emax * 0.95), Yv(d.uts), 4, 0, Math.PI * 2);
    ctx.fill();
    AB.text(ctx, 'UTS ' + fmt(d.uts, 0), X(d.emax * 0.95) - 8, Yv(d.uts) - 10, { size: 8, color: AB.PAL.blood, align: 'right' });
  }
  if (d.ucs) {
    ctx.fillStyle = AB.PAL.amber;
    ctx.beginPath();
    ctx.arc(X(d.emax * 0.95), Yv(d.ucs), 4, 0, Math.PI * 2);
    ctx.fill();
    AB.text(ctx, 'UCS ' + fmt(d.ucs, 1), X(d.emax * 0.95) + 8, Yv(d.ucs) + 4, { size: 8, color: AB.PAL.amber, align: 'left' });
  }

  AB.text(ctx, d.name, (ex + e2) / 2, ey - 14, { size: 11, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, 'Y = ' + fmt(d.Y, 2) + ' GPa', (ex + e2) / 2, e0 + 14, { size: 9, color: AB.PAL.teal });
  out('bn_out', 'Y = ' + fmt(d.Y, d.Y >= 1 ? 2 : 3) + ' GPa · UTS ' + fmt(d.uts || 0, 0) + ' MPa · UCS ' + fmt(d.ucs || 0, 1) + ' MPa');
}

/* ═══════════════════════════════════════════════════════════
   S2 · Anisotropía del hueso — fibras que giran
   ═══════════════════════════════════════════════════════════ */
export function drawTissue(params: SimParams, out: OutFn) {
  const cv = getCanvas('sim-tissue');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const th = params.ts_ang || 0;
  const rad = (th * Math.PI) / 180;
  const YL = 17.4, YT = 9.6;
  const Yeff = YL * Math.cos(rad) * Math.cos(rad) + YT * Math.sin(rad) * Math.sin(rad);

  const bx = w * 0.16, by = h * 0.22, bw = w * 0.44, bh = h * 0.56;
  ctx.fillStyle = AB.PAL.bone;
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, by, bw, bh);

  ctx.strokeStyle = AB.PAL.boneDark;
  ctx.lineWidth = 1.6;
  const step = 14;
  ctx.save();
  ctx.translate(bx + bw / 2, by + bh / 2);
  ctx.rotate(rad);
  for (let gy = -bh / 2; gy <= bh / 2; gy += step) {
    ctx.beginPath();
    ctx.moveTo(-bw / 2, gy);
    ctx.lineTo(bw / 2, gy);
    ctx.stroke();
  }
  ctx.restore();
  AB.text(ctx, 'osteonas / fibras', bx + bw / 2, by - 12, { size: 9, weight: '700', color: AB.PAL.ink2 });

  const gx = w * 0.74, g0 = h * 0.22, g1 = h * 0.78;
  const frac = (Yeff - YT) / (YL - YT);
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gx, g1);
  ctx.lineTo(gx, g0);
  ctx.stroke();
  ctx.fillStyle = AB.PAL.teal;
  ctx.fillRect(gx - 5, g1 - (g1 - g0) * frac, 10, (g1 - g0) * frac);
  AB.text(ctx, 'Y', gx, g0 - 10, { size: 8, color: AB.PAL.teal, weight: '700' });
  AB.text(ctx, '17,4', gx - 26, g0 + 4, { size: 8, color: AB.PAL.ink2, align: 'right' });
  AB.text(ctx, '9,6', gx - 26, g1 + 4, { size: 8, color: AB.PAL.ink2, align: 'right' });
  AB.text(ctx, 'θ = ' + fmt(th, 0) + '°', gx, g1 + 18, { size: 9, weight: '700', color: AB.PAL.amber });
  out('ts_out', 'Y(θ) = ' + fmt(Yeff, 1) + ' GPa' + (th > 0 && th < 90 ? '  (' + fmt(100 * (1 - Yeff / YL), 0) + ' % menos)' : ''));
}

/* ═══════════════════════════════════════════════════════════
   S3 · Resorte Hookeano — resorte + gráfica σ–ε
   ═══════════════════════════════════════════════════════════ */
export function drawHooke(params: SimParams, out: OutFn) {
  const cv = getCanvas('sim-hooke');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const F = params.hk_F || 0;
  const A = 370, L0 = 500, Y = 17900;
  const sig = F / A, eps = sig / Y, dL = eps * L0;

  const sx = w * 0.08, sy = h * 0.28, sw = w * 0.34, sh = h * 0.44;
  const stretch = Math.min(1, F / 700) * 14;
  AB.text(ctx, 'F = ' + espan(Math.round(F)) + ' N', sx + sw / 2, sy - 16, { size: 9, weight: '700', color: AB.PAL.teal });
  ctx.strokeStyle = AB.PAL.ink2;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx + sw / 2, sy);
  ctx.lineTo(sx + sw / 2, sy + 14 + stretch);
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const coils = 7, cTop = sy + 16 + stretch, cBot = sy + sh - 16 - stretch;
  ctx.moveTo(sx + sw / 2, cTop);
  for (let i = 0; i < coils; i++) {
    const t0 = i / coils;
    ctx.lineTo(sx + sw / 2 - sw * 0.16, cTop + (cBot - cTop) * t0 + (i % 2 ? sw * 0.16 : 0));
    ctx.lineTo(sx + sw / 2 + sw * 0.16, cTop + (cBot - cTop) * (t0 + 0.5));
  }
  ctx.lineTo(sx + sw / 2, cBot);
  ctx.stroke();
  ctx.strokeStyle = AB.PAL.ink2;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx + sw / 2, cBot);
  ctx.lineTo(sx + sw / 2, sy + sh);
  ctx.stroke();

  AB.arrow(ctx, sx + sw / 2, sy + 14 + stretch, sx + sw / 2, sy + 40 + stretch, { color: AB.PAL.blood });
  AB.text(ctx, 'ΔL = ' + fmt(dL, 3) + ' mm', sx + sw / 2, sy + sh + 16, { size: 8, color: AB.PAL.blood });

  const gx = w * 0.56, g2 = w * 0.94, gy = h * 0.14, g0 = h * 0.8;
  const sigMax = 3, epsMax = 0.02;
  const X = (v: number) => gx + ((g2 - gx) * v) / epsMax;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / sigMax;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'σ (MPa)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'ε (%)', g2 - 20, g0 + 12, { size: 8, color: AB.PAL.ink3 });

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(X(0), Yv(0));
  ctx.lineTo(X(epsMax), Yv((epsMax * Y) / 1000 * 0.95));
  ctx.stroke();

  const px = X(eps), py = Yv(sig);
  ctx.fillStyle = sig >= 2.1 ? AB.PAL.amber : AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, px, py, px, g0, { color: AB.PAL.ink3 });
  AB.text(ctx, 'σ = ' + fmt(sig, 2) + ' MPa', gx + 8, gy + 16, { size: 8, color: AB.PAL.teal, align: 'left', weight: '700' });
  AB.text(ctx, 'ε = ' + fmt(eps * 100, 3) + ' %', gx + 8, gy + 28, { size: 8, color: AB.PAL.teal, align: 'left' });
  AB.text(ctx, 'Y = pendiente = 17,9 GPa', gx + 8, g0 - 8, { size: 8, color: AB.PAL.ink2, align: 'left' });
  out('hk_out', 'σ = ' + fmt(sig, 2) + ' MPa · ε = ' + fmt(eps * 100, 3) + ' % · ΔL = ' + fmt(dL, 3) + ' mm');
}

/* ═══════════════════════════════════════════════════════════
   S4 · Acortamiento del fémur — σ–ε con el punto de operación
   ═══════════════════════════════════════════════════════════ */
export function drawFemur(params: SimParams, out: OutFn) {
  const cv = getCanvas('sim-femur');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const W = params.fe_W || 0;
  const A = 370, L0 = 500, Y = 17900, UCS = 170;
  const sig = W / A, eps = sig / Y, dL = eps * L0;

  const bx = w * 0.1, by = h * 0.16, bw = w * 0.3;
  const short = Math.min(1, dL / 5);
  ctx.fillStyle = AB.PAL.bone;
  ctx.fillRect(bx, by + short * (h * 0.2), bw, h * 0.68);
  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, by + short * (h * 0.2), bw, h * 0.68);
  AB.text(ctx, 'fémur', bx + bw / 2, by + h * 0.05, { size: 9, weight: '700', color: AB.PAL.ink2 });
  AB.arrow(ctx, bx + bw / 2, by - 8, bx + bw / 2, by - 30, { color: AB.PAL.blood });
  AB.text(ctx, espan(Math.round(W)) + ' N', bx + bw / 2, by - 38, { size: 8, color: AB.PAL.blood });
  if (dL > 0.5) AB.text(ctx, 'ΔL = ' + fmt(dL, 1) + ' mm', bx + bw / 2, by + h * 0.8, { size: 8, color: AB.PAL.blood });

  const gx = w * 0.52, g2 = w * 0.94, gy = h * 0.14, g0 = h * 0.82;
  const epsMax = 1.0, sigMax = 180;
  const X = (v: number) => gx + ((g2 - gx) * v) / epsMax;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / sigMax;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'σ (MPa)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'ε (%)', g2 - 18, g0 + 12, { size: 8, color: AB.PAL.ink3 });

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const epsVal = (epsMax * i) / 100, s = Math.min(UCS, (epsVal * Y) / 1000);
    if (i === 0) ctx.moveTo(X(epsVal), Yv(s));
    else ctx.lineTo(X(epsVal), Yv(s));
  }
  ctx.stroke();

  AB.dashed(ctx, gx, Yv(UCS), g2, Yv(UCS), { color: AB.PAL.amber });
  AB.text(ctx, 'UCS = 170', g2 - 6, Yv(UCS) - 6, { size: 8, color: AB.PAL.amber, align: 'right' });

  const px = X(eps * 100), py = Yv(sig);
  const fract = sig >= UCS;
  ctx.fillStyle = fract ? AB.PAL.blood : AB.PAL.good;
  ctx.beginPath();
  ctx.arc(px, py, 4.5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, px, py, px, g0, { color: AB.PAL.ink3 });
  if (fract) {
    AB.text(ctx, '¡fractura!', px - 6, py - 10, { size: 9, weight: '700', color: AB.PAL.blood, align: 'right' });
  }
  out(
    'fe_out',
    fract
      ? 'σ = ' + fmt(sig, 0) + ' MPa — sobre el UCS (170 MPa)'
      : 'σ = ' + fmt(sig, 2) + ' MPa · ΔL = ' + fmt(dL, 3) + ' mm · ε = ' + fmt(eps * 100, 3) + ' %'
  );
}

/* ═══════════════════════════════════════════════════════════
   S5 · Cortadura y Poisson — bloque deformado
   ═══════════════════════════════════════════════════════════ */
export function drawShear(params: SimParams, out: OutFn) {
  const cv = getCanvas('sim-shear');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const gDeg = params.sh_g || 0;
  const gam = (gDeg * Math.PI) / 180;
  const G = 3.51 * 1000;
  const tau = gam * G;

  const bx = w * 0.1, by = h * 0.3, bw = w * 0.4, bh = h * 0.4;
  const disp = Math.tan(gam) * bh * 0.55;
  ctx.fillStyle = 'rgba(107,120,133,.12)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(bx, by, bw, bh);

  ctx.fillStyle = 'rgba(13,110,100,.14)';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + bw, by + disp);
  ctx.lineTo(bx + bw, by + bh + disp);
  ctx.lineTo(bx, by + bh);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(bx + bw, by);
  ctx.lineTo(bx + bw, by + disp);
  ctx.stroke();
  AB.text(ctx, 'γ = ' + fmt(gDeg, 1) + '°', bx + bw / 2, by + bh + disp + 16, { size: 9, weight: '700', color: AB.PAL.amber });

  AB.arrow(ctx, bx + bw + 18, by + disp, bx + bw + 58, by + disp, { color: AB.PAL.blood });
  AB.text(ctx, 'τ', bx + bw + 60, by + disp, { size: 9, color: AB.PAL.blood, align: 'left' });
  AB.text(ctx, 'τ = G·γ', (bx + bw) / 2, by - 14, { size: 10, weight: '700', color: AB.PAL.teal });

  const gx = w * 0.62, g2 = w * 0.94, gy = h * 0.14, g0 = h * 0.82;
  const tMax = Math.max(400, tau * 1.15);
  const X = (v: number) => gx + ((g2 - gx) * v) / 12;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / tMax;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'τ (MPa)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'γ (°)', g2 - 16, g0 + 12, { size: 8, color: AB.PAL.ink3 });
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(X(0), Yv(0));
  ctx.lineTo(X(12), Yv(((12 * Math.PI) / 180) * G));
  ctx.stroke();
  const px = X(gDeg), py = Yv(tau);
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fill();
  out('sh_out', 'τ = G·γ = ' + espan(Math.round(tau), 0) + ' MPa (G = 3,51 GPa)');
}

/* ═══════════════════════════════════════════════════════════
   S6 · Energía elástica — área bajo la curva σ–ε
   ═══════════════════════════════════════════════════════════ */
export function drawEnergy(params: SimParams, out: OutFn) {
  const cv = getCanvas('sim-energy');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const eps = params.en_e || 0;
  const Y = 17.9 * 1000;
  const sig = eps * Y;
  const peV = 0.5 * sig * eps * 1e6;

  const gx = w * 0.1, g2 = w * 0.94, gy = h * 0.12, g0 = h * 0.82;
  const epsMax = 0.0025, sigMax = 45;
  const X = (v: number) => gx + ((g2 - gx) * v) / epsMax;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / sigMax;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'σ (MPa)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'ε', g2 - 10, g0 + 12, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '10.000 με', g2 - 6, Yv(sigMax * 0.5) + 6, { size: 7, color: AB.PAL.ink3, align: 'right' });

  const px = X(eps), py = Yv(sig);
  ctx.fillStyle = 'rgba(13,110,100,.18)';
  ctx.beginPath();
  ctx.moveTo(X(0), g0);
  ctx.lineTo(px, py);
  ctx.lineTo(px, g0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const e = (epsMax * i) / 100, s = e * Y;
    if (i === 0) ctx.moveTo(X(e), Yv(s));
    else ctx.lineTo(X(e), Yv(s));
  }
  ctx.stroke();

  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, px, py, px, g0, { color: AB.PAL.ink3 });
  AB.text(ctx, 'PE/V = ½σε = ' + fmt(peV / 1000, 1) + ' kJ/m³', (gx + g2) / 2, gy - 10, { size: 9, weight: '700', color: AB.PAL.teal });
  out('en_out', 'PE/V = ½σε = ' + fmt(peV / 1000, 1) + ' kJ/m³ · ε = ' + fmt(eps * 1e6, 0) + ' με');
}

/* ═══════════════════════════════════════════════════════════
   S7 · Aquiles vs fémur — barras de energía
   ═══════════════════════════════════════════════════════════ */
export function drawAchilles(flags: SimFlags, out: OutFn) {
  const cv = getCanvas('sim-achilles');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const t = flags.achT;
  const tFill = flags.achPlaying ? t : 1;
  const ach = 35, fem = 2;
  const labels: [string, number, string][] = [
    ['Tendón de Aquiles', ach, AB.PAL.blood],
    ['Fémur', fem, AB.PAL.teal],
  ];
  const b0 = h * 0.24, b1 = h * 0.72, gap = h * 0.14;
  labels.forEach((L, i) => {
    const x = w * 0.14 + i * (w * 0.5), bw = w * 0.3;
    const fullH = b1 - b0 - gap * 0.3;
    ctx.fillStyle = 'rgba(107,120,133,.10)';
    ctx.fillRect(x, b0 + i * gap, bw, fullH);
    ctx.strokeStyle = AB.PAL.line;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x, b0 + i * gap, bw, fullH);

    const fillH = (fullH * Math.min(1, tFill) * L[1]) / 35;
    ctx.fillStyle = L[2];
    ctx.fillRect(x, b0 + i * gap + fullH - fillH, bw, fillH);
    AB.text(ctx, L[0], x + bw / 2, b0 + i * gap - 14, { size: 9, weight: '700', color: AB.PAL.ink });
    AB.text(ctx, fmt(L[1], 0) + ' J', x + bw / 2, b0 + i * gap + fullH + 10, { size: 9, weight: '700', color: L[2] });
  });

  AB.text(ctx, 'PE = ½σεV · un paso de carrera', w * 0.5, h * 0.9, { size: 9, color: AB.PAL.ink2 });
  out('ach_out', 'Aquiles ' + fmt(ach, 0) + ' J · fémur ' + fmt(fem, 0) + ' J · ≈18× más elástico');
}

/* ═══════════════════════════════════════════════════════════
   S8 · Materiales Hookeanos y reales
   ═══════════════════════════════════════════════════════════ */
export const CURVE_DATA: Record<string, { name: string; Y: number; ucs?: number; uts?: number; emax: number; britt: boolean }> = {
  acero:      { name: 'Acero duro',        Y: 207,   ucs: 552, uts: 827, emax: 1.2, britt: false },
  hueso:      { name: 'Hueso compacto',    Y: 17.9,  ucs: 170, uts: 120, emax: 6,   britt: true },
  trabecular: { name: 'Hueso trabecular',  Y: 0.076, ucs: 2.2, uts: 0,   emax: 10,  britt: true },
  granito:    { name: 'Granito',           Y: 51.7,  ucs: 145, uts: 4.8, emax: 0.5, britt: true },
};

export function drawCurve(flags: SimFlags, out: OutFn) {
  const cv = getCanvas('sim-curve');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const m = flags.curveMat || 'hueso';
  const d = CURVE_DATA[m] || CURVE_DATA.hueso;

  const gx = w * 0.1, g2 = w * 0.94, gy = h * 0.12, g0 = h * 0.82;
  const epsMax = 10, sigMax = 900;
  const X = (v: number) => gx + ((g2 - gx) * v) / epsMax;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / sigMax;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'σ (MPa)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'ε (%)', g2 - 16, g0 + 12, { size: 8, color: AB.PAL.ink3 });

  ctx.strokeStyle = d.britt ? AB.PAL.blood : AB.PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const N = 160;
  for (let i = 0; i <= N; i++) {
    const eps = (epsMax * i) / N;
    let s: number;
    const frac = eps / 100;
    if (m === 'acero') s = Math.min(827, 207000 * frac);
    else if (m === 'granito') s = Math.min(145, 51700 * frac);
    else if (m === 'hueso') s = Math.min(170, 17900 * frac);
    else s = Math.min(2.2, 76 * frac);
    const y = Yv(s);
    if (i === 0) ctx.moveTo(X(eps), y);
    else ctx.lineTo(X(eps), y);
  }
  ctx.stroke();

  if (d.uts && d.uts > 0) {
    ctx.fillStyle = AB.PAL.blood;
    ctx.beginPath();
    ctx.arc(X(d.emax * 0.9), Yv(d.uts), 3.5, 0, Math.PI * 2);
    ctx.fill();
    AB.text(ctx, 'UTS ' + fmt(d.uts, 1), X(d.emax * 0.9) - 6, Yv(d.uts) - 8, { size: 8, color: AB.PAL.blood, align: 'right' });
  }
  if (d.ucs) {
    ctx.fillStyle = AB.PAL.amber;
    ctx.beginPath();
    ctx.arc(X(d.emax * 0.9), Yv(d.ucs), 3.5, 0, Math.PI * 2);
    ctx.fill();
    AB.text(ctx, 'UCS ' + fmt(d.ucs, 1), X(d.emax * 0.9) + 6, Yv(d.ucs) + 6, { size: 8, color: AB.PAL.amber, align: 'left' });
  }
  AB.text(ctx, d.name, (gx + g2) / 2, gy - 12, { size: 11, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, 'Y = ' + fmt(d.Y, 2) + ' GPa', (gx + g2) / 2, g0 + 14, { size: 9, color: AB.PAL.teal });
  out('cv_out', 'Y = ' + fmt(d.Y, 2) + ' GPa · UTS ' + fmt(d.uts || 0, 1) + ' · UCS ' + fmt(d.ucs || 0, 1) + ' MPa');
}

/* ═══════════════════════════════════════════════════════════
   S9 · Punta del pie — exponencial + tangente
   ═══════════════════════════════════════════════════════════ */
export function drawToe(params: SimParams, out: OutFn) {
  const cv = getCanvas('sim-toe');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const ep = params.to_e || 0;
  const MU = 158.7, ALPHA = 4.8;
  const sigma = (e: number) => MU * (Math.exp((ALPHA * e) / 100) - 1);
  const Et = (e: number) => ALPHA * (sigma(e) + MU);

  const gx = w * 0.1, g2 = w * 0.94, gy = h * 0.12, g0 = h * 0.82;
  const epsMax = 12, sigMax = 120;
  const X = (v: number) => gx + ((g2 - gx) * v) / epsMax;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / sigMax;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'σ (MPa)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'ε (%)', g2 - 16, g0 + 12, { size: 8, color: AB.PAL.ink3 });

  ctx.fillStyle = 'rgba(45,125,79,.10)';
  ctx.fillRect(X(0), gy, X(2) - X(0), g0 - gy);
  AB.text(ctx, 'lineal ~2 %', X(1), gy + 10, { size: 7, color: AB.PAL.good });

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 160; i++) {
    const e = (epsMax * i) / 160, s = sigma(e);
    if (i === 0) ctx.moveTo(X(e), Yv(s));
    else ctx.lineTo(X(e), Yv(s));
  }
  ctx.stroke();

  const px = X(ep), py = Yv(sigma(ep));
  const EtVal = Et(ep) / 1000;
  const slope = (Et(ep) * 0.012) / 160;
  const x1 = Math.max(gx + 2, px - 18), x2 = Math.min(g2 - 2, px + 18);
  const y1 = py - (px - x1) * slope * 0.06, y2 = py - (x2 - px) * slope * 0.06;
  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(px, py, 4.5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, px, py, px, g0, { color: AB.PAL.ink3 });
  AB.text(ctx, 'σ = ' + fmt(sigma(ep), 1) + ' MPa', px + 8, py - 8, { size: 8, color: AB.PAL.blood, align: 'left' });
  AB.text(ctx, 'Eₜ = dσ/dε', x2 - 8, y2 - 8, { size: 8, color: AB.PAL.amber, align: 'right' });
  AB.text(ctx, 'tendón: μ(e^{αε}−1)', (gx + g2) / 2, gy - 12, { size: 10, weight: '700', color: AB.PAL.ink });
  out('to_out', 'σ = ' + fmt(sigma(ep), 1) + ' MPa · módulo tangente Eₜ = ' + fmt(EtVal, 2) + ' GPa');
}

/* ═══════════════════════════════════════════════════════════
   S10 · Flexión de viga — voladizo + distribución de σ
   ═══════════════════════════════════════════════════════════ */
export function drawBeam(params: SimParams, out: OutFn) {
  const cv = getCanvas('sim-beam');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const F = params.bm_F || 0;
  const Y = 17.9e9, L = 0.3, b = 0.03, hb = 0.04;
  const IA = (b * hb * hb * hb) / 12;
  const delta = (F * L * L * L) / (3 * Y * IA);
  const sigM = (F * L * (hb / 2)) / IA / 1e6;

  const bx = w * 0.1, by = h * 0.62, bl = w * 0.62, bh = 18;
  const dPix = Math.min(120, delta * 3000);
  ctx.fillStyle = AB.PAL.ink2;
  ctx.fillRect(bx - 6, by - 8, 8, bh + 16);
  ctx.fillStyle = AB.PAL.bone;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.quadraticCurveTo(bx + bl * 0.5, by + dPix * 0.6, bx + bl, by + dPix);
  ctx.lineTo(bx + bl, by + bh + dPix);
  ctx.quadraticCurveTo(bx + bl * 0.5, by + bh + dPix * 0.6, bx, by + bh);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  AB.arrow(ctx, bx + bl, by + bh + dPix, bx + bl, by + bh + dPix + 26, { color: AB.PAL.blood });
  AB.text(ctx, 'F = ' + fmt(F / 1000, 1) + ' kN', bx + bl, by + bh + dPix + 34, { size: 8, color: AB.PAL.blood });
  AB.text(ctx, 'δ(L) = ' + fmt(delta * 1000, 2) + ' mm', bx + bl * 0.5, by - 10, { size: 8, color: AB.PAL.ink2 });

  const cx = w * 0.85, cy = h * 0.5, ch = h * 0.5;
  const half = ch / 2;
  const fmax = Math.min(1, sigM / 200);
  for (let i = 0; i < 40; i++) {
    const yy = cy - half + (i / 40) * ch;
    const frac = 2 * (i / 40 - 0.5);
    const col =
      frac >= 0
        ? `rgba(169,42,30,${(0.15 + fmax * Math.abs(frac) * 0.6).toFixed(2)})`
        : `rgba(13,110,100,${(0.15 + fmax * Math.abs(frac) * 0.6).toFixed(2)})`;
    ctx.fillStyle = col;
    ctx.fillRect(cx - 16, yy, 32, ch / 40 + 1);
  }
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(cx - 16, cy - half, 32, ch);
  AB.text(ctx, 'tracción +', cx, cy - half - 8, { size: 8, color: AB.PAL.blood });
  AB.text(ctx, 'compresión −', cx, cy + half + 10, { size: 8, color: AB.PAL.teal });
  AB.text(ctx, 'σ = ±' + fmt(sigM, 0) + ' MPa', cx, cy, { size: 8, color: AB.PAL.ink, weight: '700' });
  AB.text(ctx, 'flexión 4.4', w * 0.1, h * 0.08, { size: 10, weight: '700', color: AB.PAL.teal });
  out('bm_out', 'δ(L) = ' + fmt(delta * 1000, 2) + ' mm · σ_máx = ±' + fmt(sigM, 0) + ' MPa');
}

/* ═══════════════════════════════════════════════════════════
   S11 · Hueso hueco — sección y barras
   ═══════════════════════════════════════════════════════════ */
export function drawHollow(params: SimParams, out: OutFn) {
  const cv = getCanvas('sim-hollow');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const r = params.ho_r || 0.5;
  const rig = 1 - r * r * r * r;
  const mas = 1 - r * r;

  const a2 = Math.min(w * 0.16, h * 0.22);
  const centers = [w * 0.2, w * 0.42];
  centers.forEach((cx, i) => {
    if (i === 0) {
      ctx.fillStyle = AB.PAL.bone;
      ctx.beginPath();
      ctx.arc(cx, h * 0.5, a2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = AB.PAL.boneEdge;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      AB.text(ctx, 'macizo', cx, h * 0.5 + a2 + 14, { size: 8, color: AB.PAL.ink2 });
    } else {
      ctx.fillStyle = AB.PAL.bone;
      ctx.beginPath();
      ctx.arc(cx, h * 0.5, a2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = AB.PAL.boneEdge;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = AB.PAL.paper3;
      ctx.beginPath();
      ctx.arc(cx, h * 0.5, a2 * r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = AB.PAL.boneEdge;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      AB.text(ctx, 'hueco', cx, h * 0.5 + a2 + 14, { size: 8, color: AB.PAL.ink2 });
    }
  });
  AB.arrow(ctx, w * 0.28, h * 0.5, w * 0.335, h * 0.5, { color: AB.PAL.teal });

  const gx = w * 0.6, gw = w * 0.3, g0 = h * 0.2, g1 = h * 0.72;
  const rows: [string, number, string][] = [
    ['rigidez I_A', rig, AB.PAL.teal],
    ['masa', mas, AB.PAL.amber],
  ];
  rows.forEach((R, i) => {
    const y = g0 + i * (g1 - g0 + 16);
    ctx.fillStyle = 'rgba(107,120,133,.10)';
    ctx.fillRect(gx, y, gw, 10);
    ctx.fillStyle = R[2];
    ctx.fillRect(gx, y, gw * R[1], 10);
    AB.text(ctx, R[0], gx - 6, y + 5, { size: 8, color: AB.PAL.ink2, align: 'right' });
    AB.text(ctx, fmt(R[1] * 100, 0) + ' %', gx + gw * R[1] + 4, y + 5, { size: 8, color: R[2], align: 'left', weight: '700' });
  });
  AB.text(ctx, 'a₁/a₂ = ' + fmt(r, 2), w * 0.5, h * 0.92, { size: 9, weight: '700', color: AB.PAL.amber });
  out('ho_out', 'rigidez ' + fmt(rig * 100, 0) + ' % · masa ' + fmt(mas * 100, 0) + ' %');
}

/* ═══════════════════════════════════════════════════════════
   S12 · Resorte y amortiguador
   ═══════════════════════════════════════════════════════════ */
export function drawElements(flags: SimFlags, out: OutFn) {
  const cv = getCanvas('sim-elements');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const mode = flags.el_mode || 'spring';
  const cx0 = w * 0.22, cy0 = h * 0.5;

  if (mode === 'spring') {
    ctx.strokeStyle = AB.PAL.ink2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx0 - 40, cy0);
    ctx.lineTo(cx0 - 12, cy0);
    ctx.stroke();
    ctx.strokeStyle = AB.PAL.teal;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const coils = 5;
    for (let i = 0; i < coils; i++) {
      ctx.lineTo(cx0 - 10 + i * 12, cy0 - 18 * (i % 2 ? 1 : -1) * 0.5);
    }
    ctx.stroke();
    ctx.strokeStyle = AB.PAL.ink2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx0 - 10 + coils * 12, cy0);
    ctx.lineTo(cx0 + 52, cy0);
    ctx.stroke();
    AB.arrow(ctx, cx0 + 52, cy0, cx0 + 80, cy0, { color: AB.PAL.blood });
    AB.text(ctx, 'F = kx', cx0, cy0 + 34, { size: 10, weight: '700', color: AB.PAL.teal });
    AB.text(ctx, 'almacena energía', cx0, cy0 + 50, { size: 8, color: AB.PAL.ink2 });
  } else {
    const ax = cx0 - 40, aw = 40;
    ctx.strokeStyle = AB.PAL.ink2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, cy0);
    ctx.lineTo(ax + aw, cy0);
    ctx.stroke();

    ctx.fillStyle = AB.PAL.tealLight;
    ctx.fillRect(ax + aw + 4, cy0 - 22, 26, 44);
    ctx.strokeStyle = AB.PAL.teal;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ax + aw + 4, cy0 - 22, 26, 44);

    ctx.fillStyle = AB.PAL.ink2;
    ctx.fillRect(ax + aw + 2, cy0 - 4, 8, 8);
    ctx.strokeStyle = AB.PAL.ink2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax + aw + 2, cy0);
    ctx.lineTo(cx0 + 10, cy0);
    ctx.stroke();

    for (let yy = -14; yy <= 14; yy += 7) {
      ctx.fillStyle = 'rgba(245,240,228,.9)';
      ctx.fillRect(ax + aw + 8, cy0 + yy, 4, 3);
    }
    AB.arrow(ctx, cx0 + 10, cy0, cx0 + 80, cy0, { color: AB.PAL.blood });
    AB.text(ctx, 'F = c dx/dt', cx0, cy0 + 34, { size: 10, weight: '700', color: AB.PAL.teal });
    AB.text(ctx, 'disipa energía', cx0, cy0 + 50, { size: 8, color: AB.PAL.ink2 });
  }

  const gx = w * 0.6, g2 = w * 0.92, gy = h * 0.18, g0 = h * 0.72;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'histéresis', (gx + g2) / 2, gy - 8, { size: 8, weight: '700', color: AB.PAL.ink2 });
  const loop = mode === 'dashpot' ? 1 : 0.25;
  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const t = i / 80, ang = t * 2 * Math.PI;
    const ex = gx + (g2 - gx) * (0.15 + 0.7 * (0.5 + 0.5 * Math.sin(ang)));
    const ey = gy + (g0 - gy) * (0.5 + loop * 0.28 * Math.sin(ang + 1.1));
    if (i === 0) ctx.moveTo(ex, ey);
    else ctx.lineTo(ex, ey);
  }
  ctx.stroke();
  AB.text(ctx, 'área = energía disipada', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.blood });
  out('el_out', mode === 'spring' ? 'F = kx — elástico, almacena' : 'F = c·dx/dt — viscoso, disipa');
}

/* ═══════════════════════════════════════════════════════════
   S13 · Maxwell y Voigt — creep
   ═══════════════════════════════════════════════════════════ */
export function drawModels(params: SimParams, flags: SimFlags, out: OutFn) {
  const cv = getCanvas('sim-models');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const mode = flags.md_mode || 'maxwell';
  const tau = params.md_tau || 0.6;
  let t = flags.mdT;
  if (!flags.mdPlaying) t = 2.5;

  const gx = w * 0.12, g2 = w * 0.94, gy = h * 0.14, g0 = h * 0.8;
  const tMax = 3, xMax = 2.5;
  const X = (v: number) => gx + ((g2 - gx) * v) / tMax;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / xMax;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'x(t)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 't', g2 - 10, g0 + 12, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, 'creep · F₀ constante', (gx + g2) / 2, gy - 10, { size: 10, weight: '700', color: AB.PAL.ink });

  const styles: [string, string][] = [
    [AB.PAL.teal, 'Maxwell'],
    [AB.PAL.amber, 'Voigt'],
  ];
  styles.forEach((S, i) => {
    ctx.strokeStyle = S[0];
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let k = 0; k <= 140; k++) {
      const tt = (tMax * k) / 140;
      let x: number;
      if (i === 0) x = 1 + tt / tau;
      else x = 1 - Math.exp(-tt / tau);
      if (k === 0) ctx.moveTo(X(tt), Yv(x));
      else ctx.lineTo(X(tt), Yv(x));
    }
    ctx.stroke();
    AB.text(ctx, S[1], X(tMax * 0.85), Yv(i === 0 ? 1 + (tMax * 0.8) / tau : 1 - Math.exp((-tMax * 0.8) / tau)) - 6, {
      size: 8,
      color: S[0],
      weight: '700',
    });
  });

  const xp = mode === 'maxwell' ? 1 + t / tau : 1 - Math.exp(-t / tau);
  const px = X(Math.min(t, tMax)), py = Yv(Math.min(xp, xMax));
  ctx.fillStyle = mode === 'maxwell' ? AB.PAL.teal : AB.PAL.amber;
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, px, py, px, g0, { color: AB.PAL.ink3 });
  AB.text(ctx, mode === 'maxwell' ? 'fluye sin límite' : 'satura exponencial', px, py - 12, {
    size: 8,
    color: AB.PAL.ink2,
    weight: '700',
  });
  out('md_out', 'τ = ' + fmt(tau, 2) + ' s · ' + (mode === 'maxwell' ? 'x(t) = F₀(1/k+t/c)' : 'x(t) = F₀/k(1−e^{−t/τ})'));
}

/* ═══════════════════════════════════════════════════════════
   S14 · Kelvin — rampa lenta vs rápida
   ═══════════════════════════════════════════════════════════ */
export function drawKelvin(params: SimParams, flags: SimFlags, out: OutFn) {
  const cv = getCanvas('sim-kelvin');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const logT = params.kl_T || 0;
  const T = Math.pow(10, logT);
  const tauS = 1;
  const k1 = 1, k2 = 1;
  const ksum = k1 + k2;

  const tMax = 6, xMax = 1.2;
  const gx = w * 0.1, g2 = w * 0.94, gy = h * 0.14, g0 = h * 0.78;
  const X = (v: number) => gx + ((g2 - gx) * v) / tMax;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / xMax;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'x(t)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 't/τσ', g2 - 16, g0 + 12, { size: 8, color: AB.PAL.ink3 });

  AB.dashed(ctx, gx, Yv(1 / ksum), g2, Yv(1 / ksum), { color: AB.PAL.ink3 });
  AB.dashed(ctx, gx, Yv(1 / k2), g2, Yv(1 / k2), { color: AB.PAL.ink3 });
  AB.text(ctx, 'F₀/(k₁+k₂)', g2 - 4, Yv(1 / ksum) - 4, { size: 7, color: AB.PAL.ink3, align: 'right' });
  AB.text(ctx, 'F₀/k₂', g2 - 4, Yv(1 / k2) - 4, { size: 7, color: AB.PAL.ink3, align: 'right' });

  const rCurves: [number, string, string][] = [
    [10, 'lenta (T≫τσ)', AB.PAL.teal],
    [0.1, 'rápida (T≪τσ)', AB.PAL.blood],
  ];
  rCurves.forEach((S) => {
    const T2 = S[0], col = S[1], color = S[2];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const t0 = T2 * 0.3;
    for (let k = 0; k <= 140; k++) {
      const tt = t0 + (tMax * k) / 140;
      let x: number;
      if (tt <= T2) {
        const a = tt / T2;
        x = a / ksum - (tauS / (T2 * ksum)) * (1 - Math.exp(-tt / tauS));
      } else {
        const xT = 1 / ksum - (tauS / (T2 * ksum)) * (1 - Math.exp(-T2 / tauS));
        const xF = 1 / k2;
        x = xT + (xF - xT) * (1 - Math.exp(-(tt - T2) / tauS));
      }
      if (k === 0) ctx.moveTo(X(tt), Yv(x));
      else ctx.lineTo(X(tt), Yv(x));
    }
    ctx.stroke();
    AB.text(ctx, col, X(t0 + tMax * 0.6), Yv(1 / ksum) - 8, { size: 8, color: color, weight: '700' });
  });

  const tt = flags.klPlaying ? flags.klT % 8 : 1.4;
  let x: number;
  if (tt <= T) {
    const a = tt / T;
    x = a / ksum - (tauS / (T * ksum)) * (1 - Math.exp(-tt / tauS));
  } else {
    const xT = 1 / ksum - (tauS / (T * ksum)) * (1 - Math.exp(-T / tauS));
    const xF = 1 / k2;
    x = xT + (xF - xT) * (1 - Math.exp(-(tt - T) / tauS));
  }
  const px = X(tt), py = Yv(x);
  ctx.fillStyle = AB.PAL.amber;
  ctx.beginPath();
  ctx.arc(px, py, 4.5, 0, Math.PI * 2);
  ctx.fill();
  AB.text(ctx, 'T/τσ = 10^' + fmt(logT, 1), (gx + g2) / 2, g0 + 14, { size: 9, weight: '700', color: AB.PAL.amber });

  const xF = T < 0.3 ? 1 / ksum : T > 3 ? 1 / k2 : null;
  out(
    'kl_out',
    xF
      ? 'x(T) → F₀/' + (xF === 0.5 ? '(k₁+k₂)' : 'k₂') + ' — ' + (T < 0.3 ? 'carga rápida = rígido' : 'carga lenta = flexible')
      : 'x(T) = ' + fmt(x, 2)
  );
}

/* ═══════════════════════════════════════════════════════════
   S15 · Modos de fractura
   ═══════════════════════════════════════════════════════════ */
export function drawFracture(flags: SimFlags, out: OutFn) {
  const cv = getCanvas('sim-fracture');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const mode = flags.fr_mode || 'traccion';
  const t = flags.frPlaying ? flags.frT : 0.6;
  const cx = w * 0.5, cy = h * 0.5;
  const len = h * 0.5, wid = 26;
  const crack = Math.min(1, t);

  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = wid + 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - len / 2);
  ctx.lineTo(cx, cy + len / 2);
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.bone;
  ctx.lineWidth = wid;
  ctx.beginPath();
  ctx.moveTo(cx, cy - len / 2);
  ctx.lineTo(cx, cy + len / 2);
  ctx.stroke();

  if (mode === 'traccion') {
    const sep = crack * 10;
    ctx.fillStyle = AB.PAL.paper;
    ctx.fillRect(cx - 2, cy - 8 - sep / 2, 4, 16 + sep);
    ctx.strokeStyle = AB.PAL.blood;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8 - sep / 2);
    ctx.lineTo(cx, cy + 8 + sep / 2);
    ctx.stroke();

    AB.arrow(ctx, cx, cy - len / 2 - 24, cx, cy - len / 2 - 6, { color: AB.PAL.blood });
    AB.arrow(ctx, cx, cy + len / 2 + 24, cx, cy + len / 2 + 6, { color: AB.PAL.blood });
    AB.text(ctx, 'tracción', cx, cy - len / 2 - 32, { size: 9, weight: '700', color: AB.PAL.blood });
  } else if (mode === 'compresion') {
    const s = crack * 14;
    const fy = cy - 6 - s;
    ctx.fillStyle = AB.PAL.blood;
    ctx.beginPath();
    ctx.moveTo(cx, fy);
    ctx.lineTo(cx - 12, fy + 16);
    ctx.lineTo(cx - 5, fy + 14);
    ctx.lineTo(cx, fy + 20);
    ctx.lineTo(cx + 5, fy + 14);
    ctx.lineTo(cx + 12, fy + 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = AB.PAL.blood;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 12, fy + 16);
    ctx.lineTo(cx + 12, fy + 16);
    ctx.stroke();

    AB.arrow(ctx, cx, cy - len / 2 - 24, cx, cy - len / 2 - 6, { color: AB.PAL.teal });
    AB.arrow(ctx, cx, cy + len / 2 + 24, cx, cy + len / 2 + 6, { color: AB.PAL.teal });
    AB.text(ctx, 'compresión → mariposa 45°', cx, cy - len / 2 - 32, { size: 9, weight: '700', color: AB.PAL.teal });
  } else {
    ctx.strokeStyle = AB.PAL.blood;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= 60; k++) {
      const yy = cy - len / 2 + (len * k) / 60;
      const xx = cx + Math.sin(k * 0.5 + crack * 6) * 6;
      if (k === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    ctx.stroke();

    ctx.strokeStyle = AB.PAL.amber;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - len * 0.3, cy - len / 2 + 8, 12, Math.PI, Math.PI * 1.6);
    ctx.stroke();
    AB.text(ctx, 'torsión → espiral', cx, cy - len / 2 - 32, { size: 9, weight: '700', color: AB.PAL.amber });
  }

  AB.text(ctx, 'W_F (J/m²) · fémur 1710 · asta 6190 · bulla 200', cx, h * 0.92, { size: 8, color: AB.PAL.ink2 });
  out(
    'fr_out',
    mode === 'traccion'
      ? 'UTS = 120 MPa — grieta transversal'
      : mode === 'compresion'
      ? 'UCS = 170 MPa — mariposa a 45°'
      : 'torsión — grieta en espiral'
  );
}

/* ═══════════════════════════════════════════════════════════
   S16 · Pandeo de Euler
   ═══════════════════════════════════════════════════════════ */
export function drawBuckle(params: SimParams, out: OutFn) {
  const cv = getCanvas('sim-buckle');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const L = params.bk_L || 0.5, P = params.bk_P || 700;
  const Y = 17.9e9, a = 0.015;
  const IA = (Math.PI * a * a * a * a) / 4;
  const Sc = (Math.PI * Math.PI * Y * IA) / (L * L);
  const buckled = P >= Sc;

  const cx = w * 0.3, base = h * 0.78, H = Math.min(h * 0.56, L * 0.85 * h);
  const bow = buckled ? Math.min(60, (P / Sc - 1) * 70) : 0;
  ctx.fillStyle = AB.PAL.bone;
  ctx.beginPath();
  ctx.moveTo(cx - 9, base);
  ctx.quadraticCurveTo(cx - 9 - bow * 0.4, base - H * 0.5, cx - 9 - bow, base - H);
  ctx.lineTo(cx + 9 - bow, base - H);
  ctx.quadraticCurveTo(cx + 9 - bow * 0.4, base - H * 0.5, cx + 9, base);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = AB.PAL.ink3;
  ctx.fillRect(cx - 40, base, 80, 8);
  AB.arrow(ctx, cx - bow, base - H - 14, cx - bow, base - H - 38, { color: buckled ? AB.PAL.blood : AB.PAL.teal });
  AB.text(ctx, 'P = ' + fmt(P / 1000, 0) + ' kN', cx - bow + 8, base - H - 46, { size: 8, color: buckled ? AB.PAL.blood : AB.PAL.teal });
  AB.text(ctx, buckled ? '¡PANDEA!' : 'estable', cx, base - H - 60, { size: 9, weight: '700', color: buckled ? AB.PAL.blood : AB.PAL.good });

  const gx = w * 0.58, g2 = w * 0.94, gy = h * 0.14, g0 = h * 0.8;
  const Lmin = 0.2, Lmax = 1.2, Smax = 80000;
  const X = (v: number) => gx + ((g2 - gx) * (v - Lmin)) / (Lmax - Lmin);
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / Smax;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'S_c (kN)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'L (m)', g2 - 14, g0 + 12, { size: 8, color: AB.PAL.ink3 });

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let k = 0; k <= 120; k++) {
    const LL = Lmin + ((Lmax - Lmin) * k) / 120;
    const Sc2 = (Math.PI * Math.PI * Y * IA) / (LL * LL);
    if (k === 0) ctx.moveTo(X(LL), Yv(Math.min(Sc2, Smax)));
    else ctx.lineTo(X(LL), Yv(Math.min(Sc2, Smax)));
  }
  ctx.stroke();

  AB.dashed(ctx, gx, Yv(700), g2, Yv(700), { color: AB.PAL.amber });
  AB.text(ctx, 'peso 700 N', g2 - 4, Yv(700) - 4, { size: 7, color: AB.PAL.amber, align: 'right' });

  const px = X(Math.min(Math.max(L, Lmin), Lmax)), py = Yv(Math.min(Sc, Smax));
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(px, py, 4.5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, px, py, px, g0, { color: AB.PAL.ink3 });
  out('bk_out', 'S_c = π²YI_A/L² = ' + fmt(Sc / 1000, 1) + ' kN · P = ' + fmt(P / 1000, 0) + ' kN → ' + (buckled ? 'PANDEA' : 'estable'));
}

/* ═══════════════════════════════════════════════════════════
   S17 · Fracturas por estrés — grieta
   ═══════════════════════════════════════════════════════════ */
export function drawCrack(params: SimParams, out: OutFn) {
  const cv = getCanvas('sim-crack');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const a = params.cr_a || 1, s = params.cr_s || 20;
  const Kc = 4;
  const aM = a / 1000;
  const K = s * Math.sqrt(Math.PI * aM);
  const crit = K >= Kc;
  const ac = (Kc * Kc) / (Math.PI * s * s);

  const px0 = w * 0.08, py0 = h * 0.16, pw = w * 0.38, ph = h * 0.68;
  ctx.fillStyle = AB.PAL.bone;
  ctx.fillRect(px0, py0, pw, ph);
  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(px0, py0, pw, ph);

  const aPix = (a / 6) * pw;
  ctx.strokeStyle = crit ? AB.PAL.blood : AB.PAL.ink2;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(px0, py0 + ph / 2);
  ctx.lineTo(px0 + aPix, py0 + ph / 2);
  ctx.stroke();

  ctx.fillStyle = crit ? AB.PAL.blood : AB.PAL.amber;
  ctx.beginPath();
  ctx.arc(px0 + aPix, py0 + ph / 2, 4, 0, Math.PI * 2);
  ctx.fill();
  if (crit) {
    ctx.strokeStyle = 'rgba(169,42,30,.4)';
    ctx.beginPath();
    ctx.moveTo(px0 + aPix, py0 + ph / 2);
    ctx.lineTo(px0 + pw, py0 + ph / 2);
    ctx.stroke();
    AB.text(ctx, '¡se propaga!', px0 + pw / 2, py0 + ph / 2 - 10, { size: 9, weight: '700', color: AB.PAL.blood });
  }

  AB.arrow(ctx, px0 - 20, py0 - 6, px0 - 42, py0 - 6, { color: AB.PAL.teal });
  AB.arrow(ctx, px0 + pw + 20, py0 - 6, px0 + pw + 42, py0 - 6, { color: AB.PAL.teal });
  AB.text(ctx, 's = ' + fmt(s, 0) + ' MPa', px0 + pw / 2, py0 - 18, { size: 8, color: AB.PAL.teal, weight: '700' });
  AB.text(ctx, 'grieta a = ' + fmt(a, 2) + ' mm', px0 + pw / 2, py0 + ph + 14, { size: 8, color: AB.PAL.ink2 });

  const gx = w * 0.56, g2 = w * 0.94, gy = h * 0.16, g0 = h * 0.8;
  const aMax = 6, kMax = 10;
  const X = (v: number) => gx + ((g2 - gx) * v) / aMax;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / kMax;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'K (MPa·m½)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'a (mm)', g2 - 14, g0 + 12, { size: 8, color: AB.PAL.ink3 });

  AB.dashed(ctx, gx, Yv(Kc), g2, Yv(Kc), { color: AB.PAL.blood });
  AB.text(ctx, 'K_c = 4', g2 - 4, Yv(Kc) - 4, { size: 7, color: AB.PAL.blood, align: 'right' });

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let k = 0; k <= 120; k++) {
    const aa = ((k / 120) * aMax) / 1000;
    const kk = s * Math.sqrt(Math.PI * aa);
    if (k === 0) ctx.moveTo(X((k / 120) * aMax), Yv(kk));
    else ctx.lineTo(X((k / 120) * aMax), Yv(kk));
  }
  ctx.stroke();

  const px = X(a), py = Yv(K);
  ctx.fillStyle = crit ? AB.PAL.blood : AB.PAL.good;
  ctx.beginPath();
  ctx.arc(px, py, 4.5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, px, py, px, g0, { color: AB.PAL.ink3 });
  out('cr_out', 'K = ' + fmt(K, 1) + ' MPa·m½ · a_c = ' + fmt(ac * 1000, 0) + ' mm (' + (crit ? 'CRÍTICA' : 'segura') + ')');
}

/* ═══════════════════════════════════════════════════════════
   S18 · Lesiones deportivas — barras
   ═══════════════════════════════════════════════════════════ */
export function drawInjury(flags: SimFlags, out: OutFn) {
  const cv = getCanvas('sim-injury');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const t = flags.injPlaying ? flags.injT : 1;
  const rows: [string, number, string][] = [
    ['Piernas', 54, AB.PAL.blood],
    ['Brazos', 18, AB.PAL.teal],
    ['Tronco y espalda', 13, AB.PAL.amber],
    ['Cabeza y cuello', 10, AB.PAL.sagittal],
  ];
  const gx = w * 0.28, gw = w * 0.6, g0 = h * 0.16;
  rows.forEach((R, i) => {
    const y = g0 + i * (h * 0.17);
    AB.text(ctx, R[0], gx - 8, y, { size: 9, color: AB.PAL.ink2, align: 'right', weight: '700' });
    ctx.fillStyle = 'rgba(107,120,133,.10)';
    ctx.fillRect(gx, y - 6, gw, 12);
    ctx.fillStyle = R[2];
    ctx.fillRect(gx, y - 6, (gw * Math.min(1, t) * R[1]) / 100, 12);
    AB.text(ctx, fmt(R[1], 0) + ' %', gx + (gw * Math.min(1, t) * R[1]) / 100 + 6, y, { size: 9, color: R[2], weight: '700', align: 'left' });
  });
  AB.text(ctx, 'lesiones en 15 deportes universitarios (juegos y entrenamientos)', w * 0.5, h * 0.92, { size: 8, color: AB.PAL.ink2 });
  out('inj_out', 'piernas 54 % · brazos 18 % · tronco 13 % · cabeza 10 %');
}

/* ═══════════════════════════════════════════════════════════
   S19 · Cascos — materiales de acolchado
   ═══════════════════════════════════════════════════════════ */
export function drawHelmet(flags: SimFlags, out: OutFn) {
  const cv = getCanvas('sim-helmet');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const m = flags.hl_mat || 'B';

  const gx = w * 0.12, g2 = w * 0.94, gy = h * 0.14, g0 = h * 0.8;
  const X = (v: number) => gx + ((g2 - gx) * v) / 80;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / 100;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'σ (F normalizada)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'ε (%)', g2 - 16, g0 + 12, { size: 8, color: AB.PAL.ink3 });

  const mats: Record<string, { col: string; name: string; fn: (e: number) => number }> = {
    A: { col: AB.PAL.blood, name: 'A rígido', fn: (e) => (e <= 12 ? (100 * e) / 12 : 100 - (e - 12) * 2.5) },
    B: { col: AB.PAL.teal,  name: 'B ideal',  fn: (e) => (e <= 15 ? (60 * e) / 15 : 60) },
    C: { col: AB.PAL.amber, name: 'C blando', fn: (e) => (e <= 40 ? (30 * e) / 40 : 30) },
  };

  Object.keys(mats).forEach((k) => {
    const M = mats[k];
    ctx.strokeStyle = M.col;
    ctx.lineWidth = k === m ? 3 : 1.6;
    ctx.setLineDash(k === m ? [] : [4, 3]);
    ctx.beginPath();
    for (let i = 0; i <= 160; i++) {
      const e = (80 * i) / 160;
      if (i === 0) ctx.moveTo(X(e), Yv(Math.max(0, M.fn(e))));
      else ctx.lineTo(X(e), Yv(Math.max(0, M.fn(e))));
    }
    ctx.stroke();
    ctx.setLineDash([]);
  });

  const M = mats[m];
  ctx.fillStyle = 'rgba(13,110,100,.12)';
  ctx.beginPath();
  ctx.moveTo(X(0), g0);
  for (let i = 0; i <= 160; i++) {
    const e = (80 * i) / 160;
    ctx.lineTo(X(e), Yv(Math.max(0, M.fn(e))));
  }
  ctx.lineTo(X(80), g0);
  ctx.closePath();
  ctx.fill();

  let area = 0;
  for (let i = 0; i < 800; i++) {
    const e = i / 10;
    area += Math.max(0, M.fn(e));
  }
  area /= 800 * 100;
  const Fmax = M.fn(80);
  AB.text(ctx, mats[m].name, (gx + g2) / 2, gy - 10, { size: 11, weight: '700', color: M.col });
  AB.text(ctx, 'energía = área = ' + fmt(area * 100, 0) + ' % · F máx = ' + fmt(Fmax, 0) + ' %', (gx + g2) / 2, g0 + 16, {
    size: 9,
    weight: '700',
    color: AB.PAL.ink,
  });
  AB.text(ctx, 'meseta ideal: energía máx a fuerza constante', gx, h * 0.94, { size: 8, color: AB.PAL.ink2, align: 'left' });
  out(
    'hl_out',
    m === 'B'
      ? 'B ideal: meseta → energía ' + fmt(area * 100, 0) + ' % · F máx ' + fmt(Fmax, 0) + ' %'
      : m === 'A'
      ? 'A rígido: pico ' + fmt(Fmax, 0) + ' % — mucha aceleración'
      : 'C blando: F baja, energía ' + fmt(area * 100, 0) + ' %'
  );
}

/* ═══════════════════════════════════════════════════════════
   S20 · Alimentos — duros (r) vs tenaces (J)
   ═══════════════════════════════════════════════════════════ */
export function drawFood(params: SimParams, flags: SimFlags, out: OutFn) {
  const cv = getCanvas('sim-food');
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const m = flags.fo_mode || 'dura';
  const e = params.fo_e || 50;

  const gx = w * 0.12, g2 = w * 0.94, gy = h * 0.14, g0 = h * 0.8;
  const X = (v: number) => gx + ((g2 - gx) * v) / 100;
  const Yv = (v: number) => g0 - ((g0 - gy) * v) / 100;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'σ', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'deformación (mordida) %', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });

  const dura = (e2: number) => Math.pow(e2 / 100, 0.7);
  const tenaz = (e2: number) => Math.pow(e2 / 100, 2);
  const curves: [string, string, (e2: number) => number, string, string][] = [
    ['dura', 'r', dura, AB.PAL.blood, AB.PAL.blood],
    ['tenaz', 'J', tenaz, AB.PAL.teal, AB.PAL.teal],
  ];
  curves.forEach((C) => {
    ctx.strokeStyle = C[3];
    ctx.lineWidth = C[0] === m ? 2.8 : 1.6;
    ctx.setLineDash(C[0] === m ? [] : [4, 3]);
    ctx.beginPath();
    for (let i = 0; i <= 160; i++) {
      const e2 = (i / 160) * 100;
      if (i === 0) ctx.moveTo(X(e2), Yv(C[2](e2) * 100));
      else ctx.lineTo(X(e2), Yv(C[2](e2) * 100));
    }
    ctx.stroke();
    ctx.setLineDash([]);
  });

  const fn = m === 'dura' ? dura : tenaz;
  const px = X(e), py = Yv(fn(e) * 100);
  ctx.fillStyle = m === 'dura' ? AB.PAL.blood : AB.PAL.teal;
  ctx.beginPath();
  ctx.arc(px, py, 4.5, 0, Math.PI * 2);
  ctx.fill();
  AB.dashed(ctx, px, py, px, g0, { color: AB.PAL.ink3 });

  const d = 0.01, E0 = (fn(e + d) - fn(e - d)) / (2 * d);
  const slope = (((E0 * 100) / ((g2 - gx) / 100)) / ((g0 - gy) / 100)) * 0.5;
  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(Math.max(gx + 2, px - 16), py + 16 * slope * 0.2);
  ctx.lineTo(Math.min(g2 - 2, px + 16), py - 16 * slope * 0.2);
  ctx.stroke();

  AB.text(ctx, 'duro (r): limitado por fuerza (ER)^½', gx, gy + 12, { size: 8, color: AB.PAL.blood, align: 'left', weight: '700' });
  AB.text(ctx, 'tenaz (J): limitado por desplazamiento (R/E)^½', gx, gy + 24, { size: 8, color: AB.PAL.teal, align: 'left', weight: '700' });
  out(
    'fo_out',
    m === 'dura'
      ? 'duro: incisivos — esfuerzo alto, grieta que no se desplaza'
      : 'tenaz: molares — la cúspide debe desplazar la grieta'
  );
}

/* ═══════════════════════════════════════════════════════════
   Redibujador principal
   ═══════════════════════════════════════════════════════════ */
export function redrawSlide(
  slide: number,
  _clock: number,
  params: SimParams,
  flags: SimFlags,
  out: OutFn
): void {
  switch (slide) {
    case 1:
      drawBone(flags, out);
      break;
    case 2:
      drawTissue(params, out);
      break;
    case 3:
      drawHooke(params, out);
      break;
    case 4:
      drawFemur(params, out);
      break;
    case 5:
      drawShear(params, out);
      break;
    case 6:
      drawEnergy(params, out);
      break;
    case 7:
      drawAchilles(flags, out);
      break;
    case 8:
      drawCurve(flags, out);
      break;
    case 9:
      drawToe(params, out);
      break;
    case 10:
      drawBeam(params, out);
      break;
    case 11:
      drawHollow(params, out);
      break;
    case 12:
      drawElements(flags, out);
      break;
    case 13:
      drawModels(params, flags, out);
      break;
    case 14:
      drawKelvin(params, flags, out);
      break;
    case 15:
      drawFracture(flags, out);
      break;
    case 16:
      drawBuckle(params, out);
      break;
    case 17:
      drawCrack(params, out);
      break;
    case 18:
      drawInjury(flags, out);
      break;
    case 19:
      drawHelmet(flags, out);
      break;
    case 20:
      drawFood(params, flags, out);
      break;
    default:
      break;
  }
}
