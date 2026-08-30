import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide20({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="20" data-module="8">
      <div className="module-header">
        <span className="mnum">5.11</span>
        <span className="mtitle">Entrenamiento y envejecimiento</span>
        <span className="msub">Hipertrofia, zonas óptimas y la curva de la edad</span>
        <span className="mslide-count">20 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏋️</span> Entrenamiento
            </div>
            <div className="card-body">
              <p>
                El PCA crece con el ejercicio, sobre todo por <strong>hipertrofia</strong> (mayor área de las fibras); la
                hiperplasia (nuevas fibras) es rara y debatida. El ejercicio <strong>concéntrico</strong> vence cargas;
                el <strong>excéntrico</strong> fortalece a los antagonistas pero puede dañar el músculo.
              </p>
              <p>
                Zonas de optimización: <span className="tag">6 RM o menos</span> → fuerza ·{' '}
                <span className="tag">6–12 RM</span> con descansos &lt; 90 s → tamaño ·{' '}
                <span className="tag">20 RM o más</span> → resistencia.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">👵</span> Envejecimiento
            </div>
            <div className="card-body">
              <p>
                Con la edad: menos fuerza, fatiga más rápida, reacciones más lentas y peor control postural. En mujeres
                de 20–89 años:
              </p>
              <div className="eq-block">
                {"\\[ \\text{torque rodilla (N·m)}=224-1{,}79\\,(\\text{edad}) \\qquad \\text{reacción (ms)}=153+0{,}57\\,(\\text{edad}) \\]"}
              </div>
              <p>
                La pérdida de fuerza supera a la de masa (≈ 20–30 % vs 15 % en el muslo): caen las motoneuronas y la tasa
                de descarga. Se pierde más fibra <strong>Tipo II</strong> (≈ 39 %) que <strong>Tipo I</strong> (≈ 19 %) —
                los músculos débiles además responden más lento.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-20">
              El canvas combina las dos historias: a la izquierda las zonas de repeticiones que optimizan
              fuerza/tamaño/resistencia; a la derecha el declive del torque y el aumento del tiempo de reacción con la
              edad. ¿Qué fracción de fuerza conserva a los 80 años una mujer que a los 20 tenía 190 N·m?
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-training" />
            <div className="prof-controls">
              <span className="badge">entrenar · envejecer</span>
              <label>
                edad{' '}
                <input
                  type="range"
                  id="tr_age"
                  min="20"
                  max="89"
                  step="1"
                  defaultValue={params.tr_age}
                  onChange={(e) => {
                    engine.setParam('tr_age', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="tr_agev">{params.tr_age}</span>
              </label>
              <span className="readout" id="tr_out">
                torque = 143 N·m · reacción = 179 ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
