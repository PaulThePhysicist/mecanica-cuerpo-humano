import React, { useEffect, useState } from 'react';
import MobilityCanvas from './MobilityCanvas';
import BodyScene from './BodyScene';
import { romReadout, TABLE_110 } from './romTable';
import ChapterImageLightbox from './ChapterImageLightbox';
import Tex from './Tex';
import type { MobilityRange } from './romTable';
import { useHarmonicClock } from './three/useHarmonicClock';
import { fmt, fmtMil } from './format';
// @ts-ignore - katex auto-render no incluye tipos
import renderMathInElement from 'katex/contrib/auto-render';

interface JointDetail {
  id: string;
  name: string;
  rom: string;
  plane: string;
  desc: string;
}

const JOINTS_DATA: Record<string, JointDetail> = {
  'hombro-flex': {
    id: 'hombro-flex',
    name: 'Hombro · Flexión / Extensión',
    rom: '188° / 61°',
    plane: 'Plano Sagital',
    desc: '<b>Hombro (Flexión/Extensión · $188^\\circ / 61^\\circ$):</b> El arco más amplio del miembro superior. Permite elevar el brazo completamente sobre la cabeza.',
  },
  'hombro-abd': {
    id: 'hombro-abd',
    name: 'Hombro · Abducción / Aducción',
    rom: '134° / 48°',
    plane: 'Plano Coronal',
    desc: '<b>Hombro (Abducción/Aducción · $134^\\circ / 48^\\circ$):</b> Movimiento frontal impulsado por el deltoides y supraespinoso.',
  },
  'hombro-rot': {
    id: 'hombro-rot',
    name: 'Hombro · Rotación Medial / Lateral',
    rom: '97° / 34°',
    plane: 'Rotación Axial',
    desc: '<b>Hombro (Rotación · $97^\\circ / 34^\\circ$):</b> Manguito rotador (subescapular vs. infraespinoso y redondo menor).',
  },
  codo: {
    id: 'codo',
    name: 'Codo · Flexión',
    rom: '142°',
    plane: 'Plano Sagital',
    desc: '<b>Codo (Flexión · $142^\\circ$):</b> Articulación en bisagra pura de 1 GL (humerocubital). Tope suave por choque muscular anterior.',
  },
  antebrazo: {
    id: 'antebrazo',
    name: 'Antebrazo · Supinación / Pronación',
    rom: '113° / 77°',
    plane: 'Pivote Radiocubital',
    desc: '<b>Antebrazo (Pivote · $113^\\circ / 77^\\circ$):</b> Rotación del radio sobre el cúbito que añade un grado de libertad crucial a la manipulación.',
  },
  muneca: {
    id: 'muneca',
    name: 'Muñeca · Flexión / Extensión',
    rom: '90° / 99°',
    plane: 'Plano Sagital',
    desc: '<b>Muñeca (Condílea · $90^\\circ / 99^\\circ$):</b> Flexión palmar y dorsiflexión de los 8 huesos del carpo sobre el radio.',
  },
  cadera: {
    id: 'cadera',
    name: 'Cadera · Flexión',
    rom: '113°',
    plane: 'Plano Sagital',
    desc: '<b>Cadera (Coxofemoral · $113^\\circ$):</b> Enartrosis profunda de gran estabilidad para la marcha y soporte de peso.',
  },
  rodilla: {
    id: 'rodilla',
    name: 'Rodilla · Flexión',
    rom: '125°',
    plane: 'Plano Sagital',
    desc: '<b>Rodilla (Femorotibial · $125^\\circ$):</b> Bisagra modificada con deslizamiento y rodadura cóndilo-meniscal.',
  },
  tobillo: {
    id: 'tobillo',
    name: 'Tobillo · Flexión / Extensión',
    rom: '35° / 38°',
    plane: 'Plano Sagital',
    desc: '<b>Tobillo (Talocrural · $35^\\circ / 38^\\circ$):</b> Flexión dorsal y flexión plantar para el despegue e impacto al caminar.',
  },
};

