import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide11({
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
    <span className="mnum">12 · 4</span>
    <span className="mtitle">Velocidad de conducción: mielina y salto</span>
    <span className="msub">{"\\(u_\\mathrm{amiel.} \\approx 1,8\\sqrt{a}\\quad u_\\mathrm{miel.} \\approx 17a\\ \\mathrm{m/s}\\)"}</span>
    <span className="mslide-count">11 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🚀</span> λ, τ y la velocidad</div>
        <div className="card-body">
          <p>Reordenando la ecuación del cable se definen la longitud característica y el tiempo característico (12.72–12.74):</p>
          <div className="eq-block"><span className="eqno">(12.73–12.75)</span>{"\\[ \\lambda = \\sqrt{\\frac{ab\\,\\rho_m}{2\\rho_i}},\\qquad \\tau = \\kappa\\epsilon_0\\rho_m,\\qquad u \\sim \\frac{\\lambda}{\\tau} \\]"}</div>
          <p>El modelo predice, pero ~7× más lento que lo medido: amielínico {"\\(u\\sim 0,27\\sqrt{a}\\)"} vs observado {"\\(1,8\\sqrt{a}\\)"}; mielínico {"\\(u\\sim 2,2a\\)"} vs {"\\(17a\\)"}. La mielina aísla: la señal se <strong>regenera en los nodos de Ranvier</strong> (espaciado ≈ 280a).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⏱️</span> Medición clínica</div>
        <div className="card-body">
          <p>Se estimula un punto y se detecta el retraso en otro (Fig. 12.22): nervio motor del antebrazo <strong>62,5 m/s</strong>, sensorial <strong>58,1 m/s</strong>. Las amielínicas (2/3 de las fibras, radios 0,05–0,6 µm) van a {"\\(1,8\\sqrt{a}\\)"}; las mielínicas (0,5–10 µm) a ~17a. Conteos (12.3): ~10⁷ neuronas aferentes, 10¹¹ cerebrales con 10¹⁴ sinapsis, 5×10⁵ eferentes.</p>
          <div className="eq-block">{"\\[ u_\\mathrm{amiel.} \\approx 1,8\\sqrt{a}\\ \\mathrm{m/s},\\qquad u_\\mathrm{miel.} \\approx 17a\\ \\mathrm{m/s},\\qquad \\text{nodos} \\approx 280a \\]"}</div>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-11">Mueve el radio a: la mielina multiplica la velocidad por ~10 (17a vs 1,8√a). El salto por nodos (~280a) es la forma de acelerar sin engrosar el axón.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-vl" className="sim" />
        <div className="prof-controls">
          <span className="badge">velocidad</span>
          <label>a (µm) <input type="range" id="vl_a" min="0.5" max="10" defaultValue="5" step="0.1" onChange={(e) => engine.setParam('vl_a' as any, parseFloat(e.target.value))} /> <span id="vl_av">5,0 µm</span></label>
          <span className="readout" id="vl_out">amielínico 4,0 m/s · mielínico 85 m/s</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
