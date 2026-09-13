import React, { useEffect, useState } from 'react';
import AllometryCanvas from './AllometryCanvas';
import { fmt } from './format';
// @ts-ignore - katex auto-render no incluye tipos
import renderMathInElement from 'katex/contrib/auto-render';

interface AllometryDetail {
  id: string;
  name: string;
  alpha: number;
  unit: string;
  formula: string;
  desc: string;
}

const ALLO_INFO: Record<string, AllometryDetail> = {
  BMR: {
    id: 'BMR',
    name: 'Tasa Metabólica Basal (Kleiber)',
    alpha: 0.75,
    unit: 'W',
    formula: 'BMR = 4{,}1 \\cdot m_b^{0{,}75}',
    desc: '<b>TMB (Ley de Kleiber · $\\alpha = 0{,}75$):</b> La tasa metabólica escala con la masa a la potencia $3/4$. Derivado de la geometría fractal de las redes de distribución vascular.',
  },
  area: {
    id: 'area',
    name: 'Área Superficial Corporal',
    alpha: 0.65,
    unit: 'm²',
    formula: 'A = 0{,}11 \\cdot m_b^{0{,}65}',
    desc: '<b>Área Superficial ($\\alpha = 0{,}65$):</b> Escala sublineal cercana a $2/3$, gobernando la disipación térmica radiativa y conductiva hacia el ambiente.',
  },
  HR: {
    id: 'HR',
    name: 'Frecuencia Cardíaca',
    alpha: -0.25,
    unit: 'Hz / lpm',
    formula: 'f_c = 4{,}02 \\cdot m_b^{-0{,}25}',
    desc: '<b>Frecuencia Cardíaca ($\\alpha = -0{,}25$):</b> Exponente negativo: los mamíferos pequeños tienen pulsos ultrarrápidos (ratón $\\sim 600\\text{ lpm}$), mientras el elefante late a $\\sim 28\\text{ lpm}$.',
  },
  brain: {
    id: 'brain',
    name: 'Masa Cerebral',
    alpha: 0.66,
    unit: 'kg',
    formula: 'm_{\\text{cerebro}} = 0{,}085 \\cdot m_b^{0{,}66}',
    desc: '<b>Masa Cerebral ($\\alpha = 0{,}66$):</b> Alometría del sistema nervioso central entre mamíferos, con el ser humano como un punto atípico marcadamente por encima de la curva.',
  },
  life: {
    id: 'life',
    name: 'Tiempo de Vida / Longevidad',
    alpha: 0.20,
    unit: 'años',
    formula: 't_{\\text{vida}} = 11{,}89 \\cdot m_b^{0{,}20}',
    desc: '<b>Tiempo de Vida ($\\alpha = 0{,}20$):</b> Los animales de mayor masa viven más tiempo; el número total de latidos en la vida es casi constante ($\\sim 10^9$) entre casi todos los mamíferos.',
  },
  muscle: {
    id: 'muscle',
    name: 'Masa Muscular Esquelética',
    alpha: 1.0,
    unit: 'kg',
    formula: 'm_{\\text{musc}} = 0{,}45 \\cdot m_b^{1{,}0}',
    desc: '<b>Masa Muscular ($\\alpha = 1{,}0$):</b> Escalamiento <strong>isométrico puro</strong>: el músculo representa aproximadamente el $\\sim 40\\text{--}45\\%$ de la masa en todos los mamíferos.',
  },
};

