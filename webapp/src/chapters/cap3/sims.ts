// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 3 · Motor de simulaciones 2D y cálculos físicos (TypeScript)
//  "El Movimiento" — Física del Cuerpo Humano (I. P. Herman)
// ═══════════════════════════════════════════════════════════════════════════

import * as AB from './ab';

export interface ModuleDef {
  id: number;
  name: string;
  slides: number[];
  ico: string;
}

export const TOTAL = 19;

export const MODULES: ModuleDef[] = [
  { id: 0, name: 'Inicio',          slides: [0],        ico: '🏠' },
  { id: 1, name: 'Bipedestación',   slides: [1, 2],     ico: '🧍' },
  { id: 2, name: 'Marcha',          slides: [3, 4, 5],  ico: '🚶' },
  { id: 3, name: 'Carrera',         slides: [6, 7, 8],  ico: '🏃' },
  { id: 4, name: 'Salto',           slides: [9, 10],    ico: '🦘' },
  { id: 5, name: 'Lanzar',          slides: [11, 12, 13], ico: '⚾' },
  { id: 6, name: 'Bateo',           slides: [14, 15],   ico: '🏌️' },
  { id: 7, name: 'Colisiones',      slides: [16, 17],   ico: '💥' },
  { id: 8, name: 'Vuelo · Resumen', slides: [18],       ico: '🎾' },
];

export interface SimParams {
  stab_H: number;
  stab_theta: number;
  pr_mass: number;
  gait_t: number;
  fr_mu: number;
  pe_H: number;
  pe_planet: 'earth' | 'moon' | 'mars';
  po_k: number;
  sp_F: number;
  sp_m: number;
  jp_mass: number;
  jp_s: number;
  va_v: number;
  th_case: 'a' | 'b' | 'c' | 'd';
  ph_t: number;
  pw_om: number;
  ba_w: number;
  co_v: number;
  co_dx: number;
  co_m: number;
  bx_v: number;
  fl_v: number;
  fl_theta: number;
}

export const DEFAULT_PARAMS: SimParams = {
  stab_H: 1.8,
  stab_theta: 0,
  pr_mass: 70,
  gait_t: 0,
  fr_mu: 0.17,
  pe_H: 1.8,
  pe_planet: 'earth',
  po_k: 20,
  sp_F: 560,
  sp_m: 70,
  jp_mass: 64,
  jp_s: 0.43,
  va_v: 9.5,
  th_case: 'c',
  ph_t: 0.5,
  pw_om: 15.7,
  ba_w: 38.5,
  co_v: 4.4,
  co_dx: 0.01,
  co_m: 3,
  bx_v: 30,
  fl_v: 18,
  fl_theta: 40,
};

export interface SimFlags {
  presionMode: 'stand' | 'walk';
  gaitPlaying: boolean;
  energyMode: 'walk' | 'run';
  pogoPlaying: boolean;
  jumpMode: 'cm' | 'sq';
  phPlaying: boolean;
  wrist: boolean;
  glove: boolean;
  air: boolean;
  mag: boolean;
  golfPhase: number;
  pogoPhase: number;
  throwPhase: number;
  pwVis: number;
  pwT: number;
}

export const DEFAULT_FLAGS: SimFlags = {
  presionMode: 'stand',
  gaitPlaying: false,
  energyMode: 'walk',
  pogoPlaying: false,
  jumpMode: 'cm',
  phPlaying: false,
  wrist: true,
  glove: true,
  air: true,
  mag: false,
  golfPhase: 0,
  pogoPhase: 0,
  throwPhase: 0,
  pwVis: 15.7,
  pwT: 0,
};

export type OutFn = (id: string, text: string) => void;

function getCanvas(id: string): { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const cv = document.getElementById(id) as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth || !cv.clientHeight) return null;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = cv.getContext('2d');
  if (!ctx) return null;
  const dpr = cv.width / w || 1;
  AB.setup(ctx, w, h, dpr);
  return { cv, ctx, w, h };
}

