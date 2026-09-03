// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 2 · Simulaciones (TypeScript puro, sin DOM)
//  Port de las 21 funciones draw* del capitulo2.html a React.
//  Cada función recibe (dc, params, flags, out) en lugar de leer el DOM.
//  La matemática es idéntica a la del HTML original (verificada contra el libro).
// ═══════════════════════════════════════════════════════════════════════════

import * as AB from './ab';
const { PAL, fmt, arrow, dashed, bone, joint, muscle, tendon, limbSkin, hand, foot, triangle, c2Scene, c2Chip, c2GlowArrow, chip } = AB;

export interface SimParams {
  tq_r: number; tq_f: number; tq_theta: number;
  lev_clase: number; lev_w: number; lev_dw: number;
  amp_dy: number;
  fa_w: number; fa_model: number;
  fa2_theta: number; fa2_w: number;
  hip_m: number; cane_nc: number;
  back_theta: number;
  sh_w: number; kn_beta: number;
  an_beta: number;
  tch_f: number;
  th_t: number;
  cv_f_val: number; cv_f_from: string; cv_f_to: string;
  cv_p_val: number; cv_p_from: string; cv_p_to: string;
}

export interface SimFlags {
  tfStep: number;
  segHover: string | null;
  hipBreakdown: boolean;
  discPosture: string;
  jawMode: string;
  faMuscles: number;
  caneOn: boolean;
  backLoad: boolean;
}

export const DEFAULT_PARAMS: SimParams = {
  tq_r: 70, tq_f: 60, tq_theta: 60,
  lev_clase: 3, lev_w: 100, lev_dw: 70,
  amp_dy: 24,
  fa_w: 100, fa_model: 2,
  fa2_theta: 90, fa2_w: 100,
  hip_m: 90, cane_nc: 17,
  back_theta: 30,
  sh_w: 50, kn_beta: 45,
  an_beta: 60,
  tch_f: 30,
  th_t: 30,
  cv_f_val: 100, cv_f_from: 'N', cv_f_to: 'lb',
  cv_p_val: 760, cv_p_from: 'mmHg', cv_p_to: 'Pa',
};

export const DEFAULT_FLAGS: SimFlags = {
  tfStep: 1, segHover: null, hipBreakdown: false,
  discPosture: 'upright', jawMode: 'incisor',
  faMuscles: 3, caneOn: true, backLoad: false,
};

export const TOTAL = 21;
export const MODULES = [
  { id: 0, name: 'Inicio', slides: [0], ico: '🏠' },
  { id: 1, name: 'A · Fuerzas · Torques', slides: [1, 2], ico: '🧲' },
  { id: 2, name: 'B · Palancas · Antebrazo', slides: [3, 4, 5, 6], ico: '⚖️' },
  { id: 3, name: 'C · Cadera y pierna', slides: [7, 8, 9, 10], ico: '🦴' },
  { id: 4, name: 'D · La espalda', slides: [11, 12], ico: '🏋️' },
  { id: 5, name: 'E · Articulaciones · Mandíbula', slides: [13, 14], ico: '🦷' },
  { id: 6, name: 'F · Métodos', slides: [15, 16], ico: '📐' },
  { id: 7, name: 'G · El tacto', slides: [17, 18], ico: '✋' },
  { id: 8, name: 'H · Unidades · Resumen', slides: [19, 20], ico: '✓' },
];

export type OutFn = (id: string, text: string) => void;
export type Draw = (dc: AB.DrawCtx, p: SimParams, f: SimFlags, out: OutFn) => void;

// ═══════════════════════════════════════════════════════════════════════════
//  S2 · TORQUE
// ═══════════════════════════════════════════════════════════════════════════
export const drawTorque: Draw = (dc, p, _f, out) => {
  const { ctx, w, h, t } = dc;
  const rPx = p.tq_r, F = p.tq_f, thetaDeg = p.tq_theta;
  const rM = rPx / 100;
  const th = thetaDeg * Math.PI / 180;
  const sign = Math.sin(th) >= 0 ? 1 : -1;

  const ejeX = w * 0.34, ejeY = h * 0.60;
  const Fnom = (F / 100) * (h * 0.40);
  const span = rPx + Fnom;
  const z = Math.max(0.55, Math.min((w * 0.74) / span, (h * 0.58) / span));
  const rDraw = rPx * z, Fdraw = Fnom * z;

  ctx.save();
  ctx.strokeStyle = 'rgba(35,44,54,0.045)'; ctx.lineWidth = 1;
  for (let x = (ejeX % 26); x < w; x += 26) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = (ejeY % 26); y < h; y += 26) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.restore();
  AB.dashed(ctx, 8, ejeY, w - 8, ejeY, { color: 'rgba(107,120,133,0.5)', width: 1 });

  const Ax = ejeX + rDraw, Ay = ejeY;
  const Fx = Ax + Fdraw * Math.cos(th), Fy = Ay - Fdraw * Math.sin(th);
  const u = [Math.cos(th), -Math.sin(th)];
  const dot = (ejeX - Ax) * u[0] + (ejeY - Ay) * u[1];
  const footX = Ax + dot * u[0], footY = Ay + dot * u[1];
  const tau = rM * F * Math.sin(th);

  ctx.save();
  ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
  if (Fx > Ax + 1) {
    ctx.strokeStyle = 'rgba(138,150,160,0.85)';
    ctx.beginPath(); ctx.moveTo(Ax, Ay); ctx.lineTo(Fx, Ay); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(13,110,100,0.9)';
  ctx.beginPath(); ctx.moveTo(Fx, Ay); ctx.lineTo(Fx, Fy); ctx.stroke();
  ctx.restore();

  (function () {
    const fAng = Math.atan2(-Math.sin(th), Math.cos(th));
    if (Math.abs(fAng) < 2 * Math.PI / 180) return;
    if (Math.abs(fAng) > 178 * Math.PI / 180) return;
    const Ra = Math.max(30, 34 * z);
    const a0 = 0;
    const ccw = fAng < 0;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(Ax, Ay);
    ctx.arc(Ax, Ay, Ra, a0, fAng, ccw);
    ctx.closePath();
    ctx.fillStyle = 'rgba(154,91,0,0.12)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(Ax, Ay, Ra, a0, fAng, ccw);
    ctx.strokeStyle = PAL.amber; ctx.lineWidth = 2; ctx.stroke();
    const mid = fAng / 2;
    const lx = Ax + Math.cos(mid) * (Ra + 15), ly = Ay + Math.sin(mid) * (Ra + 15);
    AB.text(ctx, 'θ', lx, ly, { color: PAL.amber, size: 16, weight: '700' });
    ctx.restore();
  })();
  ctx.save(); ctx.translate(ejeX, ejeY); ctx.rotate(t * sign * 1.1);
  ctx.beginPath(); ctx.arc(0, 0, 12 * z, 0, Math.PI * 2); ctx.fillStyle = '#fbf8f0'; ctx.fill();
  ctx.lineWidth = 2.4; ctx.strokeStyle = PAL.amber; ctx.stroke();
  ctx.strokeStyle = PAL.amber; ctx.lineWidth = 1.6;
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 4 * z, Math.sin(a) * 4 * z); ctx.lineTo(Math.cos(a) * 8.5 * z, Math.sin(a) * 8.5 * z); ctx.stroke(); }
  ctx.restore();
  AB.text(ctx, 'eje', ejeX, ejeY + 26 * z + 12, { color: PAL.ink3, size: 14 });

  AB.bone(ctx, ejeX, ejeY, Ax, Ay, { width: Math.max(6, 9 * z), joint: true, jointR: 6 * z });
  ctx.beginPath(); ctx.arc(Ax, Ay, 6 * z, 0, Math.PI * 2); ctx.fillStyle = PAL.amber; ctx.fill();
  ctx.lineWidth = 1.8; ctx.strokeStyle = '#7c4900'; ctx.stroke();

  const Fpulse = Fdraw * (1 + 0.045 * Math.sin(t * 3));
  const fex = Ax + Fpulse * Math.cos(th), fey = Ay - Fpulse * Math.sin(th);
  ctx.save(); ctx.shadowColor = PAL.teal; ctx.shadowBlur = 9 + 5 * Math.sin(t * 4);
  AB.arrow(ctx, Ax, Ay, fex, fey, { color: PAL.teal, width: Math.max(3.4, 4 * z) });
  ctx.restore();

  const Rc = Math.max(30, 32 * z);
  const sweep = 135 * Math.PI / 180, top = -Math.PI / 2;
  const aL = top - sweep / 2, aR = top + sweep / 2;
  const ccw = tau >= 0;
  const aStart = ccw ? aR : aL;
  const aEnd = ccw ? aL : aR;
  ctx.strokeStyle = tau >= 0 ? PAL.teal : PAL.blood; ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.arc(ejeX, ejeY, Rc, aStart, aEnd, ccw); ctx.stroke();
  const aTip = ccw ? aEnd - 0.04 : aEnd + 0.04;
  const tang = Math.atan2(Math.sin(aTip) - Math.sin(aEnd), Math.cos(aTip) - Math.cos(aEnd));
  ctx.save();
  ctx.translate(ejeX + Math.cos(aEnd) * Rc, ejeY + Math.sin(aEnd) * Rc); ctx.rotate(tang);
  ctx.fillStyle = tau >= 0 ? PAL.teal : PAL.blood; ctx.beginPath();
  ctx.moveTo(9, 0); ctx.lineTo(-4, -5.5); ctx.lineTo(-4, 5.5); ctx.closePath(); ctx.fill();
  ctx.restore();

  chip(dc, 'F = ' + fmt(F, 0) + ' N', fex + Math.cos(th) * 16, fey - Math.sin(th) * 16, PAL.teal, { size: 16, weight: '700' });
  if (Fx > Ax + 1) chip(dc, 'F·cosθ', (Ax + Fx) / 2, Ay + 16, '#5d6b76', { size: 13, weight: '600' });
  chip(dc, 'F·sinθ', Fx + 22, (Ay + Fy) / 2, PAL.teal, { size: 14 });

  const nF = 5, Rt = Rc;
  for (let k = 0; k < nF; k++) {
    let frac = (t * 0.35 * sign + k / nF); frac = ((frac % 1) + 1) % 1;
    const ang = 0 + (-th - 0) * frac;
    const dxx = ejeX + Math.cos(ang) * Rt, dyy = ejeY + Math.sin(ang) * Rt;
    ctx.beginPath(); ctx.arc(dxx, dyy, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = tau >= 0 ? PAL.teal : PAL.blood; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(frac * Math.PI);
    ctx.fill(); ctx.globalAlpha = 1;
  }

  out('tq_out', 'τ = ' + (tau >= 0 ? '+' : '') + fmt(tau, 1) + ' N·m');
};

