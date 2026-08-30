import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide21({
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
    <span className="mnum">9.5.5</span>
    <span className="mtitle">A 2.500 m: comparar presiones</span>
    <span className="msub">Tabla 9.4 · nivel del mar vs. 2.500 m</span>
    <span className="mslide-count">21 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📊</span> Tabla 9.4</div>
        <div className="card-body">
          <table className="data-mini">
            <tr><th>Altitud</th><th>Nivel del mar</th><th>A 2.500 m</th></tr>
            <tr><td>Presión atmosférica (total)</td><td>760</td><td>560</td></tr>
            <tr><td>Presión atmosférica (O₂)</td><td>159</td><td>117</td></tr>
            <tr><td>En los alvéolos (O₂)</td><td>105</td><td>77</td></tr>
            <tr><td>Sangre arterial (O₂)</td><td>100</td><td>72</td></tr>
            <tr><td>Sangre venosa (O₂)</td><td>40</td><td>40</td></tr>
          </table>
          <p className="table-caption">Presiones en mmHg (Prob. 9.49, a partir de los datos del texto).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📉</span> Qué se pierde</div>
        <div className="card-body">
          <p>A 2.500 m la presión total cae ~200 mmHg y la alveolar de O₂ baja de 105 a 77. La <strong>venosa no cambia</strong> (40): el cuerpo mantiene la extracción de oxígeno hasta el mismo piso.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🏃</span> Compensación (Prob. 9.49)</div>
        <div className="card-body">
          <p>Para el mismo flujo de O₂ a los tejidos, la sangre tendría que fluir ~30 % más rápido, o hay que respirar más (mayor frecuencia o {"\\( V_T \\)"}). La adaptación a la altura aumenta glóbulos rojos y hemoglobina.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-21">La presión venosa de O₂ es idéntica (40) a nivel del mar y a 2.500 m: el cuerpo extrae hasta el mismo piso; lo que baja es la «oferta» arterial (72 frente a 100). En el canvas compara las cinco barras y usa el select para resaltar cada fila.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-table94" />
        <div className="prof-controls">
          <span className="badge">Tabla 9.4</span>
          <label>fila <select id="tb_sel" onChange={(e) => { engine.setParam("tb_sel" as keyof SimParams, (e.target as HTMLSelectElement).value as any); engine.requestDraw(); }}>
            <option value="all" selected>Todas</option>
            <option value="0">Total</option>
            <option value="1">O₂ atmosférico</option>
            <option value="2">O₂ alveolar</option>
            <option value="3">O₂ arterial</option>
            <option value="4">O₂ venoso</option>
          </select></label>
          <span className="readout" id="tb_out">total 760 → 560 mmHg</span>
        </div>
      </div>
    </div>
  </div>

{/* ═══════════ M9 · TRABAJO DE LA RESPIRACIÓN ═══════════ */}
    </>
  );
}
