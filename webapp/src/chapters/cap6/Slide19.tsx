import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide19({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="19" data-module="7">
      <div className="module-header">
        <span className="mnum">6.6</span>
        <span className="mtitle">Convección, conducción y la ropa</span>
        <span className="msub">El viento, el Clo y el intercambio a contracorriente</span>
        <span className="mslide-count">19 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💨</span> Convección y sensación térmica
            </div>
            <div className="card-body">
              <p>
                {"En aire quieto y ropa normal, "}<span className="tag">{"\\(h_c \\approx 2{,}3\\text{ kcal/m²-h-°C}\\)"}</span>
                {" (menor que \\(h_r\\)). Desnudo: "}<span className="tag">{"\\(h_c = 8{,}3\\sqrt{w}\\)"}</span>
                {" W/m²-°C con \\(w\\) en m/s (eq. 6.62). El viento aumenta \\(h_c\\): de ahí el "}
                <strong>wind chill</strong> (eq. 6.64), la temperatura «que se siente».
              </p>
              <div className="eq-block">
                {"\\[ T_{\\text{wc}} = 13{,}12 + 0{,}6215\\,T - 11{,}37\\,w^{0{,}16} + 0{,}3965\\,T\\,w^{0{,}16} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧥</span> Aislamiento y Clo · Tabla 6.44
            </div>
            <div className="card-body">
              <p>
                {"El "}<strong>aislamiento</strong>{" \\(I = 1/h_t = d/K\\). "}<span className="tag">1 Clo</span> = 0,155 m²-°C/W (traje
                normal). Desnudo = 0 Clo; trabajo ligero ≈ 0,6; traje polar ≈ 3–4. La ropa humana aísla ≈{' '}
                <span className="tag">0,25 °C-m²/W por cm</span>.
              </p>
              <p>
                Conducción por el brazo en agua a 4 °C (2 min): ≈ <span className="tag">118 W → 3,4 kcal</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫀</span> Intercambio a contracorriente
            </div>
            <div className="card-body">
              <p>
                En las extremidades, arterias y venas cercanas intercambian calor: la sangre venosa (fría) recibe calor de la arterial
                (caliente) <strong>antes</strong> de llegar a la piel → se pierde menos. Con frío se usan venas profundas (ahorrar); con
                calor, superficiales (disipar). Esto da manos frías en invierno y protege los testículos.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-19">
              Dos controles del cuerpo sobre la convección: la ropa (la «capa» que decides) y el flujo sanguíneo superficial
              (vasodilatación/constricción). En el canvas combina viento y Clo para ver quién gana la batalla térmica.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-conv" className="sim" />
            <div className="prof-controls">
              <span className="badge">convección</span>
              <label>
                viento{' '}
                <input
                  type="range"
                  id="cv_w"
                  min="0"
                  max="10"
                  step="0.5"
                  defaultValue={params.cv_w}
                  onChange={(e) => {
                    engine.setParam('cv_w', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="cv_wv">{params.cv_w} m/s</span>
              </label>
              <label>
                ropa{' '}
                <input
                  type="range"
                  id="cv_c"
                  min="0"
                  max="4"
                  step="0.1"
                  defaultValue={params.cv_c}
                  onChange={(e) => {
                    engine.setParam('cv_c', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="cv_cv">{params.cv_c} Clo</span>
              </label>
              <span className="readout" id="cv_out">
                h_c ≈ 11,7 W/m²-°C
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
