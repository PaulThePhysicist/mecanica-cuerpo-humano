import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide14({
  isActive,
  engine,
  go,
  goModule,
  next,
  prev,
  onBack,
}: {
  isActive: boolean;
  engine: Engine;
  go: (n: number) => void;
  goModule: (m: number) => void;
  next: () => void;
  prev: () => void;
  onBack?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">8.3</span>
    <span className="mtitle">El aneurisma pulsátil: resonancia y ruptura</span>
    <span className="msub">Una esfera elástica que late con el pulso</span>
    <span className="mslide-count">14 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🫧</span> Esfera elástica (eq. 8.42)</div>
        <div className="card-body">
          <p>Modelamos el saco como una esfera de radio {"\\( R \\)"} y pared {"\\( w \\)"}: al crecer un poco {"\\( r(t) \\)"}, el esfuerzo es proporcional a la deformación:</p>
          <div className="eq-block">{"\\[  \\sigma = Y\\,\\frac{r(t)}{R}  \\]"}</div>
          <p>La ecuación de movimiento (eq. 8.43, 8.47): {"\\( \\rho w\\, \\ddot r = P_{\\text{av}} + P_{\\text{p}}\\cos\\omega_{\\text{p}} t - Y\\,r/R \\)"} con</p>
          <div className="eq-block">{"\\[  \\omega_0^2 = \\frac{Y}{R\\, \\rho w}  \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🥁</span> Resonancia</div>
        <div className="card-body">
          <p>Si la frecuencia del pulso {"\\( \\omega_{\\text{p}} \\)"} se acerca a la natural {"\\( \\omega_0 \\)"}, la amplitud crece (eq. 8.48):</p>
          <div className="eq-block">{"\\[  r_{\\text{p}}(t) = \\frac{P_{\\text{p}}/\\rho w}{\\omega_0^2 - \\omega_{\\text{p}}^2}\\cos(\\omega_{\\text{p}} t)  \\]"}</div>
          <p>A mayor amplitud, mayor riesgo de ruptura. La amortiguación {"\\( \\gamma \\)"} (eq. 8.49) limita el pico.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📊</span> Factor de calidad Q</div>
        <div className="card-body">
          <p>El sistema oscila <span className="tag">Q ≈ ω₀/(2πγ) ciclos</span> antes de amortiguarse. Un Q alto = pico de resonancia estrecho y peligroso si el pulso cae cerca de {"\\( \\omega_0 \\)"}.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-14">Un aneurisma es un oscilador: tiene frecuencia natural, amortiguación y resonancia. En el canvas pulsa ▶ y mueve la rigidez hasta alinear ω₀ con el pulso: la esfera late descomunal y el factor de amplificación se dispara. En el cuerpo eso es la pared a punto de romperse.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-pulsatile" />
        <div className="prof-controls">
          <span className="badge">resonancia</span>
          <button id="rp_play" className="btn-sm" onClick={() => engine.togglePulsatile()}>▶</button>
          <label>rigidez Y <input type="range" id="rp_y" min="0.3" max="3" step="0.1" defaultValue={1} onChange={(e) => { engine.setParam('rp_y', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="rp_yv">1,0</span></label>
          <label>radio R <input type="range" id="rp_r" min="0.5" max="1.5" step="0.05" defaultValue={1} onChange={(e) => { engine.setParam('rp_r', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="rp_rv">1,0</span></label>
          <label>amortiguación <input type="range" id="rp_g" min="0.05" max="1.5" step="0.05" defaultValue={0.25} onChange={(e) => { engine.setParam('rp_g', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="rp_gv">0,25</span></label>
          <span className="readout" id="rp_out">ω₀/ω_p ≈ 1,5 · A ≈ 1,6 · lejos de resonancia</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
