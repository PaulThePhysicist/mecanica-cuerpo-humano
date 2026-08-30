import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide14({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;
  const [isPlaying, setIsPlaying] = useState(flags.brPlaying);

  const togglePlay = () => {
    flags.brPlaying = !flags.brPlaying;
    if (flags.brPlaying) flags.brT = 0;
    setIsPlaying(flags.brPlaying);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="14" data-module="6">
      <div className="module-header">
        <span className="mnum">5.8</span>
        <span className="mtitle">Los puentes cruzados: perspectiva nanoscópica</span>
        <span className="msub">De 30 N/cm² a 3 pN por puente</span>
        <span className="mslide-count">14 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔢</span> El conteo
            </div>
            <div className="card-body">
              <p>
                Cada músculo tiene <span className="tag">10⁴–10⁶ fibras</span>, de ≈ <span className="tag">50 μm</span> de
                diámetro → ≈ {"\\(4\\times10^4\\)"} fibras/cm². Cada fibra: ≈ <span className="tag">2000 miofibrillas</span>
                , con ≈ <span className="tag">1500 filamentos gruesos</span> (miosina) y <span className="tag">3000 delgados</span>{' '}
                (actina) por miofibrilla; cada filamento grueso tiene <span className="tag">200 miosinas</span>.
              </p>
              <div className="eq-block">
                {"\\[ (4\\times10^4)\\,(2000)\\,(1500)\\,(200) \\simeq 1\\times10^{13}\\ \\text{miosinas/cm}^2 \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚖️</span> La fuerza por puente cruzado
            </div>
            <div className="card-body">
              <div className="eq-block">
                {"\\[ \\sim \\frac{30\\ \\text{N/cm}^2}{1\\times10^{13}\\ \\text{miosinas/cm}^2} \\sim 3\\times10^{-12}\\ \\text{N} = 3\\ \\text{pN} \\qquad\\text{(5.25)} \\]"}
              </div>
              <p>
                Medición directa con <strong>pinzas ópticas</strong> (trampas láser): <span className="tag">3–4 pN</span>{' '}
                por puente y un golpe de fuerza de <span className="tag">11 nm</span> por cada hidrólisis de ATP.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚗</span> Proteínas motoras
            </div>
            <div className="card-body">
              <p>
                La <strong>miosina</strong> mueve los músculos; la <strong>cinesina</strong> y la <strong>dineína</strong>{' '}
                transportan carga sobre microtúbulos (cinesina: centro → periferia; dineína: periferia → centro). El
                movimiento <strong>dirigido</strong> supera a la difusión ({"\\(x\\sim\\sqrt{2Dt}\\)"}): direccional y
                mucho más rápido.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-14">
              La magia del orden de magnitud: billones de motores moleculares en paralelo suman su fuerza de 3 pN hasta 30
              N/cm². Cada filamento grueso (200 miosinas) tira con ~600 pN; el «tira y afloja» de todos los sarcómeros en
              paralelo hace el resto. Pulsa ▶ y mira un ciclo de golpe de fuerza.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-bridge" />
            <div className="prof-controls">
              <span className="badge">nanoscopía</span>
              <button id="br_play" type="button" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="br_out">
                3 pN · golpe 11 nm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
