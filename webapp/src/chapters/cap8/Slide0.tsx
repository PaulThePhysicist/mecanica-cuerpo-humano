import React from 'react';
import type { Engine } from './useEngine';

export default function Slide0({
  goModule,
  onBack,
}: {
  isActive?: boolean;
  engine?: Engine;
  go?: (n: number) => void;
  goModule: (m: number) => void;
  next?: () => void;
  prev?: () => void;
  onBack?: () => void;
}) {
  return (
    <>
      <h1>
        <span className="chapno">Capítulo 8</span>
        Sistema Cardiovascular
      </h1>
      <p className="subtitle">
        Cómo una doble bomba de ~5 L/min mantiene vivo al cuerpo: el gasto cardíaco y las presiones arteriales, el efecto de la gravedad, la hemodinámica del flujo por los vasos, la tensión que soporta la pared, el trabajo del corazón, las leyes físicas de la obstrucción, el aneurisma y la estenosis, los modelos de la circulación y del pulso, y cómo todo cambia con el ejercicio y la enfermedad.
      </p>
      <div className="rule"></div>
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => goModule(1)}><span className="ico">🫀</span> La bomba</span>
        <span className="mpill" onClick={() => goModule(2)}><span className="ico">🌍</span> Gravedad</span>
        <span className="mpill" onClick={() => goModule(3)}><span className="ico">🌊</span> Hemodinámica</span>
        <span className="mpill" onClick={() => goModule(4)}><span className="ico">🎈</span> Pared y capilar</span>
        <span className="mpill" onClick={() => goModule(5)}><span className="ico">⚡</span> Trabajo del corazón</span>
        <span className="mpill" onClick={() => goModule(6)}><span className="ico">🚑</span> Vasos enfermos</span>
        <span className="mpill" onClick={() => goModule(7)}><span className="ico">🧮</span> Modelos</span>
        <span className="mpill" onClick={() => goModule(8)}><span className="ico">📈</span> Pulso y Windkessel</span>
        <span className="mpill" onClick={() => goModule(9)}><span className="ico">🏃</span> Ejercicio y disfunción</span>
      </div>
      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.9rem', flexWrap: 'wrap' }}>
        {onBack && (
          <button
            type="button"
            className="start-btn"
            onClick={onBack}
            style={{
              background: 'var(--card, #fbf8f0)',
              color: 'var(--ink-2, #43505c)',
              borderColor: 'var(--line, #cfc3a9)',
              boxShadow: '0 1px 3px rgba(35,44,54,0.08)',
            }}
          >
            ← Volver al Índice
          </button>
        )}
        <button className="start-btn" onClick={() => goModule(1)}>
          Comenzar la cátedra →
        </button>
      </div>
      <p className="book-ref">Physics of the Human Body — Irving P. Herman · Springer (2016)</p>
    </>
  );
}