// ═══════════════════════════════════════════════════════════════════════════
//  S3 · PALANCAS
// ═══════════════════════════════════════════════════════════════════════════
export const drawLevers: Draw = (dc, p, _f, out) => {
  const { ctx, w, h } = dc;
  const cls = Math.round(p.lev_clase);
  const W = p.lev_w, d = p.lev_dw;
  let dM, dW;
  if (cls === 1) { dW = d; dM = d * 0.6; }
  else if (cls === 2) { dW = d * 0.5; dM = d; }
  else { dW = d; dM = d * 0.4; }
  const M = W * dW / dM;
  const fx = w * 0.22, fy = h * 0.52;
  const xmin = fx - (cls === 1 ? dM : 0), xmax = fx + dW;
  AB.bone(ctx, xmin, fy, xmax, fy, { width: 11, joint: false });
  AB.triangle(ctx, fx, fy, 13, { color: '#9a5b00' });
  AB.text(ctx, 'fulcro', fx, fy + 30, { size: 10, color: '#9a5b00' });
  const s = 0.75;
  const Wpx = Math.min(110, 30 + W * s);
  const Mpx = Math.min(h * 0.34, 30 + M * s);
  const mpx = cls === 1 ? fx - dM : fx + dM;
  AB.arrow(ctx, fx + dW, fy + 6, fx + dW, fy + 6 + Wpx, { color: '#9a5b00', width: 2.4 });
  AB.text(ctx, 'W = ' + fmt(W, 0) + ' N', fx + dW, fy + 6 + Wpx + 14, { size: 10, color: '#9a5b00', weight: '700' });
  AB.arrow(ctx, mpx, fy - 6, mpx, fy - 6 - Mpx, { color: '#0d6e64', width: 2.4 });
  AB.text(ctx, 'M = ' + fmt(M, 0) + ' N', mpx, fy - 6 - Mpx - 10, { size: 10, color: '#0d6e64', weight: '700' });
  if (cls === 1) { AB.text(ctx, 'd_W', fx + dW / 2, fy + 24, { size: 9, color: '#6b7885' }); AB.text(ctx, 'd_M', fx - dM / 2, fy - 8, { size: 9, color: '#6b7885' }); }
  else if (cls === 2) { AB.text(ctx, 'd_M', fx + dM / 2, fy + 24, { size: 9, color: '#6b7885' }); AB.text(ctx, 'd_W', fx + dW / 2, fy - 8, { size: 9, color: '#6b7885' }); }
  else { AB.text(ctx, 'd_M', fx + dM / 2, fy - 8, { size: 9, color: '#6b7885' }); AB.text(ctx, 'd_W', fx + dW / 2, fy + 24, { size: 9, color: '#6b7885' }); }
  const ma = dM / dW;
  const cl = [, '1ª clase', '2ª clase', '3ª clase'];
  AB.text(ctx, cl[cls] || '', w * 0.76, h * 0.14, { size: 13, color: '#0d6e64', weight: '700' });
  out('lev_out', 'M = ' + fmt(M, 0) + ' N · MA = ' + fmt(ma, 2));
};

// ═══════════════════════════════════════════════════════════════════════════
//  S4 · AMPLIFICACIÓN DE DISTANCIA
// ═══════════════════════════════════════════════════════════════════════════
export const drawAmp: Draw = (dc, p, _f, out) => {
  const { ctx, w, h } = dc;
  const dy = p.amp_dy;
  const dM = 40, dW = 360;
  const alpha = Math.min(dy / dM, 1.3);
  const ex = 90, ey = h * 0.56, sy = ey - 150, L = 280;
  const hx = ex + L * Math.cos(alpha), hy = ey + L * Math.sin(alpha);
  AB.bone(ctx, ex, ey, ex, sy, { width: 12, joint: true, jointR: 7 });
  AB.bone(ctx, ex, ey, hx, hy, { width: 10, jointEnd: true, jointR: 7 });
  AB.hand(ctx, hx, hy, 10);
  const mx = ex + dM * Math.cos(alpha), my = ey + dM * Math.sin(alpha);
  const ox = ex - 10, oy = ey - 110 + (dy * 1.1);
  AB.muscle(ctx, ox, oy, mx, my, { w0: 11, w1: 5, bow: 6 });
  AB.text(ctx, 'bíceps', ox - 6, oy + 20, { size: 10, color: '#a92a1e', align: 'right' });
  AB.text(ctx, 'd_M = 4 cm', mx - 6, my - 12, { size: 10, color: '#6b7885', align: 'right' });
  AB.text(ctx, 'd_W = 36 cm', hx - 6, hy + 14, { size: 10, color: '#6b7885', align: 'right' });
  const drop = (dW / dM) * dy;
  out('amp_out', 'mano ↓ ' + fmt(drop, 0) + ' mm');
};

