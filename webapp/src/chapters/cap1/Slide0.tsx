import React from 'react';

export default function Slide0({ goModule, onBack }: { goModule?: (m: number) => void; onBack?: () => void }) {
  return (
    <>
      <h1>
        <span className="chapno">Capítulo 1</span>
        Terminología, el Humano <span className="vol">Estándar</span> y el Escalado
      </h1>
      <p className="subtitle">
        Un sistema de coordenadas para el cuerpo, los grados de libertad de sus articulaciones, los datos antropométricos del hombre de referencia y las leyes de escala que gobiernan desde el ratón hasta el elefante.
      </p>
      <div className="rule"></div>
      <div className="module-preview">
        <button className="mpill" onClick={() => goModule?.(1)}>
          <span className="ico">🧭</span> A · Terminología
        </button>
        <button className="mpill" onClick={() => goModule?.(2)}>
          <span className="ico">🦾</span> B · Movimiento
        </button>
        <button className="mpill" onClick={() => goModule?.(3)}>
          <span className="ico">📐</span> C · Humano Estándar
        </button>
        <button className="mpill" onClick={() => goModule?.(4)}>
          <span className="ico">📈</span> D · Escalamiento
        </button>
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
        <button className="start-btn" onClick={() => goModule?.(1)}>
          Comenzar la cátedra →
        </button>
      </div>
      <p className="book-ref">Physics of the Human Body — Irving P. Herman · Springer (2016)</p>
    </>
  );
}
