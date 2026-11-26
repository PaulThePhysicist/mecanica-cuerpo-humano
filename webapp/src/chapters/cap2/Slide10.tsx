import React, { useState } from 'react';
import { C } from './palette';
import DiscPressureCanvas from './DiscPressureCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import KatexHtml from './KatexHtml';
import type { Engine } from './useEngine';
import { fx } from './ab';

interface PostureDetail {
  id: 'upright' | 'seated' | 'knees' | 'bent_back';
  name: string;
  emoji: string;
  pBase: number;
  mult: number;
  desc: string;
}

// Tabla 2.4 (presión intradiscal relativa a la bipedestación relajada). Las MPa se
// obtienen con una referencia ilustrativa de 0,5 MPa de pie: el libro da porcentajes.
const P_REF_MPA = 0.5;
const POSTURE_LIST: PostureDetail[] = [
  {
    id: 'upright',
    name: 'Bipedestación relajada',
    emoji: '',
    pBase: 1.0,
    mult: 100,
    desc: '<b>De pie, relajado (100 %):</b> la referencia de la Tabla 2.4. Erguido, el disco lumbosacro ya soporta $0{,}6\\,W_b$: $54\\text{ kg}$ ($530\\text{ N}$) para $90\\text{ kg}$.',
  },
  {
    id: 'seated',
    name: 'Sentado relajado, sin respaldo',
    emoji: '',
    pBase: 0.92,
    mult: 92,
    desc: '<b>Sentado relajado, sin respaldo (92 %):</b> sentado, la presión es mínima al encorvarse (54 %). Con soporte lumbar y respaldo inclinado hacia atrás disminuye aún más (Fig. 2.45).',
  },
  {
    id: 'knees',
    name: 'Levantar 20 kg, rodillas dobladas',
    emoji: '',
    pBase: 3.4,
    mult: 340,
    desc: '<b>Levantar 20 kg con las rodillas dobladas y el peso cerca del cuerpo (340 %):</b> se usan los músculos de las piernas y no los de la espalda.',
  },
  {
    id: 'bent_back',
    name: 'Levantar 20 kg sin doblar las rodillas',
    emoji: '',
    pBase: 4.6,
    mult: 460,
    desc: '<b>Levantar 20 kg sin doblar las rodillas (460 %):</b> la peor fila de la Tabla 2.4. La compresión del disco crece, abomba más y aumenta la irritación del nervio (Fig. 2.37b).',
  },
];

