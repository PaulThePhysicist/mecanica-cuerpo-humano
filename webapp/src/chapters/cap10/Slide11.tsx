import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide11({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="11" data-module="4">
      <div className="module-header">
        <span className="mnum">10 · 4</span>
        <span className="mtitle">Energética del habla</span>
        <span className="msub">{"\\(P_{acro} \\approx 10^{-2}\\ \\mathrm{W}\\ \\to\\ P_{son} \\approx 10^{-3}\\ \\mathrm{W}\\)"}</span>
        <span className="mslide-count">11 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚖️</span> ¿Cuánta energía tiene la voz?
            </div>
            <div className="card-body">
              <p>
                El flujo de aire pulmonar (~10⁻¹ L/s a ~5 cm H₂O) entrega ~10⁻² W de potencia aerodinámica; de esa
                potencia solo ~10⁻³ W sale como sonido. El resto se disipa en fricción y turbulencia.
              </p>
              <div className="eq-block">
                <span className="eqno">(10.52)</span>
                {"\\[ P_\\mathrm{acro} \\approx 10^{-2}\\ \\mathrm{W} \\qquad P_\\mathrm{son} \\approx 10^{-3}\\ \\mathrm{W} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📢</span> El grito no escala como el habla
            </div>
            <div className="card-body">
              <p>
                Gritar sube la potencia acústica hasta ~5×10⁻³ W (un salto de ~7 dB) y desplaza el tono hacia
                frecuencias más agudas, donde el oído es más sensible.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Vocalización</th>
                    <th>P (W)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Susurro</td>
                    <td>10⁻⁶</td>
                  </tr>
                  <tr>
                    <td>Habla</td>
                    <td>10⁻³</td>
                  </tr>
                  <tr>
                    <td>Grito</td>
                    <td>5×10⁻³</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-11">
              La barra logarítmica lo dice todo: la energía acústica del habla es una milésima de la aerodinámica. La
              voz es un subproducto barato de la respiración.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-energy" className="sim" />
            <div className="prof-controls">
              <span className="badge">energía</span>
              <label>
                Escenario{' '}
                <select
                  id="en_sel"
                  defaultValue={params.en_sel}
                  onChange={(e) => {
                    engine.setParam('en_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Habla normal</option>
                  <option value="1">Susurro</option>
                  <option value="2">Grito</option>
                  <option value="3">Canto lírico</option>
                </select>
              </label>
              <span className="readout" id="en_out">
                Habla: 10⁻² W aerod. → 10⁻³ W son.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