function renderD1Math() {
  const root = document.getElementById('d1-math-root');
  if (!root) return;
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

export default function Slide12({ slideCount }: { slideCount?: string }) {
  const [selectedParam, setSelectedParam] = useState<string>('BMR');
  const [mass, setMass] = useState<number>(70);
  const [selectedAnimal, setSelectedAnimal] = useState<{ name: string; mass: number } | null>(null);

  const currentDetail = ALLO_INFO[selectedParam] || ALLO_INFO.BMR;
  const currentDescription = selectedAnimal
    ? `Seleccionado: <b>${selectedAnimal.name} (${selectedAnimal.mass >= 1000 ? fmt(selectedAnimal.mass / 1000, 1) + ' t' : (Number.isInteger(selectedAnimal.mass) ? selectedAnimal.mass : fmt(selectedAnimal.mass, selectedAnimal.mass < 0.1 ? 3 : 1)) + ' kg'})</b>. Explora cómo cambia el valor de <b>${currentDetail.name}</b> a lo largo del espectro de mamíferos.`
    : currentDetail.desc;

  useEffect(() => {
    const root = document.getElementById('d1-math-root');
    if (!root) return undefined;
    const renderIfNeeded = () => {
      const rawMath = root.textContent?.includes('$') || root.textContent?.includes('\\[');
      if (rawMath) renderD1Math();
    };
    const timers = [0, 80, 200].map((delay) => window.setTimeout(renderIfNeeded, delay));
    const observer = new MutationObserver(renderIfNeeded);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
    };
  }, [selectedParam, selectedAnimal]);

  const handleSelect = (key: string) => {
    setSelectedParam(key);
    setSelectedAnimal(null);
  };

  const handleSelectAnimal = (name: string, m: number) => {
    setMass(m);
    setSelectedAnimal({ name, mass: m });
  };

  const handleReset = () => {
    setSelectedParam('BMR');
    setMass(70);
    setSelectedAnimal(null);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">D1</span>
        <span className="mtitle">Reglas alométricas</span>
        <span className="msub">f = a · m_b^α · del ratón al elefante (Tabla 1.13)</span>
        <span className="mslide-count">{slideCount ?? '1 / 4'}</span>
      </div>
      <div className="content-grid" id="d1-math-root">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📈</span> La ley de potencia alométrica
            </div>
            <div className="card-body">
              <div className="eq-block">
                {'\\[ f = a\\, m_b^\\alpha \\qquad (\\alpha \\neq 1) \\]'}
              </div>
              <p style={{ fontSize: '.66rem', color: 'var(--ink-3)' }}>
                <strong>Alométrica:</strong> «por una medida diferente» ($\alpha \neq 1$). <strong>Isométrica:</strong> «por la misma medida geométrica» ($\alpha = 1$).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📋</span> Parámetros alométricos (Tabla 1.13)
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                {Object.values(ALLO_INFO).map((item) => {
                  const isSel = selectedParam === item.id;
                  return (
                    <div
                      key={item.id}
                      className="alo-row"
                      onClick={() => handleSelect(item.id)}
                      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleSelect(item.id); } }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSel}
                      style={{
                        padding: '.35rem .5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        background: isSel ? 'var(--teal-tint)' : 'var(--paper-2)',
                        border: `1px solid ${isSel ? 'var(--teal)' : 'var(--line)'}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <b style={{ color: isSel ? 'var(--teal-deep)' : 'var(--ink)' }}>{item.name}</b>
                        <br />
                        <span style={{ fontSize: '.55rem', color: 'var(--ink-3)' }}>Unidad: {item.unit}</span>
                      </div>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 'bold',
                          color: isSel ? 'var(--teal-deep)' : 'var(--ink-2)',
                          fontSize: '.65rem',
                        }}
                      >
                        α = {fmt(item.alpha, 2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)', marginTop: '.3rem' }}>
                Los exponentes rigen en 7 órdenes de magnitud para mamíferos y en relaciones antropométricas humanas.
              </p>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)', marginTop: '.1rem' }}>
                Pasa el cursor o haz clic sobre cada parámetro para comparar su curva en el gráfico.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-d1">
              <span dangerouslySetInnerHTML={{ __html: currentDescription }} />
            </div>
          </div>
        </div>
        <div className="sim-area d1-allometry-area" id="sim-allometry-area" style={{ position: 'relative' }}>
          <AllometryCanvas
            selectedParam={selectedParam}
            customMass={mass}
            onSelectAnimal={handleSelectAnimal}
          />
          <div className="prof-controls">
            <span className="badge">D1 · Log-log</span>
            <span>{currentDetail.name}: <b style={{ color: 'var(--teal-deep)' }}>α = {fmt(currentDetail.alpha, 2)}</b></span>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.60rem',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                  marginLeft: '4px',
                }}
              >
                Restablecer (70 kg)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
