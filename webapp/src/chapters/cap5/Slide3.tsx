import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide3({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="3" data-module="2">
      <div className="module-header">
        <span className="mnum">5.2</span>
        <span className="mtitle">La sacudida muscular (twitch)</span>
        <span className="msub">Un estímulo eléctrico, un pico de fuerza</span>
        <span className="mslide-count">3 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚡</span> La forma de una sacudida
            </div>
            <div className="card-body">
              <p>
                Un estímulo eléctrico produce una sacudida que se <strong>retrasa ≈ 15 ms</strong>, alcanza su máximo ≈{' '}
                <strong>40 ms más tarde</strong> y decae a cero ≈ <strong>50 ms después</strong>.
              </p>
              <div className="eq-block">
                {"\\[ F(t)=F_0\\,\\frac{t}{T}\\,\\exp(-t/T) \\qquad (\\text{eq. 5.1}) \\]"}
              </div>
              <p>
                El máximo ocurre en <span className="tag">t = T</span> (derivada nula), con{' '}
                <span className="highlight">F/F₀ = 1/e ≈ 0,37</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⏱️</span> Tiempos de sacudida · Tabla 5.7
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Músculo</th>
                    <th>T medio (ms)</th>
                    <th>Rango (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tríceps braquial</td>
                    <td>44,5</td>
                    <td>16–68</td>
                  </tr>
                  <tr>
                    <td>Bíceps braquial</td>
                    <td>52,0</td>
                    <td>16–85</td>
                  </tr>
                  <tr>
                    <td>Tibial anterior</td>
                    <td>58,0</td>
                    <td>38–80</td>
                  </tr>
                  <tr>
                    <td>Sóleo</td>
                    <td>74,0</td>
                    <td>52–100</td>
                  </tr>
                  <tr>
                    <td>Gastrocnemio medial</td>
                    <td>79,0</td>
                    <td>40–110</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ marginTop: '0.3rem' }}>
                Un músculo <em>lento</em> (sóleo, 74 ms) tiene un twitch largo; uno <em>rápido</em> (tríceps, 44,5 ms),
                corto. Eso decide su frecuencia de tétanos.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔁</span> De la sacudida al tétanos
            </div>
            <div className="card-body">
              <p>
                Al aumentar la frecuencia de estímulos, las sacudidas se superponen: primero un{' '}
                <strong>tétanos incompleto</strong> (fuerza ondulante) y luego el <strong>tétanos completo</strong> (fuerza
                constante).
              </p>
              <p>
                Hacen falta ≈ <span className="tag">50–60 estímulos/s</span> para tetanizar los músculos de mamíferos a
                temperatura ambiente: desde <span className="tag">≈ 30/s</span> (sóleo) hasta{' '}
                <span className="tag">≈ 300/s</span> (músculos oculares).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-3">
              El twitch es el «latido elemental» del músculo. La ecuación 5.1 lo modela con un solo parámetro T. Cambia el
              músculo en el canvas y observa cómo T desplaza el pico (t = T) y modifica el decaimiento. Nota: la sacudida
              real lleva un retraso de 15 ms que el modelo no representa.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-twitch" />
            <div className="prof-controls">
              <span className="badge">twitch</span>
              <label>
                músculo{' '}
                <select
                  id="tw_mus"
                  defaultValue={params.tw_mus}
                  onChange={(e) => {
                    engine.setParam('tw_mus', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                >
                  <option value="44.5">Tríceps braquial · 44,5 ms</option>
                  <option value="52">Bíceps braquial · 52,0 ms</option>
                  <option value="58">Tibial anterior · 58,0 ms</option>
                  <option value="74">Sóleo · 74,0 ms</option>
                  <option value="79">Gastrocnemio medial · 79,0 ms</option>
                </select>
              </label>
              <span className="readout" id="tw_out">
                T = 74 ms · pico en t = T
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
