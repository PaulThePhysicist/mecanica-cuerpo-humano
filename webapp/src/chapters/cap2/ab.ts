// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 2 · Helpers anatómicos 2D (TypeScript puro, sin DOM)
//  Heredados del motor del capitulo2.html · portados a React.
//  DrawCtx = { ctx: CanvasRenderingContext2D, w: number, h: number, t: number }
//  (w/h en px lógicos ya con DPR aplicado por el componente <Sim>).
// ═══════════════════════════════════════════════════════════════════════════

export interface DrawCtx {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  t: number; // reloj de animación global (window.c2t)
}

export const PAL = {
  paper: '#f5f0e4',
  card: '#fbf8f0',
  ink: '#232c36',
  ink2: '#43505c',
  ink3: '#6b7885',
  bone: '#cfc4ae',
  boneEdge: '#b6a67f',
  boneDark: '#9b8a64',
  muscle: '#c14b4b',
  muscleEdge: '#a92a1e',
  tendon: '#e8d8c8',
  skin: '#e9c49f',
  skinEdge: '#d9a77c',
  teal: '#0d6e64',
  tealLight: '#3aa89c',
  amber: '#9a5b00',
  blood: '#a92a1e',
  good: '#2d7d4f',
  warn: '#b86a1e',
};

export function setup(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

export function fmt(x: number, d: number = 1): string {
  let s = Number(x).toFixed(d).replace(/\.?0+$/, '').replace('.', ',');
  if (s === '' || s === '-') s = '0';
  return s;
}

export function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  o?: { weight?: string; size?: number; color?: string; align?: CanvasTextAlign; base?: CanvasTextBaseline }
): void {
  o = o || {};
  ctx.font = (o.weight ? o.weight + ' ' : '') + (o.size ? o.size + 'px ' : '13px ') + 'Karla, sans-serif';
  ctx.fillStyle = o.color || PAL.ink;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.base || 'middle';
  ctx.fillText(s, x, y);
}

export function arrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  o?: { head?: number; color?: string; width?: number }
): void {
  o = o || {};
  const head = o.head === undefined ? 8 : o.head;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = o.color || PAL.teal;
  ctx.fillStyle = o.color || PAL.teal;
  ctx.lineWidth = o.width || 2.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - head * Math.cos(ang - 0.45), y1 - head * Math.sin(ang - 0.45));
  ctx.lineTo(x1 - head * Math.cos(ang + 0.45), y1 - head * Math.sin(ang + 0.45));
  ctx.closePath();
  ctx.fill();
}

export function dashed(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  o?: { color?: string; width?: number }
): void {
  o = o || {};
  ctx.strokeStyle = o.color || PAL.ink3;
  ctx.lineWidth = o.width || 1.2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function bone(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  o?: { width?: number; edge?: string; fill?: string; joint?: boolean; jointR?: number; jointEnd?: boolean }
): void {
  o = o || {};
  const w = o.width || 10;
  ctx.strokeStyle = o.edge || PAL.boneEdge;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.strokeStyle = o.fill || PAL.bone;
  ctx.lineWidth = w - 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  if (o.joint !== false) joint(ctx, x0, y0, w / 2);
  if (o.jointEnd) joint(ctx, x1, y1, w / 2);
}

export function joint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  o?: { fill?: string; color?: string; lw?: number }
): void {
  o = o || {};
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = o.fill || '#f5f0e4';
  ctx.fill();
  ctx.lineWidth = o.lw || 2.2;
  ctx.strokeStyle = o.color || PAL.teal;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.5, r * 0.38), 0, Math.PI * 2);
  ctx.fillStyle = o.color || PAL.teal;
  ctx.fill();
}

export function muscle(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  o?: { w0?: number; w1?: number; bow?: number; fill?: string; edge?: string; lw?: number }
): void {
  o = o || {};
  const w0 = o.w0 || 9;
  const w1 = o.w1 || 4;
  const ang = Math.atan2(by - ay, bx - ax);
  const perp = ang + Math.PI / 2;
  const dx = Math.cos(perp);
  const dy = Math.sin(perp);
  const cx = (ax + bx) / 2;
  const cy = (ay + by) / 2;
  const bow = o.bow || 0;
  ctx.beginPath();
  ctx.moveTo(ax + dx * w0 / 2, ay + dy * w0 / 2);
  ctx.quadraticCurveTo(cx + dx * (bow + (w0 + w1) / 4), cy + dy * (bow + (w0 + w1) / 4), bx + dx * w1 / 2, by + dy * w1 / 2);
  ctx.quadraticCurveTo(cx - dx * (w0 + w1) / 4, cy - dy * (w0 + w1) / 4, ax - dx * w0 / 2, ay - dy * w0 / 2);
  ctx.closePath();
  ctx.fillStyle = o.fill || PAL.muscle;
  ctx.fill();
  ctx.lineWidth = o.lw || 1.5;
  ctx.strokeStyle = o.edge || PAL.muscleEdge;
  ctx.stroke();
}