export default function Slide10({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [posture, setPosture] = useState<'upright' | 'seated' | 'knees' | 'bent_back'>('bent_back');
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const loadKg = 20; // las filas de levantamiento de la Tabla 2.4 son con 20 kg

  const curDetail = POSTURE_LIST.find((p) => p.id === posture) || POSTURE_LIST[3];
  const totalP = P_REF_MPA * curDetail.pBase;
  const totalPBar = totalP * 10;
  const isCritical = totalP >= 2.0;

  const handleSelectPosture = (id: 'upright' | 'seated' | 'knees' | 'bent_back') => {
    setPosture(id);
  };

  const handleReset = () => {
    setPosture('bent_back');

  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">D2</span>
        <h2 className="mtitle">El disco lumbosacro bajo carga</h2>
        <span className="msub">Compresión del disco lumbosacro y presión intradiscal (Fig. 2.42, Tabla 2.4)</span>
        <span className="mslide-count">2 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚡</span> Esfuerzo compresivo sobre el disco
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'Inclinado a $30^\\circ$ de la horizontal sin levantar nada, la reacción sobre el disco lumbosacro es de $2400\\text{ N}$ (el peso de $\\approx 245\\text{ kg}$). Según la Fig. 2.42 (discos de 40–59 años), eso comprime la altura del disco un $20\\,\\%$. Si el disco es un cilindro incompresible:'}
              </p>
              <div className="eq-block">
                {'\\[ V = \\pi r^2 H = \\text{cte.} \\quad\\Rightarrow\\quad H \\downarrow 20\\,\\% \\;\\Rightarrow\\; r \\uparrow \\approx 10\\,\\% \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'El disco protuberante (hernia discal) puede presionar la raíz nerviosa (Fig. 2.37b). Erguido ya soporta $0{,}6\\,W_b$ ($530\\text{ N}$), así que la carga pasa de $530$ a $2400\\text{ N}$; además no es uniforme: inclinarse hacia adelante comprime la parte anterior, tensa la posterior y empuja el núcleo hacia atrás (Fig. 2.43).'}
              </p>
              <div style={{ marginTop: '0.62rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>Rotular el disco y la compresión</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Marca los cuerpos vertebrales <b>L5</b> y <b>S1</b>, la zona de herniación y la compresión <b>F<sub>n</sub></b> sobre el disco.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📋</span> Tabla 2.4 · Presión intradiscal relativa (de pie = 100 %)
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {POSTURE_LIST.map((item) => {
                  const isSel = posture === item.id;
                  const isCurved = item.id === 'bent_back';
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleSelectPosture(item.id)}
                      aria-pressed={isSel}
                      style={{
                        font: 'inherit',
                        width: '100%',
                        textAlign: 'left',
                        padding: '.35rem .5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isSel ? (isCurved ? 'var(--blood-tint)' : 'var(--teal-tint)') : 'var(--paper-2)',
                        border: `1px solid ${isSel ? (isCurved ? 'var(--blood)' : 'var(--teal)') : 'var(--line)'}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <b style={{ color: isSel ? (isCurved ? 'var(--blood)' : 'var(--teal-deep)') : 'var(--ink)', fontSize: '.64rem' }}>
                          {item.name}
                        </b>
                      </div>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace', color: isCurved ? C.blood : 'var(--teal-deep)', fontWeight: 'bold' }}>
                        {item.mult} %
                      </span>
                    </button>
                  );
                })}
              </div>
              <details style={{ marginTop: '0.62rem' }}>
                <summary style={{ fontSize: '.64rem', cursor: 'pointer', color: 'var(--teal-deep)' }}>Tabla 2.4 completa</summary>
                <table className="data-mini">
                  <thead><tr><th>Posición o actividad</th><th>%</th></tr></thead>
                  <tbody>
                    <tr><th colSpan={2}>Estática</th></tr>
                    <tr><td>Acostado boca arriba (decúbito supino)</td><td>20</td></tr>
                    <tr><td>Acostado de lado</td><td>24</td></tr>
                    <tr><td>Acostado boca abajo (decúbito prono)</td><td>22</td></tr>
                    <tr><td>Boca abajo, espalda extendida, apoyando los codos</td><td>50</td></tr>
                    <tr><td>Bipedestación relajada</td><td>100</td></tr>
                    <tr><td>De pie, inclinado hacia adelante</td><td>220</td></tr>
                    <tr><td>Sentado relajado, sin respaldo</td><td>92</td></tr>
                    <tr><td>Sentado enderezando activamente la espalda</td><td>110</td></tr>
                    <tr><td>Sentado con flexión máxima</td><td>166</td></tr>
                    <tr><td>Sentado inclinado, codos sobre los muslos</td><td>86</td></tr>
                    <tr><td>Sentado encorvado en una silla</td><td>54</td></tr>
                    <tr><th colSpan={2}>Movimiento</th></tr>
                    <tr><td>Levantarse de la silla</td><td>220</td></tr>
                    <tr><td>Caminar descalzo o con tenis</td><td>106–130</td></tr>
                    <tr><td>Trotar con tenis</td><td>70–180</td></tr>
                    <tr><td>Subir escaleras, de una en una / de dos en dos</td><td>100–140 / 60–240</td></tr>
                    <tr><td>Bajar escaleras, de una en una / de dos en dos</td><td>76–120 / 60–180</td></tr>
                    <tr><th colSpan={2}>Levantamiento</th></tr>
                    <tr><td>Levantar 20 kg, sin doblar las rodillas</td><td>460</td></tr>
                    <tr><td>Levantar 20 kg, rodillas dobladas, peso cerca</td><td>340</td></tr>
                    <tr><td>Sostener 20 kg cerca del cuerpo</td><td>220</td></tr>
                    <tr><td>Sostener 20 kg a 60 cm del pecho</td><td>360</td></tr>
                  </tbody>
                </table>
              </details>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)', marginTop: '0.62rem' }}>
                Acostado, la carga lumbar es del 20 al 50 % de la de pie; al caminar rápido supera el doble del peso corporal (Fig. 2.44). Consejos del libro: estirar la espalda, doblar siempre las rodillas al levantar, mantener la curvatura lumbar (soporte lumbar o toalla enrollada), dormir boca arriba con rodillas dobladas o en posición fetal, nunca boca abajo.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-10">
              <KatexHtml html={curDetail.desc} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="PRESIÓN INTRADISCAL"
            badge={`${curDetail.mult} % · ≈ ${fx(totalP, 2)} MPa`}
            footer="💡 Elige una fila de la Tabla 2.4 para ver la deformación del núcleo pulposo"
            width="270px"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Presión L5-S1:</span>
                <b style={{ color: isCritical ? C.blood : C.teal, fontFamily: 'JetBrains Mono, monospace' }}>
                  {fx(totalP, 2)} MPa ({fx(totalPBar, 1)} bar)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Estado Discal:</span>
                <b style={{ color: isCritical ? C.blood : C.teal }}>
                  {isCritical ? 'Carga muy alta' : (totalP > 1.0 ? 'Carga elevada' : 'Carga baja')}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Referencia de pie:</span>
                <b style={{ fontFamily: 'var(--mono)' }}>0,5 MPa (ilustrativa)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tabla 2.4:</span>
                <b style={{ color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{curDetail.mult} % de la presión de pie</b>
              </div>
            </div>
          </HudPanel>

          <DiscPressureCanvas showLabels={showLabels}
            posture={posture}
            loadKg={loadKg}
          />
          <div className="prof-controls">
            <span className="badge">§2.3.4 · Disco</span>
            <span>P ≈ <b style={{ color: isCritical ? 'var(--blood)' : 'var(--teal)' }}>{fx(totalP, 2)} MPa</b> ({curDetail.mult} %)</span>

            <div style={{ display: 'flex', gap: '0.62rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
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
