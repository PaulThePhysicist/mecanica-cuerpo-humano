import React, { useEffect, useState } from 'react';
import BoneScaleCanvas from './BoneScaleCanvas';
import HudPanel from './HudPanel';
import { fmt } from './format';
// @ts-ignore - katex auto-render no incluye tipos
import renderMathInElement from 'katex/contrib/auto-render';

interface AnimalDetail {
  id: string;
  name: string;
  wl: number;
  length: number;
  color: string;
  desc: string;
}

const ANIMALS_INFO: Record<string, AnimalDetail> = {
  rat: {
    id: 'rat',
    name: 'Rata (Mamífero Pequeño)',
    wl: 1.0,
    length: 60,
    color: '#2e8b57',
    desc: '<b>Rata ($w/L \\approx 1{,}0$):</b> Huesos esbeltos. El peso corporal ($250\\text{ g}$) es tan bajo que la resistencia a compresión no impone un grosor excesivo (~32 MPa).',
  },
  horse: {
    id: 'horse',
    name: 'Caballo (Mamífero Mediano)',
    wl: 1.7,
    length: 120,
    color: '#a35c00',
    desc: '<b>Caballo ($w/L \\approx 1{,}7$):</b> Huesos moderadamente engrosados para soportar $\\sim 500\\text{ kg}$ a alta velocidad y aceleración de impacto sin superar la resistencia elástica.',
  },
  elephant: {
    id: 'elephant',
    name: 'Elefante (Mamífero Gigante)',
    wl: 4.0,
    length: 190,
    color: '#6d5fbf',
    desc: '<b>Elefante ($w/L \\approx 4{,}0$):</b> Huesos masivos en columna. Si tuviera patas de ratón escaladas isométricamente, <strong>se fracturarían bajo su propio peso de 5 toneladas (215 MPa > 150 MPa)</strong>.',
  },
};