// ═══════════════════════════════════════════════════════════════════════════
//  S5 · ANTEBRAZO CASOS 1-2
// ═══════════════════════════════════════════════════════════════════════════
export const drawForearm: Draw = (dc, p, _f, out) => {
  const { ctx, w, h, t } = dc;
  const W = p.fa_w;
  const model = Math.round(p.fa_model);
  const s = 5;
  const dM = 4 * s, dF = 13 * s, dW = 36 * s;
  const ex = w * 0.32, ey = h * 0.62, sy = ey - 120;
  const hx = ex + dW, hy = ey;
  const breathe = 1 + 0.07 * Math.sin(t * 2.0);
  c2Scene(dc, w, h, ey + 44);
  AB.bone(ctx, ex, ey, ex, sy, { width: 13, joint: true, jointR: 8 });
  AB.bone(ctx, ex, ey, hx, hy, { width: 10, jointEnd: true, jointR: 8 });
  AB.hand(ctx, hx, hy, 11);
  ctx.beginPath(); ctx.arc(hx, hy - 36, 15, 0, Math.PI * 2); ctx.fillStyle = '#9a5b00'; ctx.fill();
  ctx.strokeStyle = '#7c4900'; ctx.lineWidth = 1.5; ctx.stroke();
  c2Chip(dc, 'W_W = ' + fmt(W, 0) + ' N', hx, hy - 58, '#9a5b00', { size: 11, weight: '700' });
  const mx = ex + dM, my = ey, ox = ex - 8, oy = ey - 95;
  AB.muscle(ctx, ox, oy, mx, my, { w0: 12 * breathe, w1: 5, bow: 8 });
  c2Chip(dc, 'bíceps', ox - 6, oy + 20, '#a92a1e', { size: 10, align: 'right' });
  const M = 9 * W + (model === 2 ? 3.25 * 15 : 0);
  const Mpx = Math.min(h * 0.44, 30 + M * 0.35) * (1 + 0.04 * Math.sin(t * 2.0));
  c2GlowArrow(dc, mx, my - 4, mx, my - 4 - Mpx, '#0d6e64', 2.6);
  c2Chip(dc, 'M = ' + fmt(M, 0) + ' N', mx, my - 4 - Mpx - 12, '#0d6e64', { size: 11, weight: '700' });
  if (model === 2) {
    const fx = ex + dF;
    c2GlowArrow(dc, fx, ey - 6, fx, ey - 6 + 46, '#43505c', 2, 1.5);
    c2Chip(dc, 'W_F ≈ 15 N', fx + 14, ey + 52, '#43505c', { size: 10, align: 'left' });
  }
  c2GlowArrow(dc, hx, hy + 10, hx, hy + 40, '#9a5b00', 2.4);
  AB.text(ctx, '4 cm', mx + 4, ey + 16, { size: 10, color: '#6b7885' });
  AB.text(ctx, '13 cm', ex + dF + 4, ey + 16, { size: 10, color: '#6b7885' });
  AB.text(ctx, '36 cm', hx - 16, ey + 16, { size: 10, color: '#6b7885' });
  out('fa_out', 'M = ' + fmt(M, 0) + ' N');
};

// ═══════════════════════════════════════════════════════════════════════════
//  S6 · ANTEBRAZO CASOS 3-4
// ═══════════════════════════════════════════════════════════════════════════
export const drawForearm2: Draw = (dc, p, f, out) => {
  const { ctx, w, h, t } = dc;
  c2Scene(dc, w, h, h - 46);
  const theta = p.fa2_theta, Ww = p.fa2_w;
  const show3 = (f.faMuscles || 3) === 3;
  const s = 4.6, L = 36 * s;
  const th = theta * Math.PI / 180;
  const ex = w * 0.30, ey = h * 0.60;
  const dirX = Math.sin(th), dirY = Math.cos(th);
  const hx = ex + L * dirX, hy = ey + L * dirY;
  AB.bone(ctx, ex, ey, ex, ey - 130, { width: 12, joint: true, jointR: 8 });
  AB.bone(ctx, ex, ey, hx, hy, { width: 9, jointEnd: true, jointR: 7 });
  AB.hand(ctx, hx, hy, 10);
  ctx.beginPath(); ctx.arc(hx, hy + 30, 13, 0, Math.PI * 2); ctx.fillStyle = '#9a5b00'; ctx.fill();
  ctx.strokeStyle = '#7c4900'; ctx.lineWidth = 1.5; ctx.stroke();
  AB.text(ctx, 'W = ' + fmt(Ww, 0) + ' N', hx + 4, hy + 52, { size: 11, color: '#9a5b00', weight: '700' });
  const k = (Ww / 100);
  const M1 = 262 * k, M2 = 399 * k, M3 = 85 * k;
  const muscles = [
    { name: 'bíceps', d: 4.6 * s, M: M1, oy: -96, bow: 10, color: '#c14b4b' },
    { name: 'braquial', d: 3.4 * s, M: M2, oy: -50, bow: 2, color: '#b86a1e' },
    { name: 'braquiorradial', d: 7.5 * s, M: M3, oy: -18, bow: -16, color: '#5d4fa8' },
  ];
  let total = 0;
  muscles.forEach((m, i) => {
    const ix = ex + m.d * dirX, iy = ey + m.d * dirY;
    if (show3 || i === 0) {
      AB.muscle(ctx, ex - 8, ey + m.oy, ix, iy, { w0: 10 * (1 + 0.07 * Math.sin(t * 2 + i)), w1: 4, bow: m.bow, fill: m.color, edge: m.color });
      AB.text(ctx, m.name + ' ' + fmt(m.M, 0) + ' N', ix + 16, iy - 10, { size: 9.5, color: m.color, align: 'left' });
      total += m.M;
    }
  });
  const shown = show3 ? total : (9 * Ww + 3.25 * 15);
  out('fa2_out', show3 ? 'M₁+M₂+M₃ = ' + fmt(total, 0) + ' N' : 'M = ' + fmt(shown, 0) + ' N');
  AB.text(ctx, 'θ = ' + fmt(theta, 0) + '°', ex + L * 0.5 * dirX + 12, ey + L * 0.5 * dirY - 8, { size: 11, color: '#6b7885' });
};

// ═══════════════════════════════════════════════════════════════════════════
//  S7 · CADERA
// ═══════════════════════════════════════════════════════════════════════════
function drawPelvis(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy - 26);
  ctx.quadraticCurveTo(cx - 30, cy + 6, cx - 18, cy + 16);
  ctx.quadraticCurveTo(cx, cy + 22, cx + 18, cy + 16);
  ctx.quadraticCurveTo(cx + 30, cy + 6, cx + 22, cy - 26);
  ctx.quadraticCurveTo(cx + 14, cy - 34, cx, cy - 34);
  ctx.quadraticCurveTo(cx - 14, cy - 34, cx - 22, cy - 26);
  ctx.closePath();
  ctx.fillStyle = '#cfc4ae'; ctx.fill();
  ctx.lineWidth = 1.6; ctx.strokeStyle = '#b6a67f'; ctx.stroke();
}
function drawLegBase(ctx: CanvasRenderingContext2D, cx: number, floorY: number, hipY: number, footShift: number) {
  const kx = cx - 8, ky = floorY - 96;
  const fx2 = cx - 2 + footShift, fy2 = floorY - 6;
  drawPelvis(ctx, cx, hipY, 34);
  AB.bone(ctx, cx, hipY + 4, kx, ky, { width: 13, joint: false });
  AB.bone(ctx, kx, ky, fx2, fy2, { width: 11 });
  AB.foot(ctx, fx2 + 4, floorY, 0, { len: 52, h: 18 });
  AB.joint(ctx, kx, ky, 8);
  AB.joint(ctx, cx, hipY, 8);
  AB.joint(ctx, fx2, floorY - 4, 6);
  const tx = cx + 6, ty = hipY + 30;
  AB.muscle(ctx, cx + 14, hipY - 26, tx, ty, { w0: 9, w1: 4, bow: 4, fill: '#c14b4b', edge: '#a92a1e' });
  AB.text(ctx, 'abductores', cx + 34, hipY - 8, { size: 10, color: '#a92a1e', align: 'left' });
  return { kx, ky, fx2, fy2, tx, ty };
}
export const drawHip: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
  const m = p.hip_m || 90, Wb = m * 9.8;
  const M = 1.57 * Wb, R = 2.37 * Wb, Wleg = 0.16 * Wb;
  const cx = w * 0.46, floorY = h - 40, hipY = floorY - 170;
  c2Scene(dc, w, h, floorY);
  const g = drawLegBase(ctx, cx, floorY, hipY, 0);
  const sM = Math.min(110, M * 0.08), sR = Math.min(120, R * 0.055);
  const ma = (Math.PI - 70 * Math.PI / 180);
  c2GlowArrow(dc, g.tx, g.ty, g.tx + Math.cos(ma) * sM, g.ty + Math.sin(ma) * sM, '#0d6e64', 2.5);
  c2Chip(dc, 'M = ' + fmt(M, 0) + ' N', g.tx + Math.cos(ma) * (sM + 12), g.ty + Math.sin(ma) * (sM + 12), '#0d6e64', { size: 10, weight: '700' });
  c2GlowArrow(dc, cx, hipY - 96, cx, hipY - 58, '#43505c', 2.5);
  c2Chip(dc, 'W_b = ' + fmt(Wb, 0) + ' N', cx, hipY - 112, '#43505c', { size: 10, weight: '700' });
  c2GlowArrow(dc, g.kx, g.ky - 26, g.kx, g.ky - 2, '#6b7885', 2);
  c2Chip(dc, 'W_pierna', g.kx + 16, g.ky - 14, '#6b7885', { size: 9, align: 'left' });
  c2GlowArrow(dc, cx, floorY + 10, cx, floorY + 40, '#2d7d4f', 2.5);
  c2Chip(dc, 'N = W_b', cx - 6, floorY + 56, '#2d7d4f', { size: 10, weight: '700', align: 'right' });
  const phi = 13 * Math.PI / 180;
  c2GlowArrow(dc, cx, hipY + 2, cx - Math.sin(phi) * sR, hipY + 2 + Math.cos(phi) * sR, '#a92a1e', 2.5);
  c2Chip(dc, 'R = ' + fmt(R, 0) + ' N', cx - Math.sin(phi) * sR - 8, hipY + 2 + Math.cos(phi) * sR + 12, '#a92a1e', { size: 10, weight: '700', align: 'right' });
  if (f.hipBreakdown) {
    ctx.strokeStyle = '#a92a1e'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, hipY + 2, 26, 0, Math.PI * 0.5 + phi); ctx.stroke();
    AB.text(ctx, 'φ = 13°', cx - 36, hipY + 2 + 44, { size: 10, color: '#a92a1e' });
  }
  out('hip_out', 'M = ' + fmt(M, 0) + ' N');
};

