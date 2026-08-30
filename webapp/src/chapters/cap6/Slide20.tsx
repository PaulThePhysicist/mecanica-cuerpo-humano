import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide20({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="20" data-module="7">
      <div className="module-header">
        <span className="mnum">6.6</span>
        <span className="mtitle">Evaporación: sudor y respiración</span>
        <span className="msub">El modo de emergencia para el calor</span>
        <span className="mslide-count">20 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💧</span> El calor de vaporización
            </div>
            <div className="card-body">
              <p>
                Evaporar <strong>1 L de agua</strong> cuesta <span className="tag">540 kcal</span>. Sudar solo enfría si el sudor{' '}
                <em>se evapora</em> (secarse con la toalla no enfría). En reposo, ≈ <span className="tag">7 kcal/h</span>; al correr,
                se pueden evaporar <strong>más de 1 L/h</strong>. Tenemos <span className="tag">3–10 millones</span> de glándulas
                sudoríparas.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫁</span> La respiración (eq. 6.70)
            </div>
            <div className="card-body">
              <p>
                {"Inspiramos aire frío y seco; exhalamos aire caliente y saturado. Dos términos: calentar el aire inspirado y evaporar agua en los pulmones (con "}
                <span className="tag">{"\\(c_{p,\\text{air}} = 2{,}4\\times 10^{-4}\\text{ kcal/g-°C}\\)"}</span>
                {" y "}<span className="tag">{"\\(H_{\\text{evap}} = 0{,}54\\text{ kcal/g}\\)"}</span>{")."}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🥵</span> El índice de calor
            </div>
            <div className="card-body">
              <p>
                A 32 °C se <em>siente</em> 35 °C con 50 % de humedad, 43 °C con 75 % y <span className="tag">56 °C con 100 %</span>:
                la humedad frena la evaporación. A partir de ≈ <span className="tag">35 °C de bulbo húmedo</span> el cuerpo ya no se
                puede enfriar solo evaporando. Advertencias: precaución 27–32 °C, peligro extremo &gt; 54 °C.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-20">
              El sudor es la «válvula de escape» de mayor capacidad: 12 mL/min durante ejercicio intenso. La humedad relativa es el
              enemigo: a 100 % de HR la evaporación se detiene y el cuerpo hierve por dentro. Mueve la humedad en el canvas.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-sweat" className="sim" />
            <div className="prof-controls">
              <span className="badge">evaporación</span>
              <label>
                humedad{' '}
                <input
                  type="range"
                  id="sw_h"
                  min="0"
                  max="100"
                  step="5"
                  defaultValue={params.sw_h}
                  onChange={(e) => {
                    engine.setParam('sw_h', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="sw_hv">{params.sw_h} %</span>
              </label>
              <button
                type="button"
                id="sw_play"
                onClick={() => {
                  const nextPlaying = !flags.swPlaying;
                  engine.setFlag('swPlaying', nextPlaying);
                  if (nextPlaying) flags.swT = 0;
                  engine.requestDraw();
                }}
              >
                {flags.swPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="sw_out">
                32 °C + 50 % HR → se siente 35 °C
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
