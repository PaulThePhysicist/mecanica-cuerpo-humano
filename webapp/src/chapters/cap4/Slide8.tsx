import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide8({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  const setMat = (m: 'acero' | 'hueso' | 'trabecular' | 'granito') => {
    engine.setFlag('curveMat', m);
    const sel = document.getElementById('cv_mat') as HTMLSelectElement | null;
    if (sel) sel.value = m;
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="8" data-module="4">
      <div className="module-header">
        <span className="mnum">4.3</span>
        <span className="mtitle">Materiales Hookeanos y reales</span>
        <span className="msub">El hueso es Hookeano solo hasta el límite proporcional</span>
        <span className="mslide-count">8 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📈</span> La curva real
            </div>
            <div className="card-body">
              <p>
                La linealidad (pendiente {"\\(Y\\)"}) vale hasta el <strong>límite proporcional</strong> {"\\(P\\)"}. Más
                allá, la relación se vuelve no lineal hasta el <strong>límite elástico</strong> {"\\(EL\\)"} (regresa al
                soltar); luego hay deformación <strong>plástica</strong> permanente y el material llega al{' '}
                <strong>UTS</strong> y fractura en {"\\(F\\)"}. El punto de fluencia se estima con la{' '}
                <strong>desviación del 0,2 %</strong>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏗️</span> Tabla 4.1: unos pocos números
            </div>
            <div className="card-body">
              <table className="interactive-table" id="cv-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Y (GPa)</th>
                    <th>UCS (MPa)</th>
                    <th>UTS (MPa)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    className={flags.curveMat === 'acero' ? 'highlight' : ''}
                    onClick={() => setMat('acero')}
                  >
                    <td>
                      <b>Acero duro</b>
                    </td>
                    <td>207</td>
                    <td>552</td>
                    <td>827</td>
                  </tr>
                  <tr
                    className={flags.curveMat === 'hueso' ? 'highlight' : ''}
                    onClick={() => setMat('hueso')}
                  >
                    <td>
                      <b>Hueso compacto</b>
                    </td>
                    <td>17,9</td>
                    <td>170</td>
                    <td>120</td>
                  </tr>
                  <tr
                    className={flags.curveMat === 'trabecular' ? 'highlight' : ''}
                    onClick={() => setMat('trabecular')}
                  >
                    <td>
                      <b>Hueso trabecular</b>
                    </td>
                    <td>0,076</td>
                    <td>2,2</td>
                    <td>—</td>
                  </tr>
                  <tr
                    className={flags.curveMat === 'granito' ? 'highlight' : ''}
                    onClick={() => setMat('granito')}
                  >
                    <td>
                      <b>Granito</b>
                    </td>
                    <td>51,7</td>
                    <td>145</td>
                    <td>4,8</td>
                  </tr>
                </tbody>
              </table>
              <div className="table-caption">Haz clic en una fila para ver su curva en el canvas.</div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🩹</span> El hueso falla en tracción
            </div>
            <div className="card-body">
              <p>
                En el hueso <strong>UTS = 120 &lt; UCS = 170 MPa</strong>: resiste más la compresión que la tracción. Como
                el granito (frágil: UTS ≪ UCS) y al revés que el acero (dúctil: UTS &gt; UCS). Consecuencia: las fracturas
                suelen iniciarse en el lado en tracción.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-8">
              Clave de lectura: "cuánto sube" = rigidez (Y); "hasta dónde llega" = resistencia (UCS/UTS); "cuánto se estira
              antes" = ductilidad. El acero sube mucho y aguanta; el hueso sube menos y aguanta menos; el tendón sube poco
              pero se estira muchísimo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-curve" className="sim" />
            <div className="prof-controls">
              <span className="badge">σ–ε</span>
              <label>
                material{' '}
                <select
                  id="cv_mat"
                  defaultValue={flags.curveMat}
                  onChange={(e) => {
                    engine.setFlag('curveMat', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="acero">Acero</option>
                  <option value="hueso">Hueso compacto</option>
                  <option value="trabecular">Trabecular</option>
                  <option value="granito">Granito</option>
                </select>
              </label>
              <span className="readout" id="cv_out">
                Y = 17,9 GPa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
