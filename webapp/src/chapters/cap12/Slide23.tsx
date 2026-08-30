import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide23({
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
    <span className="mnum">12 · 9</span>
    <span className="mtitle">Mapa mental del capítulo</span>
    <span className="msub">{"\\(\\text{carga} \\to \\text{campo} \\to \\text{señal} \\to \\text{diagnóstico}\\)"}</span>
    <span className="mslide-count">23 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🗺️</span> El hilo conductor</div>
        <div className="card-body">
          <p><strong>1 Recibir</strong> la carga de los iones → <strong>2 Impulsar</strong> con campos (Coulomb, Ohm) → <strong>3 Repartir</strong> por los tejidos (σ, ρ) → <strong>4 Guardar</strong> en la membrana (Nernst, Goldman) → <strong>5 Disparar</strong> el potencial de acción y conducirlo por el cable del axón → <strong>6 Sentir</strong> con células ciliadas → <strong>7 Leer</strong> el corazón (ECG) y el cerebro (EEG) → <strong>8 Medir</strong> los campos magnéticos → <strong>9 Proteger</strong> de las descargas.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧮</span> Las cifras que no se olvidan</div>
        <div className="card-body">
          <p><span className="tag">−70 mV reposo</span><span className="tag">umbral −55 mV</span><span className="tag">pico +20 mV</span><span className="tag">u_miel. ≈ 17a</span><span className="tag">V_I+V_III=V_II</span><span className="tag">ECG 1 mV</span><span className="tag">EEG 10–100 µV</span><span className="tag">MCG 50 pT</span><span className="tag">120 V → 240 mA</span></p>
          <p>Ecuaciones 12.1 a 12.93 (y 12.94–12.102 en los problemas) del texto de Herman.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-23">Recorre las etapas del mapa: es el mismo esquema para resolver los problemas del capítulo. La bioelectricidad conecta la física (campos, corrientes) con la medicina (ECG, EEG, descargas).</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-mp" className="sim" />
        <div className="prof-controls">
          <span className="badge">mapa</span>
          <label>Etapa <select id="mp_sel" onChange={(e) => engine.setParam('mp_sel' as any, parseInt(e.target.value, 10))}><option value="0">1 · Recibir</option><option value="1">2 · Impulsar</option><option value="2">3 · Repartir</option><option value="3">4 · Guardar</option><option value="4">5 · Disparar</option><option value="5">6 · Sentir</option><option value="6">7 · Leer</option><option value="7">8 · Medir</option><option value="8">9 · Proteger</option></select></label>
          <span className="readout" id="mp_out">Etapa 1 · Recibir la carga de los iones</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