/* ── S1 · Estabilidad y bipedestación ── */
export function drawStab(p: SimParams, _flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-stab');
  if (!c) return;
  const { ctx, w, h } = c;
  const H = p.stab_H || 1.8;
  const theta = p.stab_theta || 0;
  const yg = h * 0.86;
  const Hpx = Math.min(h * 0.62, w * 0.5);
  const hCM = Hpx * 0.55;
  const dF = Hpx * 0.114, dB = Hpx * 0.0375;
  const cx = w / 2;
  const heel = cx - dB, toe = cx + dF;
  const th = (theta * Math.PI) / 180;
  const cxm = cx + hCM * Math.sin(th);
  const cym = yg - hCM * Math.cos(th);
  const stable = cxm >= heel && cxm <= toe;
  const aF = (Math.atan(dF / hCM) * 180) / Math.PI, aB = (Math.atan(dB / hCM) * 180) / Math.PI;

  const is3D = window.__stab3d && window.__stab3d.ready;

  let dxH = heel, dxT = toe, dxCm = cxm, dyCm = cym;
  let dyH = yg, dyT = yg;
  let dyFloor = yg, dxFloor = cxm;
  let pxLeft = heel, pxRight = toe;

  if (is3D && window.__stab3d) {
    window.__stab3d.update({ theta, H, stable, hCM, cx, cxm, cym, yg, heel, toe, hpx: Hpx, dB, dF });
    ctx.clearRect(0, 0, w, h);
    const getPos = window.__stab3d.getScreenPos;
    if (getPos) {
      const k = 1.9 / Hpx;
      const ux = (cxm - cx) * k;
      const uy = (yg - cym) * k;

      const pAnkle = getPos(0, 0, 0);
      const pCM = getPos(ux, uy, 0);
      const pFloor = getPos(ux, 0, 0);
      const pHeel = getPos(-dB * k, 0, 0);
      const pToe = getPos(dF * k, 0, 0);

      dyH = pAnkle.y;
      dxCm = pCM.x; dyCm = pCM.y;
      dxFloor = pFloor.x; dyFloor = pFloor.y;
      dxH = pHeel.x; dyH = pHeel.y;
      dxT = pToe.x; dyT = pToe.y;

      pxLeft = Math.min(dxH, dxT);
      pxRight = Math.max(dxH, dxT);
    }
  }

  // Suelo 2D si no está en 3D
  if (!is3D) {
    const grd = ctx.createLinearGradient(0, yg, 0, yg + h * 0.14);
    grd.addColorStop(0, 'rgba(35,44,54,.16)');
    grd.addColorStop(1, 'rgba(35,44,54,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(w * 0.04, yg, w * 0.92, h * 0.14);
    ctx.strokeStyle = AB.PAL.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(w * 0.04, yg);
    ctx.lineTo(w * 0.96, yg);
    ctx.stroke();
  }

  // Base de sustentación
  ctx.beginPath();
  ctx.moveTo(dxH, dyH);
  ctx.lineTo(dxT, dyT);
  ctx.strokeStyle = 'rgba(13,110,100,.5)';
  ctx.lineWidth = 3;
  ctx.stroke();
  AB.text(ctx, 'talón', dxH, dyH + 13, { size: 9, color: AB.PAL.ink3, align: 'center' });
  AB.text(ctx, 'dedos', dxT, dyT + 13, { size: 9, color: AB.PAL.ink3, align: 'center' });

  // Pie 2D
  if (!is3D) {
    const sh = ctx.createRadialGradient(cx, yg, 2, cx, yg, (toe - heel) * 0.95);
    sh.addColorStop(0, 'rgba(35,44,54,.22)');
    sh.addColorStop(1, 'rgba(35,44,54,0)');
    ctx.save();
    ctx.translate(cx, yg);
    ctx.scale(1, 0.3);
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.arc(0, 0, (toe - heel) * 0.95, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // dibujar pie anatómico
    const L = toe - heel;
    ctx.save();
    ctx.fillStyle = AB.PAL.skin;
    ctx.strokeStyle = AB.PAL.skinEdge;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(heel, yg - 1);
    ctx.quadraticCurveTo(heel - 3, yg - 9, heel + L * 0.18, yg - 11);
    ctx.quadraticCurveTo(heel + L * 0.5, yg - 13, cx, yg - 12);
    ctx.quadraticCurveTo(toe - L * 0.25, yg - 12, toe - 3, yg - 9);
    ctx.quadraticCurveTo(toe + 3, yg - 4, toe, yg - 1);
    ctx.lineTo(toe, yg);
    ctx.lineTo(heel, yg);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Ángulos máximos
  AB.text(ctx, 'máx. adelante ' + AB.fmt(aF, 1) + '°', pxRight + 4, Math.max(dyH, dyT) - 12, { size: 9, align: 'left', color: AB.PAL.teal });
  AB.text(ctx, 'máx. atrás ' + AB.fmt(aB, 1) + '°', pxLeft - 4, Math.max(dyH, dyT) - 12, { size: 9, align: 'right', color: AB.PAL.teal });

  // Línea de gravedad + centro de masa
  const col = stable ? AB.PAL.teal : AB.PAL.blood;
  ctx.strokeStyle = col;
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(dxCm, dyCm);
  ctx.lineTo(dxFloor, dyFloor);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(dxCm, dyCm, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = AB.PAL.card;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(dxCm, dyCm, 5.5, 0, Math.PI * 2);
  ctx.stroke();
  AB.text(ctx, 'CM', dxCm, dyCm - 13, { size: 10, weight: '700', color: col });

  // Reacción / torque de vuelco
  if (stable) {
    AB.triangle(ctx, dxFloor, dyFloor - 5, 8, { color: AB.PAL.teal });
    AB.arrow(ctx, dxFloor, dyFloor - 46, dxFloor, dyFloor - 7, { color: AB.PAL.teal, width: 2.4, head: 7 });
    AB.text(ctx, 'R = P', dxFloor, dyFloor - 54, { size: 9, weight: '700', color: AB.PAL.teal });
  } else {
    AB.triangle(ctx, dxFloor, dyFloor - 5, 8, { color: AB.PAL.blood });
    const pivX = cxm < heel ? dxH : dxT;
    const pivY = cxm < heel ? dyH : dyT;
    const dir = cxm < heel ? -1 : 1;
    const rr = 0.16 * Hpx, cyy = pivY - rr;
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const start = dir > 0 ? Math.PI * 1.15 : Math.PI * -0.15;
    const end = dir > 0 ? Math.PI * 1.95 : Math.PI * 0.65;
    ctx.beginPath();
    ctx.arc(pivX, cyy, rr, start, end, dir <= 0);
    ctx.stroke();
    const ex = pivX + rr * Math.cos(end), ey = cyy + rr * Math.sin(end);
    const tx = -Math.sin(end), ty = Math.cos(end), nx = -ty, ny = tx;
    const ax = ex - 12 * tx, ay = ey - 12 * ty;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ax + 6 * nx, ay + 6 * ny);
    ctx.lineTo(ax - 6 * nx, ay - 6 * ny);
    ctx.closePath();
    ctx.fill();

    AB.text(ctx, '¡pierde el equilibrio!', dxCm, dyCm - 22, { size: 11, weight: '700', color: AB.PAL.blood, align: cxm < heel ? 'right' : 'left' });
    AB.text(ctx, 'τ de vuelco', pivX + dir * 34, pivY - 34, { size: 9, weight: '700', color: AB.PAL.blood, align: cxm < heel ? 'right' : 'left' });
  }

  const resText = AB.fmt(theta, 1) + '° · ' + (stable ? 'estable ✓' : '¡se cae! ✗');
  if (out) out('stab_out', resText);
}

/* ── S2 · Presión bajo los pies ── */
function sole(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, P: number) {
  const c = P < 8 ? AB.PAL.teal : P < 25 ? AB.PAL.amber : AB.PAL.blood;
  ctx.fillStyle = 'rgba(13,110,100,.07)';
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - len * 0.17, y - len * 0.5);
  ctx.quadraticCurveTo(x, y - len * 0.58, x + len * 0.17, y - len * 0.5);
  ctx.lineTo(x + len * 0.23, y - len * 0.02);
  ctx.quadraticCurveTo(x + len * 0.3, y + len * 0.28, x, y + len * 0.4);
  ctx.quadraticCurveTo(x - len * 0.3, y + len * 0.28, x - len * 0.23, y - len * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  function heat(hx: number, hy: number, hr: number) {
    const g = ctx.createRadialGradient(hx, hy, 2, hx, hy, hr);
    g.addColorStop(0, c);
    g.addColorStop(1, 'rgba(13,110,100,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fill();
  }
  heat(x, y - len * 0.34, len * 0.21);
  heat(x, y + len * 0.28, len * 0.21);
}

export function drawPresion(p: SimParams, flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-presion');
  if (!c) return;
  const { ctx, w, h } = c;
  const m = p.pr_mass || 70;
  const W = m * 9.8;
  const mode = flags.presionMode || 'stand';
  const Pavg = 2 * (m / 70), Pheel = 10 * (m / 70), Pgait = (2 * W) / 23;
  const P = mode === 'stand' ? Pavg : Pgait;
  const feet = mode === 'stand' ? 2 : 1;
  const flen = Math.min(w * 0.32, h * 0.4);
  const fy = h * 0.52;
  const x0 = w / 2 - (feet === 2 ? flen * 0.62 : flen * 0.42);

  for (let i = 0; i < feet; i++) {
    const fx = x0 + i * flen * 1.24;
    sole(ctx, fx, fy, flen, P);
    if (mode === 'walk' && i === 0) {
      AB.arrow(ctx, fx, fy + flen * 0.46, fx - flen * 0.5, fy + flen * 0.46, { color: AB.PAL.blood, width: 3.5 });
      AB.text(ctx, 'reacción del suelo', fx - flen * 0.28, fy + flen * 0.6, { size: 9, color: AB.PAL.blood });
    }
  }

  const gx = w * 0.16, gw = w * 0.68, gy = h * 0.88;
  const grad = ctx.createLinearGradient(gx, 0, gx + gw, 0);
  grad.addColorStop(0, AB.PAL.teal);
  grad.addColorStop(0.5, AB.PAL.amber);
  grad.addColorStop(1, AB.PAL.blood);
  ctx.fillStyle = grad;
  ctx.fillRect(gx, gy, gw, 8);
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(gx, gy, gw, 8);
  AB.text(ctx, '2 N/cm²', gx, gy + 16, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, '60 N/cm²', gx + gw, gy + 16, { size: 8, color: AB.PAL.ink3, align: 'right' });
  AB.text(ctx, mode === 'stand' ? 'De pie · ambos pies' : 'Caminando · un pie', w / 2, h * 0.2, { size: 11, weight: '700', color: AB.PAL.teal });

  const res = mode === 'stand'
    ? 'P media = ' + AB.fmt(Pavg, 1) + ' · talón = ' + AB.fmt(Pheel, 1) + ' N/cm²'
    : 'P de apoyo = ' + AB.fmt(Pgait, 1) + ' N/cm²';
  if (out) out('pr_out', res);
}

/* ── S3 · Ciclo de la marcha ── */
export function drawGait(p: SimParams, _flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-gait');
  if (!c) return;
  const { ctx, w, h } = c;
  const t = p.gait_t || 0;
  const yg = h * 0.82, cx = w / 2;
  const leg = Math.min(h * 0.42, w * 0.3);
  const stride = leg * 0.9;
  const hipY = yg - leg;
  const stance = 62, lift = leg * 0.22;

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.05, yg);
  ctx.lineTo(w * 0.95, yg);
  ctx.stroke();

  for (let i = 0; i < 2; i++) {
    const ph = (t + i * 50) % 100;
    const hipX = cx + Math.sin((t / 100) * Math.PI * 2 + i * Math.PI) * stride * 0.22;
    const isStance = ph < stance;
    let footX: number, footY: number, kneeX: number, kneeY: number;
    if (isStance) {
      const pRatio = ph / stance;
      footX = hipX - stride * 0.28 + pRatio * stride * 0.56;
      footY = yg;
      kneeX = (hipX + footX) / 2 + (yg - hipY) * 0.07;
      kneeY = (hipY + yg) / 2 + (0.06 + 0.14 * Math.sin(Math.PI * pRatio)) * leg;
    } else {
      const pRatio = (ph - stance) / (100 - stance);
      footX = hipX - stride * 0.5 + pRatio * stride * 1.05;
      footY = yg - Math.sin(pRatio * Math.PI) * lift - 4;
      kneeX = (hipX + footX) / 2 + (yg - hipY) * 0.12;
      kneeY = (hipY + footY) / 2 - 0.22 * leg * Math.sin(pRatio * Math.PI);
    }
    const col = isStance ? AB.PAL.teal : AB.PAL.amber;
    AB.bone(ctx, hipX, hipY, kneeX, kneeY, { width: 9, edge: '#9b8a64', fill: isStance ? '#d9d2bd' : '#e8dfc9', joint: false });
    AB.bone(ctx, kneeX, kneeY, footX, footY, { width: 8, edge: '#9b8a64', fill: isStance ? '#cfc4ae' : '#e8dfc9', joint: false });
    AB.joint(ctx, hipX, hipY, 4.5, { color: AB.PAL.ink3, fill: AB.PAL.card });
    AB.joint(ctx, kneeX, kneeY, 3.5, { color: col, fill: AB.PAL.card });
    if (isStance) AB.foot(ctx, footX, yg, 0, { len: 30, h: 13, fill: '#d9a77c' });
    else AB.foot(ctx, footX, footY + 8, 0.25, { len: 28, h: 12, fill: '#e9c49f' });
    AB.text(ctx, isStance ? 'Apoyo' : 'Balanceo', hipX, hipY - 14, { size: 9, weight: '700', color: col });
  }

  const barW = w * 0.4, barX = cx - barW / 2, barY = yg + 24;
  AB.text(ctx, 'P1', barX - 10, barY + 4, { size: 8, color: AB.PAL.ink3, align: 'right' });
  AB.text(ctx, 'P2', barX - 10, barY + 18, { size: 8, color: AB.PAL.ink3, align: 'right' });
  for (let i = 0; i < 2; i++) {
    const ph = (t + i * 50) % 100;
    ctx.fillStyle = 'rgba(107,120,133,.18)';
    ctx.fillRect(barX, barY + i * 14, barW, 9);
    ctx.fillStyle = ph < stance ? AB.PAL.teal : AB.PAL.amber;
    ctx.fillRect(barX, barY + i * 14, barW * (ph < stance ? stance / 100 : (100 - stance) / 100), 9);
    ctx.strokeStyle = AB.PAL.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY + i * 14, barW, 9);
  }
  AB.text(ctx, 'apoyo 62 %', barX + barW * 0.31, barY - 3, { size: 8, color: AB.PAL.teal });
  AB.text(ctx, 'balanceo 38 %', barX + barW * 0.75, barY - 3, { size: 8, color: AB.PAL.amber });

  if (out) out('gait_out', 't = ' + AB.fmt(t, 0) + ' % · Apoyo 62 % · Balanceo 38 %');
}

/* ── S4 · Fricción de la marcha ── */
export function drawFriccion(p: SimParams, _flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-friccion');
  if (!c) return;
  const { ctx, w, h } = c;
  const mu = p.fr_mu || 0.17;
  const ok = mu >= 0.15;
  const yg = h * 0.66;

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.05, yg);
  ctx.lineTo(w * 0.95, yg);
  ctx.stroke();

  const fx = w / 2, fy = yg;
  AB.foot(ctx, fx, fy, 0, { len: 64, h: 22, fill: '#e9c49f' });
  AB.arrow(ctx, fx - 6, fy - 2, fx - 6 - 140, fy - 2, { color: ok ? AB.PAL.teal : AB.PAL.blood, width: 4 });
  AB.text(ctx, 'el pie empuja ←', fx - 80, fy - 30, { size: 9, color: AB.PAL.ink3 });
  AB.text(ctx, ok ? 'F fricción (reacción)' : 'sin fricción suficiente', fx - 150, fy - 46, { size: 9, align: 'left', color: ok ? AB.PAL.teal : AB.PAL.blood });

  const gx = w * 0.12, gw = w * 0.76, gy = h * 0.85;
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx + gw, gy);
  ctx.stroke();
  const xt = gx + gw * (0.15 / 0.4);
  ctx.fillStyle = 'rgba(13,110,100,.14)';
  ctx.fillRect(xt, gy - 6, gx + gw - xt, 12);
  ctx.strokeStyle = AB.PAL.teal;
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(xt, gy - 9);
  ctx.lineTo(xt, gy + 9);
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'mín. 0,15', xt, gy + 16, { size: 8, color: AB.PAL.teal });
  const mx = gx + gw * (mu / 0.4);
  ctx.fillStyle = ok ? AB.PAL.teal : AB.PAL.blood;
  ctx.beginPath();
  ctx.moveTo(mx, gy - 9);
  ctx.lineTo(mx - 5, gy - 17);
  ctx.lineTo(mx + 5, gy - 17);
  ctx.closePath();
  ctx.fill();
  AB.text(ctx, 'μ = ' + AB.fmt(mu, 2), mx, gy - 26, { size: 10, weight: '700', color: ok ? AB.PAL.teal : AB.PAL.blood });
  AB.text(ctx, ok ? '¡camina! ✓' : '¡resbala! ✗', w / 2, h * 0.22, { size: 17, weight: '700', color: ok ? AB.PAL.good : AB.PAL.blood });

  if (out) out('fr_out', 'μ = ' + AB.fmt(mu, 2) + ' ' + (ok ? '✓ camina' : '✗ resbala'));
}

