import React from 'react';
import type { Engine } from './useEngine';

export default function Slide0({ engine, onBack }: { engine: Engine; onBack?: () => void }) {
  return (
    <div className="slide-full active" data-slide="0" data-module="0">
      <h1>
        <span className="chapno">Capítulo 3</span>
        El <span className="vol">Movimiento</span>
      </h1>
      <p className="subtitle">
        Del reposo al movimiento: caminar, correr, saltar, lanzar, golpear, chocar y volar. Aplicamos la cinemática, la
        energía, la elasticidad y las colisiones — y vemos que cada destreza tiene su física (y su número) dentro del cuerpo
        humano.
      </p>
      <div className="rule" />
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => engine.goModule(1)}>
          <span className="ico">🧍</span> Bipedestación
        </span>
        <span className="mpill" onClick={() => engine.goModule(2)}>
          <span className="ico">🚶</span> Marcha
        </span>
        <span className="mpill" onClick={() => engine.goModule(3)}>
          <span className="ico">🏃</span> Carrera
        </span>
        <span className="mpill" onClick={() => engine.goModule(4)}>
          <span className="ico">🦘</span> Salto
        </span>
        <span className="mpill" onClick={() => engine.goModule(5)}>
          <span className="ico">⚾</span> Lanzar
        </span>
        <span className="mpill" onClick={() => engine.goModule(6)}>
          <span className="ico">🏌️</span> Bateo
        </span>
        <span className="mpill" onClick={() => engine.goModule(7)}>
          <span className="ico">💥</span> Colisiones
        </span>
        <span className="mpill" onClick={() => engine.goModule(8)}>
          <span className="ico">🎾</span> Vuelo
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
