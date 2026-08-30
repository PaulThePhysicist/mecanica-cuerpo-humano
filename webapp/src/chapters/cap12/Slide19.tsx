import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide19({
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
    <span className="mnum">12 · 7</span>
    <span className="mtitle">El electroencefalograma</span>
    <span className="msub">{"\\(\\alpha\\ 8{-}13\\ \\mathrm{Hz}\\quad \\beta\\ 14{-}25\\ \\mathrm{Hz}\\quad \\theta\\ 4{-}7\\ \\mathrm{Hz}\\quad \\delta \\lt 3,5\\ \\mathrm{Hz}\\)"}</span>
    <span className="mslide-count">19 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🌊</span> Ritmos del cerebro</div>
        <div className="card-body">
          <p>A diferencia del ECG, el EEG es irregular pero tiene patrones rítmicos identificables:</p>
          <table className="data-mini">
            <tr><th>Onda</th><th>Frecuencia</th><th>Estado</th></tr>
            <tr><td>Alfa</td><td>8–13 Hz</td><td>despierto, relajado</td></tr>
            <tr><td>Beta</td><td>14–25 Hz</td><td>vigilia alerta, tensión</td></tr>
            <tr><td>Theta</td><td>4–7 Hz</td><td>niños, estrés, trastornos</td></tr>
            <tr><td>Delta</td><td>&lt; 3,5 Hz</td><td>sueño profundo</td></tr>
            <tr className="table-caption"><td colSpan={3}>Amplitudes típicas 10–100 µV (Tabla 12.1).</td></tr>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">😴</span> Vigilia y sueño</div>
        <div className="card-body">
          <p>Al dormir, las ondas rápidas dejan paso a las lentas: de beta/alfa (despierto) a theta y delta (sueño profundo). El EEG refleja la actividad de ~10¹¹ neuronas, filtrada por el cráneo hasta 10–100 µV en la piel.</p>
          <div className="eq-block">{"\\[ \\text{despierto: } \\beta,\\alpha \\quad \\to \\quad \\text{sueño profundo: } \\delta \\]"}</div>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-19">Elige el estado: mira la frecuencia y amplitud cambiar. ▶ anima la traza para que se «lea» el ritmo. La amplitud en µV es la escala del EEG.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-eg" className="sim" />
        <div className="prof-controls">
          <span className="badge">EEG</span>
          <button id="eg_play" onClick={toggleEEG}>▶</button>
          <label>Estado <select id="eg_sel" onChange={(e) => engine.setParam('eg_sel' as any, parseInt(e.target.value, 10))}><option value="0">Alfa · relajado</option><option value="1">Beta · alerta</option><option value="2">Theta · niño/estrés</option><option value="3">Delta · sueño profundo</option></select></label>
          <span className="readout" id="eg_out">Alfa · 8–13 Hz · 10–100 µV</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