/* ── S5 · Pierna como péndulo ── */
export function drawPendulo(p: SimParams, clock: number, _flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-pendulo');
  if (!c) return;
  const { ctx, w, h } = c;
  const H = p.pe_H || 1.8;
  const planet = p.pe_planet || 'earth';
  const g = planet === 'moon' ? 1.62 : planet === 'mars' ? 3.71 : 9.81;
  const L = 0.53 * H;
  const Thalf = Math.PI * Math.sqrt(L / g);
  const w0 = Math.sqrt(g / L);
  const A = Math.PI / 4;
  const time = clock;
  const ang = A * Math.cos(w0 * time);
  const px = w * 0.5, py = h * 0.2;
  const Lpx = Math.min(h * 0.58, w * 0.42);
  const ax = px + Lpx * Math.sin(ang), ay = py + Lpx * Math.cos(ang);

  ctx.strokeStyle = 'rgba(107,120,133,.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let k = -60; k <= 60; k += 4) {
    const r = (k * Math.PI) / 180;
    ctx.lineTo(px + Lpx * Math.sin(r), py + Lpx * Math.cos(r));
  }
  ctx.stroke();
  AB.dashed(ctx, px, py, px, py + Lpx, { color: AB.PAL.ink3 });
  AB.text(ctx, '0°', px + 12, py + Lpx, { size: 9, color: AB.PAL.ink3, align: 'left' });

  const deg = (ang * 180) / Math.PI;
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(px, py, 26, -Math.PI / 2, -Math.PI / 2 + ang, ang < 0);
  ctx.stroke();
  AB.text(ctx, AB.fmt(deg, 0) + '°', px, py - 12, { size: 10, weight: '700', color: AB.PAL.teal });

  AB.bone(ctx, px, py, ax, ay, { width: 11, edge: '#9b8a64', fill: '#cfc4ae', joint: false });
  AB.joint(ctx, px, py, 6, { color: AB.PAL.teal });
  AB.joint(ctx, ax, ay, 4.5, { color: AB.PAL.amber });
  AB.foot(ctx, ax, ay, 0, { len: 34, h: 13, fill: '#d9a77c' });
  AB.text(ctx, 'L = ' + AB.fmt(L, 2) + ' m', px + Lpx * 0.44, py - 16, { size: 9, color: AB.PAL.ink2 });

  if (out) out('pe_out', 'T½ = ' + AB.fmt(Thalf, 2) + ' s · v_max = ' + AB.fmt(Math.sqrt(g * L), 1) + ' m/s');
}

/* ── S6 · Energética caminar vs correr ── */
export function drawEnergy(_p: SimParams, flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-energy');
  if (!c) return;
  const { ctx, w, h } = c;
  const run = flags.energyMode === 'run';
  const x0 = w * 0.08, x1 = w * 0.92, y0 = h * 0.16, y1 = h * 0.72;
  const A = 0.3, K0 = 1.0;
  function toXY(t: number, v: number): [number, number] {
    return [x0 + t * (x1 - x0), y1 - (v / 2.4) * (y1 - y0)];
  }

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  for (let g = 0; g <= 2; g += 0.5) {
    const [, py] = toXY(0, g / 2.4);
    ctx.strokeStyle = 'rgba(107,120,133,.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, py);
    ctx.lineTo(x1, py);
    ctx.stroke();
    AB.text(ctx, AB.fmt(g, 0), x0 - 6, py, { size: 8, color: AB.PAL.ink3, align: 'right' });
  }
  AB.text(ctx, '1 ciclo', w / 2, y1 + 14, { size: 9, color: AB.PAL.ink3 });

  const curves: Record<string, (t: number) => number> = {
    PE: run ? (t) => K0 + A * Math.cos(2 * Math.PI * t) : (t) => K0 + A * Math.cos(2 * Math.PI * t),
    KEH: run ? (t) => K0 + A * Math.cos(2 * Math.PI * t) : (t) => K0 - A * 0.9 * Math.cos(2 * Math.PI * t),
    KEV: (t) => 0.1 + 0.03 * Math.cos(4 * Math.PI * t),
    TOT: run
      ? (t) => K0 + A * Math.cos(2 * Math.PI * t) + K0 + A * Math.cos(2 * Math.PI * t) + 0.1
      : (t) => K0 + A * Math.cos(2 * Math.PI * t) + K0 - A * 0.9 * Math.cos(2 * Math.PI * t) + 0.1,
  };
  const colors: Record<string, string> = { PE: AB.PAL.sagittal, KEH: AB.PAL.teal, KEV: AB.PAL.amber, TOT: AB.PAL.blood };
  const labels: Record<string, string> = { PE: 'PE (potencial)', KEH: 'KE horizontal', KEV: 'KE vertical', TOT: 'E total' };

  for (const key in curves) {
    ctx.strokeStyle = colors[key];
    ctx.lineWidth = key === 'TOT' ? 3 : 2;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const [px, py] = toXY(t, curves[key](t));
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }

  let lx = x0;
  for (const key in curves) {
    ctx.fillStyle = colors[key];
    ctx.fillRect(lx, y0 - 16, 10, 4);
    AB.text(ctx, labels[key], lx + 14, y0 - 15, { size: 8, color: AB.PAL.ink2, align: 'left' });
    lx += key === 'KEH' ? 100 : key === 'PE' ? 86 : key === 'KEV' ? 88 : 70;
  }

  AB.text(
    ctx,
    run ? 'EN FASE → E total oscila' : 'FUERA DE FASE → E total ≈ constante',
    w / 2,
    h * 0.88,
    { size: 12, weight: '700', color: run ? AB.PAL.amber : AB.PAL.good }
  );

  if (out) out('en_out', run ? 'En fase ✗ · E total ondula' : 'Fuera de fase ✓ · E total ≈ constante');
}

