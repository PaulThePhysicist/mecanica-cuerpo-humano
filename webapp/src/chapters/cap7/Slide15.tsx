import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide15({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="15" data-module="6">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">Arrastre: Stokes e hidrodinámico</span>
        <span className="msub">Dos leyes, un número que las separa</span>
        <span className="mslide-count">15 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🫧</span> La ley de Stokes
            </div>
            <div className="card-body">
              <p>
                A <span className="tag">Re &lt; 100</span> domina la fricción viscosa. Una esfera de radio {"\\(R\\)"} a
                velocidad {"\\(u\\)"} en un fluido de viscosidad {"\\(\\eta\\)"}:
              </p>
              <div className="eq-block">
                {"\\[ F = 6\\pi R \\eta u \\qquad \\text{(eq. 7.58)} \\]"}
              </div>
              <p>
                Lineal en {"\\(u\\)"} y {"\\(R\\)"}: es el régimen de las células, las partículas en la sangre (Re ≈ 0,004) y
                la sedimentación.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌬️</span> Arrastre hidrodinámico
            </div>
            <div className="card-body">
              <p>
                A <span className="tag">Re &gt; 100</span> domina la inercia del fluido. La fuerza crece con el área frontal
                y con {"\\(u^2\\)"} (eq. 7.59):
              </p>
              <div className="eq-block">
                {"\\[ F = \\frac{1}{2} C_D A \\rho u^2 \\]"}
              </div>
              <p>
                {"\\(C_D\\)"} ≈ <span className="tag">1,0</span> para cilindros y <span className="tag">0,5</span> para
                esferas. Tres contribuciones: presión frontal, remolinos de estela y fricción superficial.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔢</span> El criterio y la potencia
            </div>
            <div className="card-body">
              <p>El número de Reynolds decide cuál de las dos leyes usar. La potencia para vencer el arrastre (eq. 7.62):</p>
              <div className="eq-block">{"\\[ P = F \\cdot u \\]"}</div>
              <p>
                Por eso el viento aumenta tanto el gasto metabólico al correr (Tabla 6.25):{" "}
                {"\\(F \\propto u^2\\)"} y {"\\(P \\propto u^3\\)"}.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-15">
              Stokes (lineal) e hidrodinámico (cuadrático) son dos mundos separados por Re = 100. Una célula cae según
              Stokes; un nadador, según el arrastre hidrodinámico (problema 7.40). En el canvas cambia el radio de la esfera:
              Re decide qué ley dibuja la flecha de fuerza.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-drag" />
            <div className="prof-controls">
              <span className="badge">arrastre</span>
              <label>
                R{' '}
                <input
                  type="range"
                  id="dr_r"
                  min="0.001"
                  max="10"
                  step="0.001"
                  defaultValue={params.dr_r}
                  onInput={(e) => {
                    engine.setParam('dr_r', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="dr_rv">0,01</span>
              </label>
              <label>
                u{' '}
                <input
                  type="range"
                  id="dr_u"
                  min="1"
                  max="200"
                  step="1"
                  defaultValue={params.dr_u}
                  onInput={(e) => {
                    engine.setParam('dr_u', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="dr_uv">50 cm/s</span>
              </label>
              <span className="readout" id="dr_out">
                Re = 133 · hidrodinámico
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
