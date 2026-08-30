import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide11({
  isActive,
  engine,
  go,
  goModule,
  next,
  prev,
  toggleBubbles,
  toggleBreath,
  toggleSpiro,
  toggleCycle,
  togglePVLoop,
  onBack,
}: {
  isActive: boolean;
  engine: Engine;
  go: (n: number) => void;
  goModule: (m: number) => void;
  next: () => void;
  prev: () => void;
  toggleBubbles?: () => void;
  toggleBreath?: () => void;
  toggleSpiro?: () => void;
  toggleCycle?: () => void;
  togglePVLoop?: () => void;
  onBack?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">9.4</span>
    <span className="mtitle">Espacio muerto, aire viciado y mezcla</span>
    <span className="msub">α = 1/3 · β = 1/4 → aire viciado: 16,5 % O₂ / 3,5 % CO₂</span>
    <span className="mslide-count">11 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🌀</span> El aire viciado (ec. 9.9–9.10)</div>
        <div className="card-body">
          <p>Inspiramos 80 % N₂ / 20 % O₂ / 0 % CO₂ y espiramos 80/16/4. Si el viciado es 80/x/y, con {"\\( \\alpha = V_T/V_{\\text{total}} \\)"} y {"\\( \\beta \\)"} la fracción de O₂ absorbida:</p>
          <div className="eq-block"><span className="eqno">(9.9)</span>{"\\[ 16\\% = \\big[20\\alpha - 20\\alpha\\beta + (1-\\alpha)x\\big]\\% \\]"}</div>
          <div className="eq-block"><span className="eqno">(9.10)</span>{"\\[ 4\\% = \\big[20\\alpha\\beta + (1-\\alpha)y\\big]\\% \\]"}</div>
          <p>Con {"\\( \\alpha = 1/3 \\)"} y {"\\( \\beta = 1/4 \\)"}: {"\\( x = 16{,}5 \\)"} e {"\\( y = 3{,}5 \\)"} → el viciado es 80 / 16,5 / 3,5. Sigue teniendo O₂ suficiente para el boca a boca.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🫁</span> Ventilación alveolar</div>
        <div className="card-body">
          <p>Del {"\\( V_T \\)"} solo {"\\( V_T - V_d \\)"} llega a los alvéolos: {"\\( V_a = R(V_T - V_d) \\)"}, con el espacio muerto anatómico {"\\( V_d = 0{,}15\\ \\text{L} \\)"}. La ventilación pulmonar es {"\\( V_p = R\\,V_T \\)"}.</p>
          <table className="data-mini">
            <tr><th>Tabla 9.3</th><th>R (/min)</th><th>V_T (L)</th></tr>
            <tr><td>(i) Reposo, tranquila</td><td>12</td><td>0,5</td></tr>
            <tr><td>(ii) Rápida y superficial</td><td>24</td><td>0,25</td></tr>
            <tr><td>(iii) Muy rápida</td><td>40</td><td>0,15</td></tr>
            <tr><td>(iv) Lenta y profunda</td><td>6</td><td>1,0</td></tr>
            <tr><td>(v) Ejercicio, rápida</td><td>24</td><td>0,5</td></tr>
            <tr><td>(vi) Ejercicio, profunda</td><td>12</td><td>1,0</td></tr>
          </table>
          <p className="table-caption">Patrones del Prob. 9.12: el (iii) es desaconsejable por mala ventilación alveolar.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">💬</span> El boca a boca funciona</div>
        <div className="card-body">
          <p>El aire viciado conserva 16,5 % de O₂: «claramente lo suficientemente oxigenado para ser útil durante la reanimación boca a boca».</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-11">Resuelve el rompecabezas con los dos sliders: α es cuánto aire nuevo entra en los pulmones (fracción del volumen) y β cuánto O₂ se absorbe. Con los valores del libro (α = 1/3, β = 1/4) la solución es 16,5 % O₂ y 3,5 % CO₂. La mezcla es un balance de masas, no magia.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-mix" />
        <div className="prof-controls">
          <span className="badge">mezcla</span>
          <label>α <input type="range" id="mx_alpha" min="20" max="50" step="5" defaultValue="33" onInput={(e) => { engine.setParam("mx_alpha" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="mx_alphav">1/3</span></label>
          <label>β <input type="range" id="mx_beta" min="10" max="40" step="5" defaultValue="25" onInput={(e) => { engine.setParam("mx_beta" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="mx_betav">1/4</span></label>
          <span className="readout" id="mx_out">viciado: O₂ 16,5 % · CO₂ 3,5 %</span>
        </div>
      </div>
    </div>
  </div>

{/* ═══════════ M5 · FLUJO DE AIRE ═══════════ */}
    </>
  );
}
