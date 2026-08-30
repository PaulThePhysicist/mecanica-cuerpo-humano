import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide14({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="14" data-module="6">
      <div className="module-header">
        <span className="mnum">6.5</span>
        <span className="mtitle">Trabajo mecánico y eficiencia</span>
        <span className="msub">Trabajo interno, externo, positivo y negativo</span>
        <span className="mslide-count">14 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏋️</span> Trabajo externo e interno
            </div>
            <div className="card-body">
              <p>
                Levantar un objeto es <strong>trabajo externo</strong>; elevar el centro de masa del propio cuerpo alrededor de
                las articulaciones es <strong>trabajo interno</strong> (Fig. 6.10).
              </p>
              <p>
                Las contracciones <strong>concéntricas</strong> hacen trabajo (mecánico) positivo; las <strong>excéntricas</strong>,
                trabajo negativo. Caminar en llano exige cantidades iguales de ambos; subir, más positivo; bajar, más negativo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎯</span> Tres eficiencias (¡cuidado con la definición!)
            </div>
            <div className="card-body">
              <p>
                <strong>Metabólica/muscular:</strong> trabajo mecánico total ÷ trabajo metabólico.{' '}
                <strong>Mecánica:</strong> trabajo total (interno + externo) ÷ costo metabólico por encima del reposo.{' '}
                <strong>Del trabajo:</strong> trabajo externo ÷ costo metabólico extra. Para nosotros, simplemente:
              </p>
              <div className="eq-block">
                {"\\[ \\varepsilon = \\frac{\\text{trabajo mecánico}}{\\text{tasa metabólica}} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📉</span> La eficiencia es baja · Tablas 6.32–6.33
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>Eficiencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ciclismo (nivelado)</td>
                    <td>19 % · 24–34 %</td>
                  </tr>
                  <tr>
                    <td>Vagoneteo</td>
                    <td>17 %</td>
                  </tr>
                  <tr>
                    <td>Patinaje sobre hielo</td>
                    <td>11 %</td>
                  </tr>
                  <tr>
                    <td>Máquina escaladora</td>
                    <td>23 %</td>
                  </tr>
                  <tr>
                    <td>Natación libre</td>
                    <td>2,9–7,4 %</td>
                  </tr>
                  <tr>
                    <td>Caminar horizontal</td>
                    <td>20–35 %</td>
                  </tr>
                  <tr>
                    <td>Palear arena</td>
                    <td>3 %</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Referencias: máquina de vapor <span className="tag">17 %</span>, motor de gasolina <span className="tag">38 %</span>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-14">
              «¿A dónde va el resto?» → <strong>a calor</strong>: del 80 al 100 % del metabolismo termina como calor. Por eso un
              trabajador físico de ~500 kcal de trabajo al día necesita dietas de +2500 kcal. El canvas muestra la fracción que se
              vuelve calor.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-eff" className="sim" />
            <div className="prof-controls">
              <span className="badge">eficiencia</span>
              <button
                type="button"
                id="ef_play"
                onClick={() => {
                  const nextPlaying = !flags.efPlaying;
                  engine.setFlag('efPlaying', nextPlaying);
                  if (nextPlaying) flags.efT = 0;
                  engine.requestDraw();
                }}
              >
                {flags.efPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="ef_out">
                ciclismo 19 % · 81 % → calor
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
