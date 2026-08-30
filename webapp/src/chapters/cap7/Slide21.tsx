import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide21({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [playing, setPlaying] = useState(flags.swPlaying);

  const toggle = () => {
    const next = !flags.swPlaying;
    flags.swPlaying = next;
    if (next) flags.swT = 0;
    setPlaying(next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="21" data-module="8">
      <div className="module-header">
        <span className="mnum">7.5</span>
        <span className="mtitle">Natación</span>
        <span className="msub">Flotar, empujar el agua y deslizarse</span>
        <span className="mslide-count">21 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🛟</span> Flotar
            </div>
            <div className="card-body">
              <p>
                Flotamos si la densidad promedio es menor que la del agua (1,0 g/cm³). La <strong>grasa</strong> (
                {"\\(\\approx 0{,}8\\)"}) flota; el <strong>músculo</strong> ({"\\(\\approx 1{,}0\\)"}) queda a ras; el{' '}
                <strong>hueso</strong> (1,5–2,0) se hunde. Un aire profundo baja la densidad promedio: casi todos flotan tras
                inspirar.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦾</span> La fuerza de la brazada
            </div>
            <div className="card-body">
              <p>El brazo barre un volumen cilíndrico y entrega el momento al agua (eq. 7.74–7.75):</p>
              <div className="eq-block">
                {"\\[ F_{\\text{brazada}} \\simeq \\frac{\\rho \\pi l^3 w}{4T^2} \\]"}
              </div>
              <p>
                Con {"\\(l = 0{,}386H\\)"}, {"\\(w = 0{,}07H\\)"}, 60 brazadas/min ({"\\(T=1\\)"} s) y {"\\(H=1{,}8\\)"}{' '}
                m: <span className="tag">F ≈ 27 N</span>. La velocidad estacionaria (eq. 7.73) con {"\\(C_D=1{,}0\\)"},{' '}
                {"\\(A\\approx 0{,}076\\)"} m²: <span className="tag">u ≈ 0,8 m/s</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📊</span> Escalas y planeo
            </div>
            <div className="card-body">
              <p>
                Alometría de la velocidad de natación (eq. 7.76):{' '}
                <span className="tag">{"\\(u \\approx 0{,}5\\,m_b^{0{,}19}\\)"}</span> m/s — un animal de 70 kg nada a ≈ 1
                m/s.
              </p>
              <p>
                Si el nadador deja de bracear, el arrastre cuadrático frena suavemente (eq. 7.80):{' '}
                <span className="tag">{"\\(u(t) = u_i/(1 + C_DA\\rho u_i t/2m_b)\\)"}</span>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-21">
              Física de la brazada: empujar agua hacia atrás te lleva hacia adelante (tercera ley). El 27 N sale de mover
              ~0,1 m³ de agua por brazada — y da 0,8 m/s, la velocidad real del crawl. En el canvas cambia la altura y la
              cadencia: el modelo completo del libro, en vivo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-swim" />
            <div className="prof-controls">
              <span className="badge">natación</span>
              <label>
                H{' '}
                <input
                  type="range"
                  id="sw_h"
                  min="1.5"
                  max="2.1"
                  step="0.05"
                  defaultValue={params.sw_h}
                  onInput={(e) => {
                    engine.setParam('sw_h', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="sw_hv">1,80 m</span>
              </label>
              <label>
                brazadas{' '}
                <input
                  type="range"
                  id="sw_b"
                  min="30"
                  max="90"
                  step="5"
                  defaultValue={params.sw_b}
                  onInput={(e) => {
                    engine.setParam('sw_b', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="sw_bv">60/min</span>
              </label>
              <button id="sw_play" type="button" onClick={toggle}>
                {playing ? '⏸' : '▶'}
              </button>
              <span className="readout" id="sw_out">
                F ≈ 27 N · u ≈ 0,8 m/s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
