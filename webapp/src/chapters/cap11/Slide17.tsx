import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide17({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="17" data-module="7">
      <div className="module-header">
        <span className="mnum">11 · 5</span>
        <span className="mtitle">Percepción del brillo y fotometría</span>
        <span className="msub">{"\\(P = K(S-S_0)^{n},\\quad n \\approx 0{,}33\\text{–}0{,}5\\)"}</span>
        <span className="mslide-count">17 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔆</span> El brillo no es lineal: ley de Stevens
            </div>
            <div className="card-body">
              <p>
                {"La sensación de brillo \\(P\\) crece con la intensidad \\(S\\) según una potencia sublineal (n < 1):"}
              </p>
              <div className="eq-block">
                <span className="eqno">(11.74)</span>
                {"\\[ P = K\\,(S-S_0)^{n},\\qquad n \\approx 0{,}33\\text{–}0{,}5 \\]"}
              </div>
              <p>
                Un foco 10× más intenso no «se ve» 10× más brillante: el ojo comprime el mundo luminoso (compresión que
                comparten oído y tacto).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🕯️</span> Fotópica vs escotópica (Tabla 11.4)
            </div>
            <div className="card-body">
              <p>
                La curva de sensibilidad cambia con la luz: de día (fotópica, conos) pico en{' '}
                <span className="tag">555 nm · 683 lm/W</span>; de noche (escotópica, bastones) en{' '}
                <span className="tag">507 nm · 1 700 lm/W</span>. El <strong>desplazamiento de Purkinje</strong>: los
                azules se vuelven «más brillantes» al oscurecer.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Unidad</th>
                    <th>Definición</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>lumen (lm)</td>
                    <td>flujo luminoso</td>
                  </tr>
                  <tr>
                    <td>candela (cd)</td>
                    <td>lm / sr (intensidad)</td>
                  </tr>
                  <tr>
                    <td>nit (cd/m²)</td>
                    <td>luminancia</td>
                  </tr>
                  <tr>
                    <td>lux (lm/m²)</td>
                    <td>iluminancia</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-17">
              Sube la intensidad: la curva de Stevens se aplana (×10 de luz cuadruplica el brillo, 10^0,4 ≈ 2,5). Compara
              las dos campanas de sensibilidad: el pico se corre 48 nm al pasar de día a noche.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-bright" className="sim" />
            <div className="prof-controls">
              <span className="badge">brillo</span>
              <label>
                I relativa{' '}
                <input
                  type="range"
                  id="br_I"
                  min="1"
                  max="1000"
                  defaultValue={params.br_I}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('br_I', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="br_Iv">100×</span>
              </label>
              <span className="readout" id="br_out">
                I ×100 → brillo ×6,3 (n = 0,4)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
