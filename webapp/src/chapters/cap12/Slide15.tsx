import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide15({
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
    <span className="mtitle">El corazón como dipolo: Einthoven</span>
    <span className="msub">{"\\(V_\\mathrm{I} + V_\\mathrm{III} = V_\\mathrm{II}\\)"}</span>
    <span className="mslide-count">15 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">❤️</span> Un dipolo que rota cada latido</div>
        <div className="card-body">
          <p>La carga total del corazón es cero, pero las separaciones +/− crean un <strong>dipolo que rota y cambia de magnitud</strong> en cada ciclo (conductor de volumen: el torso lo «ve» lejos). Las sondas miden el voltaje bajo la piel: señales de ~30–500 µV.</p>
          <p>Las tres derivaciones de extremidades forman el <strong>triángulo de Einthoven</strong> (Fig. 12.34) y por la 2.ª ley de Kirchhoff:</p>
          <div className="eq-block"><span className="eqno">(12.88)</span>{"\\[ V_\\mathrm{I} + V_\\mathrm{III} = V_\\mathrm{II} \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📐</span> Proyección y Cabrera</div>
        <div className="card-body">
          <p>La señal es la <strong>proyección con signo</strong> del dipolo sobre cada eje (Fig. 12.1d). Las seis derivaciones del plano frontal se trasladan al <strong>círculo de Cabrera</strong>. El dipolo normal en la despolarización ventricular rota en sentido antihorario (Fig. 12.30).</p>
          <div className="eq-block">{"\\[ V_\\mathrm{derivación} \\propto \\vec{\\mathbf{P}}_\\mathrm{corazón}\\cdot\\hat{\\mathbf{e}}_\\mathrm{derivación} \\]"}</div>
          <p><span className="tag">I: brazo izq − brazo der</span><span className="tag">II: pierna izq − brazo der</span><span className="tag">III: pierna izq − brazo izq</span></p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-15">▶ rota el dipolo cardíaco y observa las tres trazas I, II y III: son las proyecciones sobre los lados del triángulo de Einthoven. Cuando el dipolo apunta hacia la derivación, la señal es positiva.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-eh" className="sim" />
        <div className="prof-controls">
          <span className="badge">Einthoven</span>
          <button id="eh_play" onClick={toggleEinhoven}>▶</button>
          <label>θ dipolo <input type="range" id="eh_th" min="-180" max="180" defaultValue="0" step="2" onChange={(e) => engine.setParam('eh_th' as any, parseFloat(e.target.value))} /> <span id="eh_thv">0°</span></label>
          <span className="readout" id="eh_out">θ = 0° · Vᵢ = +1,0 · Vᴵᴵ = 0,0 · Vᴵᴵᴵ = −1,0</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