const MOBILITY_3D_DATA: Record<string, MobilityRange> = {
  'hombro-flex': { joint: 'hombro-flex', label: 'Hombro · flexión', primary: 188, secondary: 61, primaryLabel: 'Flexión', secondaryLabel: 'Extensión', plane: 'sagittal', position: [-0.095, 0.311, -0.015] },
  'hombro-abd': { joint: 'hombro-abd', label: 'Hombro · abducción', primary: 134, secondary: 48, primaryLabel: 'Abducción', secondaryLabel: 'Aducción', plane: 'coronal', position: [-0.095, 0.311, -0.015] },
  'hombro-rot': { joint: 'hombro-rot', label: 'Hombro · rotación', primary: 97, secondary: 34, primaryLabel: 'Medial', secondaryLabel: 'Lateral', plane: 'axial', position: [-0.095, 0.311, -0.015] },
  codo: { joint: 'codo', label: 'Codo · flexión', primary: 142, primaryLabel: 'Flexión', plane: 'sagittal', position: [-0.124, 0.145, -0.019] },
  antebrazo: { joint: 'antebrazo', label: 'Antebrazo · pivote', primary: 113, secondary: 77, primaryLabel: 'Supinación', secondaryLabel: 'Pronación', plane: 'axial', position: [-0.136, 0.135, -0.018] },
  muneca: { joint: 'muneca', label: 'Muñeca · flexión', primary: 90, secondary: 99, primaryLabel: 'Flexión', secondaryLabel: 'Extensión', plane: 'sagittal', position: [-0.155, 0.005, 0.008] },
  cadera: { joint: 'cadera', label: 'Cadera · flexión', primary: 113, primaryLabel: 'Flexión', plane: 'sagittal', position: [-0.039, 0.002, -0.003] },
  rodilla: { joint: 'rodilla', label: 'Rodilla · flexión', primary: 125, primaryLabel: 'Flexión', plane: 'sagittal', position: [-0.040, -0.250, -0.019] },
  tobillo: { joint: 'tobillo', label: 'Tobillo · flexión', primary: 35, secondary: 38, primaryLabel: 'Dorsiflexión', secondaryLabel: 'Plantar', plane: 'sagittal', position: [-0.039, -0.460, -0.020] },
};

/* P6-31 · Tabla 1.11 (selección de 12 de 29, masa y volumen) y Tabla 1.12
   (célula de 20 µm, 7 filas), literales del .tex (líneas 543–571 y 589–595). */
const BODY_MASS_G = 70000;
const TABLE_111: [string, number, number][] = [
  ['Músculo', 30000, 23000],
  ['Grasa', 10500, 12000],
  ['Esqueleto', 10000, 6875],
  ['Sangre (contenido de los vasos)', 5600, 5400],
  ['Piel', 2000, 1800],
  ['Tracto gastrointestinal', 2000, 1800],
  ['Hígado', 1650, 1470],
  ['Cerebro', 1400, 1350],
  ['Pulmones (2)', 825, 775],
  ['Corazón', 330, 300],
  ['Riñones (2)', 300, 270],
  ['Vejiga urinaria', 150, 140],
];
const TABLE_112: { molecule: string; massPct: string; mw: string; count: string; kinds: string }[] = [
  { molecule: 'Agua', massPct: '65', mw: '18', count: '1{,}74 \\times 10^{14}', kinds: '1' },
  { molecule: 'Otros inorgánicos', massPct: '1,5', mw: '55', count: '1{,}31 \\times 10^{12}', kinds: '20' },
  { molecule: 'Lípidos (grasas)', massPct: '12', mw: '700', count: '8{,}4 \\times 10^{11}', kinds: '50' },
  { molecule: 'Otros orgánicos', massPct: '0,4', mw: '250', count: '7{,}7 \\times 10^{10}', kinds: '~200' },
  { molecule: 'Proteínas', massPct: '20', mw: '50 000', count: '1{,}9 \\times 10^{10}', kinds: '~5 000' },
  { molecule: 'ARN', massPct: '1,0', mw: '1 \\times 10^{6}', count: '5 \\times 10^{7}', kinds: '--' },
  { molecule: 'ADN', massPct: '0,1', mw: '1 \\times 10^{11}', count: '46', kinds: '--' },
];

