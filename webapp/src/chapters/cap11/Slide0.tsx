import React from 'react';
import type { Engine } from './useEngine';

export default function Slide0({ engine, onBack }: { engine: Engine; onBack?: () => void }) {
  return (
    <div className="slide-full active" data-slide="0" data-module="0">
      <h1>
        <span className="chapno">Capítulo 11</span>
        Luz, ojos y visión
      </h1>
      <p className="subtitle">
        De la córnea que enfoca la luz al color que descifra la retina: cómo el ojo convierte fotones en visión. La
        anatomía del globo y de la retina (bastones y conos), la óptica geométrica (lentes, vergencias, Snell,
        superficies), el ojo como lente (poder dióptrico, acomodación y presbicia), la agudeza (difracción, aberraciones,
        Snellen), la visión imperfecta y su corrección (miopía, hipermetropía, astigmatismo), la percepción de la luz y el
        color (fotometría, CIE, adaptación a la oscuridad), el deterioro visual y cómo ven otros animales.
      </p>
      <div className="rule" />
      <div className="module-preview" id="modulePreview">
        <span className="mpill" onClick={() => engine.goModule(1)}>
          <span className="ico">🧿</span> Estructura del ojo
        </span>
        <span className="mpill" onClick={() => engine.goModule(2)}>
          <span className="ico">🔭</span> Óptica geométrica
        </span>
        <span className="mpill" onClick={() => engine.goModule(3)}>
          <span className="ico">💠</span> Superficies y lentes
        </span>
        <span className="mpill" onClick={() => engine.goModule(4)}>
          <span className="ico">👁️</span> El ojo como lente
        </span>
        <span className="mpill" onClick={() => engine.goModule(5)}>
          <span className="ico">🎯</span> Agudeza visual
        </span>
        <span className="mpill" onClick={() => engine.goModule(6)}>
          <span className="ico">👓</span> Visión y corrección
        </span>
        <span className="mpill" onClick={() => engine.goModule(7)}>
          <span className="ico">🌓</span> Luz y color
        </span>
        <span className="mpill" onClick={() => engine.goModule(8)}>
          <span className="ico">🩺</span> Deterioro visual
        </span>
        <span className="mpill" onClick={() => engine.goModule(9)}>
          <span className="ico">🐾</span> Otros animales
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
