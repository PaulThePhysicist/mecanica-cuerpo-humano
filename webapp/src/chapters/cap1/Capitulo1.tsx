import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useEngine, EngineContext } from './useEngine';
import { sharedGLEnabled } from './three/sharedGL';
import { SharedStageProvider } from './three/SharedStage';
import './legacy.css';
import { MODULES, TOTAL, redrawSlide } from './sims';
import * as SIM from './sims';
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

const {
  setGLMode, toggleGLAnimation, glClamp,
  setJoint, setMovement, toggleJointsAnimation, toggleMovementAnimation,
  drawProportions, drawMobility, drawSomatotype,
  drawAllometry, drawBoneScale, drawStevens, calcBMI,
} = SIM as any;

const SLIDES: React.ComponentType<any>[] = [
  Slide0, Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8,
  Slide9, Slide10, Slide11, Slide12, Slide13, Slide14, Slide15, Slide16,
];

/* Contador «n / total» de la cabecera de módulo, derivado de MODULES en vez de
   estar escrito a mano en cada diapositiva. Los módulos de una sola diapositiva
   (Inicio, Resumen) no muestran fracción: devuelven el separador «·». */
function slideCountOf(index: number): string {
  const mod = MODULES.find((m) => m.slides.includes(index));
  if (!mod || mod.slides.length < 2) return '·';
  return `${mod.slides.indexOf(index) + 1} / ${mod.slides.length}`;
}

const DESCRIPTIONS: Record<string, string> = {
  'axis-z': '<b>Eje z</b>: dirección <b>superior / inferior</b> (cefálico / podálico).',
  'axis-x': '<b>Eje x</b>: dirección <b>anterior / posterior</b> (ventral / dorsal).',
  'axis-y': '<b>Eje y</b>: dirección <b>derecha / izquierda</b> (dextral / sinistral).',
  'axis-medial': '<b>|y| Medial / Lateral</b>: distancia al plano sagital medio (midsagital).',
  'coord-r-proximal': '<b>r</b>: distancia al tronco: <b>proximal</b> (cerca) y <b>distal</b> (lejos).',
  'coord-rho-superficial': '<b>ρ</b>: distancia a la superficie: <b>superficial</b> (piel) y <b>profundo</b> (órganos).',
  'coord-r-trunk': '<b>r desde el tronco</b>: qué tan lejos está el segmento del eje corporal.',
  'coord-r-distal': '<b>r↑ (distal)</b>: hacia la mano; crece a lo largo del brazo.',
  'coord-rho-surface': '<b>ρ desde la superficie</b>: cero en la piel, crece hacia adentro.',
  'coord-rho-deep': '<b>ρ↑ (profundo)</b>: hacia los órganos internos.',
  'coord-right': '<b>Derecha:</b> y &lt; 0 (perspectiva del paciente).',
  'coord-left': '<b>Izquierda:</b> y &gt; 0.',
  'plane-sagittal': '<b>Plano sagital</b>: divide en izquierda y derecha; flexión/extensión.',
  'plane-coronal': '<b>Plano coronal (frontal)</b>: divide en anterior y posterior; abducción/aducción.',
  'plane-transverse': '<b>Plano transversal (axial)</b>: divide en superior e inferior; rotaciones.',
  'region-caput': '<b>Caput</b>: cabeza. Contiene el cerebro (~1.400 g).',
  'region-cervical': '<b>Cervical</b>: cuello; 7 vértebras.',
  'region-acromion': '<b>Acromion</b>: hombro; articulación de 3 GL.',
  'region-brachium': '<b>Brachium</b>: brazo (húmero).',
  'region-antebrachium': '<b>Antebrachium</b>: antebrazo (cúbito y radio); el pivote radiocubital añade 1 GL.',
  'region-carpus': '<b>Carpus</b>: muñeca; articulación condílea de 2 GL.',
  'region-femur': '<b>Femur</b>: muslo (fémur), el hueso más largo.',
  'region-popliteus': '<b>Popliteus</b>: región poplítea, detrás de la rodilla.',
  'region-crus': '<b>Crus</b>: pierna (tibia y peroné).',
  'region-tarsus': '<b>Tarsus</b>: tobillo (huesos tarsianos).',
  'BMR': '<b>Ley de Kleiber:</b> el metabolismo basal escala con α = 0,75.',
  'area': '<b>Área superficial:</b> α = 0,65 (ver Du Bois en D3).',
  'HR': '<b>Frecuencia cardíaca:</b> α = −0,25 — el corazón del elefante late más lento.',
  'brain': '<b>Masa cerebral:</b> α = 0,66 — el cerebro no escala con la masa.',
  'life': '<b>Tiempo de vida:</b> α = 0,20 — los grandes viven más.',
  'muscle': '<b>Masa muscular:</b> α = 1,0 — isométrica con la masa.',
  'rat': '<b>Rata:</b> w/L ≈ 1 — hueso esbelto.',
  'horse': '<b>Caballo:</b> w/L ≈ 1,7 — proporción intermedia.',
  'elephant': '<b>Elefante:</b> w/L ≈ 4 — huesos macizos para 10⁴× la masa de la rata.',
};

