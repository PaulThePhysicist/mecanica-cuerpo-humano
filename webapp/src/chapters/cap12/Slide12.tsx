import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide12({
  engine,
  go,
  goModule,
  next,
  prev,
  toggleAction,
  toggleEinhoven,
  toggleECG,
  toggleMyo,
  toggleEEG,
}: {
  isActive?: boolean;
  engine: Engine;
  go?: (n: number) => void;
  goModule: (m: number) => void;
  next?: () => void;
  prev?: () => void;
  toggleAction?: () => void;
  toggleEinhoven?: () => void;
  toggleECG?: () => void;
  toggleMyo?: () => void;
  toggleEEG?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">12 · 4</span>
    <span className="mtitle">Dispersión pasiva del potencial graduado</span>
    <span className="msub">{"\\(V(x) = V_i + V_0\\,e^{-x/\\lambda}\\)"}</span>
    <span className="mslide-count">12 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🌊</span> Por debajo del umbral todo decae</div>
        <div className="card-body">
          <p>Un potencial graduado (&lt; −55 mV) se atenúa en el espacio y en el tiempo. Sin capacitancia (cable infinito), la solución es exponencial con longitud característica λ (12.79–12.81):</p>
          <div className="eq-block"><span className="eqno">(12.80)</span>{"\\[ V(x) = V_i + V_0\\,e^{-x/\\lambda}\\quad (x>0) \\]"}</div>
          <p>Sin resistencia del axoplasma (solo membrana + capacitancia), decae con tiempo característico τ (12.82–12.83):</p>
          <div className="eq-block"><span className="eqno">(12.83)</span>{"\\[ V(t) = V_i + V_0\\,e^{-t/\\tau} \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🌫️</span> Caso general: difusión</div>
        <div className="card-body">
          <p>Con resistencia y capacitancia, la perturbación obedece la <strong>ecuación de difusión</strong> (12.84–12.87): se ensancha como gaussiana en {"\\(\\sqrt{Dt}\\)"} y se apaga globalmente con {"\\(e^{-t/\\tau}\\)"}:</p>
          <div className="eq-block"><span className="eqno">(12.86–12.87)</span>{"\\[ V(x,t) - V_i \\propto \\exp\\!\\left(-\\frac{x^2}{2D_\\mathrm{diff}t}\\right)\\exp(-t/\\tau),\\qquad D_\\mathrm{diff} = \\frac{\\lambda^2}{\\tau} \\]"}</div>
          <p>El parámetro λ (= √(abρm/2ρi)) es lo que «mide» qué tan lejos llega el susurro sin regenerarse.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-12">Avanza el tiempo t: el pico inicial se ensancha (difusión) y se hunde (exp(−t/τ)). Sube λ y la perturbación «escucha» más lejos. Por eso el cable pasivo no basta: se necesita regeneración.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-dp" className="sim" />
        <div className="prof-controls">
          <span className="badge">decaimiento</span>
          <label>t (ms) <input type="range" id="dp_t" min="0.2" max="10" defaultValue="1" step="0.1" onChange={(e) => engine.setParam('dp_t' as any, parseFloat(e.target.value))} /> <span id="dp_tv">1,0 ms</span></label>
          <label>λ <input type="range" id="dp_l" min="0.5" max="3" defaultValue="1" step="0.1" onChange={(e) => engine.setParam('dp_l' as any, parseFloat(e.target.value))} /> <span id="dp_lv">1,0 λ₀</span></label>
          <span className="readout" id="dp_out">t = 1 ms · pico caído a 0,37</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
