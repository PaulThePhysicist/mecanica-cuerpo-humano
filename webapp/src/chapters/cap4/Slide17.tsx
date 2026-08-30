import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide17({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="17" data-module="7">
      <div className="module-header">
        <span className="mnum">4.7</span>
        <span className="mtitle">Fracturas por estrés</span>
        <span className="msub">Fatiga: grietas que crecen con cada zancada</span>
        <span className="mslide-count">17 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦴</span> Microdeformación segura… hasta que se repite
            </div>
            <div className="card-body">
              <p>
                La microdeformación <strong>funcional</strong> del hueso es de 2.000–3.000 με (frente a ~10.000 με en el
                UCS). Segura una vez; pero repetida miles de veces por semana crea <strong>grietas de fatiga</strong>. Los
                caballos de carrera llegan a 5.000–6.000 με por zancada — al borde.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔍</span> Concentración de esfuerzo
            </div>
            <div className="card-body">
              <p>
                Una grieta de longitud {"\\(a\\)"} amplifica el esfuerzo local:
              </p>
              <div className="eq-block">
                {"\\[ K=C\\,s\\sqrt{\\pi a} \\]"}
              </div>
              <p>
                Cuando {"\\(K\\)"} alcanza la <strong>tenacidad a la fractura</strong> {"\\(K_c\\)"} (hueso:{' '}
                <span className="tag">2,2–6,3 MPa·m^½</span>, Tabla 4.7), la grieta se propaga. El tamaño crítico (4.95):
              </p>
              <div className="eq-block">
                {"\\[ a_c=\\frac{K_c^2}{\\pi s^2}\\qquad G=\\frac{\\pi a s^2}{Y},\\quad G=\\frac{K^2}{CY} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📏</span> El fémur está a salvo… casi
            </div>
            <div className="card-body">
              <p>
                Con la carga normal ({"\\(s=2{,}1\\ \\text{MPa}\\)"}) y {"\\(K_c=4\\ \\text{MPa·m}^\\frac12\\)"},{' '}
                {"\\(a_c\\approx\\dfrac{4^2}{\\pi(2{,}1)^2}\\approx 1\\ \\text{m}\\)"}. Una grieta de 1 m — el fémur
                entero. Pero con {"\\(s=50\\ \\text{MPa}\\)"} (impacto), {"\\(a_c\\approx2\\ \\text{mm}\\)"}:{' '}
                <span className="highlight">una grieta pequeña corre y fractura</span>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-17">
              Mueve la longitud de grieta y la tensión: el punto rojo (K) salta sobre la línea límite (K_c) cuando la
              grieta se vuelve crítica. Por eso descansar cura las fracturas por estrés: el hueso rellena las
              microgrietas antes de que alcancen a_c.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-crack" className="sim" />
            <div className="prof-controls">
              <span className="badge">K = s√(πa)</span>
              <label>
                a{' '}
                <input
                  type="range"
                  id="cr_a"
                  min="0.1"
                  max="6"
                  step="0.05"
                  defaultValue={params.cr_a}
                  onChange={(e) => {
                    engine.setParam('cr_a', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                s{' '}
                <input
                  type="range"
                  id="cr_s"
                  min="2"
                  max="60"
                  step="1"
                  defaultValue={params.cr_s}
                  onChange={(e) => {
                    engine.setParam('cr_s', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="cr_out">
                K = 1,1 MPa·m½
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