function renderKatex(root: HTMLElement = document.body) {
  /* Algunas expresiones inline llegan desde JSX como texto literal. Normalizar
     \\approx antes del auto-render evita que KaTeX lo convierta en "approx".
     `root` acota el trabajo a la diapositiva activa: recorrer todo el body en
     cada navegación es lento y dejaba ver el LaTeX crudo un instante. */
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeValue) {
      const slash = String.fromCharCode(92);
      node.nodeValue = node.nodeValue
        .split('approx').join('≈')
        .split(slash + slash + '≈').join('≈')
        .split(slash + '≈').join('≈')
        .split(slash + slash).join(slash);
    }
  }
  renderMathInElement(root, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true },
    ],
    throwOnError: false,
  });
}

export default function Capitulo1({ onBack }: { onBack?: () => void }) {
  const engine = useEngine();
  const { activeSlide, go, next, prev, goModule } = engine;
  // Modo «GL compartido»: un solo <Canvas> persistente para todo el capítulo
  // (ver three/SharedStage.tsx); cada AnatomyStage registra su escena en vez de
  // crear su propio contexto WebGL.
  const sharedGL = sharedGLEnabled();
  const [hl, setHl] = useState<string | null>(null);
  const [termSel, setTermSel] = useState<string | null>(null);
  const [planeSel, setPlaneSel] = useState<string | null>(null);
  const [regionSel, setRegionSel] = useState<string | null>(null);
  const infoTexts = useRef<Record<string, string>>({});
  // Diapositivas ya vistas: al volver a una, se omite la animación de entrada
  // (regla .instant en legacy.css). `isRevisit` se lee en render; el alta en el
  // set se hace en un efecto — un useMemo no debe tener efectos secundarios
  // (React puede re-ejecutarlo o descartar su resultado).
  const seen = useRef<Set<number>>(new Set());
  const isRevisit = seen.current.has(activeSlide);
  useEffect(() => {
    seen.current.add(activeSlide);
  }, [activeSlide]);


  // El capítulo usa rem en tarjetas, controles y navegación. Ajustamos la
  // raíz mientras está montado para aumentar la legibilidad de toda la
  // presentación sin alterar otras vistas de la aplicación.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousSize = root.style.fontSize;
    root.style.fontSize = 'calc(clamp(16px, 1.32vw, 21px) + 3px)';
    return () => {
      root.style.fontSize = previousSize;
    };
  }, []);

  // ── Reset selections on slide change ──
  useEffect(() => {
    setTermSel(null);
    setPlaneSel(null);
    setRegionSel(null);
    setHl(null);
  }, [activeSlide]);

  // Barras de control inferiores: visibles al entrar, con una pestaña común
  // para ocultarlas cuando ocupen espacio sobre la visualización.
  useEffect(() => {
    const id = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.prof-controls').forEach((panel) => {
        if (panel.closest('.c4-somatotype-area')) {
          panel.querySelectorAll('.prof-controls-toggle').forEach((toggle) => toggle.remove());
          return;
        }
        if (panel.dataset.collapsibleVersion === '2') return;
        panel.querySelectorAll('.prof-controls-toggle').forEach((oldToggle) => oldToggle.remove());
        panel.classList.remove('is-collapsed');
        panel.dataset.collapsibleVersion = '2';
        const storageKey = `cap1.prof-controls.collapsed.v3.${activeSlide}`;

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'prof-controls-toggle';
        toggle.textContent = '×';
        toggle.title = 'Ocultar controles de la visualización';
        toggle.setAttribute('aria-label', 'Ocultar controles de la visualización');
        toggle.setAttribute('aria-expanded', 'true');

        // persist=false en la llamada inicial: así el estado por defecto NO se
        // escribe en localStorage y sigue aplicándose en cada visita. Solo el
        // clic del usuario persiste su elección.
        const update = (collapsed: boolean, persist = true) => {
          panel.classList.toggle('is-collapsed', collapsed);
          toggle.textContent = collapsed ? '⚙' : '×';
          toggle.title = collapsed ? 'Mostrar controles de la visualización' : 'Ocultar controles de la visualización';
          toggle.setAttribute('aria-label', toggle.title);
          toggle.setAttribute('aria-expanded', String(!collapsed));
          if (persist) window.localStorage.setItem(storageKey, collapsed ? 'true' : 'false');
        };

        toggle.addEventListener('click', () => update(!panel.classList.contains('is-collapsed')));
        panel.appendChild(toggle);
        const storedState = window.localStorage.getItem(storageKey);
        // Por defecto EXPANDIDO (el control primario del slide visible al entrar,
        // como dice el comentario de arriba). Solo arranca colapsado si el slide
        // lo pide con data-default-collapsed (los 3D de terminología, donde el
        // canvas manda). Si el usuario ya lo colapsó antes, se respeta.
        const defaultCollapsed = panel.dataset.defaultCollapsed === 'true';
        update(storedState === null ? defaultCollapsed : storedState === 'true', false);
      });
    }, 0);
    return () => window.clearTimeout(id);
  }, [activeSlide]);

  // ── KaTeX al montar + al cambiar de slide ──
  // useLayoutEffect: renderiza ANTES de pintar, así no se ve el LaTeX crudo un
  // instante al entrar a la diapositiva. Acotado al slide activo (+ vecinos, por
  // si ya están montados) para que sea rápido.
  useLayoutEffect(() => {
    const scope = () => {
      document
        .querySelectorAll<HTMLElement>('.cap1-presentation .slide, .cap1-presentation .slide-full')
        .forEach((el) => {
          if (el.children.length > 0) renderKatex(el);
        });
    };
    scope();
    const id = window.setTimeout(scope, 120);
    return () => window.clearTimeout(id);
  }, [activeSlide]);

  // ── Sincronización del dibujo de Canvas en cada cambio de slide ──
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => engine.requestDraw());
    engine.requestDraw();
    return () => cancelAnimationFrame(id);
  }, [activeSlide, engine]);

  // ── Construir barra de módulos (module-tabs) ──
  // Idempotente y con limpieza: si el efecto se re-ejecuta (StrictMode en dev,
  // o un remonte) se limpian los botones anteriores en vez de duplicarlos.
  useEffect(() => {
    const host = document.getElementById('moduleBar');
    if (!host) return;
    const buttons: HTMLButtonElement[] = [];
    MODULES.forEach((m) => {
      if (m.id === 0) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'module-tab';
      b.dataset.module = String(m.id);
      const name = m.name.replace(/^[A-Z] · /, '');
      b.innerHTML = `<span class="mod-badge">${m.id}</span>${m.ico} ${name}`;
      b.addEventListener('click', () => goModule(m.id));
      host.appendChild(b);
      buttons.push(b);
    });
    return () => {
      buttons.forEach((b) => b.remove());
    };
  }, [goModule]);

  // ── Marcar pestaña de módulo activa ──
  useEffect(() => {
    const mod = MODULES.find((m) => m.slides.includes(activeSlide));
    document.querySelectorAll('.module-tab').forEach((tab) => {
      const active = +(tab as HTMLElement).dataset.module! === (mod ? mod.id : 0);
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }, [activeSlide]);

  // ── Atajos de Teclado ──
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

  // ── Eventos de apuntes, sliders y tablas interactivas ──
  useEffect(() => {
    const $ = (id: string) => document.getElementById(id);

    // Este efecto se re-ejecuta al cambiar de slide y también en cada hover de
    // plano/región (planeSel/regionSel están en las deps). Antes cada pasada
    // volvía a llamar addEventListener sobre los mismos nodos → los listeners
    // se apilaban y cada slider/fila acababa disparando su draw N veces.
    // `bindOnce` marca el nodo la primera vez y no vuelve a enlazar; al
    // desmontarse el slide el nodo se recolecta y con él sus listeners.
    const bindOnce = (el: Element | null, type: string, handler: EventListenerOrEventListenerObject) => {
      if (!el) return;
      const key = '__c1bound_' + type;
      if ((el as any)[key]) return;
      (el as any)[key] = true;
      el.addEventListener(type, handler);
    };

    ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'b4', 'c1', 'c2', 'c3', 'c4', 'd1', 'd2', 'd3', 'd4'].forEach((k) => {
      const el = $('info-text-' + k);
      if (el && !infoTexts.current[k]) {
        infoTexts.current[k] = el.innerHTML;
      }
    });

    ['glShoulder', 'glElbow', 'glWrist', 'glPivot'].forEach((id) => {
      bindOnce($(id), 'input', () => { glClamp(); redrawSlide(4); });
    });

    bindOnce($('antagSlider'), 'input', () => redrawSlide(7));
    bindOnce($('massSlider'), 'input', () => redrawSlide(8));
    bindOnce($('heightSlider'), 'input', () => redrawSlide(9));

    ['bmiMass', 'bmiHeight'].forEach((id) => {
      bindOnce($(id), 'input', () => calcBMI());
    });

    const stevensN = $('stevensN');
    bindOnce(stevensN, 'input', () => drawStevens());

    const stevensSel = $('stevensSelect');
    bindOnce(stevensSel, 'change', () => {
      const v = parseFloat((stevensSel as HTMLSelectElement).value);
      if (stevensN) (stevensN as HTMLInputElement).value = String(v);
      const lb = $('stevensNLabel');
      if (lb) lb.textContent = v.toFixed(2).replace('.', ',');
      drawStevens();
    });

    bindOnce($('alloSelect'), 'change', () => drawAllometry());
    bindOnce($('boneScaleAllo'), 'change', () => drawBoneScale());

    const setInfo = (key: string, infoKey: string) => {
      const info = $('info-text-' + infoKey);
      if (info) info.innerHTML = DESCRIPTIONS[key] || infoTexts.current[infoKey] || '';
    };

    document.querySelectorAll('[data-highlight]').forEach((el) => {
      const key = (el as HTMLElement).dataset.highlight || '';
      const slide = (el.closest('.slide') as HTMLElement)?.dataset.slide || '';
      const infoKey = { '1': 'a1', '2': 'a2', '3': 'a3' }[slide] || '';
      
      if (key.startsWith('coord') || key.startsWith('axis')) {
        const isSelected = termSel === key;
        (el as HTMLElement).dataset.selected = isSelected ? 'true' : 'false';
        el.classList.toggle('active', isSelected);

        (el as HTMLElement).onclick = () => {
          setTermSel((prev) => {
            const nextVal = prev === key ? null : key;
            setInfo(nextVal || '', infoKey);
            return nextVal;
          });
        };
        (el as HTMLElement).onmouseenter = () => {
          setInfo(key, infoKey);
          setHl(key);
        };
        (el as HTMLElement).onmouseleave = () => {
          setHl(null);
          setInfo(termSel || '', infoKey);
        };
      }
    });

    document.querySelectorAll('[data-highlight^="plane-"]').forEach((el) => {
      const key = (el as HTMLElement).dataset.highlight || '';
      const slide = (el.closest('.slide') as HTMLElement)?.dataset.slide || '';
      const infoKey = { '1': 'a1', '2': 'a2', '3': 'a3' }[slide] || '';
      
      const isSelected = planeSel === key;
      (el as HTMLElement).dataset.selected = isSelected ? 'true' : 'false';
      el.classList.toggle('active', isSelected);

      (el as HTMLElement).onclick = () => {
        setPlaneSel((prev) => {
          const nextVal = prev === key ? null : key;
          setInfo(nextVal || '', infoKey);
          return nextVal;
        });
      };
      (el as HTMLElement).onmouseenter = () => {
        setInfo(key, infoKey);
        setPlaneSel(key);
      };
      (el as HTMLElement).onmouseleave = () => {
        setPlaneSel(planeSel);
        setInfo(planeSel || '', infoKey);
      };
    });

    document.querySelectorAll('[data-highlight^="region-"]').forEach((el) => {
      const key = (el as HTMLElement).dataset.highlight || '';
      const slide = (el.closest('.slide') as HTMLElement)?.dataset.slide || '';
      const infoKey = { '1': 'a1', '2': 'a2', '3': 'a3' }[slide] || '';
      
      const isSelected = regionSel === key;
      (el as HTMLElement).dataset.selected = isSelected ? 'true' : 'false';
      el.classList.toggle('active', isSelected);

      (el as HTMLElement).onclick = () => {
        setRegionSel((prev) => {
          const nextVal = prev === key ? null : key;
          setInfo(nextVal || '', infoKey);
          return nextVal;
        });
      };
      (el as HTMLElement).onmouseenter = () => {
        setInfo(key, infoKey);
        setRegionSel(key);
      };
      (el as HTMLElement).onmouseleave = () => {
        setRegionSel(regionSel);
        setInfo(regionSel || '', infoKey);
      };
    });

    document.querySelectorAll('[data-joint]').forEach((tr) => {
      const j = (tr as HTMLElement).dataset.joint || '';
      bindOnce(tr, 'mouseenter', () => setJoint(j));
      bindOnce(tr, 'click', () => setJoint(j));
    });

    document.querySelectorAll('[data-movement]').forEach((p) => {
      const m = (p as HTMLElement).dataset.movement || '';
      bindOnce(p, 'click', () => setMovement(m));
    });

    document.querySelectorAll('[data-prop]').forEach((tr) => {
      const p = (tr as HTMLElement).dataset.prop || '';
      bindOnce(tr, 'mouseenter', () => drawProportions(p));
      bindOnce(tr, 'mouseleave', () => drawProportions(null));
      bindOnce(tr, 'click', () => drawProportions(p));
    });

    document.querySelectorAll('[data-mobility]').forEach((tr) => {
      const m = (tr as HTMLElement).dataset.mobility || '';
      bindOnce(tr, 'mouseenter', () => drawMobility(m));
      bindOnce(tr, 'mouseleave', () => drawMobility(null));
      bindOnce(tr, 'click', () => drawMobility(m));
    });

    document.querySelectorAll('[data-somatotype]').forEach((p) => {
      const s = (p as HTMLElement).dataset.somatotype || '';
      bindOnce(p, 'mouseenter', () => drawSomatotype(s));
      bindOnce(p, 'mouseleave', () => drawSomatotype(null));
      bindOnce(p, 'click', () => drawSomatotype(s));
    });

    document.querySelectorAll('[data-allometry]').forEach((p) => {
      bindOnce(p, 'click', () => {
        const v = (p as HTMLElement).dataset.allometry || '';
        document.querySelectorAll('[data-allometry]').forEach((e) => e.setAttribute('aria-pressed', e === p ? 'true' : 'false'));
        const sel = $('alloSelect');
        if (sel) (sel as HTMLSelectElement).value = v;
        drawAllometry();
        const info = $('info-text-d1');
        if (info && DESCRIPTIONS[v]) info.innerHTML = DESCRIPTIONS[v];
      });
    });

    document.querySelectorAll('[data-bone]').forEach((p) => {
      bindOnce(p, 'click', () => {
        document.querySelectorAll('[data-bone]').forEach((e) => e.setAttribute('aria-pressed', e === p ? 'true' : 'false'));
        drawBoneScale((p as HTMLElement).dataset.bone || '');
        const info = $('info-text-d2');
        const b = (p as HTMLElement).dataset.bone || '';
        if (info && DESCRIPTIONS[b]) info.innerHTML = DESCRIPTIONS[b];
      });
    });

    document.querySelectorAll('[data-stevens]').forEach((tr) => {
      bindOnce(tr, 'click', () => {
        document.querySelectorAll('[data-stevens]').forEach((e) => e.setAttribute('aria-selected', e === tr ? 'true' : 'false'));
        const v = (tr as HTMLElement).dataset.stevens || '';
        const sel = $('stevensSelect');
        if (sel) (sel as HTMLSelectElement).value = v;
        const sl = $('stevensN');
        if (sl) (sl as HTMLInputElement).value = v;
        const lb = $('stevensNLabel');
        if (lb) lb.textContent = (+v).toFixed(2).replace('.', ',');
        drawStevens();
      });
    });

    redrawSlide(activeSlide);
    // termSel entra en deps: los handlers .onmouseleave de [data-highlight]
    // leen termSel y sin esto capturaban un valor obsoleto. Ya no fuga porque
    // los addEventListener pasan por bindOnce.
  }, [activeSlide, planeSel, regionSel, termSel]);

  const moduleName = (MODULES.find((m) => m.slides.includes(activeSlide)) || MODULES[0]).name;

  const presentation = (
    <EngineContext.Provider value={engine}>
      <div className="cap1-presentation">
      <nav className="module-bar" id="moduleBar">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{ marginRight: '1rem', cursor: 'pointer', padding: '0.4rem 0.8rem', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '.64rem', fontWeight: 600, color: 'var(--ink)' }}
          >
            ← Inicio
          </button>
        )}
        <div className="brand-mark">
          <span className="treatise">El cuerpo humano · capítulo 1</span>
          <span className="book">Terminología · Estándar · Escalado — I. P. Herman</span>
        </div>
      </nav>

      {SLIDES.map((Slide, i) => {
        const isCover = i === 0;
        const cls = isCover ? 'slide-full' : 'slide';
        const isActive = activeSlide === i;
        // Solo se monta la diapositiva activa y sus vecinas inmediatas. Antes
        // se montaban las 17 a la vez: cada canvas React (slides 8–11) tenía su
        // propio rAF girando siempre y cada escena Three.js quedaba instanciada
        // aunque no se viera. Con ventana ±1 el vecino ya está listo antes de
        // navegar y el resto no consume nada.
        const mounted = Math.abs(i - activeSlide) <= 1;
        return (
          <div
            key={i}
            className={`${cls} ${isActive ? 'active' : ''} ${isActive && isRevisit ? 'instant' : ''}`}
            data-slide={i}
            data-module={MODULES.find((m) => m.slides.includes(i))?.id ?? 0}
          >
            {mounted && (
              <Slide
                isActive={isActive}
                engine={engine}
                go={go}
                goModule={goModule}
                next={next}
                prev={prev}
                hl={hl || termSel}
                planeSel={planeSel}
                regionSel={regionSel}
                slideCount={slideCountOf(i)}
                setGLMode={setGLMode}
                toggleGLAnimation={toggleGLAnimation}
                toggleJointsAnimation={toggleJointsAnimation}
                toggleMovementAnimation={toggleMovementAnimation}
                onBack={onBack}
              />
            )}
          </div>
        );
      })}

      <nav className="nav-bar">
        <button className="nav-btn" onClick={prev} aria-label="Anterior">←</button>
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
        <button className="nav-btn" onClick={next} aria-label="Siguiente">→</button>
        <span className="slide-counter" id="slideCounter">{activeSlide + 1} / {TOTAL}</span>
        <span className="nav-module-label" id="navModuleLabel">{moduleName}</span>
      </nav>
      </div>
    </EngineContext.Provider>
  );

  // Con «GL compartido» todo el capítulo comparte un único contexto WebGL.
  return sharedGL ? <SharedStageProvider>{presentation}</SharedStageProvider> : presentation;
}
