import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide8({
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
    <span className="mnum">12 · 3</span>
    <span className="mtitle">Goldman: el voltaje realista de la membrana</span>
    <span className="msub">{"\\(\\alpha = p_\\mathrm{Na}/p_\\mathrm{K} = 0,02 \\Rightarrow V \\approx -75\\ \\mathrm{mV}\\)"}</span>
    <span className="mslide-count">8 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🎛️</span> Suma pesada por permeabilidad</div>
        <div className="card-body">
          <p>La membrana es permeable a Na⁺, K⁺ y (poco) Cl⁻. La ecuación de Goldman pesa cada concentración con la permeabilidad {"\\(p\\)"}:</p>
          <div className="eq-block"><span className="eqno">(12.32)</span>{"\\[ V = -\\frac{k_BT}{q}\\ln\\!\\left(\\frac{p_\\mathrm{Na}n_{\\mathrm{Na},i} + p_\\mathrm{K}n_{\\mathrm{K},i} + p_\\mathrm{Cl}n_{\\mathrm{Cl},i}}{p_\\mathrm{Na}n_{\\mathrm{Na},o} + p_\\mathrm{K}n_{\\mathrm{K},o} + p_\\mathrm{Cl}n_{\\mathrm{Cl},o}}\\right) \\]"}</div>
          <p>Despreciando el Cl⁻ ({"\\(p_\\mathrm{Cl}\\approx 0\\)"}) y con {"\\(\\alpha = p_\\mathrm{Na}/p_\\mathrm{K}\\)"}:</p>
          <div className="eq-block"><span className="eqno">(12.33–12.34)</span>{"\\[ V = -\\frac{k_BT}{q}\\ln\\!\\left(\\frac{\\alpha n_{\\mathrm{Na},i} + n_{\\mathrm{K},i}}{\\alpha n_{\\mathrm{Na},o} + n_{\\mathrm{K},o}}\\right) \\]"}</div>
          <p>Con {"\\(\\alpha = 0,02\\)"}: <span className="highlight">V ≈ −75 mV</span>, mucho más cerca del reposo que el Nernst del K⁺ (−91 mV).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🌌</span> Avanzado: Poisson–Boltzmann</div>
        <div className="card-body">
          <p>Acoplando Gauss (12.35–12.38) con Maxwell–Boltzmann (12.30) se obtiene la ecuación de Poisson–Boltzmann (12.41) y el <strong>apantallamiento de Debye–Hückel</strong> de un ion en solución:</p>
          <div className="eq-block"><span className="eqno">(12.45–12.46)</span>{"\\[ \\kappa^2 = \\frac{e^2}{\\epsilon_0\\epsilon k_BT}\\sum_i Z_i^2 n_{i,0},\\qquad V(r) = \\frac{Ze}{4\\pi\\epsilon_0\\epsilon r}\\,e^{-\\kappa r} \\]"}</div>
          <p>Las cargas móviles apantallan el campo del ion en una longitud {"\\(1/\\kappa\\)"}.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-8">Desliza α = pNa/pK: si el canal de Na⁺ gana (α grande), el voltaje sube hacia el Nernst del Na⁺ (+61 mV); si α → 0, cae a −91 mV (solo K⁺). En reposo α ≈ 0,02 → −75 mV.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-gd" className="sim" />
        <div className="prof-controls">
          <span className="badge">Goldman</span>
          <label>α = pNa/pK <input type="range" id="gd_a" min="0" max="0.4" defaultValue="0.02" step="0.005" onChange={(e) => engine.setParam('gd_a' as any, parseFloat(e.target.value))} /> <span id="gd_av">0,020</span></label>
          <span className="readout" id="gd_out">α = 0,020 · V ≈ −75 mV</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
