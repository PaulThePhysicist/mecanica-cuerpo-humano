import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide18({ engine }: SlideProps) {
  const n = engine?.paramsRef.current.ax_n ?? 3.0;
  const th = engine?.paramsRef.current.ax_th ?? 1.0;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 7</span>
        <span className="mtitle">La curva del área pupilar A(x)</span>
        <span className="msub">{"\\(A(x)=A_0+A_1\\,\\theta^n/(x^n+\\theta^n)\\)"}</span>
        <span className="mslide-count">18 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📐</span> Una curva tipo Hill
            </div>
            <div className="card-body">
              <p>
                El área pupilar decrece no linealmente con la actividad muscular constrictora {"\\(x\\)"}:
              </p>
              <div className="eq-block">
                <span className="eqno">(13.38)</span>
                {"\\[ A(x) = A_0 + A_1\\,\\frac{\\theta^n}{x^n+\\theta^n} \\]"}
              </div>
              <p>
                {"\\(A_0\\)"} = área mínima (~2 mm², constricción máxima), {"\\(A_0+A_1\\)"} = área máxima (~9 mm², dilatación
                plena); {"\\(\\theta\\)"} y {"\\(n\\)"} son parámetros biométricos individuales.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎚️</span> El exponente n
            </div>
            <div className="card-body">
              <p>
                El exponente {"\\(n\\)"} modula la cooperatividad: {"\\(n\\)"} grande produce una respuesta cuasi-digital (tipo
                interruptor on/off); {"\\(n\\)"} pequeño da una variación progresiva y suave. {"\\(\\theta\\)"} marca el punto de
                semisaturación.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-18">
              Juega con n y θ: la curva A(x) pasa de suave a tipo interruptor. Así el ojo acomoda el rango dinámico gigantesco de
              iluminancias del mundo real (de 10⁻⁴ lx a 10⁵ lx) comprimiéndolo en un área fotosensible útil.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-ax" />
            <div className="prof-controls">
              <span className="badge">A(x)</span>
              <label>
                n{' '}
                <input
                  type="range"
                  id="ax_n"
                  min="0.5"
                  max="8"
                  value={n}
                  step="0.1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('ax_n', v);
                    const span = document.getElementById('ax_nv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="ax_nv">{n.toFixed(1).replace('.', ',')}</span>
              </label>
              <label>
                θ{' '}
                <input
                  type="range"
                  id="ax_th"
                  min="0.2"
                  max="2"
                  value={th}
                  step="0.1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('ax_th', v);
                    const span = document.getElementById('ax_thv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="ax_thv">{th.toFixed(1).replace('.', ',')}</span>
              </label>
              <span className="readout" id="ax_out">
                curva tipo Hill · n={n.toFixed(1).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