/* ── S7 · Pogo stick ── */
export function drawPogo(p: SimParams, flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-pogo');
  if (!c) return;
  const { ctx, w, h } = c;
  const k = p.po_k || 20;
  const ph = flags.pogoPhase || 0;
  const yg = h * 0.88;
  const px = w * 0.3;
  const s = k > 0 ? Math.max(0, Math.cos(ph * 2 * Math.PI)) * (h * 0.12) : 0;

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.05, yg);
  ctx.lineTo(w * 0.95, yg);
  ctx.stroke();

  const springTop = yg - h * 0.3 + s;
  const coils = 5;
  ctx.strokeStyle = 'rgba(154,91,0,.9)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= coils * 2; i++) {
    const xx = px + (i % 2 ? 10 : -10);
    const yy = springTop + (yg - 8 - springTop) * (i / (coils * 2));
    i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
  }
  ctx.stroke();

  ctx.fillStyle = AB.PAL.ink3;
  ctx.fillRect(px - 24, yg - 8, 48, 8);

  const cy = springTop - h * 0.2;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(px, springTop);
  ctx.lineTo(px, cy);
  ctx.stroke();
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, cy - h * 0.09, h * 0.055, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const eKE = (1 - Math.max(0, Math.cos(ph * 2 * Math.PI))) * 100;
  const eEE = s > 0 ? (s / (h * 0.12)) * 100 : 0;
  const barX = w * 0.58, barW = w * 0.34;
  function eBar(yy: number, frac: number, col: string, lab: string, val: string) {
    ctx.fillStyle = 'rgba(107,120,133,.18)';
    ctx.fillRect(barX, yy, barW, 12);
    ctx.fillStyle = col;
    ctx.fillRect(barX, yy, barW * frac, 12);
    ctx.strokeStyle = AB.PAL.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, yy, barW, 12);
    AB.text(ctx, lab + ' ' + val, barX, yy - 4, { size: 8, color: AB.PAL.ink2, align: 'left' });
  }
  eBar(h * 0.16, eKE / 100, AB.PAL.teal, 'KE cinética', AB.fmt(eKE, 0) + ' J');
  eBar(h * 0.3, eEE / 100, AB.PAL.amber, 'EE elástica', AB.fmt(eEE, 0) + ' J');
  eBar(h * 0.44, 0.93, AB.PAL.good, 'Aquiles · recuperable', '35 J → 93 %');
  eBar(h * 0.56, 0.8, AB.PAL.good, 'Arco · recuperable', '17 J → 80 %');
  eBar(h * 0.68, 0.12, AB.PAL.teal, 'Pista · devuelve', '12 J → +2 %');
  AB.text(ctx, 'KE + EE ≈ constante durante el contacto', w / 2, h * 0.94, { size: 9, color: AB.PAL.teal });

  if (out) out('po_out', 'EE 35 J (93 % vuelve) · arco 17 J (80 %)');
}

/* ── S8 · Sprint ── */
export function drawSprint(p: SimParams, _flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-sprint');
  if (!c) return;
  const { ctx, w, h } = c;
  const F = p.sp_F || 560, mb = p.sp_m || 70;
  const mLeg = 0.161 * mb, L = 1.0;
  const v = Math.sqrt((2 * F * L) / mLeg);
  const vmph = v * 2.237;
  const yg = h * 0.78;

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.05, yg);
  ctx.lineTo(w * 0.95, yg);
  ctx.stroke();
  ctx.fillStyle = AB.PAL.ink3;
  ctx.fillRect(w * 0.62, yg - 18, 26, 18);
  ctx.fillRect(w * 0.7, yg - 10, 20, 10);

  const ax = w * 0.55;
  ctx.save();
  ctx.translate(ax, yg);
  ctx.rotate(-0.35);
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -h * 0.5);
  ctx.stroke();
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.5);
  ctx.lineTo(0, -h * 0.72);
  ctx.stroke();
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -h * 0.78, h * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  AB.arrow(ctx, ax - 6, yg - 12, ax - 6 - w * 0.22, yg - 12, { color: AB.PAL.blood, width: 5 });
  AB.text(ctx, 'F = ' + AB.fmt(F, 0) + ' N', ax - w * 0.14, yg - 34, { size: 10, weight: '700', color: AB.PAL.blood });

  const gx = w * 0.12, gw = w * 0.76, gy = h * 0.9;
  ctx.fillStyle = 'rgba(107,120,133,.18)';
  ctx.fillRect(gx, gy, gw, 12);
  ctx.fillStyle = AB.PAL.teal;
  ctx.fillRect(gx, gy, gw * Math.min(1, v / 14), 12);
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(gx, gy, gw, 12);
  const boltX = gx + gw * (10.4 / 14);
  ctx.strokeStyle = AB.PAL.amber;
  ctx.setLineDash([4, 3]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(boltX, gy - 6);
  ctx.lineTo(boltX, gy + 18);
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'Bolt ≈ 10,4 m/s', boltX, gy - 10, { size: 8, color: AB.PAL.amber });

  if (out) out('sp_out', 'v = ' + AB.fmt(v, 1) + ' m/s (' + AB.fmt(vmph, 1) + ' mph)');
}

/* ── S9 · Salto vertical ── */
export function drawJump(p: SimParams, flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-jump');
  if (!c) return;
  const { ctx, w, h } = c;
  const m = p.jp_mass || 64, s = p.jp_s || 0.43;
  const W = m * 9.8;
  const N = 1342 * (m / 64);
  const net = N - W, a = net / m;
  const vTO = Math.sqrt(Math.max(0, 2 * a * s));
  const H = (vTO * vTO) / (2 * 9.8);
  const tau = vTO / a;
  const cm = flags.jumpMode === 'cm';

  const x0 = w * 0.08, x1 = w * 0.92, y0 = h * 0.14, y1 = h * 0.66;
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  const Nmax = Math.max(N * 1.25, W * 1.3);
  function fy(Nv: number) {
    return y1 - (Nv / Nmax) * (y1 - y0);
  }

  AB.dashed(ctx, x0, fy(W), x1, fy(W), { color: AB.PAL.ink3 });
  AB.text(ctx, 'W = ' + AB.fmt(W, 0) + ' N', x0 + 6, fy(W) + 10, { size: 8, color: AB.PAL.ink3, align: 'left' });
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, px = x0 + t * (x1 - x0);
    let Nt: number;
    if (cm) {
      if (t < 0.25) Nt = W * 0.85;
      else if (t < 0.75) Nt = N + (Nmax - N) * 0.15 * ((t - 0.25) / 0.5);
      else Nt = N;
    } else {
      Nt = t < 0.5 ? W + ((N - W) * t) / 0.5 : N;
    }
    const py = fy(Nt);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  AB.text(ctx, 'N(t) fuerza sobre el suelo', (x0 + x1) / 2, y0 - 8, { size: 9, color: AB.PAL.teal });
  AB.text(ctx, cm ? 'contramovimiento' : 'sentadilla', x1, y1 + 14, { size: 8, color: AB.PAL.ink3, align: 'right' });

  const jx = w * 0.5, jy = y1 + 34;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(jx, jy);
  ctx.lineTo(jx, jy - h * 0.22);
  ctx.stroke();
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(jx, jy - h * 0.22);
  ctx.lineTo(jx, jy - h * 0.34);
  ctx.stroke();
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(jx, jy - h * 0.38, h * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  AB.text(ctx, 'H = ' + AB.fmt(H, 2) + ' m', jx + 26, jy - h * 0.34, { size: 10, weight: '700', color: AB.PAL.good, align: 'left' });

  if (out) out('jp_out', 'H = ' + AB.fmt(H, 2) + ' m · τ = ' + AB.fmt(tau, 2) + ' s · v_TO = ' + AB.fmt(vTO, 1) + ' m/s');
}

/* ── S10 · Pértiga ── */
export function drawVault(p: SimParams, _flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-vault');
  if (!c) return;
  const { ctx, w, h } = c;
  const vHi = p.va_v || 9.5;
  const hBar = 0.8 + (vHi * vHi) / (2 * 9.8);
  const yg = h * 0.86, top = h * 0.1;
  const scale = (yg - top) / 7;

  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, top);
  ctx.lineTo(w * 0.1, yg);
  ctx.stroke();
  for (let m = 0; m <= 7; m++) {
    const y = yg - m * scale;
    ctx.strokeStyle = AB.PAL.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, y);
    ctx.lineTo(w * 0.14, y);
    ctx.stroke();
    AB.text(ctx, m + ' m', w * 0.08, y, { size: 8, color: AB.PAL.ink3, align: 'right' });
  }

  const by = yg - hBar * scale;
  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.16, by);
  ctx.lineTo(w * 0.9, by);
  ctx.stroke();
  AB.text(ctx, 'h = ' + AB.fmt(hBar, 1) + ' m', w * 0.9, by - 6, { size: 10, weight: '700', color: AB.PAL.blood, align: 'right' });

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const px = w * 0.2 + t * (w * 0.7);
    const y = yg - (0.8 + (vHi * vHi) / (2 * 9.8)) * scale * Math.sin(t * Math.PI * 0.85);
    i ? ctx.lineTo(px, y) : ctx.moveTo(px, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'récord 6,16 m', w * 0.5, by - scale * 0.76, { size: 8, color: AB.PAL.ink3 });

  const bx = w * 0.18;
  AB.text(ctx, 'energía del salto', bx, h * 0.05, { size: 9, color: AB.PAL.ink2, align: 'left' });
  ctx.fillStyle = AB.PAL.teal;
  ctx.fillRect(bx, h * 0.08, w * 0.26, 10);
  AB.text(ctx, 'KE ½mv²', bx + 6, h * 0.115, { size: 8, color: AB.PAL.ink2, align: 'left' });
  ctx.fillStyle = AB.PAL.amber;
  ctx.fillRect(bx, h * 0.135, w * 0.26 * (hBar / 7), 10);
  AB.text(ctx, 'PE mgh', bx + 6, h * 0.17, { size: 8, color: AB.PAL.ink2, align: 'left' });

  if (out) out('va_out', 'h_bar = ' + AB.fmt(hBar, 1) + ' m');
}

