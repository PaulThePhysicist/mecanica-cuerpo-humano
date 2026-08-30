import React from 'react';

import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide0({
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

        {onBack && (
          <button onClick={onBack} style={{ position: "absolute", top: "1.2rem", left: "1.6rem", background: "var(--card)", border: "1px solid var(--line)", padding: "0.45rem 1rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "var(--ink-2)", zIndex: 10 }}>
            ← Volver al Índice
          </button>
        )}
<h1>
    <span className="chapno">Capítulo 9</span>
    Los pulmones y la respiración
  </h1>
  <p className="subtitle">Cómo una máquina de ~6 L de aire por minuto y un área de 80 m² de alvéolos oxigenan cada célula: la estructura del árbol bronquial, la física de los alvéolos y la tensión superficial, la mecánica de la inspiración y la espiración, los volúmenes pulmonares y su histéresis, el flujo de aire y el modelo mecánico, el ciclo respiratorio, el pulmón enfermo, la hipoxia de las grandes alturas y el trabajo necesario para respirar.</p>
  <div className="rule"></div>
  <div className="module-preview" id="modulePreview">
    <span className="mpill" onClick={() => goModule(1)}><span className="ico">🌳</span> Estructura</span>
    <span className="mpill" onClick={() => goModule(2)}><span className="ico">🫧</span> Los alvéolos</span>
    <span className="mpill" onClick={() => goModule(3)}><span className="ico">🫁</span> Física de la respiración</span>
    <span className="mpill" onClick={() => goModule(4)}><span className="ico">📏</span> Volúmenes pulmonares</span>
    <span className="mpill" onClick={() => goModule(5)}><span className="ico">🌬️</span> Flujo de aire</span>
    <span className="mpill" onClick={() => goModule(6)}><span className="ico">🔁</span> El ciclo respiratorio</span>
    <span className="mpill" onClick={() => goModule(7)}><span className="ico">🚑</span> Pulmón enfermo</span>
    <span className="mpill" onClick={() => goModule(8)}><span className="ico">🏔️</span> Altitud</span>
    <span className="mpill" onClick={() => goModule(9)}><span className="ico">⚡</span> Trabajo de la respiración</span>
  </div>
  <button className="start-btn" onClick={() => goModule(1)}>Comenzar la cátedra →</button>
  <p className="book-ref">Physics of the Human Body — Irving P. Herman · Springer (2016)</p>
    </>
  );
}
