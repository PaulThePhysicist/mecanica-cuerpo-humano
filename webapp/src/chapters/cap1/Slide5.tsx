import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import SynovialJointCanvas, { type JointType } from './SynovialJointCanvas';

interface Slide5Props {
  toggleJointsAnimation?: () => void;
  slideCount?: string;
}

interface JointPreset {
  label: string;
  angles: { a1: number; a2: number; a3: number };
}

interface JointMeta {
  id: JointType;
  name: string;
  gl: number;
  glLabel: string;
  examples: string;
  surface: string;
  sliders: { key: 'a1' | 'a2' | 'a3'; label: string; min: number; max: number; default: number; unit: string }[];
  presets: JointPreset[];
  desc: string;
  kinematics: string;
}

const JOINTS_DATA: Record<JointType, JointMeta> = {
  hinge: {
    id: 'hinge',
    name: 'Bisagra (Ginglymus)',
    gl: 1,
    glLabel: '1 GL · Flexión / Extensión',
    examples: 'Codo (humerocubital), rodilla, interfalángicas',
    surface: 'Tróclea humeral convexa en escotadura troclear cubital',
    sliders: [{ key: 'a1', label: 'Flexión', min: 0, max: 140, default: 45, unit: '°' }],
    presets: [
      { label: 'Extensión (0°)', angles: { a1: 0, a2: 0, a3: 0 } },
      { label: 'Funcional (90°)', angles: { a1: 90, a2: 0, a3: 0 } },
      { label: 'Flexión máx (135°)', angles: { a1: 135, a2: 0, a3: 0 } },
    ],
    desc: '<b>Bisagra (Ginglymus · 1 GL):</b> Cilindro óseo (tróclea humeral) que rota en un canal cóncavo (escotadura sigmoidea mayor del cúbito). Su eje transversal único restringe el movimiento a flexión y extensión pura en el plano sagital.',
    kinematics: 'Rotación uniaxial pura alrededor del eje transversal epicondilar: $\\theta_x \\in [0^\\circ, 140^\\circ]$.',
  },
  pivot: {
    id: 'pivot',
    name: 'Pivote (Trocoide)',
    gl: 1,
    glLabel: '1 GL · Rotación axial',
    examples: 'Radiocubital proximal, atlantoaxial (C1–C2)',
    surface: 'Cabeza del radio en anillo osteofibroso del cúbito y lig. anular',
    sliders: [{ key: 'a1', label: 'Pron/Sup', min: -80, max: 80, default: 35, unit: '°' }],
    presets: [
      { label: 'Supinación (+75°)', angles: { a1: 75, a2: 0, a3: 0 } },
      { label: 'Neutro (0°)', angles: { a1: 0, a2: 0, a3: 0 } },
      { label: 'Pronación (-75°)', angles: { a1: -75, a2: 0, a3: 0 } },
    ],
    desc: '<b>Pivote (Trocoide · 1 GL):</b> Vástago cilíndrico (cabeza del radio) que rota dentro de un anillo osteofibroso formado por el ligamento anular y la escotadura radial del cúbito. Permite la pronosupinación del antebrazo.',
    kinematics: 'Rotación axial pura sobre el eje longitudinal diafisario: $\\theta_y \\in [-80^\\circ, +80^\\circ]$.',
  },
  condylar: {
    id: 'condylar',
    name: 'Condílea (Elipsoidea)',
    gl: 2,
    glLabel: '2 GL · Biaxial (Flex/Ext + Desv)',
    examples: 'Muñeca (radiocarpiana), metacarpofalángicas (MCP)',
    surface: 'Cóndilo elipsoide (escafoides + semilunar) en fosa glenoidea del radio',
    sliders: [
      { key: 'a1', label: 'Flex/Ext', min: -40, max: 70, default: 25, unit: '°' },
      { key: 'a2', label: 'Desv. R/C', min: -30, max: 30, default: 15, unit: '°' },
    ],
    presets: [
      { label: 'Neutra (0°, 0°)', angles: { a1: 0, a2: 0, a3: 0 } },
      { label: 'Dorsiflexión (+55°)', angles: { a1: 55, a2: 0, a3: 0 } },
      { label: 'Desv. Cubital (+25°)', angles: { a1: 10, a2: 25, a3: 0 } },
    ],
    desc: '<b>Condílea (Elipsoidea · 2 GL):</b> Cabeza condilar elíptica encajada en cavidad cóncava receptora. Permite dos grados de libertad angulares independientes: flexión/extensión (plano sagital) y desviación radial/cubital (plano frontal).',
    kinematics: 'Movimiento angular biaxial ortogonal: $(\\theta_x, \\theta_z)$ sin rotación axial libre.',
  },
  saddle: {
    id: 'saddle',
    name: 'Silla de montar (Encaje recíproco)',
    gl: 2,
    glLabel: '2 GL · Oposición biaxial',
    examples: 'Pulgar (trapeciometacarpiana CMC-1), esternoclavicular',
    surface: 'Superficie cóncavo-convexa del trapecio con base recíproca del 1er metacarpiano',
    sliders: [
      { key: 'a1', label: 'Flex/Ext', min: -35, max: 35, default: 20, unit: '°' },
      { key: 'a2', label: 'Abduc/Opos', min: -30, max: 30, default: -15, unit: '°' },
    ],
    presets: [
      { label: 'Reposo (0°, 0°)', angles: { a1: 0, a2: 0, a3: 0 } },
      { label: 'Abducción (+25°)', angles: { a1: 5, a2: 25, a3: 0 } },
      { label: 'Oposición (+25°, -25°)', angles: { a1: 25, a2: -25, a3: 0 } },
    ],
    desc: '<b>Silla de montar (Sellar · 2 GL):</b> Dos superficies recíprocamente cóncavas y convexas orientadas a 90° (como jinete y montura). Clave anatómica del pulgar humano (CMC-1) que permite la pinza de precisión y prensión.',
    kinematics: 'Acoplamiento biaxial con rotación automática adjunta durante la oposición del pulgar.',
  },
  ball: {
    id: 'ball',
    name: 'Esferoidal (Enartrosis)',
    gl: 3,
    glLabel: '3 GL · Multiaxial / Esférico',
    examples: 'Hombro (glenohumeral), cadera (coxofemoral)',
    surface: 'Cabeza esférica del húmero en la cavidad glenoidea con rodete (labrum)',
    sliders: [
      { key: 'a1', label: 'Flex/Ext', min: -50, max: 50, default: 20, unit: '°' },
      { key: 'a2', label: 'Abducción', min: -45, max: 45, default: 25, unit: '°' },
      { key: 'a3', label: 'Rot. Axial', min: -60, max: 60, default: -20, unit: '°' },
    ],
    presets: [
      { label: 'Anatómica (0°, 0°, 0°)', angles: { a1: 0, a2: 0, a3: 0 } },
      { label: 'Abducción (+40°)', angles: { a1: 0, a2: 40, a3: 0 } },
      { label: 'Circunducción', angles: { a1: 30, a2: 30, a3: -25 } },
    ],
    desc: '<b>Esferoidal (Enartrosis · 3 GL):</b> Cabeza esférica completa alojada en un cuenco cóncavo ampliado por el rodete glenoideo. Posee los 3 grados de libertad rotacionales: flexión/extensión, abducción/aducción y rotación axial interna/externa.',
    kinematics: 'Espacio de configuración tridimensional: $(\\theta_x, \\theta_y, \\theta_z) \\in SO(3)$ con circunducción libre.',
  },
  plane: {
    id: 'plane',
    name: 'Plana (Artrodia)',
    gl: 2,
    glLabel: '2 GL · Deslizamiento planar',
    examples: 'Acromioclavicular, intercarpianas, intertarsianas',
    surface: 'Carilla acromial de la escápula y faceta acromial de la clavícula',
    sliders: [
      { key: 'a1', label: 'Despl. X', min: -30, max: 30, default: 15, unit: 'mm' },
      { key: 'a2', label: 'Despl. Z', min: -30, max: 30, default: -10, unit: 'mm' },
    ],
    presets: [
      { label: 'Centrado (0, 0)', angles: { a1: 0, a2: 0, a3: 0 } },
      { label: 'Despl. +X (+2mm)', angles: { a1: 20, a2: 0, a3: 0 } },
      { label: 'Despl. +Z (+2mm)', angles: { a1: 0, a2: 20, a3: 0 } },
    ],
    desc: '<b>Plana / Deslizante (Artrodia · 2 GL):</b> Carillas articulares casi planas separadas por disco o fibrocartílago. Permiten deslizamientos traslacionales microscópicos guiados y contenidos por cápsulas y ligamentos.',
    kinematics: 'Traslaciones planares biaxiales $(\\Delta x, \\Delta z)$ acopladas a micro-rotaciones de acomodación.',
  },
};

