import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide21({
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
    <span className="mnum">12 · 8</span>
    <span className="mtitle">Los campos biomagnéticos y el campo del axón</span>
    <span className="msub">{"\\(B = \\mu_0 I/2\\pi R\\qquad \\text{MCG } 50\\ \\mathrm{pT}\\)"}</span>
    <span className="mslide-count">21 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🧭</span> Señales mil veces más débiles que la Tierra</div>
        <div className="card-body">
          <p>Los campos magnéticos del cuerpo provienen de las corrientes y son <strong>extremadamente débiles</strong> (Tabla 12.8):</p>
          <table className="data-mini">
            <tr><th>Señal</th><th>Amplitud (pT)</th></tr>
            <tr><td>Magnetocardiograma (MCG)</td><td>50</td></tr>
            <tr><td>MCG fetal</td><td>1–10</td></tr>
            <tr><td>Magnetoencefalograma</td><td>1</td></tr>
            <tr><td>Campos evocados</td><td>0,1</td></tr>
            <tr><td>Magnetomiograma / oculograma</td><td>10</td></tr>
            <tr><td>Campo de la Tierra</td><td>50×10⁶</td></tr>
            <tr className="table-caption"><td colSpan={2}>El corazón: 50 pT; la Tierra: 5×10⁻⁵ T.</td></tr>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔁</span> El campo de un axón (Biot–Savart)</div>
        <div className="card-body">
          <p>Una corriente {"\\(I\\)"} a lo largo de un hilo produce, a distancia {"\\(R\\)"} (12.89):</p>
          <div className="eq-block"><span className="eqno">(12.89–12.91)</span>{"\\[ B = \\frac{\\mu_0 I}{2\\pi R},\\qquad I \\sim \\frac{1}{r_i}\\frac{V}{\\lambda},\\qquad B \\sim \\frac{\\mu_0 V}{2\\pi R r_i\\lambda} \\]"}</div>
          <p>Con {"\\(V = 0,1\\ \\mathrm{V}\\)"}, {"\\(\\lambda = 3,8\\times10^{-4}\\ \\mathrm{m}\\)"}, a 1 mm: <span className="highlight">B ≈ 8 pT</span> (12.92) — consistente con la tabla.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-21">La escala es logarítmica: el MCG (50 pT) es un millón de veces más débil que el campo de la Tierra (50×10⁶ pT). Por eso se miden en salas blindadas con SQUIDs.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-bm" className="sim" />
        <div className="prof-controls">
          <span className="badge">biomagnetismo</span>
          <label>Señal <select id="bm_sel" onChange={(e) => engine.setParam('bm_sel' as any, parseInt(e.target.value, 10))}><option value="0">Campos evocados 0,1</option><option value="1">MEG 1</option><option value="2">MCG fetal 5</option><option value="3">Miograma 10</option><option value="4">MCG 50</option><option value="5">Tierra 50×10⁶</option></select></label>
          <label>R del axón <input type="range" id="bm_r" min="0.5" max="8" defaultValue="1" step="0.5" onChange={(e) => engine.setParam('bm_r' as any, parseFloat(e.target.value))} /> <span id="bm_rv">1,0 mm</span></label>
          <span className="readout" id="bm_out">MCG · 50 pT</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
