import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide20({
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
    <span className="mnum">8.4</span>
    <span className="mtitle">El modelo Windkessel</span>
    <span className="msub">La «cámara de aire» que suaviza el pulso</span>
    <span className="mslide-count">20 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🛢️</span> La idea</div>
        <div className="card-body">
          <p>Las arterias grandes almacenan el volumen sistólico en sístole y lo liberan en diástole, como una cámara de aire (Windkessel) que convierte el chorro pulsátil en un flujo casi continuo (eq. 8.109):</p>
          <div className="eq-block">{"\\[  Q_{\\text{in}} = C\\,\\frac{\\mathrm{d}P}{\\mathrm{d}t} + \\frac{P}{R_{\\text{p}}}  \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⏱️</span> La constante de tiempo</div>
        <div className="card-body">
          <p>En diástole {"\\( Q_{\\text{in}} = 0 \\)"}: la presión se vacía exponencialmente (eq. 8.110–8.112):</p>
          <div className="eq-block">{"\\[  \\tau = R_{\\text{p}}\\,C \\qquad P(t) = P(0)\\,e^{-t/\\tau}  \\]"}</div>
          <p>Arterias rígidas (C baja) → vaciado rápido → <span className="tag">diastólica baja</span>.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔌</span> La analogía eléctrica</div>
        <div className="card-body">
          <p>La resistencia es un resistor y la compliancia un capacitor: la bomba carga el capacitor en sístole y el resistor lo descarga. Los modelos <span className="tag">W2, W3 y VW</span> añaden la inercia y la impedancia característica del árbol arterial.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-20">El Windkessel es un RC: carga (sístole) y descarga (diástole). En el canvas pulsa ▶ y mira el capacitor arterial llenarse y vaciarse; sube la resistencia y el vaciado se alarga (τ mayor). Es el modelo más simple que explica por qué el pulso no es un cuadrado.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-windkessel" />
        <div className="prof-controls">
          <span className="badge">Windkessel</span>
          <button id="wk_play" className="btn-sm" onClick={() => engine.toggleWindkessel()}>▶</button>
          <label>C <input type="range" id="wk_c" min="0.001" max="0.003" step="0.00005" defaultValue={0.002} onChange={(e) => { engine.setParam('wk_c', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="wk_cv">0,002</span></label>
          <label>R_p <input type="range" id="wk_r" min="10" max="25" step="0.5" defaultValue={17.5} onChange={(e) => { engine.setParam('wk_r', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="wk_rv">17,5</span></label>
          <label>F <input type="range" id="wk_f" min="40" max="160" step="5" defaultValue={70} onChange={(e) => { engine.setParam('wk_f', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="wk_fv">70 /min</span></label>
          <span className="readout" id="wk_out">τ = 0,035 min · diástole: P(t) = P₀·e^(−t/τ)</span>
        </div>
      </div>
    </div>
  </div>


    </>
  );
}
