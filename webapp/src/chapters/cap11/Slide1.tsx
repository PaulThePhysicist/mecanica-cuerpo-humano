import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide1({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="1" data-module="1">
      <div className="module-header">
        <span className="mnum">11 · 1</span>
        <span className="mtitle">La anatomía del globo ocular</span>
        <span className="msub">{"\\(n_\\mathrm{córnea} = 1{,}3771 \\cdot n_\\mathrm{acuoso} = 1{,}3374\\)"}</span>
        <span className="mslide-count">1 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧿</span> Un globo de 24 mm: la córnea manda
            </div>
            <div className="card-body">
              <p>
                El ojo tiene un radio medio de 12 mm y mide unos 24 mm de largo. La <strong>córnea</strong> es fina (0,52
                mm al centro, 0,65 mm en la periferia) y curva (radio anterior ~7,8 mm, ±0,4 mm entre personas): aporta{' '}
                <strong>~2/3 del poder de enfoque</strong> del ojo.
              </p>
              <div className="eq-block">
                <span className="eqno">(11.1)</span>
                {"\\[ E = h\\nu = \\frac{hc}{\\lambda},\\qquad h = 6{,}626\\times10^{-34}\\ \\mathrm{J\\,s} \\]"}
              </div>
              <p>
                Los índices de los medios transparentes son cercanos al del agua (Tabla 11.3):{' '}
                <span className="tag">lágrimas ≈ 1,336</span> <span className="tag">acuoso 1,3374</span>{' '}
                <span className="tag">córnea 1,3771</span> <span className="tag">vítreo ≈ 1,336</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">💧</span> Cristalino, cámaras y presión
            </div>
            <div className="card-body">
              <p>
                El <strong>cristalino</strong> mide ~4 mm × 9 mm y es 66 % agua / 33 % proteínas. Su índice sube del
                centro a la periferia. Las cámaras anterior y posterior suman ~0,5 cm³ de humor acuoso; el{' '}
                <strong>humor vítreo</strong> ocupa ~5 cm³ de los 7–8 cm³ del globo. La <strong>presión intraocular</strong>{' '}
                (PIO) ronda los <span className="tag">15 mmHg (10–20)</span>.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Zona del cristalino</th>
                    <th>n</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Núcleo</td>
                    <td>1,40–1,41</td>
                  </tr>
                  <tr>
                    <td>Polos</td>
                    <td>1,385–1,388</td>
                  </tr>
                  <tr>
                    <td>Ecuador</td>
                    <td>1,375</td>
                  </tr>
                  <tr>
                    <td>Cápsula</td>
                    <td>1,360</td>
                  </tr>
                  <tr className="table-caption">
                    <td colSpan={2}>El gradiente de índice actúa como lente de poder gradual.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-1">
              Recorre las regiones del ojo con el selector: cada una tiene su papel óptico (córnea: 2/3 de la potencia;
              cristalino: la potencia que se ajusta al enfocar; retina: el detector de ~120 millones de elementos). La PIO
              de 15 mmHg se mantiene por el equilibrio del humor acuoso.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-eye" className="sim" />
            <div className="prof-controls">
              <span className="badge">anatomía</span>
              <label>
                Región{' '}
                <select
                  id="an_sel"
                  defaultValue={params.an_sel}
                  onChange={(e) => {
                    engine.setParam('an_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Córnea</option>
                  <option value="1">Cristalino</option>
                  <option value="2">Humor vítreo</option>
                  <option value="3">Retina + fóvea</option>
                  <option value="4">Punto ciego</option>
                </select>
              </label>
              <span className="readout" id="an_out">
                Córnea · n = 1,3771 · ~2/3 del enfoque
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
