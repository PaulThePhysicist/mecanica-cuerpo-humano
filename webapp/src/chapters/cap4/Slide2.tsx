import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide2({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="2" data-module="1">
      <div className="module-header">
        <span className="mnum">4.1</span>
        <span className="mtitle">Composición y anisotropía del hueso</span>
        <span className="msub">El hueso es más rígido en la dirección en que lo cargas</span>
        <span className="mslide-count">2 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧪</span> Rigidez + tenacidad, en un solo material
            </div>
            <div className="card-body">
              <p>
                El mineral (hidroxiapatita) aporta <strong>rigidez</strong>; el colágeno aporta <strong>tenacidad</strong>{' '}
                (resistencia a la grieta). Demasiado mineral → hueso frágil; demasiado colágeno → hueso blando. El hueso
                maduro combina ≈ 60 % mineral y 40 % colágeno en peso (excluyendo el agua).
              </p>
              <div className="eq-block">
                {"\\[ \\text{hueso} = \\text{mineral}\\, (\\text{rígido}) + \\text{colágeno}\\, (\\text{tenaz}) \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">↕️</span> Anisotropía: la Tabla 4.3
            </div>
            <div className="card-body">
              <p>
                El hueso cortical no es isótropo: es <strong>más rígido a lo largo</strong> del eje de carga (la dirección en
                que camina el peso) que en la dirección transversal.
              </p>
              <div className="row">
                <span className="pill">Y longitudinal = 17,4 GPa</span>
                <span className="pill">Y transversal = 9,6 GPa</span>
                <span className="pill">Y flexión = 14,8 GPa</span>
                <span className="pill">G = 3,51 GPa</span>
                <span className="pill">υ = 0,39</span>
              </div>
              <p>
                Girar la dirección de la carga un 90° reduce el módulo un <span className="tag">45 %</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎯</span> La arquitectura sigue a la fuerza
            </div>
            <div className="card-body">
              <p>
                Las osteonas (en el hueso compacto) y las trabéculas (en el esponjoso) se orientan{' '}
                <strong>a lo largo de las líneas de esfuerzo</strong>. El hueso remodela su estructura según la carga que
                recibe — el cuerpo "sabe" de dónde viene la fuerza.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-2">
              Gira el ángulo de las fibras en el canvas: al pasar de 0° a 90° la rigidez cae de 17,4 a 9,6 GPa. Pregunta:
              ¿qué le pasaría a un hueso si las fuerzas llegaran siempre perpendiculares a las osteonas?
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-tissue" className="sim" />
            <div className="prof-controls">
              <span className="badge">Y(θ) = Y_L cos²θ + Y_T sin²θ</span>
              <label>
                θ{' '}
                <input
                  type="range"
                  id="ts_ang"
                  min="0"
                  max="90"
                  step="1"
                  defaultValue={params.ts_ang}
                  onChange={(e) => {
                    engine.setParam('ts_ang', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="ts_out">
                Y = 17,4 GPa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
