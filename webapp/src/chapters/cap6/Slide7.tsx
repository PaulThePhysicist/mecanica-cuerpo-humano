import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide7({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="7" data-module="3">
      <div className="module-header">
        <span className="mnum">6.3</span>
        <span className="mtitle">Reservas de energía del cuerpo</span>
        <span className="msub">Cuánto duran el glucógeno y la grasa</span>
        <span className="mslide-count">7 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🛢️</span> Reservas corporales · Tabla 6.10
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Reserva</th>
                    <th>Masa (g)</th>
                    <th>Energía (kcal)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Glucógeno hepático</td>
                    <td>110</td>
                    <td>451</td>
                  </tr>
                  <tr>
                    <td>Glucógeno muscular</td>
                    <td>500</td>
                    <td>2050</td>
                  </tr>
                  <tr>
                    <td>Grasa</td>
                    <td>7961</td>
                    <td>74833</td>
                  </tr>
                </tbody>
              </table>
              <p>
                La grasa almacena ≈ <span className="highlight">100 veces</span> más energía que los carbohidratos: es la reserva a
                largo plazo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⏳</span> ¿Cuánto dura cada reserva?
            </div>
            <div className="card-body">
              <p>
                A la tasa basal (~1680 kcal/día): el glucógeno (hígado + músculo) dura ≈ <span className="tag">1,5 días</span>; la grasa,
                ≈ <span className="tag">45 días</span>.
              </p>
              <p>
                En la <strong>inanición</strong> (Fig. 6.14) se quema primero el glucógeno —cubre medio día—, después la grasa, y al
                final las proteínas: la muerte sobreviene cuando se agota ≈ la mitad de las proteínas, imprescindibles para la función
                celular.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏅</span> Deportes y recuperación
            </div>
            <div className="card-body">
              <p>
                Las Tablas 6.11–6.15 clasifican el aporte de cada sistema según el deporte; la Tabla 6.16 da los tiempos de recuperación:
                reponer fosfágenos es cuestión de minutos; resintetizar glucógeno, de horas a un par de días.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-7">
              Haz notar la asimetría: <strong>hígado 451 kcal + músculo 2050 kcal</strong> frente a <strong>grasa 74833 kcal</strong>. Sube
              la tasa metabólica en el canvas: los días de glucógeno se desploman, pero la grasa sigue aguantando semanas.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-reserves" className="sim" />
            <div className="prof-controls">
              <span className="badge">reservas</span>
              <label>
                tasa metabólica{' '}
                <input
                  type="range"
                  id="rs_f"
                  min="0.5"
                  max="5"
                  step="0.1"
                  defaultValue={params.rs_f}
                  onChange={(e) => {
                    engine.setParam('rs_f', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="rs_fv">{params.rs_f}×</span>
              </label>
              <span className="readout" id="rs_out">
                grasa ≈ 45 días a la BMR
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
