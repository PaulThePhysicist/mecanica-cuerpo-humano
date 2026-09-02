import React, { useState } from 'react';
import BodyScene from './BodyScene';

interface Slide3Props {
  regionSel?: string | null;
  slideCount?: string;
}

const REGION_DESCRIPTIONS: Record<string, string> = {
  'region-thorax': '<b>Thorax (Pecho):</b> Caja torácica formada por esternón, costillas y vértebras torácicas; protege corazón y pulmones.',
  'region-digital': '<b>Digital (Dedos):</b> Región distal de manos y pies; el modelo dispone de metacarpianos y metatarsianos como referencia ósea.',
  'region-gluteal': '<b>Gluteal (Nalga):</b> Región posterior de la cintura pélvica, representada aquí por los huesos de la cadera.',
  'region-plantar': '<b>Plantar (Planta del pie):</b> Superficie inferior del pie, asociada en el modelo a los huesos metatarsianos.',
  'region-vertebral': '<b>Vertebral (Columna):</b> Eje óseo formado por las regiones cervical, torácica, lumbar y sacra.',
  'region-caput': '<b>Caput (Cabeza):</b> Aloja el encéfalo (~1.400 g) y los órganos sensoriales especiales (vista, oído, gusto, olfato).',
  'region-cervical': '<b>Cervical (Cuello):</b> Segmento móvil de 7 vértebras (C1–C7) que soporta y orienta la cabeza.',
  'region-acromion': '<b>Acromion (Hombro):</b> Vértice superior de la escápula. Complejo articular esferoidal de 3 GL.',
  'region-coxal': '<b>Coxal (Cadera):</b> Región de unión entre el tronco y los miembros inferiores; articula la pelvis con el fémur.',
  'region-brachium': '<b>Brachium (Brazo):</b> Segmento proximal del miembro superior constituido por el hueso húmero.',
  'region-antebrachium': '<b>Antebrachium (Antebrazo):</b> Cúbito y radio con pivote radiocubital (+1 GL de pronación/supinación).',
  'region-carpus': '<b>Carpus (Muñeca):</b> Conjunto de 8 huesos carpianos; articulación condílea de 2 GL.',
  'region-femur': '<b>Femur (Muslo):</b> Hueso más largo, pesado y resistente del cuerpo humano; soporta cargas de impacto.',
  'region-popliteus': '<b>Popliteus (Fosa poplítea):</b> Región posterior a la articulación de la rodilla por donde cruzan vasos y nervios.',
  'region-crus': '<b>Crus (Pierna):</b> Tibia (soporte de peso) y peroné (estabilizador muscular y de tobillo).',
  'region-tarsus': '<b>Tarsus (Tobillo / Tarso):</b> 7 huesos tarsianos dispuestos en arco para la absorción elástica del impacto al caminar.',
};

const REGIONS_LIST = [
  { id: 'region-thorax', name: 'Thorax', trans: 'Pecho' },
  { id: 'region-digital', name: 'Digital', trans: 'Dedos' },
  { id: 'region-gluteal', name: 'Gluteal', trans: 'Nalga' },
  { id: 'region-plantar', name: 'Plantar', trans: 'Planta del pie' },
  { id: 'region-vertebral', name: 'Vertebral', trans: 'Columna' },
  { id: 'region-caput', name: 'Caput', trans: 'Cabeza' },
  { id: 'region-cervical', name: 'Cervical', trans: 'Cuello' },
  { id: 'region-acromion', name: 'Acromion', trans: 'Hombro' },
  { id: 'region-coxal', name: 'Coxal', trans: 'Cadera' },
  { id: 'region-brachium', name: 'Brachium', trans: 'Brazo' },
  { id: 'region-antebrachium', name: 'Antebrachium', trans: 'Antebrazo' },
  { id: 'region-carpus', name: 'Carpus', trans: 'Muñeca' },
  { id: 'region-femur', name: 'Femur', trans: 'Muslo' },
  { id: 'region-popliteus', name: 'Popliteus', trans: 'Rodilla' },
  { id: 'region-crus', name: 'Crus', trans: 'Pierna' },
  { id: 'region-tarsus', name: 'Tarsus', trans: 'Tobillo' },
];

export default function Slide3({ regionSel: parentRegionSel, slideCount }: Slide3Props) {
  const [localRegion, setLocalRegion] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomSignal, setZoomSignal] = useState<{ type: 'in' | 'out'; time: number } | null>(null);

  const activeRegion = localRegion !== null ? localRegion : parentRegionSel;

  const handleSelectRegion = (rId: string) => {
    const next = activeRegion === rId ? null : rId;
    setLocalRegion(next);
    const info = document.getElementById('info-text-a3');
    if (info) {
      if (next && REGION_DESCRIPTIONS[next]) {
        info.innerHTML = REGION_DESCRIPTIONS[next];
      } else {
        info.innerHTML = 'Pasa el cursor o haz clic sobre cada región para verla en el modelo 3D y su relevancia clínica.';
      }
    }
  };

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
                    style={{ cursor: 'pointer' }}
                  >
                    <b>{r.name}</b> {r.trans}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '.6rem', color: 'var(--ink-3)', marginTop: '.3rem' }}>
                💡 El nombre <em>braquial</em> de los músculos del brazo proviene de <strong>brachium</strong>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📖</span> Términos regionales (Tablas 1.1–1.2)
            </div>
            <div className="card-body">
              <table className="data-mini">
                <tbody>
                  <tr><th>Anteriores</th><th>Posteriores</th></tr>
                  <tr><td><b>Brachial</b>: brazo (superior)</td><td><b>Acromial</b>: hombro</td></tr>
                  <tr><td><b>Antebrachial</b>: antebrazo</td><td><b>Femoral</b>: muslo</td></tr>
                  <tr><td><b>Carpal</b>: muñeca</td><td><b>Gluteal</b>: nalga</td></tr>
                  <tr><td><b>Digital</b>: dedo</td><td><b>Occipital</b>: nuca</td></tr>
                  <tr><td><b>Coxal</b>: cadera</td><td><b>Popliteal</b>: tras la rodilla</td></tr>
                  <tr><td><b>Crural</b>: frente de la pierna</td><td><b>Sural</b>: pantorrilla</td></tr>
                  <tr><td><b>Plantar</b>: planta del pie</td><td><b>Vertebral</b>: columna</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-a3">
              Pasa el cursor o haz clic sobre cada región para verla en el modelo 3D y su relevancia clínica.
            </div>
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
                <span style={{ fontSize: '0.60rem', color: 'var(--ink-3)', marginRight: '2px' }}>Zoom</span>
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