// ═══════════════════════════════════════════════════════════════════════════
//  S8 · BASTÓN
// ═══════════════════════════════════════════════════════════════════════════
export const drawHipCane: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
  const m = p.hip_m || 90, Wb = m * 9.8;
  const nc = p.cane_nc / 100;
  let Mc, Rc;
  if (nc >= 16.67) { Mc = 0.61; Rc = 1.26; }
  else { Mc = 1.57 - (1.57 - 0.61) * (nc / 16.67); Rc = 2.37 - (2.37 - 1.26) * (nc / 16.67); }
  const M = Mc * Wb, R = Rc * Wb;
  const s = 3.5;
  const Lcm = nc > 0 ? nc / (1 - nc) * 30.5 : 0;
  const Lpx = Lcm * s;
  const cx = w * 0.5, floorY = h - 40, hipY = floorY - 170;
  const g = drawLegBase(ctx, cx, floorY, hipY, Lpx);
  if (f.caneOn) {
    const caneX = cx - 30.5 * s;
    ctx.strokeStyle = '#9a5b00'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(caneX, floorY); ctx.lineTo(caneX, hipY - 60); ctx.stroke();
    ctx.beginPath(); ctx.arc(caneX, hipY - 60, 12, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
    AB.arrow(ctx, caneX, floorY + 10, caneX, floorY + 36, { color: '#b86a1e', width: 2 });
    AB.text(ctx, 'N_c ≈ ' + fmt(nc * Wb, 0) + ' N', caneX, floorY + 54, { size: 10, color: '#b86a1e', weight: '700' });
    AB.muscle(ctx, cx - 6, hipY - 22, caneX, hipY - 56, { w0: 7, w1: 4, bow: 14, fill: '#e9c49f', edge: '#d9a77c' });
  }
  const sM = Math.min(110, M * 0.09), sR = Math.min(120, R * 0.06);
  const ma = (Math.PI - 70 * Math.PI / 180);
  AB.arrow(ctx, g.tx, g.ty, g.tx + Math.cos(ma) * sM, g.ty + Math.sin(ma) * sM, { color: '#0d6e64', width: 2.5 });
  AB.text(ctx, 'M = ' + fmt(M, 0) + ' N', g.tx + Math.cos(ma) * (sM + 12), g.ty + Math.sin(ma) * (sM + 12), { size: 10, color: '#0d6e64', weight: '700' });
  const Nf = (1 - nc) * Wb;
  AB.arrow(ctx, g.fx2, floorY + 10, g.fx2, floorY + 40, { color: '#2d7d4f', width: 2.4 });
  AB.text(ctx, 'N_f = ' + fmt(Nf, 0) + ' N', g.fx2, floorY + 56, { size: 10, color: '#2d7d4f', weight: '700' });
  const phi = 13 * Math.PI / 180;
  AB.arrow(ctx, cx, hipY + 2, cx - Math.sin(phi) * sR, hipY + 2 + Math.cos(phi) * sR, { color: '#a92a1e', width: 2.4 });
  AB.text(ctx, 'R = ' + fmt(R, 0) + ' N', cx - Math.sin(phi) * sR - 8, hipY + 2 + Math.cos(phi) * sR + 12, { size: 10, color: '#a92a1e', weight: '700', align: 'right' });
  out('cane_out', 'M = ' + fmt(M, 0) + ' N');
};

