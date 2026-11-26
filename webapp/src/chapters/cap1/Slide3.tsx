import React, { useMemo, useState } from 'react';
import BodyScene from './BodyScene';

interface Slide3Props {
  regionSel?: string | null;
  slideCount?: string;
}

const REGION_DESCRIPTIONS: Record<string, string> = {
  'region-thorax': '<b>Torácica (Pecho):</b> Caja torácica formada por esternón, costillas y vértebras torácicas; protege corazón y pulmones.',
  'region-digital': '<b>Digital (Dedo de la mano o del pie):</b> Región distal de manos y pies; el modelo dispone de metacarpianos y metatarsianos como referencia ósea.',
  'region-gluteal': '<b>Glútea (Nalga):</b> Región posterior de la cintura pélvica, representada aquí por los huesos de la cadera.',
  'region-plantar': '<b>Plantar (Planta del pie):</b> Superficie inferior del pie, asociada en el modelo a los huesos metatarsianos.',
  'region-vertebral': '<b>Vertebral (Columna vertebral):</b> Eje óseo formado por las regiones cervical, torácica, lumbar y sacra.',
  'region-caput': '<b>Cefálica (Cabeza):</b> Aloja el encéfalo (~1.400 g) y los órganos sensoriales especiales (vista, oído, gusto, olfato).',
  'region-cervical': '<b>Cervical (Cuello):</b> Segmento móvil de 7 vértebras (C1–C7) que soporta y orienta la cabeza.',
  'region-acromion': '<b>Acromial (Parte superior del hombro):</b> Región del acromion, vértice superior de la escápula. Complejo articular esferoidal de 3 GL.',
  'region-coxal': '<b>Coxal (Cadera):</b> Región de unión entre el tronco y los miembros inferiores; articula la pelvis con el fémur.',
  'region-brachium': '<b>Braquial (Brazo, parte superior):</b> Segmento proximal del miembro superior constituido por el hueso húmero.',
  'region-antebrachium': '<b>Antebraquial (Antebrazo):</b> Cúbito y radio con pivote radiocubital (+1 GL de pronación/supinación).',
  'region-carpus': '<b>Carpiana (Muñeca):</b> Conjunto de 8 huesos carpianos; articulación condílea de 2 GL.',
  'region-femur': '<b>Femoral (Muslo):</b> Región del muslo; contiene el fémur, el hueso más largo, pesado y resistente del cuerpo humano, que soporta cargas de impacto.',
  'region-popliteus': '<b>Poplítea (Parte posterior de la rodilla):</b> Región posterior a la articulación de la rodilla por donde cruzan vasos y nervios.',
  'region-crus': '<b>Crural (Frente de la pierna):</b> Región de la pierna que contiene la tibia (soporte de peso) y peroné (estabilizador muscular y de tobillo).',
  'region-tarsus': '<b>Tarsiana (Tobillo):</b> Región de los 7 huesos tarsianos dispuestos en arco para la absorción elástica del impacto al caminar.',
};

const REGIONS_LIST = [
  { id: 'region-thorax', name: 'Torácica', trans: 'Pecho' },
  { id: 'region-digital', name: 'Digital', trans: 'Dedo (de la mano o del pie)' },
  { id: 'region-gluteal', name: 'Glútea', trans: 'Nalga' },
  { id: 'region-plantar', name: 'Plantar', trans: 'Planta del pie' },
  { id: 'region-vertebral', name: 'Vertebral', trans: 'Columna vertebral' },
  { id: 'region-caput', name: 'Cefálica', trans: 'Cabeza' },
  { id: 'region-cervical', name: 'Cervical', trans: 'Cuello' },
  { id: 'region-acromion', name: 'Acromial', trans: 'Parte superior del hombro' },
  { id: 'region-coxal', name: 'Coxal', trans: 'Cadera' },
  { id: 'region-brachium', name: 'Braquial', trans: 'Brazo (superior)' },
  { id: 'region-antebrachium', name: 'Antebraquial', trans: 'Antebrazo' },
  { id: 'region-carpus', name: 'Carpiana', trans: 'Muñeca' },
  { id: 'region-femur', name: 'Femoral', trans: 'Muslo' },
  { id: 'region-popliteus', name: 'Poplítea', trans: 'Parte posterior de la rodilla' },
  { id: 'region-crus', name: 'Crural', trans: 'Frente de la pierna' },
  { id: 'region-tarsus', name: 'Tarsiana', trans: 'Tobillo' },
];

/* P6-20 · Términos de las Tablas 1.1–1.2 (.tex líneas 77–121) que no tienen
   chip 3D arriba. Forma D4: adjetivo en español + término común. */
