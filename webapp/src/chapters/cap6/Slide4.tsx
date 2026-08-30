import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide4({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="4" data-module="2">
      <div className="module-header">
        <span className="mnum">6.2</span>
        <span className="mtitle">Valores de Atwater y el donut estándar</span>
        <span className="msub">Cuánta energía «metabolizable» hay realmente</span>
        <span className="mslide-count">4 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏷️</span> Factores de Atwater (netos) · Tabla 6.2
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Macronutriente</th>
                    <th>kcal/g neto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Carbohidrato</td>
                    <td>4,02</td>
                  </tr>
                  <tr>
                    <td>Proteína</td>
                    <td>4,20</td>
                  </tr>
                  <tr>
                    <td>Etanol</td>
                    <td>7,00</td>
                  </tr>
                  <tr>
                    <td>Grasa</td>
                    <td>8,98</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Son valores <strong>netos</strong> (energía metabolizable ME): la digestión y la absorción no son 100 % eficientes.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🍩</span> El donut estándar de Entenmann's
            </div>
            <div className="card-body">
              <p>18 g de grasa + 29 g de carbohidrato + 2 g de proteína:</p>
              <div className="eq-block">
                {"\\[ 18\\times 9 + 29\\times 4 + 2\\times 4 = 162 + 116 + 8 = 286 \\approx 280\\ \\text{kcal} \\]"}
              </div>
              <p>
                El valor declarado es <span className="tag">280 kcal</span>: la diferencia se explica por el redondeo de los gramos
                al entero más cercano (Problema 6.11).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚗️</span> Balance de reservas (eq. 6.10–6.12)
            </div>
            <div className="card-body">
              <p>La velocidad de cambio de las reservas energéticas es la ingesta metabolizable menos el metabolismo:</p>
              <div className="eq-block">
                {"\\[ \\frac{dR}{dt} = \\frac{d(\\text{ME})}{dt} - \\frac{dQ_{\\text{met}}}{dt} \\]"}
              </div>
              <p>
                {"Con eficiencia \\(k \\approx 0{,}90\\) por debajo del mantenimiento y \\(0{,}75\\) por encima: "}
                <span className="highlight">el cuerpo es más «derrochador» cuando ya está en superávit</span>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-4">
              El donut estándar es el «ladrillo» de este capítulo: se usa como unidad para quemar calorías, comparar dietas y resolver
              problemas. En el canvas verás cuánto de sus 286 kcal viene de cada macronutriente: la grasa aporta más de la mitad.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-donut" className="sim" />
            <div className="prof-controls">
              <span className="badge">donut</span>
              <button
                type="button"
                id="dn_play"
                onClick={() => {
                  const nextPlaying = !flags.dnPlaying;
                  engine.setFlag('dnPlaying', nextPlaying);
                  if (nextPlaying) flags.dnT = 0;
                  engine.requestDraw();
                }}
              >
                {flags.dnPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="dn_out">
                grasa 162 · carb 116 · prot 8 kcal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
