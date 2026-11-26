import React, { useState } from 'react';
import { C, ca } from './palette';
import MechanoreceptorsCanvas from './MechanoreceptorsCanvas';
import HudPanel from './HudPanel';
import KatexHtml from './KatexHtml';
import type { Engine } from './useEngine';

interface ReceptorOpt {
  id: 'meissner' | 'pacini' | 'merkel' | 'ruffini';
  name: string;
  type: string;
  best: string;
  depth: string;
  field: string;
  desc: string;
  color: string;
}

const RECEPTOR_LIST: ReceptorOpt[] = [
  {
    id: 'meissner',
    name: 'Meissner (RA1)',
    type: 'Adaptación Rápida 1',
    best: '3–40 Hz (libro)',
    depth: '~0,5 mm (Dermis papilar)',
    field: '3–5 mm (Puntual / Neto)',
    desc: '<b>Meissner (RA1):</b> Más profundos que Merkel, en la dermis. Detectan golpecitos ligeros, variaciones de $3\\text{--}40\\text{ Hz}$ que se perciben como aleteo (<i>flutter</i>). Campo receptivo pequeño. Esencial para detectar el deslizamiento inicial de objetos entre los dedos y reajustar instantáneamente la fuerza de prensión.',
    color: C.teal,
  },
  {
    id: 'pacini',
    name: 'Pacini (RA2)',
    type: 'Adaptación Ultra-Rápida 2',
    best: '10–500 Hz (libro)',
    depth: '~2–3 mm (Hipodermis profunda)',
    field: 'Grande y difuso (Palma/Dedo entero)',
    desc: '<b>Pacini (RA2):</b> Corpúsculos concéntricos gigantes en tejido subcutáneo profundo. Posee un filtro mecánico que atenúa presiones constantes y detecta un rango de vibraciones rápidas, de $10$ a $500\\text{ Hz}$. Permite percibir texturas nanométricas transmitidas a través de herramientas.',
    color: C.series3,
  },
  {
    id: 'merkel',
    name: 'Merkel (SA1)',
    type: 'Adaptación Lenta 1',
    best: '0,3–3 Hz (libro)',
    depth: '~0,2 mm (Estrato basal epidérmico)',
    field: '0,5–1 mm (Máxima agudeza)',
    desc: '<b>Merkel (SA1):</b> discos cerca de la frontera epidermis–dermis, los más sensibles a perturbaciones de presión de $0{,}3\\text{--}3\\text{ Hz}$. Máxima resolución espacial táctil ($0{,}5\\text{ mm}$). Descargan de forma sostenida ante presión estática, esquinas, bordes y curvaturas de objetos (lectura en Braille).',
    color: C.blood,
  },
  {
    id: 'ruffini',
    name: 'Ruffini (SA2)',
    type: 'Adaptación Lenta 2',
    best: '15–400 Hz (libro)',
    depth: '~1,5 mm (Dermis reticular)',
    field: 'Grande (Sensible a la dirección)',
    desc: '<b>Ruffini (SA2):</b> cilindros (terminaciones) en la dermis que detectan vibraciones de $15\\text{--}400\\text{ Hz}$, percibidas como zumbido. Sensibles a la deformación tangencial y al estiramiento de la piel durante los movimientos de los dedos y las articulaciones de la mano.',
    color: C.amber,
  },
];

interface Presets15 {
  name: string;
  rec: 'meissner' | 'pacini' | 'merkel' | 'ruffini';
  freq: number;
  depth: number;
  label: string;
}

const PRESETS_15: Presets15[] = [
  { name: 'Deslizamiento', rec: 'meissner', freq: 35, depth: 40, label: '35 Hz · 40 µm' },
  { name: 'Textura Fina', rec: 'pacini', freq: 250, depth: 20, label: '250 Hz · 20 µm' },
  { name: 'Borde Braille', rec: 'merkel', freq: 3, depth: 70, label: '3 Hz · 70 µm' },
  { name: 'Tracción Tisular', rec: 'ruffini', freq: 1, depth: 80, label: '1 Hz · 80 µm' },
];

