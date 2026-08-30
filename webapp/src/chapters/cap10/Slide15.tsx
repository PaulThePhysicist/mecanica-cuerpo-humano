import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide15({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="15" data-module="6">
      <div className="module-header">
        <span className="mnum">10 · 5</span>
        <span className="mtitle">Audiogramas y tipos de pérdida auditiva</span>
        <span className="msub">{"\\(0{-}15\\) normal · \\(26{-}40\\) leve · \\(71{-}90\\) grave"}</span>
        <span className="mslide-count">15 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🩺</span> Leer un audiograma
            </div>
            <div className="card-body">
              <p>
                El audiograma traza el umbral en dB HL frente a la frecuencia. Clases de pérdida (dB HL):{' '}
                <span className="tag">normal 0–15</span>, <span className="tag">ligera 16–25</span>,{' '}
                <span className="tag">leve 26–40</span>, <span className="tag">moderada 41–55</span>,{' '}
                <span className="tag">moderada-grave 56–70</span>, <span className="tag">grave 71–90</span>,{' '}
                <span className="tag">profunda &gt;90</span>.
              </p>
              <div className="eq-block">
                {"\\[ \\text{dB HL} = \\text{pérdida respecto al umbral normal} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔀</span> Conductiva vs. neurosensorial
            </div>
            <div className="card-body">
              <p>
                <strong>Conductiva</strong>: el sonido no llega a la cóclea (cerumen, otitis, otosclerosis) — curva plana,
                a menudo tratable. <strong>Neurosensorial</strong>: falla la cóclea o el nervio (ruido, edad,
                ototóxicos) — caída en agudos, irreversible. El test de Rinne distingue ambas por conducción ósea.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Pérdida</th>
                    <th>Curva típica</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Conductiva</td>
                    <td>plana</td>
                  </tr>
                  <tr>
                    <td>Neurosensorial</td>
                    <td>caída en agudos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-15">
              Elige cada caso clínico y lee la curva: la presbiacusia y la exposición a ruido caen en agudos; la
              conductiva es plana en todo el rango.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-audiogram" className="sim" />
            <div className="prof-controls">
              <span className="badge">audiograma</span>
              <label>
                Caso{' '}
                <select
                  id="au_sel"
                  defaultValue={params.au_sel}
                  onChange={(e) => {
                    engine.setParam('au_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Normal (0–15)</option>
                  <option value="1">Ligera (16–25)</option>
                  <option value="2">Leve (26–40)</option>
                  <option value="3">Moderada (41–55)</option>
                  <option value="4">Conductiva plana</option>
                  <option value="5">Neurosensorial por ruido</option>
                  <option value="6">Profunda (&gt;90)</option>
                </select>
              </label>
              <span className="readout" id="au_out">
                Normal · umbral 0–15 dB HL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
