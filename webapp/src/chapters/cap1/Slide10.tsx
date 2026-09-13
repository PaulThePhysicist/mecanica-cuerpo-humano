import React, { useEffect, useState } from 'react';
import MobilityCanvas from './MobilityCanvas';
import BodyScene from './BodyScene';
import { romReadout } from './romTable';
import type { MobilityRange } from './romTable';
import { useHarmonicClock } from './three/useHarmonicClock';
import { fmt } from './format';
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
        <span className="msub">Rangos de movimiento articular (ROM) · Tablas 1.10–1.11</span>
        <span className="mslide-count">{slideCount ?? '3 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏹</span> Rango de movilidad articular (Tabla 1.10)
            </div>
            <div className="card-body">
              <table className="interactive-table" id="mobilityTable">
                <tbody>
                  <tr><th>Articulación / Movimiento</th><th>Media (ROM)</th></tr>
                  {Object.values(JOINTS_DATA).map((j) => {
                    const isSel = selectedJoint === j.id;
                    return (
                      <tr
                        key={j.id}
                        onClick={() => handleSelectJoint(j.id)}
                        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleSelectJoint(j.id); } }}
                        tabIndex={0}
                        aria-selected={isSel}
                        style={{
                          cursor: 'pointer',
                          background: isSel ? 'var(--teal-tint)' : 'transparent',
                          fontWeight: isSel ? 700 : 'normal',
                        }}
                      >
                        <td>
                          <b>{j.name}</b>
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', color: isSel ? '#b02318' : 'var(--teal-deep)' }}>
                          {j.rom}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: '.6rem', color: 'var(--ink-3)', marginTop: '.2rem' }}>
                Varones universitarios · media en grados (ver Fig. 1.16).
              </p>
              <p style={{ fontSize: '.6rem', color: 'var(--ink-3)', marginTop: '.1rem' }}>
                Pasa el cursor o haz clic sobre cada fila para ver el rango en el esqueleto 3D.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫀</span> Masa de los órganos (Tabla 1.11)
            </div>
            <div className="card-body">
              <table className="data-mini">
                <tbody>
                  <tr><th>Órgano / Tejido</th><th>Masa (g)</th><th>% del total</th></tr>
                  <tr><td><b>Músculo esquelético</b></td><td>30 000 g</td><td>42,9 %</td></tr>
                  <tr><td><b>Tejido adiposo (grasa)</b></td><td>10 500 g</td><td>15,0 %</td></tr>
                  <tr><td><b>Esqueleto óseo</b></td><td>10 000 g</td><td>14,3 %</td></tr>
                  <tr><td><b>Hígado</b></td><td>1 650 g</td><td>2,4 %</td></tr>
                  <tr><td><b>Cerebro</b></td><td>1 400 g</td><td>2,0 %</td></tr>
                  <tr><td><b>Pulmones (2)</b></td><td>825 g</td><td>1,2 %</td></tr>
                  <tr><td><b>Corazón</b></td><td>330 g</td><td>0,5 %</td></tr>
                  <tr><td><b>Riñones (2)</b></td><td>300 g</td><td>0,4 %</td></tr>
                </tbody>
              </table>
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
            <span>{currentDetail.name}: <b style={{ color: '#b02318' }}>{currentDetail.rom}</b></span>

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
                          fontSize: '0.55rem',
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
