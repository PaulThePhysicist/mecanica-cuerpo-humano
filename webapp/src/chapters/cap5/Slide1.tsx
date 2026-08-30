import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide1({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="1" data-module="1">
      <div className="module-header">
        <span className="mnum">5.1</span>
        <span className="mtitle">Tipos de músculos y el motor esquelético</span>
        <span className="msub">Tres motores: esquelético, cardíaco y liso</span>
        <span className="mslide-count">1 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💪</span> Los tres tipos de músculo
            </div>
            <div className="card-body">
              <p>
                <strong>Esquelético:</strong> células cilíndricas largas <strong>estriadas</strong>, multinucleadas, bajo
                control consciente (voluntario). Mueve el esqueleto, los labios, los párpados y los globos oculares; algunos
                se mueven sin esfuerzo consciente (el diafragma).
              </p>
              <p>
                <strong>Cardíaco:</strong> estriado, núcleo central único, a menudo ramificado; al unirse dos células
                forman un <strong>disco intercalado</strong>.
              </p>
              <p>
                <strong>Liso:</strong> células alargadas con extremos afinados, <strong>sin estriaciones</strong>, núcleo
                central, involuntario; recubre vasos sanguíneos y órganos digestivos y urogenitales.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔢</span> Los números del músculo esquelético
            </div>
            <div className="card-body">
              <p>
                Es el <span className="tag">43 % de la masa corporal</span> (≈ <span className="tag">30 kg</span> en una
                persona de 70 kg). En reposo consume ≈ <span className="tag">18 %</span> de la tasa metabólica basal (TMB).
              </p>
              <p>
                De la energía que «quema», solo ≈ <span className="tag">25 %</span> hace trabajo mecánico —{' '}
                <strong>esa es la eficiencia muscular</strong>. El{' '}
                <span className="highlight">75 % restante se libera como calor</span>: una fuente constante y muy
                importante de calor corporal.
              </p>
              <div className="eq-block">
                {"\\[ F_{\\text{M}}=k_{\\text{M}}\\,\\text{PCA} \\qquad k_{\\text{M}}\\in 20\\text{–}100\\ \\text{N/cm}^2 \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚀</span> Rendimiento máximo
            </div>
            <div className="card-body">
              <p>
                En el cuádriceps: ≈ <span className="tag">70 N/cm²</span> al correr y saltar, ≈{' '}
                <span className="tag">100 N/cm²</span> isométrico. Estimación de uso común:{' '}
                <span className="tag">250–500 W por kg</span> de músculo activo isotónico (
                <span className="highlight">×1,75 con estiramiento previo</span>).
              </p>
              <p>
                Los <strong>contramovimientos</strong> antes de un movimiento repentino mejoran el rendimiento: ponerse en
                cuclillas antes de un salto lo hace más alto (¿más tiempo de activación, longitudes óptimas de sarcómero, o
                energía elástica almacenada?).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-1">
              Tres ideas para retener: (1) el músculo esquelético es un motor ineficiente <em>a propósito</em> — el 75 % de
              su energía se vuelve calor corporal; (2) la fuerza máxima es proporcional al PCA (área de sección transversal
              fisiológica), no al volumen; (3) el estiramiento previo «presta» fuerza al movimiento siguiente. Explora las
              tres células en el canvas.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-cells" />
            <div className="prof-controls">
              <span className="badge">células</span>
              <label>
                tipo{' '}
                <select
                  id="cl_type"
                  defaultValue={params.cl_type}
                  onChange={(e) => {
                    engine.setParam('cl_type', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="esqueletico">Esquelético</option>
                  <option value="cardiaco">Cardíaco</option>
                  <option value="liso">Liso</option>
                </select>
              </label>
              <span className="readout" id="cl_out">
                estriada · multinucleada · voluntaria
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
