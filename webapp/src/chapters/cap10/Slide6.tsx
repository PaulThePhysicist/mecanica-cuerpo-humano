import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide6({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="6" data-module="3">
      <div className="module-header">
        <span className="mnum">10 · 4</span>
        <span className="mtitle">Producción del habla: sonidos y articuladores</span>
        <span className="msub">{"\\(14\\ \\text{vocales} + 24\\ \\text{consonantes}\\)"}</span>
        <span className="mslide-count">6 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🗣️</span> Tipos de sonidos del habla
            </div>
            <div className="card-body">
              <p>
                <strong>Sonoros</strong> (las cuerdas vocales vibran: vocales y consonantes sonoras),{' '}
                <strong>sordos</strong> (flujo turbulento sin vibración: /s/, /f/) y <strong>nasales</strong> (el velo
                baja y el aire sale por la nariz: /m/, /n/). El sistema fonético del español tiene 14 vocales y 24
                consonantes.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Vocal</th>
                    <th>F₁ (Hz)</th>
                    <th>F₂ (Hz)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>/i/</td>
                    <td>300</td>
                    <td>2 300</td>
                  </tr>
                  <tr>
                    <td>/a/</td>
                    <td>800</td>
                    <td>1 200</td>
                  </tr>
                  <tr>
                    <td>/u/</td>
                    <td>350</td>
                    <td>800</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📍</span> Puntos de articulación
            </div>
            <div className="card-body">
              <p>
                Los articuladores (lengua, labios, velo, cuerdas vocales) modulan el tracto vocal. El punto de
                articulación es dónde se estrecha: bilabial /p b m/, labiodental /f/, dental /t d/, alveolar /s n/,
                palatal /ɲ j/, velar /k g/.
              </p>
              <div className="eq-block">
                {"\\[ f_0 \\approx 128\\ \\mathrm{Hz}\\ (\\text{hombre}),\\quad 260\\ \\mathrm{Hz}\\ (\\text{mujer}) \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-6">
              Elige la vocal y observa cómo se mueve la lengua en el esquema: el punto más oscuro marca la constricción.
              F₂ separa la «oscuridad» de la «claridad» de cada vocal.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-vocab" className="sim" />
            <div className="prof-controls">
              <span className="badge">fonema</span>
              <label>
                Fonema{' '}
                <select
                  id="vt_fon"
                  defaultValue={params.vt_fon}
                  onChange={(e) => {
                    engine.setParam('vt_fon', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">/i/</option>
                  <option value="1">/e/</option>
                  <option value="2">/a/</option>
                  <option value="3">/o/</option>
                  <option value="4">/u/</option>
                  <option value="5">/s/</option>
                  <option value="6">/m/</option>
                </select>
              </label>
              <span className="readout" id="vt_out">
                /i/ → vocal anterior, cerrada
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
