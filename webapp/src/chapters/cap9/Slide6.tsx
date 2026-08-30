import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide6({
  isActive,
  engine,
  go,
  goModule,
  next,
  prev,
  toggleBubbles,
  toggleBreath,
  toggleSpiro,
  toggleCycle,
  togglePVLoop,
  onBack,
}: {
  isActive: boolean;
  engine: Engine;
  go: (n: number) => void;
  goModule: (m: number) => void;
  next: () => void;
  prev: () => void;
  toggleBubbles?: () => void;
  toggleBreath?: () => void;
  toggleSpiro?: () => void;
  toggleCycle?: () => void;
  togglePVLoop?: () => void;
  onBack?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">9.2</span>
    <span className="mtitle">El surfactante: estabilidad y radio de equilibrio</span>
    <span className="msub">γ(R) plano hasta R₀, sube después · R_eq ≈ √3·R₀</span>
    <span className="mslide-count">6 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🧪</span> El modelo de γ(R) (ec. 9.4–9.6)</div>
        <div className="card-body">
          <p>La superficie se cubre de lipoproteína (tensión {"\\( \\gamma_{\\text{pulmón}} = 1\\times10^{-3}\\ \\text{N/m} \\)"}) o de agua ({"\\( \\gamma_{\\text{water}} = 7{,}2\\times10^{-2}\\ \\text{N/m} \\)"}). Con una monocapa exacta para {"\\( R = R_0 \\)"}:</p>
          <div className="eq-block"><span className="eqno">(9.4)</span>{"\\[ \\gamma(R) = \\gamma_{\\text{pulmón}} \\quad (R \\le R_0) \\]"}</div>
          <div className="eq-block"><span className="eqno">(9.5)</span>{"\\[ \\gamma(R) = \\frac{4\\pi R_0^2 \\gamma_p + (4\\pi R^2 - 4\\pi R_0^2)\\gamma_w}{4\\pi R^2} \\quad (R > R_0) \\]"}</div>
          <div className="eq-block"><span className="eqno">(9.6)</span>{"\\[ \\gamma(R) = \\gamma_w - \\frac{R_0^2}{R^2}(\\gamma_w - \\gamma_p) \\quad (R > R_0) \\]"}</div>
          <p>Para {"\\( R \\gg R_0 \\)"} tiende a {"\\( \\gamma_w \\)"}, a una tasa más rápida que {"\\( R \\)"}: los alvéolos son estables.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⚖️</span> Estabilidad (ec. 9.7–9.8)</div>
        <div className="card-body">
          <p>Con {"\\( \\Delta P = 2\\gamma/R \\)"} y el modelo (9.6), el equilibrio estable exige {"\\( d(\\Delta P)/dR = 0 \\)"}:</p>
          <div className="eq-block"><span className="eqno">(9.7)</span>{"\\[ \\frac{d(\\Delta P)}{dR} = -\\frac{2\\gamma_w}{R^2} + \\frac{6R_0^2}{R^4}(\\gamma_w - \\gamma_p) = 0 \\]"}</div>
          <div className="eq-block"><span className="eqno">(9.8)</span>{"\\[ R_{\\text{eq}} = \\sqrt{\\frac{3\\gamma_w - \\gamma_p}{\\gamma_w}}\\,R_0 \\simeq \\sqrt{3}\\,R_0 \\]"}</div>
          <p>Como {"\\( \\gamma_w \\gg \\gamma_p \\)"}, el radio de equilibrio es ≈ {"\\( \\sqrt{3}\\,R_0 \\)"}.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📉</span> Surfactante vs. área</div>
        <div className="card-body">
          <p>La tensión superficial del extracto pulmonar baja de <span className="tag">5×10⁻² N/m</span> (50 dina/cm) a cero cuando el área de la película se encoge. Los alvéolos son típicamente estables a ~<span className="tag">1/4 de su tamaño máximo</span>.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-6">Dos funciones del surfactante: estabilizar (aplanar γ para R &lt; R₀ y subirla para R &gt; R₀) y ahorrarle fuerza al diafragma. Mueve R₀ en el canvas y mira la curva ΔP(R): el valle es el equilibrio estable, que cae en R_eq ≈ √3·R₀. Sin ese valle, la inestabilidad de la slide anterior ganaría.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-surfactant" />
        <div className="prof-controls">
          <span className="badge">surfactante</span>
          <label>R₀ <input type="range" id="sf_r0" min="20" max="100" step="5" defaultValue="50" onInput={(e) => { engine.setParam("sf_r0" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="sf_r0v">50 µm</span></label>
          <label>curva <select id="sf_sel" onChange={(e) => { engine.setParam("sf_sel" as keyof SimParams, (e.target as HTMLSelectElement).value as any); engine.requestDraw(); }}>
            <option value="dp" selected>ΔP(R)</option>
            <option value="gam">γ(R)</option>
          </select></label>
          <span className="readout" id="sf_out">R_eq ≈ 87 µm · d(ΔP)/dR = 0</span>
        </div>
      </div>
    </div>
  </div>

{/* ═══════════ M3 · FÍSICA DE LA RESPIRACIÓN ═══════════ */}
    </>
  );
}