/* ── S11 · Lanzar: modelo de un segmento ── */
export function drawThrow(p: SimParams, flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-throw');
  if (!c) return;
  const { ctx, w, h } = c;
  const CASES = { a: 81.7, b: 115.5, c: 308, d: 346 };
  const key = p.th_case || 'c';
  const alpha = CASES[key];
  const L = 0.36, mF = 2, mB = 0.146;
  const I = (1 / 3) * mF * L * L + mB * L * L;
  const tf = Math.sqrt(Math.PI / alpha);
  const vB = L * Math.sqrt(Math.PI * alpha);

  const phase = flags.throwPhase || 0;
  const pr = Math.min(1, phase / tf);
  const smooth = 1 - Math.pow(1 - pr, 2);

  const ex = w * 0.44, ey = h * 0.6;
  const Lpx = Math.min(h * 0.5, w * 0.34);
  AB.bone(ctx, ex, ey - Lpx * 0.5, ex, ey, { width: 13, edge: '#9b8a64', fill: '#d9d2bd', joint: false });
  AB.joint(ctx, ex, ey - Lpx * 0.5, 6, { color: AB.PAL.ink3 });
  AB.text(ctx, 'brazo superior', ex - 8, ey - Lpx * 0.55, { size: 8, color: AB.PAL.ink3 });

  const theta = ((135 - 90 * smooth) * Math.PI) / 180;
  const hx = ex + Lpx * Math.sin(theta), hy = ey + Lpx * Math.cos(theta);
  AB.bone(ctx, ex, ey, hx, hy, { width: 12, edge: '#9b8a64', fill: '#cfc4ae', joint: false });
  AB.joint(ctx, ex, ey, 6.5, { color: AB.PAL.teal });
  AB.text(ctx, 'codo', ex, ey + 16, { size: 9, color: AB.PAL.ink3 });

  AB.muscle(ctx, ex - 16, ey - Lpx * 0.42, ex + 8 + 10 * Math.sin(theta), ey + Lpx * 0.28, { w0: 11, w1: 7, bow: 9, fill: AB.PAL.muscle });

  ctx.beginPath();
  ctx.arc(hx, hy, 7, 0, Math.PI * 2);
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(hx, hy, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = AB.PAL.muscle;
  ctx.fill();

  AB.dashed(ctx, hx, hy, hx + w * 0.28, hy - 10, { color: AB.PAL.amber });
  AB.text(ctx, 'v_B', hx + w * 0.3, hy - 16, { size: 11, weight: '700', color: AB.PAL.amber, align: 'left' });

  AB.arrow(ctx, ex, ey, ex + 56, ey - 18, { color: AB.PAL.teal, width: 3 });
  AB.text(ctx, 'τ = Iα', ex + 64, ey - 26, { size: 10, weight: '700', color: AB.PAL.teal, align: 'left' });

  const ty = h * 0.1;
  AB.text(ctx, 'α = ' + AB.fmt(alpha, 0) + ' s⁻² · I = ' + AB.fmt(I, 3) + ' kg·m²', w / 2, ty - 6, { size: 9, color: AB.PAL.teal });
  const bw = w * 0.26, bx = w * 0.1, bh = 15;
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1;
  (Object.keys(CASES) as (keyof typeof CASES)[]).forEach((k, idx) => {
    const yy = ty + idx * (bh + 6);
    const v = L * Math.sqrt(Math.PI * CASES[k]);
    const isActive = k === key;
    ctx.fillStyle = isActive ? 'rgba(13,110,100,.14)' : 'rgba(251,248,240,.6)';
    ctx.fillRect(bx, yy, bw, bh);
    ctx.strokeRect(bx, yy, bw, bh);
    ctx.fillStyle = isActive ? AB.PAL.teal : AB.PAL.ink2;
    ctx.font = '600 10px Karla, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(' caso ' + k, bx + 5, yy + bh / 2);
    ctx.textAlign = 'right';
    ctx.fillText(AB.fmt(v, 1) + ' m/s', bx + bw - 5, yy + bh / 2);
    if (isActive) AB.triangle(ctx, bx + bw + 14, yy + bh / 2, 6, { color: AB.PAL.teal });
  });
  ctx.textAlign = 'center';

  if (out) out('th_out', 'α = ' + AB.fmt(alpha, 0) + ' s⁻² · t = ' + AB.fmt(tf, 2) + ' s · v_B = ' + AB.fmt(vB, 1) + ' m/s (' + AB.fmt(vB * 2.237, 1) + ' mph)');
}

/* ── S12 · Seis fases del pitcheo ── */
export function drawPhases(p: SimParams, _flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-phases');
  if (!c) return;
  const { ctx, w, h } = c;
  const t = p.ph_t || 0.5;
  const phases: [string, number, number][] = [
    ['Balance', 0, 0.1],
    ['Zancada', 0.1, 0.5],
    ['Armado', 0.5, 0.55],
    ['Aceleración', 0.55, 0.64],
    ['Desacel.', 0.64, 0.7],
    ['Seguim.', 0.7, 0.8],
  ];
  const y = h * 0.3, x0 = w * 0.08, x1 = w * 0.92;
  const xS = x0 + (x1 - x0) * (t / 0.8);

  phases.forEach((ph, idx) => {
    const a = x0 + (x1 - x0) * (ph[1] / 0.8), b = x0 + (x1 - x0) * (ph[2] / 0.8);
    const on = t >= ph[1] && t <= ph[2];
    ctx.fillStyle = on ? AB.PAL.teal : 'rgba(107,120,133,.22)';
    ctx.fillRect(a, y, b - a, 16);
    ctx.strokeStyle = AB.PAL.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(a, y, b - a, 16);
    AB.text(ctx, idx + 1 + '·' + ph[0], (a + b) / 2, y + 28, { size: 8, color: on ? AB.PAL.teal : AB.PAL.ink3 });
  });

  const mk = (tt: number, lab: string) => {
    const mx = x0 + (x1 - x0) * (tt / 0.8);
    ctx.strokeStyle = AB.PAL.blood;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(mx, y - 8);
    ctx.lineTo(mx, y + 22);
    ctx.stroke();
    ctx.setLineDash([]);
    AB.text(ctx, lab, mx, y + 44, { size: 8, color: AB.PAL.blood });
  };
  mk(0.5, 'pie al suelo 0,50 s');
  mk(0.64, 'suelta 0,64 s');

  ctx.fillStyle = AB.PAL.amber;
  ctx.beginPath();
  ctx.moveTo(xS, y - 8);
  ctx.lineTo(xS - 5, y - 17);
  ctx.lineTo(xS + 5, y - 17);
  ctx.closePath();
  ctx.fill();

  const vy = h * 0.6;
  AB.text(ctx, 'velocidades que se suman (mph)', w / 2, vy - 24, { size: 9, color: AB.PAL.ink2 });
  const segs: [string, number, number][] = [
    ['piernas', 10, 0.3],
    ['hombro', 45, 0.45],
    ['codo', 45, 0.55],
  ];
  let cum = 0;
  segs.forEach((sg, idx) => {
    const [name, add, start] = sg;
    const vv = t >= start ? add : 0;
    cum += vv;
    const yb = vy + idx * 27;
    ctx.fillStyle = 'rgba(107,120,133,.18)';
    ctx.fillRect(x0, yb, x1 - x0, 16);
    ctx.fillStyle = AB.PAL.teal;
    ctx.fillRect(x0, yb, (x1 - x0) * (vv / 100), 16);
    ctx.strokeStyle = AB.PAL.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(x0, yb, x1 - x0, 16);
    AB.text(ctx, name + '  +' + add + ' mph', x0 + 6, yb + 8, { size: 9, color: t >= start ? AB.PAL.teal : AB.PAL.ink3, align: 'left' });
  });
  AB.text(ctx, '≈ ' + Math.round(cum) + ' mph', x0, vy + segs.length * 27 + 16, { size: 15, weight: '700', color: AB.PAL.blood, align: 'left' });

  if (out) out('ph_out', 't = ' + AB.fmt(t, 2) + ' s · v ≈ ' + Math.round(cum) + ' mph');
}

/* ── S13 · Potencia del lanzamiento ── */
export function drawPower(p: SimParams, clock: number, flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-power');
  if (!c) return;
  const { ctx, w, h } = c;
  const target = p.pw_om || 15.7;
  const dt = clock ? Math.min(0.06, (clock - (flags.pwT || clock))) : 0.03;
  flags.pwT = clock;
  flags.pwVis = AB.damp(flags.pwVis ?? target, target, 5, dt);
  const Om = flags.pwVis, tau = 36.45;
  const P = tau * Om, Pr = Math.round(P / 10) * 10;

  const ex = w * 0.3, ey = h * 0.56;
  const Lpx = Math.min(h * 0.4, w * 0.3);
  const th = Math.PI / 2 - (Om / 31.4) * (Math.PI / 3);
  const hx = ex + Lpx * Math.sin(th), hy = ey - Lpx * Math.cos(th);
  AB.bone(ctx, ex - 6, ey - Lpx * 0.6, ex - 6, ey, { width: 13, edge: '#9b8a64', fill: '#d9d2bd', joint: false });
  AB.bone(ctx, ex, ey, hx, hy, { width: 12, edge: '#9b8a64', fill: '#cfc4ae', joint: false });
  AB.joint(ctx, ex, ey, 6.5, { color: AB.PAL.teal });
  AB.muscle(ctx, ex - 16, ey - Lpx * 0.5, ex + 6, ey + Lpx * 0.22, { w0: 10, w1: 6, bow: 7 });
  ctx.beginPath();
  ctx.arc(hx, hy, 7, 0, Math.PI * 2);
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
  AB.text(ctx, 'τ = ' + AB.fmt(tau, 2) + ' N·m', ex, ey - Lpx * 0.72, { size: 9, color: AB.PAL.teal });
  AB.text(ctx, 'Ω = ' + AB.fmt(Om, 1) + ' rad/s', ex, ey + Lpx * 0.42, { size: 9, color: AB.PAL.teal });

  const gx = w * 0.56, gw = w * 0.36, gy = h * 0.12, gh = h * 0.6;
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(gx, gy, gw, gh);
  ctx.fillStyle = 'rgba(107,120,133,.12)';
  ctx.fillRect(gx, gy, gw, gh);
  const fillH = Math.min(1, P / 1200) * gh;
  ctx.fillStyle = AB.PAL.blood;
  ctx.fillRect(gx, gy + gh - fillH, gw, fillH);
  const mark = (val: number, lab: string) => {
    const my = gy + gh - (val / 1200) * gh;
    ctx.strokeStyle = AB.PAL.amber;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(gx, my);
    ctx.lineTo(gx + gw, my);
    ctx.stroke();
    ctx.setLineDash([]);
    AB.text(ctx, lab, gx + gw + 2, my, { size: 8, color: AB.PAL.amber, align: 'left' });
  };
  mark(570, '570 W (prom)');
  mark(1140, '1140 W (max)');
  AB.text(ctx, 'W', gx - 4, gy + 6, { size: 8, color: AB.PAL.ink3, align: 'right' });
  AB.text(ctx, '1200', gx - 4, gy + gh, { size: 8, color: AB.PAL.ink3, align: 'right' });

  if (out) out('pw_out', 'P = ' + AB.fmt(Pr, 0) + ' W · ' + AB.fmt(Pr / 746, 2) + ' hp');
}

/* ── S14 · Golpe de golf: péndulo doble ── */
export function drawGolf(_p: SimParams, flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-golf');
  if (!c) return;
  const { ctx, w, h } = c;
  const wrist = flags.wrist;
  const frac = wrist ? 2 / 3 : 1 / 4;
  const phase = flags.golfPhase || 0;
  const shx = w * 0.5, shy = h * 0.32;
  const L1 = Math.min(h * 0.24, w * 0.18), L2 = Math.min(h * 0.4, w * 0.3);
  const th1 = (38 * Math.sin(phase * 2 * Math.PI) * Math.PI) / 180;
  const th2 = wrist ? th1 * 2.3 : th1;
  const ex = shx + L1 * Math.sin(th1), ey = shy + L1 * Math.cos(th1);
  const hx = ex + L2 * Math.sin(th2), hy = ey + L2 * Math.cos(th2);

  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(shx, shy);
  ctx.lineTo(shx, shy - h * 0.15);
  ctx.stroke();
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(shx, shy - h * 0.19, h * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  AB.bone(ctx, shx, shy, ex, ey, { width: 9, edge: '#9b8a64', fill: '#d9d2bd', joint: false });
  AB.bone(ctx, ex, ey, hx, hy, { width: 7, edge: '#9b8a64', fill: '#c7b27a', joint: false });
  AB.joint(ctx, ex, ey, 5, { color: wrist ? AB.PAL.teal : AB.PAL.ink3 });
  AB.text(ctx, 'muñeca', ex, ey - 14, { size: 8, color: AB.PAL.ink3 });
  ctx.fillStyle = AB.PAL.ink;
  ctx.beginPath();
  ctx.arc(hx, hy, 7, 0, Math.PI * 2);
  ctx.fill();

  const gx = w * 0.16, gw = w * 0.68, gy = h * 0.8;
  ctx.fillStyle = 'rgba(107,120,133,.18)';
  ctx.fillRect(gx, gy, gw, 15);
  ctx.fillStyle = wrist ? AB.PAL.teal : AB.PAL.amber;
  ctx.fillRect(gx, gy, gw * frac, 15);
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(gx, gy, gw, 15);
  AB.text(ctx, 'energía que llega a la cabeza del palo', gx, gy - 6, { size: 9, color: AB.PAL.ink2, align: 'left' });
  AB.text(ctx, wrist ? '⅔ (con quiebre)' : '¼ (muñecas rígidas)', gx + gw, gy - 6, { size: 9, weight: '700', color: wrist ? AB.PAL.teal : AB.PAL.amber, align: 'right' });
  AB.text(ctx, 'potencia del swing ≈ 2,5 kW', w / 2, h * 0.95, { size: 9, color: AB.PAL.ink3 });

  if (out) out('gf_out', wrist ? '⅔ a la cabeza (quiebre)' : '¼ a la cabeza (rígidas)');
}

/* ── S15 · Bateo: masa óptima y punto dulce ── */
export function drawBat(p: SimParams, _flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-bat');
  if (!c) return;
  const { ctx, w, h } = c;
  const W = p.ba_w || 38.5;
  const Wp = 5.125, e = 0.55, vp = 80;
  const vPrime = (Ww: number) => {
    const vb = 63 - 0.39 * Ww;
    return ((Wp - e * Ww) * -vp + (1 + e) * Ww * vb) / (Wp + Ww);
  };
  const vv = vPrime(W);
  let best = { W: 38.5, v: 0 };
  for (let ww = 15; ww <= 70; ww += 0.5) {
    const v2 = vPrime(ww);
    if (v2 > best.v) best = { W: ww, v: v2 };
  }

  const yg = h * 0.62, bx = w * 0.1, bl = w * 0.48;
  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(bx, yg);
  ctx.lineTo(bx + bl, yg);
  ctx.stroke();
  ctx.strokeStyle = AB.PAL.bone;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(bx, yg);
  ctx.lineTo(bx + bl, yg);
  ctx.stroke();
  ctx.strokeStyle = '#8a7a56';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bx - 14, yg);
  ctx.lineTo(bx, yg);
  ctx.stroke();
  const sx = bx + bl * (2 / 3);
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(sx, yg, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = AB.PAL.card;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx, yg, 6, 0, Math.PI * 2);
  ctx.stroke();
  AB.text(ctx, 'punto dulce', sx, yg - 22, { size: 9, weight: '700', color: AB.PAL.blood });
  AB.text(ctx, '⅔ desde el mango', sx, yg + 20, { size: 8, color: AB.PAL.ink3 });

  ctx.beginPath();
  ctx.arc(sx + 12, yg - 16, 6, 0, Math.PI * 2);
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
  AB.arrow(ctx, sx + 12, yg - 16, sx + bl + 22, yg - 16, { color: AB.PAL.teal, width: 2.5 });

  const px0 = w * 0.14, px1 = w * 0.94, py0 = h * 0.12, py1 = h * 0.4;
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(px0, py0, px1 - px0, py1 - py0);
  const X = (ww: number) => px0 + (px1 - px0) * ((ww - 15) / 55);
  const Y = (v: number) => py1 - (v / 120) * (py1 - py0);
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let ww = 15; ww <= 70; ww += 0.5) {
    const [x, y] = [X(ww), Y(vPrime(ww))];
    ww === 15 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = AB.PAL.amber;
  ctx.beginPath();
  ctx.arc(X(best.W), Y(best.v), 5, 0, Math.PI * 2);
  ctx.fill();
  AB.text(ctx, 'óptimo ' + AB.fmt(best.W, 1) + ' oz', X(best.W) + 8, Y(best.v), { size: 8, color: AB.PAL.amber, align: 'left' });
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(W), Y(vv), 5, 0, Math.PI * 2);
  ctx.fill();
  AB.text(ctx, 'W = ' + AB.fmt(W, 1) + ' oz', X(W), py1 + 12, { size: 8, color: AB.PAL.blood });
  AB.text(ctx, "v' (mph)", px0, py0 - 10, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, '15 oz', px0, py1 + 12, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, '70 oz', px1, py1 + 12, { size: 8, color: AB.PAL.ink3, align: 'right' });

  if (out) out('ba_out', "v' = " + AB.fmt(vv, 1) + ' mph · óptimo ' + AB.fmt(best.W, 1) + ' oz');
}

