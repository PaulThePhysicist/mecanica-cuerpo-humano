import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide11({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="11" data-module="5">
      <div className="module-header">
        <span className="mnum">5.6</span>
        <span className="mtitle">La curva de fuerza-velocidad de Hill</span>
        <span className="msub">Menos carga, más rápido — una hipérbola</span>
        <span className="mslide-count">11 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📉</span> La relación hiperbólica
            </div>
            <div className="card-body">
              <p>
                La velocidad de contracción {"\\(v=-dL/dt=|dL/dt|\\)"} se mide con el músculo fijo y una{' '}
                <strong>carga isotónica</strong> colgada. La tensión máxima y la velocidad siguen la curva de Hill:
              </p>
              <div className="eq-block">
                {"\\[ (T+a)(v+b)=(T_{\\text{max}}+a)\\,b \\qquad\\text{(5.20)} \\]"}
              </div>
              <div className="eq-block">
                {"\\[ T(v)=\\frac{b\\,T_{\\text{max}}-a\\,v}{v+b} \\qquad\\text{(5.21)} \\]"}
              </div>
              <p>
                Válida de {"\\(v=0\\)"} a {"\\(v_{\\text{max}}\\)"}; con {"\\(v_{\\text{max}}=(b/a)\\,T_{\\text{max}}\\)"}
                , solo hay <span className="tag">3 parámetros independientes</span>. Tiempo de respuesta efectivo de un
                músculo de longitud {"\\(L\\)"}: {"\\(L/v_{\\text{max}}\\)"}.
              </p>
              <p className="highlight" style={{ marginTop: '0.2rem' }}>
                A. V. Hill compartió el Premio Nobel de Fisiología o Medicina 1922 por la producción de calor en el
                músculo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📐</span> Forma adimensional
            </div>
            <div className="card-body">
              <div className="eq-block">
                {"\\[ v'=\\frac{1-T'}{1+T'/k}, \\qquad k=\\frac{a}{T_{\\text{max}}}=\\frac{b}{v_{\\text{max}}} \\]"}
              </div>
              <p>
                Típicamente <span className="tag">0,15 &lt; k &lt; 0,25</span>. Tabla 5.9 (músculos sin piel, 15 °C):
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Músculo</th>
                    <th>T_max (MPa)</th>
                    <th>v_max (FL/s)</th>
                    <th>a/T_max</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sóleo humano</td>
                    <td>0,145</td>
                    <td>0,52</td>
                    <td>0,037</td>
                  </tr>
                  <tr>
                    <td>Gastrocnemio humano</td>
                    <td>0,136</td>
                    <td>0,64</td>
                    <td>0,034</td>
                  </tr>
                  <tr>
                    <td>Psoas de conejo (20 °C)</td>
                    <td>0,246</td>
                    <td>3,26</td>
                    <td>0,10</td>
                  </tr>
                  <tr>
                    <td>Sóleo de rata (20 °C)</td>
                    <td>0,234</td>
                    <td>1,94</td>
                    <td>0,05</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🛑</span> Contracción excéntrica
            </div>
            <div className="card-body">
              <p>
                A la izquierda de {"\\(v=0\\)"} hay <strong>alargamiento muscular</strong> (frenado): la tensión
                desarrollada es ≈ <span className="tag">1,8 T_max</span>. Se usa para <strong>frenar</strong>, no para
                trabajo positivo.
              </p>
              <p>
                Se pierden <span className="tag">100 J</span> en cada paso al correr;{' '}
                <span className="highlight">casi la mitad la absorben los músculos de las piernas frenando</span>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-11">
              La curva de Hill es la «cédula» del elemento contráctil: un solo parámetro k traza toda la hipérbola. La rama
              excéntrica (v &lt; 0) es clave en la vida real — subir y bajar escaleras usan ramas opuestas de la misma
              curva.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-hill" />
            <div className="prof-controls">
              <span className="badge">T′(v′)</span>
              <label>
                k = a/T_max{' '}
                <input
                  type="range"
                  id="hl_k"
                  min="0.05"
                  max="0.45"
                  step="0.01"
                  defaultValue={params.hl_k}
                  onChange={(e) => {
                    engine.setParam('hl_k', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="hl_out">
                k = 0,20
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
