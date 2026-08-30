import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide6({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [playing, setPlaying] = useState(flags.spPlaying);

  const toggle = () => {
    const next = !flags.spPlaying;
    flags.spPlaying = next;
    if (next) flags.spT = 0;
    setPlaying(next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="6" data-module="2">
      <div className="module-header">
        <span className="mnum">7.2</span>
        <span className="mtitle">La ley de Laplace: esfera y esferoide · Tabla 7.2</span>
        <span className="msub">Dos curvas, la mitad de la tensión</span>
        <span className="mslide-count">6 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎈</span> Esfera y esferoide
            </div>
            <div className="card-body">
              <p>Una membrana esférica con dos superficies tensas sostiene el doble:</p>
              <div className="eq-block">
                {"\\[ \\Delta P = \\frac{2T}{R} \\qquad \\text{(esfera, eq. 7.8–7.9)} \\]"}
              </div>
              <div className="eq-block">
                {
                  "\\[ \\Delta P = T\\left(\\frac{1}{R_1} + \\frac{1}{R_2}\\right) \\qquad \\text{(esferoide, eq. 7.10)} \\]"
                }
              </div>
              <p>Modela el globo ocular, la vejiga y el estómago (módulo 8) y los alvéolos.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫁</span> Alvéolos y el surfactante
            </div>
            <div className="card-body">
              <p>
                Un alvéolo pequeño (R chico) exige más {"\\(\\Delta P\\)"} que uno grande para la misma tensión. Sin{' '}
                <strong>surfactante</strong>, el pequeño <span className="highlight">se vaciaría en el grande</span> (el
                mismo efecto de dos burbujas conectadas).
              </p>
              <p>
                El surfactante baja la tensión superficial local:{' '}
                <span className="tag">γ = 0,1 vs. 0,7 N/m del agua</span> (Tabla 7.2) — y estabiliza alvéolos de distinto
                tamaño.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔬</span> Tensiones superficiales · Tabla 7.2
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Fluido</th>
                    <th>γ (10⁻⁴ N/m)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Agua (20 °C)</td>
                    <td>7,28</td>
                  </tr>
                  <tr>
                    <td>Sangre entera</td>
                    <td>5,5–6,1</td>
                  </tr>
                  <tr>
                    <td>Plasma</td>
                    <td>5,0–5,6</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Surfactante pulmonar</b>
                    </td>
                    <td>
                      <b>0,1</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Líquido cefalorraquídeo</td>
                    <td>6,0–6,3</td>
                  </tr>
                  <tr>
                    <td>Saliva</td>
                    <td>1,5–2,1</td>
                  </tr>
                  <tr>
                    <td>Mercurio</td>
                    <td>46,4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-6">
              El «2» de la esfera sale de que la membrana tiene dos superficies que se tensan. Conecta dos burbujas en el
              canvas y mira: la pequeña se vacía en la grande — así colapsarían los alvéolos pequeños sin surfactante. Esa
              molécula es una cuestión de vida o muerte al nacer.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-laplace-sphere" />
            <div className="prof-controls">
              <span className="badge">esfera</span>
              <button id="sp_play" type="button" onClick={toggle}>
                {playing ? '⏸' : '▶'}
              </button>
              <label>
                γ{' '}
                <input
                  type="range"
                  id="ls_g"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  defaultValue={params.ls_g}
                  onInput={(e) => {
                    engine.setParam('ls_g', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ls_gv">0,70</span>
              </label>
              <span className="readout" id="ls_out">
                sin surfactante: colapsa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
