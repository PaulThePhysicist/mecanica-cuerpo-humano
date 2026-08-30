import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide6({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="6" data-module="3">
      <div className="module-header">
        <span className="mnum">6.3</span>
        <span className="mtitle">Los sistemas de energía del músculo</span>
        <span className="msub">Fosfágenos, glucólisis anaeróbica y aeróbica</span>
        <span className="mslide-count">6 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔋</span> Cuatro pasos de la energía
            </div>
            <div className="card-body">
              <p>
                <strong>Paso 1 — ATP almacenado:</strong> suficiente para <span className="tag">8 sacudidas</span>, ≈ 3 s (media carrera de 50 m).
              </p>
              <p>
                <strong>Paso 2 — Fosfocreatina (PCr):</strong> ADP + PCr → ATP + Cr. Añade ≈ <span className="tag">100 sacudidas</span> (8–10 s, los primeros 50 m de un sprint). Sistema fosfágeno: ≈ 4 mol ATP/min.
              </p>
              <p>
                <strong>Paso 3 — Glucólisis anaeróbica:</strong> 3 mol ATP/glucosa, ≈ 2,5 mol ATP/min, <span className="tag">600 sacudidas</span> (1,3–1,6 min, el 400 m).
              </p>
              <p>
                <strong>Paso 4 — Aeróbico:</strong> 30–32 mol ATP/glucosa en las mitocondrias (ciclo de Krebs + cadena transportadora de electrones). Alimenta el <span className="tag">maratón</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📊</span> Capacidad y potencia · Tabla 6.8
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Sistema</th>
                    <th>Tasa (mol/min)</th>
                    <th>Total (mol)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Fosfágenos</td>
                    <td>3,6</td>
                    <td>0,7</td>
                  </tr>
                  <tr>
                    <td>Glucólisis</td>
                    <td>1,6–2,5</td>
                    <td>1,2</td>
                  </tr>
                  <tr>
                    <td>Aeróbico</td>
                    <td>1,0</td>
                    <td>90</td>
                  </tr>
                </tbody>
              </table>
              <p>
                <strong>Potencia vs capacidad:</strong> los fosfágenos son muy rápidos pero diminutos; el aeróbico es lento pero
                prácticamente ilimitado (grasa ≈ 90 mol ATP).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏟️</span> Cada carrera, su sistema
            </div>
            <div className="card-body">
              <p>
                Elige una prueba en el canvas: el cuerpo <em>suma</em> sistemas — nunca son excluyentes, pero domina el que cubre la
                potencia necesaria.
              </p>
              <div className="row">
                <span className="pill">100 m · fosfágenos</span>
                <span className="pill">400 m · + glucólisis</span>
                <span className="pill">1500 m · glucólisis + aeróbico</span>
                <span className="pill">Maratón · aeróbico</span>
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-6">
              El contraste clave: los fosfágenos entregan <strong>3,6 mol ATP/min</strong> pero solo 0,7 mol en total (dura 8–10 s);
              el aeróbico entrega solo 1,0 mol/min pero 90 mol en total. Es el dilema potencia-duración resuelto por la evolución.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-systems" className="sim" />
            <div className="prof-controls">
              <span className="badge">sistemas</span>
              <label>
                prueba{' '}
                <select
                  id="sy_race"
                  defaultValue={params.sy_race}
                  onChange={(e) => {
                    engine.setParam('sy_race', e.target.value);
                    engine.requestDraw();
                  }}
                >
                  <option value="100">100 m · fosfágenos</option>
                  <option value="400">400 m · + glucólisis</option>
                  <option value="1500">1500 m · mixto</option>
                  <option value="maraton">Maratón · aeróbico</option>
                </select>
              </label>
              <button
                type="button"
                id="sy_play"
                onClick={() => {
                  const nextPlaying = !flags.syPlaying;
                  engine.setFlag('syPlaying', nextPlaying);
                  if (nextPlaying) flags.syT = 0;
                  engine.requestDraw();
                }}
              >
                {flags.syPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="sy_out">
                400 m: fosfágenos + glucólisis
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
