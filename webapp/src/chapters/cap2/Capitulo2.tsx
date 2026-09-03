import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useEngine, EngineContext } from './useEngine';
import './cap2.css';
import { MODULES, TOTAL, redrawSlide } from './sims';
import { CAP2_ZOOM_EVENT } from './Cap2ZoomHandler';
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

// ── KaTeX (igual que el HTML legacy, vía módulo importado) ──
function renderKatex() {
    renderMathInElement(document.body, {
      delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true },
    ],
    throwOnError: false,
  });
}

const SLIDES = [
  Slide0, Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9,
  Slide10, Slide11, Slide12, Slide13, Slide14, Slide15, Slide16, Slide17, Slide18,
];

function slideCountOf(index: number): string {
  const mod = MODULES.find((m) => m.slides.includes(index));
  if (!mod || mod.slides.length < 2) return '·';
  return `${mod.slides.indexOf(index) + 1} / ${mod.slides.length}`;
}

export default function Capitulo2({ onBack }: { onBack?: () => void }) {
  const engine = useEngine();
  const { activeSlide, go, next, prev, goModule } = engine;
  const [moduleTabsBuilt, setModuleTabsBuilt] = useState(false);
  const seen = useRef<Set<number>>(new Set());
  const isRevisit = useMemo(() => {
    const already = seen.current.has(activeSlide);
    seen.current.add(activeSlide);
    return already;
  }, [activeSlide]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousSize = root.style.fontSize;
    root.style.fontSize = 'calc(clamp(16px, 1.32vw, 21px) + 3px)';
    return () => {
      root.style.fontSize = previousSize;
    };
  }, []);

  // ── Callbacks locales que delegan en engine.flagsRef + redibujo ──
  // (Sustituyen las funciones setLever/toggle*/setJawPos/etc. del HTML legacy.)
  const forceRedraw = () => {
    // Feedback inmediato al pulsar botones; el loop rAF ya redibuja cada frame.
    const out = (id: string, text: string) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    redrawSlide(engine.activeSlide, engine.clockRef.current, engine.paramsRef.current, engine.flagsRef.current, out);
  };

  const setLever = (n: number) => {
    engine.setParam('lev_clase', n);
    // pill active
    document.querySelectorAll('.theory .pill').forEach(p => {
      const m = (p.getAttribute('onclick') || '').match(/setLever\((\d+)\)/);
      p.classList.toggle('active', m ? +m[1] === n : false);
    });
    forceRedraw();
  };
  const toggleForearmMuscles = () => {
    const cur = engine.flagsRef.current.faMuscles;
    const next = cur === 3 ? 1 : 3;
    engine.setFlag('faMuscles', next);
    const b = Array.from(document.querySelectorAll('.prof-controls button')).find(x => /Músculos/.test(x.textContent || ''));
    if (b) b.textContent = 'Músculos: ' + next + ' / 3';
    forceRedraw();
  };
  const hipToggleBreakdown = () => {
    engine.setFlag('hipBreakdown', !engine.flagsRef.current.hipBreakdown);
    forceRedraw();
  };
  const toggleCane = () => {
    const on = !engine.flagsRef.current.caneOn;
    engine.setFlag('caneOn', on);
    const b = Array.from(document.querySelectorAll('.prof-controls button')).find(x => /Bastón/.test(x.textContent || ''));
    if (b) b.textContent = 'Bastón: ' + (on ? 'sí' : 'no');
    forceRedraw();
  };
  const toggleBackLoad = () => {
    const on = !engine.flagsRef.current.backLoad;
    engine.setFlag('backLoad', on);
    const b = Array.from(document.querySelectorAll('.prof-controls button')).find(x => /Carga/.test(x.textContent || ''));
    if (b) b.textContent = 'Carga: ' + (on ? 'con' : 'sin');
    forceRedraw();
  };
  const setDiscPosture = (p: string) => { engine.setFlag('discPosture', p); forceRedraw(); };
  const setJawPos = (m: string) => { engine.setFlag('jawMode', m); forceRedraw(); };
  const threeStep = (d: number) => {
    const s = Math.max(1, Math.min(4, (engine.flagsRef.current.tfStep || 1) + d));
    engine.setFlag('tfStep', s);
    forceRedraw();
  };
  const touchStim = (kind: string) => {
    const map: Record<string, number> = { press: 16, flutter: 47, buzz: 71, vib: 84 };
    engine.setParam('tch_f', map[kind] ?? 30);
    document.querySelectorAll('.theory .pill').forEach(p => {
      const m = (p.getAttribute('onclick') || '').match(/touchStim\('(\w+)'\)/);
      p.classList.toggle('active', m ? m[1] === kind : false);
    });
    forceRedraw();
  };
  const convertPreset = (k: string) => {
    if (k === 'bp') { engine.setParam('cv_p_val', 120); engine.setParam('cv_p_from', 'mmHg'); engine.setParam('cv_p_to', 'Pa'); }
    if (k === 'atm') { engine.setParam('cv_p_val', 1); engine.setParam('cv_p_from', 'atm'); engine.setParam('cv_p_to', 'Pa'); }
    if (k === 'body') { engine.setParam('cv_f_val', 70); engine.setParam('cv_f_from', 'kgf'); engine.setParam('cv_f_to', 'lb'); }
    forceRedraw();
  };

  // ── KaTeX al montar + al cambiar de slide ──
  useEffect(() => {
    renderKatex();
    const id = setTimeout(renderKatex, 400);
    return () => clearTimeout(id);
  }, [activeSlide]);

  // Controles de zoom visibles dentro de cada canvas. Se conectan al mismo
  // evento de rueda que OrbitControls usa en las escenas 3D, sin modificar
  // los controles particulares de cada simulación.
  useEffect(() => {
    const areas = Array.from(document.querySelectorAll<HTMLElement>('.slide.active .sim-area'));
    const cleanups: Array<() => void> = [];

    areas.forEach((area) => {
      const surface = area.querySelector<HTMLCanvasElement>('canvas');
      if (!surface || area.querySelector('.cap2-canvas-zoom')) return;
      if (surface.closest('.cap2-raster-canvas')) return;
      if (surface.closest('.cap2-webgl-canvas')) return;

      const overlay = document.createElement('div');
      overlay.className = 'cap2-canvas-zoom';
      overlay.setAttribute('aria-label', 'Controles de zoom del canvas');
      overlay.innerHTML = `
        <button type="button" data-zoom="in" title="Acercar vista" aria-label="Acercar vista">+</button>
        <button type="button" data-zoom="out" title="Alejar vista" aria-label="Alejar vista">−</button>
        <button type="button" data-zoom="reset" title="Restablecer zoom" aria-label="Restablecer zoom">↺</button>
      `;

      const onClick = (event: Event) => {
        const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-zoom]');
        if (!button) return;
        const action = button.dataset.zoom;
        window.dispatchEvent(new CustomEvent(CAP2_ZOOM_EVENT, { detail: { action } }));
      };
      overlay.addEventListener('click', onClick);
      area.appendChild(overlay);
      cleanups.push(() => {
        overlay.removeEventListener('click', onClick);
        overlay.remove();
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [activeSlide]);

  // ── Construir barra de módulos (module-tabs) una vez ──
  useEffect(() => {
    if (moduleTabsBuilt) return;
    const host = document.getElementById('moduleBar');
    if (!host) return;
    MODULES.forEach(m => {
      if (m.id === 0) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'module-tab';
      b.dataset.module = String(m.id);
      const name = m.name.replace(/^[A-Z] · /, '');
      const letter = String.fromCharCode(64 + m.id);
      b.innerHTML = `<span class="mod-badge">${letter}</span>${m.ico} ${name}`;
      b.addEventListener('click', () => goModule(m.id));
      host.appendChild(b);
    });
    setModuleTabsBuilt(true);
  }, [moduleTabsBuilt, goModule]);

  // ── Controles de profesor colapsables por diapositiva ──
  // Mantiene el estado separado de Capítulo 1 para no mezclar preferencias.
  useEffect(() => {
    const id = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.prof-controls').forEach((panel) => {
        if (panel.dataset.collapsibleVersion === 'cap2-v1') return;
        panel.querySelectorAll('.prof-controls-toggle').forEach((oldToggle) => oldToggle.remove());
        panel.classList.remove('is-collapsed');
        panel.dataset.collapsibleVersion = 'cap2-v1';

        const slide = panel.closest<HTMLElement>('[data-slide]')?.dataset.slide ?? '0';
        const storageKey = `cap2.prof-controls.collapsed.v1.${slide}`;
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'prof-controls-toggle';
        toggle.textContent = '×';
        toggle.title = 'Ocultar controles de la visualización';
        toggle.setAttribute('aria-label', 'Ocultar controles de la visualización');
        toggle.setAttribute('aria-expanded', 'true');

        const update = (collapsed: boolean) => {
          panel.classList.toggle('is-collapsed', collapsed);
          toggle.textContent = collapsed ? '⚙' : '×';
          toggle.title = collapsed ? 'Mostrar controles de la visualización' : 'Ocultar controles de la visualización';
          toggle.setAttribute('aria-label', toggle.title);
          toggle.setAttribute('aria-expanded', String(!collapsed));
          window.localStorage.setItem(storageKey, collapsed ? 'true' : 'false');
        };

        toggle.addEventListener('click', () => update(!panel.classList.contains('is-collapsed')));
        panel.appendChild(toggle);
        const storedState = window.localStorage.getItem(storageKey);
        update(storedState === null ? true : storedState === 'true');
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, [activeSlide]);

  // ── Marcar pestaña de módulo activa ──
  useEffect(() => {
    const mod = MODULES.find(m => m.slides.includes(activeSlide));
    document.querySelectorAll('.module-tab').forEach(tab => {
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
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === 'Home') { e.preventDefault(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); go(TOTAL - 1); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [next, prev, go]);

  const moduleName = (MODULES.find(m => m.slides.includes(activeSlide)) || MODULES[0]).name;
  const activeModule = MODULES.find(m => m.slides.includes(activeSlide));
  const activeModuleLetter = activeModule ? String.fromCharCode(64 + activeModule.id) : '';
  const activeModulePosition = activeModule ? activeModule.slides.indexOf(activeSlide) + 1 : 0;
  const activeSlideCode = activeSlide === 0 ? 'Inicio' : `${activeModuleLetter}${activeModulePosition}`;

  // Forzar un redibujo del slide activo cada vez que cambia. useLayoutEffect
  // dibuja SINCRÓNICAMENTE antes del paint del navegador (no depende de
  // requestAnimationFrame, que en algunos navegadores no dispara en el frame
  // esperado y dejaba el canvas en blanco hasta pulsar un botón). Cubre slides
  // sin botones que antes no aparecían.
  useLayoutEffect(() => {
    // requestAnimationFrame opcional SOLO como refuerzo si el layout aún no se
    // asentó en este tick; el dibujo síncrono ya ocurre arriba.
    const id = requestAnimationFrame(() => engine.requestDraw());
    engine.requestDraw();
    return () => cancelAnimationFrame(id);
  }, [activeSlide, engine]);

  return (
    <EngineContext.Provider value={engine}>
      <canvas id="c2-dust" aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.5 }} />

      <nav className="module-bar" id="moduleBar" aria-label="Módulos del Capítulo 2">
        {onBack && <button type="button" onClick={onBack} style={{marginRight: '1rem', cursor: 'pointer', padding: '0.5rem'}}>← Inicio</button>}
        <div className="brand-mark">
          <span className="treatise">El cuerpo humano · capítulo 2</span>
          <span className="book">Física del Cuerpo Humano — I. P. Herman</span>
        </div>
      </nav>

      {SLIDES.map((Slide, i) => {
        const isCover = i === 0;
        const cls = isCover ? 'slide-full' : 'slide';
        return (
          <div key={i} className={`${cls} ${activeSlide === i ? 'active' : ''} ${activeSlide === i && isRevisit ? 'instant' : ''}`} data-slide={i} data-module={MODULES.find(m => m.slides.includes(i))?.id ?? 0}>
            <Slide
              isActive={activeSlide === i}
              engine={engine}
              go={go}
              goModule={goModule}
              next={next}
              prev={prev}
              setLever={setLever}
              toggleForearmMuscles={toggleForearmMuscles}
              hipToggleBreakdown={hipToggleBreakdown}
              toggleCane={toggleCane}
              toggleBackLoad={toggleBackLoad}
              setDiscPosture={setDiscPosture}
              setJawPos={setJawPos}
              threeStep={threeStep}
              touchStim={touchStim}
              convertPreset={convertPreset}
              onBack={onBack}
            />
          </div>
        );
      })}

      <nav className="nav-bar" aria-label="Navegación de diapositivas">
        <button type="button" className="nav-btn" onClick={prev} aria-label="Anterior">←</button>
        <div className="nav-dots" id="navDots">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`nav-dot ${activeSlide === i ? 'active' : ''}`}
              title={`Ir a ${(() => { const mod = MODULES.find(m => m.slides.includes(i)); return i === 0 ? 'Inicio' : `${String.fromCharCode(64 + (mod?.id ?? 0))}${(mod?.slides.indexOf(i) ?? 0) + 1}`; })()} · ${slideCountOf(i)}`}
              aria-label={`Ir a ${(() => { const mod = MODULES.find(m => m.slides.includes(i)); return i === 0 ? 'Inicio' : `${String.fromCharCode(64 + (mod?.id ?? 0))}${(mod?.slides.indexOf(i) ?? 0) + 1}`; })()}`}
              aria-current={activeSlide === i ? 'step' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="nav-btn" onClick={next} aria-label="Siguiente">→</button>
        <span className="slide-counter" id="slideCounter">{activeSlideCode}</span>
        <span className="nav-module-label" id="navModuleLabel">{moduleName}</span>
      </nav>
    </EngineContext.Provider>
  );
}