// ═══════════════════════════════════════════════════════════════════════════
//  S9 · ESPALDA
// ═══════════════════════════════════════════════════════════════════════════
function drawSpine(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, N: number) {
  const dx = (x1 - x0) / N, dy = (y1 - y0) / N;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const px = -Math.sin(ang), py = Math.cos(ang);
  ctx.fillStyle = '#cfc4ae'; ctx.strokeStyle = '#b6a67f'; ctx.lineWidth = 1.4;
  for (let i = 0; i < N; i++) {
    const cx = x0 + dx * (i + 0.5), cy = y0 + dy * (i + 0.5);
    ctx.beginPath(); ctx.ellipse(cx + px * 8, cy + py * 8, 12, 7, ang, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
}
export const drawBack: Draw = (dc, p, f, out) => {
  const { ctx, w, h, t } = dc;
  const th = p.back_theta, load = f.backLoad;
  const m = p.hip_m || 90, Wb = m * 9.8;
  const row = load
    ? [[30, 3.74, 4.07], [60, 2.16, 2.81], [80, 0.75, 1.53], [90, 0, 0.80]]
    : [[30, 2.50, 2.74], [60, 1.44, 1.93], [80, 0.50, 1.08], [90, 0, 0.60]];
  function interp(x: number): [number, number] {
    for (let i = 0; i < row.length - 1; i++) {
      const a = row[i], b = row[i + 1];
      if (x >= a[0] && x <= b[0]) { const tt = (x - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * tt, a[2] + (b[2] - a[2]) * tt]; }
    }
    return [row[row.length - 1][1], row[row.length - 1][2]];
  }
  const [Mc, Rc] = interp(th);
  const M = Mc * Wb, R = Rc * Wb;
  const px2 = w * 0.30, py2 = h - 46;
  c2Scene(dc, w, h, py2 + 18);
  const L = Math.min(180, h * 0.6);
  const ang = th * Math.PI / 180;
  const sx = px2 + L * Math.cos(ang), sy = py2 - L * Math.sin(ang);
  drawSpine(ctx, px2, py2, sx, sy, 5);
  AB.joint(ctx, px2, py2, 7);
  const nx = -Math.sin(ang), ny = -Math.cos(ang);
  const f2x = px2 + (2 / 3) * L * Math.cos(ang), f2y = py2 - (2 / 3) * L * Math.sin(ang);
  const mx2 = f2x + nx * 7, my2 = f2y + ny * 7;
  AB.muscle(ctx, px2 + nx * 7, py2 + ny * 7, mx2, my2, { w0: 8 * (1 + 0.06 * Math.sin(t * 1.8)), w1: 4, bow: 0, fill: '#c14b4b', edge: '#a92a1e' });
  const sM = Math.min(120, M * 0.05);
  const ea = Math.atan2((py2 + ny * 7) - my2, (px2 + nx * 7) - mx2);
  c2GlowArrow(dc, mx2, my2, mx2 + Math.cos(ea) * sM, my2 + Math.sin(ea) * sM, '#0d6e64', 2.4);
  c2Chip(dc, 'M = ' + fmt(M, 0) + ' N', mx2 + Math.cos(ea) * (sM + 12), my2 + Math.sin(ea) * (sM + 12), '#0d6e64', { size: 10, weight: '700' });
  const w1x = px2 + 0.5 * L * Math.cos(ang), w1y = py2 - 0.5 * L * Math.sin(ang);
  const w2x = sx, w2y = sy;
  c2GlowArrow(dc, w1x, w1y + 8, w1x, w1y + 34, '#43505c', 2.2);
  c2Chip(dc, 'W₁ = 0,4W_b', w1x, w1y + 48, '#43505c', { size: 10 });
  c2GlowArrow(dc, w2x, w2y + 8, w2x, w2y + 34, '#43505c', 2.2);
  c2Chip(dc, 'W₂ = 0,2W_b', w2x, w2y + 48, '#43505c', { size: 10 });
  if (load) {
    ctx.fillStyle = '#9a5b00'; ctx.fillRect(w2x - 9, w2y + 42, 20, 15); ctx.strokeStyle = '#7c4900'; ctx.strokeRect(w2x - 9, w2y + 42, 20, 15);
    c2Chip(dc, '+0,2W_b', w2x, w2y + 70, '#9a5b00', { size: 10, weight: '700' });
  }
  const sR = Math.min(130, R * 0.05);
  const rEx = px2 - Math.cos(ang) * sR, rEy = py2 + Math.sin(ang) * sR;
  c2GlowArrow(dc, px2, py2, rEx, rEy, '#a92a1e', 2.4);
  c2Chip(dc, 'R = ' + fmt(R, 0) + ' N', px2 + Math.max(40, rEx - px2) * 0 + 58, py2 - 26, '#a92a1e', { size: 10, weight: '700', align: 'left', fill: 'rgba(251,248,240,1)' });
  AB.dashed(ctx, px2 + 12, py2 - 8, px2 + 50, py2 - 22, { color: '#a92a1e', width: 1 });
  AB.text(ctx, 'θ = ' + fmt(th, 0) + '°', px2 + L * 0.55 * Math.cos(ang) + 6, py2 - L * 0.55 * Math.sin(ang) - 4, { size: 11, color: '#6b7885' });
  out('back_out', 'M = ' + fmt(M, 0) + ' N');
};

// ═══════════════════════════════════════════════════════════════════════════
//  S10 · DISCO
// ═══════════════════════════════════════════════════════════════════════════
export const drawDisc: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
  const posture = f.discPosture || 'upright';
  const cx = w / 2, baseY = h - 30;
  const tilt = posture === 'lift' ? 0.5 : (posture === 'bend' ? 0.28 : 0);
  const shift = posture === 'lift' ? 8 : (posture === 'bend' ? 4 : 0);
  const compress = posture === 'lift' ? 0.5 : (posture === 'bend' ? 0.2 : 0);
  const bh = 22, dh0 = 7;
  let y = baseY;
  const N = 4;
  for (let i = 0; i < N; i++) {
    ctx.save(); ctx.translate(cx + shift * (N - i), y); ctx.rotate(-tilt);
    ctx.fillStyle = '#cfc4ae'; ctx.strokeStyle = '#b6a67f'; ctx.lineWidth = 1.4;
    ctx.fillRect(-16, -bh, 32, bh); ctx.strokeRect(-16, -bh, 32, bh);
    ctx.restore();
    y -= bh;
    if (i < N - 1) {
      const dh = dh0 * (1 - compress * 0.6);
      const wd = 32 + compress * 20;
      ctx.fillStyle = posture === 'lift' ? '#a92a1e' : (posture === 'bend' ? '#b86a1e' : '#0d6e64');
      ctx.save(); ctx.translate(cx + shift * (N - i), y); ctx.rotate(-tilt);
      if (ctx.roundRect) ctx.roundRect(-wd / 2, -dh, wd, dh, 4); else ctx.rect(-wd / 2, -dh, wd, dh);
      ctx.fill(); ctx.restore();
      if (posture === 'lift') {
        ctx.strokeStyle = '#e8d8c8'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx + 22, y); ctx.quadraticCurveTo(cx + 36, y + 6, cx + 46, y + 22); ctx.stroke();
        ctx.fillStyle = '#a92a1e'; ctx.beginPath(); ctx.arc(cx + 46, y + 22, 3, 0, Math.PI * 2); ctx.fill();
      }
      y -= dh;
    }
  }
  out('disc_out', posture === 'upright' ? 'Disco sano' : (posture === 'bend' ? 'Disco comprimido ~20%' : 'Disco herniado · nervio'));
};

// ═══════════════════════════════════════════════════════════════════════════
//  S11 · HOMBRO
// ═══════════════════════════════════════════════════════════════════════════
export const drawShoulder: Draw = (dc, p, _f, out) => {
  const { ctx, w, h } = dc;
  c2Scene(dc, w, h, h - 30);
  const Ww = p.sh_w, Warm = 20;
  const Fy = Ww + Warm, Fx = 4 * Fy, Mf = Math.sqrt(Fx * Fx + Fy * Fy);
  const sx = w * 0.78, sy = h * 0.42, L = Math.min(150, w * 0.45);
  const hx = sx - L, hy = sy;
  AB.bone(ctx, sx, sy, hx, hy, { width: 12, joint: true, jointR: 8 });
  AB.hand(ctx, hx, hy, 9);
  ctx.beginPath(); ctx.arc(hx, hy + 26, 11, 0, Math.PI * 2); ctx.fillStyle = '#9a5b00'; ctx.fill(); ctx.strokeStyle = '#7c4900'; ctx.stroke();
  AB.arrow(ctx, hx, hy + 34, hx, hy + 52, { color: '#9a5b00', width: 2.2 });
  AB.text(ctx, 'W = ' + fmt(Ww, 0) + ' N', hx, hy + 66, { size: 10, color: '#9a5b00', weight: '700' });
  const dmx = sx - L * 0.5, dmy = sy;
  const axx = sx, ayy = sy - 42;
  AB.muscle(ctx, axx, ayy, dmx, dmy, { w0: 9, w1: 4, bow: 6, fill: '#c14b4b', edge: '#a92a1e' });
  AB.text(ctx, 'deltoides', axx + 6, ayy - 12, { size: 9.5, color: '#a92a1e' });
  const sc = Math.min(130, Mf * 0.28);
  const da = 14 * Math.PI / 180;
  AB.arrow(ctx, dmx, dmy - 6, dmx - Math.cos(da) * sc, dmy - 6 - Math.sin(da) * sc, { color: '#0d6e64', width: 2.5 });
  AB.text(ctx, 'M', dmx - Math.cos(da) * (sc + 12), dmy - 6 - Math.sin(da) * (sc + 12), { size: 11, color: '#0d6e64', weight: '700' });
  AB.arrow(ctx, sx, sy, sx + sc * 0.55, sy, { color: '#a92a1e', width: 2.5 });
  AB.text(ctx, 'R ≈ 4·W', sx + sc * 0.55 + 12, sy, { size: 10, color: '#a92a1e', weight: '700', align: 'left' });
  AB.text(ctx, 'F_x ≈ 4·F_y → inestable', w * 0.5, h * 0.12, { size: 11, color: '#a92a1e', weight: '700' });
  out('sh_out', 'M ≈ ' + fmt(Mf / Fy, 1) + '×W · R ≈ 4,2×W');
};

// ═══════════════════════════════════════════════════════════════════════════
//  S11b · RODILLA
// ═══════════════════════════════════════════════════════════════════════════
export const drawKnee: Draw = (dc, p, _f, out) => {
  const { ctx, w, h } = dc;
  c2Scene(dc, w, h, h - 30);
  const beta = p.kn_beta;
  const W1 = 150, W0 = 100, a = 12, b = 22, c = 50, th = 15;
  const M = ((b * W1 + c * W0) * Math.cos(beta * Math.PI / 180)) / (a * Math.sin(th * Math.PI / 180));
  const kx = w * 0.42, ky = h * 0.40;
  AB.bone(ctx, kx, ky, kx + 18, ky - 70, { width: 13, joint: true, jointR: 8 });
  ctx.beginPath(); ctx.arc(kx + 6, ky + 4, 6, 0, Math.PI * 2); ctx.fillStyle = '#cfc4ae'; ctx.strokeStyle = '#b6a67f'; ctx.stroke();
  const ang = (20 + beta * 0.6) * Math.PI / 180, L2 = 120;
  const ax = kx + L2 * Math.cos(ang), ay = ky + L2 * Math.sin(ang);
  AB.bone(ctx, kx, ky, ax, ay, { width: 11, jointEnd: true, jointR: 7 });
  AB.foot(ctx, ax + 2, ay, Math.PI / 2, { len: 40, h: 14 });
  AB.tendon(ctx, kx + 4, ky - 58, kx + 14, ky - 8, { width: 4 });
  const sc = Math.min(120, M * 0.09);
  AB.arrow(ctx, kx + 14, ky - 10, kx + 14, ky - 10 - sc, { color: '#0d6e64', width: 2.5 });
  AB.text(ctx, 'M = ' + fmt(M, 0) + ' N', kx + 22, ky - 10 - sc + 8, { size: 9, color: '#0d6e64', weight: '700', align: 'left' });
  AB.arrow(ctx, kx, ky, kx - sc * 0.4, ky + sc * 0.5, { color: '#a92a1e', width: 2.2 });
  ctx.beginPath(); ctx.arc(ax, ay + 22, 8, 0, Math.PI * 2); ctx.fillStyle = '#9a5b00'; ctx.fill(); ctx.strokeStyle = '#7c4900'; ctx.stroke();
  AB.text(ctx, 'W₀', ax + 12, ay + 24, { size: 9, color: '#9a5b00', weight: '700' });
  AB.text(ctx, 'β = ' + fmt(beta, 0) + '°', kx + 6, ky + 46, { size: 10, color: '#6b7885' });
  out('kn_out', 'M = ' + fmt(M, 0) + ' N');
};

