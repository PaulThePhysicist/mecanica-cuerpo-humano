import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide1({
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
    <span className="mnum">12 · 1</span>
    <span className="mtitle">La bioelectricidad: el cuerpo hecho de iones</span>
    <span className="msub">{"\\(\\mathrm{ECG}\\ 1\\ \\mathrm{mV}\\quad \\mathrm{EEG}\\ 10{-}100\\ \\mu\\mathrm{V}\\quad \\mathrm{EMG}\\ 300\\ \\mu\\mathrm{V}\\)"}</span>
    <span className="mslide-count">1 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">⚡</span> Un lenguaje de voltajes</div>
        <div className="card-body">
          <p>La función de <strong>cada célula</strong> depende de la electricidad: cada neurona del cerebro, cada señal que mueve el músculo esquelético, cardíaco o liso. Ya apareció en los caps. 3 (EMG), 5 (activación muscular por iones {"\\(\\mathrm{Ca}^{2+}\\)"}) y 8 (ECG). El capítulo estudia la <strong>física del movimiento de iones</strong> por la sangre y las células.</p>
          <table className="data-mini">
            <tr><th>Señal (Tabla 12.1)</th><th>Amplitud</th></tr>
            <tr><td>ECG · corazón</td><td>1 mV</td></tr>
            <tr><td>EEG · ondas cerebrales</td><td>10–100 µV</td></tr>
            <tr><td>EMG · músculo</td><td>300 µV</td></tr>
            <tr><td>Potencial transmembrana</td><td>100 mV</td></tr>
            <tr><td>EOG · ojo</td><td>500 µV</td></tr>
            <tr className="table-caption"><td colSpan={2}>Voltajes medidos en el cuerpo.</td></tr>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧂</span> Portadores: iones, no electrones</div>
        <div className="card-body">
          <p>En el cuerpo los portadores de carga son iones: {"\\(\\mathrm{Na}^+\\)"}, {"\\(\\mathrm{K}^+\\)"}, {"\\(\\mathrm{Ca}^{2+}\\)"}, {"\\(\\mathrm{Cl}^-\\)"} y proteínas cargadas negativamente. Los electrones dominan los circuitos electrónicos, <strong>no el cuerpo</strong>.</p>
          <div className="eq-block">{"\\[ \\text{voltaje de membrana} \\approx -70\\ \\mathrm{mV}\\ (\\text{interior vs exterior}) \\]"}</div>
          <p><span className="tag">ECG 1 mV</span><span className="tag">EEG 10–100 µV</span><span className="tag">EMG 300 µV</span><span className="tag">EOG 500 µV</span> — la escala va del milivoltio al microvoltio.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-1">Recorre con el selector las señales del cuerpo: todas caen entre el µV y el mV. El potencial transmembrana (100 mV) es el más fuerte; el EEG, el más débil que se registra en la piel.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-bi" className="sim" />
        <div className="prof-controls">
          <span className="badge">señales</span>
          <label>Señal <select id="bi_sel" onChange={(e) => engine.setParam('bi_sel' as any, parseInt(e.target.value, 10))}><option value="0">ECG · 1 mV</option><option value="1">EEG · 50 µV</option><option value="2">EMG · 300 µV</option><option value="3">Membrana · 100 mV</option><option value="4">EOG · 500 µV</option></select></label>
          <span className="readout" id="bi_out">ECG · 1 mV</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
