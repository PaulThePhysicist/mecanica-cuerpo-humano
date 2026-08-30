import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide18({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="18" data-module="7">
      <div className="module-header">
        <span className="mnum">5.10</span>
        <span className="mtitle">Coordinación de los músculos</span>
        <span className="msub">Agonistas, sinergistas y antagonistas</span>
        <span className="mslide-count">18 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🤝</span> Los roles
            </div>
            <div className="card-body">
              <p>
                En casi todo movimiento participan muchos músculos: <strong>agonistas</strong> (protagonistas, en fase),{' '}
                <strong>sinergistas</strong> (asisten y añaden ajuste fino, mayormente en fase) y <strong>antagonistas</strong>{' '}
                (fuera de fase). La actividad coordinada por fase del ciclo de marcha se vio en las Figs. 3.12 y 3.13.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🐈</span> Sóleo vs gastrocnemio (gato)
            </div>
            <div className="card-body">
              <p>
                Ambos son plantarflexores sinergistas del tobillo, pero <strong>no están exactamente en fase</strong>: el{' '}
                <strong>gastrocnemio</strong> (más FT) desarrolla fuerza primero, para la fuerza vertical; el{' '}
                <strong>sóleo</strong> (más ST) un poco después, para la estabilidad. Al aumentar la velocidad de marcha, el
                gastrocnemio gana protagonismo.
              </p>
              <p>
                El <strong>tibial anterior</strong> y el sóleo trabajan <strong>fuera de fase</strong> durante el paso.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚴</span> El ciclismo biarticular
            </div>
            <div className="card-body">
              <p>
                En la carrera descendente inicial (fuerza hacia abajo y adelante) se activa el <strong>recto femoral</strong>{' '}
                biarticular: contrarresta a los glúteos (torque de cadera pequeño) y se suma a los vastos (torque extensor
                de rodilla grande).
              </p>
              <p>
                A mitad de la carrera (fuerza hacia abajo y atrás) se activan los <strong>isquiotibiales</strong>{' '}
                biarticulares: extensión positiva de cadera y flexión de rodilla.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-18">
              El momento de activación es la coordinación. El canvas muestra las fuerzas de sóleo (ST), gastrocnemio (FT) y
              tibial anterior en un ciclo de paso del gato: cambia la velocidad y observa cómo el gastrocnemio adelanta y
              crece.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-coord" />
            <div className="prof-controls">
              <span className="badge">paso del gato</span>
              <label>
                velocidad{' '}
                <select
                  id="cd_v"
                  defaultValue={params.cd_v}
                  onChange={(e) => {
                    engine.setParam('cd_v', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                >
                  <option value="0.4">0,4 m/s</option>
                  <option value="0.7">0,7 m/s</option>
                  <option value="1.2">1,2 m/s</option>
                  <option value="2.4">2,4 m/s (trote)</option>
                </select>
              </label>
              <span className="readout" id="cd_out">
                gastrocnemio adelanta al sóleo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
