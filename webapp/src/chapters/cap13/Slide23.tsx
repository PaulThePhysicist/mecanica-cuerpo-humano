import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide23({ engine }: SlideProps) {
  const sel = engine?.paramsRef.current.map_sel ?? 0;

  const names = ['Temperatura', 'Presión arterial', 'Ejercicio', 'Pupila'];
  const subs = ['Bucle cerrado (sudor)', 'Barorreflejo (carotídeo)', 'Sistemas acoplados', 'Lazo con latencia'];

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 9</span>
        <span className="mtitle">Mapa de los sistemas de control del cuerpo</span>
        <span className="msub">homeostasis · bucle abierto vs cerrado · estabilidad</span>
        <span className="mslide-count">23 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧭</span> El hilo conductor
            </div>
            <div className="card-body">
              <p>
                La retroalimentación y el control activo son la base indispensable de la supervivencia biológica. La
                termodinámica sin control (bucle abierto) predice temperaturas letales de 24 °C en reposo o 49 °C en ejercicio.
                Es el lazo cerrado de sudoración y control vasomotor el que estabiliza el cuerpo en {"\\(37\\ ^\\circ\\mathrm{C}\\)"}{' '}
                con constantes de minutos en lugar de horas.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧮</span> Las cifras cuantitativas clave
            </div>
            <div className="card-body">
              <p>
                <span className="tag">LEC ≈ 1/3 líquido</span>
                <span className="tag">37 ± 2 °C</span>
                <span className="tag">C = 60 kcal/°C</span>
                <span className="tag">BMR 70 kcal/h</span>
                <span className="tag">λ ≈ 25 kcal/h·°C</span>
                <span className="tag">K_sudor ≈ 750</span>
                <span className="tag">τr: 2,4 h → 4,7 min</span>
                <span className="tag">g·τd ≤ π/2</span>
                <span className="tag">τ_pupila 180–400 ms</span>
              </p>
              <p>
                Todo sistema de regulación fisiológica obedece a la misma topología de 5 eslabones (Fig. 13.2) y al criterio
                universal de estabilidad {"\\(g\\tau_d \\le \\pi/2\\)"}.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-23">
              Recorre los cuatro sistemas del mapa: temperatura, presión arterial, ejercicio y pupila ocular. Todos comparten la
              misma física de la cibernética y el control de lazos cerrados.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-map" />
            <div className="prof-controls">
              <span className="badge">mapa</span>
              <label>
                Sistema{' '}
                <select
                  id="map_sel"
                  value={sel}
                  onChange={(e) => {
                    engine?.setParam('map_sel', Number(e.target.value));
                    engine?.requestDraw();
                  }}
                >
                  <option value="0">Temperatura</option>
                  <option value="1">Presión arterial</option>
                  <option value="2">Ejercicio</option>
                  <option value="3">Pupila</option>
                </select>
              </label>
              <span className="readout" id="map_out">
                {names[sel]} · {subs[sel]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
