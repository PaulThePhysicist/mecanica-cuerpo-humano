import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide11({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  const toggleAccommodation = () => {
    const nextState = !flags.acPlaying;
    engine.setFlag('acPlaying', nextState);
    engine.setFlag('acT', 0);
    const b = document.getElementById('ac_play');
    if (b) b.textContent = nextState ? '⏸' : '▶';
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="11" data-module="4">
      <div className="module-header">
        <span className="mnum">11 · 3</span>
        <span className="mtitle">Acomodación y presbicia</span>
        <span className="msub">{"\\(\\mathrm{PR}\\to 58{,}8\\ \\mathrm{D}\\quad \\mathrm{PP}(25\\ \\mathrm{cm}) \\to 62{,}8\\ \\mathrm{D}\\)"}</span>
        <span className="mslide-count">11 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔄</span> Enfocar de lejos a cerca
            </div>
            <div className="card-body">
              <p>
                El ojo relajado enfoca el <strong>punto remoto</strong> PR (∞ → 58,8 D). Al <strong>acomodar</strong>, el
                cristalino se abomba y gana potencia para enfocar el <strong>punto próximo</strong> PP; a 25 cm necesita
                62,8 D. La <strong>acomodación</strong> necesaria es la diferencia:
              </p>
              <div className="eq-block">
                <span className="eqno">(11.64)</span>
                {"\\[ P_\\mathrm{PP} - P_\\mathrm{PR} = 62{,}8 - 58{,}8 = 4{,}0\\ \\mathrm{D} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">👵</span> La presbicia con la edad (Tabla 11.2)
            </div>
            <div className="card-body">
              <p>El cristalino pierde elasticidad y la acomodación máxima cae año a año:</p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Edad</th>
                    <th>Acomodación (D)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>8 años</td>
                    <td>13,8</td>
                  </tr>
                  <tr>
                    <td>25</td>
                    <td>9,9</td>
                  </tr>
                  <tr>
                    <td>35</td>
                    <td>7,3</td>
                  </tr>
                  <tr>
                    <td>40</td>
                    <td>5,8</td>
                  </tr>
                  <tr>
                    <td>45</td>
                    <td>3,6</td>
                  </tr>
                  <tr>
                    <td>50</td>
                    <td>1,9</td>
                  </tr>
                  <tr>
                    <td>55</td>
                    <td>1,3</td>
                  </tr>
                  <tr className="table-caption">
                    <td colSpan={2}>A 55 años faltan +2,7 D para leer a 25 cm → gafas de lectura.</td>
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
              ▶ anima el ciclo de acomodación: el cristalino se abomba al mirar de cerca y se aplana al mirar de lejos.
              Desliza la edad y verás cómo el punto próximo se aleja: a 45 años el libro ya no entra en foco.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-accom" className="sim" />
            <div className="prof-controls">
              <span className="badge">acomodación</span>
              <button id="ac_play" type="button" onClick={toggleAccommodation}>
                {flags.acPlaying ? '⏸' : '▶'}
              </button>
              <label>
                Edad{' '}
                <input
                  type="range"
                  id="ac_age"
                  min="8"
                  max="70"
                  defaultValue={params.ac_age}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('ac_age', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ac_agev">25 años</span>
              </label>
              <span className="readout" id="ac_out">
                25 años · acomodación 9,9 D · PP ≈ 10 cm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