export default function Slide5({ toggleJointsAnimation, slideCount }: Slide5Props) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; label: string } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  const openFigure = (src: string, alt: string, label: string) => setLightbox({ src, alt, label });
  const [selectedJoint, setSelectedJoint] = useState<JointType>('hinge');
  const [isAnimating, setIsAnimating] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomSignal, setZoomSignal] = useState<{ type: 'in' | 'out'; time: number } | null>(null);

  const [angles, setAngles] = useState<{ a1: number; a2: number; a3: number }>({
    a1: 45,
    a2: 0,
    a3: 0,
  });

  const animTimeRef = useRef(0);
  const animRafRef = useRef<number | null>(null);

  const currentMeta = JOINTS_DATA[selectedJoint];

  const handleSelectJoint = (jId: JointType) => {
    setSelectedJoint(jId);
    const meta = JOINTS_DATA[jId];
    const newAngles = {
      a1: meta.sliders[0]?.default ?? 0,
      a2: meta.sliders[1]?.default ?? 0,
      a3: meta.sliders[2]?.default ?? 0,
    };
    setAngles(newAngles);
    setIsAnimating(false);

    const info = document.getElementById('info-text-b2');
    if (info && meta.desc) {
      info.innerHTML = meta.desc;
    }
  };

  // Loop de animación armónica cinemática personalizada para cada articulación
  useEffect(() => {
    if (!isAnimating) {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      return;
    }

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      animTimeRef.current += dt;
      const t = animTimeRef.current;

      if (selectedJoint === 'hinge') {
        setAngles({ a1: 65 + Math.sin(t * 2.2) * 55, a2: 0, a3: 0 });
      } else if (selectedJoint === 'pivot') {
        // Pronosupinación completa: recorre el rango configurado del pivote
        // radiocubital (-80° a +80°) para que se aprecie el cruce distal del radio.
        setAngles({ a1: Math.sin(t * 2.0) * 80, a2: 0, a3: 0 });
      } else if (selectedJoint === 'condylar') {
        setAngles({ a1: 20 + Math.sin(t * 1.8) * 35, a2: Math.sin(t * 2.4) * 22, a3: 0 });
      } else if (selectedJoint === 'saddle') {
        setAngles({ a1: Math.sin(t * 1.6) * 25, a2: Math.cos(t * 1.6) * 20, a3: 0 });
      } else if (selectedJoint === 'plane') {
        setAngles({ a1: Math.sin(t * 2.0) * 22, a2: Math.cos(t * 1.7) * 20, a3: 0 });
      } else if (selectedJoint === 'ball') {
        setAngles({
          a1: Math.sin(t * 1.5) * 35,
          a2: Math.cos(t * 1.3) * 30,
          a3: Math.sin(t * 1.9) * 45,
        });
      }

      animRafRef.current = requestAnimationFrame(loop);
    };

    animRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
    };
  }, [isAnimating, selectedJoint]);

  const handleZoomIn = () => setZoomSignal({ type: 'in', time: Date.now() });
  const handleZoomOut = () => setZoomSignal({ type: 'out', time: Date.now() });
  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setIsAnimating(false);
    const meta = JOINTS_DATA[selectedJoint];
    setAngles({
      a1: meta.sliders[0]?.default ?? 0,
      a2: meta.sliders[1]?.default ?? 0,
      a3: meta.sliders[2]?.default ?? 0,
    });
  };

  const applyPreset = (presetAngles: { a1: number; a2: number; a3: number }) => {
    setIsAnimating(false);
    setAngles(presetAngles);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">B2</span>
        <span className="mtitle">Articulaciones sinoviales</span>
        <span className="msub">6 tipos anatómicos · de 1 a 3 GL</span>
        <span className="mslide-count">{slideCount ?? '2 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦴</span> Clasificación estructural y mecánica
            </div>
            <div className="card-body">
              <div className="row">
                <span className="pill"><b>Fibrosas</b> · sinartrosis: fijas</span>
                <span className="pill"><b>Cartilaginosas</b> · anfiartrosis: semimóviles</span>
                <span className="pill active"><b>Sinoviales</b> · diartrosis: libres</span>
              </div>
              <p style={{ fontSize: '.64rem', marginTop: '.2rem' }}>
                Las <strong>sinoviales</strong>, provistas de cápsula, <strong>cartílago hialino</strong> ({'$\\mu \\approx 0.001$'}) y <strong>líquido sinovial</strong>, se clasifican por la <strong>forma geométrica de sus superficies óseas</strong>.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-hdr">
              <span className="icon">📋</span> Los 6 tipos sinoviales (Modelos 3D reales)
            </div>
            <div className="card-body">
              <table className="data-mini">
                <tbody>
                  <tr><th>Tipo</th><th>GL</th><th>Articulación ósea</th></tr>
                  {(['hinge', 'pivot', 'condylar', 'saddle', 'plane', 'ball'] as JointType[]).map((jId) => {
                    const item = JOINTS_DATA[jId];
                    const isSel = selectedJoint === jId;
                    return (
                      <tr
                        key={jId}
                        onClick={() => handleSelectJoint(jId)}
                        style={{
                          cursor: 'pointer',
                          background: isSel ? 'var(--teal-tint)' : 'transparent',
                          fontWeight: isSel ? 700 : 400,
                        }}
                      >
                        <td><b>{item.name.split('(')[0].trim()}</b></td>
                        <td><span className="tag">{item.gl} GL</span></td>
                        <td>{item.examples.split(',')[0]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔬</span> Cinemática y Superficies Articulares
            </div>
            <div className="card-body">
              <div className="figure-pair" style={{ height: '115px' }}>
                <figure className="zoomable-figure" tabIndex={0} role="button" aria-label="Ampliar FIG 1.3" onClick={() => openFigure('/assets/cap1/13.png', 'Articulación sinovial de la rodilla', 'FIG 1.3 · Cápsula, cartílago y líquido')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openFigure('/assets/cap1/13.png', 'Articulación sinovial de la rodilla', 'FIG 1.3 · Cápsula, cartílago y líquido'); } }}>
                  <span className="fig-num">FIG 1.3</span>
                  <img src="/assets/cap1/13.png" alt="Articulación sinovial de la rodilla" />
                  <figcaption>Cápsula, cartílago y líquido</figcaption>
                </figure>
                <figure className="zoomable-figure" tabIndex={0} role="button" aria-label="Ampliar FIG 1.11" onClick={() => openFigure('/assets/cap1/111.png', 'Ejes de rotación de las articulaciones sinoviales', 'FIG 1.11 · Ejes según el tipo')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openFigure('/assets/cap1/111.png', 'Ejes de rotación de las articulaciones sinoviales', 'FIG 1.11 · Ejes según el tipo'); } }}>
                  <span className="fig-num">FIG 1.11</span>
                  <img src="/assets/cap1/111.png" alt="Ejes de rotación de las articulaciones sinoviales" />
                  <figcaption>1, 2 y 3 ejes según el tipo</figcaption>
                </figure>
              </div>
            </div>
          </div>

          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-b2">
              {currentMeta.desc ? (
                <span dangerouslySetInnerHTML={{ __html: currentMeta.desc }} />
              ) : (
                'Elige un tipo en la tabla o el panel HUD: la forma geométrica articular determina de forma estricta los grados de libertad.'
              )}
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Controles de Zoom en esquina superior izquierda */}

          <SynovialJointCanvas
            type={selectedJoint}
            angles={angles}
            resetSignal={resetSignal}
            zoomSignal={zoomSignal}
          />
          <div className="prof-controls">
            <span className="badge">B2 · 3D ANATOMÍA</span>
            <span style={{ color: 'var(--ink-2)', fontSize: '0.66rem', fontWeight: 600 }}>
              {currentMeta.name}: <span style={{ color: 'var(--teal-deep)' }}>{currentMeta.glLabel}</span>
            </span>

            {/* Presets de postura biomecánica */}
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              {currentMeta.presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p.angles)}
                  style={{
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: '3px',
                    padding: '1px 5px',
                    fontSize: '0.58rem',
                    color: 'var(--ink-2)',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Sliders Reactivos adaptados a los GL de la articulación */}
            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', fontSize: '0.62rem' }}>
              {currentMeta.sliders.map((s) => (
                <label key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontWeight: 500 }}>{s.label}:</span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    value={Math.round(angles[s.key])}
                    onChange={(e) => {
                      setIsAnimating(false);
                      const val = parseFloat(e.target.value);
                      setAngles((prev) => ({ ...prev, [s.key]: val }));
                    }}
                    style={{ width: currentMeta.sliders.length > 2 ? '45px' : '55px' }}
                  />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.58rem', color: 'var(--ink-3)', minWidth: '22px' }}>
                    {Math.round(angles[s.key])}{s.unit}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setIsAnimating((a) => !a);
                  if (toggleJointsAnimation) toggleJointsAnimation();
                }}
                style={{
                  background: isAnimating ? 'var(--teal-tint)' : 'var(--paper-2)',
                  borderColor: isAnimating ? 'var(--teal)' : 'var(--line)',
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

              {/* Controles de Zoom integrados */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px 4px' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-3)' }}>Zoom</span>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Alejar vista (Zoom −)"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--ink)', padding: '0 2px' }}
                >
                  −
                </button>
                <span style={{ color: 'var(--line)', fontSize: '0.60rem' }}>|</span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Acercar vista (Zoom +)"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--ink)', padding: '0 2px' }}
                >
                  +
                </button>
              </div>

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
      {lightbox && createPortal((
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={`Vista ampliada: ${lightbox.label}`} onClick={() => setLightbox(null)}>
          <div className="image-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <div className="image-lightbox-toolbar">
              <span>{lightbox.label}</span>
              <button type="button" onClick={() => setLightbox(null)} aria-label="Cerrar imagen ampliada" title="Cerrar (Esc)">×</button>
            </div>
            <img src={lightbox.src} alt={lightbox.alt} />
            <p>Haz clic fuera de la imagen o presiona Esc para cerrar.</p>
          </div>
        </div>
      ), document.body)}
    </>
  );
}
