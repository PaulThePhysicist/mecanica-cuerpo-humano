import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide17({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [playing, setPlaying] = useState(flags.dfPlaying);

  const toggle = () => {
    const next = !flags.dfPlaying;
    flags.dfPlaying = next;
    if (next) flags.dfT = 0;
    setPlaying(next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="17" data-module="7">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">Las leyes de Fick</span>
        <span className="msub">El transporte molecular que no necesita bomba</span>
        <span className="mslide-count">17 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📈</span> Primera ley de Fick
            </div>
            <div className="card-body">
              <p>Las moléculas fluyen de donde hay más a donde hay menos (eq. 7.64):</p>
              <div className="eq-block">
                {"\\[ J = -D_{\\text{dif}} \\frac{\\partial n}{\\partial x} \\]"}
              </div>
              <p>
                La corriente {"\\(J\\)"} es proporcional al gradiente de concentración; {"\\(D_{\\text{dif}}\\)"} es el
                coeficiente de difusión.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌫️</span> Segunda ley: la difusión ensancha
            </div>
            <div className="card-body">
              <p>Combinando con la conservación de masa (eq. 7.65–7.66):</p>
              <div className="eq-block">
                {
                  "\\[ \\frac{\\partial n}{\\partial t} = -\\frac{\\partial J}{\\partial x} = D_{\\text{dif}}\\frac{\\partial^2 n}{\\partial x^2} \\]"
                }
              </div>
              <p>
                Un pico inicial de moléculas se convierte en una <strong>gaussiana</strong> que se aplana y se ensancha
                (eq. 7.67, 7.69):
              </p>
              <div className="eq-block">
                {
                  "\\[ n \\sim \\frac{N}{\\sqrt{4\\pi D_{\\text{dif}}t}}\\,e^{-x^2/4D_{\\text{dif}}t} \\qquad \\sigma^2 = \\sigma_0^2 + 2D_{\\text{dif}}t \\]"
                }
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📏</span> Cuánto tarda
            </div>
            <div className="card-body">
              <p>
                La distancia típica crece como la raíz del tiempo: <span className="tag">{"\\(x \\sim \\sqrt{2Dt}\\)"}</span>
                . Coeficientes: <span className="tag">D ≈ 10⁻¹ gas · 10⁻⁵ líquido · 10⁻⁹ sólido</span> cm²/s.
              </p>
              <p>
                El O₂ cruza del alvéolo a la mitocondria por difusión en <span className="highlight">≈ 100 μm</span>; más
                allá, necesita la sangre.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-17">
              La difusión no es «algo que se esparce»: es un paseo aleatorio, y por eso el ancho crece como √t, no como t.
              Pulsa ▶ en el canvas y mira la gaussiana ensancharse con σ = √(2Dt) — esa es la segunda ley de Fick dibujada.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-diffusion" />
            <div className="prof-controls">
              <span className="badge">difusión</span>
              <label>
                D{' '}
                <input
                  type="range"
                  id="df_d"
                  min="0.01"
                  max="2"
                  step="0.01"
                  defaultValue={params.df_d}
                  onInput={(e) => {
                    engine.setParam('df_d', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="df_dv">0,30</span>
              </label>
              <button id="df_play" type="button" onClick={toggle}>
                {playing ? '⏸' : '▶'}
              </button>
              <span className="readout" id="df_out">
                σ = √(2Dt)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
