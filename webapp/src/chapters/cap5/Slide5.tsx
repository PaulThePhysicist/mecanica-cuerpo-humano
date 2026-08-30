import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide5({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="5" data-module="2">
      <div className="module-header">
        <span className="mnum">5.2</span>
        <span className="mtitle">Fibras ST y FT: lentas y rápidas</span>
        <span className="msub">Tipo I, IIA y IIB: la receta de cada músculo</span>
        <span className="mslide-count">5 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔴</span> Tres tipos de fibra
            </div>
            <div className="card-body">
              <p>
                <strong>ST · Tipo I (rojas, contracción lenta):</strong> tiempo de contracción prolongado ≈{' '}
                <span className="tag">110 ms</span>, muy resistentes a la fatiga porque son <strong>aeróbicas</strong>{' '}
                (usan oxígeno para producir ATP). Son rojas por su riego sanguíneo.
              </p>
              <p>
                <strong>FT · Tipo IIA (rojas intermedias):</strong> contracción corta, fatiga intermedia, generación
                aeróbica de ATP.
              </p>
              <p>
                <strong>FT · Tipo IIB (blancas, contracción rápida):</strong> alcanzan la tensión máxima en ≈{' '}
                <span className="tag">50 ms</span>, más fuerza, pero se fatigan rápido por procesos{' '}
                <strong>anaeróbicos</strong>. Los excita una neurona más grande (respuesta más rápida).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⏱️</span> Tiempos de respuesta
            </div>
            <div className="card-body">
              <p>
                El músculo «promedio» tiene ≈ <span className="tag">50 % ST</span> y ≈ <span className="tag">25 % FT</span>{' '}
                (rojas y blancas). Los tiempos de respuesta por tipo dominante:
              </p>
              <div className="row">
                <span className="pill">👁 Oculares (FT) ≈ 1/40 s</span>
                <span className="pill">🦵 Gastrocnemio (FT) ≈ 1/15 s</span>
                <span className="pill">🧍 Sóleo (ST) ≈ 1/5 s</span>
              </div>
              <p>
                El <strong>sóleo</strong> sostiene la bipedestación (resistencia, tolerancia a la fatiga); el{' '}
                <strong>gastrocnemio</strong> impulsa saltar y correr (respuesta rápida aunque pierda resistencia).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏃</span> Atletas · Tabla 5.8 (% ST/FT)
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Atleta</th>
                    <th>Músculo</th>
                    <th>%ST</th>
                    <th>%FT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Velocistas (M)</td>
                    <td>Gastrocnemio</td>
                    <td>24</td>
                    <td>76</td>
                  </tr>
                  <tr>
                    <td>Fondistas (M)</td>
                    <td>Gastrocnemio</td>
                    <td>79</td>
                    <td>21</td>
                  </tr>
                  <tr>
                    <td>Ciclistas (M)</td>
                    <td>Vasto lateral</td>
                    <td>57</td>
                    <td>43</td>
                  </tr>
                  <tr>
                    <td>Levantadores de pesas (M)</td>
                    <td>Gastrocnemio</td>
                    <td>44</td>
                    <td>56</td>
                  </tr>
                  <tr>
                    <td>Piragüistas (M)</td>
                    <td>Deltoides posterior</td>
                    <td>71</td>
                    <td>29</td>
                  </tr>
                  <tr>
                    <td>No atletas (M)</td>
                    <td>Vasto lateral</td>
                    <td>47</td>
                    <td>53</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ marginTop: '0.3rem' }}>
                Resistencia → más ST; velocidad y fuerza → más FT. La receta es entrenable hasta cierto punto…
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-5">
              La proporción de fibras explica los «tiempos de respuesta»: el ojo responde en 25 ms porque es casi todo FT;
              el sóleo tarda 200 ms porque es casi todo ST. Compara las tres curvas en el canvas — misma forma, distinta
              velocidad, distinta resistencia a la fatiga.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-fibers" />
            <div className="prof-controls">
              <span className="badge">fibras</span>
              <label>
                músculo{' '}
                <select
                  id="fb_mus"
                  defaultValue={params.fb_mus}
                  onChange={(e) => {
                    engine.setParam('fb_mus', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="ocular">Ocular · ~1/40 s</option>
                  <option value="gastroc">Gastrocnemio · ~1/15 s</option>
                  <option value="soleo">Sóleo · ~1/5 s</option>
                </select>
              </label>
              <span className="readout" id="fb_out">
                FT dominante · respuesta rápida
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
