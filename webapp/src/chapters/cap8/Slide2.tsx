import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide2({
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
    <span className="mnum">8.1</span>
    <span className="mtitle">Presión arterial: sistólica, diastólica y media</span>
    <span className="msub">La diástole dura el doble: pesa el doble</span>
    <span className="mslide-count">2 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📐</span> Presión media (eq. 8.1)</div>
        <div className="card-body">
          <p>La presión arterial oscila; la <strong>media</strong> pondera por el tiempo de cada fase. Como la diástole dura ~2/3 del ciclo:</p>
          <div className="eq-block">{"\\[  P_{\\text{media}} = \\frac{P_{\\text{sistole}} + 2\\,P_{\\text{diastole}}}{3}  \\]"}</div>
          <p>Para 120/80: <span className="tag">(120 + 2·80)/3 ≈ 93 mmHg</span>.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📈</span> Presión de pulso (eq. 8.93)</div>
        <div className="card-body">
          <div className="eq-block">{"\\[  P_{\\text{pulso}} = P_{\\text{sistole}} - P_{\\text{diastole}} \\approx 40\\ \\text{mmHg}  \\]"}</div>
          <p>La onda de pulso viaja a <span className="tag">4–8 m/s</span> en la aorta y hasta <span className="tag">16 m/s</span> en la periferia: mucho más rápido que la propia sangre (~30 cm/s). La presión no es estática — cambia con cada latido.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🫀</span> La lectura clínica</div>
        <div className="card-body">
          <p>El manguito mide <strong>sistólica 120 y diastólica 80</strong> (primer y último sonido de Korotkoff). El <span className="tag">pulso carotídeo</span> palpa la onda, no el flujo: es presión, no sangre que se mueve.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-2">La fórmula P_media = (P_sist + 2·P_dias)/3 es la primera ecuación del capítulo y la más usada en la clínica. En el canvas mueve sistólica y diastólica: la media siempre queda por debajo de la aritmética (120+80)/2 = 100 — la diástole pesa el doble.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-wave" />
        <div className="prof-controls">
          <span className="badge">onda de pulso</span>
          <label>P_sistólica <input type="range" id="pm_sys" min="100" max="180" step="5" defaultValue={120} onChange={(e) => { engine.setParam('pm_sys', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="pm_sysv">120</span></label>
          <label>P_diastólica <input type="range" id="pm_dia" min="50" max="110" step="5" defaultValue={80} onChange={(e) => { engine.setParam('pm_dia', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="pm_diav">80</span></label>
          <span className="readout" id="pm_out">P_media ≈ 93 mmHg · P_pulso 40</span>
        </div>
      </div>
    </div>
  </div>


    </>
  );
}
