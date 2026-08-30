import React from 'react';
import type { Engine } from './useEngine';

export default function Slide0({ engine, onBack }: { engine: Engine; onBack?: () => void }) {
  return (
    <div className="slide-full active" data-slide="0" data-module="0">
      <h1>
        <span className="chapno">Capítulo 7</span>
        Presión de Fluidos, Flujo de Fluidos en el Cuerpo y Movimiento en Fluidos
      </h1>
      <p className="subtitle">
        Cómo los fluidos sostienen, nutren y mueven el cuerpo: la presión hidrostática y sus leyes, la circulación de la
        sangre y del aire como flujo viscoso (Poiseuille), la elasticidad de los vasos, el arrastre y la sustentación que
        gobiernan la natación y el vuelo, y la difusión que entrega el oxígeno a las células.
      </p>
      <div className="rule" />
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => engine.goModule(1)}>
          <span className="ico">🩸</span> Presión
        </span>
        <span className="mpill" onClick={() => engine.goModule(2)}>
          <span className="ico">⚖️</span> Leyes de fluidos
        </span>
        <span className="mpill" onClick={() => engine.goModule(3)}>
          <span className="ico">🌊</span> Bernoulli
        </span>
        <span className="mpill" onClick={() => engine.goModule(4)}>
          <span className="ico">🧪</span> Poiseuille
        </span>
        <span className="mpill" onClick={() => engine.goModule(5)}>
          <span className="ico">🎈</span> Compliancia
        </span>
        <span className="mpill" onClick={() => engine.goModule(6)}>
          <span className="ico">🪂</span> Arrastre
        </span>
        <span className="mpill" onClick={() => engine.goModule(7)}>
          <span className="ico">🫧</span> Difusión
        </span>
        <span className="mpill" onClick={() => engine.goModule(8)}>
          <span className="ico">🏊</span> Cuerpo en fluidos
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
