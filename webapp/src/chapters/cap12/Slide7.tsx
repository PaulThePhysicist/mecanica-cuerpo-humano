import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide7({
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
    <span className="mtitle">La ecuación de Nernst y el equilibrio de Donnan</span>
    <span className="msub">{"\\(V = -\\dfrac{k_BT}{q}\\ln(n_i/n_o)\\)"}</span>
    <span className="mslide-count">7 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">⚖️</span> Nernst: el voltaje que iguala los flujos</div>
        <div className="card-body">
          <p>En estado estacionario, difusión y campo eléctrico se equilibran ({"\\(J_\\mathrm{diff}+J_\\mathrm{elect}=0\\)"}), y difusión y movilidad se ligan por Einstein:</p>
          <div className="eq-block"><span className="eqno">(12.18–12.19)</span>{"\\[ D_\\mathrm{diff}\\frac{dn}{dx} = n\\mu E,\\qquad \\mu = \\frac{qD_\\mathrm{diff}}{k_BT} \\]"}</div>
          <div className="eq-block"><span className="eqno">(12.27)</span>{"\\[ V = -\\frac{k_BT}{q}\\ln\\frac{n_i}{n_o} \\]"}</div>
          <p>Con {"\\(q=Ze\\)"}, en equilibrio térmico (Maxwell–Boltzmann, 12.29–12.30):</p>
          <div className="eq-block"><span className="eqno">(12.28)</span>{"\\[ \\frac{n_i}{n_o} = \\exp\\!\\left(-\\frac{Ze(V_i-V_o)}{k_BT}\\right)\\quad\\text{(Donnan)} \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧮</span> Valores del cuerpo</div>
        <div className="card-body">
          <p>El potencial de Nernst que explicaría las relaciones observadas (12.31): <span className="tag">Na⁺ +61 mV</span><span className="tag">K⁺ −91 mV</span><span className="tag">Cl⁻ −70 mV</span>. A −70 mV y 310 K, Donnan predice {"\\(n_i/n_o = 13,7\\)"} para {"\\(Z=+1\\)"} (K⁺: 30 ✓, Na⁺: 0,103 ✗) y 0,073 para {"\\(Z=-1\\)"} (Cl⁻: 0,072 ✓). El Na⁺ solo «obedece» gracias a la bomba.</p>
          <div className="eq-block">{"\\[ n_i/n_o = 13,7\\quad (Z=+1),\\qquad n_i/n_o = 0,073\\quad (Z=-1) \\]"}</div>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-7">Cambia la valencia Z y la temperatura T: el voltaje de Nernst crece con {"\\(k_BT/q\\)"} y con el log del cociente. Con {"\\(Z=+1\\)"} y 310 K se reproduce la escala de +61 a −91 mV de los iones.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-nr" className="sim" />
        <div className="prof-controls">
          <span className="badge">Nernst</span>
          <label>Z <input type="range" id="nr_z" min="-2" max="2" defaultValue="1" step="1" onChange={(e) => engine.setParam('nr_z' as any, parseFloat(e.target.value))} /> <span id="nr_zv">+1</span></label>
          <label>T <input type="range" id="nr_t" min="280" max="320" defaultValue="310" step="1" onChange={(e) => engine.setParam('nr_t' as any, parseFloat(e.target.value))} /> <span id="nr_tv">310 K</span></label>
          <label>log10(ni/no) <input type="range" id="nr_lg" min="-2" max="2" defaultValue="0" step="0.05" onChange={(e) => engine.setParam('nr_lg' as any, parseFloat(e.target.value))} /> <span id="nr_lgv">0,00</span></label>
          <span className="readout" id="nr_out">V = −(kBT/q) ln(ni/no)</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
