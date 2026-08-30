import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide10({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="10" data-module="4">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">Viscosidad · Tabla 7.3</span>
        <span className="msub">La fricción interna del fluido</span>
        <span className="mslide-count">10 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧴</span> La ley de Newton de la viscosidad
            </div>
            <div className="card-body">
              <p>
                Para deslizar una placa sobre un fluido hay que vencer una fuerza proporcional al área y al gradiente de
                velocidad (eq. 7.22–7.23):
              </p>
              <div className="eq-block">
                {"\\[ F = \\eta \\frac{A v}{y} \\qquad \\text{·} \\qquad \\tau = \\eta \\frac{dv}{dy} \\]"}
              </div>
              <p>
                La <strong>viscosidad dinámica</strong> {"\\(\\eta\\)"} es la «fricción interna» del fluido. Unidades:{' '}
                <span className="tag">Pa·s</span>, <span className="tag">poise</span> (1 P = 0,1 Pa·s),{' '}
                <span className="tag">cP</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🩸</span> Viscosidades del cuerpo · Tabla 7.3
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Fluido</th>
                    <th>η (Pa·s)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Agua (0 °C)</td>
                    <td>1,78 × 10⁻³</td>
                  </tr>
                  <tr>
                    <td>Agua (20 °C)</td>
                    <td>1,00 × 10⁻³</td>
                  </tr>
                  <tr>
                    <td>Agua (37 °C)</td>
                    <td>0,69 × 10⁻³</td>
                  </tr>
                  <tr>
                    <td>Plasma (37 °C)</td>
                    <td>1,5 × 10⁻³</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Sangre entera (37 °C)</b>
                    </td>
                    <td>
                      <b>≈ 4,0 × 10⁻³</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Líquido sinovial</td>
                    <td>&gt; 0,3</td>
                  </tr>
                  <tr>
                    <td>Aire (20 °C)</td>
                    <td>1,8 × 10⁻⁵</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔴</span> La sangre no es newtoniana
            </div>
            <div className="card-body">
              <p>
                La sangre <strong>adelgaza al fluir</strong> (shear-thinning): a baja velocidad, los glóbulos rojos se
                aglomeran y {"\\(\\eta\\)"} sube; a alta velocidad se alinean y {"\\(\\eta\\)"} baja. A 45 % de hematocrito
                y baja cizalladura, <span className="tag">η ≈ 100 × 10⁻³ Pa·s</span>.
              </p>
              <p>
                Otros fluidos no newtonianos: <strong>dilatantes</strong> (endurecen al cizallarse) y los de{' '}
                <strong>Bingham</strong>, como la pasta de dientes, que no fluyen hasta superar un esfuerzo umbral.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-10">
              Tres décadas de orden de magnitud separan el aire (10⁻⁵) de la sangre (10⁻³) y del líquido sinovial (10⁻¹). El
              agua a 37 °C es menos viscosa que a 0 °C: fiebre y frío también «afinan» la sangre (problema 7.19). En el
              canvas, estira el fluido entre las placas: el perfil de velocidad es la ley de Newton.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-viscosity" />
            <div className="prof-controls">
              <span className="badge">viscosidad</span>
              <label>
                fluido{' '}
                <select
                  id="vs_fl"
                  defaultValue={params.vs_fl}
                  onChange={(e) => {
                    engine.setParam('vs_fl', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                >
                  <option value="0.000018">Aire · 1,8e-5</option>
                  <option value="0.001">Agua · 1,0e-3</option>
                  <option value="0.004">Sangre · 4,0e-3</option>
                  <option value="0.3">Sinovial · 0,3</option>
                </select>
              </label>
              <label>
                v{' '}
                <input
                  type="range"
                  id="vs_v"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={params.vs_v}
                  onInput={(e) => {
                    engine.setParam('vs_v', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="vs_vv">40</span>
              </label>
              <span className="readout" id="vs_out">
                τ = 0,20 Pa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