function renderD2Math() {
  const root = document.getElementById('d2-math-root');
  if (!root) return;
  /* En texto JSX una doble barra invertida llega literalmente al DOM y
     KaTeX la interpreta como texto plano (por ejemplo, \\approx). Normalizar
     esos comandos antes de renderizar evita que aparezca "approx" sin formato. */
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

export default function Slide13({ slideCount }: { slideCount?: string }) {
  const [selectedAnimal, setSelectedAnimal] = useState<string>('elephant');
  const [isAllometric, setIsAllometric] = useState<boolean>(true);

  const currentDetail = ANIMALS_INFO[selectedAnimal] || ANIMALS_INFO.elephant;

  useEffect(() => {
    const root = document.getElementById('d2-math-root');
    if (!root) return undefined;
    const renderIfNeeded = () => {
      if (root.textContent?.includes('$') || root.textContent?.includes('\\[')) renderD2Math();
    };
    const timers = [0, 80, 200].map((delay) => window.setTimeout(renderIfNeeded, delay));
    const observer = new MutationObserver(renderIfNeeded);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
    };
  }, [selectedAnimal, isAllometric]);

  const handleSelectAnimal = (k: string) => {
    setSelectedAnimal(k);
    const detail = ANIMALS_INFO[k];
    const info = document.getElementById('info-text-d2');
    if (info && detail) {
      info.innerHTML = detail.desc;
    }
  };

  const handleReset = () => {
    setSelectedAnimal('elephant');
    setIsAllometric(true);
    const info = document.getElementById('info-text-d2');
    if (info) {
      info.innerHTML = ANIMALS_INFO.elephant.desc;
    }
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">D2</span>
        <span className="mtitle">Escalado estructural</span>
        <span className="msub">¿Por qué el elefante no tiene patas de ratón gigante? (w ∝ L^3/2)</span>
        <span className="mslide-count">{slideCount ?? '2 / 4'}</span>
      </div>
      <div className="content-grid" id="d2-math-root">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦴</span> El hueso debe soportar el peso
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                El peso corporal crece como el <strong>volumen</strong> ($\sim L^3$). La resistencia del hueso es proporcional al área de su sección transversal ($\sim w^2$). Para mantener el esfuerzo de compresión constante:
              </p>
              <div className="eq-block">
                {'\\[ w \\propto L^{3/2} \\qquad\\Rightarrow\\qquad \\frac{w}{L_{\\text{hueso}}} \\propto m_b^{1/6} \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                De la rata al elefante $m_b$ crece $10^4$ veces, por lo que $w/L$ debe crecer {'$10^{4/6} = 10^{2/3} \\approx 4$'} veces: las formas <strong>no</strong> son geométricamente similares.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦘</span> Invariantes de escala (Tabla 1.14)
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                <span className="pill"><b>Salto vertical:</b> ~2/3 m (todas las masas)</span>
                <span className="pill"><b>Velocidad máx.:</b> ~7 m/s</span>
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)', marginTop: '.25rem' }}>
                La fuerza muscular $\propto H^2$, mientras el peso $\propto H^3$. La energía de salto por unidad de masa se mantiene constante.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🖼️</span> Comparativa: Rata vs. Elefante
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                {Object.values(ANIMALS_INFO).map((a) => {
                  const isSel = selectedAnimal === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => handleSelectAnimal(a.id)}
                      style={{
                        padding: '.3rem .5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isSel ? 'var(--teal-tint)' : 'var(--paper-2)',
                        border: `1px solid ${isSel ? a.color : 'var(--line)'}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <b style={{ color: isSel ? a.color : 'var(--ink)' }}>{a.name}</b>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '.62rem', color: a.color, fontWeight: 'bold' }}>
                        w/L ≈ {fmt(a.wl, 1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-d2">
              <span dangerouslySetInnerHTML={{ __html: currentDetail.desc }} />
            </div>
          </div>
        </div>
        <div className="sim-area d2-structural-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable en la esquina superior derecha */}
          <HudPanel
            title="ESCALADO ESTRUCTURAL"
            badge={isAllometric ? 'ALOMÉTRICO (w ∝ L^3/2)' : 'ISOMÉTRICO (w ∝ L)'}
            icon="🦴"
            footer="💡 Haz clic en los fémures para inspeccionar su esfuerzo en MPa"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Object.values(ANIMALS_INFO).map((a) => {
                const isSel = selectedAnimal === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => handleSelectAnimal(a.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: isSel ? 'var(--teal-tint)' : 'transparent',
                      border: `1px solid ${isSel ? a.color : 'transparent'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>{a.name.split('(')[0].trim()}</span>
                    <span style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: a.color, fontWeight: 'bold' }}>
                      w/L = {fmt(a.wl, 1)}
                    </span>
                  </div>
                );
              })}

              <div style={{ marginTop: '4px', borderTop: '1px dashed var(--line)', paddingTop: '4px', fontSize: '0.54rem', color: 'var(--ink-3)' }}>
                📐 <b>Tensión límite:</b> σ_rotura ≈ 150 MPa
              </div>
            </div>
          </HudPanel>

          <BoneScaleCanvas
            selectedAnimal={selectedAnimal}
            isAllometric={isAllometric}
            onSelectAnimal={handleSelectAnimal}
          />
          <div className="prof-controls">
            <span className="badge">D2 · Escalado</span>
            <span>Especie: <b style={{ color: currentDetail.color }}>{currentDetail.name.split('(')[0].trim()}</b> (w/L ≈ {fmt(currentDetail.wl, 1)})</span>

            <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', cursor: 'pointer', background: isAllometric ? 'var(--teal-tint)' : 'rgba(176,35,24,0.1)', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${isAllometric ? 'var(--teal)' : '#b02318'}` }}>
              <input
                type="checkbox"
                id="boneScaleAllo"
                checked={isAllometric}
                onChange={(e) => setIsAllometric(e.target.checked)}
              />
              <b>{isAllometric ? 'Alométrico Real (w ∝ L^1,5)' : '⚠️ Modo Isométrico (Fractura)'}</b>
            </label>

            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '0.62rem',
                cursor: 'pointer',
                color: 'var(--ink)',
                marginLeft: '4px',
              }}
            >
              Restablecer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
