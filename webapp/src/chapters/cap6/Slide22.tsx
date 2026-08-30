import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide22({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="22" data-module="8">
      <div className="module-header">
        <span className="mnum">6.7</span>
        <span className="mtitle">El modelo de flujo de calor en el cuerpo</span>
        <span className="msub">Núcleo → piel → ropa → aire</span>
        <span className="mslide-count">22 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧱</span> Regiones en serie · Fig. 6.26
            </div>
            <div className="card-body">
              <p>Cada región es una placa; entre dos regiones adyacentes (eq. 6.72):</p>
              <div className="eq-block">
                {"\\[ (T_1 - T_2) = -I_{12}\\,\\frac{1}{A}\\frac{dQ}{dt} \\qquad I_{12} = \\frac{1}{h_{x,12}} \\qquad \\text{(eqs. 6.72–6.73)} \\]"}
              </div>
              <p>
                El aislamiento del tejido varía de <span className="tag">0,03</span> (calor) a{' '}
                <span className="tag">0,10 m²-°C/W</span> (frío) en adultos; en bebés es la mitad.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧊</span> Las tres caídas de temperatura
            </div>
            <div className="card-body">
              <p>
                {"Núcleo→piel (aislamiento tisular \\(I_t\\), eq. 6.74); piel→ropa (\\(I_c\\), ropa o pelaje, eq. 6.75); ropa→aire (\\(I_a\\), el aire quieto, eq. 6.76). Cada caída vale "}
                {"\\(I \\times \\dot{Q}/A\\)." }
              </p>
              <p>
                La ropa humana aísla ≈ <span className="tag">0,25 °C-m²/W por cm</span> (Tabla 6.44).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌡️</span> Temperaturas internas · Tabla 6.45
            </div>
            <div className="card-body">
              <p>
                Piel <span className="tag">32–35 °C</span>, riñón 36,85, estómago/recto 37,0, cerebro y útero 37,3. Las del corazón
                y los pulmones coinciden en ≈ 0,1 °C. En hipotermia, el recto responde <strong>lento</strong> y puede «mentir» ~1 °C
                por encima del corazón.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-22">
              {"Cierre conceptual: los cuatro modos de pérdida (radiación, convección, conducción, evaporación) son "}
              <em>términos</em>{" de un mismo flujo \\(\\dot{Q}\\) que cae por tres aislantes en serie. Baja la temperatura ambiente en el canvas: el gradiente se hace empinado y la piel se enfría."}
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-core" className="sim" />
            <div className="prof-controls">
              <span className="badge">modelo en serie</span>
              <label>
                T aire{' '}
                <input
                  type="range"
                  id="co_t"
                  min="-10"
                  max="40"
                  step="1"
                  defaultValue={params.co_t}
                  onChange={(e) => {
                    engine.setParam('co_t', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="co_tv">{params.co_t} °C</span>
              </label>
              <label>
                ropa{' '}
                <input
                  type="range"
                  id="co_c"
                  min="0"
                  max="4"
                  step="0.1"
                  defaultValue={params.co_c}
                  onChange={(e) => {
                    engine.setParam('co_c', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="co_cv">{params.co_c} Clo</span>
              </label>
              <span className="readout" id="co_out">
                T_piel ≈ 32,9 °C · q ≈ 42 W/m²
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
