import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide15({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="15" data-module="6">
      <div className="module-header">
        <span className="mnum">6.5</span>
        <span className="mtitle">Potencia máxima y duración</span>
        <span className="msub">Menos duración, más potencia: el costo de lo anaeróbico</span>
        <span className="mslide-count">15 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚡</span> Potencia vs duración · Tabla 6.35
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Potencia</th>
                    <th>Duración</th>
                    <th>Energía total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2 hp · 1500 W</td>
                    <td>6 s</td>
                    <td>9,0 kJ · 2,2 kcal</td>
                  </tr>
                  <tr>
                    <td>1 hp · 750 W</td>
                    <td>1 min</td>
                    <td>45 kJ · 10,8 kcal</td>
                  </tr>
                  <tr>
                    <td>0,35 hp · 260 W</td>
                    <td>35 min</td>
                    <td>546 kJ · 130 kcal</td>
                  </tr>
                  <tr>
                    <td>0,2 hp · 150 W</td>
                    <td>5 h</td>
                    <td>2700 kJ · 645 kcal</td>
                  </tr>
                  <tr>
                    <td>0,1 hp · 75 W</td>
                    <td>Jornada 8 h</td>
                    <td>2160 kJ · 516 kcal</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Los <strong>procesos anaeróbicos</strong> permiten potencias altas por poco tiempo; a largo plazo manda el aeróbico.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏁</span> Récords mundiales · Tabla 6.34
            </div>
            <div className="card-body">
              <p>
                La velocidad media de carrera cae con la distancia por las <strong>limitaciones de captación de O₂</strong>: 100 m{' '}
                <span className="tag">10,44 m/s</span>, 400 m <span className="tag">9,26</span>, 1500 m <span className="tag">7,28</span>,
                10 km <span className="tag">6,34</span>, maratón <span className="tag">5,72</span>, 100 km <span className="tag">4,46</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎂</span> La edad
            </div>
            <div className="card-body">
              <p>
                El rendimiento máximo se sostiene hasta ≈ <span className="tag">35 años</span> y luego decae (Figs. 6.11–6.12). Los
                tiempos ganadores de Atenas 1896 los alcanzan hoy corredores de ≈ 60 años.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-15">
              Muestra el trade-off: <strong>2 hp durante 6 s vs 0,1 hp durante una jornada</strong>. La energía total (el área bajo
              la curva) es comparable, pero la potencia pico exige el combustible anaeróbico que no puede sostenerse. La escala
              logarítmica del canvas lo deja claro.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-power" className="sim" />
            <div className="prof-controls">
              <span className="badge">potencia</span>
              <label>
                duración{' '}
                <input
                  type="range"
                  id="pw_d"
                  min="1"
                  max="60"
                  step="1"
                  defaultValue={params.pw_d}
                  onChange={(e) => {
                    engine.setParam('pw_d', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="pw_dv">{params.pw_d} s</span>
              </label>
              <span className="readout" id="pw_out">
                ≈ 12 s · P ≈ 690 W
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
