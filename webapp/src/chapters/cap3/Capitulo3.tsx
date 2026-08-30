import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useEngine, EngineContext } from './useEngine';
import './cap3.css';
import { MODULES, TOTAL, redrawSlide } from './sims';
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

function renderKatex() {
  renderMathInElement(document.body, {
    delimiters: [
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true },
    ],
    throwOnError: false,
  });
}

const SLIDES: React.ComponentType<{ engine: ReturnType<typeof useEngine>; onBack?: () => void }>[] = [
  Slide0, Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9,
  Slide10, Slide11, Slide12, Slide13, Slide14, Slide15, Slide16, Slide17, Slide18,
];

export default function Capitulo3({ onBack }: { onBack?: () => void }) {
  const engine = useEngine();
  const { activeSlide, go, next, prev, goModule } = engine;
  const [moduleTabsBuilt, setModuleTabsBuilt] = useState(false);

  useEffect(() => {
    renderKatex();
    const id = setTimeout(renderKatex, 400);
    return () => clearTimeout(id);
  }, [activeSlide]);

  useEffect(() => {
    if (moduleTabsBuilt) return;
    const host = document.getElementById('moduleBar');
    if (!host) return;
    MODULES.forEach((m) => {
      if (m.id === 0) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'module-tab';
      b.dataset.module = String(m.id);
      b.innerHTML = `<span class="mod-badge">${m.id}</span>${m.ico} ${m.name}`;
      b.addEventListener('click', () => goModule(m.id));
      host.appendChild(b);
    });
    setModuleTabsBuilt(true);
  }, [moduleTabsBuilt, goModule]);

  useEffect(() => {
    const mod = MODULES.find((m) => m.slides.includes(activeSlide));
    document.querySelectorAll('.module-tab').forEach((tab) => {
      const active = +(tab as HTMLElement).dataset.module! === (mod ? mod.id : 0);
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }, [activeSlide]);

  useLayoutEffect(() => {
    const out = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    redrawSlide(activeSlide, engine.clockRef.current, engine.paramsRef.current, engine.flagsRef.current, out);
  }, [activeSlide, engine]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
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
      <div className="capitulo-root">
        <nav className="module-bar" id="moduleBar">
          <div className="brand-mark">
            <span className="treatise">El cuerpo humano · capítulo 3</span>
            <span className="book">Física del Cuerpo Humano — I. P. Herman</span>
          </div>
          {onBack && (
            <button
              type="button"
              className="module-tab"
              onClick={onBack}
              title="Volver al índice general de capítulos"
              style={{ marginRight: '0.4rem', borderRight: '1px solid var(--line)' }}
            >
              📚 Índice
            </button>
          )}
        </nav>

        <main className="slides">
          <ActiveSlideComponent engine={engine} onBack={onBack} />
        </main>

        <nav className="nav-bar">
          <button type="button" className="nav-btn" onClick={prev} aria-label="Anterior" title="Diapositiva anterior (←)">
            ‹
          </button>
          <div className="nav-dots" id="navDots">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`nav-dot ${i === activeSlide ? 'active' : ''}`}
                onClick={() => go(i)}
                title={`Ir a diapositiva ${i + 1}`}
                aria-label={`Ir a diapositiva ${i + 1}`}
              />
            ))}
          </div>
          <button type="button" className="nav-btn" onClick={next} aria-label="Siguiente" title="Diapositiva siguiente (→)">
            ›
          </button>
          <span className="slide-counter" id="slideCounter">
            {activeSlide + 1} / {TOTAL}
          </span>
          <span className="nav-module-label" id="navModuleLabel">
            {currentMod.name}
          </span>
        </nav>
      </div>
    </EngineContext.Provider>
  );
}
