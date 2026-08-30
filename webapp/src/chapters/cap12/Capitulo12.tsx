import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useEngine, EngineContext } from './useEngine';
import './cap12.css';
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
import Slide19 from './Slide19';
import Slide20 from './Slide20';
import Slide21 from './Slide21';
import Slide22 from './Slide22';
import Slide23 from './Slide23';

function renderKatex() {
  if (typeof document === 'undefined') return;
  renderMathInElement(document.body, {
    delimiters: [
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true },
    ],
    throwOnError: false,
  });
}

const SLIDES = [
  Slide0,
  Slide1,
  Slide2,
  Slide3,
  Slide4,
  Slide5,
  Slide6,
  Slide7,
  Slide8,
  Slide9,
  Slide10,
  Slide11,
  Slide12,
  Slide13,
  Slide14,
  Slide15,
  Slide16,
  Slide17,
  Slide18,
  Slide19,
  Slide20,
  Slide21,
  Slide22,
  Slide23,
];

export default function Capitulo12({ onBack }: { onBack?: () => void }) {
  const engine = useEngine();
  const { activeSlide, go, next, prev, goModule, toggleAction, toggleEinhoven, toggleECG, toggleMyo, toggleEEG } =
    engine;
  const [moduleTabsBuilt, setModuleTabsBuilt] = useState(false);

  // ── KaTeX al montar + al cambiar de slide ──
  useEffect(() => {
    renderKatex();
    const id = setTimeout(renderKatex, 350);
    return () => clearTimeout(id);
  }, [activeSlide]);

  // ── Construir barra de módulos superior ──
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

  // ── Marcar pestaña de módulo activa ──
  useEffect(() => {
    const mod = MODULES.find((m) => m.slides.includes(activeSlide));
    document.querySelectorAll('.module-tab').forEach((tab) => {
      const active = +(tab as HTMLElement).dataset.module! === (mod ? mod.id : 0);
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }, [activeSlide]);

  // ── Teclado ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (/INPUT|SELECT|TEXTAREA/.test(tag)) return;
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
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [next, prev, go]);

  const currentModule = MODULES.find((m) => m.slides.includes(activeSlide)) || MODULES[0];

  // Redibujo síncrono antes del paint
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => engine.requestDraw());
    engine.requestDraw();
    return () => cancelAnimationFrame(id);
  }, [activeSlide, engine]);

  return (
    <EngineContext.Provider value={engine}>
      <nav className="module-bar" id="moduleBar">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              marginRight: '1rem',
              cursor: 'pointer',
              padding: '0.4rem 0.8rem',
              background: 'var(--card, #fbf8f0)',
              border: '1px solid var(--line, #cfc3a9)',
              borderRadius: '6px',
              fontFamily: 'var(--sans, inherit)',
              fontSize: '0.82rem',
              color: 'var(--ink-2, #43505c)',
            }}
          >
            ← Índice
          </button>
        )}
        <div className="brand-mark">
          <span className="treatise">El cuerpo humano · capítulo 12</span>
          <span className="book">Física del Cuerpo Humano — I. P. Herman</span>
        </div>
      </nav>

      {SLIDES.map((Slide, i) => {
        const isCover = i === 0;
        const cls = isCover ? 'slide-full' : 'slide';
        return (
          <div
            key={i}
            className={`${cls} ${activeSlide === i ? 'active' : ''}`}
            data-slide={i}
            data-module={MODULES.find((m) => m.slides.includes(i))?.id ?? 0}
          >
            <Slide
              isActive={activeSlide === i}
              engine={engine}
              go={go}
              goModule={goModule}
              next={next}
              prev={prev}
              toggleAction={toggleAction}
              toggleEinhoven={toggleEinhoven}
              toggleECG={toggleECG}
              toggleMyo={toggleMyo}
              toggleEEG={toggleEEG}
              onBack={onBack}
            />
          </div>
        );
      })}

      <nav className="nav-bar">
        <button type="button" className="nav-btn" onClick={prev} aria-label="Anterior">
          ←
        </button>
        <div className="nav-dots" id="navDots">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`nav-dot ${activeSlide === i ? 'active' : ''}`}
              title={`Diapositiva ${i + 1}`}
              aria-label={`Ir a diapositiva ${i + 1}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="nav-btn" onClick={next} aria-label="Siguiente">
          →
        </button>
        <span className="slide-counter" id="slideCounter">
          {activeSlide + 1} / {TOTAL}
        </span>
        <span className="nav-module-label" id="navModuleLabel">
          {currentModule.name}
        </span>
      </nav>
    </EngineContext.Provider>
  );
}