/* ── S16 · Colisiones ── */
export function drawCollision(p: SimParams, _flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-collision');
  if (!c) return;
  const { ctx, w, h } = c;
  const v = p.co_v || 4.4, dx = p.co_dx || 0.01, m = p.co_m || 3;
  const a = (v * v) / (2 * dx), G = a / 9.8, F = m * a;

  const yg = h * 0.72;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.08, yg);
  ctx.lineTo(w * 0.56, yg);
  ctx.stroke();

  const dxpx = 5 + Math.max(0, Math.min(55, (Math.log10(dx) - Math.log10(0.001)) * 19));
  ctx.fillStyle = AB.PAL.amber;
  ctx.fillRect(w * 0.12, yg - dxpx, 52, dxpx);
  AB.text(ctx, 'Δx', w * 0.12 + 6, yg - dxpx - 5, { size: 9, weight: '700', color: AB.PAL.amber, align: 'left' });

  const ox = w * 0.24, oy = yg - dxpx - 30;
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ox, oy, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  AB.arrow(ctx, ox, oy - 22, ox, oy - 50, { color: AB.PAL.teal, width: 3, head: 9 });
  AB.text(ctx, 'v = ' + AB.fmt(v, 1) + ' m/s', ox, oy - 60, { size: 9, color: AB.PAL.teal });
  AB.text(ctx, 'm = ' + AB.fmt(m, 0) + ' kg', ox, oy + 28, { size: 9, color: AB.PAL.ink3 });

  const gx = w * 0.66, gy = h * 0.12, gh = h * 0.62, gw = Math.max(w * 0.07, 44);
  const z = (gv: number) => gy + gh * (1 - gv / 250);
  ctx.fillStyle = 'rgba(45,125,79,.14)';
  ctx.fillRect(gx, z(25), gw, gh * (25 / 250));
  ctx.fillStyle = 'rgba(154,91,0,.14)';
  ctx.fillRect(gx, z(80), gw, gh * ((80 - 25) / 250));
  ctx.fillStyle = 'rgba(168,42,30,.18)';
  ctx.fillRect(gx, z(175), gw, gh * ((175 - 80) / 250));
  ctx.fillStyle = 'rgba(168,42,30,.4)';
  ctx.fillRect(gx, z(250), gw, gh * ((250 - 175) / 250));
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(gx, gy, gw, gh);
  [25, 80, 175].forEach((gv) => {
    ctx.strokeStyle = 'rgba(107,120,133,.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, z(gv));
    ctx.lineTo(gx + gw, z(gv));
    ctx.stroke();
  });
  const zlab = [
    { g: 12.5, t: 'seguro', c: AB.PAL.good },
    { g: 52.5, t: 'lesión', c: AB.PAL.amber },
    { g: 127.5, t: 'fractura', c: AB.PAL.blood },
    { g: 212.5, t: 'fatal', c: AB.PAL.blood },
  ];
  zlab.forEach((l) => {
    AB.text(ctx, l.t, gx + gw / 2, z(l.g), { size: 8, weight: '700', color: l.c });
  });
  AB.text(ctx, 'Factor G', gx + gw / 2, gy - 10, { size: 9, weight: '700', color: AB.PAL.ink2 });

  const gv = Math.min(G, 250), my = z(gv);
  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(gx - 5, my);
  ctx.lineTo(gx + gw + 5, my);
  ctx.stroke();
  AB.text(ctx, AB.fmt(gv, 0) + ' g', gx - 8, my, { size: 11, weight: '700', color: AB.PAL.blood, align: 'right' });

  if (out) out('co_out', 'G = ' + AB.fmt(gv, 0) + ' g · F = ' + AB.espan(Math.round(F)) + ' N');
}

