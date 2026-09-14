import React, { useEffect, useState } from 'react';
import ProportionsCanvas from './ProportionsCanvas';
import ChapterImageLightbox from './ChapterImageLightbox';
import { fmt } from './format';
import { AMBER, BODY_SEGMENT_SHADES } from './colorTokens';
// @ts-ignore - katex auto-render no incluye tipos
import renderMathInElement from 'katex/contrib/auto-render';

interface SegmentDetail {
  id: string;
  name: string;
  frac: number;
  color: string;
  desc: string;
}

function renderC2Math() {
  const info = document.getElementById('info-text-c2');
  if (!info) return;
  renderMathInElement(info, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true },
    ],
    throwOnError: false,
  });
}

const SEGMENTS_DATA: Record<string, SegmentDetail> = {
  cabeza: {
    id: 'cabeza',
    name: 'Cabeza (Caput)',
    frac: 0.130,
    color: BODY_SEGMENT_SHADES.cabeza,
    desc: '<b>Cabeza ($L/H = 0{,}130$):</b> Representa el $\\sim 13\\%$ de la estatura (canon clásico de $\\sim 1/7{,}7$ cabezas en el adulto).',
  },
  cuello: {
    id: 'cuello',
    name: 'Cuello (Cervical)',
    frac: 0.052,
    color: BODY_SEGMENT_SHADES.cuello,
    desc: '<b>Cuello ($L/H = 0{,}052$):</b> Comprende las 7 vértebras cervicales desde la base del cráneo hasta la línea de hombros.',
  },
  brazo: {
    id: 'brazo',
    name: 'Brazo Superior (Brachium)',
    frac: 0.186,
    color: BODY_SEGMENT_SHADES.brazo,
    desc: '<b>Brazo ($L/H = 0{,}186$):</b> Longitud del hueso húmero, desde el acromion hasta el epicóndilo lateral del codo.',
  },
  antebrazo: {
    id: 'antebrazo',
    name: 'Antebrazo (Antebrachium)',
    frac: 0.146,
    color: BODY_SEGMENT_SHADES.antebrazo,
    desc: '<b>Antebrazo ($L/H = 0{,}146$):</b> Cúbito y radio desde la fosa del codo hasta la apófisis estiloides de la muñeca.',
  },
  mano: {
    id: 'mano',
    name: 'Mano (Manus)',
    frac: 0.108,
    color: BODY_SEGMENT_SHADES.mano,
    desc: '<b>Mano ($L/H = 0{,}108$):</b> Desde el pliegue distal de la muñeca hasta el extremo del dedo medio.',
  },
  muslo: {
    id: 'muslo',
    name: 'Muslo (Femur)',
    frac: 0.245,
    color: BODY_SEGMENT_SHADES.muslo,
    desc: '<b>Muslo ($L/H = 0{,}245$):</b> Longitud del fémur, desde el trocánter mayor hasta la interlínea articular de la rodilla.',
  },
  pantorrilla: {
    id: 'pantorrilla',
    name: 'Pantorrilla (Crus)',
    frac: 0.246,
    color: BODY_SEGMENT_SHADES.pantorrilla,
    desc: '<b>Pantorrilla ($L/H = 0{,}246$):</b> Tibia y peroné desde el platillo tibial hasta el maléolo medial del tobillo.',
  },
  pie: {
    id: 'pie',
    name: 'Pie (Pes)',
    frac: 0.152,
    color: BODY_SEGMENT_SHADES.pie,
    desc: '<b>Pie ($L/H = 0{,}152$):</b> Longitud anteroposterior máxima desde el talón (calcáneo) hasta la punta del hallux.',
  },
  hombros: {
    id: 'hombros',
    name: 'Ancho de Hombros (Biacromial)',
    frac: 0.259,
    color: AMBER,
    desc: '<b>Ancho de Hombros ($L/H = 0{,}259$):</b> Distancia biacromial transversal entre ambos vértices escapulares.',
  },
};

