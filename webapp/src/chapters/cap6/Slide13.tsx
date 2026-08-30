import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide13({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="13" data-module="5">
      <div className="module-header">
        <span className="mnum">6.4</span>
        <span className="mtitle">MET y factores de actividad</span>
        <span className="msub">Escalar la TM desde la BMR</span>
        <span className="mslide-count">13 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎚️</span> Factor de actividad y MET
            </div>
            <div className="card-body">
              <div className="eq-block">
                {"\\[ \\text{TM} = f \\cdot \\text{BMR} \\qquad \\text{(eq. 6.32)} \\]"}
              </div>
              <p>
                {"El "}<strong>MET</strong>{": un cuerpo promedio consume "}<span className="tag">3,5 mL/kg-min × MET</span>
                {". Se cumple aproximadamente "}<span className="tag">{"\\(\\text{MET} \\sim f/1{,}5\\)"}</span>
                {" (quizá \\(1{,}2\\) para actividades moderadas)."}
              </p>
              <p>
                {"Ejemplos de \\(f\\): acostado "}<span className="tag">1,05</span>, tejer <span className="tag">1,20</span>, cartas{' '}
                <span className="tag">1,48</span>, billar <span className="tag">3,02</span>, vals <span className="tag">4,22</span>,
                marcha militar <span className="tag">5,08</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏋️</span> Valores de MET · Tablas 6.26–6.30
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>MET</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Descanso, sentado</td>
                    <td>1,0</td>
                  </tr>
                  <tr>
                    <td>Vestirse, lavarse</td>
                    <td>2,0</td>
                  </tr>
                  <tr>
                    <td>Barrer, cocinar</td>
                    <td>1,5–3,0</td>
                  </tr>
                  <tr>
                    <td>Caminar 3,5 mph</td>
                    <td>5,5</td>
                  </tr>
                  <tr>
                    <td>Ciclismo 9,7 mph</td>
                    <td>5,0</td>
                  </tr>
                  <tr>
                    <td>Trotar 5 mph</td>
                    <td>7,5</td>
                  </tr>
                  <tr>
                    <td>Correr 12 mph</td>
                    <td>20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⛏️</span> El factor diario promedio
            </div>
            <div className="card-body">
              <p>
                {"\\(f_{\\text{av}}\\): 1,55–2,10 según ocupación (ONU); el minero escocés de 1950 alcanzó "}
                <span className="tag">2,5× BMR</span> en promedio y 4,3× en horas de trabajo (Tabla 6.31). El <strong>techo metabólico</strong>{' '}
                humano sostenido es ≈ <span className="tag">2,0–2,5× BMR</span> — superado solo por atletas (Tour de Francia ≈ 4,3).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-13">
              El MET convierte «lo que hago» en «kcal que gasto»: TM = 3,5·m·MET. Un MET de 5,5 (caminar rápido) en un alumno de
              70 kg son ≈ 400 kcal/h. Usa el canvas para comparar actividades y su factor frente a la BMR.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-met" className="sim" />
            <div className="prof-controls">
              <span className="badge">MET</span>
              <label>
                actividad{' '}
                <select
                  id="me_act"
                  defaultValue={params.me_act}
                  onChange={(e) => {
                    engine.setParam('me_act', e.target.value);
                    engine.requestDraw();
                  }}
                >
                  <option value="1">Sentado · 1,0</option>
                  <option value="2">Vestirse · 2,0</option>
                  <option value="3">Ducharse · 3,5</option>
                  <option value="4">Caminar 2,5 mph · 3,0</option>
                  <option value="5">Caminar 3,5 mph · 5,5</option>
                  <option value="6">Trotar 5 mph · 7,5</option>
                  <option value="7">Correr 8,5 mph · 12</option>
                  <option value="8">Correr 12 mph · 20</option>
                </select>
              </label>
              <span className="readout" id="me_out">
                MET 20 · 70 kg → ≈ 1470 kcal/h
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
