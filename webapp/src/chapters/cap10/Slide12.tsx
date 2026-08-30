import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide12({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="12" data-module="5">
      <div className="module-header">
        <span className="mnum">10 · 5</span>
        <span className="mtitle">El campo auditivo</span>
        <span className="msub">{"\\(20\\ \\mathrm{Hz} - 20\\ \\mathrm{kHz}\\ \\cdot\\ 0\\ \\mathrm{dB} - 130\\ \\mathrm{dB}\\)"}</span>
        <span className="mslide-count">12 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">👂</span> Los límites del oído
            </div>
            <div className="card-body">
              <p>
                El <strong>campo auditivo</strong> es la región entre el umbral de audición (abajo) y el de dolor (arriba),
                sobre 20 Hz–20 kHz. El oído es más sensible entre 2–4 kHz: la banda de los formantes y del habla.
              </p>
              <div className="eq-block">
                {"\\[ \\text{frecuencia: } 20\\text{–}20\\,000\\ \\mathrm{Hz} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📉</span> Curvas de igual sonoridad
            </div>
            <div className="card-body">
              <p>
                A baja frecuencia hace falta mucha más intensidad para percibir igual: el oído «sube los graves». Las
                curvas fónicas conectan los tonos que suenan igual de fuertes, ancladas a 1 kHz.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Frecuencia</th>
                    <th>Umbral (dB)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>100 Hz</td>
                    <td>≈ 35</td>
                  </tr>
                  <tr>
                    <td>1 kHz</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>3,4 kHz</td>
                    <td>≈ −3 (máx. sens.)</td>
                  </tr>
                  <tr>
                    <td>10 kHz</td>
                    <td>≈ 10</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-12">
              Recorre el rango de frecuencias: el punto del tono sube y baja contra la curva del umbral. El «fondo» del
              campo auditivo no es plano: tiene forma de U con el mínimo cerca de 3 kHz.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-audfield" className="sim" />
            <div className="prof-controls">
              <span className="badge">campo</span>
              <label>
                Tono{' '}
                <input
                  type="range"
                  id="af_f"
                  min="20"
                  max="20000"
                  defaultValue={params.af_f}
                  step="10"
                  onChange={(e) => {
                    engine.setParam('af_f', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="af_fv">1000 Hz</span>
              </label>
              <span className="readout" id="af_out">
                1000 Hz · umbral 0 dB · audible
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
