import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide16({
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
    <span className="mnum">9.5.3</span>
    <span className="mtitle">Lazos P–V de la respiración</span>
    <span className="msub">Normal · obstructivo · restrictivo · SDR</span>
    <span className="mslide-count">16 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🔁</span> Lazos dinámicos (Fig. 9.18)</div>
        <div className="card-body">
          <p>Volumen contra presión pulmonar para todos los momentos del ciclo: trayectorias cíclicas cerradas. Las curvas crecientes son las <strong>estáticas</strong> (barra inferior = VR, barra superior = CRF); los lazos discontinuos son la respiración de {"\\( V_T \\)"} para cada condición.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📐</span> Lectura del lazo</div>
        <div className="card-body">
          <p>La pendiente de la curva estática = <span className="highlight">compliancia</span>; la anchura horizontal del lazo refleja la <span className="highlight">resistencia</span>. Obstructivo: lazo ancho y desplazado (R alta); restrictivo: lazo estrecho y vertical (C baja).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🫧</span> El SDR idiopático</div>
        <div className="card-body">
          <p>El lugar geométrico se desplaza a <strong>mayor presión</strong> por la falta de surfactante. En bebés prematuros la tensión superficial mínima es de <span className="tag">2×10⁻⁴ N/m</span>, frente a ≪ 0,5×10⁻⁴ N/m en pulmones normales.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-16">El lazo P–V es el «electrocardiograma» de la mecánica pulmonar: pendiente = compliancia, anchura = resistencia, desplazamiento = presión de trabajo. Compara las tres condiciones y el SDR en el canvas; pulsa ▶ para ver el ciclo dibujarse.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-pvloop" />
        <div className="prof-controls">
          <span className="badge">lazos P–V</span>
          <button id="lv_play" onClick={togglePVLoop}>▶</button>
          <label>condición <select id="lv_sel" onChange={(e) => { engine.setParam("lv_sel" as keyof SimParams, (e.target as HTMLSelectElement).value as any); engine.requestDraw(); }}>
            <option value="normal" selected>Normal</option>
            <option value="obstr">Obstructivo</option>
            <option value="restr">Restrictivo</option>
            <option value="sdr">SDR</option>
          </select></label>
          <span className="readout" id="lv_out">normal · C ≈ 0,2 L/cmH₂O</span>
        </div>
      </div>
    </div>
  </div>

{/* ═══════════ M7 · PULMÓN ENFERMO ═══════════ */}
    </>
  );
}