// ═══════════════════════════════════════════════════════════════════════════
//  S12 · TOBILLO
// ═══════════════════════════════════════════════════════════════════════════
export const drawAnkle: Draw = (dc, p, _f, out) => {
  const { ctx, w, h } = dc;
  c2Scene(dc, w, h, h - 40);
  const beta = p.an_beta;
  const th = 45;
  const Wb = 882;
  const Mcoef = Math.abs(Math.cos(beta * Math.PI / 180) / Math.cos((th + beta) * Math.PI / 180));
  const M = Mcoef * Wb, R = 2.73 * Wb;
  const gx = w * 0.34, gy = h - 26;
  ctx.save(); ctx.translate(gx + 40, gy - 16); ctx.rotate(-0.18);
  AB.limbSkin(ctx, -14, 0, 34, 0, 22, { fill: '#e9c49f', edge: '#d9a77c' });
  ctx.restore();
  ctx.fillStyle = '#e8dfc9'; ctx.fillRect(0, gy, w, 40);
  ctx.strokeStyle = '#cfc3a9'; ctx.strokeRect(0, gy, w, 40);
  const akx = gx + 18, aky = gy - 30;
  AB.joint(ctx, akx, aky, 6);
  const tkx = gx + 8, tky = aky - 100;
  AB.bone(ctx, akx, aky, tkx, tky, { width: 11, joint: true, jointR: 7 });
  AB.muscle(ctx, tkx - 4, tky + 6, tkx - 8, tky + 58, { w0: 12, w1: 6, bow: 10, fill: '#c14b4b', edge: '#a92a1e' });
  AB.tendon(ctx, tkx - 8, tky + 54, gx - 4, gy - 12, { width: 4 });
  const sc = Math.min(120, M * 0.05);
  AB.arrow(ctx, gx - 4, gy - 12, gx - 4, gy - 12 - sc, { color: '#0d6e64', width: 2.5 });
  AB.text(ctx, 'M = ' + fmt(Mcoef, 2) + ' W_b', gx - 10, gy - 12 - sc - 10, { size: 10, color: '#0d6e64', weight: '700' });
  AB.arrow(ctx, akx, aky, akx, aky + sc * 0.5, { color: '#43505c', width: 2.4 });
  AB.text(ctx, 'W_b', akx + 10, aky + sc * 0.5, { size: 10, color: '#43505c', weight: '700', align: 'left' });
  AB.arrow(ctx, akx, aky, akx - sc * 0.3, aky + sc * 0.75, { color: '#a92a1e', width: 2.4 });
  AB.text(ctx, 'R = 2,73 W_b', akx - sc * 0.3, aky + sc * 0.75 + 12, { size: 9.5, color: '#a92a1e', weight: '700' });
  AB.text(ctx, 'β = ' + fmt(beta, 0) + '°', gx + 14, gy - 42, { size: 10, color: '#6b7885' });
  out('an_out', 'M = ' + fmt(Mcoef, 2) + ' W_b');
};

// ═══════════════════════════════════════════════════════════════════════════
//  S12b · MANDÍBULA
// ═══════════════════════════════════════════════════════════════════════════
export const drawJaw: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
  const mode = f.jawMode || 'incisor';
  const sx = w * 0.62, sy = h * 0.30;
  ctx.beginPath(); ctx.arc(sx, sy, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#cfc4ae'; ctx.strokeStyle = '#b6a67f'; ctx.lineWidth = 1.6; ctx.fill(); ctx.stroke();
  const jx = sx, jy = sy + 22;
  ctx.beginPath();
  ctx.moveTo(jx + 2, jy + 2);
  ctx.lineTo(jx - 10, jy + 30);
  ctx.lineTo(jx - 14, sy + 58);
  ctx.lineTo(jx - 44, sy + 64);
  ctx.lineTo(jx - 48, sy + 58);
  ctx.lineTo(jx - 14, sy + 52);
  ctx.closePath();
  ctx.fillStyle = '#cfc4ae'; ctx.strokeStyle = '#b6a67f'; ctx.lineWidth = 1.4; ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fbf8f0';
  for (let i = 0; i < 6; i++) ctx.fillRect(jx - 42 + i * 7, sy + 50, 4, 6);
  AB.joint(ctx, jx, jy, 5);
  AB.muscle(ctx, sx - 10, sy - 14, sx - 18, sy + 52, { w0: 7, w1: 3, bow: -4, fill: '#c14b4b', edge: '#a92a1e' });
  AB.text(ctx, 'masetero', sx - 30, sy - 6, { size: 9, color: '#a92a1e', align: 'right' });
  const am = mode === 'incisor' ? 0.50 : 0.76;
  const bx = mode === 'incisor' ? jx - 40 : jx - 14;
  const by = mode === 'incisor' ? sy + 60 : sy + 58;
  AB.arrow(ctx, bx, by, bx, by + 22, { color: '#a92a1e', width: 2.2 });
  AB.text(ctx, mode === 'incisor' ? 'incisivo' : '1er molar', bx, by + 32, { size: 9, color: '#a92a1e', align: 'left' });
  AB.text(ctx, 'AM = ' + fmt(am, 2), sx, sy + 78, { size: 12, color: '#0d6e64', weight: '700' });
  out('jaw_out', 'AM = ' + fmt(am, 2));
};

