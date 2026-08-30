import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide11({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="11" data-module="5">
      <div className="module-header">
        <span className="mnum">6.4</span>
        <span className="mtitle">El costo de caminar y de correr</span>
        <span className="msub">Por qué preferimos correr a altas velocidades</span>
        <span className="mslide-count">11 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🥾</span> Costo por metro recorrido
            </div>
            <div className="card-body">
              <p>
                Caminar cuesta ≈ <span className="tag">2,13 J/kg-m</span> a 1,2 m/s (2,6 mph), <span className="tag">2,49</span> a 1,8
                y <span className="tag">3,93</span> a 2,4 m/s (5,4 mph). Por encima de 3 m/s la curva se vuelve{' '}
                <strong>muy superlineal</strong>.
              </p>
              <p>
                Correr en llano cuesta ≈ <span className="tag">4,2 J/kg-m</span> para no entrenados,{' '}
                <strong>independiente de la velocidad</strong>; los entrenados gastan ≈ <span className="tag">6 % menos</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏃</span> El cruce caminar ↔ correr
            </div>
            <div className="card-body">
              <p>
                A 2,4 m/s correr requiere ≈ <strong>14 % menos potencia</strong> que caminar: el costo baja de 3,93 a ≈{' '}
                <span className="tag">3,40 J/kg-m</span>. Por eso, superada la velocidad óptima de marcha,{' '}
                <span className="highlight">se prefiere el trote</span>.
              </p>
              <p>
                Moverse horizontalmente cuesta ≈ <span className="tag">2,8 J/kg-m</span>; <strong>verticalmente</strong>, ≈{' '}
                <span className="tag">30 J/kg-m</span> (11 veces más).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⛰️</span> Cuestas y eficiencia
            </div>
            <div className="card-body">
              <p>
                Subir exige ≈ <span className="tag">2,7×</span> el aumento de energía potencial → eficiencia ≈{' '}
                <span className="tag">36 %</span>. Bajar requiere menos potencia que en llano en ≈ 50 % de la disminución de
                energía potencial (el músculo frena: trabajo negativo).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-11">
              Pregunta de examen favorita: «¿por qué corro en lugar de caminar si voy rápido?» La respuesta es el cruce de curvas:
              correr tiene un costo por metro <em>plano</em> (4,2 J/kg-m), caminar crece con la velocidad. En el canvas muévelo por
              encima de ~2 m/s.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-locom" className="sim" />
            <div className="prof-controls">
              <span className="badge">locomoción</span>
              <label>
                velocidad{' '}
                <input
                  type="range"
                  id="lo_v"
                  min="1"
                  max="6"
                  step="0.1"
                  defaultValue={params.lo_v}
                  onChange={(e) => {
                    engine.setParam('lo_v', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="lo_vv">{params.lo_v} m/s</span>
              </label>
              <span className="readout" id="lo_out">
                a 2,0 m/s: caminar ≈ 4,2 J/kg-m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
