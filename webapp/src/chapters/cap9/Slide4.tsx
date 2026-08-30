import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide4({
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
    <span className="mtitle">La ley de Laplace en los alvéolos</span>
    <span className="msub">ΔP = 2γ/R · sin surfactante, inflar cuesta 22 mmHg</span>
    <span className="mslide-count">4 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🎈</span> Ley de Laplace (ec. 9.1–9.3)</div>
        <div className="card-body">
          <div className="eq-block"><span className="eqno">(9.1)</span>{"\\[ \\Delta P = \\frac{2T}{R} \\]"}</div>
          <p>Para una esfera de radio {"\\( R \\)"}, con {"\\( T \\)"} la tensión en las paredes. La fuente principal en los alvéolos está en las <strong>superficies</strong>: la tensión superficial {"\\( \\gamma \\)"} (fuerza/longitud).</p>
          <div className="eq-block"><span className="eqno">(9.2)</span>{"\\[ \\Delta P = P_{\\text{in}} - P_{\\text{out}} = \\frac{4\\gamma}{R} \\]"}</div>
          <p>Burbuja de jabón: ambas superficies contribuyen, {"\\( T = 2\\gamma \\)"}.</p>
          <div className="eq-block"><span className="eqno">(9.3)</span>{"\\[ \\Delta P_{\\text{alveolar}} = P_{\\text{in}} - P_{\\text{out}} = \\frac{2\\gamma}{R} \\]"}</div>
          <p>En el alvéolo solo importa la interfaz fluido/aire interna (mayor {"\\( \\gamma \\)"} que la fluido/fluido externa).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">💧</span> La tensión superficial</div>
        <div className="card-body">
          <p>Para la interfaz agua/aire, {"\\( \\gamma_{\\text{water}} \\simeq 7{,}2\\times 10^{-2}\\ \\text{N/m} \\)"} (= 72 dina/cm). Con {"\\( R = 0{,}05\\ \\text{mm} \\)"} (alvéolo colapsado), la ec. (9.3) da {"\\( \\Delta P = 2{,}9\\times 10^3\\ \\text{N/m}^2 = 22\\ \\text{mmHg} \\)"} para poder inflarlo.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🫁</span> La fuerza del diafragma</div>
        <div className="card-body">
          <p>El diafragma del adulto tiene ~500 cm². La fuerza para expandir los alvéolos es {"\\( F = \\Delta P \\cdot A \\approx 150\\ \\text{N} \\)"}, lo que corresponde a <span className="tag">15 kg</span>. El surfactante la reduce más de un orden de magnitud: por eso la <span className="highlight">enfermedad de membrana hialina</span> (surfactante insuficiente) hace difícil respirar.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-4">La ley de Laplace es la ecuación central del capítulo: a menor radio, mayor presión. Para inflar un alvéolo colapsado de 0,05 mm sin surfactante hacen falta 22 mmHg, y el diafragma debería tirar con ~150 N — el peso de un niño pequeño. Con el surfactante, la respiración se vuelve trivial.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-laplace" />
        <div className="prof-controls">
          <span className="badge">Laplace</span>
          <label>R <input type="range" id="lp_r" min="20" max="300" step="5" defaultValue="50" onInput={(e) => { engine.setParam("lp_r" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="lp_rv">50 µm</span></label>
          <label>γ <select id="lp_g" onChange={(e) => { engine.setParam("lp_g" as keyof SimParams, (e.target as HTMLSelectElement).value as any); engine.requestDraw(); }}>
            <option value="water" selected>Agua 7,2×10⁻² N/m</option>
            <option value="lung">Surfactante 1×10⁻³ N/m</option>
          </select></label>
          <span className="readout" id="lp_out">ΔP = 22 mmHg · F ≈ 15 kg</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
