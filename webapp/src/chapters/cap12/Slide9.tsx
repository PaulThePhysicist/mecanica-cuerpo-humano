import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide9({
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
    <span className="mtitle">Potenciales graduados y de acción</span>
    <span className="msub">{"\\(\\text{umbral} \\approx -55\\ \\mathrm{mV},\\quad \\text{pico} \\approx +20\\ \\mathrm{mV}\\)"}</span>
    <span className="mslide-count">9 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📉</span> Graduados: suaves y sumables</div>
        <div className="card-body">
          <p>Perturbaciones menores (neurotransmisores, estímulos sensoriales, fugas). <strong>Sin umbral</strong>, duran de 5 ms a varios minutos, pueden ser despolarizantes o hiperpolarizantes, <strong>se suman</strong> y se propagan solo distancias cortas (decaen).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📈</span> Acción: todo o nada</div>
        <div className="card-body">
          <p>Desde −70 mV, una despolarización de 15–20 mV lleva la membrana al <strong>umbral ≈ −55 mV</strong>: se abren los canales de Na⁺ y el potencial dispara a ≈ +20 mV; el K⁺ sale y repolariza (sobreimpulso). Dura 1–5 ms, <strong>no se suma</strong> y <span className="highlight">no se atenúa a lo largo del axón</span>.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-9">▶ anima un potencial de acción: subida por Na⁺ (despolarización), pico ≈ +20 mV, caída por salida de K⁺ (repolarización) y sobreimpulso. El umbral −55 mV separa lo gradual de lo «todo o nada».</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-ap" className="sim" />
        <div className="prof-controls">
          <span className="badge">potencial de acción</span>
          <button id="ap_play" onClick={toggleAction}>▶</button>
          <label>Estímulo <input type="range" id="ap_st" min="-90" max="50" defaultValue="-60" step="1" onChange={(e) => engine.setParam('ap_st' as any, parseFloat(e.target.value))} /> <span id="ap_stv">−60 mV</span></label>
          <span className="readout" id="ap_out">estímulo −60 mV · subumbral</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
