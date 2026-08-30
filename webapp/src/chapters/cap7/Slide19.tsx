import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide19({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;
  const [playing, setPlaying] = useState(flags.flPlaying);

  const toggle = () => {
    const next = !flags.flPlaying;
    flags.flPlaying = next;
    if (next) flags.flT = 0;
    setPlaying(next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="19" data-module="8">
      <div className="module-header">
        <span className="mnum">7.4</span>
        <span className="mtitle">Caudales del sistema alimentario · Tabla 7.4</span>
        <span className="msub">Del bocado a la evacuación: horas y velocidades</span>
        <span className="mslide-count">19 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🍽️</span> Longitudes y tiempos · Tabla 7.4
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Componente</th>
                    <th>Long.</th>
                    <th>Tiempo de paso</th>
                    <th>Velocidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Boca y faringe</td>
                    <td>8 cm</td>
                    <td>1–10 s</td>
                    <td>1–8 cm/s</td>
                  </tr>
                  <tr>
                    <td>Esófago</td>
                    <td>25 cm</td>
                    <td>5–20 s</td>
                    <td>3–5 cm/s</td>
                  </tr>
                  <tr>
                    <td>Estómago</td>
                    <td>12 cm</td>
                    <td>2–6 h</td>
                    <td>≈ 0,001</td>
                  </tr>
                  <tr>
                    <td>Intestino delgado</td>
                    <td>400 cm</td>
                    <td>3–5 h</td>
                    <td>0,03</td>
                  </tr>
                  <tr>
                    <td>Intestino grueso</td>
                    <td>≈ 150 cm</td>
                    <td>10–20 h</td>
                    <td>0,004–0,008</td>
                  </tr>
                  <tr>
                    <td>Recto</td>
                    <td>16–20 cm</td>
                    <td>≈ 1 h</td>
                    <td>0,006</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Total</b>
                    </td>
                    <td>
                      <b>≈ 600 cm</b>
                    </td>
                    <td>
                      <b>16–32 h</b>
                    </td>
                    <td>
                      <b>≈ 0,01</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫃</span> La peristalsis (Fig. 7.22)
            </div>
            <div className="card-body">
              <p>
                Ondas de contracción muscular recorren el tubo y <strong>empujan</strong> el contenido. Es un flujo
                pulsátil, viscoso y no newtoniano, con Reynolds muy bajo — siempre laminar (problema 7.21).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🐌</span> La lentitud deliberada
            </div>
            <div className="card-body">
              <p>
                El contenido avanza <span className="highlight">≈ 0,01 cm/s</span> de promedio: 16 a 32 horas de boca a
                recto. La lentitud deja tiempo a la digestión y a la absorción. Compárese con la sangre, que en la aorta
                viaja ~50 cm/s.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-19">
              La tabla 7.4 es un viaje por el tracto: veloz al principio (segundos), lentísimo al final (horas). Pulsa ▶ y
              mira el bocado viajar: cada segmento arrastra a su velocidad. El dato «600 cm, 16–32 h» es el resumen de todo
              el módulo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-flows" />
            <div className="prof-controls">
              <span className="badge">peristalsis</span>
              <button id="fl_play" type="button" onClick={toggle}>
                {playing ? '⏸' : '▶'}
              </button>
              <span className="readout" id="fl_out">
                boca → recto: 16–32 h
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
