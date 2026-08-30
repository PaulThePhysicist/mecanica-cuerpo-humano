import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide3({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="3" data-module="2">
      <div className="module-header">
        <span className="mnum">6.2</span>
        <span className="mtitle">Contenido de energía de los combustibles</span>
        <span className="msub">La oxidación de la glucosa y de la grasa</span>
        <span className="mslide-count">3 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🍬</span> Oxidación de la glucosa
            </div>
            <div className="card-body">
              <p>
                La combustión completa de la glucosa libera <strong>686 kcal por mol</strong> (eq. 6.8):
              </p>
              <div className="eq-block">
                {"\\[ \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\,\\text{O}_2 \\rightarrow 6\\,\\text{CO}_2 + 6\\,\\text{H}_2\\text{O} + 686\\ \\text{kcal} \\]"}
              </div>
              <p>
                Por gramo: <span className="tag">686 kcal / 180 g ≈ 3,8 kcal/g</span>. El cociente respiratorio RER = CO₂/O₂ ={' '}
                <span className="tag">1,0</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🥑</span> Oxidación del ácido palmítico
            </div>
            <div className="card-body">
              <p>
                La grasa es el combustible más denso: el palmítico libera <strong>2397 kcal por mol</strong> (eq. 6.9):
              </p>
              <div className="eq-block">
                {"\\[ \\text{CH}_3(\\text{CH}_2)_{14}\\text{COOH} + 23\\,\\text{O}_2 \\rightarrow 16\\,\\text{CO}_2 + 16\\,\\text{H}_2\\text{O} + 2397\\ \\text{kcal} \\]"}
              </div>
              <p>
                Por gramo: <span className="tag">2397 / 256 g ≈ 9,3 kcal/g</span>. RER = CO₂/O₂ = <span className="tag">16/23 ≈ 0,7</span>. Las{' '}
                <strong>proteínas</strong> quedan en <span className="tag">RER ≈ 0,8</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫁</span> El equivalente calórico del O₂
            </div>
            <div className="card-body">
              <p>
                Por litro de O₂ consumido (Tabla 6.2): carbohidrato ≈ <span className="tag">5,05 kcal/L</span>, grasa ≈{' '}
                <span className="tag">4,74 kcal/L</span>, proteína ≈ <span className="tag">4,46 kcal/L</span>. La oxidación pura de glucosa da
                686/134,4 ≈ <span className="tag">5,5 kcal/L</span>. Medir el O₂ consumido es medir la tasa metabólica (calorimetría indirecta).
              </p>
              <p>
                El <strong>RER</strong> (cociente respiratorio) revela <em>qué</em> combustible se quema: <span className="tag">1,0</span> solo
                carbohidratos, <span className="tag">0,7</span> solo grasas.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-3">
              Regla mnemotécnica: <strong>grasa ≈ 9 kcal/g, carbohidrato ≈ proteína ≈ 4 kcal/g</strong>. Por eso el cuerpo elige almacenar
              energía como grasa: el doble de calorías por gramo, y sin agua. Pulsa ▶ para ver la reacción de oxidación.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-ox" className="sim" />
            <div className="prof-controls">
              <span className="badge">oxidación</span>
              <label>
                combustible{' '}
                <select
                  id="ox_fuel"
                  defaultValue={params.ox_fuel}
                  onChange={(e) => {
                    engine.setParam('ox_fuel', e.target.value);
                    engine.requestDraw();
                  }}
                >
                  <option value="glucosa">Glucosa · 3,8 kcal/g</option>
                  <option value="palmitico">Palmítico · 9,3 kcal/g</option>
                </select>
              </label>
              <button
                type="button"
                id="ox_play"
                onClick={() => {
                  const nextPlaying = !flags.oxPlaying;
                  engine.setFlag('oxPlaying', nextPlaying);
                  if (nextPlaying) flags.oxT = 0;
                  engine.requestDraw();
                }}
              >
                {flags.oxPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="ox_out">
                C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + 686 kcal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
