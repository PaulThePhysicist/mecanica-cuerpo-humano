import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide15({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="15" data-module="7">
      <div className="module-header">
        <span className="mnum">4.7</span>
        <span className="mtitle">Modos de fractura y trabajo de fractura</span>
        <span className="msub">UTS &lt; UCS: el hueso falla primero en tracción</span>
        <span className="mslide-count">15 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💥</span> Tres modos de falla
            </div>
            <div className="card-body">
              <p>
                <strong>Tracción</strong> (UTS = 120 MPa): grieta transversal, el hueso se separa.{' '}
                <strong>Compresión</strong> (UCS = 170 MPa): fragmento en "mariposa" que se desprende a{' '}
                <span className="tag">45°</span>. <strong>Torsión</strong>: grieta <strong>en espiral</strong> a lo largo del
                eje. La flexión combina tracción en la cara convexa.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧩</span> Trabajo de fractura W_F
            </div>
            <div className="card-body">
              <table className="interactive-table" id="fr-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Y (GPa)</th>
                    <th>UBS (MPa)</th>
                    <th>W_F (J/m²)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <b>Fémur</b>
                    </td>
                    <td>13,5</td>
                    <td>247</td>
                    <td>1710</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Asta de cuerno</b>
                    </td>
                    <td>7,4</td>
                    <td>179</td>
                    <td>6190</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Bulla (hueso del oído)</b>
                    </td>
                    <td>31,3</td>
                    <td>33</td>
                    <td>200</td>
                  </tr>
                </tbody>
              </table>
              <div className="table-caption">
                {"Tabla 4.5. El hueso es ~100× más tenaz que el vidrio (1–10) y ~10× menos que la madera (~10⁴ J/m²)."}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🪂</span> La caída: energía de sobra
            </div>
            <div className="card-body">
              <p>
                Una caída libera {"\\(mgh \\approx 550\\ \\text{J}\\)"} de energía potencial. El fémur solo puede absorber
              </p>
              <div className="eq-block">
                {"\\[ \\frac{(\\text{UTS})^2}{2Y}V\\simeq69\\ \\text{J}\\qquad \\frac{(\\text{UBS})^2}{2Y}V\\simeq133\\ \\text{J} \\]"}
              </div>
              <p>El exceso debe disiparse en tejidos blandos, el suelo o la fractura.</p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-15">
              Cambia de modo en el canvas y mira la dirección de la grieta: tracción = transversal, compresión = 45°,
              torsión = espiral. La morfología de la fractura delata la carga que la causó — es "física forense".
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-fracture" className="sim" />
            <div className="prof-controls">
              <span className="badge">modo</span>
              <label>
                modo{' '}
                <select
                  id="fr_mode"
                  defaultValue={flags.fr_mode}
                  onChange={(e) => {
                    engine.setFlag('fr_mode', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="traccion">Tracción</option>
                  <option value="compresion">Compresión</option>
                  <option value="torsion">Torsión</option>
                </select>
              </label>
              <button
                type="button"
                id="fr_play"
                onClick={() => {
                  const next = !flags.frPlaying;
                  engine.setFlag('frPlaying', next);
                  if (next) engine.setFlag('frT', 0);
                  const b = document.getElementById('fr_play');
                  if (b) b.textContent = next ? '⏸' : '▶';
                }}
              >
                {flags.frPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="fr_out">
                UTS = 120 MPa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
