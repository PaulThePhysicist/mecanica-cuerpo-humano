import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide8({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="8" data-module="4">
      <div className="module-header">
        <span className="mnum">6.4</span>
        <span className="mtitle">La tasa metabólica basal (BMR)</span>
        <span className="msub">El «suelo» de gasto del cuerpo en reposo</span>
        <span className="mslide-count">8 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💤</span> Qué es y cuánto vale
            </div>
            <div className="card-body">
              <p>
                Persona de 70 kg: <span className="tag">BMR ≈ 1680 kcal/día</span> = <span className="tag">70 kcal/h</span> ={' '}
                <span className="tag">81 W</span> — «una bombilla de 100 W».
              </p>
              <p>
                Cinco condiciones para medirla: reposo absoluto, <strong>en ayunas</strong>, despierto, en{' '}
                <strong>termoneutralidad</strong> (≈ 28 °C, sin tiritar ni sudar) y en reposo físico y mental. La BMR cambia ≈{' '}
                <span className="tag">10–13 % por cada °C</span> de fiebre.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫀</span> ¿Quién gasta en reposo? · Tabla 6.17
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Órgano</th>
                    <th>% del gasto en reposo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Hígado · bazo</td>
                    <td>27 %</td>
                  </tr>
                  <tr>
                    <td>Cerebro</td>
                    <td>19 %</td>
                  </tr>
                  <tr>
                    <td>Músculo</td>
                    <td>18 %</td>
                  </tr>
                  <tr>
                    <td>Riñón</td>
                    <td>10 %</td>
                  </tr>
                  <tr>
                    <td>Corazón</td>
                    <td>7 %</td>
                  </tr>
                  <tr>
                    <td>Resto</td>
                    <td>19 %</td>
                  </tr>
                </tbody>
              </table>
              <p>El cerebro pesa el 2 % de la masa y gasta el 19 % de la energía en reposo.</p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-8">
              El músculo en reposo gasta poco (18 %) pero es la masa que «enciendes» al moverte; el cerebro es carísimo. El donut
              muestra el reparto del gasto basal — úsalo para explicar por qué el hígado es el mayor consumidor en reposo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-organs" className="sim" />
            <div className="prof-controls">
              <span className="badge">gasto basal</span>
              <button
                type="button"
                id="or_play"
                onClick={() => {
                  const nextPlaying = !flags.orPlaying;
                  engine.setFlag('orPlaying', nextPlaying);
                  if (nextPlaying) flags.orT = 0;
                  engine.requestDraw();
                }}
              >
                {flags.orPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="or_out">
                hígado · bazo 27 %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
