import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide2({
  engine,
  go,
  goModule,
  next,
  prev,
  toggleAction,
  toggleEinhoven,
  toggleECG,
  toggleMyo,
  toggleEEG,
}: {
  isActive?: boolean;
  engine: Engine;
  go?: (n: number) => void;
  goModule: (m: number) => void;
  next?: () => void;
  prev?: () => void;
  toggleAction?: () => void;
  toggleEinhoven?: () => void;
  toggleECG?: () => void;
  toggleMyo?: () => void;
  toggleEEG?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">12 · 1</span>
    <span className="mtitle">Coulomb, campo y potencial</span>
    <span className="msub">{"\\(\\vec{\\mathbf{E}} = k\\,q\\,\\hat{\\mathbf{r}}/r^2 \\qquad V = kq/r\\)"}</span>
    <span className="mslide-count">2 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🧲</span> La ley de Coulomb</div>
        <div className="card-body">
          <p>El campo de una carga puntual {"\\(q\\)"} decae como {"\\(1/r^2\\)"} y el potencial como {"\\(1/r\\)"}:</p>
          <div className="eq-block"><span className="eqno">(12.1)</span>{"\\[ \\vec{\\mathbf{E}} = k\\frac{q\\vec{\\mathbf{r}}}{r^3} = k\\frac{q\\hat{\\mathbf{r}}}{r^2} \\]"}</div>
          <div className="eq-block"><span className="eqno">(12.2)</span>{"\\[ V = \\frac{kq}{r},\\qquad k = 8,99\\times10^9\\ \\mathrm{N\\,m^2/C^2} = \\frac{1}{4\\pi\\epsilon_0\\epsilon} \\]"}</div>
          <p>La diferencia de potencial y el gradiente:</p>
          <div className="eq-block"><span className="eqno">(12.3–12.5)</span>{"\\[ \\Delta V = V_b - V_a = -\\int_a^b \\vec{\\mathbf{E}}\\cdot d\\vec{\\mathbf{r}},\\qquad \\vec{\\mathbf{E}} = -\\nabla V,\\qquad E = -dV/dx \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⚖️</span> El dipolo: carga neta cero, campo real</div>
        <div className="card-body">
          <p>Dos cargas {"\\(+q\\)"} y {"\\(-q\\)"} separadas {"\\(d\\)"} (momento dipolar {"\\(\\vec{\\mathbf{P}} = q\\vec{\\mathbf{d}}\\)"}). Lejos, el potencial decae como {"\\(1/r^2\\)"}, más rápido que el de una carga aislada:</p>
          <div className="eq-block"><span className="eqno">(12.6–12.7)</span>{"\\[ V = \\frac{k\\vec{\\mathbf{P}}\\cdot\\vec{\\mathbf{r}}}{r^3} = \\frac{kP\\cos\\theta}{r^2} \\]"}</div>
          <p><span className="highlight">El cuerpo casi no tiene carga neta: los dipolos son el modelo básico</span>, del axón al corazón.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-2">Elige carga única o dipolo, cambia la carga {"\\(q\\)"} y gira el ángulo {"\\(\\theta\\)"}: mira cómo cambia el {"\\(V\\)"} del punto de prueba. En el dipolo el potencial se anula en el plano ecuatorial ({"\\(\\theta = 90°\\)"}).</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-cp" className="sim" />
        <div className="prof-controls">
          <span className="badge">campo</span>
          <label>Configuración <select id="cp_sel" onChange={(e) => engine.setParam('cp_sel' as any, parseInt(e.target.value, 10))}><option value="0">Carga única</option><option value="1">Dipolo</option></select></label>
          <label>q <input type="range" id="cp_q" min="-100" max="100" defaultValue="50" step="5" onChange={(e) => engine.setParam('cp_q' as any, parseFloat(e.target.value))} /> <span id="cp_qv">+50</span></label>
          <label>θ <input type="range" id="cp_th" min="-180" max="180" defaultValue="0" step="5" onChange={(e) => engine.setParam('cp_th' as any, parseFloat(e.target.value))} /> <span id="cp_thv">0°</span></label>
          <span className="readout" id="cp_out">carga única · V = kq/r</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
