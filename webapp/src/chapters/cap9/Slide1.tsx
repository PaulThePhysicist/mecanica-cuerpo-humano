import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide1({
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
    <span className="mnum">9 · Intro</span>
    <span className="mtitle">La respiración en números</span>
    <span className="msub">Ventilación ~6 L/min · 12 / 20 / 60 respiraciones por minuto</span>
    <span className="mslide-count">1 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🫁</span> El aire que respiramos</div>
        <div className="card-body">
          <p>Inspiramos {"\\( \\sim 6\\ \\text{L/min} \\)"} de aire: la <strong>tasa de ventilación</strong> (comparable a los ~5–6 L/min de sangre por la circulación pulmonar). Como el aire tiene ~20 % de O₂, inhalamos ~1,2 L de O₂/min. La frecuencia respiratoria es de <span className="tag">12/min (hombres)</span>, <span className="tag">20/min (mujeres)</span> y <span className="tag">60/min (lactantes)</span>.</p>
          <p>Respiramos ~<span className="tag">10 kg de aire/día</span>, con ~2 kg de O₂/día; los pulmones absorben al menos 0,5 kg de O₂/día (400 L) y exhalamos ~0,5 kg de vapor de agua/día.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧪</span> Composición del aire</div>
        <div className="card-body">
          <p>El aire <strong>inspirado</strong> (seco, 2015): 78,084 % N₂ / 20,947 % O₂ / 0,934 % Ar / 0,04 % CO₂. El <strong>espirado</strong>: ~80 % N₂ / 16 % O₂ / 4 % CO₂ (sin contar vapor de agua ni argón).</p>
          <p>Si el espirado tuviera poco o nada de oxígeno, no podríamos usarlo para el <span className="highlight">boca a boca</span> — pero sí sirve.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🏃</span> Consumo de oxígeno</div>
        <div className="card-body">
          <p>En reposo usamos ~0,2–0,3 L de O₂/min ({"\\( dV_{\\text{O}_2}/dt \\)"}), aportados por los ~5–6 L de sangre/min. La tasa máxima (VO₂max) es <span className="tag">≈ 2,8 L/min</span> (condición promedio) y <span className="tag">≈ 4 L/min</span> (excelente). Las presiones respiratorias se miden como manométricas: <span className="tag">1 mmHg = 1,36 cmH₂O</span>.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-1">Cifras para abrir la clase: respiramos ~6 L/min y el corazón bombea ~5–6 L/min — coincidencia del diseño. Del aire inspirado solo ~1,2 L son O₂ y en reposo gastamos ~0,2–0,3 L O₂/min. El aire que exhalas aún tiene 16 % de O₂: por eso el boca a boca funciona. En el canvas compara las tres mezclas.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-composition" />
        <div className="prof-controls">
          <span className="badge">aire</span>
          <label>mezcla <select id="cm_sel" onChange={(e) => { engine.setParam("cm_sel" as keyof SimParams, (e.target as HTMLSelectElement).value as any); engine.requestDraw(); }}>
            <option value="insp" selected>Inspirado</option>
            <option value="exp">Espirado</option>
            <option value="viciado">Viciado (alvéolos)</option>
          </select></label>
          <span className="readout" id="cm_out">Inspirado · O₂ 20,947 %</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
