import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide16({
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
    <span className="mnum">12 · 6</span>
    <span className="mtitle">El electrocardiograma normal</span>
    <span className="msub">{"\\(25\\ \\mathrm{mm/s}\\qquad 10\\ \\mathrm{mm/mV}\\)"}</span>
    <span className="mslide-count">16 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">💓</span> P, QRS y T</div>
        <div className="card-body">
          <p>En cada ciclo se ven tres eventos (Fig. 12.28): la onda <strong>P</strong> (despolarización auricular), el complejo <strong>QRS</strong> (despolarización ventricular, sístole) y la onda <strong>T</strong> (repolarización ventricular; la repolarización auricular queda enmascarada por el QRS).</p>
          <div className="eq-block">{"\\[ \\mathrm{P} \\to \\text{aurículas} \\qquad \\mathrm{QRS} \\to \\text{ventrículos} \\qquad \\mathrm{T} \\to \\text{repolarización} \\]"}</div>
          <p>Registro a 25 mm/s y 10 mm/mV: cada caja grande = 0,2 s.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧩</span> Las 12 derivaciones (Tabla 12.6)</div>
        <div className="card-body">
          <p>Tres bipolares de extremidades (I, II, III), tres aumentadas (aVR, aVL, aVF) y seis precordiales (V1–V6):</p>
          <table className="data-mini">
            <tr><th>Grupo</th><th>Derivaciones</th><th>Ubicación</th></tr>
            <tr><td>Extremidades</td><td>I · II · III</td><td>brazos + pierna izq.</td></tr>
            <tr><td>Aumentadas</td><td>aVR · aVL · aVF</td><td>brazo der/izq, pierna izq.</td></tr>
            <tr><td>Precordiales</td><td>V1–V6</td><td>4.º–5.º espacio intercostal</td></tr>
            <tr className="table-caption"><td colSpan={3}>V1/V2: lado del esternón; V4–V6: línea medioclavicular → medioaxilar.</td></tr>
          </table>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-16">▶ recorre un ciclo y fíjate en los tres complejos. Mide: a 25 mm/s, la distancia entre dos QRS da la frecuencia. Señal típica: ~1 mV en la derivación que mira al dipolo.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-ec" className="sim" />
        <div className="prof-controls">
          <span className="badge">ECG</span>
          <button id="ec_play" onClick={toggleECG}>▶</button>
          <label>FC (lpm) <input type="range" id="ec_hr" min="40" max="120" defaultValue="72" step="1" onChange={(e) => engine.setParam('ec_hr' as any, parseFloat(e.target.value))} /> <span id="ec_hrv">72 lpm</span></label>
          <span className="readout" id="ec_out">72 lpm · P–QRS–T</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