export default function Slide15({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [selectedReceptor, setSelectedReceptor] = useState<'meissner' | 'pacini' | 'merkel' | 'ruffini'>('meissner');
  const [stimulusFreqHz, setStimulusFreqHz] = useState<number>(35);
  const [stimulusDepthUm, setStimulusDepthUm] = useState<number>(50);

  const curRec = RECEPTOR_LIST.find((r) => r.id === selectedReceptor) || RECEPTOR_LIST[0];

  const handleSelect = (id: 'meissner' | 'pacini' | 'merkel' | 'ruffini') => {
    setSelectedReceptor(id);
    if (id === 'pacini') {
      setStimulusFreqHz(250);
      setStimulusDepthUm(20);
    } else if (id === 'meissner') {
      setStimulusFreqHz(35);
      setStimulusDepthUm(40);
    } else if (id === 'merkel') {
      setStimulusFreqHz(3);
      setStimulusDepthUm(70);
    } else {
      setStimulusFreqHz(1);
      setStimulusDepthUm(80);
    }

  };

  const handleApplyPreset = (p: Presets15) => {
    setSelectedReceptor(p.rec);
    setStimulusFreqHz(p.freq);
    setStimulusDepthUm(p.depth);
  };

  const handleReset = () => {
    setSelectedReceptor('meissner');
    setStimulusFreqHz(35);
    setStimulusDepthUm(50);
  };

  // Cálculo estimativo de disparo neurofisiológico
  const estimatedSpikes = selectedReceptor === 'pacini'
    ? (stimulusFreqHz >= 80 ? Math.min(320, Math.round(stimulusFreqHz * (stimulusDepthUm > 20 ? 0.95 : 0.4))) : 0)
    : selectedReceptor === 'meissner'
    ? (stimulusFreqHz <= 90 ? Math.min(120, Math.round(stimulusFreqHz * 1.5)) : 15)
    : selectedReceptor === 'merkel'
    ? Math.round(15 + (stimulusDepthUm / 150) * 45)
    : Math.round(10 + (stimulusDepthUm / 150) * 30);

  return (
    <>
      <div className="module-header">
        <span className="mnum">G1</span>
        <h2 className="mtitle">Mecanorreceptores táctiles</h2>
        <span className="msub">§2.4 El sentido del tacto · Merkel, Meissner, Ruffini y Pacini</span>
        <span className="mslide-count">1 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">✋</span> Los 4 canales de la sensibilidad cutánea
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                Los sentidos somáticos incluyen el tacto (sensaciones cutáneas), la posición de las extremidades (propiocepción) y su movimiento (cinestesia). En la piel lampiña hay cuatro receptores táctiles, cada uno sensible a otra banda de frecuencias (Fig. 2.50):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '.62rem', marginTop: '0.62rem' }}>
                <button type="button" className="pill" aria-pressed={selectedReceptor === 'meissner'} style={{ borderLeft: `3px solid ${C.teal}`, cursor: 'pointer' }} onClick={() => handleSelect('meissner')}>
                  <b>RA1 (Meissner):</b> {'golpecitos ligeros, $3\\text{--}40\\text{ Hz}$: aleteo (flutter).'}
                </button>
                <button type="button" className="pill" aria-pressed={selectedReceptor === 'pacini'} style={{ borderLeft: `3px solid ${C.series3}`, cursor: 'pointer' }} onClick={() => handleSelect('pacini')}>
                  <b>RA2 (Pacini):</b> {'vibraciones rápidas, de $10$ a $500\\text{ Hz}$.'}
                </button>
                <button type="button" className="pill" aria-pressed={selectedReceptor === 'merkel'} style={{ borderLeft: `3px solid ${C.blood}`, cursor: 'pointer' }} onClick={() => handleSelect('merkel')}>
                  <b>SA1 (Merkel):</b> {'frontera epidermis–dermis; presión de $0{,}3\\text{--}3\\text{ Hz}$.'}
                </button>
                <button type="button" className="pill" aria-pressed={selectedReceptor === 'ruffini'} style={{ borderLeft: `3px solid ${C.amber}`, cursor: 'pointer' }} onClick={() => handleSelect('ruffini')}>
                  <b>SA2 (Ruffini):</b> {'estiramiento de la piel, movimiento articular; $15\\text{--}400\\text{ Hz}$: zumbido.'}
                </button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> Densidad, temperatura y dolor
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'La densidad de mecanorreceptores va de $25/\\text{cm}^2$ en la punta de la lengua a $0{,}02/\\text{cm}^2$ en la espalda; en la piel vellosa también cuenta el movimiento del pelo. Termorreceptores ($5\\text{--}10/\\text{cm}^2$): fibras cálidas de $30$ a $48^\\circ\\text{C}$ (mejor a $44^\\circ\\text{C}$) y frías de $20$ a $45^\\circ\\text{C}$ (mejor a $30^\\circ\\text{C}$). Nociceptores: presión excesiva, temperatura extrema y químicos corrosivos; por axones mielinizados hasta $30\\text{ m/s}$ o no mielinizados a $\\le 2\\text{ m/s}$ (dolor persistente). La conversión a señal eléctrica se ve en el Cap. 12.'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-15">
              <KatexHtml html={curRec.desc} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="NEUROFISIOLOGÍA TÁCTIL"
            badge={`${curRec.name.split(' ')[0]} · ${curRec.type.split(' ')[0]}`}
            footer="💡 Haz clic en los receptores del corte histológico 3D o usa los presets inferiores"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Receptor:</span>
                <b style={{ color: curRec.color }}>{curRec.name}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Adaptación:</span>
                <b style={{ color: 'var(--teal-deep)' }}>{curRec.type}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Profundidad:</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{curRec.depth}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Frecuencia Óptima:</span>
                <b style={{ color: C.teal, fontFamily: 'JetBrains Mono, monospace' }}>{curRec.best}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Estímulo Actual:</span>
                <b style={{ color: C.amber, fontFamily: 'JetBrains Mono, monospace' }}>{stimulusFreqHz} Hz ({stimulusDepthUm} µm)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tasa de Disparo:</span>
                <b style={{ color: C.coronal, fontFamily: 'JetBrains Mono, monospace' }}>{estimatedSpikes} espigas/s</b>
              </div>
            </div>
          </HudPanel>

          <MechanoreceptorsCanvas
            selectedReceptor={selectedReceptor}
            stimulusFreqHz={stimulusFreqHz}
            stimulusDepthUm={stimulusDepthUm}
            onSelectReceptor={handleSelect}
          />
          <div className="prof-controls">
            <span className="badge">§2.4 · Tacto</span>
            <span>Canal: <b style={{ color: curRec.color }}>{curRec.name}</b> ({estimatedSpikes} Hz)</span>

            <div style={{ display: 'flex', gap: '0.62rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: ca(C.card, 0.6) }}>
                {PRESETS_15.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    style={{
                      background: selectedReceptor === p.rec && stimulusFreqHz === p.freq ? RECEPTORS_MAP[p.rec] : 'transparent',
                      color: selectedReceptor === p.rec && stimulusFreqHz === p.freq ? C.card : 'var(--ink)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '2px 5px',
                      fontSize: '0.62rem',
                      fontWeight: selectedReceptor === p.rec && stimulusFreqHz === p.freq ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Freq:</span>
                <input
                  type="range"
                  min="1"
                  max="400"
                  value={stimulusFreqHz}
                  onChange={(e) => setStimulusFreqHz(parseFloat(e.target.value))}
                  style={{ width: '50px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '32px' }}>{stimulusFreqHz} Hz</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Indentación:</span>
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={stimulusDepthUm}
                  onChange={(e) => setStimulusDepthUm(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{stimulusDepthUm} µm</b>
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
                }}
              >
                Restablecer
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

const RECEPTORS_MAP: Record<string, string> = {
  meissner: C.teal,
  pacini: C.series3,
  merkel: C.blood,
  ruffini: C.amber,
};