/* ── S17 · Golpe de boxeo ── */
export function drawBoxing(p: SimParams, flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-boxing');
  if (!c) return;
  const { ctx, w, h } = c;
  const vPmph = p.bx_v || 30;
  const glove = flags.glove;
  const vP = vPmph / 2.237;
  const vf = glove ? 0.236 * vP : 0.382 * vP;
  const dx = glove ? 0.01 : 0.001;
  const a = (vf * vf) / (2 * dx), G = a / 9.8, tc = (2 * dx) / vf, GSI = Math.pow(G, 2.5) * tc;
  const fy = h * 0.42, fx = w * 0.3;

  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(w * 0.06, fy);
  ctx.lineTo(fx - 14, fy);
  ctx.stroke();

  if (glove) {
    ctx.fillStyle = AB.PAL.muscle;
    ctx.strokeStyle = AB.PAL.muscleEdge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fx, fy, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    AB.text(ctx, 'guante · Δx≈1 cm', fx, fy + 34, { size: 8, color: AB.PAL.muscleEdge });
  } else {
    ctx.fillStyle = AB.PAL.skin;
    ctx.strokeStyle = AB.PAL.skinEdge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fx, fy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(fx, fy, 5, 0, Math.PI * 2);
    ctx.fillStyle = AB.PAL.ink;
    ctx.fill();
    AB.text(ctx, 'puño limpio · Δx≈1 mm', fx, fy + 30, { size: 8, color: AB.PAL.blood });
  }
  AB.arrow(ctx, w * 0.1, fy, fx + (glove ? 24 : 16), fy, { color: AB.PAL.teal, width: 3.5, head: 9 });
  AB.text(ctx, 'v = ' + AB.fmt(vPmph, 0) + ' mph', w * 0.12, fy - 20, { size: 9, color: AB.PAL.teal, align: 'left' });

  const hx = w * 0.72, hy = h * 0.42;
  ctx.fillStyle = AB.PAL.skin;
  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hx, hy, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = AB.PAL.ink;
  ctx.beginPath();
  ctx.arc(hx + 12, hy - 9, 3, 0, Math.PI * 2);
  ctx.arc(hx + 12, hy + 6, 3, 0, Math.PI * 2);
  ctx.fill();
  AB.arrow(ctx, hx, hy - 38, hx, hy - 62, { color: AB.PAL.amber, width: 2.5, head: 8 });
  AB.text(ctx, 'v_f = ' + AB.fmt(vf, 1) + ' m/s', hx, hy - 74, { size: 9, weight: '700', color: AB.PAL.amber });

  const gy = h * 0.8, gx = w * 0.12, gw = w * 0.76;
  ctx.strokeStyle = AB.PAL.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx + gw, gy);
  ctx.stroke();
  ctx.fillStyle = 'rgba(45,125,79,.14)';
  ctx.fillRect(gx, gy - 7, (gw * (Math.log10(1000) - 2)) / 3, 14);
  ctx.fillStyle = 'rgba(168,42,30,.35)';
  ctx.fillRect(gx + (gw * (Math.log10(1000) - 2)) / 3, gy - 7, gw * (1 - (Math.log10(1000) - 2) / 3), 14);
  const pos = (val: number) => gx + (gw * (Math.log10(val) - 2)) / 3;
  const tick = (val: number, lab: string) => {
    const x = pos(val);
    ctx.strokeStyle = AB.PAL.ink3;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, gy - 10);
    ctx.lineTo(x, gy + 10);
    ctx.stroke();
    AB.text(ctx, lab, x, gy + 20, { size: 7, color: AB.PAL.ink3 });
  };
  tick(117, '117');
  tick(593, '593');
  tick(1000, '1000');
  tick(25600, '25 600');
  AB.text(ctx, '≈50 % fatal', pos(1000), gy - 20, { size: 7, color: AB.PAL.blood });
  const tFrac = Math.max(0, Math.min(1, (Math.log10(GSI) - 2) / 3));
  const mx = gx + gw * tFrac;
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.moveTo(mx, gy - 8);
  ctx.lineTo(mx - 5, gy - 15);
  ctx.lineTo(mx + 5, gy - 15);
  ctx.closePath();
  ctx.fill();
  AB.text(ctx, 'GSI = ' + AB.espan(Math.round(GSI)), mx, gy - 26, { size: 10, weight: '700', color: AB.PAL.blood });
  AB.text(ctx, 'Índice GSI', gx + gw / 2, gy + 34, { size: 8, weight: '700', color: AB.PAL.ink2 });

  if (out) out('bx_out', 'v_f = ' + AB.fmt(vf, 1) + ' m/s · G = ' + AB.fmt(G, 0) + ' g · GSI = ' + AB.espan(Math.round(GSI)));
}