// ═══════════════════════════════════════════════════════════════════════════
//  S13 · TRES FUERZAS
// ═══════════════════════════════════════════════════════════════════════════
export const drawThreeForce: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
  c2Scene(dc, w, h, h - 30);
  const step = f.tfStep || 1;
  const g = h - 40;
  ctx.fillStyle = '#e8dfc9'; ctx.fillRect(0, g, w, 40);
  ctx.strokeStyle = '#cfc3a9'; ctx.strokeRect(0, g, w, 40);
  const toesX = w * 0.26;
  AB.foot(ctx, toesX, g - 6, 0, { len: 84, h: 22 });
  const akx = w * 0.38, aky = g - 26;
  const tx2 = w * 0.36, ty2 = g - 94;
  AB.bone(ctx, akx, aky, tx2, ty2, { width: 11, joint: true, jointR: 6 });
  ctx.beginPath(); ctx.arc(w * 0.40, ty2 + 8, 6, 0, Math.PI * 2); ctx.fillStyle = '#cfc4ae'; ctx.strokeStyle = '#b6a67f'; ctx.stroke();
  const patX = w * 0.40, patY = ty2 + 8;
  const tubX = w * 0.47, tubY = ty2 + 34;
  AB.tendon(ctx, patX, patY, tubX, tubY, { width: 4 });
  const qx = w * 0.30, qy = ty2 - 18;
  AB.joint(ctx, qx, qy, 7);
  AB.text(ctx, 'Q', qx - 16, qy - 2, { size: 10, color: '#6b7885' });
  const dux = tubX - patX, duy = tubY - patY;
  const duL = Math.hypot(dux, duy), ux = dux / duL, uy = duy / duL;
  const nNx = w * 0.44, nNy = g - 2;
  const sN = 60, sM = 64;
  if (step >= 1) {
    AB.arrow(ctx, nNx, nNy, nNx, nNy - sN, { color: '#2d7d4f', width: 2.5 });
    AB.text(ctx, 'N', nNx + 2, nNy - sN - 8, { size: 11, color: '#2d7d4f', weight: '700' });
    AB.arrow(ctx, patX, patY, patX + ux * sM, patY + uy * sM, { color: '#0d6e64', width: 2.5 });
    AB.text(ctx, 'M', patX + ux * (sM + 14), patY + uy * (sM + 14), { size: 11, color: '#0d6e64', weight: '700' });
  }
  const t = (nNx - patX) / ux;
  const Px = patX + ux * t, Py = patY + uy * t;
  if (step >= 2) {
    AB.dashed(ctx, nNx, nNy, nNx, nNy - sN - 46, { color: '#2d7d4f' });
    AB.dashed(ctx, patX, patY, patX + ux * (sM + 46), patY + uy * (sM + 46), { color: '#0d6e64' });
    ctx.fillStyle = '#9a5b00'; ctx.beginPath(); ctx.arc(Px, Py, 3.5, 0, Math.PI * 2); ctx.fill();
    AB.text(ctx, 'P', Px, Py + 16, { size: 12, color: '#9a5b00', weight: '700' });
  }
  if (step >= 3) {
    const ddx = Px - qx, ddy = Py - qy, Ln = Math.hypot(ddx, ddy);
    const rx = ddx / Ln, ry = ddy / Ln;
    AB.arrow(ctx, qx, qy, qx + rx * 70, qy + ry * 70, { color: '#a92a1e', width: 2.5 });
    AB.text(ctx, 'R', qx + rx * 80, qy + ry * 80, { size: 11, color: '#a92a1e', weight: '700' });
    AB.dashed(ctx, Px, Py, qx, qy, { color: '#a92a1e', width: 1.2 });
  }
  if (step >= 4) {
    const ox = w * 0.62, oy = h * 0.62, k = 0.5;
    const vN = [0, -sN * k];
    const vM = [ux * sM * k, uy * sM * k];
    const vR = [-vN[0] - vM[0], -vN[1] - vM[1]];
    ctx.fillStyle = 'rgba(13,110,100,.07)';
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + vN[0], oy + vN[1]); ctx.lineTo(ox + vN[0] + vM[0], oy + vN[1] + vM[1]); ctx.closePath(); ctx.fill();
    AB.arrow(ctx, ox, oy, ox + vN[0], oy + vN[1], { color: '#2d7d4f', width: 2.2 });
    AB.text(ctx, 'N', ox + vN[0] + 12, oy + vN[1] - 2, { size: 10, color: '#2d7d4f', weight: '700' });
    AB.arrow(ctx, ox + vN[0], oy + vN[1], ox + vN[0] + vM[0], oy + vN[1] + vM[1], { color: '#0d6e64', width: 2.2 });
    AB.text(ctx, 'M', ox + vN[0] + vM[0] + 2, oy + vN[1] + vM[1] - 8, { size: 10, color: '#0d6e64', weight: '700' });
    AB.arrow(ctx, ox + vN[0] + vM[0], oy + vN[1] + vM[1], ox, oy, { color: '#a92a1e', width: 2.2 });
    AB.text(ctx, 'R', ox + vR[0] * 0.55, oy + vR[1] * 0.55, { size: 10, color: '#a92a1e', weight: '700' });
  }
  const labels = ['1 · N y M', '2 · P (intersección)', '3 · R ∥ QP', '4 · Triángulo cerrado'];
  out('tf_out', 'Paso ' + step + ' de 4 · ' + labels[step - 1]);
};

// ═══════════════════════════════════════════════════════════════════════════
//  S14 · SEGMENTOS
// ═══════════════════════════════════════════════════════════════════════════
export const drawSegments: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
  c2Scene(dc, w, h, h - 30);
  const hover = f.segHover;
  const hx = w * 0.5, hy = h * 0.16, kx = w * 0.42, ky = h * 0.48, ax = w * 0.36, ay = h * 0.78;
  AB.bone(ctx, hx, hy, kx, ky, { width: 16, joint: true, jointR: 9, fill: hover === 'muslo' ? '#3aa89c' : undefined, edge: hover === 'muslo' ? '#0d6e64' : undefined });
  AB.bone(ctx, kx, ky, ax, ay, { width: 13, joint: true, jointR: 8, fill: hover === 'pantorrilla' ? '#3aa89c' : undefined, edge: hover === 'pantorrilla' ? '#0d6e64' : undefined });
  ctx.save(); ctx.translate(ax, ay); ctx.rotate(Math.PI / 2 + 0.4);
  AB.limbSkin(ctx, 0, 0, 44, 0, 22, { fill: hover === 'pie' ? '#3aa89c' : undefined, edge: hover === 'pie' ? '#0d6e64' : undefined });
  ctx.restore();
  AB.arrow(ctx, hx - 16, hy + 2, hx - 42, hy + 20, { color: '#a92a1e', width: 2 });
  AB.arrow(ctx, kx - 12, ky + 2, kx - 36, ky + 22, { color: '#a92a1e', width: 2 });
  AB.arrow(ctx, ax - 8, ay + 6, ax - 24, ay + 24, { color: '#a92a1e', width: 2 });
  AB.text(ctx, 'R₁', hx - 54, hy + 12, { size: 10, color: '#a92a1e', align: 'right' });
  AB.text(ctx, 'R₂', kx - 46, ky + 24, { size: 10, color: '#a92a1e', align: 'right' });
  AB.text(ctx, 'R₃', ax - 34, ay + 26, { size: 10, color: '#a92a1e', align: 'right' });
  AB.text(ctx, 'muslo', (hx + kx) / 2 - 8, (hy + ky) / 2, { size: 10, color: '#6b7885' });
  AB.text(ctx, 'pantorrilla', (kx + ax) / 2 - 10, (ky + ay) / 2, { size: 10, color: '#6b7885' });
  AB.text(ctx, 'pie', ax - 20, ay + 44, { size: 10, color: '#6b7885' });
  out('seg_out', hover ? ('FBD: ' + hover) : 'Pasa el cursor sobre un segmento');
};

// ═══════════════════════════════════════════════════════════════════════════
//  S15 · TACTO
// ═══════════════════════════════════════════════════════════════════════════
export const drawTouch: Draw = (dc, p, _f, out) => {
  const { ctx, w, h } = dc;
  const fval = p.tch_f;
  const f = Math.pow(10, -0.52 + (fval / 100) * 3.22);
  const R = [
    { name: 'Merkel', c: 1, s: 0.32, color: '#0d6e64', depth: 0.16 },
    { name: 'Meissner', c: 10, s: 0.34, color: '#2d7d4f', depth: 0.42 },
    { name: 'Ruffini', c: 80, s: 0.40, color: '#9a5b00', depth: 0.66 },
    { name: 'Pacini', c: 150, s: 0.50, color: '#5d4fa8', depth: 0.86 },
  ];
  const lf = Math.log10(f);
  const resp = R.map(r => Math.exp(-((lf - Math.log10(r.c)) ** 2) / (2 * r.s * r.s)));
  const left = w * 0.30, right = w * 0.86, top = 48, bot = h - 58;
  ctx.fillStyle = '#e8dfc9'; ctx.fillRect(left, top, right - left, 14);
  ctx.fillStyle = '#e3b48f'; ctx.fillRect(left, top + 14, right - left, (bot - top) * 0.72);
  ctx.fillStyle = '#f0d9b6'; ctx.fillRect(left, top + (bot - top) * 0.72, right - left, (bot - top) * 0.28);
  const px0 = left + (right - left) * 0.5;
  const vib = Math.sin(performance.now() * 0.02 * Math.min(f, 30) + f) * 3;
  ctx.strokeStyle = '#232c36'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(px0, top - 14, 10 + vib, 0, Math.PI * 2); ctx.stroke();
  AB.arrow(ctx, px0, top - 4, px0, top + 2, { color: '#232c36', width: 1.5 });
  AB.text(ctx, 'estímulo ' + fmt(f, 1) + ' Hz', px0, top - 28, { size: 11, color: '#232c36', weight: '700' });
  R.forEach((r, i) => {
    const rx = left + 24 + i * ((right - left) - 48) / 3, ry = top + 14 + (bot - top) * r.depth;
    const rr = 5 + resp[i] * 7;
    ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI * 2);
    ctx.fillStyle = resp[i] > 0.15 ? r.color : 'rgba(35,44,54,.25)';
    ctx.fill(); ctx.strokeStyle = r.color; ctx.lineWidth = 1.2; ctx.stroke();
    AB.text(ctx, r.name, rx, ry + rr + 9, { size: 8.5, color: '#43505c' });
  });
  R.forEach((r, i) => {
    const bx = left + 6 + i * ((right - left - 12) / 4), barW = (right - left - 12) / 4 - 6;
    const barH = resp[i] * 34;
    ctx.fillStyle = 'rgba(35,44,54,.12)'; ctx.fillRect(bx, h - 18 - 34, barW, 34);
    ctx.fillStyle = r.color; ctx.fillRect(bx, h - 18 - barH, barW, barH);
    AB.text(ctx, r.name, bx + barW / 2, h - 8, { size: 8, color: '#43505c' });
  });
  let dom = 0; resp.forEach((r, i) => { if (r > resp[dom]) dom = i; });
  out('tch_out', fmt(f, 1) + ' Hz · ' + R[dom].name);
};

