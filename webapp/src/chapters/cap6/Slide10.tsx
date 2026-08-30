import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide10({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="10" data-module="5">
      <div className="module-header">
        <span className="mnum">6.4</span>
        <span className="mtitle">Tasas metabólicas durante actividades</span>
        <span className="msub">Tabla 6.21: de dormir a correr</span>
        <span className="mslide-count">10 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🗒️</span> Actividad vs tasa metabólica · Tabla 6.21
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>kcal/h</th>
                    <th>W</th>
                    <th>O₂ (L/min)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Durmiendo</td>
                    <td>71</td>
                    <td>83</td>
                    <td>0,24</td>
                  </tr>
                  <tr>
                    <td>Sentado</td>
                    <td>103</td>
                    <td>120</td>
                    <td>0,34</td>
                  </tr>
                  <tr>
                    <td>De pie</td>
                    <td>108</td>
                    <td>125</td>
                    <td>0,36</td>
                  </tr>
                  <tr>
                    <td>Caminar 5 km/h</td>
                    <td>228</td>
                    <td>265</td>
                    <td>0,76</td>
                  </tr>
                  <tr>
                    <td>Ciclismo 15 km/h</td>
                    <td>344</td>
                    <td>400</td>
                    <td>1,13</td>
                  </tr>
                  <tr>
                    <td>Natación moderada</td>
                    <td>400</td>
                    <td>465</td>
                    <td>1,32</td>
                  </tr>
                  <tr>
                    <td>Fútbol</td>
                    <td>500</td>
                    <td>580</td>
                    <td>1,65</td>
                  </tr>
                  <tr>
                    <td>Subir escaleras</td>
                    <td>589</td>
                    <td>685</td>
                    <td>1,96</td>
                  </tr>
                  <tr>
                    <td>Baloncesto</td>
                    <td>688</td>
                    <td>800</td>
                    <td>2,28</td>
                  </tr>
                  <tr>
                    <td>Ciclista de carreras</td>
                    <td>1400</td>
                    <td>1600</td>
                    <td>4,62</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫁</span> Calorimetría y VO₂ máx
            </div>
            <div className="card-body">
              <p>
                La tasa metabólica se mide por <strong>calorimetría directa</strong> (calor liberado) o <strong>indirecta</strong>{' '}
                (consumo de O₂ y producción de CO₂, con el RER para elegir el equivalente calórico).
              </p>
              <p>
                Estudiantes: <span className="tag">44–50</span> (M) y <span className="tag">38–42</span> (F) mL/kg-min; atletas de élite{' '}
                <span className="tag">70–80</span>. El VO₂ máx limita todo lo aeróbico.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-10">
              La tabla 6.21 es de las más útiles del capítulo: es la base para calcular cuánto cuesta cada actividad en kcal. El canvas
              la convierte en barras: el rango va de 71 kcal/h durmiendo a 1400 en un ciclista profesional — 20 veces más.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-act" className="sim" />
            <div className="prof-controls">
              <span className="badge">actividad</span>
              <label>
                actividad{' '}
                <select
                  id="ac_act"
                  defaultValue={params.ac_act}
                  onChange={(e) => {
                    engine.setParam('ac_act', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Durmiendo · 71</option>
                  <option value="1">Sentado · 103</option>
                  <option value="2">De pie · 108</option>
                  <option value="3">Caminar 5 km/h · 228</option>
                  <option value="4">Ciclismo 15 km/h · 344</option>
                  <option value="5">Natación moderada · 400</option>
                  <option value="6">Fútbol · 500</option>
                  <option value="7">Subir escaleras · 589</option>
                  <option value="8">Baloncesto · 688</option>
                  <option value="9">Ciclista carreras · 1400</option>
                </select>
              </label>
              <span className="readout" id="ac_out">
                103 kcal/h · 120 W · 0,34 L O₂/min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
