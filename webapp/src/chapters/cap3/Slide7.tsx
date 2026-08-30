import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide7({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [playing, setPlaying] = useState(flags.pogoPlaying);

  const togglePogo = () => {
    const next = !playing;
    setPlaying(next);
    engine.setFlag('pogoPlaying', next);
  };

  return (
    <div className="slide active" data-slide="7" data-module="3">
      <div className="module-header">
        <span className="mnum">3.6</span>
        <span className="mtitle">El cuerpo como pogo stick</span>
        <span className="msub">Energía elástica: tendón de Aquiles y arco del pie</span>
        <span className="mslide-count">7 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🤸</span> Guardar y devolver la energía
            </div>
            <div className="card-body">
              <p>
                {"Durante el apoyo de la carrera, la energía cinética y potencial se convierte en <strong>energía elástica</strong> (\\(E_e = \\tfrac{1}{2} kx^2\\)) de tendones y arcos, y se devuelve al despegar — como un pogo stick:"}
              </p>
              <div className="eq-block">
                {"\\[ E_{\\text{correr}} = KE + PE + E_{\\text{elástica}} \\]"}
              </div>
              <p>
                En cada paso se pierden ≈ <span className="tag">100 J</span> de energía metabólica; buena parte vuelve.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦵</span> Los números elásticos
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Reservorio</th>
                    <th>Energía</th>
                    <th>Recuperable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tendón de Aquiles</td>
                    <td>≈ 35 J</td>
                    <td>93 %</td>
                  </tr>
                  <tr>
                    <td>Arco del pie</td>
                    <td>≈ 17 J</td>
                    <td>80 %</td>
                  </tr>
                  <tr>
                    <td>Pistas atléticas</td>
                    <td>≈ 12 J</td>
                    <td>→ +2 % rapidez</td>
                  </tr>
                </tbody>
              </table>
              <p>Las pistas modernas devuelven energía al corredor: un ahorro medible en la marca.</p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-7">
              El modelo pogo resume la carrera: la pierna es un resorte. En el canvas ve cómo KE→elástica→KE en cada rebote
              y cuánto se recupera según el coeficiente de rebote del suelo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-pogo" className="sim" />
            <div className="prof-controls">
              <span className="badge">Pogo</span>
              <label>
                rigidez{' '}
                <input
                  type="range"
                  id="po_k"
                  min="5"
                  max="60"
                  defaultValue={params.po_k}
                  onChange={(e) => {
                    engine.setParam('po_k', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <button id="po_play" onClick={togglePogo}>
                {playing ? '⏸' : '▶'}
              </button>
              <span className="readout" id="po_out">
                EE 35 J · 93 %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
