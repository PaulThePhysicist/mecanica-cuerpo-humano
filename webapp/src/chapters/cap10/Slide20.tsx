import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide20({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="20" data-module="8">
      <div className="module-header">
        <span className="mnum">10 · 7</span>
        <span className="mtitle">El cuerpo como fuente de sonido</span>
        <span className="msub">
          {"\\(\\text{correr}: 2{,}0\\ \\mathrm{atm @ 4\\,Hz}\\ \\cdot\\ \\text{gritar}: 0{,}05\\ \\mathrm{@ 1\\,kHz}\\)"}
        </span>
        <span className="mslide-count">20 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">❤️</span> Sonidos corporales y sus niveles
            </div>
            <div className="card-body">
              <p>
                El cuerpo vibra y suena en todas las actividades: caminar, correr, masticar, respirar, el corazón y la
                voz. Cada fuente tiene su nivel típico y su banda de frecuencia (Tabla 10.6 del libro).
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Fuente</th>
                    <th>Nivel (dB @ 1 m)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Respiración</td>
                    <td>≈ 10</td>
                  </tr>
                  <tr>
                    <td>Corazón</td>
                    <td>≈ 20</td>
                  </tr>
                  <tr>
                    <td>Caminar</td>
                    <td>≈ 25</td>
                  </tr>
                  <tr>
                    <td>Correr</td>
                    <td>≈ 35</td>
                  </tr>
                  <tr>
                    <td>Voz</td>
                    <td>≈ 60–70</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌊</span> Presiones del cuerpo en el movimiento
            </div>
            <div className="card-body">
              <p>
                Al correr el cuerpo genera sobresaltos de presión de hasta <strong>2,0 atm a ~4 Hz</strong> (cada
                zancada); al gritar, <strong>0,05 atm a ~1 kHz</strong>. Son las ondas de presión que la medicina
                aprovecha para auscultar y diagnosticar.
              </p>
              <div className="eq-block">
                {"\\[ \\text{correr: } \\Delta P \\approx 2{,}0\\ \\mathrm{atm},\\ 4\\ \\mathrm{Hz} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-20">
              Recorre las fuentes: cada una suma su «firma» de frecuencia y nivel al sonido del cuerpo. La escala
              empieza en el silencio de la consulta (10 dB) y llega a la voz del paciente (70 dB).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-bodysources" className="sim" />
            <div className="prof-controls">
              <span className="badge">fuentes</span>
              <label>
                Fuente{' '}
                <select
                  id="bo_sel"
                  defaultValue={params.bo_sel}
                  onChange={(e) => {
                    engine.setParam('bo_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Respiración</option>
                  <option value="1">Corazón</option>
                  <option value="2">Caminar</option>
                  <option value="3">Correr</option>
                  <option value="4">Voz</option>
                  <option value="5">Grito</option>
                </select>
              </label>
              <span className="readout" id="bo_out">
                Respiración · ≈ 10 dB @ 1 m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