/* ── S18 · Vuelo, arrastre y efecto Magnus ── */
export function flightSim(v0: number, thDeg: number, mag: boolean): { x: number; maxY: number; pts: [number, number][] } {
  const m = 0.145, r = 0.037, A = Math.PI * r * r, rho = 1.2, CD = 0.45;
  const k = (0.5 * CD * A * rho) / m, km = 0.008;
  const thR = (thDeg * Math.PI) / 180;
  let x = 0, y = 0, vx = v0 * Math.cos(thR), vy = v0 * Math.sin(thR);
  const dt = 0.004, pts: [number, number][] = [];
  let maxY = 0;
  for (let i = 0; i < 4000; i++) {
    const v = Math.hypot(vx, vy);
    const fd = k * v;
    let ax = -fd * vx, ay = -9.8 - fd * vy;
    if (mag && v > 0.01) {
      const l = km * v * v, iq = 1 / v;
      ax += -l * vy * iq;
      ay += l * vx * iq;
    }
    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    if (y > maxY) maxY = y;
    if (i % 8 === 0) pts.push([x, y]);
    if (y < 0 && vy < 0) break;
  }
  return { x, maxY, pts };
}

export function drawFlight(p: SimParams, flags: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-flight');
  if (!c) return;
  const { ctx, w, h } = c;
  const v0 = p.fl_v || 18, th = p.fl_theta || 40;
  const air = flags.air, mag = flags.mag;
  const thR = (th * Math.PI) / 180;
  const Rvac = (v0 * v0 * Math.sin(2 * thR)) / 9.8;
  const Hvac = (v0 * v0 * Math.sin(thR) * Math.sin(thR)) / (2 * 9.8);
  let fl: { x: number; maxY: number; pts: [number, number][] } | null = null;
  if (air) fl = flightSim(v0, th, mag);
  const Rmax = Math.max(Rvac, fl ? fl.x : 0, 1);
  const Hmax = Math.max(Hvac, fl ? fl.maxY : 0, 0.5);
  const x0 = w * 0.1, y0 = h * 0.86, sx = (w * 0.8) / Rmax, sy = (h * 0.7) / Hmax;
  const X = (xx: number) => x0 + xx * sx, Y = (yy: number) => y0 - yy * sy;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(w * 0.94, y0);
  ctx.stroke();

  const T = (2 * v0 * Math.sin(thR)) / 9.8;
  ctx.strokeStyle = AB.PAL.tealLight;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  for (let i = 0; i <= 64; i++) {
    const t = (T * i) / 64, xx = v0 * Math.cos(thR) * t, yy = v0 * Math.sin(thR) * t - 4.9 * t * t;
    if (yy < 0) break;
    i ? ctx.lineTo(X(xx), Y(yy)) : ctx.moveTo(X(xx), Y(yy));
  }
  ctx.stroke();
  ctx.setLineDash([]);

  if (fl) {
    ctx.strokeStyle = AB.PAL.blood;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    fl.pts.forEach(([xx, yy], i) => {
      i ? ctx.lineTo(X(xx), Y(yy)) : ctx.moveTo(X(xx), Y(yy));
    });
    ctx.stroke();
    ctx.strokeStyle = AB.PAL.blood;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X(fl.x), y0);
    ctx.lineTo(X(fl.x), y0 + 8);
    ctx.stroke();
    AB.text(ctx, AB.fmt(fl.x, 0) + ' m', X(fl.x), y0 + 22, { size: 9, weight: '700', color: AB.PAL.blood });
  }

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(X(Rvac), y0);
  ctx.lineTo(X(Rvac), y0 + 8);
  ctx.stroke();
  AB.text(ctx, 'D₀ ' + AB.fmt(Rvac, 0) + ' m', X(Rvac), y0 + 22, { size: 9, weight: '700', color: AB.PAL.teal });

  const ar = Math.min(w * 0.12, h * 0.14);
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + ar * Math.cos(thR), y0 - ar * Math.sin(thR));
  ctx.stroke();
  const axv = x0 + ar * Math.cos(thR), ayv = y0 - ar * Math.sin(thR), a2 = ar * 0.22;
  ctx.fillStyle = AB.PAL.teal;
  ctx.beginPath();
  ctx.moveTo(axv, ayv);
  ctx.lineTo(axv - a2 * Math.cos(thR - Math.PI / 6), ayv + a2 * Math.sin(thR - Math.PI / 6));
  ctx.lineTo(axv - a2 * Math.cos(thR + Math.PI / 6), ayv + a2 * Math.sin(thR + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  AB.text(ctx, th + '°', x0 + ar * Math.cos(thR) * 0.5, y0 - ar * Math.sin(thR) * 0.5 - 6, { size: 9, color: AB.PAL.teal });

  let opt = 45;
  if (air) {
    let best = 0;
    for (let a = 10; a <= 70; a += 1) {
      const r = flightSim(v0, a, false).x;
      if (r > best) {
        best = r;
        opt = a;
      }
    }
  }
  AB.text(ctx, 'θ óptimo (aire) ≈ ' + opt + '°', w * 0.1, h * 0.08, { size: 9, weight: '700', color: AB.PAL.amber, align: 'left' });

  const D = air ? (fl ? fl.x : Rvac) : Rvac;
  if (out) out('fl_out', air ? 'D = ' + AB.fmt(D, 0) + ' m · D₀ = ' + AB.fmt(Rvac, 0) + ' m' : 'D = ' + AB.fmt(Rvac, 0) + ' m');
}

/* ── Orquestador global de redibujado ── */
export function redrawSlide(slideIndex: number, clock: number, params: SimParams, flags: SimFlags, out?: OutFn): void {
  switch (slideIndex) {
    case 1:
      drawStab(params, flags, out);
      break;
    case 2:
      drawPresion(params, flags, out);
      break;
    case 3:
      drawGait(params, flags, out);
      break;
    case 4:
      drawFriccion(params, flags, out);
      break;
    case 5:
      drawPendulo(params, clock, flags, out);
      break;
    case 6:
      drawEnergy(params, flags, out);
      break;
    case 7:
      drawPogo(params, flags, out);
      break;
    case 8:
      drawSprint(params, flags, out);
      break;
    case 9:
      drawJump(params, flags, out);
      break;
    case 10:
      drawVault(params, flags, out);
      break;
    case 11:
      drawThrow(params, flags, out);
      break;
    case 12:
      drawPhases(params, flags, out);
      break;
    case 13:
      drawPower(params, clock, flags, out);
      break;
    case 14:
      drawGolf(params, flags, out);
      break;
    case 15:
      drawBat(params, flags, out);
      break;
    case 16:
      drawCollision(params, flags, out);
      break;
    case 17:
      drawBoxing(params, flags, out);
      break;
    case 18:
      drawFlight(params, flags, out);
      break;
    default:
      break;
  }
}
