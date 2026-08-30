import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';
import { BRUCE_STAGES } from './sims';

export default function Slide12({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const currentStageName = BRUCE_STAGES[Math.min(4, Math.max(0, Math.round(params.br_s) - 1))].n;

  return (
    <div className="slide active" data-slide="12" data-module="5">
      <div className="module-header">
        <span className="mnum">6.4</span>
        <span className="mtitle">Protocolo de Bruce y el efecto del viento</span>
        <span className="msub">La prueba de esfuerzo en caminadora</span>
        <span className="mslide-count">12 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦶</span> El protocolo de Bruce · Tabla 6.24
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Etapa</th>
                    <th>V (mph)</th>
                    <th>Pendiente</th>
                    <th>Tiempo (min)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>I</td>
                    <td>1,7</td>
                    <td>10 %</td>
                    <td>1–3</td>
                  </tr>
                  <tr>
                    <td>II</td>
                    <td>2,5</td>
                    <td>12 %</td>
                    <td>4–6</td>
                  </tr>
                  <tr>
                    <td>III</td>
                    <td>3,4</td>
                    <td>14 %</td>
                    <td>7–9</td>
                  </tr>
                  <tr>
                    <td>IV</td>
                    <td>4,2</td>
                    <td>16 %</td>
                    <td>10–12</td>
                  </tr>
                  <tr>
                    <td>V</td>
                    <td>5,0</td>
                    <td>18 %</td>
                    <td>13–15</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Con ECG continuo; cada 3 min sube velocidad y pendiente hasta el agotamiento. Alternativa: protocolo de{' '}
                <strong>Naughton</strong> (velocidad fija, pendiente 2,5 % → 20 %).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧮</span> El cálculo de la etapa V
            </div>
            <div className="card-body">
              <p>
                Varón de 75 kg a 5 mph (2,23 m/s) y 18 %: la tasa es la suma de la BMR, el movimiento horizontal y la cuesta (factor
                2,7):
              </p>
              <div className="eq-block">
                {"\\[ \\text{TM} \\approx 100 + (2{,}4 + 22{,}8\\sin\\theta)\\,m_{\\text{b}} v \\approx 1570\\ \\text{kcal/h} \\]"}
              </div>
              <p>
                {"Solo carbohidratos: \\(1570/5{,}05 = 311\\) L/h = "}<span className="tag">5,2 L O₂/min</span>. La cuesta domina
                el gasto (1068 kcal/h de 1469).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">💨</span> El viento · Tabla 6.25
            </div>
            <div className="card-body">
              <p>
                {"Correr contra el viento exige más potencia, que crece "}
                <strong>{"como el cuadrado de la velocidad del viento"}</strong>{" (\\(w^2\\)). La resistencia del aire ≈ "}
                <span className="tag">8 %</span> de las necesidades de un corredor de media distancia y hasta{' '}
                <span className="tag">15 %</span> para un velocista.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-12">
              {"El ejemplo de la etapa V es un problema tipo: suma "}<strong>BMR + horizontal + cuesta</strong>
              {". El término de la cuesta (\\(22,8\\sin\\theta\\)) domina — de ahí que la pendiente sea la variable crítica de la prueba. El canvas calcula las 5 etapas."}
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-bruce" className="sim" />
            <div className="prof-controls">
              <span className="badge">Bruce</span>
              <label>
                etapa{' '}
                <input
                  type="range"
                  id="br_s"
                  min="1"
                  max="5"
                  step="1"
                  defaultValue={params.br_s}
                  onChange={(e) => {
                    engine.setParam('br_s', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="br_sv">{currentStageName}</span>
              </label>
              <span className="readout" id="br_out">
                Etapa III: TM ≈ 940 kcal/h
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
