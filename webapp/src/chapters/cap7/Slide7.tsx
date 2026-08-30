import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide7({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [playing, setPlaying] = useState(flags.ryPlaying);

  const toggle = () => {
    const next = !flags.ryPlaying;
    flags.ryPlaying = next;
    if (next) flags.ryT = 0;
    setPlaying(next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="7" data-module="3">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">Flujo laminar y turbulento · Reynolds</span>
        <span className="msub">Cinco atributos del flujo y un número que decide el régimen</span>
        <span className="mslide-count">7 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔀</span> Cinco atributos del flujo
            </div>
            <div className="card-body">
              <p>
                Todo flujo se clasifica por cinco pares: <strong>laminar/turbulento</strong>,{' '}
                <strong>compresible/incompresible</strong>, <strong>viscoso/no viscoso</strong>,{' '}
                <strong>rotacional/irrotacional</strong> y <strong>estacionario/pulsátil</strong>.
              </p>
              <p>
                La sangre y el aire del cuerpo son incompresibles en la práctica, viscosos y pulsátiles (el corazón late). El
                régimen <em>laminar vs. turbulento</em> lo decide el número de Reynolds.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔢</span> El número de Reynolds
            </div>
            <div className="card-body">
              <div className="eq-block">
                {"\\[ \\text{Re} = \\frac{\\rho\\, u\\, d}{\\eta} \\qquad \\text{(eq. 7.11)} \\]"}
              </div>
              <p>
                Re compara la inercia del fluido con su fricción interna: <span className="tag">Re &lt; 2000</span> laminar ·{' '}
                <span className="tag">Re &gt; 2000</span> turbulento (transición 1200–2500).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🩺</span> En el cuerpo
            </div>
            <div className="card-body">
              <p>
                El flujo sanguíneo es <strong>laminar</strong> en casi todo el árbol vascular. Se vuelve{' '}
                <strong>turbulento</strong> en la aorta en el pico sistólico y en las <strong>estenosis</strong>: los
                soplos cardíacos son la firma acústica de esa turbulencia (problema 7.39: una célula de 1 µm tiene Re ≈ 0,004).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-7">
              Reynolds es el «semáforo» del flujo: sube la velocidad en el canvas y las líneas paralelas del régimen laminar
              se rompen en remolinos. Dato para el aula: la sangre en reposo es laminar casi siempre; la turbulencia es
              noticia médica (soplos, estenosis).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-reynolds" />
            <div className="prof-controls">
              <span className="badge">Reynolds</span>
              <label>
                fluido{' '}
                <select
                  id="ry_fl"
                  defaultValue={params.ry_fl}
                  onChange={(e) => {
                    engine.setParam('ry_fl', e.target.value);
                    engine.requestDraw();
                  }}
                >
                  <option value="sangre">Sangre · η=0,004</option>
                  <option value="agua">Agua · η=0,001</option>
                  <option value="aire">Aire · η=0,000018</option>
                </select>
              </label>
              <label>
                u{' '}
                <input
                  type="range"
                  id="ry_u"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={params.ry_u}
                  onInput={(e) => {
                    engine.setParam('ry_u', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ry_uv">20 cm/s</span>
              </label>
              <button id="ry_play" type="button" onClick={toggle}>
                {playing ? '⏸' : '▶'}
              </button>
              <span className="readout" id="ry_out">
                Re = 1 600 · laminar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