const MORE_TERMS_ANTERIOR: [string, string][] = [
  ['Abdominal', 'Abdomen'],
  ['Axilar', 'Axila'],
  ['Bucal', 'Mejilla'],
  ['Frontal', 'Frente'],
  ['Inguinal', 'Ingle'],
  ['Lingual', 'Lengua'],
  ['Mamaria', 'Mama'],
  ['Mentoniana', 'Barbilla'],
  ['Nasal', 'Nariz'],
  ['Oral', 'Boca'],
  ['Palmar', 'Palma'],
  ['Pedia', 'Pie'],
  ['Esternal', 'Esternón'],
  ['Umbilical', 'Ombligo'],
];
const MORE_TERMS_POSTERIOR: [string, string][] = [
  ['Occipital', 'Parte posterior de la cabeza'],
  ['Sacra', 'Entre las caderas'],
  ['Sural', 'Parte posterior de la pierna'],
];

const DEFAULT_APUNTE =
  'Pasa el cursor o haz clic sobre cada región para verla en el modelo 3D. Todo término se dice desde el <b>paciente</b>: su ojo derecho es el que el médico ve a su izquierda. Lo mismo con superior/inferior: las venas <b>cavas superior e inferior</b> recogen la sangre por encima y por debajo del corazón.';

export default function Slide3({ regionSel: parentRegionSel, slideCount }: Slide3Props) {
  const [localRegion, setLocalRegion] = useState<string | null>(null);
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomSignal, setZoomSignal] = useState<{ type: 'in' | 'out'; time: number } | null>(null);

  const activeRegion = localRegion !== null ? localRegion : parentRegionSel;

  const handleSelectRegion = (rId: string) => {
    setLocalRegion(localRegion === rId ? null : rId);
  };

  // El apunte se deriva en render: hover > selección > pista por defecto.
  const shownRegion = hoverRegion ?? activeRegion ?? null;
  const apunteHtml = useMemo(
    () => ({
      __html:
        (shownRegion && REGION_DESCRIPTIONS[shownRegion]) ||
        DEFAULT_APUNTE,
    }),
    [shownRegion],
  );

  const handleZoomIn = () => setZoomSignal({ type: 'in', time: Date.now() });
  const handleZoomOut = () => setZoomSignal({ type: 'out', time: Date.now() });
  const handleReset = () => {
    setResetSignal((s) => s + 1);
    setLocalRegion(null);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">A3</span>
        <span className="mtitle">Regiones anatómicas</span>
        <span className="msub">La nomenclatura regional del cuerpo</span>
        <span className="mslide-count">{slideCount ?? '3 / 3'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🗺️</span> Regiones del cuerpo
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', fontSize: '.62rem' }}>
                {REGIONS_LIST.map((r) => (
                  <span
                    key={r.id}
                    className={`pill ${activeRegion === r.id ? 'active' : ''}`}
                    data-highlight={r.id}
                    onClick={() => handleSelectRegion(r.id)}
                    onMouseEnter={() => setHoverRegion(r.id)}
                    onMouseLeave={() => setHoverRegion(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <b>{r.name}</b> {r.trans}
                  </span>
                ))}
              </div>
              <p style={{ fontSize:  'max(12px, .6rem)', color: 'var(--ink-3)', marginTop: '.3rem' }}>
                💡 El nombre <em>braquial</em> viene de <strong>brachium</strong> (brazo): bíceps braquial, tríceps braquial.
                <em> Bíceps</em> y <em>tríceps</em> nombran cualquier músculo con dos o tres orígenes, no solo los del brazo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📖</span> Más términos (Tablas 1.1–1.2)
            </div>
            <div className="card-body">
              <p className="table-note" style={{ marginTop: 0, marginBottom: '.25rem' }}>
                Regiones anteriores (Tabla 1.1)
              </p>
              <div className="term-grid">
                {MORE_TERMS_ANTERIOR.map(([term, common]) => (
                  <span key={term}><b>{term}</b> {common}</span>
                ))}
              </div>
              <p className="table-note" style={{ marginBottom: '.25rem' }}>
                Regiones posteriores (Tabla 1.2)
              </p>
              <div className="term-grid">
                {MORE_TERMS_POSTERIOR.map(([term, common]) => (
                  <span key={term}><b>{term}</b> {common}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-a3" dangerouslySetInnerHTML={apunteHtml} />
          </div>
        </div>
        <div className="sim-area" id="sim-regiones" style={{ position: 'relative' }}>

          <BodyScene
            id="three-container-regions"
            mode="regions"
            selected={activeRegion ?? null}
            resetSignal={resetSignal}
            zoomSignal={zoomSignal}
          />
          <div className="prof-controls" data-default-collapsed="true">
            <span className="badge">A3 · 3D</span>
            <span id="selectionLabelA3">{activeRegion ? 'Región anatómica resaltada' : 'Haz clic sobre cada región para iluminarla en el esqueleto'}</span>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              {/* Controles de Zoom integrados */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px 5px' }}>
                <span style={{ fontSize:  'max(12px, 0.60rem)', color: 'var(--ink-3)', marginRight: '2px' }}>Zoom</span>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Alejar vista (Zoom −)"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--ink)', padding: '0 3px' }}
                >
                  −
                </button>
                <span style={{ color: 'var(--line)', fontSize: '0.65rem' }}>|</span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Acercar vista (Zoom +)"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--ink)', padding: '0 3px' }}
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
                  color: 'var(--ink)'
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
