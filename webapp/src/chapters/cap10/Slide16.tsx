import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide16({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="16" data-module="6">
      <div className="module-header">
        <span className="mnum">10 · 5</span>
        <span className="mtitle">Presbiacusia y daño por ruido</span>
        <span className="msub">{"\\(85\\text{–}90\\ \\mathrm{dB/8\\,h}\\) límite laboral · \\(190\\ \\mathrm{dB}\\) ruptura"}</span>
        <span className="mslide-count">16 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">👵</span> La edad cobra peaje en los agudos
            </div>
            <div className="card-body">
              <p>
                La <strong>presbiacusia</strong> (pérdida por edad) empieza en las frecuencias altas y se extiende
                lentamente. La «notch» típica de 3–6 kHz del trauma por ruido es la firma del daño coclear por
                sobreestimulación.
              </p>
              <div className="eq-block">
                {"\\[ \\text{umbral (dB HL)} \\uparrow \\text{con la edad en } 3\\text{–}8\\ \\mathrm{kHz} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⏱️</span> Regla práctica de la dosis de ruido
            </div>
            <div className="card-body">
              <p>
                Por cada +3 dB el tiempo seguro se divide a la mitad (intercambio de 3 dB): 85 dB → 8 h, 88 dB → 4 h,
                91 dB → 2 h… El umbral de dolor está en 120–140 dB y la ruptura del tímpano en ~190 dB.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Tiempo seguro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>85 dB</td>
                    <td>8 h</td>
                  </tr>
                  <tr>
                    <td>91 dB</td>
                    <td>2 h</td>
                  </tr>
                  <tr>
                    <td>97 dB</td>
                    <td>30 min</td>
                  </tr>
                  <tr>
                    <td>103 dB</td>
                    <td>7,5 min</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-16">
              Sube la edad del control: la curva de umbral se eleva primero en agudos. Un joven de 20 años oye 16 kHz; a
              los 60, ese tono quedó fuera del campo auditivo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-damage" className="sim" />
            <div className="prof-controls">
              <span className="badge">edad</span>
              <label>
                Edad{' '}
                <input
                  type="range"
                  id="pr_age"
                  min="20"
                  max="80"
                  defaultValue={params.pr_age}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('pr_age', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="pr_agev">30 años</span>
              </label>
              <span className="readout" id="pr_out">
                30 años · 16 kHz: aún audible
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
