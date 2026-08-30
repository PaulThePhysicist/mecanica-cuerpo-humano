import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide17({ engine }: SlideProps) {
  const iVal = engine?.paramsRef.current.pu_i ?? 200;
  const tau = engine?.paramsRef.current.pu_t ?? 280;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 7</span>
        <span className="mtitle">La pupila: un lazo con latencia</span>
        <span className="msub">{"\\(\\tau_x\\dot x + x = R(t)\\)"}</span>
        <span className="mslide-count">17 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">👁️</span> Músculos circular y radial
            </div>
            <div className="card-body">
              <p>
                El tamaño pupilar se controla por el constrictor del iris (circular, parasimpático) y el dilatador (radial,
                simpático). El flujo luminoso entrante es {"\\(\\phi = I\\,A\\)"} (iluminancia × área pupilar). En estado
                estacionario, {"\\(I\\uparrow \\to A\\downarrow\\)"}: retroalimentación negativa. Sin embargo, existe un retardo
                de transporte nervioso {"\\(\\tau\\sim 180\\text{–}400\\ \\text{ms}\\)"}.
              </p>
              <div className="eq-block">
                <span className="eqno">(13.37)</span>
                {"\\[ \\tau_x\\,\\frac{dx(t)}{dt} + x(t) = R(t) \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎯</span> El umbral de flujo
            </div>
            <div className="card-body">
              <p>
                {"\\(R(t)\\propto F(u)\\)"} con {"\\(F(u)=u\\)"} si {"\\(u>0\\)"}, {"\\(0\\)"} si {"\\(u\\le 0\\)"}, donde{' '}
                {"\\(u=\\ln(\\phi(t-\\tau)/\\phi_\\text{umbral})\\)"}. No hay respuesta motora si la luz cae por debajo del
                umbral de sensibilidad retiniana.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-17">
              Ajusta la iluminancia I: el área pupilar A responde con un retardo τ. El umbral {"\\(\\phi_\\text{umbral}\\)"} hace que
              luces muy tenues no despierten el reflejo fotomotor.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-pu" />
            <div className="prof-controls">
              <span className="badge">pupila</span>
              <label>
                I{' '}
                <input
                  type="range"
                  id="pu_i"
                  min="1"
                  max="1000"
                  value={iVal}
                  step="10"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('pu_i', v);
                    const span = document.getElementById('pu_iv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="pu_iv">{iVal}</span>
              </label>
              <label>
                τ (ms){' '}
                <input
                  type="range"
                  id="pu_t"
                  min="100"
                  max="500"
                  value={tau}
                  step="10"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('pu_t', v);
                    const span = document.getElementById('pu_tv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="pu_tv">{tau}</span>
              </label>
              <span className="readout" id="pu_out">
                A responde con retardo {tau} ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