function renderC3Math() {
  const info = document.getElementById('info-text-c3');
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

export default function Slide10({ slideCount }: { slideCount?: string }) {
  const [selectedJoint, setSelectedJoint] = useState<string>('hombro-flex');
  const [massTab, setMassTab] = useState<'organs' | 'cell'>('organs');
  const [show3D, setShow3D] = useState(true);
  const [sceneReset, setSceneReset] = useState(0);
  // Fase 0..1 del recorrido: 0 = tope secundario (p. ej. extensión), 1 = tope
  // primario (flexión). El esqueleto y la aguja del goniómetro salen de aquí.
  const [progress, setProgress] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0);

  const currentDetail = JOINTS_DATA[selectedJoint] || JOINTS_DATA['hombro-flex'];
  const currentRange = MOBILITY_3D_DATA[selectedJoint];
  const readout = currentRange ? romReadout(currentRange, progress) : null;

  // Barrido pendular entre los dos topes de Tabla 1.10 (reloj compartido).
  useHarmonicClock({ playing: isAnimating && show3D, speed: animSpeed }, (t) => {
    setProgress((Math.sin(t * 1.1 - Math.PI / 2) + 1) / 2);
  });

  useEffect(() => {
    const info = document.getElementById('info-text-c3');
    if (!info) return undefined;

    const renderIfNeeded = () => {
      if (info.textContent?.includes('$') && !info.querySelector('.katex')) {
        renderC3Math();
      }
    };
    const timers = [0, 80, 200].map((delay) => window.setTimeout(renderIfNeeded, delay));
    const observer = new MutationObserver(renderIfNeeded);
    observer.observe(info, { childList: true, subtree: true, characterData: true });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
    };
  }, [selectedJoint]);

  const handleSelectJoint = (jKey: string) => {
    setSelectedJoint(jKey);
    setProgress(0); // arranca en la posición neutra / tope secundario
  };

  const handleReset = () => {
    setSelectedJoint('hombro-flex');
    setSceneReset((value) => value + 1);
    setProgress(0);
    setIsAnimating(false);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">C3</span>
        <span className="mtitle">Movilidad y masa de órganos</span>
        <span className="msub">Rangos de movimiento articular (ROM) · Tablas 1.10–1.12</span>
        <span className="mslide-count">{slideCount ?? '3 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏹</span> Rango de movilidad articular (Tabla 1.10 · Fig. 1.16)
            </div>
            <div className="card-body">
              <table className="data-mini" id="mobilityTable">
                <tbody>
                  <tr><th>Movimientos opuestos</th><th>Media <span className="nt">(°)</span></th><th><span className="nt">SD (°)</span></th></tr>
                  {TABLE_110.map((r) => {
                    const jId = r.joint;
                    if (!jId) {
                      return (
                        <tr key={r.motion}>
                          <td>{r.motion}</td><td className="num">{r.mean}</td><td>{r.sd}</td>
                        </tr>
                      );
                    }
                    const isSel = selectedJoint === jId;
                    return (
                      <tr
                        key={r.motion}
                        className="row-link"
                        onClick={() => handleSelectJoint(jId)}
                        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleSelectJoint(jId); } }}
                        tabIndex={0}
                        aria-selected={isSel}
                      >
                        <td><b>{r.motion}</b></td><td className="num">{r.mean}</td><td>{r.sd}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', marginTop: '.35rem' }}>
                <div className="figure-pair" style={{ height: '96px', flex: '0 0 150px' }}>
                  <ChapterImageLightbox src="/assets/cap1/116.png" alt="Posturas de los rangos de movilidad de la Tabla 1.10" label="FIG 1.16 · Posturas de la Tabla 1.10">
                    <span className="fig-num">FIG 1.16</span>
                    <img src="/assets/cap1/116.png" alt="Posturas de los rangos de movilidad de la Tabla 1.10" />
                  </ChapterImageLightbox>
                </div>
                <p className="table-note" style={{ marginTop: 0 }}>
                  Varones en edad universitaria, grados. Con media <Tex>{'A'}</Tex> y desviación estándar SD,
                  ≈ 68 % de las personas cae entre <Tex>{'A - \\mathrm{SD}'}</Tex> y <Tex>{'A + \\mathrm{SD}'}</Tex>.
                  En negrita, las filas con arco en el esqueleto 3D.
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫀</span> Órganos y célula (Tablas 1.11–1.12)
            </div>
            <div className="card-body">
              <div className="card-tabs" role="tablist" aria-label="Tablas de órganos y célula">
                <button type="button" role="tab" aria-selected={massTab === 'organs'} onClick={() => setMassTab('organs')}>
                  Órganos (1.11)
                </button>
                <button type="button" role="tab" aria-selected={massTab === 'cell'} onClick={() => setMassTab('cell')}>
                  Célula (1.12)
                </button>
              </div>
              {massTab === 'organs' ? (
                <>
                  <table className="data-mini" role="tabpanel">
                    <tbody>
                      <tr><th>Tejido u órgano</th><th>Masa <span className="nt">(g)</span></th><th>Volumen <span className="nt">(cm³)</span></th><th>% de la masa</th></tr>
                      {TABLE_111.map(([name, mass, vol]) => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td className="num">{fmtMil(mass)}</td>
                          <td className="num">{fmtMil(vol)}</td>
                          <td>{fmt((mass / BODY_MASS_G) * 100, 1)} %</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="table-note">Selección de 12 de 29 filas. Varón adulto: 70 000 g y 60 000 cm³.</p>
                </>
              ) : (
                <>
                  <table className="data-mini" role="tabpanel">
                    <tbody>
                      <tr><th>Molécula</th><th>Masa <span className="nt">(%)</span></th><th>Peso molecular <span className="nt">(uma)</span></th><th>Moléculas</th><th>Tipos distintos</th></tr>
                      {TABLE_112.map((r) => (
                        <tr key={r.molecule}>
                          <td>{r.molecule}</td>
                          <td className="num">{r.massPct}</td>
                          <td className="num">{r.mw.includes('times') ? <Tex>{r.mw}</Tex> : r.mw}</td>
                          <td className="num"><Tex>{r.count}</Tex></td>
                          <td>{r.kinds}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="table-note">Contenido molecular bruto estimado de una célula humana típica de 20 µm.</p>
                </>
              )}
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-c3">
              <span dangerouslySetInnerHTML={{ __html: currentDetail.desc }} />
            </div>
          </div>
        </div>
        <div className="sim-area c3-mobility-area" style={{ position: 'relative' }}>
          {show3D ? (
            <BodyScene id="sim-mobility-3d" mode="regions" selected={null} resetSignal={sceneReset} mobility={currentRange} progress={progress} />
          ) : (
            <MobilityCanvas selectedJoint={selectedJoint} />
          )}
          <div className="prof-controls">
            <span className="badge">C3 · Rangos</span>
            <span>{currentDetail.name}: <b style={{ color: 'var(--blood)' }}>{currentDetail.rom}</b></span>

            {/* Lectura en vivo: qué movimiento se está ejecutando y cuántos grados
                lleva recorridos. Es el puente entre la Tabla 1.10 y el esqueleto. */}
            {show3D && readout && (
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.62rem',
                  background: 'var(--teal-tint)',
                  border: '1px solid var(--teal)',
                  color: 'var(--teal-deep)',
                  borderRadius: '4px',
                  padding: '1px 6px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                {readout.label} {fmt(readout.deg, 0)}°
              </span>
            )}

            {show3D && (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem' }}>
                <span>Fase</span>:
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(progress * 100)}
                  onChange={(e) => {
                    setIsAnimating(false);
                    setProgress(parseFloat(e.target.value) / 100);
                  }}
                  style={{ width: '70px' }}
                />
              </label>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {show3D && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px 3px' }}>
                    {[0.5, 1.0, 1.5].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setAnimSpeed(spd)}
                        style={{
                          border: 'none',
                          background: animSpeed === spd ? 'var(--teal)' : 'transparent',
                          color: animSpeed === spd ? '#ffffff' : 'var(--ink-3)',
                          borderRadius: '2px',
                          padding: '1px 4px',
                          fontSize:  'max(12px, 0.55rem)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {String(spd).replace('.', ',')}x
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnimating((a) => !a)}
                    style={{
                      background: isAnimating ? 'var(--teal-tint)' : 'var(--paper-2)',
                      border: `1px solid ${isAnimating ? 'var(--teal)' : 'var(--line)'}`,
                      color: isAnimating ? 'var(--teal-deep)' : 'var(--ink)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.64rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isAnimating ? '⏸ Pausar' : '▶ Animar'}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setShow3D((value) => !value)}
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
                {show3D ? 'Vista 2D' : 'Vista 3D'}
              </button>
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
      </div>
    </>
  );
}
