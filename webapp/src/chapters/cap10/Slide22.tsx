import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide22({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="22" data-module="9">
      <div className="module-header">
        <span className="mnum">10 · 8</span>
        <span className="mtitle">El efecto Doppler en diagnóstico</span>
        <span className="msub">{"\\(v = \\dfrac{\\delta f\\ v_s}{2 f \\cos\\theta}\\)"}</span>
        <span className="mslide-count">22 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🩻</span> Medir el flujo con ultrasonido
            </div>
            <div className="card-body">
              <p>
                Un haz ultrasónico de frecuencia {"\\(f\\)"} rebota en los glóbulos rojos en movimiento. El
                desplazamiento Doppler {"\\(\\delta f\\)"} es proporcional a la velocidad del flujo {"\\(v\\)"}, a la
                velocidad del sonido {"\\(v_s\\)"} y al coseno del ángulo {"\\(\\theta\\)"}:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.66)</span>
                {"\\[ v = \\frac{\\delta f\\ v_s}{2\\, f \\cos\\theta} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📐</span> Cuándo el ángulo importa
            </div>
            <div className="card-body">
              <p>
                Si el haz es perpendicular al vaso ({"\\(\\theta=90^\\circ\\)"}), {"\\(\\cos\\theta=0\\)"} y no se
                detecta flujo. Los ecógrafos corrigen el ángulo automáticamente. La fórmula también rige para el
                radar y para la astronomía… y para el oído de un murciélago.
              </p>
              <div className="eq-block">
                {"\\[ f' = f\\, \\frac{v_s}{v_s \\pm v_\\mathrm{fuente}} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-22">
              ▶ anima los glóbulos rojos: la frecuencia del eco sube cuando el flujo se acerca y baja cuando se aleja.
              Aumenta el ángulo y el desplazamiento cae: a 90° el Doppler se anula.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-doppler" className="sim" />
            <div className="prof-controls">
              <span className="badge">Doppler</span>
              <button id="do_play" type="button" onClick={() => engine.toggleDoppler()}>
                {flags.doPlaying ? '⏸' : '▶'}
              </button>
              <label>
                Velocidad flujo{' '}
                <input
                  type="range"
                  id="do_u"
                  min="5"
                  max="200"
                  defaultValue={params.do_u}
                  step="5"
                  onChange={(e) => {
                    engine.setParam('do_u', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="do_uv">80 cm/s</span>
              </label>
              <label>
                Ángulo{' '}
                <input
                  type="range"
                  id="do_th"
                  min="0"
                  max="80"
                  defaultValue={params.do_th}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('do_th', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="do_tv">45°</span>
              </label>
              <span className="readout" id="do_out">
                δf = 1240 Hz @ 8 MHz · θ=45°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
