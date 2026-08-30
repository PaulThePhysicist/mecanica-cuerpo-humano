import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide5({ engine }: SlideProps) {
  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 2</span>
        <span className="mtitle">Teoría de control (tema avanzado)</span>
        <span className="msub">{"\\(dp/dt = -g\\,p(t-\\tau_d)\\)"}</span>
        <span className="mslide-count">5 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚙️</span> Retroalimentación con retardo
            </div>
            <div className="card-body">
              <p>Para mantener {"\\(P\\)"} cerca de {"\\(P_0\\)"} con ganancia {"\\(g\\)"}:</p>
              <div className="eq-block">
                <span className="eqno">(13.1)</span>
                {"\\[ dP = -g(P-P_0)\\,dt \\]"}
              </div>
              <p>
                No es instantánea: hay un retardo {"\\(\\tau_d\\)"} (detección, transmisión, procesamiento, respuesta). Con{" "}
                {"\\(p=P-P_0\\)"}:
              </p>
              <div className="eq-block">
                <span className="eqno">(13.3)</span>
                {"\\[ \\frac{dp(t)}{dt} = -g\\,p(t-\\tau_d) \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌀</span> Solución con {"\\(p(t)=p\\,e^{zt}\\)"}
            </div>
            <div className="card-body">
              <p>
                Con {"\\(z=x+iy\\)"}: {"\\(x<0\\)"} decae (estable), {"\\(x>0\\)"} diverge (inestable), {"\\(y\\neq 0\\)"} oscila:
              </p>
              <div className="eq-block">
                <span className="eqno">(13.4)</span>
                {"\\[ z = -g\\,e^{-z\\tau_d} \\]"}
              </div>
              <p>Oscilación pura ({"\\(x=0\\)"}): {"\\(g\\tau_d=\\pi/2\\)"}. Para {"\\(x\\)"} pequeño:</p>
              <div className="eq-block">
                <span className="eqno">(13.8)</span>
                {"\\[ x \\approx \\frac{1}{\\tau_d}\\!\\left(1-\\frac{\\pi}{2g\\tau_d}\\right) \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-5">
              El retardo {"\\(\\tau_d\\)"} es el enemigo de la estabilidad: cuanto mayor la ganancia deseada, más fácil cruzar el
              límite {"\\(\\pi/2\\)"}. La siguiente slide dibuja la dinámica en tiempo real.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-ec" />
            <div className="prof-controls">
              <span className="badge">criterio</span>
              <span className="readout" id="ec_out">
                g·τd = π/2 · límite de estabilidad
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
