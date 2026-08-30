import React from 'react';
import type { Engine } from './useEngine';

export default function Slide0({ engine, onBack }: { engine: Engine; onBack?: () => void }) {
  return (
    <div className="slide-full active" data-slide="0" data-module="0">
      <h1>
        <span className="chapno">Capítulo 5</span>
        Músculos
      </h1>
      <p className="subtitle">
        Los motores del cuerpo: cómo el músculo convierte un estímulo eléctrico en fuerza, tensión y movimiento. Tipos y
        arquitectura muscular, la sacudida y el tétanos, los modelos mecánicos activo y pasivo, la curva de fuerza-velocidad
        de Hill, los filamentos deslizantes y los puentes cruzados, la titina, la coordinación y la fatiga — de la escala
        macroscópica a la nanoscópica.
      </p>
      <div className="rule" />
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => engine.goModule(1)}>
          <span className="ico">🦾</span> Motores
        </span>
        <span className="mpill" onClick={() => engine.goModule(2)}>
          <span className="ico">⚡</span> Activación
        </span>
        <span className="mpill" onClick={() => engine.goModule(3)}>
          <span className="ico">🧩</span> Modelo activo
        </span>
        <span className="mpill" onClick={() => engine.goModule(4)}>
          <span className="ico">🎯</span> Longitud
        </span>
        <span className="mpill" onClick={() => engine.goModule(5)}>
          <span className="ico">📉</span> Hill
        </span>
        <span className="mpill" onClick={() => engine.goModule(6)}>
          <span className="ico">🔬</span> Nanoscopía
        </span>
        <span className="mpill" onClick={() => engine.goModule(7)}>
          <span className="ico">🪜</span> Titina · Coord.
        </span>
        <span className="mpill" onClick={() => engine.goModule(8)}>
          <span className="ico">🥵</span> Fuerza · Fatiga
        </span>
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
        <button type="button" className="start-btn" onClick={() => engine.goModule(1)}>
          Comenzar la cátedra →
        </button>
      </div>
      <p className="book-ref">Physics of the Human Body — Irving P. Herman · Springer (2016)</p>
    </div>
  );
}