// ═══════════════════════════════════════════════════════════════════════════
//  S16 · TERMORRECEPTORES
// ═══════════════════════════════════════════════════════════════════════════
export const drawThermal: Draw = (dc, p, _f, out) => {
  const { ctx, w, h } = dc;
  c2Scene(dc, w, h, h - 20);
  const T = p.th_t;
  function warm(temp: number) { if (temp < 30 || temp > 48) return 0; return temp <= 44 ? (temp - 30) / 14 : (48 - temp) / 4; }
  function cold(temp: number) { if (temp < 20 || temp > 45) return 0; return temp <= 30 ? (temp - 20) / 10 : (45 - temp) / 15; }
  const warmRate = warm(T), coldRate = cold(T);
  const x0 = 46, x1 = w - 16, y0 = h - 34, y1 = 16;
  const X = (t: number) => x0 + (t / 60) * (x1 - x0);
  const Y = (v: number) => y0 - v * (y0 - y1);
  ctx.strokeStyle = 'rgba(35,44,54,.1)'; ctx.lineWidth = 1;
  for (let t = 0; t <= 60; t += 10) {
    ctx.beginPath(); ctx.moveTo(X(t), y0); ctx.lineTo(X(t), y1); ctx.stroke();
    AB.text(ctx, String(t), X(t), y0 + 12, { size: 8.5, color: '#6b7885' });
  }
  AB.text(ctx, 'T (°C)', x1 - 26, y0 + 12, { size: 8.5, color: '#6b7885' });
  function curve(fn: (t: number) => number, color: string) {
    ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let t = 12; t <= 60; t += 1) { const v = fn(t); const x = X(t), y = Y(v); t === 12 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
  }
  curve(warm, '#a92a1e'); curve(cold, '#0d6e64');
  AB.text(ctx, 'cálido', X(46), Y(warm(46)) - 8, { size: 9, color: '#a92a1e', weight: '700' });
  AB.text(ctx, 'frío', X(26), Y(cold(26)) + 12, { size: 9, color: '#0d6e64', weight: '700' });
  ctx.strokeStyle = '#232c36'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(X(T), y0); ctx.lineTo(X(T), y1); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(X(T), Y(warmRate), 4, 0, Math.PI * 2); ctx.fillStyle = '#a92a1e'; ctx.fill();
  ctx.beginPath(); ctx.arc(X(T), Y(coldRate), 4, 0, Math.PI * 2); ctx.fillStyle = '#0d6e64'; ctx.fill();
  AB.text(ctx, 'T = ' + fmt(T, 0) + ' °C', X(T), y0 + 26, { size: 10, color: '#232c36', weight: '700' });
  const best = warmRate > coldRate ? ('cálido ' + (warmRate > 0.9 ? 'óptimo' : 'activo')) : ('frío ' + (coldRate > 0.9 ? 'óptimo' : 'activo'));
  out('th_out', fmt(T, 0) + ' °C · ' + best);
};

// ═══════════════════════════════════════════════════════════════════════════
//  S17 · CONVERTIDOR DE UNIDADES
// ═══════════════════════════════════════════════════════════════════════════
const FORCE: Record<string, number> = { N: 1, dyn: 1e-5, lb: 4.4482216152605, kgf: 9.80665 };
const PRESSURE: Record<string, number> = { Pa: 1, MPa: 1e6, mmHg: 133.322387415, psi: 6894.757293, atm: 101325, bar: 1e5, cmH2O: 98.0665 };
function fmtVal(x: number): string {
  if (Math.abs(x) >= 1e7 || (Math.abs(x) > 0 && Math.abs(x) < 1e-4)) return x.toExponential(2).replace('.', ',');
  return Number(x.toPrecision(4)).toString().replace('.', ',');
}
export function convertUnits(p: SimParams, out: OutFn) {
  const fv = parseFloat(String(p.cv_f_val)) || 0;
  const fN = fv * FORCE[p.cv_f_from];
  out('cv_f_out', fmtVal(fN / FORCE[p.cv_f_to]));
  const pv = parseFloat(String(p.cv_p_val)) || 0;
  const pPa = pv * PRESSURE[p.cv_p_from];
  out('cv_p_out', fmtVal(pPa / PRESSURE[p.cv_p_to]));
}

// ═══════════════════════════════════════════════════════════════════════════
//  Despacho de redibujo por slide (sustituye a redrawSlide + SIMS del motor).
//  Canvas por slide → función de dibujo. Para slides con 2 canvas, ambos.
// ═══════════════════════════════════════════════════════════════════════════
// NOTA: los slides de cap2 renderizan cada uno su propio <*Canvas> r3f; ningún
// slide monta ya <Sim id="sim-*">, así que este mapa (y drawById) están
// inactivos en la práctica. Se conserva sincronizado con los índices de slide
// por si se rehabilita algún sim 2D. Slides 9 y 10 (Rodilla, Tobillo) son 3D.
const CANVASMAP: Record<number, string[]> = {
  2: ['sim-torque'], 3: ['sim-levers'], 4: ['sim-amp'], 5: ['sim-forearm'], 6: ['sim-forearm2'],
  7: ['sim-hip'], 8: ['sim-hipcane'], 9: ['sim-knee'], 10: ['sim-ankle'],
  11: ['sim-back'], 12: ['sim-disc'], 13: ['sim-shoulder', 'sim-jaw'],
  14: ['sim-threeforce'], 15: ['sim-segments'], 16: ['sim-forceplate'], 17: ['sim-touch'], 18: ['sim-thermal'],
};

function drawById(id: string, dc: AB.DrawCtx, p: SimParams, f: SimFlags, out: OutFn) {
  switch (id) {
    case 'sim-torque': drawTorque(dc, p, f, out); break;
    case 'sim-levers': drawLevers(dc, p, f, out); break;
    case 'sim-amp': drawAmp(dc, p, f, out); break;
    case 'sim-forearm': drawForearm(dc, p, f, out); break;
    case 'sim-forearm2': drawForearm2(dc, p, f, out); break;
    case 'sim-hip': drawHip(dc, p, f, out); break;
    case 'sim-hipcane': drawHipCane(dc, p, f, out); break;
    case 'sim-back': drawBack(dc, p, f, out); break;
    case 'sim-disc': drawDisc(dc, p, f, out); break;
    case 'sim-shoulder': drawShoulder(dc, p, f, out); break;
    case 'sim-knee': drawKnee(dc, p, f, out); break;
    case 'sim-ankle': drawAnkle(dc, p, f, out); break;
    case 'sim-jaw': drawJaw(dc, p, f, out); break;
    case 'sim-threeforce': drawThreeForce(dc, p, f, out); break;
    case 'sim-segments': drawSegments(dc, p, f, out); break;
    case 'sim-touch': drawTouch(dc, p, f, out); break;
    case 'sim-thermal': drawThermal(dc, p, f, out); break;
  }
}

export function canvasesForSlide(n: number): string[] {
  return CANVASMAP[n] || [];
}

export function redrawSlide(n: number, t: number, p: SimParams, f: SimFlags, out: OutFn): void {
  if (n === 19) { convertUnits(p, out); return; }
  const ids = CANVASMAP[n];
  if (!ids) return;
  for (const id of ids) {
    const cv = document.getElementById(id) as HTMLCanvasElement | null;
    if (!cv || !cv.clientWidth) continue;
    const ctx = cv.getContext('2d');
    if (!ctx) continue;
    const w = cv.clientWidth, h = cv.clientHeight;
    AB.setup(ctx, w, h);
    const dc: AB.DrawCtx = { ctx, w, h, t };
    drawById(id, dc, p, f, out);
  }
}
