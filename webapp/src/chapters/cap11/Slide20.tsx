import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide20({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="20" data-module="8">
      <div className="module-header">
        <span className="mnum">11 · 4</span>
        <span className="mtitle">Enfermedades del ojo</span>
        <span className="msub">{"\\(\\text{catarata: cristalino opaco}\\ \\cdot\\ \\text{mácula} \\approx 5\\ \\mathrm{mm}\\)"}</span>
        <span className="mslide-count">20 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🩺</span> Del cristalino a la retina
            </div>
            <div className="card-body">
              <p>
                La <strong>catarata</strong> opacifica el cristalino (la principal causa de ceguera reversible del
                mundo); la <strong>cicatrización corneal</strong> se trata con trasplante (disco de 6–8 mm). En la retina,
                la <strong>retinopatía diabética</strong> y su <strong>neovascularización</strong> sangran y desprenden
                capas.
              </p>
              <div className="eq-block">
                {"\\[ \\text{catarata} \\to \\text{opacidad}\\ \\Rightarrow\\ \\text{luz dispersada, sin imagen} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧬</span> Degeneración y desprendimiento
            </div>
            <div className="card-body">
              <p>
                La <strong>degeneración macular</strong> ataca la mácula (~5 mm, centro del campo); la{' '}
                <strong>retinitis pigmentosa</strong> apaga primero los bastones periféricos; el{' '}
                <strong>desprendimiento de retina</strong> separa el fotodetector de su nutrición. La{' '}
                <strong>fóvea</strong> no tiene vasos: la mácula se nutre desde abajo, y por eso es tan vulnerable.
              </p>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Patología</th>
                    <th>Estructura</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Catarata</td>
                    <td>Cristalino</td>
                  </tr>
                  <tr>
                    <td>Degeneración macular</td>
                    <td>Mácula / fóvea</td>
                  </tr>
                  <tr>
                    <td>Retinopatía diabética</td>
                    <td>Vasos de la retina</td>
                  </tr>
                  <tr>
                    <td>Retinitis pigmentosa</td>
                    <td>Bastones</td>
                  </tr>
                  <tr>
                    <td>Desprendimiento</td>
                    <td>Retina → vítreo</td>
                  </tr>
                  <tr className="table-caption">
                    <td colSpan={2}>Cada diagnóstico apunta a una estructura distinta del globo.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-20">
              Recorre las patologías: cada una pinta sobre el ojo el lugar donde falla la imagen. La lección clínica:
              localizar el defecto (medio, retina o vía) antes de corregir.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-disease" className="sim" />
            <div className="prof-controls">
              <span className="badge">patología</span>
              <label>
                Casos{' '}
                <select
                  id="en_sel"
                  defaultValue={params.en_sel}
                  onChange={(e) => {
                    engine.setParam('en_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Catarata</option>
                  <option value="1">Degeneración macular</option>
                  <option value="2">Retinopatía diabética</option>
                  <option value="3">Retinitis pigmentosa</option>
                  <option value="4">Desprendimiento de retina</option>
                </select>
              </label>
              <span className="readout" id="en_out">
                Catarata · cristalino opaco → luz dispersada
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