export function tendon(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  o?: { width?: number; fill?: string; edge?: string }
): void {
  o = o || {};
  const w = o.width || 3.5;
  const ang = Math.atan2(by - ay, bx - ax);
  const px = Math.cos(ang + Math.PI / 2);
  const py = Math.sin(ang + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(ax + px * w / 2, ay + py * w / 2);
  ctx.lineTo(bx + px * w / 2, by + py * w / 2);
  ctx.lineTo(bx - px * w / 2, by - py * w / 2);
  ctx.lineTo(ax - px * w / 2, ay - py * w / 2);
  ctx.closePath();
  ctx.fillStyle = o.fill || PAL.tendon;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = o.edge || '#c8b49a';
  ctx.stroke();
}

export function limbSkin(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  w: number,
  o?: { fill?: string; edge?: string; lw?: number }
): void {
  o = o || {};
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const px = Math.cos(ang + Math.PI / 2);
  const py = Math.sin(ang + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(x0 + px * w / 2, y0 + py * w / 2);
  ctx.lineTo(x1 + px * w / 2, y1 + py * w / 2);
  ctx.arc(x1, y1, w / 2, ang - Math.PI / 2, ang + Math.PI / 2);
  ctx.lineTo(x0 - px * w / 2, y0 - py * w / 2);
  ctx.arc(x0, y0, w / 2, ang + Math.PI / 2, ang + Math.PI * 1.5);
  ctx.closePath();
  ctx.fillStyle = o.fill || PAL.skin;
  ctx.fill();
  ctx.lineWidth = o.lw || 1.4;
  ctx.strokeStyle = o.edge || PAL.skinEdge;
  ctx.stroke();
}

export function hand(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, o?: { fill?: string; edge?: string }): void {
  o = o || {};
  ctx.fillStyle = o.fill || PAL.skin;
  ctx.strokeStyle = o.edge || PAL.skinEdge;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(x + i * r * 0.42, y - r * 0.55, r * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

export function foot(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, o?: { len?: number; h?: number; fill?: string; edge?: string }): void {
  o = o || {};
  const L = o.len || 54;
  const h = o.h || 20;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(-L * 0.35, -h * 0.25);
  ctx.quadraticCurveTo(-L * 0.5, h * 0.1, -L * 0.2, h * 0.42);
  ctx.quadraticCurveTo(L * 0.2, h * 0.55, L * 0.62, h * 0.3);
  ctx.quadraticCurveTo(L * 0.75, -h * 0.15, L * 0.55, -h * 0.35);
  ctx.quadraticCurveTo(0, -h * 0.5, -L * 0.35, -h * 0.25);
  ctx.closePath();
  ctx.fillStyle = o.fill || PAL.skin;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = o.edge || PAL.skinEdge;
  ctx.stroke();
  ctx.restore();
}

export function triangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, o?: { color?: string }): void {
  o = o || {};
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.5);
  ctx.lineTo(x - size * 0.5, y + size * 0.5);
  ctx.lineTo(x + size * 0.5, y + size * 0.5);
  ctx.closePath();
  ctx.fillStyle = o.color || PAL.amber;
  ctx.fill();
}

// ── Capa de "vida" compartida (c2) ──
export function c2GlowArrow(
  dc: DrawCtx,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  width: number,
  pulse?: number
): void {
  pulse = pulse === undefined ? 0 : pulse;
  const { ctx } = dc;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 7 + 5 * Math.sin((dc.t || 0) * 4 + pulse);
  arrow(ctx, x0, y0, x1, y1, { color, width });
  ctx.restore();
}

export function c2Chip(
  dc: DrawCtx,
  s: string,
  x: number,
  y: number,
  color: string,
  o?: { size?: number; weight?: string; align?: CanvasTextAlign; fill?: string }
): void {
  const { ctx } = dc;
  o = o || {};
  const sz = o.size || 11;
  ctx.font = (o.weight ? o.weight + ' ' : '') + sz + 'px Karla, sans-serif';
  const tw = ctx.measureText(s).width;
  const pad = 6;
  const bh = sz + 8;
  const bx = x - tw / 2 - pad;
  const by = y - bh / 2;
  const r2 = 5;
  ctx.beginPath();
  ctx.moveTo(bx + r2, by);
  ctx.arcTo(bx + tw + 2 * pad, by, bx + tw + 2 * pad, by + bh, r2);
  ctx.arcTo(bx + tw + 2 * pad, by + bh, bx, by + bh, r2);
  ctx.arcTo(bx, by + bh, bx, by, r2);
  ctx.arcTo(bx, by, bx + tw + 2 * pad, by, r2);
  ctx.closePath();
  ctx.fillStyle = o.fill || 'rgba(251,248,240,0.92)';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

export function c2Scene(dc: DrawCtx, _w?: number, _h?: number, baseY?: number): void {
  const { ctx, w, h } = dc;
  // viñeta suave + línea de base/suelo para dar profundidad
  const g = ctx.createRadialGradient(w / 2, h * 0.42, Math.min(w, h) * 0.2, w / 2, h * 0.5, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(60,40,10,0.07)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (baseY !== undefined) {
    ctx.strokeStyle = 'rgba(107,120,133,0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(10, baseY);
    ctx.lineTo(w - 10, baseY);
    ctx.stroke();
    ctx.save();
    ctx.strokeStyle = 'rgba(107,120,133,0.18)';
    for (let x = 14; x < w - 10; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x - 7, baseY + 8);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// Chip local para drawTorque (mantiene el estilo original).
export function chip(dc: DrawCtx, s: string, x: number, y: number, color: string, o?: { size?: number; weight?: string }): void {
  const { ctx } = dc;
  o = o || {};
  const sz = o.size || 12;
  ctx.font = (o.weight ? o.weight + ' ' : '') + sz + 'px Karla, sans-serif';
  const tw = ctx.measureText(s).width;
  const pad = 6;
  const bh = sz + 8;
  const bx = x - tw / 2 - pad;
  const by = y - bh / 2;
  const r2 = 5;
  ctx.beginPath();
  ctx.moveTo(bx + r2, by);
  ctx.arcTo(bx + tw + 2 * pad, by, bx + tw + 2 * pad, by + bh, r2);
  ctx.arcTo(bx + tw + 2 * pad, by + bh, bx, by + bh, r2);
  ctx.arcTo(bx, by + bh, bx, by, r2);
  ctx.arcTo(bx, by, bx + tw + 2 * pad, by, r2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(251,248,240,0.9)';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
