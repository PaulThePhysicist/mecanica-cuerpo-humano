import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useEngine, EngineContext } from './useEngine';
import './cap3.css';
import { MODULES, TOTAL } from './sims';
// @ts-ignore - katex auto-render no incluye tipos
import renderMathInElement from 'katex/contrib/auto-render';

import Slide0 from './Slide0';
import Slide1 from './Slide1';
import Slide2 from './Slide2';
import Slide3 from './Slide3';
import Slide4 from './Slide4';
import Slide5 from './Slide5';
import Slide6 from './Slide6';
import Slide7 from './Slide7';
import Slide8 from './Slide8';
import Slide9 from './Slide9';
import Slide10 from './Slide10';
import Slide11 from './Slide11';
import Slide12 from './Slide12';
import Slide13 from './Slide13';
import Slide14 from './Slide14';
import Slide15 from './Slide15';
import Slide16 from './Slide16';
import Slide17 from './Slide17';
import Slide18 from './Slide18';

const SLIDES: React.ComponentType<{ engine: ReturnType<typeof useEngine>; onBack?: () => void }>[] = [
  Slide0, Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9,
  Slide10, Slide11, Slide12, Slide13, Slide14, Slide15, Slide16, Slide17, Slide18,
];

export default function Capitulo3({ onBack }: { onBack?: () => void }) {
  const engine = useEngine();
  const { activeSlide, go, next, prev, goModule, requestDraw } = engine;
  const mainRef = useRef<HTMLElement | null>(null);

  // KaTeX acotado a la diapositiva y antes de pintar: sin LaTeX crudo visible
  // ni re-escaneo de todo <body> con setTimeout (AUDITORIA_CAP3 T-11).
  useLayoutEffect(() => {
    if (mainRef.current) {
      renderMathInElement(mainRef.current, {
        delimiters: [
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
        throwOnError: false,
      });
    }
    requestDraw();
  }, [activeSlide, requestDraw]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (/INPUT|SELECT|TEXTAREA/.test(tag)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && tag !== 'BUTTON')) {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        go(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        go(TOTAL - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, go]);

  const ActiveSlideComponent = SLIDES[activeSlide] || Slide0;
  const currentMod = engine.moduleOf(activeSlide);

  return (
    <EngineContext.Provider value={engine}>
      <div className="capitulo-root cap3-root">
        <nav className="module-bar" aria-label="Módulos del capítulo 3">
          <div className="brand-mark">
            <span className="treatise">El cuerpo humano · capítulo 3</span>
            <span className="book">Física del Cuerpo Humano — I. P. Herman</span>
          </div>
          {onBack && (
            <button type="button" className="module-tab module-tab--back" onClick={onBack} title="Volver al índice general de capítulos">
              📚 Índice
            </button>
          )}
          {MODULES.filter((m) => m.id !== 0).map((m) => {
            const active = m.id === currentMod.id;
            return (
              <button
                key={m.id}
                type="button"
                className={`module-tab${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => goModule(m.id)}
              >
                <span className="mod-badge">{m.id}</span>
                {m.ico} {m.name}
              </button>
            );
          })}
        </nav>

        <main className="slides" ref={mainRef} key={activeSlide}>
          <ActiveSlideComponent engine={engine} onBack={onBack} />
        </main>

        <nav className="nav-bar" aria-label="Navegación de diapositivas">
          <button type="button" className="nav-btn" onClick={prev} aria-label="Anterior" title="Diapositiva anterior (←)">
            ‹
          </button>
          <div className="nav-dots">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`nav-dot ${i === activeSlide ? 'active' : ''}`}
                onClick={() => go(i)}
                aria-current={i === activeSlide ? 'step' : undefined}
                aria-label={`Ir a diapositiva ${i + 1}`}
              />
            ))}
          </div>
          <button type="button" className="nav-btn" onClick={next} aria-label="Siguiente" title="Diapositiva siguiente (→)">
            ›
          </button>
          <span className="slide-counter">
            {activeSlide + 1} / {TOTAL}
          </span>
          <span className="nav-module-label">{currentMod.name}</span>
        </nav>
      </div>
    </EngineContext.Provider>
  );
}