export default function Slide9({ slideCount }: { slideCount?: string }) {
  const [height, setHeight] = useState<number>(172);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const currentDetail = selectedSegment ? SEGMENTS_DATA[selectedSegment] : null;

  // El apunte cambia después del render inicial; hay que volver a pasar
  // únicamente ese bloque por KaTeX para no dejar las fórmulas como texto.
  useEffect(() => {
    const info = document.getElementById('info-text-c2');
    if (!info) return undefined;

    // El contenedor puede recibir contenido nuevo después de que React monta
    // el slide; en ese caso KaTeX debe volver a procesar solo este bloque.
    const renderIfNeeded = () => {
      if (info.textContent?.includes('$') && !info.querySelector('.katex')) {
        renderC2Math();
      }
    };
    const timers = [0, 80, 200].map((delay) => window.setTimeout(renderIfNeeded, delay));
    const observer = new MutationObserver(renderIfNeeded);
    observer.observe(info, { childList: true, subtree: true, characterData: true });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
    };
  }, [selectedSegment]);

  const handleSelectSegment = (sKey: string) => {
    const next = selectedSegment === sKey ? null : sKey;
    setSelectedSegment(next);
  };

  const handleReset = () => {
    setHeight(172);
    setSelectedSegment(null);
    setHoveredSegment(null);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">C2</span>
        <span className="mtitle">Proporciones segmentarias</span>
        <span className="msub">Cada segmento es una fracción invariante de la altura H · Tabla 1.6</span>
        <span className="mslide-count">{slideCount ?? '2 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📏</span> Longitudes relativas (Tabla 1.6)
            </div>
            <div className="card-body">
              <table className="data-mini">
                <tbody>
                  <tr><th>Segmento</th><th>L / H</th><th>L calculada</th></tr>
                  {Object.values(SEGMENTS_DATA).map((s) => {
                    const isSel = selectedSegment === s.id;
                    const lenCm = fmt(s.frac * height, 1);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleSelectSegment(s.id)}
                        onMouseEnter={() => setHoveredSegment(s.id)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        style={{
                          cursor: 'pointer',
                          background: isSel ? 'var(--teal-tint)' : 'transparent',
                          fontWeight: isSel ? 700 : 'normal',
                        }}
                      >
                        <td>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: s.color, marginRight: '6px' }} />
                          <b>{s.name}</b>
                        </td>
                        <td>{fmt(s.frac, 3)}</td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', color: isSel ? 'var(--teal-deep)' : 'var(--ink-2)' }}>
                          {lenCm} cm
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="eq-block">
                {'\\[ \\frac{L_{\\text{segmento}}}{H} = \\text{constante} \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                Las proporciones <strong>no dependen de la estatura</strong>: una persona de 1,50 m y otra de 1,90 m comparten las mismas fracciones invariantes.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🖼️</span> Longitudes relativas (Fig. 1.15)
            </div>
            <div className="card-body">
              <div className="figure-pair" style={{ height: '140px' }}>
                <ChapterImageLightbox src="/assets/cap1/115.png" alt="Longitud de los segmentos corporales relativos a la altura" label="FIG 1.15 · Longitudes relativas">
                  <span className="fig-num">FIG 1.15</span>
                  <img src="/assets/cap1/115.png" alt="Longitud de los segmentos corporales relativos a la altura" />
                  <figcaption>Longitudes de los segmentos como fracción de H</figcaption>
                </ChapterImageLightbox>
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-c2">
              {currentDetail ? (
                <span dangerouslySetInnerHTML={{ __html: currentDetail.desc }} />
              ) : (
                'Pasa el cursor o haz clic sobre cada fila: la cota se resalta en el cuerpo y en la barra.'
              )}
            </div>
          </div>
        </div>
        <div className="sim-area" style={{ position: 'relative' }}>
          <ProportionsCanvas
            height={height}
            highlight={hoveredSegment || selectedSegment}
          />
          <div className="prof-controls">
            <span className="badge">C2 · Fracciones</span>
            <span>Mismo L/H para cualquier estatura</span>

            {/* Slider reactivo de Estatura */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.62rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Estatura</span>:
                <input
                  type="range"
                  min="140"
                  max="210"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value))}
                  style={{ width: '80px' }}
                />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', fontWeight: 'bold', color: 'var(--teal-deep)' }}>
                  {height} cm
                </span>
              </label>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              {selectedSegment && (
                <span style={{ fontSize: '0.60rem', color: 'var(--teal-deep)', fontWeight: 'bold' }}>
                  {SEGMENTS_DATA[selectedSegment]?.name}: {fmt((SEGMENTS_DATA[selectedSegment]?.frac || 0) * height, 1)} cm
                </span>
              )}
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
                }}
              >
                Restablecer (172 cm)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
