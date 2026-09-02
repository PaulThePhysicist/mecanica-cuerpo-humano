// @ts-nocheck
/* ============================================================================
 * sims.ts — Motor de simulaciones 2D del Capítulo 1 (Física del Cuerpo Humano)
 * Portado FIELMENTE desde Capitulos/Capitulo_1/capitulo1.html (bloques de draw*).
 * El motor original es JS vanilla autocontenido: cada draw lee su canvas y sus
 * sliders/outputs por id del DOM (document.getElementById) y anima con su propio
 * requestAnimationFrame. Se conserva tal cual; la navegación la maneja React
 * (useEngine/Capitulo1) y redrawSlide(slide) lo dispara por frame y al cambiar.
 * @ts-nocheck: el código migrado no se reescribe tipo por tipo (~205 KB de dibujo).
 * Las funciones de draw/control se exportan directamente para que Rolldown las
 * resuelva (el re-export cruzado desde un módulo @ts-nocheck no funciona).
 * ========================================================================== */

export const TOTAL = 17;
export const MODULES = [
  { id: 0, name: "Inicio",               slides: [0],            ico: "🏠" },
  { id: 1, name: "A · Terminología",      slides: [1,2,3],       ico: "🧭" },
  { id: 2, name: "B · Movimiento",        slides: [4,5,6,7],     ico: "🦾" },
  { id: 3, name: "C · Humano Estándar",   slides: [8,9,10,11],   ico: "📐" },
  { id: 4, name: "D · Escalamiento",      slides: [12,13,14,15], ico: "📈" },
  { id: 5, name: "Resumen",               slides: [16],          ico: "✓" },
];


/* Globals del motor original (el HTML las exponia en window; en un módulo ES
   las draw las usan localmente, pero algunos puntos del motor acceden por
   window.X. Se re-definen aqui para fidelidad. */
(window as any).__stage = function(canvasId, kicker, value, tone = 'teal', kind = 'anatomy') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.parentElement) return;
  const area = canvas.parentElement;
  area.dataset.stage = kind;
  let hud = area.querySelector('.stage-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.className = 'stage-hud';
    hud.innerHTML = '<span class="stage-kicker"></span><span class="stage-value"></span>';
    area.appendChild(hud);
  }
  hud.dataset.tone = tone;
  hud.querySelector('.stage-kicker').textContent = kicker;
  hud.querySelector('.stage-value').textContent = value;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', kicker + ': ' + value);
};
(window as any).go = function(_n) { /* navegacion la maneja React (useEngine) */ };
/* ─── B1: GRADOS DE LIBERTAD ─── */
let glMode = 6; // Default to 6 GL (Pierna)
let glAnimationActive = false;
let glAnimTime = 0;
let glRaf = null;

/* ── Motor de movimiento: amortiguación frame-rate independiente ──
   v persigue t con constante de tiempo 1/r segundos. dt real desde
   performance.now(), así el ritmo es idéntico a 60, 120 o 144 Hz. */
window.__damp = function(v, t, r, dt) { return v + (t - v) * (1 - Math.exp(-r * dt)); };
// Valores mostrados (los que dibuja el canvas) persiguen sus objetivos.
const _glDisp = { s: 0, e: 0, w: 0, p: 0 };

export function toggleGLAnimation() {
  const btn = document.getElementById('btnAnimateGL');
  if (!btn) return;
  glAnimationActive = !glAnimationActive;
  btn.setAttribute('aria-pressed',glAnimationActive ? 'true' : 'false');
  if (glAnimationActive) {
    btn.textContent = 'Pausar';
    btn.style.borderColor = 'var(--teal)';
    btn.style.color = 'var(--teal)';
    startGLRaf();
  } else {
    btn.textContent = 'Animar';
    btn.style.borderColor = '';
    btn.style.color = '';
  }
}

export function startGLRaf() {
  if (glRaf || !glAnimationActive) return;
  let _last = performance.now();
  function loop(now) {
    const canvas = document.getElementById('sim-gl');
    if (canvas && canvas.parentElement.offsetParent) {
      const dt = Math.min(0.1, (now - _last) / 1000); _last = now;
      const sliderS = document.getElementById('glShoulder');
      const sliderE = document.getElementById('glElbow');
      const sliderW = document.getElementById('glWrist');
      const sliderP = document.getElementById('glPivot');
      // Un slider enfocado (usuario arrastrando) manda: no pelear con él.
      const fS = sliderS && document.activeElement === sliderS;
      const fE = sliderE && document.activeElement === sliderE;
      const fW = sliderW && document.activeElement === sliderW;
      const fP = sliderP && document.activeElement === sliderP;

      if (glAnimationActive) {
        glAnimTime += dt;
        // Objetivos (oscilación de la articulación)
        const sT = glMode === 6 ? Math.sin(glAnimTime * 0.65) * 4 : Math.sin(glAnimTime) * 45;
        const eT = glMode === 6 ? 68 + Math.sin(glAnimTime * 1.15) * 42 : 70 + Math.sin(glAnimTime * 1.3) * 65;
        const wT = glMode === 6 ? Math.sin(glAnimTime * 1.4) * 12 : Math.sin(glAnimTime * 1.7) * 35;
        const pT = glMode === 6 ? 0 : Math.sin(glAnimTime * 0.8) * 80;
        // La extremidad persigue: sigue con retardo orgánico, sin tirones.
        // Un slider enfocado sigue el arrastre del usuario y de ahí reanuda.
        if (fS) _glDisp.s = +sliderS.value; else _glDisp.s = window.__damp(_glDisp.s, sT, 10, dt);
        if (fE) _glDisp.e = +sliderE.value; else _glDisp.e = window.__damp(_glDisp.e, eT, 10, dt);
        if (fW) _glDisp.w = +sliderW.value; else _glDisp.w = window.__damp(_glDisp.w, wT, 10, dt);
        if (fP) _glDisp.p = +sliderP.value; else _glDisp.p = window.__damp(_glDisp.p, pT, 10, dt);
        if (sliderS && !fS) sliderS.value = _glDisp.s;
        if (sliderE && !fE) sliderE.value = _glDisp.e;
        if (sliderW && !fW) sliderW.value = _glDisp.w;
        if (sliderP && !fP) sliderP.value = _glDisp.p;
      } else {
        // Reposo: arrastre directo, sin retardo.
        if (sliderS) _glDisp.s = +sliderS.value;
        if (sliderE) _glDisp.e = +sliderE.value;
        if (sliderW) _glDisp.w = +sliderW.value;
        if (sliderP) _glDisp.p = +sliderP.value;
      }
      drawGL();
      glRaf = requestAnimationFrame(loop);
    } else {
      glRaf = null; _last = performance.now();
    }
  }
  glRaf = requestAnimationFrame(loop);
}

// Clampa los sliders a los rangos de movimiento anatómico real (ROM).
export function glClamp() {
  const lim = { glShoulder: [-90, 90], glElbow: [0, 145], glPivot: [-90, 90], glWrist: [-60, 60] };
  for (const id in lim) {
    const el = document.getElementById(id);
    if (!el) continue;
    let v = parseFloat(el.value);
    if (isNaN(v)) v = 0;
    v = Math.max(lim[id][0], Math.min(lim[id][1], v));
    el.value = v;
  }
}
export function setGLMode(mode) {
  glMode = mode;
  window.__selectedJoint = null;
  const btn6 = document.getElementById('btnGL6');
  const btn7 = document.getElementById('btnGL7');
  if (btn6 && btn7) {
    if (mode === 6) {
      btn6.classList.add('done');
      btn7.classList.remove('done');
      btn6.setAttribute('aria-pressed','true'); btn7.setAttribute('aria-pressed','false');
    } else {
      btn7.classList.add('done');
      btn6.classList.remove('done');
      btn7.setAttribute('aria-pressed','true'); btn6.setAttribute('aria-pressed','false');
    }
  }

  const lbl1 = document.getElementById('glLabel1');
  const lbl2 = document.getElementById('glLabel2');
  const lbl3 = document.getElementById('glLabel3');
  const pContainer = document.getElementById('glPivotLabel');

  if (lbl1 && lbl2 && lbl3 && pContainer) {
    if (mode === 6) {
      lbl1.textContent = 'Cadera';
      lbl2.textContent = 'Rodilla';
      lbl3.textContent = 'Tobillo';
      pContainer.style.display = 'none';
    } else {
      lbl1.textContent = 'Hombro';
      lbl2.textContent = 'Codo';
      lbl3.textContent = 'Muñeca';
      pContainer.style.display = 'flex';
    }
  }

  // Attach hover listeners to canvas
  const canvas = document.getElementById('sim-gl');
  if (canvas && !canvas.__glHoverAttached) {
    canvas.__glHoverAttached = true;
    canvas.tabIndex = 0;
    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX, my = (e.clientY - rect.top) * scaleY;
      const found = (window.__glJoints || []).find(j => Math.hypot(mx-j.x,my-j.y) < 24);
      window.__selectedJoint = found ? found.id : null;
      const info = document.getElementById('info-text-b1');
      const texts = {
        shoulder:'La articulación proximal es una esferoidal: aporta 3 GL para orientar la extremidad.',
        elbow:'La rodilla o el codo funciona como bisagra: aporta 1 GL de flexión y extensión.',
        pivot:'El pivote radiocubital añade 1 GL al brazo: permite pronación y supinación.',
        wrist:'El tobillo o la muñeca es condílea: aporta 2 GL alrededor de ejes perpendiculares.'
      };
      if (info && found && texts[found.id]) info.innerHTML = texts[found.id];
      drawGL();
    });
    canvas.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const ids = window.__glJoints ? window.__glJoints.map(j=>j.id) : [];
      const index = Math.max(0, ids.indexOf(window.__selectedJoint));
      window.__selectedJoint = ids.length ? ids[(index + 1) % ids.length] : null;
      drawGL();
    });
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      
      let found = null;
      if (window.__glJoints) {
        for (const j of window.__glJoints) {
          if (Math.hypot(mx - j.x, my - j.y) < 18) {
            found = j.id;
            break;
          }
        }
      }
      if (window.__hoveredJoint !== found) {
        window.__hoveredJoint = found;
        drawGL();
      }
    });
    canvas.addEventListener('mouseleave', () => {
      window.__hoveredJoint = null;
      drawGL();
    });
  }

  drawGL();
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS DE ANATOMÍA 2D · sección B (B1 · B3 · B4)
   Primitivas reutilizables para dibujar huesos con epífisis, vientres
   musculares fusiformes con tendones, envolturas de piel y mano/pie
   anatómicos — estilo placa del libro (Figs. 1.3, 1.12).
   Expuestos como window.AB para que B3 (otro bloque de script) los use.
   ═══════════════════════════════════════════════════════════════════ */
  /* Ajuste HiDPI global: evita el canvas borroso en pantallas Retina/escaladas */
  function fitCanvas(canvas) {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, W: w, H: h };
  }
  window.fitCanvas = fitCanvas;

