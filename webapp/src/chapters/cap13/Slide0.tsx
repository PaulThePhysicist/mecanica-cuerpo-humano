import React from 'react';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
  go?: (n: number) => void;
  goModule?: (m: number) => void;
  next?: () => void;
  prev?: () => void;
  onBack?: () => void;
}

export default function Slide0({ goModule, onBack }: SlideProps) {
  return (
    <>
      <h1>
        <span className="chapno">Capítulo 13</span>
        Sistemas de <span className="vol">Retroalimentación y Control</span>
      </h1>
      <p className="subtitle">
        Cómo el cuerpo se mantiene a sí mismo. De la homeostasis del líquido extracelular a la teoría de control con retardo
        (el criterio de estabilidad {"\\(g\\tau_d \\le \\pi/2\\)"}), pasando por la regulación de la temperatura corporal (bucle abierto vs
        cerrado), la presión arterial (barorreceptores del seno carotídeo), el ejercicio y el reflejo de la pupila (un oscilador
        con latencia). Con modelos analíticos y simulaciones interactivas en tiempo real.
      </p>
      <div className="rule"></div>
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => goModule && goModule(1)}>
          <span className="ico">🔁</span> Control y retroalimentación
        </span>
        <span className="mpill" onClick={() => goModule && goModule(2)}>
          <span className="ico">🌡️</span> Regulación térmica
        </span>
        <span className="mpill" onClick={() => goModule && goModule(3)}>
          <span className="ico">🩺</span> Temperatura en reposo
        </span>
        <span className="mpill" onClick={() => goModule && goModule(4)}>
          <span className="ico">💧</span> Sudoración y bucle cerrado
        </span>
        <span className="mpill" onClick={() => goModule && goModule(5)}>
          <span className="ico">❤️</span> Presión arterial
        </span>
        <span className="mpill" onClick={() => goModule && goModule(6)}>
          <span className="ico">🏃</span> Ejercicio
        </span>
        <span className="mpill" onClick={() => goModule && goModule(7)}>
          <span className="ico">👁️</span> La pupila
        </span>
        <span className="mpill" onClick={() => goModule && goModule(8)}>
          <span className="ico">🧮</span> Modelos y problemas
        </span>
        <span className="mpill" onClick={() => goModule && goModule(9)}>
          <span className="ico">🧾</span> Resumen
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
        <button className="start-btn" onClick={() => goModule && goModule(1)}>
          Comenzar la cátedra →
        </button>
      </div>
      <p className="book-ref">Physics of the Human Body — Irving P. Herman · Springer (2016)</p>
    </>
  );
}
