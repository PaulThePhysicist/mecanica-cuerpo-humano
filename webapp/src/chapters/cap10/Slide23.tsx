import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide23({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="23" data-module="9">
      <div className="module-header">
        <span className="mnum">10 · 9</span>
        <span className="mtitle">Mapa del capítulo: del sonido a la escucha</span>
        <span className="msub">
          {"\\(v = \\lambda f \\to I \\to \\beta \\to Z \\to f_n \\to f_0 \\to F_1,F_2 \\to \\mathrm{dB\\,HL}\\)"}
        </span>
        <span className="mslide-count">23 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🗺️</span> El hilo conductor
            </div>
            <div className="card-body">
              <p>
                <strong>Producir</strong> (glotis → fuente) · <strong>filtrar</strong> (tracto vocal → formantes) ·{' '}
                <strong>transmitir</strong> (oído medio → impedancias) · <strong>analizar</strong> (cóclea →
                tonotopía) · <strong>percibir</strong> (fones, mels, enmascaramiento) · <strong>diagnosticar</strong>{' '}
                (Doppler, fonocardiograma).
              </p>
              <div className="eq-block">
                <span className="eqno">(10.1)</span>
                {"\\[ \\text{onda} \\to \\text{resonancia} \\to \\text{filtro} \\to \\text{tonotopía} \\to \\text{sonoridad} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧮</span> Datos que conviene recordar
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>v aire / tejido / hueso</td>
                    <td>343 / 1540 / 3500 m/s</td>
                  </tr>
                  <tr>
                    <td>Campo auditivo</td>
                    <td>20 Hz – 20 kHz</td>
                  </tr>
                  <tr>
                    <td>Resonancia del canal</td>
                    <td>≈ 3,4 kHz</td>
                  </tr>
                  <tr>
                    <td>Oído medio</td>
                    <td>22× (27 dB)</td>
                  </tr>
                  <tr>
                    <td>f₀ habla</td>
                    <td>128 (M) / 260 Hz (F)</td>
                  </tr>
                  <tr>
                    <td>Eficiencia de la voz</td>
                    <td>~0,1–1 %</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-23">
              Recorre las etapas del diagrama con el selector. Es el mismo mapa mental que usaremos para resolver
              problemas: fuente → filtro → transmisor → analizador → percepción → aplicación clínica.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-map" className="sim" />
            <div className="prof-controls">
              <span className="badge">mapa</span>
              <label>
                Etapa{' '}
                <select
                  id="mp_sel"
                  defaultValue={params.mp_sel}
                  onChange={(e) => {
                    engine.setParam('mp_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">1 · Fuente (glotis)</option>
                  <option value="1">2 · Filtro (tracto)</option>
                  <option value="2">3 · Transmisión (oído medio)</option>
                  <option value="3">4 · Análisis (cóclea)</option>
                  <option value="4">5 · Percepción (fones/mels)</option>
                  <option value="5">6 · Diagnóstico (Doppler)</option>
                </select>
              </label>
              <span className="readout" id="mp_out">
                Etapa 1 · la glotis crea el pulso
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