var AB = (function () {
  'use strict';

  var PAL = {
    boneHi:     '#fbf7ec', boneMid: '#ece4cf', boneSh: '#cdbf9c', boneDark: '#a8956f',
    boneStroke: 'rgba(48,59,70,0.85)',
    skinFill:   'rgba(196,150,108,0.30)', skinFillSoft: 'rgba(196,150,108,0.18)',
    skinEdge:   'rgba(150,104,68,0.95)',
    biceps:     '#b02f26', bicepsHi: '#e05a4b', bicepsSh: '#7d1c14', bicepsStroke: 'rgba(96,16,10,0.75)',
    triceps:    '#bf6418', tricepsHi: '#e89142', tricepsSh: '#8a4a12', tricepsStroke: 'rgba(108,58,16,0.75)',
    deltoid:    '#b0503c', deltoidHi: '#d97a56',
    tendon:     '#f3ecdb', tendonStroke: 'rgba(120,100,68,0.9)',
    ink:        'rgba(25,34,44,0.85)'
  };

  /* ── Hueso largo anatómico: diafisis ahusada + epífisis ensanchadas ── */
  function bone(ctx, x1, y1, x2, y2, r1, r2, opts) {
    opts = opts || {};
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.hypot(dx, dy) || 1;
    var ux = dx / len, uy = dy / len;
    var px = -uy, py = ux;
    var f1 = opts.flare1 != null ? opts.flare1 : 1.25;
    var f2 = opts.flare2 != null ? opts.flare2 : 1.25;
    var t = opts.taper != null ? opts.taper : 0.24;
    ctx.save();
    var g = ctx.createLinearGradient(x1 + px * r1, y1 + py * r1, x1 - px * r1, y1 - py * r1);
    if (opts.color === 'teal') {
      g.addColorStop(0, '#e3f0ec'); g.addColorStop(0.35, '#b5dcd1'); g.addColorStop(0.75, '#5fb39e'); g.addColorStop(1, '#3d8d7d');
    } else if (opts.color === 'amber') {
      g.addColorStop(0, '#f6e8d2'); g.addColorStop(0.35, '#e0c297'); g.addColorStop(0.75, '#b98a4f'); g.addColorStop(1, '#96693a');
    } else if (opts.color === 'grey') {
      g.addColorStop(0, '#eef0f1'); g.addColorStop(0.35, '#d9dddf'); g.addColorStop(0.75, '#aeb6bb'); g.addColorStop(1, '#8b959b');
    } else {
      g.addColorStop(0, opts.hi   || PAL.boneHi);
      g.addColorStop(0.35, opts.mid  || PAL.boneMid);
      g.addColorStop(0.75, opts.sh   || PAL.boneSh);
      g.addColorStop(1, opts.dark || PAL.boneDark);
    }
    ctx.fillStyle = g;
    ctx.strokeStyle = opts.stroke || PAL.boneStroke;
    ctx.lineWidth = opts.lw != null ? opts.lw : 1.2;
    ctx.beginPath();
    ctx.moveTo(x1 + px * r1 * f1, y1 + py * r1 * f1);
    ctx.bezierCurveTo(
      x1 + px * r1 * 0.5 + ux * len * t, y1 + py * r1 * 0.5 + uy * len * t,
      x2 + px * r2 * 0.5 - ux * len * t, y2 + py * r2 * 0.5 - uy * len * t,
      x2 + px * r2 * f2, y2 + py * r2 * f2);
    ctx.arc(x2, y2, r2 * f2, Math.atan2(py, px), Math.atan2(-py, -px), false);
    ctx.lineTo(x2 - px * r2 * f2, y2 - py * r2 * f2);
    ctx.bezierCurveTo(
      x2 - px * r2 * 0.5 - ux * len * t, y2 - py * r2 * 0.5 - uy * len * t,
      x1 - px * r1 * 0.5 + ux * len * t, y1 - py * r1 * 0.5 + uy * len * t,
      x1 - px * r1 * f1, y1 - py * r1 * f1);
    ctx.arc(x1, y1, r1 * f1, Math.atan2(-py, -px), Math.atan2(py, px), false);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Cartílago articular en un extremo (gota teal/ámbar según el tipo)
    if (opts.cap) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = opts.cap;
      ctx.beginPath(); ctx.arc(x2, y2, r2 * f2 * 0.62, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Brillo axial (relieve cilíndrico)
    ctx.globalAlpha = 0.4; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1 + px * r1 * 0.34 + ux * len * 0.05, y1 + py * r1 * 0.34 + uy * len * 0.05);
    ctx.quadraticCurveTo(
      (x1 + x2) / 2 + px * (r1 + r2) * 0.16, (y1 + y2) / 2 + py * (r1 + r2) * 0.16,
      x2 + px * r2 * 0.34 - ux * len * 0.05, y2 + py * r2 * 0.34 - uy * len * 0.05);
    ctx.stroke();
    ctx.restore();
  }

  /* ── Vientre muscular fusiforme a lo largo de una trayectoria ──
     pts: [{x,y},...] del origen a la inserción (curvo si hace falta)
     w  : semiancho máximo del vientre (px)
     color: relleno
     opts.tension 0..1  → cuánto se engrosa el vientre (contracción)
     opts.tendon 0..1   → fracción de cada extremo que es tendón
     opts.wScale       → factor global de ancho
     opts.alpha        → transparencia
     opts.hi           → color del relieve central opcional             */
  function muscle(ctx, pts, w, color, opts) {
    opts = opts || {};
    var n = pts.length;
    if (n < 2) return;
    var tension = opts.tension == null ? 0.5 : opts.tension;
    var tau = opts.tendon == null ? 0.16 : opts.tendon;
    var nx = [], ny = [];
    var i;
    for (i = 0; i < n; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)];
      var ddx = p1.x - p0.x, ddy = p1.y - p0.y;
      var L = Math.hypot(ddx, ddy) || 1; ddx /= L; ddy /= L;
      nx.push(-ddy); ny.push(ddx);
    }
    function halfW(s) {
      var s0 = Math.max(0, Math.min(1, (s - tau) / Math.max(1e-6, 1 - 2 * tau)));
      var curve = Math.pow(Math.sin(Math.min(1, Math.max(0, s0)) * Math.PI), 0.6);
      var base = w * 0.28;
      var hw = (base + (w - base) * curve) * (0.7 + 0.55 * tension);
      if (opts.wScale != null) hw *= opts.wScale;
      return hw;
    }
    ctx.save();
    if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
    ctx.fillStyle = color;
    ctx.strokeStyle = opts.stroke || PAL.boneStroke;
    ctx.lineWidth = opts.lw != null ? opts.lw : 1;
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      var hw1 = halfW(i / (n - 1));
      var X = pts[i].x + nx[i] * hw1, Y = pts[i].y + ny[i] * hw1;
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    for (i = n - 1; i >= 0; i--) {
      var hw2 = halfW(i / (n - 1));
      ctx.lineTo(pts[i].x - nx[i] * hw2, pts[i].y - ny[i] * hw2);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Relieve central (luz) que sugiere la forma cilíndrica del vientre
    if (opts.hi) {
      ctx.strokeStyle = opts.hi; ctx.lineWidth = Math.max(1, w * 0.22); ctx.globalAlpha = 0.5;
      ctx.beginPath();
      for (i = 0; i < n; i++) {
        var hh = halfW(i / (n - 1)) * 0.5;
        var xx = pts[i].x + nx[i] * hh, yy = pts[i].y + ny[i] * hh;
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ── Tendón: banda alargada y ahusada que une músculo con hueso ── */
  function tendon(ctx, x1, y1, x2, y2, w, opts) {
    opts = opts || {};
    var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    var ux = dx / len, uy = dy / len, px = -uy, py = ux;
    ctx.save();
    ctx.fillStyle = opts.color || PAL.tendon;
    ctx.strokeStyle = opts.stroke || PAL.tendonStroke;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x1 + px * w, y1 + py * w);
    ctx.quadraticCurveTo((x1 + x2) / 2 + px * w * 0.4, (y1 + y2) / 2 + py * w * 0.4, x2 + px * w * 0.42, y2 + py * w * 0.42);
    ctx.arc(x2, y2, w * 0.42, Math.atan2(py, px), Math.atan2(-py, -px), false);
    ctx.lineTo(x2 - px * w * 0.42, y2 - py * w * 0.42);
    ctx.quadraticCurveTo((x1 + x2) / 2 - px * w * 0.4, (y1 + y2) / 2 - py * w * 0.4, x1 - px * w, y1 - py * w);
    ctx.arc(x1, y1, w, Math.atan2(-py, -px), Math.atan2(py, px), false);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  /* ── Envoltura de piel a lo largo de la extremidad ──
     joints: [{x,y}]  (hombro, codo, muñeca…)
     radii : semiancho de piel en cada articulación (px)
     opts.alpha, opts.fill, opts.edge                              */
  function limbSkin(ctx, joints, radii, opts) {
    opts = opts || {};
    var pts = [];
    var steps = 24;
    for (var i = 0; i < joints.length - 1; i++) {
      for (var s = 0; s < steps; s++) {
        var t = s / steps;
        pts.push({
          x: joints[i].x + (joints[i + 1].x - joints[i].x) * t,
          y: joints[i].y + (joints[i + 1].y - joints[i].y) * t,
          r: radii[i] + (radii[i + 1] - radii[i]) * t
        });
      }
    }
    var last = joints.length - 1;
    pts.push({ x: joints[last].x, y: joints[last].y, r: radii[last] });
    var n = pts.length;
    var nx = [], ny = [];
    for (i = 0; i < n; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)];
      var ddx = p1.x - p0.x, ddy = p1.y - p0.y;
      var L = Math.hypot(ddx, ddy) || 1; ddx /= L; ddy /= L;
      nx.push(-ddy); ny.push(ddx);
    }
    ctx.save();
    if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
    ctx.fillStyle = opts.fill || PAL.skinFillSoft;
    ctx.strokeStyle = opts.edge || PAL.skinEdge;
    ctx.lineWidth = opts.lw != null ? opts.lw : 1.4;
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      var X1 = pts[i].x + nx[i] * pts[i].r, Y1 = pts[i].y + ny[i] * pts[i].r;
      if (i === 0) ctx.moveTo(X1, Y1); else ctx.lineTo(X1, Y1);
    }
    for (i = n - 1; i >= 0; i--) {
      ctx.lineTo(pts[i].x - nx[i] * pts[i].r, pts[i].y - ny[i] * pts[i].r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  /* ── Mano anatómica ──
     x,y  : muñeca · ang : dirección de los dedos (rad, 0 = +x) · s : longitud total
     opts.fl 0..1 (0 = perfil, 1 = palma) · opts.thumbSign ∓1 · opts.skin bool
     opts.fill / opts.edge para color                          */
  function hand(ctx, x, y, ang, s, opts) {
    opts = opts || {};
    var fl = opts.fl != null ? opts.fl : 0.7;
    var k = 0.22 + 0.78 * fl;               // factor de escorzo (anchura percibida)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    if (opts.skin !== false) {
      ctx.fillStyle = opts.fill || PAL.skinFillSoft;
      ctx.strokeStyle = opts.edge || PAL.skinEdge;
      ctx.lineWidth = 1.1;
    } else {
      ctx.fillStyle = PAL.boneMid;
      ctx.strokeStyle = PAL.boneStroke;
      ctx.lineWidth = 0.9;
    }
    // Palma
    ctx.beginPath();
    ctx.moveTo(0, -0.14 * s * k);
    ctx.quadraticCurveTo(0.18 * s, -0.19 * s * k, 0.42 * s, -0.20 * s * k);
    ctx.quadraticCurveTo(0.46 * s, 0, 0.42 * s, 0.20 * s * k);
    ctx.quadraticCurveTo(0.18 * s, 0.19 * s * k, 0, 0.14 * s * k);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Dedos (índice, medio, anular, meñique)
    var yc = [-0.115, -0.03, 0.055, 0.14];
    var fls = [0.30, 0.34, 0.30, 0.22];
    var fw = [0.075, 0.080, 0.074, 0.062];
    for (var i = 0; i < 4; i++) {
      var yy = yc[i] * s * k, ll = fls[i] * s, ww = fw[i] * s * (0.55 + 0.45 * fl);
      ctx.beginPath();
      ctx.moveTo(0.42 * s, yy - ww * 0.5);
      ctx.quadraticCurveTo(0.42 * s + ll * 0.78, yy - ww * 0.62, 0.42 * s + ll, yy - ww * 0.30);
      ctx.quadraticCurveTo(0.42 * s + ll * 1.05, yy, 0.42 * s + ll, yy + ww * 0.30);
      ctx.quadraticCurveTo(0.42 * s + ll * 0.78, yy + ww * 0.62, 0.42 * s, yy + ww * 0.5);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    // Pulgar (solo si hay palma)
    if (fl > 0.35) {
      var ts = (opts.thumbSign != null ? opts.thumbSign : 1);
      ctx.beginPath();
      ctx.moveTo(0.10 * s, 0.14 * s * k * ts);
      ctx.quadraticCurveTo(0.26 * s, 0.24 * s * ts, 0.28 * s, 0.38 * s * ts);
      ctx.quadraticCurveTo(0.24 * s, 0.42 * s * ts, 0.14 * s, 0.33 * s * ts);
      ctx.quadraticCurveTo(0.02 * s, 0.24 * s * ts, -0.01 * s, 0.12 * s * k * ts);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  /* ── Pie anatómico (silueta lateral) ──
     x,y: tobillo (pivote) · ang: dirección de los dedos (rad, 0 = +x)
     s : longitud total (→ 1.0·s es la punta del pie)
     Los dedos apuntan a +x; la planta queda en +y (hacia abajo).      */
  function foot(ctx, x, y, ang, s, opts) {
    opts = opts || {};
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    if (opts.skin !== false) {
      ctx.fillStyle = opts.fill || PAL.skinFillSoft;
      ctx.strokeStyle = opts.edge || PAL.skinEdge;
      ctx.lineWidth = 1.2;
    } else {
      ctx.fillStyle = PAL.boneMid;
      ctx.strokeStyle = PAL.boneStroke;
      ctx.lineWidth = 0.9;
    }
    // Silueta lateral: tobillo → empeine → antepié → dedos → arco → talón.
    ctx.beginPath();
    ctx.moveTo(0.00 * s, -0.13 * s);                           // unión con la tibia
    ctx.quadraticCurveTo(-0.04 * s, -0.33 * s, 0.18 * s, -0.35 * s); // empeine
    ctx.quadraticCurveTo(0.44 * s, -0.37 * s, 0.60 * s, -0.29 * s);  // antepié (dorsal)
    ctx.quadraticCurveTo(0.80 * s, -0.25 * s, 0.92 * s, -0.14 * s);  // base de los dedos
    ctx.quadraticCurveTo(1.05 * s, -0.08 * s, 1.06 * s, 0.00 * s);   // punta (tercer dedo)
    ctx.quadraticCurveTo(1.04 * s,  0.10 * s, 0.86 * s,  0.15 * s);  // almohadilla metatarsiana
    ctx.quadraticCurveTo(0.64 * s,  0.18 * s, 0.30 * s,  0.06 * s);  // arco plantar
    ctx.quadraticCurveTo(0.12 * s,  0.00 * s, -0.08 * s, 0.12 * s);  // arco → talón
    ctx.quadraticCurveTo(-0.20 * s, 0.17 * s, -0.29 * s, 0.09 * s);  // calcáneo redondeado
    ctx.quadraticCurveTo(-0.34 * s, -0.02 * s, -0.24 * s, -0.09 * s);// parte alta del talón
    ctx.quadraticCurveTo(-0.12 * s, -0.12 * s, 0.00 * s, -0.13 * s);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Maléolo lateral: nudo visible del tobillo que ancla el pie a la tibia.
    ctx.fillStyle = opts.skin !== false ? 'rgba(233,225,205,.9)' : PAL.boneMid;
    ctx.beginPath(); ctx.arc(0, -0.02 * s, 0.075 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Tendón de Aquiles: banda que desciende por el talón.
    ctx.strokeStyle = opts.skin !== false ? 'rgba(160,140,105,.6)' : PAL.boneStroke;
    ctx.lineWidth = opts.skin !== false ? 1 : .7;
    ctx.beginPath();
    ctx.moveTo(-0.10 * s, -0.12 * s);
    ctx.quadraticCurveTo(-0.22 * s, -0.02 * s, -0.24 * s, 0.08 * s);
    ctx.stroke();
    // Separación de los dedos (sin pinzas: solo una línea guía central).
    ctx.strokeStyle = opts.skin !== false ? 'rgba(67,80,92,.28)' : PAL.boneStroke;
    ctx.lineWidth = .7;
    for (var i = 0; i < 3; i++) {
      var dx = 0.80 * s + i * 0.10 * s;
      ctx.beginPath(); ctx.moveTo(dx, -0.20 * s);
      ctx.quadraticCurveTo(dx + .02 * s, 0.00 * s, dx - .02 * s, 0.06 * s);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ── Masa articular proximal (deltoides / glúteo) ── */
  function jointMass(ctx, x, y, rx, ry, rot, opts) {
    opts = opts || {};
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.fillStyle = opts.fill || PAL.skinFillSoft;
    ctx.strokeStyle = opts.edge || PAL.skinEdge;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-rx * 0.6, -ry * 0.75);
    ctx.quadraticCurveTo(0, -ry * 1.15, rx * 0.55, -ry * 0.55);
    ctx.quadraticCurveTo(rx * 0.9, -ry * 0.15, rx * 0.7, ry * 0.25);
    ctx.quadraticCurveTo(rx * 0.35, ry * 0.75, -rx * 0.25, ry * 0.55);
    ctx.quadraticCurveTo(-rx * 0.85, ry * 0.3, -rx * 0.75, -ry * 0.25);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  return {
    PAL: PAL,
    bone: bone,
    muscle: muscle,
    tendon: tendon,
    limbSkin: limbSkin,
    hand: hand,
    foot: foot,
    jointMass: jointMass
  };
})();
window.AB = AB;
window.__glLayerMode = 'atlas';
document.querySelectorAll('[data-gl-layer]').forEach(button=>{
  button.addEventListener('click',()=>{
    window.__glLayerMode = button.dataset.glLayer;
    document.querySelectorAll('[data-gl-layer]').forEach(item=>item.setAttribute('aria-pressed',item===button?'true':'false'));
    drawGL();
  });
});
export function drawCompactGL(ctx,W,H){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(232,223,201,.72)'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(35,44,54,.08)'; ctx.lineWidth=1;
  for(let x=0;x<W;x+=18){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=18){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  const leg=glMode===6;
  ctx.fillStyle='#0d6e64';ctx.font='bold 15px JetBrains Mono, monospace';ctx.textAlign='left';
  ctx.fillText(leg?'3 + 1 + 2 = 6 GL':'3 + 1 + 1 + 2 = 7 GL',12,30);
  ctx.fillStyle='#43505c';ctx.font='10px Karla, system-ui, sans-serif';
  ctx.fillText(leg?'Pierna · cadena cinemática':'Brazo · cadena cinemática',12,48);
  const rows=leg?[['#b02318','Cadera','3 GL · esferoidal'],['#0d6e64','Rodilla','1 GL · bisagra'],['#a35c00','Tobillo','2 GL · condílea']]:[['#b02318','Hombro','3 GL · esferoidal'],['#0d6e64','Codo','1 GL · bisagra'],['#6d5fbf','Pivote','1 GL'],['#a35c00','Muñeca','2 GL · condílea']];
  rows.forEach((row,i)=>{const y=H-20-(rows.length-i)*22;ctx.fillStyle=row[0];ctx.beginPath();ctx.arc(18,y-3,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#22303c';ctx.font='bold 10px Karla, system-ui, sans-serif';ctx.fillText(row[1],30,y);ctx.fillStyle='#6b7885';ctx.font='8px Karla, system-ui, sans-serif';ctx.fillText(row[2],30,y+10);});
}
export function drawGL() {
  const canvas = document.getElementById('sim-gl');
  if (!canvas || !canvas.parentElement.offsetParent) return;
  const __f = window.fitCanvas(canvas);
  const ctx = __f.ctx;
  const W = __f.W, H = __f.H;
  const layerLabel = window.__glLayerMode === 'skeleton' ? ' · vista ósea' : window.__glLayerMode === 'muscles' ? ' · vista muscular' : '';
  window.__stage('sim-gl','CINEMÁTICA',(glMode === 6 ? 'Pierna · 6 GL' : 'Brazo · 7 GL') + layerLabel,'teal','anatomy');
  ctx.clearRect(0, 0, W, H);
  if (W < 200 || H < 160) { drawCompactGL(ctx,W,H); return; }

  // 1. Draw subtle background grid
  ctx.strokeStyle = 'rgba(35,44,54,0.07)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  const cx = W * 0.46, cy = H * 0.24;
  const shoulderA = parseFloat(document.getElementById('glShoulder').value) * Math.PI / 180;
  const elbowA = parseFloat(document.getElementById('glElbow').value) * Math.PI / 180;
  const wristA = parseFloat(document.getElementById('glWrist').value) * Math.PI / 180;
  const upperLen = H * 0.31, foreLen = H * 0.27, handLen = H * 0.14;

  // Calculate coordinates
  const ux = cx + Math.sin(shoulderA) * upperLen;
  const uy = cy + Math.cos(shoulderA) * upperLen;

  const totalA = shoulderA - (Math.PI/2 - elbowA);
  const fx = ux + Math.sin(totalA) * foreLen;
  const fy = uy + Math.cos(totalA) * foreLen;

  const handA = totalA + wristA;
  const hx = fx + Math.sin(handA) * handLen;
  const hy = fy + Math.cos(handA) * handLen;

  const dx = fx - ux;
  const dy = fy - uy;
  const len = Math.hypot(dx, dy) || 1;
  const udx = dx / len;
  const udy = dy / len;
  const px = -udy;
  const py = udx;

  // Save joint locations globally for the hover listener
  const mx = (ux + fx) / 2;
  const my = (uy + fy) / 2;
  window.__glJoints = [
    { id: 'shoulder', x: cx, y: cy },
    { id: 'elbow', x: ux, y: uy },
    ...(glMode === 7 ? [{ id: 'pivot', x: mx, y: my }] : []),
    { id: 'wrist', x: fx, y: fy }
  ];

  // Joint rendering helper
  function joint(x, y, label, active, color = '#0f6f67') {
    const focusId = window.__selectedJoint || window.__hoveredJoint;
    const isFocused = focusId && window.__glJoints && window.__glJoints.find(j => j.id === focusId && Math.hypot(j.x - x, j.y - y) < 8);

    ctx.save();
    if (isFocused) {
      ctx.shadowBlur = 18; ctx.shadowColor = color;
      ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI*2);
      ctx.fillStyle = color + '33'; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    }

    ctx.beginPath(); ctx.arc(x, y, isFocused ? 9 : 7, 0, Math.PI*2);
    ctx.fillStyle = active ? color : '#c9bfa8';
    ctx.fill();
    ctx.strokeStyle = '#22303c'; ctx.lineWidth = 1.5; ctx.stroke();

    if (label) {
      ctx.font = isFocused ? 'bold 11px Karla, system-ui, sans-serif' : 'bold 10px Karla, system-ui, sans-serif';
      const width = Math.max(80, ctx.measureText(label).width + 16);
      const lx = Math.max(10, Math.min(W - width - 10, x - width / 2));
      const ly = Math.max(64, y - 34);
      ctx.fillStyle = isFocused ? 'rgba(251,248,240,1)' : 'rgba(251,248,240,.92)';
      ctx.strokeStyle = isFocused ? color : 'rgba(150,104,68,.85)'; ctx.lineWidth = isFocused ? 1.6 : 1.1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(lx, ly, width, 19, 5); else ctx.rect(lx, ly, width, 19);
      ctx.fill(); ctx.stroke();
      // línea guía que une la caja con el nodo articular
      ctx.beginPath();
      ctx.moveTo(lx + width / 2, ly + 19);
      ctx.lineTo(x, y - 7);
      ctx.strokeStyle = isFocused ? color : 'rgba(150,104,68,.55)';
      ctx.lineWidth = isFocused ? 1.5 : 1;
      ctx.stroke();
      ctx.fillStyle = isFocused ? '#161f28' : '#2b3742';
      ctx.textAlign = 'center'; ctx.fillText(label, lx + width / 2, ly + 13);
    }
    ctx.restore();
  }

  // ═══════════ ANATOMÍA · brazo o pierna realista ═══════════
  const isLeg = glMode === 6;
  const P = AB.PAL;
  const layerMode = window.__glLayerMode || 'atlas';

  // Dirección del segmento proximal (húmero/fémur) y su normal
  const hdx = ux - cx, hdy = uy - cy;
  const hL = Math.hypot(hdx, hdy) || 1;
  const hnX = -hdy / hL, hnY = hdx / hL;
  // Lado flexor = lado hacia el que se dobla el antebrazo/pantorrilla
  const bs = Math.sign((fx - ux) * hnX + (fy - uy) * hnY) || 1;

  // Cuando se anima, la trayectoria conserva las poses anteriores como una
  // lectura del extremo distal: explica el rango sin inventar músculos.
  function poseAt(t){
    const s = (isLeg ? Math.sin(t * .65) * 4 : Math.sin(t) * 45) * Math.PI / 180;
    const e = (isLeg ? 68 + Math.sin(t * 1.15) * 42 : 70 + Math.sin(t * 1.3) * 65) * Math.PI / 180;
    const w = (isLeg ? Math.sin(t * 1.4) * 12 : Math.sin(t * 1.7) * 35) * Math.PI / 180;
    const gUx = cx + Math.sin(s) * upperLen;
    const gUy = cy + Math.cos(s) * upperLen;
    const gTotal = s - (Math.PI / 2 - e);
    const gFx = gUx + Math.sin(gTotal) * foreLen;
    const gFy = gUy + Math.cos(gTotal) * foreLen;
    return { ux:gUx, uy:gUy, fx:gFx, fy:gFy, hand:gTotal+w };
  }
  if (glAnimationActive) {
    const trail = [];
    ctx.save(); ctx.setLineDash([5,6]);
    for (let i = -7; i <= 7; i++) {
      const ghost = poseAt(glAnimTime + i * .34);
      trail.push(ghost);
      ctx.fillStyle = i === 0 ? 'rgba(163,92,0,.8)' : 'rgba(163,92,0,.22)';
      ctx.beginPath(); ctx.arc(ghost.fx,ghost.fy,i===0?5:3,0,Math.PI*2); ctx.fill();
    }
    ctx.setLineDash([]); ctx.strokeStyle = 'rgba(163,92,0,.52)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); trail.forEach((point,i)=>i ? ctx.lineTo(point.fx,point.fy) : ctx.moveTo(point.fx,point.fy)); ctx.stroke();
    ctx.fillStyle = '#9a5b00'; ctx.font = 'bold 9px JetBrains Mono, monospace'; ctx.textAlign = 'left';
    ctx.fillText('TRAYECTORIA · extremo distal',20,H-18); ctx.restore();
  }

  // ── Masa articular proximal (deltoides / glúteo) ──
  ctx.save();
  ctx.globalAlpha = layerMode === 'skeleton' ? 0 : layerMode === 'muscles' ? .35 : 1;
  AB.jointMass(ctx, cx, cy, H * 0.055, H * 0.062, isLeg ? 0.5 : 0.4,
    { fill: 'rgba(222,180,142,0.34)', edge: 'rgba(194,146,108,0.5)' });

  // ── Envoltura de piel (deja ver los huesos por dentro) ──
  AB.limbSkin(ctx, [{ x: cx, y: cy }, { x: ux, y: uy }, { x: fx, y: fy }],
    [H * 0.052, H * 0.045, H * 0.032],
    { fill: 'rgba(196,150,108,0.22)', edge: 'rgba(140,96,60,0.95)', lw: 1.8 });
  ctx.restore();

  // ── Músculos sutiles bajo la piel ──
  ctx.save();
  ctx.globalAlpha = layerMode === 'skeleton' ? 0 : layerMode === 'muscles' ? 1 : .6;
  if (isLeg) {
    // Glúteo mayor ya dibujado como masa; cuádriceps + isquiotibial tenues
    AB.muscle(ctx, [
      { x: cx + hnX * 6 + hdx * 0.06, y: cy + hnY * 6 + hdy * 0.06 },
      { x: cx + hnX * 8 + hdx * 0.48,  y: cy + hnY * 8 + hdy * 0.48 },
      { x: cx + hnX * 5 + hdx * 0.86, y: cy + hnY * 5 + hdy * 0.86 }
    ], H * 0.034, P.biceps, { tension: 0.42, tendon: 0.1, alpha: 0.52, hi: 'rgba(255,205,190,.45)' });
    AB.muscle(ctx, [
      { x: cx - hnX * 6 + hdx * 0.08, y: cy - hnY * 6 + hdy * 0.08 },
      { x: cx - hnX * 7 + hdx * 0.5, y: cy - hnY * 7 + hdy * 0.5 },
      { x: cx - hnX * 4 + hdx * 0.84, y: cy - hnY * 4 + hdy * 0.84 }
    ], H * 0.03, P.triceps, { tension: 0.42, tendon: 0.1, alpha: 0.46, hi: 'rgba(255,215,165,.4)' });
    AB.tendon(ctx, cx + hdx * .86, cy + hdy * .86, ux, uy, H * .008, { color:'rgba(240,230,210,.72)' });
    AB.tendon(ctx, cx - hnX * 4 + hdx * .84, cy - hnY * 4 + hdy * .84, ux, uy, H * .007, { color:'rgba(240,230,210,.62)' });
    const ldx = fx - ux, ldy = fy - uy;
    AB.muscle(ctx, [
      { x: ux + ldx * .08 + px * 6, y: uy + ldy * .08 + py * 6 },
      { x: ux + ldx * .42 + px * 7, y: uy + ldy * .42 + py * 7 },
      { x: ux + ldx * .72 + px * 5, y: uy + ldy * .72 + py * 5 }
    ], H * 0.022, P.deltoid, { tension: 0.38, tendon: 0.12, alpha: 0.42 });
    AB.muscle(ctx, [
      { x: ux + ldx * .1 - px * 5, y: uy + ldy * .1 - py * 5 },
      { x: ux + ldx * .46 - px * 5, y: uy + ldy * .46 - py * 5 },
      { x: ux + ldx * .7 - px * 4, y: uy + ldy * .7 - py * 4 }
    ], H * 0.018, P.triceps, { tension: 0.34, tendon: 0.12, alpha: 0.38 });
    AB.tendon(ctx, ux + ldx * .72 + px * 5, uy + ldy * .72 + py * 5, fx, fy, H * .007, { color:'rgba(240,230,210,.7)' });
    AB.tendon(ctx, ux + ldx * .7 - px * 4, uy + ldy * .7 - py * 4, fx, fy, H * .006, { color:'rgba(240,230,210,.58)' });
  } else {
    // Bíceps (lado flexor) y tríceps (lado extensor) del húmero
    AB.muscle(ctx, [
      { x: cx + hnX * bs * 7 + hdx * 0.08, y: cy + hnY * bs * 7 + hdy * 0.08 },
      { x: cx + hnX * bs * 8 + hdx * 0.48,  y: cy + hnY * bs * 8 + hdy * 0.48 },
      { x: cx + hnX * bs * 5 + hdx * 0.86, y: cy + hnY * bs * 5 + hdy * 0.86 }
    ], H * 0.034, P.biceps, { tension: 0.45, tendon: 0.1, alpha: 0.58, hi: 'rgba(255,205,190,0.55)' });
    AB.muscle(ctx, [
      { x: cx - hnX * bs * 7 + hdx * 0.06, y: cy - hnY * bs * 7 + hdy * 0.06 },
      { x: cx - hnX * bs * 7 + hdx * 0.48,  y: cy - hnY * bs * 7 + hdy * 0.48 },
      { x: cx - hnX * bs * 4 + hdx * 0.84, y: cy - hnY * bs * 4 + hdy * 0.84 }
    ], H * 0.03, P.triceps, { tension: 0.45, tendon: 0.1, alpha: 0.5, hi: 'rgba(255,215,165,0.55)' });
    AB.tendon(ctx, cx + hdx * .86, cy + hdy * .86, ux, uy, H * .008, { color:'rgba(240,230,210,.72)' });
    AB.tendon(ctx, cx - hnX * bs * 4 + hdx * .84, cy - hnY * bs * 4 + hdy * .84, ux, uy, H * .007, { color:'rgba(240,230,210,.62)' });
  }
  ctx.restore();

  // ── Huesos anatómicos ──
  ctx.save();
  ctx.globalAlpha = layerMode === 'muscles' ? .18 : 1;
  const d = 4.5;
  if (isLeg) {
    // Fémur: cabeza redonda + cóndilos
    AB.bone(ctx, cx, cy, ux, uy, 10.5, 9, { flare1: 1.5, flare2: 1.3, cap: 'rgba(163,92,0,0.85)' });
    ctx.save();
    const hg = ctx.createRadialGradient(cx, cy, 1, cx, cy, H * 0.04);
    hg.addColorStop(0, P.boneHi); hg.addColorStop(1, P.boneSh);
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(cx, cy, H * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P.boneStroke; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
    // Tibia (teal) + peroné (ámbar, no llega al tobillo)
    AB.bone(ctx, ux - px * d, uy - py * d, fx - px * d, fy - py * d, 4.5, 4,
      { taper: 0.2, flare1: 1.3, flare2: 1.15, cap: 'rgba(15,111,103,0.8)' });
    const fxF = ux + (fx - ux) * 0.88, fyF = uy + (fy - uy) * 0.88;
    AB.bone(ctx, ux + px * d, uy + py * d, fxF, fyF, 3, 2.8,
      { taper: 0.2, flare1: 1.2, flare2: 1.1, color: 'amber' });
  } else {
    // Húmero: cabeza esférica + cóndilos (cartílago teal)
    AB.bone(ctx, cx, cy, ux, uy, 11, 9, { flare1: 1.45, flare2: 1.3, cap: 'rgba(15,111,103,0.75)' });
    ctx.save();
    const hg = ctx.createRadialGradient(cx, cy, 1, cx, cy, H * 0.042);
    hg.addColorStop(0, P.boneHi); hg.addColorStop(1, P.boneSh);
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(cx, cy, H * 0.042, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P.boneStroke; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
    // Antebrazo: cúbito (gris) fijo + radio (teal) que rota cruzando
    const pivotVal = parseFloat(document.getElementById('glPivot').value);
    const pivotA = pivotVal * Math.PI / 180;
    const cosP = Math.cos(pivotA);
    const sinP = Math.sin(pivotA);
    const fx_r = fx + (px * cosP - udx * sinP * 0.25) * d;
    const fy_r = fy + (py * cosP - udy * sinP * 0.25) * d;
    AB.bone(ctx, ux - px * d, uy - py * d, fx - px * d, fy - py * d, 4, 3.8,
      { taper: 0.2, flare1: 1.25, flare2: 1.15, color: 'grey', cap: 'rgba(122,133,141,0.7)' });
    AB.bone(ctx, ux + px * d, uy + py * d, fx_r, fy_r, 4, 3.8,
      { taper: 0.2, flare1: 1.25, flare2: 1.15, cap: 'rgba(15,111,103,0.75)' });
  }
  ctx.restore();

  // ── Mano / pie anatómico ──
  ctx.save();
  ctx.globalAlpha = layerMode === 'skeleton' ? 0 : layerMode === 'muscles' ? .22 : 1;
  // AB.hand / AB.foot esperan el ángulo en convención atan2 (0 = +x, hacia la derecha;
  // positivo = sentido horario en canvas porque y crece hacia abajo). La dirección del
  // segmento en drawGL usa (sin a, cos a), cuya conversión a atan2 es π/2 − a.
  // Brazo: la mano continua el eje del antebrazo (π/2 − totalA), más la flexión de
  // muñeca (wristA) y la pronosupinación (pivotA) para que gire JUNTO con el antebrazo
  // y quede siempre anclada a él, sin el desfase de 90° que la apartaba del eje.
  const pivotA2 = parseFloat(document.getElementById('glPivot').value) * Math.PI / 180;
  const dirAng = isLeg
    ? Math.atan2(udy, udx)
    : (Math.PI / 2 - totalA + wristA + pivotA2);
  if (isLeg) {
    const ankleFlex = wristA;                     // flexión/dorsiflexión del tobillo
    const footAng = dirAng - Math.PI / 2 + ankleFlex; // perpendicular a la tibia, pivote en el tobillo
    AB.foot(ctx, fx, fy, footAng, foreLen * 0.78);
  } else {
    AB.hand(ctx, fx, fy, dirAng, handLen * 1.8, { fl: 0.45, thumbSign: 1 });
  }
  ctx.restore();

  // Rotulación anatómica de la capa estructural, separada de los nombres de GL.
  ctx.save();
  ctx.font = 'bold 9px JetBrains Mono, monospace'; ctx.textAlign = 'left';
  // Punto sobre el hueso -> línea guía -> texto (ancla cada etiqueta a su estructura)
  function leaderLabel(ax, ay, lx, ly, text, color, align) {
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ax, ay, 2.2, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lx, ly); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font = 'bold 9px JetBrains Mono, monospace'; ctx.fillStyle = color; ctx.textAlign = align;
    ctx.fillText(text, lx, ly + 3);
    ctx.restore();
  }
  if (isLeg) {
    const mfX=(cx+ux)/2, mfY=(cy+uy)/2;     // medio del fémur
    const mtX=(ux+fx)/2, mtY=(uy+fy)/2;     // medio de la tibia
    leaderLabel(mfX, mfY, Math.min(W-66, mfX+26), mfY, 'FÉMUR', 'rgba(67,80,92,.9)', 'left');
    leaderLabel(mtX, mtY, Math.min(W-66, mtX+26), mtY, 'TIBIA', 'rgba(67,80,92,.9)', 'left');
    if (layerMode !== 'skeleton') {
      leaderLabel(mfX, mfY, Math.max(12, mfX-26), mfY-2, 'CUÁDRICEPS', 'rgba(176,47,38,.9)', 'right');
      leaderLabel(mtX, mtY, Math.max(12, mtX-26), mtY, 'GEMELOS', 'rgba(192,104,30,.9)', 'right');
    }
  } else {
    const mhX=(cx+ux)/2, mhY=(cy+uy)/2;     // medio del húmero
    const mrX=(ux+fx)/2, mrY=(uy+fy)/2;     // medio del radio
    leaderLabel(mhX, mhY, Math.min(W-66, mhX+26), mhY, 'HÚMERO', 'rgba(67,80,92,.9)', 'left');
    leaderLabel(mrX, mrY, Math.min(W-66, mrX+26), mrY, 'RADIO', 'rgba(67,80,92,.9)', 'left');
    if (layerMode !== 'skeleton') {
      leaderLabel(mhX, mhY, Math.max(12, mhX-26), mhY-2, 'BÍCEPS', 'rgba(176,47,38,.9)', 'right');
      leaderLabel(mrX, mrY, Math.max(12, mrX-26), mrY, 'TRÍCEPS', 'rgba(192,104,30,.9)', 'right');
    }
  }
  ctx.restore();

  // 3. Draw Degrees of Freedom (GL) Visual Indicators
  // ── Joint 1: shoulder / hip (3D) ──
  function arrowHead(x, y, angle, color, size = 6) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size, size * .42); ctx.lineTo(-size, -size * .42); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  const offset = glAnimationActive ? (Date.now() / 150) % 20 : 0;
  const ring = Math.max(18, H * .042);
  // Ring 1 (X axis) - Red
  ctx.strokeStyle = 'rgba(176,35,24,0.75)';
  ctx.lineDashOffset = offset;
  ctx.beginPath(); ctx.arc(cx, cy, ring, -0.55, 1.65); ctx.stroke(); arrowHead(cx + Math.cos(1.65)*ring, cy + Math.sin(1.65)*ring, 1.65 + Math.PI/2, '#b02318');
  // Ring 2 (Y axis) - Green
  ctx.strokeStyle = 'rgba(46,139,87,0.75)';
  ctx.lineDashOffset = -offset * 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, ring + 8, 1.6, 4.0); ctx.stroke(); arrowHead(cx + Math.cos(4)* (ring+8), cy + Math.sin(4)*(ring+8), 4 - Math.PI/2, '#2e8b57');
  // Ring 3 (Z axis) - Cyan
  ctx.strokeStyle = 'rgba(13,110,100,0.82)';
  ctx.lineDashOffset = offset * 2;
  ctx.beginPath(); ctx.arc(cx, cy, ring + 16, -2.5, -.25); ctx.stroke(); arrowHead(cx + Math.cos(-.25)*(ring+16), cy + Math.sin(-.25)*(ring+16), -.25 + Math.PI/2, '#0d6e64');
  ctx.restore();

  // ── Joint 2: elbow / knee (1D) ──
  ctx.save();
  ctx.strokeStyle = 'rgba(15,111,103,0.8)'; ctx.lineWidth = 3;
  ctx.beginPath();
  // Draw small arc showing flexion angle
  ctx.arc(ux, uy, 18, shoulderA + Math.PI/2, totalA + Math.PI/2, totalA < shoulderA);
  ctx.stroke();
  arrowHead(ux + Math.cos(totalA + Math.PI/2)*18, uy + Math.sin(totalA + Math.PI/2)*18, totalA + Math.PI, '#0d6e64', 5);
  ctx.restore();

  // ── Joint 3: radioulnar pivot (1D) - only in arm mode ──
  if (glMode === 7) {
    ctx.save();
    ctx.strokeStyle = 'rgba(109,95,191,0.6)'; ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    // Draw rotation loop around the midpoint of forearm bones
    ctx.beginPath();
    ctx.ellipse(mx, my, 12, 6, totalA, 0, Math.PI*2);
    ctx.stroke();
    arrowHead(mx + Math.cos(totalA)*12, my + Math.sin(totalA)*6, totalA + Math.PI/2, '#6d5fbf', 5);
    // Small arrow head
    ctx.restore();
  }

  // ── Joint 4: wrist / ankle (2D) ──
  ctx.save();
  ctx.strokeStyle = 'rgba(163,92,0,0.6)'; ctx.lineWidth = 1.5;
  // Draw two crosshair arrows at the wrist showing 2 degrees of freedom
  const wristR = 12;
  const wdx = udx * wristR;
  const wdy = udy * wristR;
  const wpx = px * wristR;
  const wpy = py * wristR;
  // Axial arrow line
  ctx.beginPath();
  ctx.moveTo(fx - wdx, fy - wdy); ctx.lineTo(fx + wdx, fy + wdy);
  // Transversal arrow line
  ctx.moveTo(fx - wpx, fy - wpy); ctx.lineTo(fx + wpx, fy + wpy);
  ctx.stroke();
  arrowHead(fx + wdx, fy + wdy, Math.atan2(wdy,wdx), '#a35c00', 5);
  arrowHead(fx + wpx, fy + wpy, Math.atan2(wpy,wpx), '#a35c00', 5);
  ctx.restore();

  // 4. Draw Joint Nodes
   joint(cx, cy, isLeg ? 'Cadera · 3 GL' : 'Hombro · 3 GL', true, '#b02318');
   joint(ux, uy, isLeg ? 'Rodilla · 1 GL' : 'Codo · 1 GL', true, '#0f6f67');
   if (glMode === 7) {
     const pivotVal = parseFloat(document.getElementById('glPivot').value);
     joint(mx, my, `Pivote · 1 GL · ${pivotVal}°`, true, '#6d5fbf');
   }
   joint(fx, fy, isLeg ? 'Tobillo · 2 GL' : 'Muñeca · 2 GL', true, '#a35c00');

  if (W > 420 && H > 300) {
    const panelW = Math.min(190, W * .31), panelH = 126, panelX = W - panelW - 14, panelY = H - panelH - 15;
    ctx.save();
    ctx.fillStyle = 'rgba(251,248,240,.9)'; ctx.strokeStyle = 'rgba(207,195,169,.95)'; ctx.lineWidth = 1;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(panelX,panelY,panelW,panelH,8); else ctx.rect(panelX,panelY,panelW,panelH); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#43505c'; ctx.font = 'bold 9px JetBrains Mono, monospace'; ctx.textAlign = 'left'; ctx.fillText('EJES DE LIBERTAD',panelX+10,panelY+17);
    const rows = isLeg ? [
      ['#b02318','Cadera','3 GL · esferoidal'],['#0d6e64','Rodilla','1 GL · bisagra'],['#a35c00','Tobillo','2 GL · condílea']
    ] : [
      ['#b02318','Hombro','3 GL · esferoidal'],['#0d6e64','Codo','1 GL · bisagra'],['#6d5fbf','Pivote','1 GL · radiocubital'],['#a35c00','Muñeca','2 GL · condílea']
    ];
    rows.forEach((row,i)=>{
      const yy=panelY+35+i*21; ctx.fillStyle=row[0]; ctx.beginPath(); ctx.arc(panelX+14,yy-3,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#22303c'; ctx.font='bold 9px Karla, system-ui, sans-serif'; ctx.fillText(row[1],panelX+24,yy);
      ctx.fillStyle='#6b7885'; ctx.font='8px Karla, system-ui, sans-serif'; ctx.fillText(row[2],panelX+24,yy+10);
    });
    ctx.restore();
  }

   // 5. Text overlays (Top Left)
  ctx.fillStyle = '#0f6f67'; ctx.font = 'bold 15px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(glMode === 6 ? '3 + 1 + 2 = 6 GL' : '3 + 1 + 1 + 2 = 7 GL', 20, 30);
  ctx.fillStyle = '#5a6875'; ctx.font = '10px Karla, system-ui, sans-serif';
  ctx.fillText(glMode === 6 ? 'Esferoidal + Bisagra + Condílea' : 'Esferoidal + Bisagra + Pivote + Condílea', 20, 46);
  ctx.fillStyle = '#7a858d'; ctx.font = '8px Karla, system-ui, sans-serif';
  ctx.fillText(glMode === 6 ? '(Configuración anatómica estándar de la Pierna)' : '(Configuración anatómica estándar del Brazo)', 20, 58);

  // 6. Hover Tooltip or Help Text (Right side)
  const displayJoint = window.__selectedJoint || window.__hoveredJoint;
  if (displayJoint) {
    const jId = displayJoint;
    let jName = '', jGL = '', jDesc = '', jColor = '';
    if (jId === 'shoulder') {
      jName = glMode === 6 ? 'Articulación de la Cadera' : 'Articulación del Hombro';
      jGL = '3 GL · Esferoidea';
      jDesc = 'Permite libertad máxima en 3 dimensiones: flexión/extensión, abducción/aducción y rotación interna/externa.';
      jColor = '#b02318';
    } else if (jId === 'elbow') {
      jName = glMode === 6 ? 'Articulación de la Rodilla' : 'Articulación del Codo';
      jGL = '1 GL · Gínglimo (Bisagra)';
      jDesc = 'Limita el movimiento a un solo plano (flexión y extensión), actuando mecánicamente como una puerta.';
      jColor = '#0f6f67';
    } else if (jId === 'pivot') {
      jName = 'Pivote Radiocubital';
      jGL = '1 GL · Trocoide (Pivote)';
      jDesc = 'Grado de libertad extra en el antebrazo. El Radio rota sobre el Cúbito fijo, permitiendo pronación y supinación de la mano.';
      jColor = '#6d5fbf';
    } else if (jId === 'wrist') {
      jName = glMode === 6 ? 'Articulación del Tobillo' : 'Articulación de la Muñeca';
      jGL = '2 GL · Biaxial (Condílea)';
      jDesc = 'Combina movimientos en dos ejes perpendiculares: flexión/extensión y flexión lateral (abducción/aducción).';
      jColor = '#a35c00';
    }

    // Helper to wrap text in 2D context tooltips
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);
    }

    // Draw Tooltip Box
    ctx.save();
    const tx = W - 185, ty = window.__selectedJoint ? 58 : 15, tw = 165, th = 110;
    ctx.fillStyle = 'rgba(255,253,248,0.97)';
    ctx.strokeStyle = jColor; ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tx, ty, tw, th, 8); else ctx.rect(tx, ty, tw, th);
    ctx.fill(); ctx.stroke();

    // Draw Text
    ctx.fillStyle = '#22303c'; ctx.font = 'bold 10px Karla, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(jName, tx + 10, ty + 18);

    ctx.fillStyle = jColor; ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.fillText(jGL, tx + 10, ty + 31);

    ctx.fillStyle = '#5a6875'; ctx.font = '9px Karla, system-ui, sans-serif';
    wrapText(ctx, jDesc, tx + 10, ty + 46, tw - 20, 11);
    ctx.restore();
  } else {
    // Show instruction prompt
    ctx.fillStyle = 'rgba(107,120,133,0.55)'; ctx.font = 'italic 9px Karla, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('💡 Pasa el cursor sobre los nodos articulares para ver sus GL explicados', W - 15, 25);
  }
}

// ─── B2: ARTICULACIONES SINOVIALES ───
const JOINT_DATA = {
  hinge: { name: 'Bisagra', gl: '1D', desc: 'Flexión/extensión en un solo eje', emoji: '🚪', color: '#0f6f67' },
  pivot: { name: 'Pivote', gl: '1D', desc: 'Rotación axial (pronación/supinación)', emoji: '🔩', color: '#0d8577' },
  condylar: { name: 'Condílea', gl: '2D', desc: 'Flexión/extensión + abducción/aducción', emoji: '🥚', color: '#a35c00' },
  saddle: { name: 'Silla de montar', gl: '2D', desc: 'Biaxial, cóncavo-convexo', emoji: '🐪', color: '#c0681e' },
  plane: { name: 'Plana', gl: '2D', desc: 'Deslizamiento en dos ejes', emoji: '⬜', color: '#6d5fbf' },
  ball: { name: 'Esferoidal', gl: '3D', desc: 'Flexión/extensión, abd/aducción, rotación', emoji: '🏀', color: '#b02318' }
};
let currentJoint = 'hinge';

window.__jointVals = {
  hinge: [30],
  pivot: [0],
  condylar: [0, 0],
  saddle: [0, 0],
  plane: [0, 0],
  ball: [0, 0, 0]
};

let jointsAnimationActive = false;
let jointsAnimTime = 0;
let jointsRaf = null;

export function toggleJointsAnimation() {
  const btn = document.getElementById('btnAnimateJoints');
  if (!btn) return;
  jointsAnimationActive = !jointsAnimationActive;
  if (jointsAnimationActive) {
    btn.textContent = 'Pausar';
    btn.style.borderColor = 'var(--teal)';
    btn.style.color = 'var(--teal)';
    startJointsRaf();
  } else {
    btn.textContent = 'Animar';
    btn.style.borderColor = '';
    btn.style.color = '';
  }
}

export function startJointsRaf() {
  if (jointsRaf || !jointsAnimationActive) return;
  let _last = performance.now();
  function loop(now) {
    const canvas = document.getElementById('sim-joints');
    if (canvas && canvas.parentElement.offsetParent) {
      const dt = Math.min(0.1, (now - _last) / 1000); _last = now;
      const s1 = document.getElementById('jsVal1');
      const s2 = document.getElementById('jsVal2');
      const s3 = document.getElementById('jsVal3');
      // Slider enfocado (usuario arrastrando) manda: no amortiguar ese eje.
      const f1 = s1 && document.activeElement === s1;
      const f2 = s2 && document.activeElement === s2;
      const f3 = s3 && document.activeElement === s3;

      if (jointsAnimationActive) {
        jointsAnimTime += dt;
        const sinT = Math.sin(jointsAnimTime);
        const cosT = Math.cos(jointsAnimTime * 1.3);
        const sinT2 = Math.sin(jointsAnimTime * 1.7);

        let tgt = null;
        if (currentJoint === 'hinge') tgt = [72.5 + sinT * 72.5];
        else if (currentJoint === 'pivot') tgt = [sinT * 90];
        else if (currentJoint === 'condylar') tgt = [22.5 + sinT * 67.5, cosT * 30];
        else if (currentJoint === 'saddle') tgt = [sinT * 45, cosT * 30];
        else if (currentJoint === 'plane') tgt = [sinT * 20, cosT * 10];
        else if (currentJoint === 'ball') tgt = [sinT * 60, cosT * 60, sinT2 * 90];

        const vals = window.__jointVals[currentJoint];
        const focus = [f1, f2, f3];
        for (let i = 0; i < vals.length && i < tgt.length; i++) {
          if (!focus[i]) vals[i] = window.__damp(vals[i], tgt[i], 10, dt);
        }
        if (s1 && !f1) s1.value = vals[0];
        if (s2 && !f2 && vals.length > 1) s2.value = vals[1];
        if (s3 && !f3 && vals.length > 2) s3.value = vals[2];
      }

      drawJoints();
      jointsRaf = requestAnimationFrame(loop);
    } else {
      jointsRaf = null; _last = performance.now();
    }
  }
  jointsRaf = requestAnimationFrame(loop);
}

// Update joint values manually
function updateJointVal(type, index, value) {
  window.__jointVals[type][index] = parseFloat(value);
  drawJoints();
}

// Rebuild joint sliders based on type
function rebuildJointSliders(type) {
  const container = document.getElementById('jointSlidersContainer');
  if (!container) return;
  
  let html = '';
  if (type === 'hinge') {
    html = `<label style="font-size:0.6rem">Flexión: <input type="range" min="0" max="145" value="${window.__jointVals.hinge[0]}" id="jsVal1" oninput="updateJointVal('hinge', 0, this.value)" style="width:60px"></label>`;
  } else if (type === 'pivot') {
    html = `<label style="font-size:0.6rem">Rotación: <input type="range" min="-90" max="90" value="${window.__jointVals.pivot[0]}" id="jsVal1" oninput="updateJointVal('pivot', 0, this.value)" style="width:60px"></label>`;
  } else if (type === 'condylar') {
    html = `<label style="font-size:0.6rem">Flexión: <input type="range" min="-45" max="90" value="${window.__jointVals.condylar[0]}" id="jsVal1" oninput="updateJointVal('condylar', 0, this.value)" style="width:50px"></label>
            <label style="font-size:0.6rem">Desv.: <input type="range" min="-30" max="30" value="${window.__jointVals.condylar[1]}" id="jsVal2" oninput="updateJointVal('condylar', 1, this.value)" style="width:50px"></label>`;
  } else if (type === 'saddle') {
    html = `<label style="font-size:0.6rem">Eje 1: <input type="range" min="-45" max="45" value="${window.__jointVals.saddle[0]}" id="jsVal1" oninput="updateJointVal('saddle', 0, this.value)" style="width:50px"></label>
            <label style="font-size:0.6rem">Eje 2: <input type="range" min="-30" max="30" value="${window.__jointVals.saddle[1]}" id="jsVal2" oninput="updateJointVal('saddle', 1, this.value)" style="width:50px"></label>`;
  } else if (type === 'plane') {
    html = `<label style="font-size:0.6rem">Despl. X: <input type="range" min="-20" max="20" value="${window.__jointVals.plane[0]}" id="jsVal1" oninput="updateJointVal('plane', 0, this.value)" style="width:50px"></label>
            <label style="font-size:0.6rem">Despl. Y: <input type="range" min="-10" max="10" value="${window.__jointVals.plane[1]}" id="jsVal2" oninput="updateJointVal('plane', 1, this.value)" style="width:50px"></label>`;
  } else if (type === 'ball') {
    html = `<label style="font-size:0.6rem">Inclin.: <input type="range" min="-60" max="60" value="${window.__jointVals.ball[0]}" id="jsVal1" oninput="updateJointVal('ball', 0, this.value)" style="width:45px"></label>
            <label style="font-size:0.6rem">Desv.: <input type="range" min="-60" max="60" value="${window.__jointVals.ball[1]}" id="jsVal2" oninput="updateJointVal('ball', 1, this.value)" style="width:45px"></label>
            <label style="font-size:0.6rem">Giro: <input type="range" min="-90" max="90" value="${window.__jointVals.ball[2]}" id="jsVal3" oninput="updateJointVal('ball', 2, this.value)" style="width:45px"></label>`;
  }
  container.innerHTML = html;
}

export function drawJoints() {
  const canvas = document.getElementById('sim-joints');
  if (!canvas || !canvas.parentElement.offsetParent) return;
  const __f = window.fitCanvas(canvas);
  const ctx = __f.ctx;
  const W = __f.W, H = __f.H;
  const jointMeta = JOINT_DATA[currentJoint];
  window.__stage('sim-joints','ARTICULACIÓN',jointMeta.name+' · '+jointMeta.gl,'teal','anatomy');
  ctx.clearRect(0, 0, W, H);

  // Fondo "papel marfil" (estilo B1) — claro, no vitrina oscura
  const bg = ctx.createRadialGradient(W/2, H/2 - 5, 30, W/2, H/2 - 5, Math.max(W,H)*0.75);
  bg.addColorStop(0, '#fbf8f0'); bg.addColorStop(1, '#ece4d2');
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
  // Rejilla sutil sobre el papel marfil
  ctx.strokeStyle = 'rgba(35,44,54,0.06)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 25) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  const j = JOINT_DATA[currentJoint];
  const cx = W/2, cy = H/2 - 5;

  // ── Paleta de HUESO marfil MATE (no metálico) sobre fondo oscuro ──
  const B_HI  = '#efe7d3';   // marfil claro (luz)
  const B_MID = '#cabf9f';   // cuerpo hueso (beige terroso)
  const B_SH  = '#9a8c6a';   // sombreado
  const B_DK  = '#5f543a';   // núcleo (marrón terroso, no negro)
  const B_EDGE = '#3a3120';  // contorno

  const skinFill  = 'rgba(214,158,118,0.16)';
  const skinEdge  = 'rgba(232,196,159,0.55)';
  const muscleT   = 'rgba(190,72,56,0.10)';
  const muscleT2  = 'rgba(206,120,40,0.09)';

  function mass(x, y, rx, ry, rot, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  ctx.textAlign = 'center';
  function jointTag(x, y, text, opt) {
    opt = opt || {};
    const fs = opt.fs || 10;
    ctx.font = 'bold ' + fs + 'px Karla, system-ui, sans-serif';
    const w = Math.max(44, ctx.measureText(text).width + 14);
    const lx = Math.max(6, Math.min(W - w - 6, x - w / 2));
    const ly = y - 9;
    ctx.fillStyle = opt.bg || 'rgba(251,248,240,0.94)';
    ctx.strokeStyle = opt.edge || 'rgba(15,111,103,0.85)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(lx, ly, w, 18, 5); else ctx.rect(lx, ly, w, 18);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = opt.fg || '#2b3742';
    ctx.textAlign = 'center';
    ctx.fillText(text, lx + w / 2, ly + 13);
  }

  let subLabel = '';

  // ── Hueso largo ANATÓMICO: diáfisis ahusada + epífisis ensanchadas (metáfisis) + textura ósea ──
  function boneVol(ctx, x1, y1, x2, y2, r1, r2, opts) {
    opts = opts || {};
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, px = -uy, py = ux;
    const f1 = opts.flare1 != null ? opts.flare1 : 1.5;   // ensanche epífisis proximal
    const f2 = opts.flare2 != null ? opts.flare2 : 1.5;   // ensanche epífisis distal
    const taper = opts.taper != null ? opts.taper : 0.32;  // cuánto se ahusa la diáfisis
    // sombra de contacto
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.beginPath();
    ctx.moveTo(x1 + px*r1*f1 + 3, y1 + py*r1*f1 + 5);
    ctx.quadraticCurveTo((x1+x2)/2 + px*(r1+r2)*0.5*1.2 + 3, (y1+y2)/2 + py*(r1+r2)*0.5*1.2 + 5, x2 + px*r2*f2 + 3, y2 + py*r2*f2 + 5);
    ctx.lineTo(x2 - px*r2*f2 + 3, y2 - py*r2*f2 + 5);
    ctx.quadraticCurveTo((x1+x2)/2 - px*(r1+r2)*0.5*1.2 + 3, (y1+y2)/2 - py*(r1+r2)*0.5*1.2 + 5, x1 - px*r1*f1 + 3, y1 - py*r1*f1 + 5);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // cuerpo del hueso (forma de huso: ancho en epífisis, estrecho en diáfisis)
    function bonePath() {
      ctx.beginPath();
      ctx.moveTo(x1 + px*r1*f1, y1 + py*r1*f1);
      ctx.bezierCurveTo(x1 + px*r1*0.5 + ux*len*taper, y1 + py*r1*0.5 + uy*len*taper,
                        x2 + px*r2*0.5 - ux*len*taper, y2 + py*r2*0.5 - uy*len*taper,
                        x2 + px*r2*f2, y2 + py*r2*f2);
      ctx.arc(x2, y2, r2*f2, Math.atan2(py, px), Math.atan2(-py, -px), false);
      ctx.lineTo(x2 - px*r2*f2, y2 - py*r2*f2);
      ctx.bezierCurveTo(x2 - px*r2*0.5 - ux*len*taper, y2 - py*r2*0.5 - uy*len*taper,
                        x1 - px*r1*0.5 + ux*len*taper, y1 - py*r1*0.5 + uy*len*taper,
                        x1 - px*r1*f1, y1 - py*r1*f1);
      ctx.arc(x1, y1, r1*f1, Math.atan2(-py, -px), Math.atan2(py, px), false);
      ctx.closePath();
    }
    // sombreado MATTE direccional (luz arriba-izquierda, sombra abajo-derecha, SIN brillo espejo):
    // usa el eje perpendicular para un degradado fuerte de un solo lado
    const g = ctx.createLinearGradient(x1 + px*r1, y1 + py*r1, x1 - px*r1, y1 - py*r1);
    g.addColorStop(0, B_HI); g.addColorStop(0.5, B_MID); g.addColorStop(1, B_DK);
    ctx.fillStyle = opts.fill || g;
    ctx.strokeStyle = opts.edge || B_EDGE; ctx.lineWidth = opts.lw || 1.6;
    bonePath(); ctx.fill(); ctx.stroke();
    // textura ósea: porosidad densa + líneas de tensión tenues + SURCOS irregulares (rompe uniformidad)
    ctx.save();
    ctx.clip();
    const steps = Math.max(6, Math.floor(len / 6));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const mx = x1 + (x2 - x1) * t, my = y1 + (y2 - y1) * t;
      const wr = (r1 + (r2 - r1) * t) * (1 - taper * 0.6);
      ctx.strokeStyle = 'rgba(60,52,34,0.16)'; ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(mx + px*wr*0.5, my + py*wr*0.5);
      ctx.lineTo(mx - px*wr*0.5, my - py*wr*0.5);
      ctx.stroke();
      ctx.fillStyle = (s % 2 === 0) ? 'rgba(50,40,22,0.22)' : 'rgba(245,238,215,0.14)';
      ctx.beginPath(); ctx.arc(mx + px*(Math.random()-0.5)*wr, my + py*(Math.random()-0.5)*wr, 0.9, 0, Math.PI*2); ctx.fill();
    }
    // surcos longitudinales irregulares (líneas curvas tenues a lo largo de la diáfisis)
    ctx.strokeStyle = 'rgba(70,60,40,0.12)'; ctx.lineWidth = 0.6;
    for (let k = 0; k < 3; k++) {
      const off = (k - 1) * 0.4;
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const mx = x1 + (x2 - x1) * t, my = y1 + (y2 - y1) * t;
        const wr = (r1 + (r2 - r1) * t) * (1 - taper * 0.6);
        const jitter = Math.sin(t*9 + k*2) * 0.15;
        const px2 = mx + px*(wr*off + jitter*wr), py2 = my + py*(wr*off + jitter*wr);
        if (s === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
      }
      ctx.stroke();
    }
    ctx.restore();
    // highlight MATTE muy tenue (casi imperceptible, sin brillo metálico)
    ctx.save(); ctx.strokeStyle = 'rgba(255,250,235,0.12)'; ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(x1 + px*r1*f1*0.6, y1 + py*r1*f1*0.6);
    ctx.quadraticCurveTo((x1+x2)/2 + px*(r1+r2)*0.25, (y1+y2)/2 + py*(r1+r2)*0.25, x2 + px*r2*f2*0.6, y2 + py*r2*f2*0.6);
    ctx.stroke(); ctx.restore();
  }
  // Epífisis/cabeza ósea: brillo + núcleo oscuro + textura de poros + borde irregular
  function head3d(ctx, x, y, r, opt) {
    opt = opt || {};
    const g = ctx.createRadialGradient(x - r*0.38, y - r*0.38, r*0.05, x, y, r);
    g.addColorStop(0, B_HI); g.addColorStop(0.42, opt.mid || B_MID);
    g.addColorStop(0.85, B_SH); g.addColorStop(1, B_DK);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    // textura de poros (más densa para look óseo mate)
    ctx.save(); ctx.clip();
    for (let i = 0; i < 16; i++) {
      const a = Math.random()*Math.PI*2, rr = Math.random()*r*0.88;
      ctx.fillStyle = (i%2===0) ? 'rgba(50,40,22,0.20)' : 'rgba(245,238,215,0.12)';
      ctx.beginPath(); ctx.arc(x + Math.cos(a)*rr, y + Math.sin(a)*rr, 0.8, 0, Math.PI*2); ctx.fill();
    }
    // surco tenue
    ctx.strokeStyle = 'rgba(70,60,40,0.14)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.ellipse(x, y, r*0.5, r*0.7, 0.4, 0.2, Math.PI*1.4); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = opt.edge || B_EDGE; ctx.lineWidth = opt.lw || 1.6; ctx.stroke();
    ctx.save();
    ctx.fillStyle = 'rgba(255,250,235,0.22)';
    ctx.beginPath(); ctx.ellipse(x - r*0.34, y - r*0.36, r*0.26, r*0.15, -0.6, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function cart(ctx, x, y, a, opt) {
    opt = opt || {};
    ctx.save(); ctx.strokeStyle = opt.c || '#0f6f67'; ctx.lineWidth = opt.w || 4;
    if (opt.glow) { ctx.shadowColor = opt.c; ctx.shadowBlur = opt.glow; }
    ctx.beginPath(); ctx.arc(x, y, opt.r || 16, a[0], a[1]); ctx.stroke(); ctx.restore();
  }
  // Textura ósea genérica: porosidad + surcos sobre el path ya dibujado (clip activo por caller)
  function boneTex(opts) {
    opts = opts || {};
    const cx = opts.cx, cy = opts.cy, rx = opts.rx || 10, ry = opts.ry || rx, seed = opts.seed || 1;
    let s = seed * 9301 + 49297;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    // porosidad
    for (let i = 0; i < (opts.pores || 14); i++) {
      const a = rnd()*Math.PI*2, rr = rnd();
      const px = cx + Math.cos(a)*rx*rr*0.92, py = cy + Math.sin(a)*ry*0*rr*0.92 + Math.sin(a)*ry*rr*0.92;
      ctx.fillStyle = (i % 2 === 0) ? 'rgba(50,40,22,0.20)' : 'rgba(245,238,215,0.13)';
      ctx.beginPath(); ctx.arc(px, py, 0.9, 0, Math.PI*2); ctx.fill();
    }
    // surcos irregulares tenues
    ctx.strokeStyle = 'rgba(70,60,40,0.12)'; ctx.lineWidth = 0.6;
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      for (let t = -1; t <= 1; t += 0.1) {
        const off = (k - 0.5) * 0.5 + Math.sin(t*7 + seed)*0.12;
        const px = cx + off*rx, py = cy + t*ry*0.85;
        if (t === -1) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  if (currentJoint === 'hinge') {
    // Bisagra (1D) -> Codo Húmero-Cubital (Gínglimo) · fidelidad tipo B1
    subLabel = 'Codo Húmero-Cubital (Gínglimo)';
    const angle = window.__jointVals.hinge[0] * Math.PI / 180;
    const ax = Math.sin(angle), ay = Math.cos(angle);   // dirección del antebrazo
    const nx = -ay, ny = ax;                            // normal al antebrazo
    const jx = cx, jy2 = cy + 6;                        // centro de rotación (tróclea)
    const HUMLEN = H * 0.30, FORELEN = H * 0.27;
    const sh = { x: jx, y: jy2 - HUMLEN };              // hombro (proximal húmero)
    const el = { x: jx, y: jy2 };                       // codo (eje)
    const wpx = { x: jx + ax * FORELEN, y: jy2 + ay * FORELEN }; // muñeca (distal antebrazo)
    const hdx = el.x - sh.x, hdy = el.y - sh.y, hL = Math.hypot(hdx, hdy) || 1;
    const hnX = -hdy / hL, hnY = hdx / hL;

    const P = AB.PAL;

    // 1) Masa articular proximal (deltoides)
    ctx.save();
    ctx.globalAlpha = 0.95;
    AB.jointMass(ctx, sh.x, sh.y + H*0.02, H * 0.05, H * 0.06, 0.35,
      { fill: 'rgba(222,180,142,0.32)', edge: 'rgba(194,146,108,0.5)' });
    ctx.restore();

    // 2) Envoltura de piel
    ctx.save();
    ctx.globalAlpha = 0.20;
    AB.limbSkin(ctx, [sh, el, wpx], [H * 0.05, H * 0.045, H * 0.03],
      { fill: 'rgba(214,158,118,0.18)', edge: 'rgba(140,96,60,0.9)', lw: 1.8 });
    ctx.restore();

    // 3) Músculos: bíceps (flexor) y tríceps (extensor) en el húmero
    ctx.save();
    ctx.globalAlpha = 0.6;
    AB.muscle(ctx, [
      { x: sh.x + hnX * 8 + hdx * 0.08, y: sh.y + hnY * 8 + hdy * 0.08 },
      { x: sh.x + hnX * 9 + hdx * 0.48, y: sh.y + hnY * 9 + hdy * 0.48 },
      { x: sh.x + hnX * 6 + hdx * 0.86, y: sh.y + hnY * 6 + hdy * 0.86 }
    ], H * 0.034, P.biceps, { tension: 0.45, tendon: 0.1, alpha: 0.58, hi: 'rgba(255,205,190,0.5)' });
    AB.muscle(ctx, [
      { x: sh.x - hnX * 8 + hdx * 0.06, y: sh.y - hnY * 8 + hdy * 0.06 },
      { x: sh.x - hnX * 8 + hdx * 0.48, y: sh.y - hnY * 8 + hdy * 0.48 },
      { x: sh.x - hnX * 5 + hdx * 0.84, y: sh.y - hnY * 5 + hdy * 0.84 }
    ], H * 0.03, P.triceps, { tension: 0.45, tendon: 0.1, alpha: 0.5, hi: 'rgba(255,215,165,0.5)' });
    ctx.restore();

    // 4) HÚMERO: diáfisis + epífisis distal (tróclea + capítulo)
    AB.bone(ctx, sh.x, sh.y, el.x, el.y, 9, 11, { flare1: 1.4, flare2: 1.7, cap: 'rgba(15,111,103,0.7)' });
    ctx.save();
    const tro = ctx.createLinearGradient(el.x - 16, el.y, el.x + 16, el.y);
    tro.addColorStop(0, B_HI); tro.addColorStop(0.5, B_MID); tro.addColorStop(1, B_SH);
    ctx.fillStyle = tro; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(el.x, el.y, 15, 10, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = B_DK; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(el.x - 2, el.y - 9); ctx.lineTo(el.x - 2, el.y + 9); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = B_SH; ctx.beginPath(); ctx.ellipse(el.x + 14, el.y - 1, 5, 6, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();

    // 5) ANTEBRAZO: cúbito (olécranon+coronoides+escotadura troclear) + radio
    const d = 9;
    const u0 = { x: el.x - nx*d, y: el.y - ny*d };
    const u1 = { x: wpx.x - nx*d, y: wpx.y - ny*d };
    ctx.save();
    const ucap = ctx.createLinearGradient(u0.x - 10, u0.y - 10, u0.x + 10, u0.y + 10);
    ucap.addColorStop(0, B_HI); ucap.addColorStop(0.5, B_MID); ucap.addColorStop(1, B_SH);
    ctx.fillStyle = ucap; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(u0.x - nx*4 + ax*2, u0.y - ny*4 + ay*2);
    ctx.quadraticCurveTo(u0.x - nx*16, u0.y - ny*16, u0.x - nx*15 + ax*10, u0.y - ny*15 + ay*10);
    ctx.quadraticCurveTo(u0.x - nx*4 + ax*16, u0.y - ny*4 + ay*16, u0.x + nx*2 + ax*14, u0.y + ny*2 + ay*14);
    ctx.quadraticCurveTo(u0.x + nx*10 + ax*4, u0.y + ny*10 + ay*4, u0.x + nx*4, u0.y + ny*4);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    AB.bone(ctx, u0.x - nx*2, u0.y - ny*2, u1.x, u1.y, 8, 6, { flare1: 1.3, flare2: 1.15 });
    head3d(ctx, u1.x, u1.y, 4);

    const r0 = { x: el.x + nx*d, y: el.y + ny*d };
    const r1 = { x: wpx.x + nx*d, y: wpx.y + ny*d };
    AB.bone(ctx, r0.x + nx*2, r0.y + ny*2, r1.x, r1.y, 6, 5, { flare1: 1.2, flare2: 1.1 });
    head3d(ctx, r0.x + nx*2, r0.y + ny*2, 6);
    boneVol(ctx, r0.x + nx*2, r0.y + ny*2, r0.x + nx*9, r0.y + ny*9, 5, 5.5);
    ctx.save(); ctx.fillStyle = B_SH; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.arc(r0.x + nx*9, r0.y + ny*9, 2.4, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore();
    head3d(ctx, r1.x, r1.y, 4);

    // 6) Eje + arco ROM
    cart(ctx, jx, jy2, [Math.PI/2 + 0.15, Math.PI/2 + angle - 0.15], { r: 22, c: '#0f6f67', w: 4 });
    ctx.fillStyle = '#d9cfb8'; ctx.beginPath(); ctx.arc(jx, jy2, 5.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3a3120'; ctx.beginPath(); ctx.arc(jx, jy2, 2.2, 0, Math.PI*2); ctx.fill();

    // 7) Etiquetas
    jointTag(sh.x - 44, sh.y + H*0.02, 'HÚMERO');
    jointTag(u1.x - nx*10 - 30, u1.y + ny*8 + 6, 'CÚBITO');
    jointTag(r1.x + nx*6 + 18, r1.y + ny*2 + 6, 'RADIO');
  } else if (currentJoint === 'pivot') {
    // 🔩 Pivote (1D) -> Radiocubital Proximal
    subLabel = 'Articulación Radiocubital Proximal (Trocoide)';
    const val = window.__jointVals.pivot[0];
    const angle = val * Math.PI / 180;
    const rx0 = cx + 30, ryA = cy - 50;
    mass(cx - 8, cy + 5, 13, 40, 0.12, muscleT);
    mass(cx + 26, cy + 10, 12, 38, -0.1, muscleT2);

    // Eje longitudinal de rotación (reforzado)
    ctx.save();
    ctx.strokeStyle = 'rgba(35,44,54,0.45)'; ctx.lineWidth = 1.6; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(rx0, ryA - 14); ctx.lineTo(rx0, cy + 58); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(35,44,54,0.7)';
    ctx.beginPath(); ctx.moveTo(rx0, ryA - 22); ctx.lineTo(rx0 - 4, ryA - 14); ctx.lineTo(rx0 + 4, ryA - 14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(rx0, cy + 64); ctx.lineTo(rx0 - 4, cy + 56); ctx.lineTo(rx0 + 4, cy + 56); ctx.closePath(); ctx.fill();
    ctx.restore();

    // Cúbito fijo + coronoides + escotadura radial
    boneVol(ctx, cx - 16, cy - 58, cx - 16, cy + 60, 9, 9);
    ctx.save();
    ctx.fillStyle = B_MID; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 58);
    ctx.quadraticCurveTo(cx + 4, cy - 60, cx - 2, cy - 44);
    ctx.quadraticCurveTo(cx - 12, cy - 48, cx - 16, cy - 50);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx + 6, ryA, 19, Math.PI*0.12, Math.PI*0.88); ctx.stroke(); ctx.restore();

    // Radio móvil: diáfisis + cuello + cabeza discoidea + tuberosidad
    boneVol(ctx, rx0 - 2, cy - 44, rx0 - 4, cy + 55, 7, 7);
    boneVol(ctx, rx0, ryA - 6, rx0 - 2, cy - 44, 4, 7);
    ctx.save();
    const hg = ctx.createRadialGradient(rx0 - 4, ryA - 3, 2, rx0, ryA, 13);
    hg.addColorStop(0, B_HI); hg.addColorStop(0.6, B_MID); hg.addColorStop(1, B_SH);
    ctx.fillStyle = hg; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(rx0, ryA, 13, 7.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
    cart(ctx, rx0, ryA, [Math.PI*1.15, Math.PI*1.85], { r: 11, c: '#0f6f67', w: 2.5 });
    head3d(ctx, rx0 - 3, cy - 30, 5);

    // Ligamento anular
    ctx.save();
    ctx.strokeStyle = '#8b7bd6'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(cx + 8, ryA, 27, 13, 0, Math.PI*1.05, Math.PI*2.05); ctx.stroke();
    ctx.restore();

    const lx = rx0 + Math.sin(angle) * 11;
    ctx.strokeStyle = '#cdd6df'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(lx, ryA); ctx.lineTo(lx, cy + 55); ctx.stroke();
    ctx.strokeStyle = 'rgba(25,194,168,0.9)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(rx0, ryA - 18, 22, 7, 0, 0, Math.PI*2); ctx.stroke();
    const arrowX = rx0 + Math.sin(angle + 0.3) * 22, arrowY = ryA - 18 + Math.cos(angle + 0.3) * 7;
    ctx.fillStyle = 'rgba(25,194,168,0.95)'; ctx.beginPath(); ctx.arc(arrowX, arrowY, 3.2, 0, Math.PI*2); ctx.fill();

    jointTag(cx - 30, cy + 24, 'CÚBITO');
    jointTag(rx0 + 22, cy - 28, 'RADIO');
    jointTag(cx + 6, ryA - 30, 'LIG. ANULAR');

  } else if (currentJoint === 'condylar') {
    // 🥚 Condílea (2D) -> Muñeca Radiocarpiana
    subLabel = 'Muñeca Radiocarpiana (Elipsoidea)';
    const flex = window.__jointVals.condylar[0] * Math.PI / 180;
    const dev = window.__jointVals.condylar[1] * Math.PI / 180;
    const hx = cx + Math.sin(dev) * 12;
    const hy = cy - 6 + Math.sin(flex) * 5;
    const bx = cx + Math.sin(dev) * 60;
    const by = cy + Math.cos(flex) * Math.cos(dev) * 52;
    mass(cx, cy - 30, 14, 26, 0, muscleT);

    // Radio distal: cara carpiana cóncava + estiloides
    boneVol(ctx, cx, cy - 72, cx, cy - 14, 11, 14);
    ctx.save();
    ctx.fillStyle = B_MID; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx + 16, cy - 12, 4.5, 7, 0.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
    cart(ctx, cx, cy - 12, [Math.PI, 0], { r: 20, c: '#e0a23a', w: 4, glow: 8 });

    // 8 carpianos en 2 hileras BIEN SEPARADAS (proximal arriba, distal abajo) con huecos visibles
    const prox = [ { dx:-32, dy:-15, rx:8.5, ry:7, name:'escafoides' },
                   { dx:-11, dy:-16, rx:8.5, ry:7.5, name:'semilunar' },
                   { dx:10, dy:-15, rx:7.5, ry:6.5, name:'piramidal' },
                   { dx:26, dy:-8, rx:5.5, ry:5, name:'pisiforme' } ];
    const dist = [ { dx:-30, dy:8, rx:7.5, ry:6.5, name:'trapecio' },
                   { dx:-10, dy:9, rx:7, ry:6, name:'trapezoide' },
                   { dx:11, dy:8, rx:8.5, ry:7, name:'capitato' },
                   { dx:28, dy:9, rx:7, ry:6, name:'ganchoso' } ];
    function drawCarp(c) {
      ctx.save();
      const cg = ctx.createRadialGradient(hx+c.dx-2, hy+c.dy-2, 1, hx+c.dx, hy+c.dy, Math.max(c.rx,c.ry));
      cg.addColorStop(0, B_HI); cg.addColorStop(0.5, B_MID); cg.addColorStop(1, B_SH);
      ctx.fillStyle = cg; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(hx+c.dx, hy+c.dy, c.rx, c.ry, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,248,225,0.5)';
      ctx.beginPath(); ctx.ellipse(hx+c.dx-c.rx*0.3, hy+c.dy-c.ry*0.35, c.rx*0.28, c.ry*0.2, -0.5, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    prox.forEach(c => drawCarp(c));
    dist.forEach(c => drawCarp(c));
    // Línea tenue que marca las 2 filas (proximal/distal)
    ctx.strokeStyle = 'rgba(240,200,150,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(hx - 40, hy - 3); ctx.lineTo(hx + 40, hy - 3); ctx.stroke();
    cart(ctx, hx, hy + 2, [Math.PI + dev, 0 + dev], { r: 18, c: '#e0a23a', w: 3, glow: 6 });

    // 5 metacarpianos INDIVIDUALES, abanico con separación y grosor
    for (let i = 0; i < 5; i++) {
      const off = (i - 2) * 15;
      const ang = (i - 2) * 0.10;            // abanico: cada uno gira levemente
      const ux = Math.sin(ang), uy = Math.cos(ang);
      const mx = hx + off, my = hy + 26;
      const tx = bx + off * 0.8 + ux*52, ty = by + 4 + uy*52*0.15;
      boneVol(ctx, mx, my, tx, ty, 4.8, 3.8);
      head3d(ctx, tx, ty, 3.4);
    }

    jointTag(cx - 22, cy - 46, 'RADIO');
    jointTag(hx + 30, hy - 16, 'CARPALES (8)');
    jointTag(bx + 32, by - 2, 'METACARPIANOS (5)');

  } else if (currentJoint === 'saddle') {
    // 🐪 Silla de montar (2D) -> Pulgar (Carpometacarpiana)
    subLabel = 'Pulgar Carpometacarpiana (Silla de Montar)';
    const sx = window.__jointVals.saddle[0] * 0.45;
    const sy = window.__jointVals.saddle[1] * Math.PI / 180;
    mass(cx - 6, cy + 30, 22, 16, 0.3, muscleT);

    // Trapecio (fijo): superficie en silla
    ctx.save();
    const tg2 = ctx.createLinearGradient(cx - 18, cy + 62, cx + 18, cy + 16);
    tg2.addColorStop(0, B_MID); tg2.addColorStop(0.5, B_SH); tg2.addColorStop(1, B_DK);
    ctx.fillStyle = tg2; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 62); ctx.lineTo(cx - 16, cy + 26);
    ctx.quadraticCurveTo(cx - 10, cy + 14, cx - 2, cy + 18);
    ctx.quadraticCurveTo(cx + 6, cy + 8, cx + 14, cy + 16);
    ctx.quadraticCurveTo(cx + 20, cy + 24, cx + 18, cy + 62);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // textura ósea del trapecio
    ctx.save(); ctx.clip(); boneTex({cx: cx, cy: cy+34, rx: 17, ry: 24, seed: 7, pores: 16}); ctx.restore();
    ctx.restore();
    cart(ctx, cx, cy + 16, [Math.PI*0.9, Math.PI*2.1], { r: 14, c: '#e0a23a', w: 4, glow: 8 });
    ctx.strokeStyle = '#e0a23a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 12, cy + 20); ctx.quadraticCurveTo(cx, cy + 10, cx + 12, cy + 20); ctx.stroke();

    // 1er Metacarpiano (móvil) con base en silla
    ctx.save();
    ctx.translate(cx + sx, cy - 4); ctx.rotate(sy);
    boneVol(ctx, 0, 0, 0, -56, 11, 6);
    ctx.save();
    const mg = ctx.createRadialGradient(-4, -8, 1, 0, -7, 16);
    mg.addColorStop(0, B_HI); mg.addColorStop(0.5, B_MID); mg.addColorStop(1, B_SH);
    ctx.fillStyle = mg; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-16, -2); ctx.quadraticCurveTo(0, -14, 16, -2);
    ctx.quadraticCurveTo(6, 4, 0, 0); ctx.quadraticCurveTo(-6, 4, -16, -2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); boneTex({cx: 0, cy: -4, rx: 15, ry: 9, seed: 9, pores: 14}); ctx.restore();
    ctx.restore();
    cart(ctx, 0, -7, [Math.PI, 0], { r: 14, c: '#e0a23a', w: 3, glow: 6 });
    ctx.restore();

    jointTag(cx - 60, cy + 42, 'TRAPECIO');
    jointTag(cx + sx + 46, cy - 34, '1er METACARPIANO');

  } else if (currentJoint === 'plane') {
    // ⬜ Plana (2D) -> Acromioclavicular
    subLabel = 'Hombro Acromioclavicular (Plana)';
    const dx = window.__jointVals.plane[0];
    const dy = window.__jointVals.plane[1];
    mass(cx - 20, cy + 10, 26, 20, 0.4, muscleT);

    // Acromion (repisa ósea con GROSOR/volumen, no lámina plana)
    ctx.save();
    const ag = ctx.createLinearGradient(cx - 78, cy - 10, cx - 14, cy + 12);
    ag.addColorStop(0, B_HI); ag.addColorStop(0.45, B_MID); ag.addColorStop(0.85, B_SH); ag.addColorStop(1, B_DK);
    ctx.fillStyle = ag; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 78, cy - 10);
    ctx.quadraticCurveTo(cx - 70, cy - 22, cx - 50, cy - 20);
    ctx.lineTo(cx - 20, cy - 18);
    ctx.lineTo(cx - 16, cy + 2);
    ctx.lineTo(cx - 30, cy + 4);
    ctx.quadraticCurveTo(cx - 50, cy + 8, cx - 64, cy + 14);
    ctx.quadraticCurveTo(cx - 74, cy + 16, cx - 78, cy + 10);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); boneTex({cx: cx-46, cy: cy-4, rx: 30, ry: 16, seed: 3, pores: 18}); ctx.restore();
    ctx.restore();
    cart(ctx, cx - 16, cy - 4, [Math.PI*1.15, Math.PI*1.95], { r: 18, c: '#8b7bd6', w: 4, glow: 6 });

    // Clavícula en S con volumen
    ctx.save();
    const cg = ctx.createLinearGradient(cx + 8 + dx, cy + dy - 12, cx + 72 + dx, cy + dy + 14);
    cg.addColorStop(0, B_SH); cg.addColorStop(0.4, B_MID); cg.addColorStop(0.7, B_HI); cg.addColorStop(1, B_SH);
    ctx.fillStyle = cg; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + 72 + dx, cy + dy - 12);
    ctx.bezierCurveTo(cx + 50 + dx, cy + dy - 18, cx + 30 + dx, cy + dy - 4, cx + 14 + dx, cy + dy - 2);
    ctx.quadraticCurveTo(cx + 4 + dx, cy + dy - 1, cx + 6 + dx, cy + dy + 6);
    ctx.lineTo(cx + 10 + dx, cy + dy + 12);
    ctx.bezierCurveTo(cx + 30 + dx, cy + dy + 6, cx + 50 + dx, cy + dy + 18, cx + 72 + dx, cy + dy + 14);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); boneTex({cx: cx+40+dx, cy: cy+dy+2, rx: 30, ry: 11, seed: 5, pores: 18}); ctx.restore();
    ctx.restore();
    head3d(ctx, cx + 12 + dx, cy + dy + 8, 3);
    cart(ctx, cx + 12 + dx, cy + dy + 1, [Math.PI*0.15, Math.PI*0.85], { r: 16, c: '#8b7bd6', w: 3, glow: 5 });

    // Fragmento de escápula
    ctx.save();
    const sg = ctx.createLinearGradient(cx - 66, cy + 12, cx - 10, cy + 24);
    sg.addColorStop(0, B_MID); sg.addColorStop(1, B_SH);
    ctx.fillStyle = sg; ctx.strokeStyle = B_EDGE; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 66, cy + 12);
    ctx.quadraticCurveTo(cx - 38, cy + 26, cx - 10, cy + 20);
    ctx.quadraticCurveTo(cx - 36, cy + 34, cx - 66, cy + 24);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); boneTex({cx: cx-38, cy: cy+22, rx: 28, ry: 8, seed: 6, pores: 14}); ctx.restore();
    ctx.restore();

    ctx.strokeStyle = 'rgba(139,123,214,0.6)'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 72, cy + dy - 4); ctx.lineTo(cx + 70 + dx, cy + dy - 4);
    ctx.moveTo(cx - 72, cy + dy - 4); ctx.lineTo(cx - 66, cy + dy - 8); ctx.moveTo(cx - 72, cy + dy - 4); ctx.lineTo(cx - 66, cy + dy);
    ctx.moveTo(cx + 70 + dx, cy + dy - 4); ctx.lineTo(cx + 64 + dx, cy + dy - 8); ctx.moveTo(cx + 70 + dx, cy + dy - 4); ctx.lineTo(cx + 64 + dx, cy + dy);
    ctx.stroke();

    jointTag(cx - 48, cy + 22, 'ACROMION');
    jointTag(cx + dx + 48, cy + dy - 20, 'CLAVÍCULA');

  } else if (currentJoint === 'ball') {
    // 🏀 Esferoidal (3D) -> Cadera Coxofemoral
    subLabel = 'Cadera Coxofemoral (Esferoidea)';
    const pitch = window.__jointVals.ball[0] * Math.PI / 180;
    const yaw = window.__jointVals.ball[1] * Math.PI / 180;
    const roll = window.__jointVals.ball[2] * Math.PI / 180;
    const r = 28;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cyw = Math.cos(yaw), sy = Math.sin(yaw);
    const cr = Math.cos(roll), sr = Math.sin(roll);
    function project(lat, lon) {
      const z = Math.sin(lat), x = Math.cos(lat)*Math.sin(lon), y = Math.cos(lat)*Math.cos(lon);
      let x1 = x*cyw - z*sy, z1 = x*sy + z*cyw, y1 = y;
      let y2 = y1*cp - z1*sp, z2 = y1*sp + z1*cp, x2 = x1;
      let x3 = x2*cr - y2*sr, y3 = x2*sr + y2*cr;
      return { px: cx + x3*r, py: cy - y3*r, visible: z2 > 0 };
    }
    const stem = project(Math.PI/2, 0);
    const fx = cx + (stem.px - cx) * 2.4, fy = cy + (stem.py - cy) * 2.4;
    mass(cx - 30, cy - 20, 24, 18, 0.5, muscleT2);

    // Acetábulo: copa cóncava profunda con sombreado (no solo anillo)
    const acx = cx - 4, acy = cy - 4;
    ctx.save();
    const ag = ctx.createRadialGradient(acx + 4, acy + 4, 2, acx, acy, r + 9);
    ag.addColorStop(0, '#241a0e'); ag.addColorStop(0.55, '#3e3018'); ag.addColorStop(0.85, '#5a4628'); ag.addColorStop(1, '#2a2010');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(acx, acy, r + 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = B_EDGE; ctx.lineWidth = 2; ctx.stroke();
    // fosita central del ligamento
    ctx.fillStyle = '#1a1208';
    ctx.beginPath(); ctx.arc(acx + 2, acy + 2, 5, 0, Math.PI*2); ctx.fill();
    ctx.save(); ctx.clip(); boneTex({cx: acx, cy: acy, rx: r+5, ry: r+5, seed: 4, pores: 20}); ctx.restore();
    ctx.restore();
    // borde de cartílago del acetábulo
    cart(ctx, acx, acy, [Math.PI*0.6, Math.PI*2.4], { r: r + 7, c: '#c0392b', w: 3.5, glow: 4 });

    // Cabeza femoral esférica SÓLIDA con gradiente radial profundo (sin poros dispersos que la hagan parecer pelota)
    const chx = cx + r*0.40, chy = cy + r*0.40;
    ctx.save();
    const ballGrad = ctx.createRadialGradient(chx - r*0.42, chy - r*0.42, r*0.08, chx, chy, r);
    ballGrad.addColorStop(0, B_HI); ballGrad.addColorStop(0.45, B_MID);
    ballGrad.addColorStop(0.82, B_SH); ballGrad.addColorStop(1, B_DK);
    ctx.fillStyle = ballGrad;
    ctx.beginPath(); ctx.arc(chx, chy, r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = 2; ctx.stroke();
    // highlight mate tenue (un solo punto de luz)
    ctx.fillStyle = 'rgba(255,250,235,0.28)';
    ctx.beginPath(); ctx.ellipse(chx - r*0.34, chy - r*0.36, r*0.24, r*0.15, -0.6, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Cuello femoral + trocánter mayor + diáfisis
    const nx1 = stem.px + (fx - stem.px)*0.16, ny1 = stem.py + (fy - stem.py)*0.16;
    const nx2 = stem.px + (fx - stem.px)*0.46, ny2 = stem.py + (fy - stem.py)*0.46;
    boneVol(ctx, nx1, ny1, nx2, ny2, 6, 10, {flare2: 1.7});   // cuello ahusado que se abre al trocánter
    head3d(ctx, nx2 + (fx - stem.px)*0.28, ny2 + (fy - stem.py)*0.28, 8);  // trocánter mayor
    boneVol(ctx, nx2, ny2, fx, fy, 11, 7, {flare1: 1.3});     // diáfisis femoral

    jointTag(cx - 64, cy - 48, 'PELVIS (Acetábulo)');
    jointTag(fx + 15, fy + 15, 'FÉMUR');
  }

  // Top header text overlay
  ctx.fillStyle = '#f3e6cf'; ctx.font = 'bold 15px Karla, system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(j.emoji + ' ' + j.name, cx, 28);
  ctx.fillStyle = '#19c2a8'; ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.fillText(j.gl + ' — ' + subLabel, cx, 48);
}
export function drawAntagonist() {
  const canvas = document.getElementById('sim-antagonist');
  if (!canvas || !canvas.parentElement.offsetParent) return;
  const __f = window.fitCanvas(canvas);
  const ctx = __f.ctx;
  const W = __f.W, H = __f.H;
  window.__stage('sim-antagonist','FUERZA',flexionStageLabel(parseFloat(document.getElementById('antagSlider').value)),'blood','anatomy');
  ctx.clearRect(0, 0, W, H);

  const flex = parseFloat(document.getElementById('antagSlider').value) / 100;
  const angle = flex * 130 * Math.PI / 180; // 0 to 130 degrees
  const cx = W * 0.3, cy = H * 0.65;
  const upperLen = H * 0.25, foreLen = H * 0.22;
  const P = AB.PAL;

  // ── Geometría de la extremidad ──
  // Hombro en (cx, cy); brazo hacia arriba; el antebrazo cuelga y flexiona hacia la IZQUIERDA
  const S = { x: cx, y: cy };
  const E = { x: cx, y: cy - upperLen };
  const fa = angle;
  const u = { x: -Math.sin(fa), y: Math.cos(fa) };            // dirección del antebrazo
  const p = { x: Math.cos(fa), y: Math.sin(fa) };             // normal (+p = lado extensor/der)
  const Wp = { x: E.x + u.x * foreLen, y: E.y + u.y * foreLen };

  // Contracción: bíceps se engrosa al flexionar; tríceps al extender
  const bW = H * 0.024 * (0.5 + 0.65 * flex);
  const tW = H * 0.021 * (0.5 + 0.65 * (1 - flex));
  const bA = 0.55 + 0.45 * flex;
  const tA = 0.55 + 0.45 * (1 - flex);

  // ── Envoltura de piel ──
  AB.limbSkin(ctx, [S, E, Wp], [H * 0.052, H * 0.047, H * 0.032],
    { fill: 'rgba(222,180,142,0.16)', edge: 'rgba(194,146,108,0.45)' });

  // ── BÍCEPS: dos vientres que convergen en un tendón hacia el radio ──
  const biMid = H * 0.5;
  AB.muscle(ctx, [
    { x: S.x - 4.5,      y: S.y + upperLen * 0.10 },
    { x: S.x - 6.5,      y: S.y - upperLen * 0.38 },
    { x: E.x - 3.5,      y: E.y + upperLen * 0.02 }
  ], bW, P.biceps, { tension: 0.3 + 0.5 * flex, tendon: 0.12, alpha: bA, hi: 'rgba(255,205,190,0.5)', wScale: 0.78 });
  AB.muscle(ctx, [
    { x: S.x - 7.5,      y: S.y + upperLen * 0.13 },
    { x: S.x - 9,        y: S.y - upperLen * 0.36 },
    { x: E.x - 4.5,      y: E.y + upperLen * 0.02 }
  ], bW, P.biceps, { tension: 0.3 + 0.5 * flex, tendon: 0.12, alpha: bA, hi: 'rgba(255,205,190,0.5)' });
  // Tendón distal del bíceps → tubérculo del radio (justo tras el codo, lado flexor)
  const insR = { x: E.x + u.x * foreLen * 0.16 - p.x * 4.2, y: E.y + u.y * foreLen * 0.16 - p.y * 4.2 };
  AB.tendon(ctx, E.x - 4, E.y + 1, insR.x, insR.y, 2.4);

  // ── TRÍCEPS: tres cabezas → tendón ancho al olécranon ──
  const ole = { x: E.x + p.x * 4.5, y: E.y + p.y * 4.5 };   // olécranon (lado extensor)
  const tHead = (o1, o2, o3, w) => AB.muscle(ctx, [
    { x: S.x + o1.x, y: S.y + o1.y },
    { x: S.x + o2.x, y: S.y + o2.y },
    { x: E.x + o3.x, y: E.y + o3.y }
  ], w, P.triceps, { tension: 0.3 + 0.5 * (1 - flex), tendon: 0.1, alpha: tA, hi: 'rgba(255,215,165,0.5)' });
  tHead({ x: 4.5,  y: upperLen * 0.08 }, { x: 6.5, y: -upperLen * 0.42 }, { x: 3.5, y: upperLen * 0.05 }, tW * 0.72);
  tHead({ x: 6.5,  y: upperLen * 0.10 }, { x: 8.5, y: -upperLen * 0.40 }, { x: 4.5, y: upperLen * 0.04 }, tW * 0.82);
  tHead({ x: 3.5,  y: -upperLen * 0.32 }, { x: 5.0, y: -upperLen * 0.60 }, { x: 4.0, y: upperLen * 0.04 }, tW * 0.6);
  // Tendón del tríceps + olécranon
  AB.tendon(ctx, E.x + 3, E.y - upperLen * 0.06, ole.x, ole.y, 3.4);
  ctx.fillStyle = P.boneMid;
  ctx.beginPath(); ctx.arc(ole.x, ole.y, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.boneStroke; ctx.lineWidth = 0.9; ctx.stroke();

  // ── Huesos ──
  // Húmero + cabeza esférica
  AB.bone(ctx, S.x, S.y, E.x, E.y, 10, 8.5, { flare1: 1.5, flare2: 1.35, cap: 'rgba(15,111,103,0.8)' });
  ctx.save();
  const hg = ctx.createRadialGradient(S.x, S.y, 1, S.x, S.y, H * 0.042);
  hg.addColorStop(0, P.boneHi); hg.addColorStop(1, P.boneSh);
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(S.x, S.y, H * 0.042, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.boneStroke; ctx.lineWidth = 1.1; ctx.stroke();
  ctx.restore();
  // Antebrazo: cúbito (gris, extensor) + radio (teal, flexor donde inserta el bíceps)
  const d = 4;
  AB.bone(ctx, E.x + p.x * d, E.y + p.y * d, Wp.x + p.x * d, Wp.y + p.y * d, 4, 3.8,
    { taper: 0.2, flare1: 1.3, flare2: 1.2, color: 'grey', cap: 'rgba(122,133,141,0.7)' });
  AB.bone(ctx, E.x - p.x * d, E.y - p.y * d, Wp.x - p.x * d, Wp.y - p.y * d, 4.2, 3.8,
    { taper: 0.2, flare1: 1.3, flare2: 1.2, cap: 'rgba(15,111,103,0.75)' });

  // ── Mano ──
  AB.hand(ctx, Wp.x, Wp.y, Math.PI / 2 + fa, H * 0.10, { fl: 0.45, thumbSign: 1 });

  // ── Palanca de tercer género ──
  ctx.fillStyle = 'rgba(90,104,117,0.85)'; ctx.font = 'bold 8.5px Karla, system-ui, sans-serif';
  // Fulcro (codo)
  ctx.fillStyle = '#0f6f67';
  ctx.beginPath(); ctx.moveTo(E.x - 5, E.y - 8); ctx.lineTo(E.x + 5, E.y - 8); ctx.lineTo(E.x, E.y - 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(15,111,103,0.9)'; ctx.textAlign = 'right';
  ctx.fillText('Fulcro', E.x - 8, E.y - 10);
  // Esfuerzo (inserción del bíceps)
  ctx.fillStyle = P.biceps;
  ctx.beginPath(); ctx.arc(insR.x, insR.y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#22303c'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = 'rgba(176,47,38,0.9)'; ctx.textAlign = 'center';
  ctx.fillText('Esfuerzo', insR.x + 26, insR.y + 3);
  ctx.beginPath(); ctx.moveTo(insR.x + 6, insR.y); ctx.lineTo(insR.x + 20, insR.y + 1); ctx.strokeStyle = 'rgba(176,47,38,0.55)'; ctx.lineWidth = 0.8; ctx.stroke();
  // Carga (mano)
  const loadP = { x: Wp.x + u.x * foreLen * 0.22, y: Wp.y + u.y * foreLen * 0.22 };
  ctx.fillStyle = P.triceps;
  ctx.beginPath(); ctx.arc(loadP.x, loadP.y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#22303c'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = 'rgba(192,104,30,0.9)'; ctx.textAlign = 'center';
  ctx.fillText('Carga', loadP.x, loadP.y + 16);
  ctx.beginPath(); ctx.moveTo(loadP.x, loadP.y + 4); ctx.lineTo(loadP.x, loadP.y + 10); ctx.strokeStyle = 'rgba(192,104,30,0.55)'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = 'rgba(107,120,133,0.6)'; ctx.font = 'italic 8.5px Karla, system-ui, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Palanca de 3.er género · esfuerzo entre fulcro y carga', 15, H - 58);

  // Joint markers
  ctx.fillStyle = '#0f6f67'; ctx.beginPath(); ctx.arc(E.x, E.y, 6, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#22303c'; ctx.lineWidth = 1.2; ctx.stroke();

  // Labels
  ctx.font = 'bold 12px Karla, system-ui, sans-serif'; ctx.textAlign = 'center';
  const activeLabel = flex > 0.5 ? 'Bíceps activo' : (flex < 0.3 ? 'Tríceps activo' : 'Equilibrio');
  ctx.fillStyle = flex > 0.5 ? '#b02318' : '#c0681e';
  ctx.fillText(activeLabel, cx, 25);
  ctx.fillStyle = '#5a6875'; ctx.font = '11px Karla, system-ui, sans-serif';
  ctx.fillText('🔄 Músculos antagonistas: solo se contraen', cx, 48);

  // Legend
  ctx.fillStyle = '#b02318'; ctx.font = '10px Karla, system-ui, sans-serif'; ctx.textAlign = 'left';
  ctx.fillRect(15, H - 40, 12, 12); ctx.fillStyle = '#5a6875'; ctx.fillText('Bíceps (flexión)', 32, H - 29);
  ctx.fillStyle = '#c0681e'; ctx.fillRect(15, H - 22, 12, 12); ctx.fillStyle = '#5a6875'; ctx.fillText('Tríceps (extensión)', 32, H - 11);

  const barX = W - 150, barW = 120, barY = H - 34;
  ctx.fillStyle = 'rgba(35,44,54,.08)'; ctx.fillRect(barX, barY, barW, 7);
  ctx.fillStyle = '#b02318'; ctx.fillRect(barX, barY, barW * flex, 7);
  ctx.fillStyle = '#5a6875'; ctx.font = '9px Karla, system-ui, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('contracción del bíceps', barX, barY - 5);

  // Update label
  const label = document.getElementById('antagLabel');
  if (label) label.textContent = activeLabel + ' (' + Math.round(flex*100) + '% contracción)';
}
function flexionStageLabel(value){
  if (value < 30) return 'Tríceps dominante';
  if (value > 65) return 'Bíceps dominante';
  return 'Co-contracción';
}


/* ===== DRAW BLOCK ===== */

// ─── D1: ALLOMETRY ───
const ALLO_DATA: Record<string, { a: number; alpha: number; unit: string; label: string; color: string }> = {
  BMR: { a: 4.1, alpha: 0.75, unit: 'W', label: 'Tasa Metabólica Basal', color: '#0f6f67' },
  area: { a: 0.11, alpha: 0.65, unit: 'm²', label: 'Área Superficial', color: '#0d8577' },
  HR: { a: 4.02, alpha: -0.25, unit: 'Hz', label: 'Frecuencia Cardíaca', color: '#b02318' },
  brain: { a: 0.085, alpha: 0.66, unit: 'kg', label: 'Masa Cerebral', color: '#6d5fbf' },
  life: { a: 11.89, alpha: 0.20, unit: 'años', label: 'Tiempo de vida', color: '#2e8b57' },
  muscle: { a: 0.45, alpha: 1.0, unit: 'kg', label: 'Masa muscular', color: '#c0681e' }
};

const ALLO_ANIMALS = [
  { name: 'Ratón', mass: 0.02, color: '#2e8b57' },
  { name: 'Conejo', mass: 2, color: '#3e9d6b' },
  { name: 'Perro', mass: 25, color: '#5a9a3a' },
  { name: 'Humano', mass: 70, color: '#0d6e64' },
  { name: 'Caballo', mass: 500, color: '#a35c00' },
  { name: 'Elefante', mass: 5000, color: '#6d5fbf' },
  { name: 'Ballena', mass: 100000, color: '#3d4f8a' },
];

let alloRaf: number | null = null, alloStart = 0, alloKey: string | null = null;

export function drawAllometry(customKey?: string) {
  const canvas = document.getElementById('sim-allometry') as HTMLCanvasElement;
  if (!canvas || !canvas.parentElement || !canvas.parentElement.offsetParent) return;
  if (alloRaf) { cancelAnimationFrame(alloRaf); alloRaf = null; }
  const __f = (window as any).fitCanvas(canvas);
  const ctx = __f.ctx;
  const W = __f.W, H = __f.H;
  const key = customKey || (document.getElementById('alloSelect') as HTMLSelectElement)?.value || 'BMR';
  const data = ALLO_DATA[key] || ALLO_DATA['BMR'];
  if (alloKey !== key) { alloKey = key; alloStart = performance.now(); }
  (window as any).__stage('sim-allometry', 'ESCALA', 'α = ' + data.alpha.toFixed(2).replace('.', ','), 'teal', 'chart');
  const pad = { top: 42, bottom: 42, left: 56, right: 26 };
  const plotW = W - pad.left - pad.right, plotH = H - pad.top - pad.bottom;
  const logMin = Math.log10(0.01), logMax = Math.log10(100000);
  const xFromMass = (m: number) => pad.left + (Math.log10(m) - logMin) / (logMax - logMin) * plotW;
  // Rango Y compartido para todos los exponentes
  const allVals = Object.values(ALLO_DATA).flatMap(d => [d.a * Math.pow(0.01, d.alpha), d.a * Math.pow(100000, d.alpha)]);
  const valMin = Math.min(...allVals), valMax = Math.max(...allVals);
  const yLo = Math.log10(valMin * 0.1), yHi = Math.log10(valMax * 10);
  const yFromVal = (v: number) => pad.top + plotH - (Math.log10(Math.max(v, valMin * 0.1)) - yLo) / (yHi - yLo) * plotH;

  (function frame(now) {
    const t = Math.min(1, (now - alloStart) / 900);
    const ease = 1 - Math.pow(1 - t, 3);
    ctx.clearRect(0, 0, W, H);
    // Rejilla vertical por décadas
    ctx.strokeStyle = 'rgba(35,44,54,0.10)'; ctx.lineWidth = 1;
    for (let i = -2; i <= 5; i++) {
      const x = xFromMass(Math.pow(10, i));
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
      ctx.fillStyle = '#7a858d'; ctx.font = '9px JetBrains Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText('10' + (i === -2 ? '⁻²' : i === -1 ? '⁻¹' : i === 0 ? '⁰' : i === 1 ? '¹' : i === 2 ? '²' : i === 3 ? '³' : i === 4 ? '⁴' : '⁵'), x, pad.top + plotH + 14);
    }
    // Línea isométrica fantasma α = 1
    ctx.strokeStyle = 'rgba(35,44,54,.30)'; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const m = Math.pow(10, logMin + (logMax - logMin) * i / 60);
      const x = xFromMass(m), y = yFromVal(data.a * m);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#6b7885'; ctx.font = 'italic 9px Karla, system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('α = 1 · isométrica (referencia)', pad.left + 8, pad.top + 14);

    // Curva alométrica con animación de trazado
    const steps = 240, upto = Math.floor(steps * ease);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = data.color; ctx.lineWidth = 3.2;
    ctx.beginPath();
    for (let i = 0; i <= upto; i++) {
      const m = Math.pow(10, logMin + (logMax - logMin) * i / steps);
      const x = xFromMass(m), y = yFromVal(data.a * Math.pow(m, data.alpha));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Punta luminosa
    if (upto > 0 && upto < steps) {
      const m = Math.pow(10, logMin + (logMax - logMin) * upto / steps);
      const x = xFromMass(m), y = yFromVal(data.a * Math.pow(m, data.alpha));
      ctx.fillStyle = data.color; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }

    // Animales como puntos vivos
    ALLO_ANIMALS.forEach(a => {
      const x = xFromMass(a.mass), y = yFromVal(data.a * Math.pow(a.mass, data.alpha));
      const pop = 0.5 + 0.5 * Math.sin(now / 420 + a.mass);
      ctx.fillStyle = a.color; ctx.beginPath(); ctx.arc(x, y, 3.6 + pop * 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(251,248,240,.9)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#43505c'; ctx.font = 'bold 8px Karla, system-ui, sans-serif';
      ctx.textAlign = a.mass < 1 ? 'left' : (a.mass > 1000 ? 'right' : 'center');
      ctx.fillText(a.name, x, y - 9);
    });

    // Destaque humano con lectura numérica
    const hx = xFromMass(70), hy = yFromVal(data.a * Math.pow(70, data.alpha)), hv = data.a * Math.pow(70, data.alpha);
    ctx.fillStyle = '#22303c'; ctx.beginPath(); ctx.arc(hx, hy, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#22303c'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#5a6875'; ctx.font = '9px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText(data.a.toFixed(3) + '·70^' + data.alpha.toFixed(2) + ' = ' + hv.toFixed(2) + ' ' + data.unit, hx, hy + 20);

    // Título + eje Y
    ctx.fillStyle = data.color; ctx.font = 'bold 13px Karla, system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(data.label + '  (α = ' + data.alpha + ')', W / 2, 19);
    ctx.save(); ctx.translate(13, pad.top + plotH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#7a858d'; ctx.font = '9px Karla, system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(data.label + ' (' + data.unit + ')', 0, 0); ctx.restore();
    ctx.fillStyle = '#7a858d'; ctx.font = '8px Karla, system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('masa (kg, escala log)  →  ' + data.label, W / 2, H - 4);

    if (t < 1) alloRaf = requestAnimationFrame(frame); else alloRaf = null;
  })(performance.now());
}

// ─── D4: STEVENS' LAW ───
export function drawStevens(customN?: number) {
  const canvas = document.getElementById('sim-stevens') as HTMLCanvasElement;
  if (!canvas || !canvas.parentElement || !canvas.parentElement.offsetParent) return;
  const __f = (window as any).fitCanvas(canvas);
  const ctx = __f.ctx;
  const W = __f.W, H = __f.H;
  ctx.clearRect(0, 0, W, H);

  const n = customN != null ? customN : (parseFloat((document.getElementById('stevensN') as HTMLInputElement)?.value) || 0.54);
  const lbl = document.getElementById('stevensNLabel');
  if (lbl) lbl.textContent = n.toFixed(2).replace('.', ',');
  (window as any).__stage('sim-stevens', 'PERCEPCIÓN', 'n = ' + n.toFixed(2).replace('.', ',') + ' · S₀ normalizado', 'violet', 'chart');

  const pad = { top: 35, bottom: 35, left: 45, right: 20 };
  const plotW = W - pad.left - pad.right, plotH = H - pad.top - pad.bottom;

  // Draw axes
  ctx.strokeStyle = '#c9bfa8'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top + plotH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad.left, pad.top + plotH); ctx.lineTo(pad.left + plotW, pad.top + plotH); ctx.stroke();

  // Axis labels
  ctx.fillStyle = '#7a858d'; ctx.font = '9px Karla, system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Estímulo (S)', pad.left + plotW / 2, H - 5);
  ctx.save(); ctx.translate(12, pad.top + plotH / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillText('Percepción (P)', 0, 0); ctx.restore();

  // Draw curve
  const steps = 100;
  const s0 = 0.5;
  const sMax = 5;
  const pMax = Math.pow(sMax - s0, n);

  ctx.strokeStyle = '#0f6f67'; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const s = (i / steps) * sMax;
    const p = Math.pow(Math.max(0, s - s0), n);
    const x = pad.left + (s / sMax) * plotW;
    const y = pad.top + plotH - (p / pMax) * plotH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const s0x = pad.left + (s0 / sMax) * plotW;
  ctx.strokeStyle = 'rgba(169,42,30,.7)'; ctx.lineWidth = 1.3; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(s0x, pad.top); ctx.lineTo(s0x, pad.top + plotH); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#a92a1e'; ctx.font = 'bold 9px Karla, system-ui, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('S₀ = 0,5', s0x + 5, pad.top + 12);

  const reference = 1;
  const refP = Math.pow(reference - s0, n);
  const doubleP = Math.pow(2 * reference - s0, n);
  const refX = pad.left + (reference / sMax) * plotW;
  const doubleX = pad.left + (2 * reference / sMax) * plotW;
  const refY = pad.top + plotH - (refP / pMax) * plotH;
  const doubleY = pad.top + plotH - (doubleP / pMax) * plotH;
  ctx.strokeStyle = 'rgba(13,110,100,.35)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(refX, refY); ctx.lineTo(doubleX, doubleY); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#0d6e64'; ctx.beginPath(); ctx.arc(refX, refY, 4, 0, Math.PI * 2); ctx.arc(doubleX, doubleY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#43505c'; ctx.font = 'bold 8px Karla, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('S', refX, refY + 14); ctx.fillText('2S', doubleX, doubleY - 9);

  // Linearity reference (dashed)
  ctx.strokeStyle = 'rgba(35,44,54,0.45)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(pad.left, pad.top + plotH); ctx.lineTo(pad.left + plotW, pad.top); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#7a858d'; ctx.font = '9px Karla, system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('Lineal (n=1)', pad.left + plotW - 70, pad.top + 12);

  // Labels
  ctx.fillStyle = n < 1 ? '#c0681e' : (n > 1 ? '#b02318' : '#0f6f67');
  ctx.font = 'bold 14px Karla, system-ui, sans-serif'; ctx.textAlign = 'center';
  const label = n < 1 ? 'Sublineal (n<1)' : (n > 1 ? 'Superlineal (n>1)' : 'Lineal (n=1)');
  ctx.fillText(label, W / 2, 20);
  ctx.fillStyle = '#5a6875'; ctx.font = '9px Karla, system-ui, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('P = K · (S − S₀)^' + n.toFixed(2) + ' · K=1', pad.left + 8, 32);
  ctx.fillStyle = '#7a858d'; ctx.font = '9px Karla, system-ui, sans-serif';
  ctx.textAlign = 'center';
}


/* ===== DRAW BLOCK ===== */

/* ═══════════════════════════════════════════════════════════
   NUEVAS SIMULACIONES · el tratado anatómico interactivo
   setJoint · setMovement/drawMovement · drawMobility ·
   drawBoneScale · calcBMI · init
   ═══════════════════════════════════════════════════════════ */

/* ─── B2 · Articulaciones: selección por fila ─── */
export function setJoint(type) {
  if (!JOINT_DATA[type]) return;
  currentJoint = type;
  const j = JOINT_DATA[type];
  const lbl = document.getElementById('jointDetailLabel');
  if (lbl) lbl.textContent = j.name + ': ' + j.desc;
  document.querySelectorAll('[data-joint]').forEach(r => { r.style.background = ''; r.setAttribute('aria-selected','false'); });
  const row = document.querySelector('[data-joint="' + type + '"]');
  if (row) { row.style.background = 'var(--teal-tint)'; row.setAttribute('aria-selected','true'); }
  if (window.rebuildJointSliders) rebuildJointSliders(type);
  if (window.drawJoints) drawJoints();
}
window.setJoint = setJoint;

/* ─── B3 · Tipos de movimiento ─── */
const MOVEMENTS = {
  flexion:      { name: 'Flexión',     desc: 'Doblar: reducir el ángulo articular', a: 0,   b: 140, axis: 'elbow', color: '#0d6e64' },
  extension:    { name: 'Extensión',   desc: 'Estirar: aumentar el ángulo articular', a: 140, b: 0,   axis: 'elbow', color: '#b02318' },
  abduction:    { name: 'Abducción',   desc: 'Alejar la extremidad del plano medio', a: 0,   b: 95,  axis: 'yaw',   color: '#0d6e64' },
  adduction:    { name: 'Aducción',    desc: 'Acercar la extremidad al plano medio', a: 95,  b: 0,   axis: 'yaw',   color: '#b02318' },
  rotation:     { name: 'Rotación',    desc: 'Girar alrededor del eje longitudinal', a: 0,   b: 80,  axis: 'roll',  color: '#6d5fbf' },
  circumduction:{ name: 'Circunducción', desc: 'Cono: flexión + ext + abd + adu + rot', a: 0, b: 360, axis: 'cone', color: '#a35c00' },
  pronation:    { name: 'Pronación',   desc: 'Girar el antebrazo: palma hacia abajo', a: 0,   b: 180, axis: 'roll',  color: '#0d6e64' },
  supination:   { name: 'Supinación',  desc: 'Girar el antebrazo: palma hacia arriba', a: 180, b: 0,  axis: 'roll',  color: '#b02318' }
};
let currentMovement = 'flexion';
let movementAnimationActive = false;
let movementAnimTime = 0;
let movementRaf = null;

export function setMovement(type) {
  if (!MOVEMENTS[type]) return;
  currentMovement = type;
  const lb = document.getElementById('movementLabel');
  if (lb) lb.textContent = MOVEMENTS[type].name;
  document.querySelectorAll('[data-movement]').forEach(p => { p.style.borderColor = ''; p.style.background = ''; p.setAttribute('aria-pressed','false'); });
  const pill = document.querySelector('[data-movement="' + type + '"]');
  if (pill) { pill.style.borderColor = 'var(--teal)'; pill.style.background = 'var(--teal-tint)'; pill.setAttribute('aria-pressed','true'); }
  drawMovement();
}
window.setMovement = setMovement;

export function toggleMovementAnimation() {
  movementAnimationActive = !movementAnimationActive;
  const btn = document.getElementById('btnAnimateMovement');
  if (btn) btn.textContent = movementAnimationActive ? 'Pausar' : 'Animar';
  if (movementAnimationActive) {
    // Arranca desde la pose estática actual para no saltar.
    const mv = MOVEMENTS[currentMovement];
    window.__movDamped = mv.axis === 'cone' ? 0.25 * 360 : mv.a + (mv.b - mv.a) * 0.42;
    startMovementRaf();
  } else {
    window.__movDamped = null; // vuelve a la pose estática al detener
  }
}
export function startMovementRaf() {
  if (movementRaf) return;
  let _last = performance.now();
  function loop(now) {
    if (!movementAnimationActive) { movementRaf = null; return; }
    const canvas = document.getElementById('sim-movement');
    if (canvas && canvas.parentElement.offsetParent) {
      const dt = Math.min(0.1, (now - _last) / 1000); _last = now;
      movementAnimTime += dt;
      const mv = MOVEMENTS[currentMovement];
      let tAng;
      if (mv.axis === 'cone') tAng = ((movementAnimTime % (Math.PI * 2)) / (Math.PI * 2)) * 360;
      else tAng = mv.a + (mv.b - mv.a) * ((Math.sin(movementAnimTime) + 1) / 2);
      window.__movDamped = window.__damp(window.__movDamped, tAng, 10, dt);
      drawMovement();
      movementRaf = requestAnimationFrame(loop);
    } else { movementRaf = null; _last = performance.now(); }
  }
  movementRaf = requestAnimationFrame(loop);
}

export function drawMovement() {
  const canvas = document.getElementById('sim-movement');
  if (!canvas || !canvas.parentElement.offsetParent) return;
  const __f = window.fitCanvas(canvas);
  const ctx = __f.ctx;
  const W = __f.W, H = __f.H;
  ctx.clearRect(0, 0, W, H);

  const mv = MOVEMENTS[currentMovement] || MOVEMENTS.flexion;
  const phase = movementAnimationActive ? (Math.sin(movementAnimTime) + 1) / 2 : 0.42;
  let ang;
  if (movementAnimationActive && window.__movDamped != null) {
    ang = window.__movDamped; // persigue con retardo orgánico
  } else if (mv.axis === 'cone') {
    ang = (movementAnimationActive ? ((movementAnimTime % (Math.PI * 2)) / (Math.PI * 2)) : 0.25) * 360;
  } else {
    ang = mv.a + (mv.b - mv.a) * phase;
  }

  const cx = W * 0.44, cy = H * 0.60;
  const U = H * 0.22, F = H * 0.20, Hd = H * 0.09;
  const rad = a => a * Math.PI / 180;
  const line = 'rgba(35,44,54,0.30)';
  const P = AB.PAL;
  window.__stage('sim-movement','MOVIMIENTO',mv.name+' · eje '+mv.axis,'teal','anatomy');

  // ── Extremidad anatómica (hombro → codo → muñeca): piel + huesos ──
  function limbArm(sh, el, wp, o) {
    o = o || {};
    const rs = o.rs || 11;
    AB.limbSkin(ctx, [sh, el, wp], [rs, rs * 0.92, rs * 0.6],
      { fill: 'rgba(222,180,142,0.16)', edge: 'rgba(194,146,108,0.45)' });
    AB.bone(ctx, sh.x, sh.y, el.x, el.y, 8.5, 7.5,
      { flare1: 1.4, flare2: 1.3, cap: o.cap || 'rgba(15,111,103,0.8)' });
    const dx = wp.x - el.x, dy = wp.y - el.y, L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const rp = o.radiusPos != null ? o.radiusPos : 4;   // radio (teal) — cruza en pronación
    const up = o.ulnaPos   != null ? o.ulnaPos   : -4;  // cúbito (gris) fijo
    AB.bone(ctx, el.x + nx * rp, el.y + ny * rp, wp.x + nx * rp, wp.y + ny * rp, 3.6, 3.4,
      { taper: 0.2, flare1: 1.25, flare2: 1.15, cap: o.cap || 'rgba(15,111,103,0.8)' });
    AB.bone(ctx, el.x + nx * up, el.y + ny * up, wp.x + nx * up, wp.y + ny * up, 3, 2.8,
      { taper: 0.2, flare1: 1.2, flare2: 1.1, color: 'grey' });
    return { ux: ux, uy: uy, nx: nx, ny: ny };
  }
  function jointDot(x, y, c) {
    ctx.fillStyle = c || mv.color;
    ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#22303c'; ctx.lineWidth = 1; ctx.stroke();
  }
  // Mano orientada a lo largo de una dirección unitaria (ux, uy)
  function handAlong(x, y, ux, uy, opts) {
    AB.hand(ctx, x, y, Math.atan2(uy, ux), Hd * 1.9, opts || { fl: 0.45, thumbSign: 1 });
  }

  if (mv.axis === 'elbow') {
    const sh = { x: cx, y: cy - U };
    const el = { x: cx + U * 0.18, y: cy };
    const bend = rad(ang);
    const fx = el.x + Math.sin(bend) * F * 0.82;
    const fy = el.y + Math.cos(bend) * F;
    const wp = { x: fx + Math.sin(bend + 0.3) * Hd, y: fy + Math.cos(bend + 0.3) * Hd };

    // Línea de referencia (brazo extendido)
    ctx.strokeStyle = line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sh.x, sh.y - U * 0.8); ctx.lineTo(sh.x, cy + H * 0.16); ctx.stroke();

    // Bíceps (flexor, lado del doblez) y tríceps (extensor)
    const hdx = el.x - sh.x, hdy = el.y - sh.y, hL = Math.hypot(hdx, hdy) || 1;
    const hnX = -hdy / hL, hnY = hdx / hL;
    const bs = ((el.x + F * 0) - (sh.x + el.x) / 2) * hnX + ((el.y + F) - (sh.y + el.y) / 2) * hnY >= 0 ? 1 : -1;
    AB.muscle(ctx, [
      { x: sh.x + hnX * bs * 5.5 + hdx * 0.10, y: sh.y + hnY * bs * 5.5 + hdy * 0.10 },
      { x: el.x + hnX * bs * 6.5 + hdx * 0.52, y: el.y + hnY * bs * 6.5 + hdy * 0.52 },
      { x: el.x + hnX * bs * 4   + hdx * 0.93, y: el.y + hnY * bs * 4   + hdy * 0.93 }
    ], 6.5, P.biceps, { tension: 0.35, tendon: 0.1, alpha: 0.4, hi: 'rgba(255,205,190,0.5)' });
    AB.muscle(ctx, [
      { x: sh.x - hnX * bs * 5.5 + hdx * 0.08, y: sh.y - hnY * bs * 5.5 + hdy * 0.08 },
      { x: el.x - hnX * bs * 6   + hdx * 0.5,  y: el.y - hnY * bs * 6   + hdy * 0.5 },
      { x: el.x - hnX * bs * 3.5 + hdx * 0.92, y: el.y - hnY * bs * 3.5 + hdy * 0.92 }
    ], 6, P.triceps, { tension: 0.35, tendon: 0.1, alpha: 0.35, hi: 'rgba(255,215,165,0.5)' });

    const v = limbArm(sh, el, wp, { rs: 10.5 });
    handAlong(wp.x, wp.y, v.ux, v.uy);
    jointDot(sh.x, sh.y); jointDot(el.x, el.y, '#0f6f67');

    ctx.strokeStyle = mv.color; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(el.x, el.y, 20, -Math.PI / 2, -Math.PI / 2 + bend); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = mv.color; ctx.font = 'bold 11px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText(Math.round(ang) + '°', el.x + 8, el.y - 14);

  } else if (mv.axis === 'yaw') {
    const a0 = rad(ang);
    const sh = { x: cx, y: cy };
    const el = { x: cx + Math.sin(a0) * U * 0.9, y: cy + Math.cos(a0) * U };
    const wp = { x: el.x + Math.sin(a0) * F * 0.9 + Math.sin(a0) * Hd, y: el.y + Math.cos(a0) * F + Math.cos(a0) * Hd };

    // Línea del plano medio del cuerpo
    ctx.strokeStyle = line; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, cy - H * 0.16); ctx.lineTo(cx, cy + H * 0.22); ctx.stroke();

    // Medio torso (silueta tenue a la izquierda, de donde emerge el brazo)
    ctx.save();
    ctx.fillStyle = 'rgba(222,180,142,0.14)';
    ctx.strokeStyle = 'rgba(194,146,108,0.4)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - H * 0.16);
    ctx.quadraticCurveTo(cx - W * 0.10, cy - H * 0.06, cx - W * 0.07, cy + H * 0.10);
    ctx.quadraticCurveTo(cx - W * 0.04, cy + H * 0.20, cx, cy + H * 0.22);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Hombro (escápula + clavícula tenues)
    ctx.strokeStyle = 'rgba(194,146,108,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, H * 0.05, Math.PI * 0.6, Math.PI * 1.45); ctx.stroke();
    ctx.restore();

    // Deltoides resaltado sobre la masa del hombro
    const hdx = el.x - sh.x, hdy = el.y - sh.y, hL = Math.hypot(hdx, hdy) || 1;
    const hnX = -hdy / hL, hnY = hdx / hL;
    const out = Math.sign(Math.cos(a0)); // lado externo = el del abducción
    AB.muscle(ctx, [
      { x: sh.x + hnX * out * 6 + hdx * 0.04, y: sh.y + hnY * out * 6 + hdy * 0.04 },
      { x: el.x + hnX * out * 7.5 + hdx * 0.38, y: el.y + hnY * out * 7.5 + hdy * 0.38 },
      { x: el.x + hnX * out * 5 + hdx * 0.62, y: el.y + hnY * out * 5 + hdy * 0.62 }
    ], 7, P.deltoid, { tension: 0.4, tendon: 0.08, alpha: 0.6, hi: 'rgba(255,225,195,0.6)' });

    const v = limbArm(sh, el, wp, { rs: 11 });
    handAlong(wp.x, wp.y, v.ux, v.uy);
    jointDot(sh.x, sh.y, '#b02318');

    ctx.strokeStyle = mv.color; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(sh.x, sh.y, 24, Math.PI, Math.PI + a0); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = mv.color; ctx.font = 'bold 11px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText(Math.round(ang) + '°', sh.x, sh.y - 16);

  } else if (mv.axis === 'roll') {
    const sh = { x: cx, y: cy - U * 1.1 };
    const el = { x: cx, y: cy };
    const wp = { x: cx, y: cy + F };
    const roll = ang, rollRad = rad(roll);

    // El radio cruza el cúbito al pronar/supinar (+4 → −4)
    const rOff = 4 * Math.cos(rollRad);
    limbArm(sh, el, wp, { rs: 10.5, radiusPos: rOff, ulnaPos: -4 });

    // Sección del antebrazo: cúbito fijo + radio orbitando
    const mx2 = (el.x + wp.x) / 2, my2 = (el.y + wp.y) / 2;
    ctx.fillStyle = '#7a858d'; ctx.beginPath(); ctx.arc(mx2, my2, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#22303c'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = '#0f6f67'; ctx.beginPath(); ctx.arc(mx2 + rOff, my2, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#22303c'; ctx.lineWidth = 0.8; ctx.stroke();

    // Mano girando: palma abajo (dorso) → palma arriba
    const fl = 0.35 + 0.5 * Math.abs(Math.sin(rollRad));
    AB.hand(ctx, wp.x, wp.y, Math.PI / 2, Hd * 2.1, { fl: fl, thumbSign: roll > 90 ? 1 : -1 });
    jointDot(sh.x, sh.y); jointDot(el.x, el.y, '#0f6f67');

    ctx.strokeStyle = mv.color; ctx.lineWidth = 1.5; ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.ellipse(cx, cy + F * 0.55, 18, 7, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = mv.color; ctx.font = 'bold 11px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText(Math.round(roll) + '°', cx + 24, cy + F * 0.55);

  } else {
    // Circunducción: cono translúcido + poses fantasma + brazo actual
    const a0 = rad(ang);
    const sh = { x: cx, y: cy };
    const el = { x: cx + Math.sin(a0) * U, y: cy - Math.cos(a0) * U };
    const wp = { x: el.x + Math.sin(a0) * (F + Hd), y: el.y - Math.cos(a0) * (F + Hd) };

    // Cono: disco translúcido (trayectoria del codo) + borde punteado
    ctx.save();
    ctx.fillStyle = 'rgba(163,92,0,0.08)';
    ctx.beginPath();
    for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.12) {
      const ex2 = sh.x + Math.sin(t) * U * 0.98, ey2 = sh.y - Math.cos(t) * U * 0.98;
      if (t === 0) ctx.moveTo(ex2, ey2); else ctx.lineTo(ex2, ey2);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(163,92,0,0.35)'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let t = 0; t <= Math.PI * 2; t += 0.1) {
      const ex2 = sh.x + Math.sin(t) * U * 0.98, ey2 = sh.y - Math.cos(t) * U * 0.98;
      if (t === 0) ctx.moveTo(ex2, ey2); else ctx.lineTo(ex2, ey2);
    }
    ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();

    // Poses fantasma a 0°, 90°, 180°, 270°
    for (const t of [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2]) {
      const gEl = { x: sh.x + Math.sin(t) * U * 0.98, y: sh.y - Math.cos(t) * U * 0.98 };
      const gWp = { x: gEl.x + Math.sin(t) * (F + Hd), y: gEl.y - Math.cos(t) * (F + Hd) };
      ctx.save(); ctx.globalAlpha = 0.15;
      limbArm(sh, gEl, gWp, { rs: 8.5 });
      ctx.restore();
    }

    const v = limbArm(sh, el, wp, { rs: 10.5 });
    handAlong(wp.x, wp.y, v.ux, v.uy);
    jointDot(sh.x, sh.y, '#a35c00');

    ctx.fillStyle = mv.color; ctx.font = 'bold 11px Karla, system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('360°', sh.x, sh.y - U - 10);
  }

  ctx.fillStyle = mv.color; ctx.font = 'bold 13px Karla, system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(mv.name, W / 2, 20);
  ctx.fillStyle = '#6b7885'; ctx.font = '10px Karla, system-ui, sans-serif';
  ctx.fillText(mv.desc, W / 2, 36);
  ctx.strokeStyle = mv.color; ctx.globalAlpha = .45; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(W - 108, H - 30); ctx.lineTo(W - 24, H - 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W - 24, H - 30); ctx.lineTo(W - 32, H - 34); ctx.moveTo(W - 24, H - 30); ctx.lineTo(W - 32, H - 26); ctx.stroke();
  ctx.fillStyle = '#6b7885'; ctx.font = '9px Karla, system-ui, sans-serif'; ctx.textAlign = 'right';
  ctx.fillText('opuestos', W - 28, H - 38); ctx.globalAlpha = 1;
}
window.drawMovement = drawMovement;

/* ─── C3 · Movilidad articular (Tabla 1.10) ─── */
/* [CFX] MOBILITY -> C3_JOINTS */

/* [CFX] drawMobility reemplazada por la capa CFX */

/* [CFX] export movido a la capa CFX */

/* ─── D2 · Escalado estructural del fémur ─── */
const BONES = {
  rat:      { name: 'Rata',     L: 60,  wl: 1.0, color: '#2e8b57' },
  horse:    { name: 'Caballo',  L: 120, wl: 1.7, color: '#a35c00' },
  elephant: { name: 'Elefante', L: 190, wl: 4.0, color: '#6d5fbf' }
};
let boneScaleSel = null;

export function drawBoneScale(highlight?: string | null, customAllo?: boolean) {
  if (highlight) boneScaleSel = highlight;
  const canvas = document.getElementById('sim-bonescale') as HTMLCanvasElement;
  if (!canvas || !canvas.parentElement || !canvas.parentElement.offsetParent) return;
  const __f = (window as any).fitCanvas(canvas);
  const ctx = __f.ctx;
  const W = __f.W, H = __f.H;
  ctx.clearRect(0, 0, W, H);

  const alloEl = document.getElementById('boneScaleAllo') as HTMLInputElement;
  const allo = customAllo !== undefined ? customAllo : (alloEl ? alloEl.checked : true);
  (window as any).__stage('sim-bonescale','ESTRUCTURA',allo ? 'alométrico vs. isométrico' : 'solo escala isométrica','violet','anatomy');

  const keys = ['rat', 'horse', 'elephant'];
  const colW = W / 3;
  const lenScale = (H * 0.40) / 190;
  const base = 7;

  keys.forEach((k, i) => {
    const b = BONES[k];
    const x = colW * (i + 0.5);
    const topY = H * 0.14;
    const boneL = b.L * lenScale;
    const bottomY = topY + boneL;
    const wAllo = b.wl * base;
    const wIso = (b.L / 60) * base;
    const wSolid = allo ? wAllo : wIso;

    drawFemur(x, topY, bottomY, wSolid, b.color, 1, false);
    if (allo) drawFemur(x, topY, bottomY, wIso, 'rgba(67,80,92,0.55)', 1, true);

    if (boneScaleSel === k) {
      ctx.strokeStyle = 'rgba(13,110,100,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      ctx.strokeRect(x - wSolid - 16, topY - 22, (wSolid + 16) * 2, boneL + 44);
      ctx.setLineDash([]);
    }

    ctx.fillStyle = b.color; ctx.font = 'bold 12px Karla, system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(b.name, x, topY - 10);
    ctx.fillStyle = '#43505c'; ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('L = ' + b.L, x, bottomY + 14);
    ctx.fillStyle = '#6b7885';
    ctx.fillText('w/L ≈ ' + b.wl.toFixed(1).replace('.', ','), x, bottomY + 26);

    ctx.strokeStyle = b.color; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - wSolid - 2, topY + boneL * 0.25); ctx.lineTo(x + wSolid + 2, topY + boneL * 0.25); ctx.stroke();
    ctx.fillStyle = b.color; ctx.font = '8px JetBrains Mono, monospace'; ctx.textAlign = 'left';
    ctx.fillText('w',x+wSolid+6,topY+boneL*.25+3);
  });

  ctx.fillStyle = '#0d6e64'; ctx.font = 'bold 13px Karla, system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(allo ? 'Fémur · línea = isométrico  /  relleno = alométrico' : 'Fémur · escala isométrica', W / 2, 12);
  ctx.textAlign = 'left'; ctx.font = '9px Karla, system-ui, sans-serif'; ctx.fillStyle = '#6b7885';
  ctx.fillText('w ∝ L³ᐟ²', W-70, H-16);
  if (allo) { ctx.strokeStyle = 'rgba(67,80,92,.65)'; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(W-118,H-19); ctx.lineTo(W-86,H-19); ctx.stroke(); ctx.setLineDash([]); ctx.fillText('isom.',W-80,H-16); }

  function drawFemur(cx: number, ty: number, by: number, w: number, color: string, alpha: number, dash: boolean) {
    ctx.save();
    ctx.globalAlpha = alpha;
    if (dash) ctx.setLineDash([5, 4]);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = dash ? 1.5 : 0;
    ctx.beginPath();
    ctx.moveTo(cx - w, ty + w * 0.5);
    ctx.quadraticCurveTo(cx - w * 1.2, ty + w * 0.2, cx - w * 0.45, ty);
    ctx.quadraticCurveTo(cx, ty - w * 0.55, cx + w * 0.45, ty);
    ctx.quadraticCurveTo(cx + w * 1.2, ty + w * 0.2, cx + w, ty + w * 0.5);
    ctx.lineTo(cx + w * 0.5, by - w * 0.35);
    ctx.quadraticCurveTo(cx + w * 0.95, by, cx, by + w * 0.35);
    ctx.quadraticCurveTo(cx - w * 0.95, by, cx - w * 0.5, by - w * 0.35);
    ctx.closePath();
    ctx.fill();
    if (dash) ctx.stroke();
    ctx.restore();
  }
}
(window as any).drawBoneScale = drawBoneScale;

/* ─── D3 · Índices: maniquí vivo + termómetro OMS + área Du Bois ───
   · El maniquí paramétrico (CFX.figure) se adapta al IMC/grasa
   · Termómetro de categoría OMS con marcador animado
   · Disco concéntrico del área superficial (Du Bois)
*/
let bmiLast: any = null, bmiAnim: number | null = null;
export function calcBMI(customMass?: number, customHeight?: number) {
  const mEl = document.getElementById('bmiMass') as HTMLInputElement;
  const hEl = document.getElementById('bmiHeight') as HTMLInputElement;
  const m = customMass != null ? customMass : (parseFloat(mEl?.value) || 70);
  const h = customHeight != null ? customHeight : (parseFloat(hEl?.value) || 1.72);
  const canvas = document.getElementById('sim-bmi') as HTMLCanvasElement;
  if (!canvas || !canvas.parentElement || !canvas.parentElement.offsetParent) return;
  if (m <= 0 || h <= 0) return;

  const A = 0.202 * Math.pow(m, 0.425) * Math.pow(h, 0.725);
  const S = h / Math.pow(m, 1 / 3);
  const rho = 0.69 + 0.9 * S;
  const bmi = m / (h * h);
  const fatH = 1.28 * bmi - 10.1;
  const fatM = 1.48 * bmi - 7.0;

  let cat: string, color: string;
  if (bmi < 18.5)      { cat = 'Bajo peso'; color = '#b86a1e'; }
  else if (bmi < 25)   { cat = 'Normal';    color = '#0d6e64'; }
  else if (bmi < 30)   { cat = 'Sobrepeso'; color = '#9a5b00'; }
  else                 { cat = 'Obesidad';  color = '#a92a1e'; }

  const bmiClamp = Math.max(14, Math.min(40, bmi));
  const build = Math.max(0, Math.min(1, (bmiClamp - 17) / 16));
  const fat = Math.max(0.08, Math.min(0.95, (bmiClamp - 15) / 26));
  const targ = { bmi, A, rho, fatH, fatM, cat, color, build, fat };
  if (bmiAnim) cancelAnimationFrame(bmiAnim);

  const __f = (window as any).fitCanvas(canvas);
  const ctx = __f.ctx;
  const W = __f.W, H = __f.H;
  (window as any).__stage('sim-bmi','ÍNDICES',cat+' · IMC '+bmi.toFixed(1).replace('.',','),'amber','calculator');

  const prev = bmiLast || targ;
  const t0 = performance.now();
  const D = 750;
  (function frame(now){
    const t = Math.min(1, (now - t0) / D);
    const e = 1 - Math.pow(1 - t, 3);
    const cur = {
      build: prev.build + (targ.build - prev.build) * e,
      fat: prev.fat + (targ.fat - prev.fat) * e,
      bmi: prev.bmi + (targ.bmi - prev.bmi) * e,
      A: prev.A + (targ.A - prev.A) * e
    };
    ctx.clearRect(0,0,W,H);

    const figW = W * 0.46;
    const fx = figW * 0.52;
    const fTop = H * 0.10;
    const fH = H * 0.80;
    const p = window.CFXBody.buildParams(cur.build, 0.5, cur.fat);
    const tint = cur.bmi >= 30 ? '#caa05a' : (cur.bmi >= 25 ? '#d2b483' : (cur.bmi < 18.5 ? '#e8cfa6' : '#dcb277'));
    if (window.CFX && window.CFX.figure) {
      window.CFX.figure(ctx, fx, fTop, fH, p, { tint: tint, modeling: true });
    }
    if (window.CFX && window.CFX.dimV) {
      window.CFX.dimV(ctx, fx - figW*0.42, fTop + 4, fTop + fH, h.toFixed(2).replace('.',',')+' m', '#6b7885', { side:'left', W: W });
    }
    ctx.fillStyle = '#43505c'; ctx.font = 'bold 10px JetBrains Mono, monospace'; ctx.textAlign='center';
    ctx.fillText(m+' kg', fx, fTop + fH + 16);

    const px = W * 0.62, pw = W * 0.34;
    const barX = px + pw*0.18, barY = H*0.16, barH = H*0.62;
    const vMin=12, vMax=42;
    const yFor = v => barY + barH * (1 - (v - vMin)/(vMax - vMin));
    const bands = [[12,18.5,'rgba(184,106,30,.18)'],[18.5,25,'rgba(13,110,100,.18)'],[25,30,'rgba(154,91,0,.18)'],[30,42,'rgba(169,42,30,.18)']];
    bands.forEach(b=>{ ctx.fillStyle=b[2]; ctx.fillRect(barX-6, yFor(b[1]), 12, yFor(b[0])-yFor(b[1])); });
    ctx.strokeStyle='rgba(35,44,54,.25)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(barX,barY); ctx.lineTo(barX,barY+barH); ctx.stroke();
    const my = yFor(cur.bmi);
    ctx.fillStyle = cur.color; ctx.beginPath(); ctx.arc(barX, my, 6, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
    [{v:18.5,t:'bajo'},{v:25,t:'normal'},{v:30,t:'sobre'},{v:40,t:'obes.'}].forEach(s=>{
      const yy=yFor(s.v); ctx.strokeStyle='rgba(35,44,54,.3)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(barX-9,yy); ctx.lineTo(barX+9,yy); ctx.stroke();
      ctx.fillStyle='#6b7885'; ctx.font='8px Karla, system-ui, sans-serif'; ctx.textAlign='left'; ctx.fillText(s.t, barX+12, yy+3);
    });
    ctx.fillStyle='#43505c'; ctx.font='bold 9px Karla, system-ui, sans-serif'; ctx.textAlign='center';
    ctx.fillText('IMC', barX, barY-6);

    const cxD = px + pw*0.72, cyD = H*0.45, rMax = H*0.20;
    const areaFrac = Math.max(0.18, Math.min(1, A/2.6));
    ctx.save();
    ctx.fillStyle='rgba(13,110,100,.12)'; ctx.beginPath(); ctx.arc(cxD,cyD,rMax,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(13,110,100,.30)'; ctx.beginPath(); ctx.arc(cxD,cyD,rMax*Math.sqrt(areaFrac),0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#0d6e64'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(cxD,cyD,rMax*Math.sqrt(areaFrac),0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='#0d6e64'; ctx.font='bold 12px JetBrains Mono, monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(A.toFixed(2).replace('.',',')+' m²', cxD, cyD);
    ctx.fillStyle='#6b7885'; ctx.font='7px Karla, system-ui, sans-serif'; ctx.textBaseline='alphabetic';
    ctx.fillText('Área · Du Bois', cxD, cyD + rMax + 10);
    ctx.restore();

    ctx.fillStyle='#b86a1e'; ctx.font='9px JetBrains Mono, monospace'; ctx.textAlign='left';
    ctx.fillText('Grasa H/M: '+fatH.toFixed(1).replace('.',',')+' / '+fatM.toFixed(1).replace('.',',')+' %', px, H*0.9);

    if (t<1) bmiAnim = requestAnimationFrame(frame); else { bmiAnim=null; bmiLast=targ; }
  })(performance.now());
  bmiLast = targ;
}
window.calcBMI = calcBMI;


/* ── Reactivar bucles al volver a cada slide ── */
(function () {
  const _redraw = window.redrawSlide;
  window.redrawSlide = function (n) {
    if (typeof _redraw === 'function') _redraw(n);
    if (n === 4 && window.startGLRaf) startGLRaf();
    if (n === 5 && window.startJointsRaf) startJointsRaf();
    if (n === 6 && window.startMovementRaf && movementAnimationActive) startMovementRaf();
    // Módulo D · al entrar a cada slide, (re)lanzar la visualización.
    // Cada draw* cancela su propio RAF al inicio, así no hay bucles huérfanos.
    if (n === 12 && window.drawAllometry) drawAllometry();
    if (n === 13 && window.drawBoneScale) drawBoneScale();
    if (n === 14 && window.calcBMI) calcBMI();          // dispara el maniquí
    if (n === 15 && window.drawStevens) drawStevens();
  };
})();

/* ── Inicialización ── */
setTimeout(() => {
  try { setGLMode(6); } catch (e) {}
  try { startGLRaf(); } catch (e) {}
  try { setJoint('hinge'); } catch (e) {}
  try { startJointsRaf(); } catch (e) {}
  try { setMovement(currentMovement); } catch (e) {}
  if (window.go) go(0);
}, 300);



/* ===== DRAW BLOCK ===== */

/* ═══════════════════════════════════════════════════════════════════
   CFX · Capa visual compartida para el MÓDULO C (C1–C4)
   Escena con profundidad, chips legibles, acotaciones y gauges,
   al nivel de las placas anatómicas de la sección B.
   ═══════════════════════════════════════════════════════════════════ */
var CFX = (function () {
  'use strict';

  var PAL = {
    teal: '#0d6e64', tealDeep: '#0a5a52', tealLite: '#5fb39e',
    blood: '#a92a1e', bloodDeep: '#8c1f16',
    amber: '#9a5b00', amberLite: '#c0681e',
    violet: '#5d4fa8', violetLite: '#7c5fcf',
    ink: '#232c36', ink2: '#43505c', ink3: '#6b7885',
    paper: '#fbf8f0', line: '#cfc3a9',
    skin: 'rgba(214,168,126,0.55)', skinEdge: 'rgba(140,96,60,0.95)',
    fat: 'rgba(238,206,140,0.72)', musc: 'rgba(176,47,38,0.62)',
    bone: '#ece4cf', boneEdge: 'rgba(48,59,70,0.85)'
  };

  /* ── Escena: viñeta + suelo + retícula técnica tenue ── */
  function scene(ctx, W, H, opts) {
    opts = opts || {};
    var floorY = opts.floorY != null ? opts.floorY : H * 0.9;
    ctx.save();
    // Retícula milimetrada muy tenue
    if (opts.grid !== false) {
      ctx.strokeStyle = 'rgba(35,44,54,0.05)'; ctx.lineWidth = 1;
      var g = opts.gridStep || 26;
      for (var x = g; x < W; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (var y = g; y < H; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    // Halo cenital que centra la mirada
    if (opts.spot !== false) {
      var sx = opts.spotX != null ? opts.spotX : W * 0.5;
      var rg = ctx.createRadialGradient(sx, H * 0.34, 8, sx, H * 0.42, Math.max(W, H) * 0.62);
      rg.addColorStop(0, 'rgba(255,253,246,0.66)');
      rg.addColorStop(0.55, 'rgba(255,252,244,0.16)');
      rg.addColorStop(1, 'rgba(255,252,244,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }
    // Suelo con sombra de contacto
    if (opts.floor) {
      var fg = ctx.createLinearGradient(0, floorY - 26, 0, floorY + 14);
      fg.addColorStop(0, 'rgba(35,44,54,0)');
      fg.addColorStop(1, 'rgba(35,44,54,0.13)');
      ctx.fillStyle = fg; ctx.fillRect(0, floorY - 26, W, 40);
      ctx.strokeStyle = 'rgba(35,44,54,0.22)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(W * 0.06, floorY); ctx.lineTo(W * 0.94, floorY); ctx.stroke();
    }
    // Viñeta perimetral (profundidad)
    var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.32, W / 2, H / 2, Math.max(W, H) * 0.78);
    vg.addColorStop(0, 'rgba(35,44,54,0)');
    vg.addColorStop(1, 'rgba(35,44,54,0.15)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ── Sombra elíptica de contacto bajo una figura ── */
  function contactShadow(ctx, cx, y, rx, alpha) {
    ctx.save();
    var g = ctx.createRadialGradient(cx, y, 1, cx, y, rx);
    g.addColorStop(0, 'rgba(35,44,54,' + (alpha || 0.3) + ')');
    g.addColorStop(1, 'rgba(35,44,54,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx, y, rx, rx * 0.19, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ── Chip de etiqueta legible (fondo opaco + borde tonal) ── */
  function chip(ctx, x, y, text, opts) {
    opts = opts || {};
    var color = opts.color || PAL.teal;
    var fs = (typeof text === 'string' && / m$/.test(text)) ? Math.max(opts.size || 10, 12) : (opts.size || 10);
    var bold = opts.bold !== false;
    ctx.save();
    ctx.font = (bold ? 'bold ' : '') + fs + 'px ' + (opts.mono ? 'JetBrains Mono, monospace' : 'Karla, system-ui, sans-serif');
    var tw = ctx.measureText(text).width;
    var padX = 6, padY = 4, h = fs + padY * 2, w = tw + padX * 2;
    var ax = opts.align === 'right' ? x - w : opts.align === 'center' ? x - w / 2 : x;
    var ay = y - h / 2;
    ax = Math.max(3, Math.min(ax, (opts.W || 1e5) - w - 3));
    if (opts.link) {
      ctx.strokeStyle = color; ctx.globalAlpha = 0.42; ctx.lineWidth = 1; ctx.setLineDash([2.5, 2.5]);
      ctx.beginPath(); ctx.moveTo(opts.link[0], opts.link[1]); ctx.lineTo(ax + w / 2, y); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(35,44,54,0.10)';
    roundRect(ctx, ax + 1, ay + 1.5, w, h, 5); ctx.fill();
    ctx.fillStyle = opts.fill || 'rgba(251,248,240,0.97)';
    ctx.strokeStyle = color; ctx.lineWidth = 1.1;
    roundRect(ctx, ax, ay, w, h, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = opts.textColor || PAL.ink;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text, ax + padX, y + 0.5);
    ctx.restore();
    return { x: ax, y: ay, w: w, h: h };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ── Título de escena ── */
  function title(ctx, W, main, sub, color, xCenter, subColor) {
    ctx.save();
    const isStandardHuman = typeof main === 'string' && main.includes('Hombre Estándar');
    const isSegmental = typeof main === 'string' && main.includes('Proporciones segmentarias');
    const isMobility = typeof main === 'string' && main.includes('Rango de movilidad');
    const isSomatotype = typeof main === 'string' && main.includes('Los tres somatotipos');
    const titleX = xCenter == null ? (isStandardHuman ? W * 0.31 : isSegmental ? W * 0.27 : W / 2) : xCenter;
    const displayMain = isStandardHuman ? '⚖ Hombre Estándar · 70 kg' : isSegmental ? '📏 Proporciones' : main;
    const mainSize = isStandardHuman ? Math.max(15, Math.min(18, W * 0.033)) : isSegmental ? Math.max(14, Math.min(16, W * 0.029)) : isMobility || isSomatotype ? Math.max(16, Math.min(21, W * 0.038)) : 13;
    const subSize = isStandardHuman || isSegmental ? Math.max(11.5, Math.min(14, W * 0.024)) : isMobility || isSomatotype ? Math.max(12, Math.min(15, W * 0.027)) : 9.5;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color || PAL.tealDeep;
    ctx.font = `bold ${mainSize}px Karla, system-ui, sans-serif`;
    ctx.fillText(displayMain, titleX, 20);
    if (sub) {
      ctx.fillStyle = subColor || (isStandardHuman || isMobility || isSomatotype ? PAL.ink : PAL.ink3); ctx.font = `${subSize}px Karla, system-ui, sans-serif`;
      ctx.fillText(sub, titleX, 34);
    }
    ctx.restore();
  }

  /* ── Pie de escena ── */
  function footnote(ctx, W, H, text) {
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    // El lienzo puede mostrarse mucho más grande en pantalla completa; mantener
    // el pie en 9.5 px lo vuelve ilegible en navegadores externos.
    var fs = Math.max(12, Math.min(16, W * 0.026));
    var lines = [text];
    ctx.font = 'bold ' + fs + 'px JetBrains Mono, monospace';
    var sourceLines = ctx.measureText(text).width > W - 24 && text.indexOf('   ·   ') >= 0
      ? text.split('   ·   ') : [text];
    lines = [];
    sourceLines.forEach(function (sourceLine) {
      var current = '';
      sourceLine.split(' ').forEach(function (word) {
        var candidate = current ? current + ' ' + word : word;
        if (current && ctx.measureText(candidate).width > W - 24) {
          lines.push(current); current = word;
        } else current = candidate;
      });
      if (current) lines.push(current);
    });
    // Ajuste final para que cada línea respete el ancho disponible.
    while (fs > 11 && lines.some(function (line) { return ctx.measureText(line).width > W - 24; })) {
      fs -= 0.5;
      ctx.font = 'bold ' + fs + 'px JetBrains Mono, monospace';
    }
    var tw = Math.max.apply(null, lines.map(function (line) { return ctx.measureText(line).width; }));
    // cinta de fondo para asegurar contraste sobre la retícula
    ctx.fillStyle = 'rgba(251,248,240,0.92)';
    var lineH = fs + 3;
    var bandH = lines.length * lineH + 8;
    roundRect(ctx, W / 2 - tw / 2 - 10, H - bandH - 3, tw + 20, bandH, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(207,195,169,0.8)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = PAL.ink;
    var superscriptDigits = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    lines.forEach(function (line, i) {
      var y = H - 8 - (lines.length - 1 - i) * lineH;
      /* La coma decimal de un exponente debe compartir su altura; al
         dibujarla como parte del texto normal queda pegada a la línea base. */
      if (line.indexOf(',') >= 0) {
        var x = W / 2 - ctx.measureText(line).width / 2;
        ctx.textAlign = 'left';
        Array.from(line).forEach(function (char, index) {
          var charWidth = ctx.measureText(char).width;
          var elevated = char === ',' && superscriptDigits.indexOf(line[index - 1] || '') >= 0 && superscriptDigits.indexOf(line[index + 1] || '') >= 0;
          ctx.fillText(char, x, elevated ? y - fs * 0.34 : y);
          x += charWidth;
        });
        ctx.textAlign = 'center';
      } else {
        ctx.fillText(line, W / 2, y);
      }
    });
    ctx.restore();
  }

  return {
    PAL: PAL, scene: scene, contactShadow: contactShadow,
    chip: chip, roundRect: roundRect, title: title, footnote: footnote
  };
})();

/* ═══════════════════════════════════════════════════════════════════
   CFX.body · Figura humana anatómica paramétrica
   Proporciones fieles a la Tabla 1.6 (L/H) del Cap. 1.
   Silueta construida con curvas (no rectángulos): cuello, deltoides,
   caja torácica, cintura, pelvis, muslo, gemelo, tobillo, pie.
   Parámetros: build (0=ecto, .5=meso, 1=endo), musc, fat, sexo neutro.
   ═══════════════════════════════════════════════════════════════════ */
export var CFXBody: any = {};
(function () {
  'use strict';
  var PAL = CFX.PAL;

  /* Fracciones de la altura H (Tabla 1.6) */
  var F = {
    head: 0.130, neck: 0.052, shoulderW: 0.259, chestW: 0.174,
    hipW: 0.191, thigh: 0.245, calf: 0.246, ankle: 0.039,
    foot: 0.152, upperArm: 0.186, forearm: 0.146, hand: 0.108
  };
  /* Puntos de referencia verticales, con y=0 en la coronilla y H hacia abajo */
  function landmarks(H) {
    var headB = F.head * H;                 // base del cráneo
    var neckB = headB + F.neck * H;         // base del cuello = línea de hombros
    var ankle = H - F.ankle * H;            // eje del tobillo
    var knee = ankle - F.calf * H;          // eje de la rodilla
    var hip = knee - F.thigh * H;           // eje de la cadera
    var waist = hip - (hip - neckB) * 0.38; // cintura
    return { crown: 0, headB: headB, neck: neckB, waist: waist, hip: hip, knee: knee, ankle: ankle, sole: H };
  }

  /* Contorno de medio cuerpo (lado derecho) como lista de {y, w} */
  function halfProfile(H, p) {
    var L = landmarks(H);
    var sh = F.shoulderW * H * 0.5 * p.shoulder;
    var ch = F.chestW * H * 0.5 * p.chest;
    var wa = ch * p.waist;
    var hp = F.hipW * H * 0.5 * p.hip;
    var th = hp * 0.62 * p.thighW;
    var cf = th * 0.72 * p.calfW;
    var an = cf * 0.42;
    return { L: L, sh: sh, ch: ch, wa: wa, hp: hp, th: th, cf: cf, an: an };
  }

  /* Perfiles de constitución */
  function buildParams(build, musc, fat) {
    build = build == null ? 0.5 : build;
    musc = musc == null ? 0.5 : musc;
    fat = fat == null ? 0.3 : fat;
    // ecto: hombros ≤ caderas · meso: hombros ≫ caderas · endo: ambos anchos, cintura gruesa
    var ecto = Math.max(0, 1 - build * 2);
    var endo = Math.max(0, build * 2 - 1);
    var meso = 1 - Math.abs(build - 0.5) * 2;
    return {
      shoulder: 0.86 + 0.30 * meso + 0.20 * endo + 0.16 * musc,
      chest: 0.84 + 0.26 * meso + 0.34 * endo + 0.14 * musc,
      waist: 0.78 + 0.10 * meso + 0.48 * endo + 0.30 * fat - 0.08 * ecto,
      hip: 0.92 + 0.10 * ecto + 0.30 * endo + 0.16 * fat,
      thighW: 0.88 + 0.24 * meso + 0.30 * endo + 0.16 * musc + 0.12 * fat,
      calfW: 0.90 + 0.22 * meso + 0.16 * endo + 0.18 * musc,
      armW: 0.86 + 0.30 * meso + 0.20 * endo + 0.24 * musc + 0.10 * fat,
      musc: musc, fat: fat, ecto: ecto, meso: meso, endo: endo
    };
  }

  /* ── Silueta cerrada del torso+piernas (SIN cabeza: la pinta CFX.anatHead) ── */
  function silhouettePath(ctx, cx, top, H, p) {
    var g = halfProfile(H, p);
    var L = g.L;
    var y = function (v) { return top + v; };
    // La cabeza ocupa la fracción completa de la tabla, desde la coronilla
    // hasta el mentón; así la cota de cabeza coincide con la figura dibujada.
    var headR = F.head * H * 0.54;
    var headC = y(headR * 0.78);
    var neckW = headR * 0.46;

    ctx.beginPath();
    // Cuerpo, empezando en el cuello derecho
    ctx.moveTo(cx + neckW, y(L.headB));
    // trapecio descendente hacia el acromion (hombro ANGULAR, no esfera)
    ctx.bezierCurveTo(
      cx + g.sh * 0.40, y(L.neck - H * 0.004),
      cx + g.sh * 0.80, y(L.neck + H * 0.004),
      cx + g.sh * 0.97, y(L.neck + H * 0.016));
    // deltoides: cae y se funde con el brazo
    ctx.quadraticCurveTo(cx + g.sh * 1.02, y(L.neck + H * 0.050), cx + g.ch * 1.02, y(L.neck + H * 0.082));
    // costillar
    ctx.quadraticCurveTo(cx + g.ch * 1.02, y(L.neck + H * 0.104), cx + g.ch, y(L.neck + (L.waist - L.neck) * 0.60));
    // cintura (masculina: descenso suave, sin reloj de arena)
    ctx.quadraticCurveTo(cx + g.wa * 1.00, y(L.waist), cx + g.wa * 1.03, y(L.waist + (L.hip - L.waist) * 0.38));
    // cresta ilíaca / cadera
    ctx.quadraticCurveTo(cx + g.hp * 1.05, y(L.hip - H * 0.020), cx + g.hp, y(L.hip + H * 0.014));
    // muslo derecho (vasto externo alto, se afina al cóndilo)
    ctx.quadraticCurveTo(cx + g.th * 1.18, y(L.hip + (L.knee - L.hip) * 0.32), cx + g.th * 0.90, y(L.knee - H * 0.024));
    // rodilla
    ctx.quadraticCurveTo(cx + g.th * 0.82, y(L.knee), cx + g.cf * 0.98, y(L.knee + H * 0.018));
    // gemelo: vientre alto y marcado, luego tendón de Aquiles fino
    ctx.quadraticCurveTo(cx + g.cf * 1.30, y(L.knee + (L.ankle - L.knee) * 0.30), cx + g.cf * 0.92, y(L.knee + (L.ankle - L.knee) * 0.66));
    ctx.quadraticCurveTo(cx + g.an * 1.42, y(L.ankle - H * 0.030), cx + g.an * 1.10, y(L.ankle));
    // tobillo (el pie lo dibuja CFX.anatFoot)
    ctx.lineTo(cx + g.an * 1.02, y(L.sole));
    ctx.lineTo(cx + g.an * 0.30, y(L.sole));
    // entrepierna: sube por dentro de la pierna derecha
    ctx.quadraticCurveTo(cx + g.an * 0.26, y(L.ankle), cx + g.an * 0.48, y(L.ankle - H * 0.022));
    ctx.quadraticCurveTo(cx + g.cf * 0.52, y(L.knee + (L.ankle - L.knee) * 0.36), cx + g.th * 0.30, y(L.knee - H * 0.010));
    ctx.quadraticCurveTo(cx + g.th * 0.26, y(L.hip + (L.knee - L.hip) * 0.30), cx + g.hp * 0.16, y(L.hip + H * 0.050));
    // entrepierna centro
    ctx.lineTo(cx - g.hp * 0.16, y(L.hip + H * 0.050));
    // pierna izquierda (espejo, de dentro hacia fuera)
    ctx.quadraticCurveTo(cx - g.th * 0.26, y(L.hip + (L.knee - L.hip) * 0.30), cx - g.th * 0.30, y(L.knee - H * 0.010));
    ctx.quadraticCurveTo(cx - g.cf * 0.52, y(L.knee + (L.ankle - L.knee) * 0.36), cx - g.an * 0.48, y(L.ankle - H * 0.022));
    ctx.quadraticCurveTo(cx - g.an * 0.26, y(L.ankle), cx - g.an * 0.30, y(L.sole));
    ctx.lineTo(cx - g.an * 1.02, y(L.sole));
    ctx.lineTo(cx - g.an * 1.10, y(L.ankle));
    ctx.quadraticCurveTo(cx - g.an * 1.42, y(L.ankle - H * 0.030), cx - g.cf * 0.92, y(L.knee + (L.ankle - L.knee) * 0.66));
    ctx.quadraticCurveTo(cx - g.cf * 1.30, y(L.knee + (L.ankle - L.knee) * 0.30), cx - g.cf * 0.98, y(L.knee + H * 0.018));
    ctx.quadraticCurveTo(cx - g.th * 0.82, y(L.knee), cx - g.th * 0.90, y(L.knee - H * 0.024));
    ctx.quadraticCurveTo(cx - g.th * 1.18, y(L.hip + (L.knee - L.hip) * 0.32), cx - g.hp, y(L.hip + H * 0.014));
    ctx.quadraticCurveTo(cx - g.hp * 1.05, y(L.hip - H * 0.020), cx - g.wa * 1.03, y(L.waist + (L.hip - L.waist) * 0.38));
    ctx.quadraticCurveTo(cx - g.wa * 1.00, y(L.waist), cx - g.ch, y(L.neck + (L.waist - L.neck) * 0.60));
    ctx.quadraticCurveTo(cx - g.ch * 1.02, y(L.neck + H * 0.104), cx - g.ch * 1.02, y(L.neck + H * 0.082));
    ctx.quadraticCurveTo(cx - g.sh * 1.02, y(L.neck + H * 0.050), cx - g.sh * 0.97, y(L.neck + H * 0.016));
    ctx.bezierCurveTo(
      cx - g.sh * 0.80, y(L.neck + H * 0.004),
      cx - g.sh * 0.40, y(L.neck - H * 0.004),
      cx - neckW, y(L.headB));
    ctx.closePath();
    return { g: g, L: L, y: y, headR: headR, headC: headC, neckW: neckW };
  }

  /* ── Brazos: húmero cónico + antebrazo fusiforme + mano con dedos ── */
  function arms(ctx, cx, top, H, p, opts) {
    opts = opts || {};
    var g = halfProfile(H, p), L = g.L;
    var y = function (v) { return top + v; };
    var wUp = H * 0.030 * p.armW;      // grosor del brazo (deltoides→codo)
    var wFo = H * 0.024 * p.armW;      // grosor del antebrazo
    var swing = opts.swing || 0;
    [-1, 1].forEach(function (s) {
      var sx = cx + s * g.sh * 0.90, sy = y(L.neck + H * 0.030);
      var ex = cx + s * (g.wa * 1.14 + wUp * 0.30) + s * swing * H * 0.010;
      var ey = sy + F.upperArm * H;
      var wx = cx + s * (g.hp * 1.00 + wFo * 0.20) + s * swing * H * 0.020;
      var wy = ey + F.forearm * H;

      // Brazo (cono: grueso en deltoides, fino en codo)
      taper(ctx, sx, sy, ex, ey, wUp * 1.12, wUp * 0.70,
        opts.fill || CFX.PAL.skin, opts.edge || CFX.PAL.skinEdge, 0.28 * s);
      // Antebrazo (fusiforme: vientre alto, muñeca fina)
      taper(ctx, ex, ey, wx, wy, wFo * 1.06, wFo * 0.58,
        opts.fill || CFX.PAL.skin, opts.edge || CFX.PAL.skinEdge, 0.20 * s);

      // Epicóndilos del codo
      ctx.save();
      ctx.globalAlpha = 0.30; ctx.strokeStyle = opts.edge || CFX.PAL.skinEdge; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ex, ey, wUp * 0.52, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      // Mano anatómica (eje alineado con el antebrazo)
      var handLen = F.hand * H * 0.92;
      var ang = Math.atan2(wy - ey, wx - ex) - Math.PI / 2;
      CFX.anatHand(ctx, wx, wy, handLen, ang, s,
        opts.fill || CFX.PAL.skin, opts.edge || CFX.PAL.skinEdge);

      if (opts.report) opts.report(s, { sx: sx, sy: sy, ex: ex, ey: ey, wx: wx, wy: wy });
    });
  }

  /* Segmento cónico con brillo axial (simula volumen cilíndrico) */
  function taper(ctx, x1, y1, x2, y2, w1, w2, fill, edge, bow) {
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len;          // normal
    var mx = (x1 + x2) / 2 + nx * len * (bow || 0) * 0.10;
    var my = (y1 + y2) / 2 + ny * len * (bow || 0) * 0.10;
    var wm = (w1 + w2) * 0.56;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1 + nx * w1, y1 + ny * w1);
    ctx.quadraticCurveTo(mx + nx * wm, my + ny * wm, x2 + nx * w2, y2 + ny * w2);
    ctx.quadraticCurveTo(x2 + nx * w2 * 0.1 + dx / len * w2 * 0.9, y2 + ny * w2 * 0.1 + dy / len * w2 * 0.9,
      x2 - nx * w2, y2 - ny * w2);
    ctx.quadraticCurveTo(mx - nx * wm, my - ny * wm, x1 - nx * w1, y1 - ny * w1);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 1.2; ctx.stroke();
    // brillo axial desplazado
    ctx.globalAlpha = 0.30;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(1, w1 * 0.34);
    ctx.beginPath();
    ctx.moveTo(x1 + nx * w1 * 0.34, y1 + ny * w1 * 0.34);
    ctx.quadraticCurveTo(mx + nx * wm * 0.36, my + ny * wm * 0.36, x2 + nx * w2 * 0.30, y2 + ny * w2 * 0.30);
    ctx.stroke();
    ctx.restore();
  }

  CFXBody.F = F;
  CFXBody.landmarks = landmarks;
  CFXBody.halfProfile = halfProfile;
  CFXBody.buildParams = buildParams;
  CFXBody.silhouettePath = silhouettePath;
  CFXBody.arms = arms;
  (window as any).CFXBody = CFXBody;
})();

/* ═══════════════════════════════════════════════════════════════════
   CFX.anat · Piezas anatómicas de detalle
   Cráneo con mandíbula, cuello con ECM/trapecio, mano con 5 dedos,
   pie con arco plantar y dedos. Corrige los defectos de "esfera".
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── CABEZA: cráneo + mandíbula, no un óvalo ──
     r = radio craneal; devuelve la caja para encajar el cuello       */
  function head(ctx, cx, cy, r, fill, edge, opts) {
    opts = opts || {};
    ctx.save();
    ctx.beginPath();
    // bóveda craneal
    ctx.moveTo(cx - r * 0.80, cy + r * 0.10);
    ctx.bezierCurveTo(cx - r * 0.86, cy - r * 0.78, cx + r * 0.86, cy - r * 0.78, cx + r * 0.80, cy + r * 0.10);
    // pómulo y mandíbula derecha
    ctx.bezierCurveTo(cx + r * 0.78, cy + r * 0.52, cx + r * 0.46, cy + r * 0.86, cx + r * 0.16, cy + r * 0.98);
    // mentón
    ctx.quadraticCurveTo(cx, cy + r * 1.06, cx - r * 0.16, cy + r * 0.98);
    // mandíbula izquierda
    ctx.bezierCurveTo(cx - r * 0.46, cy + r * 0.86, cx - r * 0.78, cy + r * 0.52, cx - r * 0.80, cy + r * 0.10);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = opts.lw || 1.3; ctx.stroke();

    // oreja (pegada al cráneo, dentro del contorno)
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.66, cy + r * 0.16, r * 0.14, r * 0.24, 0.10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.66, cy + r * 0.16, r * 0.14, r * 0.24, -0.10, 0, Math.PI * 2);
    ctx.stroke();
    // línea del cabello / arco superciliar
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.62, cy - r * 0.22);
    ctx.quadraticCurveTo(cx, cy - r * 0.40, cx + r * 0.62, cy - r * 0.22);
    ctx.stroke();
    ctx.restore();
  }

  /* ── CUELLO: ECM + trapecio, con masa real ── */
  function neck(ctx, cx, yTop, yBot, w, fill, edge) {
    var h = yBot - yTop;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - w, yTop);
    // se ensancha hacia la base (trapecio)
    ctx.bezierCurveTo(cx - w * 1.10, yTop + h * 0.52, cx - w * 1.80, yBot - h * 0.16, cx - w * 2.70, yBot);
    ctx.lineTo(cx + w * 2.70, yBot);
    ctx.bezierCurveTo(cx + w * 1.80, yBot - h * 0.16, cx + w * 1.10, yTop + h * 0.52, cx + w, yTop);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 1.2; ctx.stroke();
    // relieve de los esternocleidomastoideos
    ctx.globalAlpha = 0.26;
    ctx.lineWidth = 1;
    [-1, 1].forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(cx + s * w * 0.62, yTop + h * 0.10);
      ctx.quadraticCurveTo(cx + s * w * 0.50, yTop + h * 0.60, cx + s * w * 0.18, yBot - h * 0.04);
      ctx.stroke();
    });
    // hueco supraesternal
    ctx.beginPath();
    ctx.arc(cx, yBot - h * 0.06, w * 0.26, Math.PI, 0);
    ctx.stroke();
    ctx.restore();
  }

  /* ── MANO: palma + 4 dedos + pulgar ──
     ang = orientación del eje (rad); len = longitud total de la mano  */
  function hand(ctx, x, y, len, ang, side, fill, edge) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    var w = len * 0.46;
    ctx.fillStyle = fill; ctx.strokeStyle = edge; ctx.lineWidth = 1;
    // palma (metacarpo), ligeramente trapezoidal
    ctx.beginPath();
    ctx.moveTo(-w * 0.46, 0);
    ctx.quadraticCurveTo(-w * 0.56, len * 0.30, -w * 0.40, len * 0.50);
    ctx.lineTo(w * 0.40, len * 0.50);
    ctx.quadraticCurveTo(w * 0.56, len * 0.30, w * 0.46, 0);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // 4 dedos
    var fl = [0.42, 0.50, 0.47, 0.38];   // índice, medio, anular, meñique
    var fx = [-0.30, -0.10, 0.10, 0.30];
    for (var i = 0; i < 4; i++) {
      var px = fx[i] * w * 1.5;
      ctx.beginPath();
      ctx.moveTo(px - w * 0.115, len * 0.48);
      ctx.lineTo(px - w * 0.10, len * (0.48 + fl[i] * 0.62));
      ctx.quadraticCurveTo(px, len * (0.50 + fl[i] * 0.70), px + w * 0.10, len * (0.48 + fl[i] * 0.62));
      ctx.lineTo(px + w * 0.115, len * 0.48);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    // pulgar (oponible, sale del borde radial)
    var s = side < 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(s * w * 0.42, len * 0.12);
    ctx.quadraticCurveTo(s * w * 0.94, len * 0.20, s * w * 0.88, len * 0.46);
    ctx.quadraticCurveTo(s * w * 0.72, len * 0.54, s * w * 0.44, len * 0.42);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  /* ── PIE de perfil: talón, arco plantar y dedos ── */
  function foot(ctx, x, yAnkle, ySole, len, dir, fill, edge) {
    var s = dir < 0 ? -1 : 1;
    var h = ySole - yAnkle;
    ctx.save();
    ctx.fillStyle = fill; ctx.strokeStyle = edge; ctx.lineWidth = 1.1;
    ctx.beginPath();
    // tobillo → talón (posterior)
    ctx.moveTo(x - s * h * 0.42, yAnkle);
    ctx.quadraticCurveTo(x - s * h * 0.72, yAnkle + h * 0.52, x - s * h * 0.52, ySole);
    // planta
    ctx.lineTo(x + s * (len - h * 0.16), ySole);
    // dedos (borde anterior redondeado)
    ctx.quadraticCurveTo(x + s * len, ySole, x + s * len, ySole - h * 0.30);
    // empeine hacia el tobillo
    ctx.quadraticCurveTo(x + s * len * 0.52, yAnkle + h * 0.30, x + s * h * 0.44, yAnkle);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // arco plantar
    ctx.globalAlpha = 0.30;
    ctx.beginPath();
    ctx.moveTo(x - s * h * 0.30, ySole);
    ctx.quadraticCurveTo(x + s * len * 0.34, ySole - h * 0.34, x + s * (len - h * 0.30), ySole);
    ctx.stroke();
    // maléolo
    ctx.globalAlpha = 0.38;
    ctx.beginPath();
    ctx.arc(x, yAnkle + h * 0.06, h * 0.20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  CFX.anatHead = head;
  CFX.anatNeck = neck;
  CFX.anatHand = hand;
  CFX.anatFoot = foot;
})();

/* ═══════════════════════════════════════════════════════════════════
   CFX.render · Pintado de la figura con volumen + widgets de medida
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var PAL = CFX.PAL, B = window.CFXBody;

  /* ── Figura completa con volumen (gradiente lateral + brillo + borde) ── */
  function figure(ctx, cx, top, H, p, opts) {
    opts = opts || {};
    var tint = opts.tint || null;   // color de acento para la piel
    var geo;
    ctx.save();

    // Sombra de contacto en el suelo
    if (opts.shadow !== false) CFX.contactShadow(ctx, cx, top + H + 3, H * 0.115, 0.26);

    // Silueta base
    ctx.save();
    geo = B.silhouettePath(ctx, cx, top, H, p);
    var w = geo.g.sh;
    var lg = ctx.createLinearGradient(cx - w * 1.15, 0, cx + w * 1.15, 0);
    if (tint) {
      lg.addColorStop(0, shade(tint, 0.52, 0.30));
      lg.addColorStop(0.30, shade(tint, 0.92, 0.62));
      lg.addColorStop(0.52, shade(tint, 1.16, 0.70));
      lg.addColorStop(0.82, shade(tint, 0.80, 0.58));
      lg.addColorStop(1, shade(tint, 0.46, 0.34));
    } else {
      lg.addColorStop(0, 'rgba(150,104,68,0.42)');
      lg.addColorStop(0.30, 'rgba(206,160,118,0.62)');
      lg.addColorStop(0.52, 'rgba(232,192,152,0.72)');
      lg.addColorStop(0.82, 'rgba(196,148,106,0.58)');
      lg.addColorStop(1, 'rgba(142,96,60,0.44)');
    }
    ctx.fillStyle = lg;
    ctx.fill('evenodd');
    ctx.strokeStyle = opts.edge || PAL.skinEdge;
    ctx.lineWidth = opts.lw || 1.5;
    ctx.stroke();
    ctx.restore();

    // Cabeza, cuello y pies anatómicos (van sobre la silueta)
    var skinFill = tint ? shade(tint, 1.02, 0.66) : 'rgba(216,170,126,0.82)';
    var skinEdge = opts.edge || PAL.skinEdge;
    var L0 = geo.L, g0 = geo.g;
    // cuello primero (queda por debajo del mentón)
    CFX.anatNeck(ctx, cx, top + L0.headB - H * 0.004, top + L0.neck + H * 0.012,
      geo.neckW, skinFill, skinEdge);
    CFX.anatHead(ctx, cx, geo.headC, geo.headR, skinFill, skinEdge, { lw: opts.lw || 1.4 });
    // pies: uno por lado, apuntando hacia afuera
    [-1, 1].forEach(function (s) {
      CFX.anatFoot(ctx, cx + s * g0.an * 0.66, top + L0.ankle, top + L0.sole,
        B.F.foot * H * 0.74, s, skinFill, skinEdge);
    });

    // Brazos por encima de la silueta
    B.arms(ctx, cx, top, H, p, {
      fill: tint ? shade(tint, 0.92, 0.60) : 'rgba(212,168,126,0.62)',
      edge: opts.edge || PAL.skinEdge, swing: opts.swing || 0, report: opts.reportArm
    });

    // Modelado interno: pectoral, línea alba, cintura, rótulas
    if (opts.modeling !== false) modeling(ctx, cx, top, H, p, geo);

    ctx.restore();
    return geo;
  }

  /* Sombreado anatómico interno que rompe la planitud */
  function modeling(ctx, cx, top, H, p, geo) {
    var L = geo.L, g = geo.g, y = geo.y;
    ctx.save();
    ctx.globalAlpha = 0.30;
    ctx.strokeStyle = 'rgba(120,74,44,0.75)';
    ctx.lineWidth = 1.1;
    // Clavículas
    ctx.beginPath();
    ctx.moveTo(cx - g.sh * 0.72, y(L.neck + H * 0.018));
    ctx.quadraticCurveTo(cx, y(L.neck + H * 0.034), cx + g.sh * 0.72, y(L.neck + H * 0.018));
    ctx.stroke();
    // Surco pectoral / línea alba
    var pecY = y(L.neck + (L.waist - L.neck) * 0.30);
    ctx.beginPath();
    ctx.moveTo(cx, pecY);
    ctx.lineTo(cx, y(L.waist + (L.hip - L.waist) * 0.42));
    ctx.stroke();
    // Arco costal
    ctx.beginPath();
    ctx.moveTo(cx - g.ch * 0.74, pecY + H * 0.030);
    ctx.quadraticCurveTo(cx, pecY + H * 0.068, cx + g.ch * 0.74, pecY + H * 0.030);
    ctx.stroke();
    // Pliegue inguinal
    ctx.beginPath();
    ctx.moveTo(cx - g.hp * 0.78, y(L.hip + H * 0.006));
    ctx.quadraticCurveTo(cx, y(L.hip + H * 0.052), cx + g.hp * 0.78, y(L.hip + H * 0.006));
    ctx.stroke();
    // Ombligo
    ctx.globalAlpha = 0.24;
    var navY = y(L.waist + (L.hip - L.waist) * 0.30);
    ctx.beginPath();
    ctx.ellipse(cx, navY, H * 0.006, H * 0.010, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Crestas ilíacas (asoman en la cadera)
    ctx.globalAlpha = 0.20;
    [-1, 1].forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(cx + s * g.wa * 0.70, y(L.waist + (L.hip - L.waist) * 0.34));
      ctx.quadraticCurveTo(cx + s * g.hp * 0.94, y(L.hip - H * 0.010), cx + s * g.hp * 0.66, y(L.hip + H * 0.020));
      ctx.stroke();
    });
    ctx.globalAlpha = 0.30;
    // Rótulas
    [-1, 1].forEach(function (s) {
      ctx.beginPath();
      ctx.ellipse(cx + s * g.th * 0.56, y(L.knee), g.cf * 0.30, H * 0.014, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    // Definición muscular extra si musc alto
    if (p.musc > 0.45) {
      ctx.globalAlpha = 0.22 + 0.26 * (p.musc - 0.45);
      // deltoides
      [-1, 1].forEach(function (s) {
        ctx.beginPath();
        ctx.arc(cx + s * g.sh * 0.80, y(L.neck + H * 0.036), H * 0.030, 0, Math.PI * 2);
        ctx.stroke();
      });
      // abdominales
      for (var i = 0; i < 3; i++) {
        var ay = pecY + H * (0.052 + i * 0.030);
        ctx.beginPath();
        ctx.moveTo(cx - g.wa * 0.52, ay);
        ctx.quadraticCurveTo(cx, ay + H * 0.008, cx + g.wa * 0.52, ay);
        ctx.stroke();
      }
      // gemelos
      [-1, 1].forEach(function (s) {
        ctx.beginPath();
        ctx.moveTo(cx + s * g.cf * 0.34, y(L.knee + H * 0.030));
        ctx.quadraticCurveTo(cx + s * g.cf * 0.86, y(L.knee + (L.ankle - L.knee) * 0.40), cx + s * g.an * 0.90, y(L.ankle - H * 0.040));
        ctx.stroke();
      });
    }
    // Brillo cenital sobre pecho y muslos
    ctx.globalAlpha = 0.20;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - g.ch * 0.30, pecY - H * 0.010, g.ch * 0.34, H * 0.040, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function shade(hex, mul, alpha) {
    var r = parseInt(hex.slice(1, 3), 16), gg = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, Math.round(r * mul)); gg = Math.min(255, Math.round(gg * mul)); b = Math.min(255, Math.round(b * mul));
    return 'rgba(' + r + ',' + gg + ',' + b + ',' + alpha + ')';
  }

  /* ── Acotación vertical estilo plano técnico ── */
  function dimV(ctx, x, y1, y2, label, color, opts) {
    opts = opts || {};
    color = color || PAL.ink2;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.globalAlpha = opts.alpha != null ? opts.alpha : 0.85;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
    var tick = opts.tick || 4;
    [y1, y2].forEach(function (yy) {
      ctx.beginPath(); ctx.moveTo(x - tick, yy); ctx.lineTo(x + tick, yy); ctx.stroke();
    });
    // flechas internas
    if (Math.abs(y2 - y1) > 18) {
      arrow(ctx, x, y1, Math.PI / 2, color, 4);
      arrow(ctx, x, y2, -Math.PI / 2, color, 4);
    }
    ctx.globalAlpha = 1;
    if (label) {
      CFX.chip(ctx, x + (opts.side === 'left' ? -8 : 8), (y1 + y2) / 2, label,
        { color: color, size: opts.size || 9, mono: true, align: opts.side === 'left' ? 'right' : 'left', W: opts.W });
    }
    ctx.restore();
  }

  /* ── Acotación horizontal ── */
  function dimH(ctx, x1, x2, y, label, color, opts) {
    opts = opts || {};
    color = color || PAL.ink2;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.globalAlpha = opts.alpha != null ? opts.alpha : 0.85;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    var tick = opts.tick || 4;
    [x1, x2].forEach(function (xx) {
      ctx.beginPath(); ctx.moveTo(xx, y - tick); ctx.lineTo(xx, y + tick); ctx.stroke();
    });
    if (Math.abs(x2 - x1) > 18) {
      arrow(ctx, x1, y, 0, color, 4);
      arrow(ctx, x2, y, Math.PI, color, 4);
    }
    ctx.globalAlpha = 1;
    if (label) CFX.chip(ctx, (x1 + x2) / 2, y - (opts.above ? 13 : -13), label,
      { color: color, size: opts.size || 9, mono: true, align: 'center', W: opts.W });
    ctx.restore();
  }

  function arrow(ctx, x, y, ang, color, s) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * 1.6, -s * 0.55); ctx.lineTo(s * 1.6, s * 0.55);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* ── Gauge de arco (para métricas escalares) ── */
  function gauge(ctx, cx, cy, r, frac, color, label, value) {
    ctx.save();
    var a0 = Math.PI * 0.78, a1 = Math.PI * 2.22;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(35,44,54,0.11)'; ctx.lineWidth = r * 0.28;
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = r * 0.28;
    ctx.shadowBlur = 8; ctx.shadowColor = color;
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + (a1 - a0) * Math.max(0, Math.min(1, frac))); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color; ctx.font = 'bold ' + Math.round(r * 0.52) + 'px JetBrains Mono, monospace';
    ctx.fillText(value, cx, cy - r * 0.04);
      ctx.fillStyle = PAL.ink; ctx.font = 'bold ' + Math.round(r * 0.35) + 'px Karla, system-ui, sans-serif';
    ctx.fillText(label, cx, cy + r * 0.46);
    ctx.restore();
  }

  /* ── Barra horizontal con relieve ── */
  function bar(ctx, x, y, w, h, frac, color, opts) {
    opts = opts || {};
    ctx.save();
    CFX.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = 'rgba(35,44,54,0.09)'; ctx.fill();
    var fw = Math.max(h * 0.9, w * Math.max(0, Math.min(1, frac)));
    var g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, lighten(color, 34)); g.addColorStop(1, color);
    CFX.roundRect(ctx, x, y, fw, h, h / 2);
    ctx.fillStyle = g; ctx.fill();
    if (opts.glow) { ctx.shadowBlur = 7; ctx.shadowColor = color; ctx.fill(); ctx.shadowBlur = 0; }
    ctx.strokeStyle = 'rgba(255,255,255,0.42)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x + h * 0.4, y + h * 0.30); ctx.lineTo(x + fw - h * 0.4, y + h * 0.30); ctx.stroke();
    ctx.restore();
  }

  function lighten(hex, amt) {
    if (hex[0] !== '#') return hex;
    var r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
    var g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
    var b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  CFX.figure = figure;
  CFX.dimV = dimV;
  CFX.dimH = dimH;
  CFX.arrow = arrow;
  CFX.gauge = gauge;
  CFX.bar = bar;
  CFX.lighten = lighten;
  CFX.shade = shade;
  (window as any).CFX = CFX;
})();

export { CFX };

/* ═══════════════════════════════════════════════════════════════════
   C1 · EL HOMBRE ESTÁNDAR — escena viva
   Figura anatómica + ventana torácica con corazón (65 lpm) y pulmones
   (15/min) latiendo, ECG en vivo, acotación de estatura y gauges
   Du Bois (área) / Kleiber (TMB).
   ═══════════════════════════════════════════════════════════════════ */
export function drawBodyProportions(customMass?: number, customHeight?: number) {
  var canvas = document.getElementById('sim-body') as HTMLCanvasElement;
  if (!canvas || !canvas.parentElement || !canvas.parentElement.offsetParent) return;
  var mass = customMass != null ? customMass : (parseFloat((document.getElementById('massSlider') as any)?.value) || 70);
  var massDisp = document.getElementById('massDisplay');
  if (massDisp) massDisp.textContent = mass + ' kg';
  var Href = customHeight != null ? (customHeight / 100) : ((parseFloat((document.getElementById('heightSlider') as any)?.value) / 100) || 1.72);
  var __f = (window as any).fitCanvas(canvas);
  var ctx = __f.ctx, W = __f.W, H = __f.H;
  var t = (window as any).c2t || 0;
  var PAL = CFX.PAL;

  ctx.clearRect(0, 0, W, H);

  /* ── Física del Hombre Estándar (Tabla 1.5) ── */
  var ratio = mass / 70;
  var area = 0.202 * Math.pow(mass, 0.425) * Math.pow(Href, 0.725); // Du Bois
  var bmr = 70 * Math.pow(ratio, 0.75);                // Kleiber
  var bmi = mass / (Href * Href);
  var hr = 65, rr = 15;

  /* ── Escena ── */
  var floorY = H * 0.905;
  CFX.scene(ctx, W, H, { floor: true, floorY: floorY, spotX: W * 0.40, gridStep: 26 });
  CFX.title(ctx, W, '⚖ Hombre Estándar · 70 kg de referencia', 'Tabla 1.5 · valores fisiológicos en reposo');

  /* ── Figura ── */
  var bodyH = H * 0.66 * (Href / 1.72);
  var top = floorY - bodyH;
  var cx = W * 0.38;
  var fatFrac = Math.max(0, Math.min(1, (bmi - 17) / 18));
  var p = (window as any).CFXBody.buildParams(0.34 + 0.42 * fatFrac, 0.52, 0.18 + 0.62 * fatFrac);
  var breathe = 1 + 0.016 * Math.sin(t * 2 * Math.PI * rr / 60);
  p.chest *= breathe;

  var geo = CFX.figure(ctx, cx, top, bodyH, p, { swing: 0 });
  var L = geo.L, g = geo.g;
  var yy = function (v: number) { return top + v; };

  /* ── Ventana torácica: órganos vivos ── */
  organWindow(ctx, cx, top, bodyH, geo, t, hr, rr);

  /* ── Acotación de estatura ── */
  var dimX = cx - g.sh * 1.05 - 34;
  CFX.dimV(ctx, dimX, top, floorY, Href.toFixed(2).replace('.', ',') + ' m', PAL.tealDeep, { side: 'left', W: W, size: 9.5 });
  // marcas de referencia
  ctx.save();
  ctx.strokeStyle = 'rgba(13,110,100,0.28)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
  [['Hombro', L.neck], ['Cadera', L.hip], ['Rodilla', L.knee]].forEach(function (m) {
    ctx.beginPath(); ctx.moveTo(dimX + 6, yy(m[1])); ctx.lineTo(cx - g.hp * 0.9, yy(m[1])); ctx.stroke();
  });
  ctx.setLineDash([]); ctx.restore();

  /* ── Panel derecho: constantes vitales ── */
  // El panel necesita suficiente ancho para que los valores clínicos no
  // colisionen con sus etiquetas, especialmente en visores estrechos.
  var pw = Math.min(W * 0.42, 210), px = W - pw - 12;
  vitalsPanel(ctx, px, H * 0.13, pw, H, mass, area, bmr, bmi, hr, rr, t);

  /* ── HUD y pie ── */
  window.__stage('sim-body', 'REFERENCIA',
    mass + ' kg · ' + area.toFixed(2).replace('.', ',') + ' m²', 'teal', 'anatomy');
  CFX.footnote(ctx, W, H, 'Du Bois: A = 0,202 · m⁰,⁴²⁵ · H⁰,⁷²⁵   ·   Kleiber: TMB ∝ m⁰,⁷⁵');
}

/* ── Ventana torácica: mediastino, pulmones, diafragma e hígado ── */
function organWindow(ctx, cx, top, bodyH, geo, t, hr, rr) {
  var PAL = CFX.PAL, L = geo.L, g = geo.g;
  var yy = function (v) { return top + v; };
  // La cavidad va del 2º EIC hasta el reborde costal
  var yTopT = yy(L.neck + (L.waist - L.neck) * 0.16);
  var yBotT = yy(L.neck + (L.waist - L.neck) * 0.86);
  var cyT = (yTopT + yBotT) / 2;
  var rw = g.ch * 0.99, rh = (yBotT - yTopT) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cyT, rw, rh, 0, 0, Math.PI * 2);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(22,30,38,0.34)';
  ctx.fillRect(cx - rw, cyT - rh, rw * 2, rh * 2);

  var bre = 0.5 + 0.5 * Math.sin(t * 2 * Math.PI * rr / 60 - Math.PI / 2);

  /* Pulmones: 3 lóbulos dcho / 2 izq, con escotadura cardíaca */
  var lungS = 0.93 + 0.10 * bre;
  [-1, 1].forEach(function (s) {
    // s=+1 es el lado DERECHO en pantalla = pulmón IZQUIERDO del sujeto
    ctx.save();
    ctx.translate(cx + s * rw * 0.44, cyT - rh * 0.06);
    ctx.scale(s * lungS, lungS);
    var lg = ctx.createRadialGradient(0, -rh * 0.20, 2, 0, 0, rw * 0.46);
    lg.addColorStop(0, 'rgba(136,198,214,' + (0.50 + 0.24 * bre) + ')');
    lg.addColorStop(1, 'rgba(58,124,150,0.36)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(-rw * 0.02, -rh * 0.74);          // ápice
    ctx.quadraticCurveTo(rw * 0.40, -rh * 0.56, rw * 0.38, rh * 0.30);
    ctx.quadraticCurveTo(rw * 0.32, rh * 0.74, rw * 0.02, rh * 0.66);  // base diafragmática
    // borde mediastínico: escotadura cardíaca solo en el pulmón izq del sujeto
    if (s > 0) {
      ctx.quadraticCurveTo(-rw * 0.10, rh * 0.30, -rw * 0.02, rh * 0.06);
      ctx.quadraticCurveTo(-rw * 0.14, -rh * 0.24, -rw * 0.02, -rh * 0.74);
    } else {
      ctx.quadraticCurveTo(-rw * 0.06, rh * 0.10, -rw * 0.02, -rh * 0.74);
    }
    ctx.closePath(); ctx.fill();
    // tráquea/bronquio
    ctx.strokeStyle = 'rgba(240,248,250,0.30)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-rw * 0.02, -rh * 0.50);
    ctx.quadraticCurveTo(rw * 0.14, -rh * 0.20, rw * 0.20, rh * 0.14); ctx.stroke();
    ctx.restore();
  });

  /* Caja torácica por delante de los pulmones */
  ctx.strokeStyle = 'rgba(248,244,232,0.42)'; ctx.lineWidth = 1.3;
  for (var i = 0; i < 6; i++) {
    var ry = cyT - rh * 0.74 + i * rh * 0.30;
    var half = rw * (0.94 - Math.abs(i - 2.2) * 0.045);
    ctx.beginPath();
    ctx.moveTo(cx - half, ry - rh * 0.08);
    ctx.quadraticCurveTo(cx, ry + rh * 0.16, cx + half, ry - rh * 0.08);
    ctx.stroke();
  }
  // esternón
  ctx.strokeStyle = 'rgba(248,244,232,0.34)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(cx, cyT - rh * 0.78); ctx.lineTo(cx, cyT + rh * 0.20); ctx.stroke();

  /* Grandes vasos: cayado aórtico + tronco pulmonar */
  ctx.save();
  ctx.strokeStyle = 'rgba(196,64,50,0.80)'; ctx.lineWidth = rw * 0.085; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - rw * 0.06, cyT + rh * 0.10);
  ctx.quadraticCurveTo(cx - rw * 0.10, cyT - rh * 0.52, cx + rw * 0.16, cyT - rh * 0.46);
  ctx.quadraticCurveTo(cx + rw * 0.30, cyT - rh * 0.30, cx + rw * 0.24, cyT + rh * 0.10);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(84,140,190,0.66)'; ctx.lineWidth = rw * 0.055;
  ctx.beginPath();
  ctx.moveTo(cx - rw * 0.16, cyT + rh * 0.04);
  ctx.quadraticCurveTo(cx - rw * 0.26, cyT - rh * 0.30, cx - rw * 0.10, cyT - rh * 0.46);
  ctx.stroke();
  ctx.restore();

  /* CORAZÓN: mediastino medio, desplazado a la IZQUIERDA del sujeto,
     eje oblicuo hacia abajo-izquierda, entre 2º y 5º EIC */
  var ph = (t * hr / 60) % 1;
  var beat = Math.exp(-Math.pow((ph - 0.06) / 0.055, 2)) + 0.62 * Math.exp(-Math.pow((ph - 0.24) / 0.070, 2));
  var hs = 1 + 0.13 * beat;
  var hx = cx + rw * 0.17, hy = cyT + rh * 0.20;   // a la derecha en pantalla = izq. del sujeto
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(0.30);                                 // eje anatómico oblicuo
  ctx.scale(hs, hs);
  ctx.shadowBlur = 15 * (0.32 + beat); ctx.shadowColor = 'rgba(210,52,38,0.85)';
  var hg = ctx.createRadialGradient(-rw * 0.06, -rh * 0.10, 1, 0, 0, rw * 0.34);
  hg.addColorStop(0, 'rgba(232,96,78,0.98)');
  hg.addColorStop(1, 'rgba(142,22,16,0.94)');
  ctx.fillStyle = hg;
  var hR = rw * 0.235;
  // silueta cardíaca real: borde derecho = aurícula dcha, izquierdo = VI, ápex abajo-izq
  ctx.beginPath();
  ctx.moveTo(-hR * 0.30, -hR * 0.86);                       // base
  ctx.bezierCurveTo(hR * 0.62, -hR * 1.00, hR * 1.06, -hR * 0.30, hR * 0.72, hR * 0.42);
  ctx.quadraticCurveTo(hR * 0.36, hR * 1.16, -hR * 0.22, hR * 0.92);  // ápex
  ctx.bezierCurveTo(-hR * 0.92, hR * 0.58, -hR * 0.96, -hR * 0.34, -hR * 0.30, -hR * 0.86);
  ctx.closePath(); ctx.fill();
  // surco interventricular
  ctx.globalAlpha = 0.34; ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(90,10,6,0.9)'; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(hR * 0.10, -hR * 0.62);
  ctx.quadraticCurveTo(-hR * 0.06, hR * 0.10, -hR * 0.20, hR * 0.86);
  ctx.stroke();
  ctx.restore();

  /* Diafragma e hígado bajo la cavidad */
  var dY = cyT + rh * 0.66;
  ctx.save();
  ctx.strokeStyle = 'rgba(226,196,150,0.70)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - rw * 0.94, dY + rh * 0.16);
  ctx.quadraticCurveTo(cx - rw * 0.40, dY - rh * 0.20, cx, dY - rh * 0.06);
  ctx.quadraticCurveTo(cx + rw * 0.44, dY - rh * 0.22, cx + rw * 0.94, dY + rh * 0.16);
  ctx.stroke();
  // hígado: cuadrante superior derecho del sujeto (izquierda en pantalla)
  ctx.fillStyle = 'rgba(126,58,40,0.52)';
  ctx.beginPath();
  ctx.moveTo(cx - rw * 0.92, dY + rh * 0.14);
  ctx.quadraticCurveTo(cx - rw * 0.30, dY - rh * 0.02, cx + rw * 0.04, dY + rh * 0.20);
  ctx.quadraticCurveTo(cx - rw * 0.30, dY + rh * 0.52, cx - rw * 0.92, dY + rh * 0.30);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.restore(); // fin clip

  // Marco de la ventana
  ctx.strokeStyle = 'rgba(13,110,100,0.72)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(cx, cyT, rw, rh, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // Etiquetas conectadas a la estructura real
  var sceneW = ctx.canvas.clientWidth || 560;
  var panelW = Math.min(sceneW * 0.42, 210);
  var panelX = sceneW - panelW - 12;
  var labelRight = panelX - 8;
  var placeRight = labelRight - (cx + rw) > 90;
  // Deja un margen visible entre la etiqueta y el contorno del cuerpo.
  // En pantallas estrechas chip() puede limitar el extremo izquierdo sin romper el lienzo.
  var labelX = placeRight ? labelRight : cx - rw - 24;
  CFX.chip(ctx, labelX, cyT - rh * 0.78, '♥ ' + hr + ' lpm', {
    color: PAL.blood, textColor: PAL.ink, size: Math.max(11, Math.min(14, sceneW * 0.024)), mono: true, align: 'right', link: [hx, hy], W: sceneW
  });
  CFX.chip(ctx, labelX, cyT + rh * 0.42, '🫁 ' + rr + '/min', {
    color: '#2b7d97', textColor: PAL.ink, size: Math.max(11, Math.min(14, sceneW * 0.024)), mono: true, align: 'right', link: [cx + rw * 0.52, cyT - rh * 0.18], W: sceneW
  });
}

/* ── Panel de constantes vitales con ECG en vivo ── */
function vitalsPanel(ctx, x, y, w, H, mass, area, bmr, bmi, hr, rr, t) {
  var PAL = CFX.PAL;
  ctx.save();
  // Tarjeta
  // La altura anterior dependía demasiado de H y dejaba un bloque vacío
  // debajo de la última fila en pantallas externas o a pantalla completa.
  var cardH = Math.min(H * 0.64, 245);
  CFX.roundRect(ctx, x, y, w, cardH, 9);
  ctx.fillStyle = 'rgba(251,248,240,0.92)'; ctx.fill();
  ctx.strokeStyle = 'rgba(207,195,169,0.95)'; ctx.lineWidth = 1; ctx.stroke();

  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PAL.ink; ctx.font = 'bold 15.5px Karla, system-ui, sans-serif';
  ctx.fillText('CONSTANTES VITALES', x + 10, y + 17);

  // ECG
  var ey = y + 38, eh = 38;
  ctx.save();
  CFX.roundRect(ctx, x + 8, ey, w - 16, eh, 4);
  ctx.fillStyle = 'rgba(24,32,40,0.90)'; ctx.fill();
  ctx.clip();
  ctx.strokeStyle = 'rgba(120,240,190,0.22)'; ctx.lineWidth = 0.6;
  for (var gx = x + 8; gx < x + w - 8; gx += 9) { ctx.beginPath(); ctx.moveTo(gx, ey); ctx.lineTo(gx, ey + eh); ctx.stroke(); }
  ctx.strokeStyle = '#4ade9b'; ctx.lineWidth = 1.5;
  ctx.shadowBlur = 6; ctx.shadowColor = '#4ade9b';
  ctx.beginPath();
  var span = 2.4;
  for (var i = 0; i <= 150; i++) {
    var f = i / 150;
    var tt = t - span * (1 - f);
    var ph = ((tt * hr / 60) % 1 + 1) % 1;
    var v = ecg(ph);
    var px2 = x + 8 + f * (w - 16);
    var py2 = ey + eh * 0.56 - v * eh * 0.40;
    if (i === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
  }
  ctx.stroke(); ctx.shadowBlur = 0;
  ctx.restore();

  // Filas de datos
  var rows = [
    ['Masa', mass + ' kg', PAL.ink2],
    ['Peso', Math.round(mass * 9.81) + ' N', PAL.ink2],
    ['Área', area.toFixed(2).replace('.', ',') + ' m²', PAL.teal],
    ['TMB', Math.round(bmr) + ' kcal', PAL.blood],
    ['IMC', bmi.toFixed(1).replace('.', ','), bmiColor(bmi)],
    ['Sangre', '5,2 L', PAL.blood],
    ['Pulmón', '6,0 L', '#2b7d97'],
    ['Fluidos', '51 L · 53 %', PAL.violet]
  ];
  var ry = ey + eh + 19;
  rows.forEach(function (r, i) {
    var yy2 = ry + i * 19;
    ctx.fillStyle = PAL.ink; ctx.font = '14px Karla, system-ui, sans-serif';
    ctx.textAlign = 'left'; ctx.fillText(r[0], x + 11, yy2);
    ctx.fillStyle = r[2]; ctx.font = 'bold 14px JetBrains Mono, monospace';
    ctx.textAlign = 'right'; ctx.fillText(r[1], x + w - 11, yy2);
    if (i < rows.length - 1) {
      ctx.strokeStyle = 'rgba(207,195,169,0.5)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(x + 10, yy2 + 5); ctx.lineTo(x + w - 10, yy2 + 5); ctx.stroke();
    }
  });
  ctx.restore();
}

function ecg(p) {
  var v = 0;
  v += 0.11 * Math.exp(-Math.pow((p - 0.10) / 0.026, 2));   // P
  v += -0.13 * Math.exp(-Math.pow((p - 0.175) / 0.007, 2)); // Q
  v += 1.00 * Math.exp(-Math.pow((p - 0.196) / 0.0075, 2)); // R
  v += -0.24 * Math.exp(-Math.pow((p - 0.218) / 0.009, 2)); // S
  v += 0.20 * Math.exp(-Math.pow((p - 0.36) / 0.040, 2));   // T
  return v;
}

function bmiColor(b) {
  return b < 18.5 ? '#b86a1e' : b < 25 ? CFX.PAL.teal : b < 30 ? CFX.PAL.amber : CFX.PAL.blood;
}

window.drawBodyProportions = drawBodyProportions;

/* ═══════════════════════════════════════════════════════════════════
   C2 · PROPORCIONES SEGMENTARIAS — cuerpo acotado
   La figura ES el gráfico: cada segmento se colorea sobre el cuerpo y
   se acota con su L/H. Barra apilada sincronizada al lado.
   CORRIGE: el ancho de hombros se acota EN los hombros (antes iba a la
   altura de la cadera).
   ═══════════════════════════════════════════════════════════════════ */
var C2_PARTS = [
  { key: 'cabeza',      name: 'Cabeza',      frac: 0.130, color: '#0d6e64' },
  { key: 'cuello',      name: 'Cuello',      frac: 0.052, color: '#0d8577' },
  { key: 'brazo',       name: 'Brazo',       frac: 0.186, color: '#106b64' },
  { key: 'antebrazo',   name: 'Antebrazo',   frac: 0.146, color: '#0d5b56' },
  { key: 'mano',        name: 'Mano',        frac: 0.108, color: '#0b4a46' },
  { key: 'muslo',       name: 'Muslo',       frac: 0.245, color: '#6d5fbf' },
  { key: 'pantorrilla', name: 'Pantorrilla', frac: 0.246, color: '#7c5fcf' },
  { key: 'pie',         name: 'Pie',         frac: 0.152, color: '#6d46c4' },
  { key: 'hombros',     name: 'Ancho hombros', frac: 0.259, color: '#a35c00', horiz: true }
];

export function drawProportions(highlight?: string | null, customHeight?: number) {
  var canvas = document.getElementById('sim-proportions') as HTMLCanvasElement;
  if (!canvas || !canvas.parentElement || !canvas.parentElement.offsetParent) return;
  if (highlight !== undefined) (window as any).__c2hl = highlight;
  var hl = highlight !== undefined ? highlight : ((window as any).__c2hl || null);
  var height = customHeight != null ? customHeight : (parseFloat((document.getElementById('heightSlider') as any)?.value) || 172);
  var hDisp = document.getElementById('heightDisplay');
  if (hDisp) hDisp.textContent = height + ' cm';
  var __f = (window as any).fitCanvas(canvas);
  var ctx = __f.ctx, W = __f.W, H = __f.H;
  var t = (window as any).c2t || 0;
  var PAL = CFX.PAL;
  ctx.clearRect(0, 0, W, H);

  var floorY = H * 0.905;
  CFX.scene(ctx, W, H, { floor: true, floorY: floorY, spotX: W * 0.34 });
  CFX.title(ctx, W, '📏 Proporciones segmentarias · L/H constante',
    'Tabla 1.6 · fracciones L/H');

  /* ── Figura acotada ── */
  var bodyH = H * 0.655;
  var top = floorY - bodyH;
  var cx = W * 0.34;
  var p = window.CFXBody.buildParams(0.45, 0.52, 0.26);
  var armPts = {};
  var geo = CFX.figure(ctx, cx, top, bodyH, p, {
    swing: 0.35 + 0.35 * Math.sin(t * 0.9),
    reportArm: function (s, a) { if (s === 1) armPts = a; }
  });
  var L = geo.L, g = geo.g;
  var yy = function (v) { return top + v; };
  var F = window.CFXBody.F;

  /* Bandas de color de cada segmento sobre el cuerpo */
  var bands = [
    { key: 'cabeza',      y0: 0,       y1: L.headB },
    { key: 'cuello',      y0: L.headB, y1: L.neck },
    { key: 'muslo',       y0: L.hip,   y1: L.knee },
    { key: 'pantorrilla', y0: L.knee,  y1: L.ankle }
  ];
  ctx.save();
  bands.forEach(function (b) {
    var part = C2_PARTS.filter(function (q) { return q.key === b.key; })[0];
    var on = hl === b.key;
    ctx.globalAlpha = on ? 0.42 : 0.17;
    ctx.fillStyle = part.color;
    ctx.fillRect(cx - g.sh * 1.02, yy(b.y0), g.sh * 2.04, yy(b.y1) - yy(b.y0));
    if (on) {
      ctx.globalAlpha = 0.9; ctx.strokeStyle = part.color; ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(cx - g.sh * 1.02, yy(b.y0), g.sh * 2.04, yy(b.y1) - yy(b.y0));
      ctx.setLineDash([]);
    }
  });
  ctx.restore();

  /* Acotaciones verticales a la izquierda, escalonadas */
  var dx1 = cx - g.sh * 1.10 - 16;
  var dx2 = dx1 - 46;
  var segs = [
    { key: 'cabeza',      y0: 0,        y1: L.headB, x: dx1 },
    { key: 'cuello',      y0: L.headB,  y1: L.neck,  x: dx1 },
    { key: 'muslo',       y0: L.hip,    y1: L.knee,  x: dx1 },
    { key: 'pantorrilla', y0: L.knee,   y1: L.ankle, x: dx1 },
    { key: 'pie',         y0: L.ankle,  y1: L.sole,  x: dx1 }
  ];
  segs.forEach(function (s) {
    var part = C2_PARTS.filter(function (q) { return q.key === s.key; })[0];
    var on = hl === s.key;
    var cmv = (part.frac * height).toFixed(1).replace('.', ',');
      CFX.dimV(ctx, s.x, yy(s.y0), yy(s.y1),
        cmv + ' cm',
      part.color, { side: s.key === 'pie' ? 'right' : 'left', W: W, alpha: on ? 1 : 0.82, size: on ? 13 : 12 });
  });

  /* Acotación total de la estatura */
  CFX.dimV(ctx, dx2, top, floorY, 'H = ' + height + ' cm', PAL.tealDeep,
    { side: 'left', W: W, size: 9.5 });

  /* ── ANCHO DE HOMBROS: acotado EN los hombros (bug corregido) ── */
  var shOn = hl === 'hombros';
  var shY = yy(L.neck + bodyH * 0.020);
  var shDimY = shY + bodyH * 0.055;   // por DEBAJO de la línea de hombros: nunca invade la cabeza
  CFX.dimH(ctx, cx - g.sh, cx + g.sh, shDimY,
    (0.259 * height).toFixed(1).replace('.', ',') + ' cm · 0,259·H',
    '#a35c00', { above: false, W: W, alpha: shOn ? 1 : 0.88, size: shOn ? 11.5 : 10.5 });
  // líneas de proyección desde los hombros hasta la cota
  ctx.save();
  ctx.strokeStyle = 'rgba(163,92,0,' + (shOn ? 0.75 : 0.4) + ')';
  ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  [-1, 1].forEach(function (s) {
    ctx.beginPath();
    ctx.moveTo(cx + s * g.sh, shY);
    ctx.lineTo(cx + s * g.sh, shDimY);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.restore();

  /* Brazo/antebrazo/mano acotados sobre el brazo derecho */
  if (armPts.sy) {
    var ax = armPts.ex + 22;
    [['brazo', armPts.sy, armPts.ey], ['antebrazo', armPts.ey, armPts.wy],
      ['mano', armPts.wy, armPts.wy + F.hand * bodyH * 0.92]].forEach(function (a) {
      var part = C2_PARTS.filter(function (q) { return q.key === a[0]; })[0];
      var on = hl === a[0];
      CFX.dimV(ctx, ax, a[1], a[2],
        (part.frac * height).toFixed(1).replace('.', ',') + ' cm',
        part.color, { W: W, alpha: on ? 1 : 0.84, size: on ? 13 : 12 });
    });
  }

  /* ── Barra apilada sincronizada (derecha) ── */
  stackedBar(ctx, W * 0.67, H * 0.17, W * 0.17, H * 0.64, height, hl);

  window.__stage('sim-proportions', 'PROPORCIÓN', height + ' cm · L/H constante', 'violet', 'anatomy');
  CFX.footnote(ctx, W, H, 'Pasa el cursor: resalta cuerpo y barra');
}

/* ── Barra apilada de segmentos ── */
function stackedBar(ctx, x, y, w, h, height, hl) {
  var PAL = CFX.PAL;
  var verts = C2_PARTS.filter(function (p) { return !p.horiz; });
  var total = verts.reduce(function (s, p) { return s + p.frac; }, 0);
  var pxf = h / total;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PAL.ink; ctx.font = 'bold 13px Karla, system-ui, sans-serif';
  ctx.fillText('Σ segmentos', x + w / 2, y - 7);

  var cum = y;
  verts.forEach(function (p) {
    var hh = p.frac * pxf;
    var on = hl === p.key;
    var g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, CFX.shade(p.color, 0.72, on ? 0.98 : 0.68));
    g.addColorStop(0.45, CFX.shade(p.color, 1.22, on ? 1 : 0.78));
    g.addColorStop(1, CFX.shade(p.color, 0.62, on ? 0.95 : 0.62));
    ctx.fillStyle = g;
    ctx.fillRect(x, cum, w, hh - 1.2);
    if (on) {
      ctx.shadowBlur = 10; ctx.shadowColor = p.color;
      ctx.fillRect(x, cum, w, hh - 1.2);
      ctx.shadowBlur = 0;
    }
    ctx.strokeStyle = on ? p.color : 'rgba(67,80,92,0.35)';
    ctx.lineWidth = on ? 2 : 0.8;
    ctx.strokeRect(x, cum, w, hh - 1.2);

    if (hh > 13) {
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 11.5px Karla, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, x + w / 2, cum + hh / 2 + 1);
    }
    // valor a la derecha
    ctx.fillStyle = on ? p.color : PAL.ink3;
    ctx.font = (on ? 'bold ' : '') + '12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText((p.frac * height).toFixed(1).replace('.', ',') + ' cm', x + w + 6, cum + hh / 2 + 3);
    cum += hh;
  });
  ctx.restore();
}

window.drawProportions = drawProportions;

/* ═══════════════════════════════════════════════════════════════════
   C3 · MOVILIDAD ARTICULAR — goniómetro anatómico
   Sustituye las barras planas por ARCOS DE RANGO dibujados sobre una
   figura: el segmento se mueve dentro de su cono de movilidad real.
   El panel de órganos se separa en su propia tarjeta con título
   propio (antes su leyenda se leía como leyenda de las barras).
   ═══════════════════════════════════════════════════════════════════ */
var C3_JOINTS = {
  'hombro-flex': { name: 'Hombro · flex/ext',    a: 188, b: 61, at: 'shoulder', plane: 'sag' },
  'hombro-abd':  { name: 'Hombro · abd/adu',     a: 134, b: 48, at: 'shoulder', plane: 'cor' },
  'hombro-rot':  { name: 'Hombro · rot med/lat', a: 97,  b: 34, at: 'shoulder', plane: 'rot' },
  'codo':        { name: 'Codo · flexión',       a: 142, b: 0,  at: 'elbow',    plane: 'sag' },
  'antebrazo':   { name: 'Antebrazo · sup/pron', a: 113, b: 77, at: 'forearm', plane: 'rot' },
  'muneca':      { name: 'Muñeca · flex/ext',    a: 90,  b: 99, at: 'wrist',    plane: 'sag' },
  'cadera':      { name: 'Cadera · flexión',     a: 113, b: 0,  at: 'hip',      plane: 'sag' },
  'rodilla':     { name: 'Rodilla · flexión',    a: 125, b: 0,  at: 'knee',     plane: 'sag' },
  'tobillo':     { name: 'Tobillo · flex/ext',   a: 35,  b: 38, at: 'ankle',    plane: 'sag' }
};

/* Segmento de miembro cónico (húmero/fémur-like) entre dos puntos */
function limbShape(ctx, x1, y1, x2, y2, w1, w2) {
  var dx = x2 - x1, dy = y2 - y1;
  var len = Math.hypot(dx, dy) || 1;
  var nx = -dy / len, ny = dx / len;
  var mx = (x1 + x2) / 2 + nx * len * 0.04;
  var my = (y1 + y2) / 2 + ny * len * 0.04;
  var wm = (w1 + w2) * 0.56;
  ctx.beginPath();
  ctx.moveTo(x1 + nx * w1, y1 + ny * w1);
  ctx.quadraticCurveTo(mx + nx * wm, my + ny * wm, x2 + nx * w2, y2 + ny * w2);
  ctx.quadraticCurveTo(x2, y2, x2 - nx * w2, y2 - ny * w2);
  ctx.quadraticCurveTo(mx - nx * wm, my - ny * wm, x1 - nx * w1, y1 - ny * w1);
  ctx.closePath();
}

export function drawMobility(highlight) {
  var canvas = document.getElementById('sim-mobility');
  if (!canvas || !canvas.parentElement.offsetParent) return;
  if (highlight !== undefined) window.__c3hl = highlight;
  var hl = window.__c3hl || 'hombro-flex';
  var __f = window.fitCanvas(canvas);
  var ctx = __f.ctx, W = __f.W, H = __f.H;
  var t = window.c2t || 0;
  var PAL = CFX.PAL;
  ctx.clearRect(0, 0, W, H);

  var floorY = H * 0.845;
  CFX.scene(ctx, W, H, { floor: true, floorY: floorY, spotX: W * 0.33 });
  CFX.title(ctx, W, '🏹 Rango de movilidad articular',
    'Tabla 1.10 · varones universitarios · grados medios');

  /* ── Figura de referencia con los ejes articulares ── */
  // Sin paneles laterales duplicados, la figura puede ocupar y aprovechar
  // todo el ancho disponible del visor.
  var bodyH = H * 0.68;
  var top = floorY - bodyH;
  var cx = W * 0.52;
  var p = window.CFXBody.buildParams(0.44, 0.55, 0.24);
  var armPts = {};
  var geo = CFX.figure(ctx, cx, top, bodyH, p, {
    reportArm: function (s, a) { if (s === 1) armPts = a; }
  });
  var L = geo.L, g = geo.g;
  var yy = function (v) { return top + v; };

  var pivots = {
    shoulder: { x: cx + g.sh * 0.94, y: yy(L.neck + bodyH * 0.026), len: bodyH * 0.20, base: Math.PI / 2 },
    elbow:    { x: armPts.ex || cx + g.wa, y: armPts.ey || yy(L.waist), len: bodyH * 0.16, base: Math.PI / 2 },
    wrist:    { x: armPts.wx || cx + g.hp, y: armPts.wy || yy(L.hip), len: bodyH * 0.075, base: Math.PI / 2 },
    // Pivote radiocubital: la pronación/supinación gira el antebrazo alrededor de su eje longitudinal.
    forearm:  { x: ((armPts.ex || cx + g.wa) + (armPts.wx || cx + g.hp)) / 2, y: ((armPts.ey || yy(L.waist)) + (armPts.wy || yy(L.hip))) / 2, len: bodyH * 0.105, base: 0 },
    hip:      { x: cx + g.hp * 0.50, y: yy(L.hip + bodyH * 0.020), len: bodyH * 0.235, base: Math.PI / 2 },
    knee:     { x: cx + g.th * 0.40, y: yy(L.knee), len: bodyH * 0.225, base: Math.PI / 2 },
    ankle:    { x: cx + g.an * 0.90, y: yy(L.ankle), len: bodyH * 0.085, base: 0 }
  };

  // Marcas de todas las articulaciones
  Object.keys(pivots).forEach(function (k) {
    var pv = pivots[k];
    var isOn = C3_JOINTS[hl] && C3_JOINTS[hl].at === k;
    ctx.save();
    ctx.fillStyle = isOn ? PAL.blood : 'rgba(13,110,100,0.55)';
    ctx.strokeStyle = 'rgba(35,44,54,0.75)'; ctx.lineWidth = 1;
    if (isOn) { ctx.shadowBlur = 12; ctx.shadowColor = PAL.blood; }
    ctx.beginPath(); ctx.arc(pv.x, pv.y, isOn ? 5.2 : 3.4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  });

  /* ── Arco de rango de la articulación seleccionada ── */
  var j = C3_JOINTS[hl];
  if (j) {
    var pv = pivots[j.at];
    rangeArc(ctx, pv, j, t, W, H);
  }

  window.__stage('sim-mobility', 'MOVILIDAD',
    (j ? j.name + ' · ' + j.a + (j.b ? '/' + j.b : '') + '° · ' + (j.plane === 'rot' ? 'eje longitudinal' : j.plane === 'cor' ? 'plano coronal' : 'plano sagital') : '9 articulaciones'), 'teal', 'anatomy');
  CFX.footnote(ctx, W, H, 'Haz clic en una fila de la tabla para ver su cono de movilidad sobre el cuerpo');
}

/* ── Cono de movilidad animado ── */
function rangeArc(ctx, pv, j, t, W, H) {
  var PAL = CFX.PAL;
  var rad = Math.PI / 180;
  var A = j.a * rad, Bb = j.b * rad;
  var base = pv.base;
  var R = pv.len;

  ctx.save();
  ctx.translate(pv.x, pv.y);

  if (j.plane === 'rot') {
    // Rotación: elipse de giro con doble flecha
    ctx.save();
    ctx.strokeStyle = 'rgba(109,95,191,0.85)'; ctx.lineWidth = 2.4;
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(109,95,191,0.8)';
    ctx.beginPath(); ctx.ellipse(0, 0, R * 0.62, R * 0.24, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    var ang = Math.sin(t * 1.1) * 0.9;
    var mx = Math.cos(ang) * R * 0.62, my = Math.sin(ang) * R * 0.24;
    ctx.fillStyle = PAL.violet;
    ctx.beginPath(); ctx.arc(mx, my, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
    CFX.chip(ctx, pv.x + R * 0.70, pv.y - R * 0.36,
      j.a + '° / ' + j.b + '°', { color: PAL.violet, size: 9.5, mono: true, W: W, link: [pv.x, pv.y] });
    return;
  }

  // Sectores de rango (flexión en teal, extensión/opuesto en rojo)
  var a0 = base - A, a1 = base;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a0, a1); ctx.closePath();
  var gA = ctx.createRadialGradient(0, 0, R * 0.12, 0, 0, R);
  gA.addColorStop(0, 'rgba(13,110,100,0.34)');
  gA.addColorStop(1, 'rgba(13,110,100,0.09)');
  ctx.fillStyle = gA; ctx.fill();
  ctx.strokeStyle = 'rgba(13,110,100,0.75)'; ctx.lineWidth = 1.4; ctx.stroke();

  if (j.b > 0) {
    var b0 = base, b1 = base + Bb;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R * 0.86, b0, b1); ctx.closePath();
    var gB = ctx.createRadialGradient(0, 0, R * 0.10, 0, 0, R * 0.86);
    gB.addColorStop(0, 'rgba(169,42,30,0.32)');
    gB.addColorStop(1, 'rgba(169,42,30,0.08)');
    ctx.fillStyle = gB; ctx.fill();
    ctx.strokeStyle = 'rgba(169,42,30,0.72)'; ctx.lineWidth = 1.3; ctx.stroke();
  }

  // Segmento móvil: MIEMBRO anatómico cónico, no un palo
  var sw = 0.5 + 0.5 * Math.sin(t * 0.85);
  var cur = base - A * sw + (j.b > 0 ? Bb * (1 - sw) * 0.35 : 0);
  var tipX = Math.cos(cur) * R * 0.94, tipY = Math.sin(cur) * R * 0.94;
  ctx.save();
  // sombra proyectada del miembro
  ctx.globalAlpha = 0.16;
  limbShape(ctx, 0, 0, tipX + 3, tipY + 4, R * 0.155, R * 0.085);
  ctx.fillStyle = '#232c36'; ctx.fill();
  ctx.globalAlpha = 1;
  // carne del miembro con degradado transversal
  limbShape(ctx, 0, 0, tipX, tipY, R * 0.150, R * 0.080);
  var lgr = ctx.createLinearGradient(0, -R * 0.15, 0, R * 0.15);
  lgr.addColorStop(0, 'rgba(226,124,110,0.95)');
  lgr.addColorStop(0.45, 'rgba(196,66,52,0.95)');
  lgr.addColorStop(1, 'rgba(140,26,18,0.95)');
  ctx.fillStyle = lgr; ctx.fill();
  ctx.strokeStyle = 'rgba(96,16,10,0.9)'; ctx.lineWidth = 1.2; ctx.stroke();
  // brillo axial
  ctx.globalAlpha = 0.30;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = R * 0.045; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(Math.cos(cur) * R * 0.16 - Math.sin(cur) * R * 0.05,
             Math.sin(cur) * R * 0.16 + Math.cos(cur) * R * 0.05);
  ctx.lineTo(tipX * 0.82 - Math.sin(cur) * R * 0.03, tipY * 0.82 + Math.cos(cur) * R * 0.03);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // extremo articular distal (cóndilo)
  ctx.fillStyle = 'rgba(236,228,207,0.95)';
  ctx.strokeStyle = 'rgba(96,16,10,0.75)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(tipX, tipY, R * 0.072, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.restore();

  // Línea neutra
  ctx.strokeStyle = 'rgba(35,44,54,0.42)'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(base) * R * 1.06, Math.sin(base) * R * 1.06); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Etiquetas
  var la = base - A * 0.5;
  CFX.chip(ctx, pv.x + Math.cos(la) * R * 1.12, pv.y + Math.sin(la) * R * 1.12,
    j.a + '°', { color: CFX.PAL.teal, size: 10, mono: true, align: 'center', W: W });
  if (j.b > 0) {
    var lb = base + Bb * 0.5;
    CFX.chip(ctx, pv.x + Math.cos(lb) * R * 0.98, pv.y + Math.sin(lb) * R * 0.98,
      j.b + '°', { color: CFX.PAL.blood, size: 9.5, mono: true, align: 'center', W: W });
  }
}

/* ── Lista de articulaciones con mini-barras ── */
function jointList(ctx, x, y, w, hl) {
  var PAL = CFX.PAL;
  var keys = Object.keys(C3_JOINTS);
  var shortNames = {
    'hombro-flex': 'Hombro flex/ext',
    'hombro-abd': 'Hombro abd/adu',
    'hombro-rot': 'Hombro rot.',
    'codo': 'Codo flex.',
    'antebrazo': 'Antebrazo sup.',
    'muneca': 'Muñeca flex/ext',
    'cadera': 'Cadera flex.',
    'rodilla': 'Rodilla flex.',
    'tobillo': 'Tobillo flex/ext'
  };
  ctx.save();
  CFX.roundRect(ctx, x, y, w, keys.length * 18 + 26, 8);
  ctx.fillStyle = 'rgba(251,248,240,0.90)'; ctx.fill();
  ctx.strokeStyle = 'rgba(207,195,169,0.9)'; ctx.lineWidth = 1; ctx.stroke();

  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PAL.tealDeep; ctx.font = 'bold 11.5px Karla, system-ui, sans-serif';
  ctx.fillText('RANGO ARTICULAR', x + 9, y + 15);
  ctx.fillStyle = PAL.ink2; ctx.font = '9.5px Karla, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('grados (°)', x + w - 9, y + 15);

  var maxV = 188;
  keys.forEach(function (k, i) {
    var j = C3_JOINTS[k];
    var on = k === hl;
    var ry = y + 30 + i * 18;
    if (on) {
      ctx.fillStyle = 'rgba(169,42,30,0.09)';
      CFX.roundRect(ctx, x + 4, ry - 9, w - 8, 18, 4); ctx.fill();
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = on ? PAL.blood : PAL.ink2;
    ctx.font = (on ? 'bold ' : '') + '9.5px Karla, system-ui, sans-serif';
    ctx.fillText(shortNames[k] || j.name, x + 9, ry + 1);
    // mini barra bipolar
    var bx = x + w * 0.74, bw = w * 0.12, mid = bx + bw * (61 / (188 + 99));
    var sA = (j.a / maxV) * bw * 0.62, sB = (j.b / maxV) * bw * 0.62;
    ctx.fillStyle = on ? 'rgba(169,42,30,0.85)' : 'rgba(169,42,30,0.38)';
    if (sB > 0) ctx.fillRect(mid - sB, ry - 3.5, sB, 6);
    ctx.fillStyle = on ? 'rgba(13,110,100,0.95)' : 'rgba(13,110,100,0.42)';
    ctx.fillRect(mid, ry - 3.5, sA, 6);
    ctx.strokeStyle = 'rgba(35,44,54,0.35)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(mid, ry - 6); ctx.lineTo(mid, ry + 4); ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillStyle = on ? PAL.blood : PAL.ink3;
    ctx.font = (on ? 'bold ' : '') + '10px JetBrains Mono, monospace';
    ctx.fillText(j.a + (j.b ? '/' + j.b : ''), x + w - 9, ry + 1);
  });
  // leyenda propia del gráfico de grados
  var ly = y + 30 + keys.length * 18 - 4;
  ctx.textAlign = 'left'; ctx.font = '9.5px Karla, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(13,110,100,0.9)'; ctx.fillRect(x + 9, ly, 7, 5);
  ctx.fillStyle = PAL.ink2; ctx.fillText('flexión →', x + 19, ly + 5);
  ctx.fillStyle = 'rgba(169,42,30,0.75)'; ctx.fillRect(x + w * 0.52, ly, 7, 5);
  ctx.fillStyle = PAL.ink2; ctx.fillText('← extensión / opuesto', x + w * 0.52 + 10, ly + 5);
  ctx.restore();
}

/* ── Panel de órganos, claramente separado ── */
function organPanel(ctx, x, y, w, h) {
  var PAL = CFX.PAL;
  var organs = [
    ['Músculo', 30000, '#a92a1e'], ['Grasa', 10500, '#c0681e'],
    ['Esqueleto', 10000, '#6d5fbf'], ['Hígado', 1650, '#9a5b00'],
    ['Cerebro', 1400, '#0d6e64'], ['Corazón', 330, '#a92a1e']
  ];
  ctx.save();
  CFX.roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = 'rgba(240,234,218,0.94)'; ctx.fill();
  ctx.strokeStyle = 'rgba(109,95,191,0.45)'; ctx.lineWidth = 1.2; ctx.stroke();

  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PAL.violet; ctx.font = 'bold 11.5px Karla, system-ui, sans-serif';
  ctx.fillText('🫀 MASA ÓRGANOS', x + 9, y + 15);
  ctx.fillStyle = PAL.ink2; ctx.font = '9.5px Karla, system-ui, sans-serif';
  ctx.textAlign = 'right'; ctx.fillText('gramos · Tabla 1.11', x + w - 9, y + 15);

  var maxM = 30000;
  var rowH = (h - 28) / organs.length;
  organs.forEach(function (o, i) {
    var ry = y + 26 + i * rowH;
    ctx.textAlign = 'left';
    ctx.fillStyle = PAL.ink2; ctx.font = '10px Karla, system-ui, sans-serif';
    ctx.fillText(o[0], x + 9, ry + rowH * 0.42);
    var bx = x + w * 0.38, bw = w * 0.36;
    CFX.bar(ctx, bx, ry + rowH * 0.12, bw, Math.min(7, rowH * 0.42), o[1] / maxM, o[2], {});
    ctx.textAlign = 'right';
    ctx.fillStyle = PAL.ink2; ctx.font = '9.5px JetBrains Mono, monospace';
    ctx.fillText(o[1].toLocaleString('es-ES'), x + w - 9, ry + rowH * 0.42);
  });
  ctx.restore();
}

window.drawMobility = drawMobility;

/* ═══════════════════════════════════════════════════════════════════
   C4 · SOMATOTIPOS — comparativa viva + somatocarta Heath-Carter
   Tres siluetas anatómicas lado a lado (la seleccionada crece y se
   destaca), con métricas de hombro/cadera y triángulo somatotípico.
   Fiel al tex: ecto = caderas ≥ hombros; meso = hombros > caderas;
   endo = hombros ligeramente > caderas, redondeado.
   ═══════════════════════════════════════════════════════════════════ */
var C4_TYPES = {
  ecto: {
    name: 'Ectomorfo', emoji: '🏃', color: '#0d6e64', build: 0.02, musc: 0.20, fat: 0.08,
    desc: 'Largo y delgado · huesos finos', shk: 0.94, hipk: 1.02,
    soma: [1.5, 2.0, 6.0], athletes: 'Maratonianos · saltadores · bailarines'
  },
  meso: {
    name: 'Mesomorfo', emoji: '💪', color: '#c0681e', build: 0.50, musc: 0.92, fat: 0.16,
    desc: 'Sólido y musculoso · hombros anchos', shk: 1.16, hipk: 0.96,
    soma: [2.0, 6.5, 1.5], athletes: 'Levantadores · boxeadores · luchadores'
  },
  endo: {
    name: 'Endomorfo', emoji: '🍐', color: '#6d5fbf', build: 0.98, musc: 0.38, fat: 0.86,
    desc: 'Redondeado, en pera · huesos grandes', shk: 0.98, hipk: 1.22,
    soma: [6.5, 3.5, 1.0], athletes: 'Luchadores de sumo · lanzadores'
  }
};
var currentSomatotype = 'meso';

export function drawSomatotype(type) {
  if (type) currentSomatotype = type;
  var canvas = document.getElementById('sim-somatotype');
  if (!canvas || !canvas.parentElement.offsetParent) return;
  var __f = window.fitCanvas(canvas);
  var ctx = __f.ctx, W = __f.W, H = __f.H;
  var t = window.c2t || 0;
  var PAL = CFX.PAL;
  ctx.clearRect(0, 0, W, H);

  document.querySelectorAll('[data-somatotype]').forEach(function (el) {
    el.setAttribute('aria-pressed', el.dataset.somatotype === currentSomatotype ? 'true' : 'false');
  });

  var floorY = H * 0.60;
  CFX.scene(ctx, W, H, { floor: true, floorY: floorY, spotX: W * 0.5 });
  CFX.title(ctx, W, '🧬 Los tres somatotipos · Heath-Carter',
    'Un continuo, no categorías absolutas');

  /* ── Tres figuras comparativas ── */
  var keys = ['ecto', 'meso', 'endo'];
  var colW = W / 3;
  keys.forEach(function (k, i) {
    var T = C4_TYPES[k];
    var on = k === currentSomatotype;
    var cx = colW * (i + 0.5);
    var bodyH = H * (on ? 0.40 : 0.34);
    var top = floorY - bodyH;

    // Halo del seleccionado
    if (on) {
      ctx.save();
      var hg = ctx.createRadialGradient(cx, floorY - bodyH * 0.5, 4, cx, floorY - bodyH * 0.5, bodyH * 0.62);
      hg.addColorStop(0, CFX.shade(T.color, 1.4, 0.20));
      hg.addColorStop(1, CFX.shade(T.color, 1.0, 0));
      ctx.fillStyle = hg;
      ctx.fillRect(cx - colW * 0.5, top - 16, colW, bodyH + 34);
      ctx.restore();
    }

    var breathe = on ? 1 + 0.012 * Math.sin(t * 1.6) : 1;
    var p = window.CFXBody.buildParams(T.build, T.musc, T.fat);
    p.shoulder *= T.shk * breathe;
    p.hip *= T.hipk;

    CFX.figure(ctx, cx, top, bodyH, p, {
      tint: T.color, swing: on ? 0.4 * Math.sin(t * 0.8) : 0,
      lw: on ? 1.7 : 1.4,
      edge: on ? CFX.shade(T.color, 1.0, 0.3) : CFX.shade(T.color, 1.0, 0.22),
      modeling: true
    });

    // Relación hombro/cadera (dato que define el somatotipo)
    var g = window.CFXBody.halfProfile(bodyH, p);
    if (on) {
      var shY = top + g.L.neck + bodyH * 0.020;
      var hpY = top + g.L.hip + bodyH * 0.010;
      ctx.save();
      ctx.strokeStyle = CFX.shade(T.color, 1.1, 0.9); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(cx - g.sh, shY); ctx.lineTo(cx + g.sh, shY); ctx.stroke();
      ctx.strokeStyle = 'rgba(35,44,54,0.55)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(cx - g.hp, hpY); ctx.lineTo(cx + g.hp, hpY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      CFX.chip(ctx, cx, top - 8, 'hombro/cadera ' + (g.sh / g.hp).toFixed(2).replace('.', ','),
        { color: T.color, size: 11, mono: true, align: 'center', W: W });
    }

    // Nombre
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = on ? T.color : PAL.ink2;
    ctx.font = (on ? 'bold 17px' : '15px') + ' Karla, system-ui, sans-serif';
    ctx.fillText(T.emoji + ' ' + T.name, cx, floorY + 14);
    ctx.restore();
  });

  /* ── Somatocarta triangular ── */
  var chartSize = Math.min(W * 0.40, H * 0.24);
  somatochart(ctx, (W - chartSize) / 2, H * 0.70, chartSize, currentSomatotype);

  window.__stage('sim-somatotype', 'VARIACIÓN',
    C4_TYPES[currentSomatotype].name + ' dominante', 'violet', 'anatomy');
}

/* ── Triángulo somatotípico con el punto del tipo activo ── */
function somatochart(ctx, x, y, size, sel) {
  var PAL = CFX.PAL;
  var h = size * 0.86;
  var A = { x: x + size / 2, y: y + 4 };            // meso (arriba)
  var Bp = { x: x + 4, y: y + h };                  // endo (izq)
  var C = { x: x + size - 4, y: y + h };            // ecto (der)

  ctx.save();
  CFX.roundRect(ctx, x - 10, y - 22, size + 20, h + 30, 8);
  ctx.fillStyle = 'rgba(251,248,240,0.88)'; ctx.fill();
  ctx.strokeStyle = 'rgba(67,80,92,0.28)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 11px Karla, system-ui, sans-serif';
  ctx.fillStyle = PAL.ink; ctx.fillText('SOMATOCARTA', x + size / 2, y - 8);

  // relleno
  ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(Bp.x, Bp.y); ctx.lineTo(C.x, C.y); ctx.closePath();
  var g = ctx.createLinearGradient(Bp.x, Bp.y, C.x, A.y);
  g.addColorStop(0, 'rgba(109,95,191,0.20)');
  g.addColorStop(0.5, 'rgba(192,104,30,0.20)');
  g.addColorStop(1, 'rgba(13,110,100,0.20)');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(67,80,92,0.55)'; ctx.lineWidth = 1.2; ctx.stroke();

  // retícula interior
  ctx.strokeStyle = 'rgba(67,80,92,0.18)'; ctx.lineWidth = 0.7;
  for (var i = 1; i < 3; i++) {
    var f = i / 3;
    ctx.beginPath();
    ctx.moveTo(Bp.x + (A.x - Bp.x) * f, Bp.y + (A.y - Bp.y) * f);
    ctx.lineTo(C.x + (A.x - C.x) * f, C.y + (A.y - C.y) * f);
    ctx.stroke();
  }

  // vértices
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 13px Karla, system-ui, sans-serif';
  ctx.fillStyle = '#8c4d12'; ctx.fillText('MESO', A.x, A.y + 17);
  ctx.fillStyle = '#4b3d91'; ctx.textAlign = 'left'; ctx.fillText('ENDO', Bp.x - 2, Bp.y + 16);
  ctx.fillStyle = '#07534c'; ctx.textAlign = 'right'; ctx.fillText('ECTO', C.x + 2, C.y + 16);

  // puntos de los 3 tipos
  ['endo', 'meso', 'ecto'].forEach(function (k) {
    var T = C4_TYPES[k];
    var s = T.soma, tot = s[0] + s[1] + s[2];
    var w0 = s[0] / tot, w1 = s[1] / tot, w2 = s[2] / tot;
    var px = Bp.x * w0 + A.x * w1 + C.x * w2;
    var py = Bp.y * w0 + A.y * w1 + C.y * w2;
    var on = k === sel;
    ctx.beginPath(); ctx.arc(px, py, on ? 6 : 3.4, 0, Math.PI * 2);
    ctx.fillStyle = on ? T.color : CFX.shade(T.color, 1.0, 0.42);
    if (on) { ctx.shadowBlur = 12; ctx.shadowColor = T.color; }
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = on ? 1.6 : 0.8; ctx.stroke();
  });
  ctx.restore();
}

/* ── Componentes Heath-Carter del tipo activo ── */
function componentsPanel(ctx, x, y, w, h, sel) {
  var PAL = CFX.PAL, T = C4_TYPES[sel];
  ctx.save();
  CFX.roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = 'rgba(251,248,240,0.98)'; ctx.fill();
  ctx.strokeStyle = CFX.shade(T.color, 1.0, 0.5); ctx.lineWidth = 1.2; ctx.stroke();

  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = T.color; ctx.font = 'bold 9.5px Karla, system-ui, sans-serif';
  ctx.fillText('COMPONENTES HEATH-CARTER', x + 10, y + 15);

  var comps = [
    ['Endomorfia', T.soma[0], '#6d5fbf', 'pliegues cutáneos'],
    ['Mesomorfia', T.soma[1], '#c0681e', 'desarrollo musculoesquelético'],
    ['Ectomorfia', T.soma[2], '#0d6e64', 'ligereza para la estatura']
  ];
  comps.forEach(function (c, i) {
    var ry = y + 30 + i * ((h - 42) / 3);
    ctx.textAlign = 'left';
    ctx.fillStyle = PAL.ink2; ctx.font = 'bold 10.5px Karla, system-ui, sans-serif';
    ctx.fillText(c[0], x + 10, ry + 2);
    ctx.fillStyle = PAL.ink2; ctx.font = '9px Karla, system-ui, sans-serif';
    ctx.fillText(c[3], x + 10, ry + 11);
    var bx = x + w * 0.44, bw = w * 0.40;
    CFX.bar(ctx, bx, ry - 4, bw, 8, c[1] / 7, c[2], { glow: c[1] >= 5 });
    ctx.textAlign = 'right';
    ctx.fillStyle = c[2]; ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.fillText(c[1].toFixed(1).replace('.', ','), x + w - 10, ry + 3);
  });

  ctx.textAlign = 'left';
  ctx.fillStyle = PAL.ink2; ctx.font = 'italic 9.5px Karla, system-ui, sans-serif';
  ctx.fillText('Atletas: ' + T.athletes, x + 10, y + h - 7);
  ctx.restore();
}

function typesLabel(type) {
  return type === 'ecto' ? 'Ectomorfia alta' : type === 'endo' ? 'Endomorfia alta' : 'Mesomorfia alta';
}

window.drawSomatotype = drawSomatotype;
window.typesLabel = typesLabel;


/* ── Redibuja la simulación del slide activo (igual que el motor original) ── */
export function redrawSlide(slide) {
  switch (slide) {
    case 4: if (typeof drawGL === "function") drawGL(); break;
    case 5: if (typeof drawJoints === "function") drawJoints(); break;
    case 6: if (typeof drawMovement === "function") drawMovement(); break;
    case 7: if (typeof drawAntagonist === "function") drawAntagonist(); break;
    case 8: if (typeof drawBodyProportions === "function") drawBodyProportions(); break;
    case 9: if (typeof drawProportions === "function") drawProportions(); break;
    case 10: if (typeof drawMobility === "function") drawMobility(); break;
    case 11: if (typeof drawSomatotype === "function") drawSomatotype(); break;
    case 12: if (typeof drawAllometry === "function") drawAllometry(); break;
    case 13: if (typeof drawBoneScale === "function") drawBoneScale(); break;
    case 14: if (typeof calcBMI === "function") calcBMI(); break;
    case 15: if (typeof drawStevens === "function") drawStevens(); break;
  }
}
