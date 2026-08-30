import React from 'react';
import type { Engine } from './useEngine';

export default function Slide0({ engine, onBack }: { engine: Engine; onBack?: () => void }) {
  return (
    <div className="slide-full active" data-slide="0" data-module="0">
      <h1>
        <span className="chapno">Capítulo 10</span>
        Sonido, habla y audición
      </h1>
      <p className="subtitle">
        De la onda sonora que vibra el tímpano a la palabra que articula la laringe: qué produce el sonido en el cuerpo,
        cómo lo filtra la boca y cómo lo lee la cóclea. La onda (v, λ, dB), la impedancia y la reflexión, los
        resonadores (canal auditivo y formantes), la producción del habla con su fuente-filtro y su modelo de dos tubos,
        la energética de la voz, el campo auditivo, la pérdida por edad y ruido, la percepción (fones, mels,
        enmascaramiento), los sonidos del cuerpo y el Doppler.
      </p>
      <div className="rule" />
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => engine.goModule(1)}>
          <span className="ico">🌊</span> Ondas sonoras
        </span>
        <span className="mpill" onClick={() => engine.goModule(2)}>
          <span className="ico">🎵</span> Resonadores
        </span>
        <span className="mpill" onClick={() => engine.goModule(3)}>
          <span className="ico">🗣️</span> El habla
        </span>
        <span className="mpill" onClick={() => engine.goModule(4)}>
          <span className="ico">🧩</span> Modelo de dos tubos
        </span>
        <span className="mpill" onClick={() => engine.goModule(5)}>
          <span className="ico">👂</span> Audición · sensibilidad
        </span>
        <span className="mpill" onClick={() => engine.goModule(6)}>
          <span className="ico">🩺</span> Audición · pérdida
        </span>
        <span className="mpill" onClick={() => engine.goModule(7)}>
          <span className="ico">🧠</span> Audición · percepción
        </span>
        <span className="mpill" onClick={() => engine.goModule(8)}>
          <span className="ico">❤️</span> Vibraciones del cuerpo
        </span>
        <span className="mpill" onClick={() => engine.goModule(9)}>
          <span className="ico">🩻</span> Diagnóstico
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
