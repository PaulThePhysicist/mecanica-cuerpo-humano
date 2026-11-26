# Auditoría de pulido final — Capítulo 2 (ronda 1)

**Fecha:** 2026-11-26 · **Rama:** `feat/cap2-pulido-final` (desde `main` en `e4dced4`)
**Alcance:** `webapp/src/chapters/cap2/**`. Fuente de verdad: `Capitulos/Capitulo_2/Capitulo_2.tex` (solo lectura).
**Plantilla de rigor:** `webapp/AUDITORIA_CAP1_PULIDO.md` (reglas, severidades y criterio de salida).
**No reabre:** los tickets cerrados de `webapp/EJECUTAR_CORRECCIONES_CAP2.md` (`P0-01`, `N1-01`, `V2-01..03`, `L3-02`,
`S4-01..03`, `E5-01`, `E5-02`). Sí cierra `L3-01`, que estaba pausado a la espera de la regla D1.
**Este archivo es la memoria de la ronda.** Para retomar: leer la *Tabla de control* y `git log main..feat/cap2-pulido-final`.

## Cómo se auditó

| Evidencia | Cómo se obtuvo |
| :--- | :--- |
| Lectura completa del `.tex` (§2.1–§2.6, 48 ecuaciones, 6 tablas, 50 figuras) | Los Problemas quedan fuera: el deck es la clase, no el problemario (mismo criterio que Cap. 1). |
| Texto DOM de las 21 diapositivas con las fórmulas KaTeX como TeX | Script Playwright de solo lectura (`dump.cjs`), antes y después. |
| Métricas a **1280×720** por diapositiva: tipografía mínima efectiva (incluye escala del `viewBox` SVG y `transform`), *Apunte* oculto bajo el scroll, emoji por contexto (botón, cabecera, tabla, lienzo), notación cruda, punto decimal | Script `audit.cjs`, con el panel de controles cerrado y abierto. |
| Recorrido de interacción: los 168 botones de teoría y paneles pulsados, deslizadores a mínimo y máximo, animaciones | Script `interact.cjs`: errores de consola, diapositiva viva y LaTeX crudo en el apunte tras cada clic. |
| Blindaje: `throw` forzado en `Slide14` (sin commit) | Script `crash.cjs`: el `ErrorBoundary` muestra el aviso y el resto del capítulo sigue operativo. |

Chromium (Playwright) estaba preinstalado en el contenedor; no se instaló ningún navegador. Las capturas y scripts
viven en el *scratchpad* de la sesión Cloud y **no se versionan** (el alcance de esta ronda es solo `cap2/**` y este
archivo). Los recuentos que siguen salen de esas pasadas.

---

## Veredicto

El Capítulo 2 tenía una base visual e interactiva sólida (3D anatómico real, lienzos 2D vivos, 0 errores de consola),
pero **no era dictable desde el libro**. A diferencia del Cap. 1, el problema principal no era la cobertura sino que
**varias diapositivas resolvían modelos distintos a los del texto, con cifras que lo contradecían**:

1. **Cadera (C1):** modelo 5/6 W con brazo de 18 cm; el texto decía 1815 N y el lienzo 2113 N para 70 kg. El libro usa
   el DCL de la pierna (10,8 / 3,2 / 7,0 cm, 70°): M = 1,57 W_b, R = 2,37 W_b, φ = 13°, 90 kg.
2. **Espalda (D1):** erector con brazo de 5 cm → **20 259 N (2065 kgf)** en el dial. El libro: erector a 2L/3 y 12°,
   M = 2,5 W_b (2200 N) y Tabla 2.3.
3. **Tres flexores (B3):** reparto inventado 45/40/15 % y braquiorradial con **25 cm** de brazo; el libro da la Tabla 2.1
   (7,5 cm) y M_i = k A_i (262/399/85 N). El rótulo decía que tres músculos comprimen menos; el libro dice lo contrario.
4. **Mandíbula (E1):** «ventaja mecánica 1,43 en molares»; el libro: 0,50 y 0,76 (siempre < 1).
5. **Rodilla (C3):** a = 4,8 cm, c = 20 cm, θ = 18° frente a 12 / 50 cm y 15° del libro.
6. **Tacto (G1):** bandas de frecuencia de otra fuente (Meissner 10–50, Pacini 200–400 Hz) y un «umbral de disparo de
   +30 mV» fisiológicamente erróneo.
7. **Unidades (H1):** «1 kgf = 10⁵ dyn» (es 1 N = 10⁵ dinas).

A eso se sumaban los mismos defectos de presentación que el Cap. 1: el *Apunte de cátedra* oculto bajo el scroll en
**16 de 21** diapositivas a 1280×720, las pestañas G y H fuera de pantalla, texto de 6,5–11,9 px en todas, emoji en
botones, paneles y lienzos, **LaTeX crudo** en los apuntes que cambian con el estado (8 diapositivas) y 1397 literales de
color. Todo eso queda corregido en 11 commits. Lo que queda abierto está en *Pendientes*.

---

## Decisiones tomadas (sin bloquear; Paul puede revertirlas)

| # | Decisión | Qué se hizo | Alternativa |
| :--- | :--- | :--- | :--- |
| **D7-1** | **Errata del libro en la rodilla.** Con a = 12, b = 22, c = 50 cm, W₁ = 150, W₀ = 100 N, θ = 15°, β = 45°, la Ec. 2.34 da M ≈ 1890 N y R ≈ 1680 N; el `.tex` imprime 1381 N y 1171 N (R = 1171 N sí es coherente con M = 1381 N vía 2.35–2.36). | El visor calcula con la ecuación y la diapositiva lo dice en una línea. | Forzar 1381 N (sería mentir con la ecuación) o quitar la nota. Conviene contrastar con el PDF original. |
| **D7-2** | **Cifras del Caso 4 (B3).** Los 262/399/85 N del libro corresponden a un torque de carga de ≈ 32 N·m, no al del Caso 2 (≈ 38 N·m). | Carga por defecto 8,5 kg, que reproduce las cifras del libro; nota en la tarjeta. | Usar 100 N (Caso 2) y no coincidir con el texto. |
| **D7-3** | **Presión intradiscal en MPa (D2).** La Tabla 2.4 da porcentajes. | Se muestran los porcentajes; las MPa salen de una referencia **rotulada como ilustrativa** (0,5 MPa de pie). | Quitar las MPa. |
| **D7-4** | **Contenidos que no están en §2** (tracción cervical E2, plataforma de fuerza F2, umbrales en µm de G2, cabeza 2,4 W). | Se conservan (enganchan y la física es correcta) con el rótulo «complementario» / «ilustrativo», como `D6` del Cap. 1. | Quitarlos. |
| **D7-5** | **Tarjetas superpuestas a los 3D** (diales, polígonos): estaban a `scale(0,66–0,82)` y su texto quedaba en 7–9 px. | Escala 1 para respetar el piso de 12 px; son más grandes y en algunas escenas tapan parte de la anatomía. | Hacerlas plegables (ticket `V7-02`). |
| **D7-6** | **Iconos de la portada** (`mpill` de Slide0). | Se conservan: son «portada» en la regla D1, equivalentes a las pestañas de módulo. | Quitarlos. |

---

## Matriz de cobertura `.tex` → diapositiva

✅ completo · 🟡 parcial · 🔴 ausente o erróneo. «Antes» = estado en `main` (`e4dced4`); «Ahora» = esta rama.
Numeración de diapositivas: S0…S20 = índice de `SLIDES` = punto del riel. A1 = `Slide1` … C3 = `SlideKnee`, C4 = `SlideAnkle`, D1 = `Slide9` … H2 = `Slide18`.

### §2.1 Revisión de fuerzas, torques y equilibrio

| Contenido del `.tex` | Dónde | Antes | Ahora | Ticket |
| :--- | :--- | :---: | :---: | :--- |
| Ecs. 2.1–2.2 (ΣF y Στ por ejes; todo el cuerpo o cualquier parte) | A1 | ✅ | ✅ | — |
| ¿Qué es un torque? Lineal vs angular; signo antihorario (Fig. 2.1b) | A2 | 🟡 | ✅ | `P7-04` |
| Ec. 2.3 τ = r × F (Fig. 2.1e) | A2 | ✅ (subtítulo sin vector) | ✅ | `P7-04` |
| Ec. 2.4 τ = rF sen θ; signos por rangos de θ (Fig. 2.2) | A2 | 🟡 | ✅ | `P7-04` |
| Ec. 2.5 τ = r′F = rF′ (Fig. 2.3) | A2 + lienzo | ✅ (r⊥/F⊥) | ✅ (r′/F′) | `P7-04` |
| Ecs. 2.6–2.7 F = ma = dp/dt, τ = I dΩ/dt = dL/dt; cuasiestática | A1 | 🔴 (`F_net = m·a` crudo) | ✅ | `P7-04` |
| «Torque» vs «momento» (Cap. 4) | A2 | 🔴 | ✅ | `P7-04` |

### §2.2 Estática: movimiento en un plano y palancas

| Contenido del `.tex` | Dónde | Antes | Ahora | Ticket |
| :--- | :--- | :---: | :---: | :--- |
| Ec. 2.8 (tres ecuaciones en el plano; ejes 2D ≠ Fig. 1.1) | B1 | 🔴 | ✅ | `P7-05` |
| Ecs. 2.9–2.10 M d_M = W d_W, M = (d_W/d_M) W | B1 | 🔴 (notación b_p/b_r) | ✅ | `P7-02` |
| Ec. 2.11 y Ec. 2.12 (eje arbitrario, Fig. 2.5) | B1 | 🔴 | ✅ | `P7-02` |
| Fig. 2.4 tres clases; 1ª clase: fulcro W + M | B1 lienzo 2D | ✅ | ✅ | — |
| Ejemplos 1ª clase (balancín, cabeza, tríceps; Fig. 2.6a–b) | B1, B4 | 🟡 (atlanto-occipital con cifras no del libro) | ✅ (cifras rotuladas ilustrativas) | `P7-02` |
| 2ª clase: VM = W/M = d_M/d_W > 1; puntillas (Fig. 2.6c); empujar con tríceps | B1, B4 | 🟡 | ✅ | `P7-02` |
| 3ª clase: la más común, M = 9 W, amplificación d_W/d_M; bíceps 25 cm, 7–8 cm | B1 | 🔴 (35 cm, 8,75×) | ✅ | `P7-02` |

### §2.3.1 El antebrazo

| Contenido del `.tex` | Dónde | Antes | Ahora | Ticket |
| :--- | :--- | :---: | :---: | :--- |
| 0,146H + 0,108H/2 = 0,2H = 36 cm | B2 | 🔴 (35 cm) | ✅ | `P7-02` |
| Caso 1: M = 9 W_W; 100 N → 900 N; supuestos declarados | B2 | 🔴 | ✅ | `P7-02` |
| Caso 2: W_F = 0,022 W_b ≈ 15 N a 13 cm; Ecs. 2.13–2.15; 950 N | B2 | 🔴 (14 cm, 3,5 W_a) | ✅ | `P7-02` |
| Caso 3: Ecs. 2.16–2.17, M independiente de θ; fuerza máxima según longitud | B2 + 3D | 🟡 | ✅ | `P7-02` |
| Caso 4: Ecs. 2.18–2.24, PCA, k ≤ 40 N/cm², Tabla 2.1, 262/399/85 vs 696 N | B3 | 🔴 (45/40/15 %, 25 cm) | ✅ | `P7-02` |
| Problema indeterminado (k_i distintas) | B3 apunte | 🔴 | ✅ | `P7-02` |
| Figs. 2.7–2.10 | B2–B4 (modelo 3D) | ✅ | ✅ | — |

### §2.3.2 Problemas de cadera

| Contenido del `.tex` | Dónde | Antes | Ahora | Ticket |
| :--- | :--- | :---: | :---: | :--- |
| Anatomía (ilion, pubis, isquion, acetábulo, trocánter mayor; Figs. 2.11–2.15) | C1 3D | 🟡 | 🟡 | `P7-06` |
| Cuerpo completo: N = W_b | C1 | 🔴 | ✅ | `P7-01` |
| Pierna: N, W_leg = 0,16 W_b, R, M a 70°; abductores 1:2:4 (Figs. 2.16–2.17) | C1 + 3D + polígono | 🔴 | ✅ | `P7-01` |
| Ecs. 2.25–2.28: M = 1,57 W_b; R_x = 0,54, R_y = 2,31, R = 2,37 W_b, φ = 13°; 90 kg → 1400 / 2100 N | C1 | 🔴 | ✅ | `P7-01` |
| Bastón: N_c = W_b/6 a 30,5 cm; Ecs. 2.29–2.33; L = 6,1 cm; M = 0,61, R = 1,26 W_b, φ = 9,5° (Figs. 2.18–2.20) | C2 | 🔴 | ✅ | `P7-01` |
| Efecto principal: brazo de N de 10,8 a 4,7 cm; ~145 N en el bastón | C2 | 🔴 | ✅ | `P7-01` |
| Variante con peso a la izquierda (Problemas 2.8–2.9) | C2 apunte | 🔴 | ✅ | `P7-01` |
| Tabla 2.2 | C1 | 🔴 | ✅ | `P7-01` |
| Reemplazo total de cadera (Co-Cr / Ti, PMMA, UHMWPE) | C1 | 🔴 | ✅ | `P7-01` |

### §2.3.3 Otras articulaciones sinoviales

| Contenido del `.tex` | Dónde | Antes | Ahora | Ticket |
| :--- | :--- | :---: | :---: | :--- |
| Hombro: Fig. 2.21, componente x ≈ 4× la y (inestable), luxación, 249°/182°/131° | A1 | 🔴 | ✅ | `P7-04` |
| Rodilla: dos articulaciones, meniscos, cóndilos, cadena cuádriceps–rótula–tendón patelar (Fig. 2.22) | C3 | 🔴 | ✅ | `P7-03` |
| Ecs. 2.34–2.36 con los datos del libro (Figs. 2.23–2.25) | C3 + 3D | 🔴 | ✅ (D7-1) | `P7-03` |
| Rótula como polea; Ecs. 2.37–2.38 (Figs. 2.26–2.27) | C3 | 🟡 (sin 2.38) | ✅ | `P7-03` |
| Tobillo de puntillas: Ecs. 2.39–2.40, 1,93 / 2,73 W_b (Figs. 2.28–2.29) | C4 + 3D | ✅ | ✅ | — |
| Mandíbula: ángulo recto, rama, ATM; ICBM, cúspides (Fig. 2.30) | E1 | 🔴 | ✅ | `P7-03` |
| Ventajas mecánicas 0,50/0,76 · 0,24/0,48 · 0,37/0,72 | E1 + 3D | 🔴 (1,43) | ✅ | `P7-03` |
| Ortodoncia, centro de resistencia, arco de intrusión (Figs. 2.31–2.33) | E1 | 🔴 | 🟡 (texto, sin figura) | `P7-03` |
| Mandíbulas pequeñas, dientes de más, dieta blanda | E1 apunte | 🔴 | ✅ | `P7-03` |

### §2.3.4 Parte baja de la espalda

| Contenido del `.tex` | Dónde | Antes | Ahora | Ticket |
| :--- | :--- | :---: | :---: | :--- |
| 33 vértebras / 26 huesos; 7-12-5-5-4; curvas primarias y secundarias (Fig. 2.34) | D1 | 🔴 | ✅ | `P7-03` |
| Ángulo lumbosacro ~30° (Fig. 2.38); erector a 2/3 y 12° (Figs. 2.39–2.41) | D1 + 3D | 🔴 (5 cm) | ✅ | `P7-03` |
| Ecs. 2.41–2.43: M = 2,5 W_b, R = 2,74 W_b, φ = 30°; 2200 / 2400 N | D1 + 3D | 🔴 (20 kN) | ✅ | `P7-03` |
| Ecs. 2.44–2.46: + 0,2 W_b → M = 3,74, R = 4,07 W_b; +1100 N por +180 N | D1 | 🔴 | ✅ | `P7-03` |
| Tabla 2.3 | D1 (fila activa resaltada) | 🔴 | ✅ | `P7-03` |
| Disco: 2400 N ≈ 245 kg, 20 % de compresión, r +10 % (Fig. 2.42), hernia (Fig. 2.37) | D2 | 🔴 (MPa inventadas) | ✅ | `P7-03` |
| Erguido 0,6 W_b = 530 N; carga no uniforme (Fig. 2.43) | D2 + 3D | 🔴 | ✅ | `P7-03` |
| Tabla 2.4 (22 filas) | D2 (4 filas interactivas + tabla completa plegable) | 🔴 (85 % sentado, contrario al libro) | ✅ | `P7-03` |
| Fig. 2.44 (> 2 W_b al caminar rápido), Fig. 2.45 (respaldo), consejos, Fig. 2.46 | D2 | 🔴 | 🟡 (texto, sin figuras) | `P7-03`, `P7-05` |

### §2.3.5–2.3.6 Regla de las tres fuerzas y modelado multisegmento

| Contenido del `.tex` | Dónde | Antes | Ahora | Ticket |
| :--- | :--- | :---: | :---: | :--- |
| Regla de las tres fuerzas, construcción gráfica (Fig. 2.47) | A1 (4 pasos), A2 | ✅ | ✅ | — |
| Rodilla 3–4 W_b al caminar | C3, F2 | ✅ | ✅ | — |
| Segmentos m, CM, I; DCL por segmento, 3.ª ley en articulaciones (Figs. 2.48–2.49) | F1 | 🔴 (solo CG por segmentos) | ✅ | `P7-04` |

### §2.4 El sentido del tacto

| Contenido del `.tex` | Dónde | Antes | Ahora | Ticket |
| :--- | :--- | :---: | :---: | :--- |
| Sentidos somáticos (cutáneo, propiocepción, cinestesia) | G1 | 🔴 | ✅ | `P7-04` |
| Cuatro receptores con sus bandas (Merkel 0,3–3; Meissner 3–40; Ruffini 15–400; Pacini 10–500 Hz) (Fig. 2.50) | G1 + 3D | 🔴 | ✅ | `P7-04` |
| Densidad 25/cm² (lengua) a 0,02/cm² (espalda); pelo | G1 | 🔴 | ✅ | `P7-04` |
| Termorreceptores (30–48 °C, 44 °C; 20–45 °C, 30 °C; 5–10/cm²) | G1 | 🔴 | ✅ | `P7-04` |
| Nociceptores (30 m/s mielinizados; ≤ 2 m/s) | G1 | 🔴 | ✅ | `P7-04` |
| Ley de Stevens del tacto; palpación, percusión, auscultación | G2 | 🔴 | ✅ | `P7-04` |

### §2.5 Unidades de fuerza y presión

| Contenido del `.tex` | Dónde | Antes | Ahora | Ticket |
| :--- | :--- | :---: | :---: | :--- |
| Tabla 2.5 | H1 | 🔴 (1 kgf = 10⁵ dyn) | ✅ | `P7-04` |
| Ec. 2.47, g en tres sistemas, slug, «kg (fuerza)» | H1 | 🔴 | ✅ | `P7-04` |
| Tabla 2.6 | H1 (tabla completa plegable) | 🟡 | ✅ | `P7-05` |
| Ec. 2.48 P = ρgh; mmHg/cmH₂O como alturas; ρ sangre; 120/80 manométrica; 1 atm ≈ 1 bar | H1 | 🔴 | ✅ | `P7-04` |

### §2.6 Resumen

| Contenido del `.tex` | Dónde | Antes | Ahora | Ticket |
| :--- | :--- | :---: | :---: | :--- |
| Palancas · todo y parte · fuerzas internas > peso · consecuencias | H2 | 🟡 (2,7 W, 8,75×, −50 % con `\\%` crudo) | ✅ | `P7-04` |

**Recuento (ahora):** ecuaciones 48/48 ✅ (antes faltaban 2.6–2.8, 2.11–2.12, 2.18–2.24 y 2.41–2.48, y otras usaban otra notación o cifras). Tablas 6/6 ✅ (antes 0 ✅ · 1 🟡 · 5 🔴). Figuras: ninguna figura del
libro se muestra como imagen; 38 de 50 tienen equivalente interactivo 3D/2D o están descritas con su número en el texto;
quedan sin representación visual las Figs. 2.31–2.33 (ortodoncia), 2.42, 2.44–2.46 (gráficas y fotos) y 2.48–2.49
(modelo de segmentos) → `P7-06`.

---

## Convenciones de esta ronda

- **VE (verificación estándar):** `cd webapp && npx tsc -b && npx oxlint src/chapters/cap2 && npm run build`, más las
  pasadas `audit.cjs` (cerrado y abierto), `interact.cjs` y `crash.cjs` a 1280×720.
- **Severidad:** A alta (miente, rompe o impide dictar) · M media · B baja. **Estados:** `CERRADO` · `PENDIENTE`.
- **Fuente única de cifras:** `cap2/staticsModels.ts` (modelos de §2.3) y `cap2/palette.ts` (tokens). Texto, HUD y
  escena 3D importan de ahí; una cifra no puede volver a divergir entre el párrafo y el dial.

---

## Tabla de control

| ID | Sev. | Título | Estado | Commit |
| :--- | :---: | :--- | :--- | :--- |
| `I7-01` | A | Índice seguro del reloj en F2 + `ErrorBoundary` por diapositiva + barra sin pestañas duplicadas | CERRADO | `6ce5645` |
| `P7-01` | A | Cadera y bastón con el modelo del libro; Tabla 2.2; reemplazo de cadera | CERRADO | `1a70ee0` |
| `P7-02` | A | Palancas (Ecs. 2.8–2.12), antebrazo (Casos 1–4, Tabla 2.1), tríceps ilustrativo; `KatexHtml` | CERRADO | `9cc8d01` |
| `P7-03` | A | Rodilla, espalda (Tabla 2.3), disco (Tabla 2.4), mandíbula (VM del libro) | CERRADO | `1ab855a` |
| `P7-04` | A | A1/A2, F1 multisegmento, F2/E2 complementarios, tacto, unidades, resumen | CERRADO | `8e8458e` |
| `P7-05` | M | Ec. 2.8, Tabla 2.6 completa, Fig. 2.46 | CERRADO | `d59d670` |
| `N7-01` | A | Coma decimal es-ES en DOM, SVG, canvas y 3D; insignias con la numeración del libro | CERRADO | `e613611` |
| `L3-01` | M | Regla de emoji D1 en todo `cap2/` (ticket pausado de `EJECUTAR_CORRECCIONES_CAP2.md`) | CERRADO | `f87099e` |
| `V7-01` | A | Proyector: apunte fijo, área segura, pestañas, piso de 12 px, colores con tokens | CERRADO | `e4c8955`, `ff067f4` |
| `V7-02` | M | Tarjetas superpuestas al 3D plegables o más compactas (D7-5) | PENDIENTE | |
| `P7-06` | M | Figuras del libro sin equivalente visual (2.31–2.33, 2.42, 2.44–2.46, 2.48–2.49) | PENDIENTE | |
| `A7-01` | M | Piso tipográfico dentro de los lienzos 2D (`ctx.font` de 7–10 px en B1, A2, G2) | PENDIENTE | |
| `S7-01` | B | Literales de color restantes (materiales PBR, piel, osciloscopio, rejillas) | PENDIENTE (excepción) | |

---

## Detalle de lo cerrado

### `I7-01` · Blindaje — CERRADO
- `Slide14.tsx` indexaba `order[Math.floor((t * 0.58) % 3)]`: con `t < 0` (primer fotograma) o `NaN` el índice es
  inválido y la diapositiva cae (el mismo patrón que tumbó B4 en el Cap. 1). Ahora `Math.floor(Math.max(0, t) * 0.58) %
  order.length` y respaldo `?? 'heel_strike'`. `Slide2.tsx` usa también `Math.max(0, t)`. Las otras cinco diapositivas
  con `useHarmonicClock` solo calculan senos (sin índices). El hook compartido ya tenía `dt ≥ 0` desde `I6-02`.
- `Capitulo2.tsx`: clase `SlideErrorBoundary` (patrón `I6-03`) alrededor de cada diapositiva, con aviso y botón
  «Reintentar». Mejora sobre el Cap. 1: el aviso conserva la cabecera de módulo y la rejilla.
- Colateral: con `StrictMode` la barra de módulos se construía dos veces (16 pestañas en desarrollo); guarda añadida.
- Verificación: `throw` forzado en S16 → aviso visible, 8 pestañas y 21 puntos operativos, S17 navega; 0 errores.

### `P7-01` · Cadera y bastón — CERRADO
`staticsModels.ts → hipStatics()` reproduce el libro: sin bastón M = 1,564 W_b, R_x = 0,535, R_y = 2,310, R = 2,371 W_b,
φ = 13,0°; con bastón W_b/6: L = 6,10 cm, M = 0,605, R = 1,259 W_b, φ = 9,5°. Para otras fuerzas de bastón se interpola
la geometría entre las Figs. 2.17 y 2.20; el bastón «del mismo lado» es una extrapolación rotulada como tal. Masa por
defecto 90 kg (la del libro). Trendelenburg queda como «abductores al 25 %: sin equilibrio» (polígono abierto).

### `P7-02` · Palancas y antebrazo — CERRADO
Notación del libro (M, W, d_M, d_W). B2: W_F = 15 N a 13 cm, W_W a 36 cm; R = M − W_W − W_F se presenta como derivada
de ΣF_y = 0 (el libro no la calcula). B3: k = τ/ΣA_i d_i, con 8,5 kg reproduce 261/398/85 N y 694 N con el bíceps
solo (D7-2). `KatexHtml.tsx` re-renderiza los apuntes que cambian con el estado: antes, al elegir otra palanca, postura,
fase, receptor o nodo, el apunte mostraba `$b_p \approx 5\text{ cm}$` (8 diapositivas).

### `P7-03` · Rodilla, espalda, disco, mandíbula — CERRADO
C3 con los parámetros del libro y la nota de la errata (D7-1); la dirección de R en el 3D sale de la geometría del
tendón y la magnitud de las Ecs. 2.35–2.36. D1 con `backStatics()`: reproduce la Tabla 2.3 completa (2,50/3,75 · 1,44/
2,16 · 0,50/0,75 · 0/0 y 2,74/4,07 · 1,93/2,81 · 1,08/1,52 · 0,60/0,80); botones θ = 90/80/60/30°. D2 con la Tabla 2.4
(D7-3) y las filas convertidas en botones accesibles por teclado. E1 con VM = 0,50/0,76 del masetero.

### `P7-04` · A, F, G, H — CERRADO
Ver la matriz. Insignias del panel con la numeración del libro («§2.3.2 · Cadera») y «Complementario» donde corresponde.

### `N7-01` · Coma decimal — CERRADO
`ab.ts` gana `fx(x, d)` (decimales fijos, coma, sin «−0») y `fexp()` (1,01 × 10⁵). 94 `toFixed(n ≥ 1)` visibles
convertidos por codemod; escalas SVG de los diales (1,5k · 2,2k · 4,0M · 1,15 W). Verificación: en el DOM de las 21
diapositivas solo quedan puntos en referencias del libro («Ec. 2.27», «Fig. 2.3»).

### `L3-01` · Regla de emoji D1 — CERRADO
De 222 apariciones a 140, todas en contextos permitidos: pestañas de módulo (`sims.ts → MODULES`), portada, cabeceras de
tarjeta, «✍️ Apunte de cátedra» y pistas 💡; más los símbolos tipográficos ⚙ × ✕ de los controles. Fuera de botones y
toggles (🏷️, 📷, «⚠️ Luxación», ☷), del panel HUD (su botón plegado dice «Datos»), de los estados y rótulos de los
lienzos 2D/3D, de las filas de datos (posturas del disco) y del inspector de H2. El «✓ Vista General» pasa a estado
tipográfico. No se dibujaron glifos nuevos.

### `V7-01` · Proyector 1280×720 y tokens — CERRADO
- *Apunte de cátedra* `position: sticky` al pie de `.theory`: visible en 20/20 diapositivas (antes 4/20).
- Área segura: `Capitulo2.tsx` mide el panel abierto con `ResizeObserver` y publica `--cap2-safe-bottom`; el lienzo se
  compone por encima y el fondo sigue a sangre. Con el panel cerrado (estado por defecto) no cambia nada.
- Pestañas ≤ 1366 px: las inactivas muestran letra e icono (nombre en `title`/`aria-label`); la activa, el nombre.
- Piso de 12 px: rem inline y de `cap2.css` ≥ .62rem (raíz 19,9 px a 1280), texto SVG ≥ 12 unidades, subíndices
  `max(.8em, 12px)`, sin `transform: scale()` en las tarjetas. Medición final: 0 nodos de texto < 12 px (los «11,4 px»
  residuales del script son redondeo de `offsetWidth`; el estilo computado es 12 px).
- `palette.ts` lee los tokens de `:root` (`src/index.css`) una vez y los expone como hex (`C`, `ca()`), válidos en DOM,
  SVG, canvas y Three.js. 734 líneas convertidas. Mapa: verdes → `--coronal`, azules → `--series-3`, violetas →
  `--sagittal`, naranjas/ámbar → `--amber`, rojos → `--blood`/`--blood-deep`, grises → `--ink-*`/`--line*`, blanco →
  `--card`.

---

## Pendientes

### `V7-02` · Tarjetas superpuestas al 3D — PENDIENTE
- Síntoma: sin el `scale(0,7)` (D7-5), los diales de C1, C2, D1, D2, E1, E2, F1, F2 y el inspector de H2 ocupan ~190 px
  y en D1/D2 tapan parte de la columna o del disco.
- Pasos: añadirles el mismo botón «×/Datos» que `HudPanel` (plegadas por defecto a ≤ 760 px de alto) o compactar el
  dial a 96 px manteniendo 12 px de texto.

### `P7-06` · Figuras sin equivalente visual — PENDIENTE
- Ortodoncia (2.31–2.33), curva carga-compresión del disco (2.42), carga L3–L4 al caminar (2.44), sillas (2.45),
  ejercicios (2.46), modelo de segmentos (2.48–2.49). Hoy están descritas en texto con su número.
- Opción: lightbox con los PNG de `Capitulos/Capitulo_2/imagenes/` como en el Cap. 1, o un mini-lienzo para 2.42.

### `A7-01` · Tipografía dentro de los lienzos 2D — PENDIENTE
- `LeverCanvas` (B1), `TorqueCanvas` (A2), `TactileThresholdCanvas` (G2) y `MechanoreceptorsCanvas` (G1) pintan
  rótulos de 7–10 px con `ctx.font`. El encargo pedía el piso en el DOM; en el lienzo se ven pequeños a 1280×720.

### `S7-01` · Literales de color restantes — EXCEPCIÓN DOCUMENTADA
- 329 apariciones: materiales PBR (hueso marfil, cartílago, músculo, tendón), luces de estudio, `ContactShadows`,
  `gridHelper`, tonos de piel y del chasis del osciloscopio, degradados de varias paradas y partículas de alimento.
  Siguen `BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md` §3 y la decisión de `S4-01`. `sims.ts` y `ab.ts → PAL` no se tocan:
  sus funciones de dibujo están inactivas (ningún slide monta `<Sim>`).

---

## Qué revisar en Chrome (no se puede validar en el contenedor)

1. **C1–C2 a 1280×720:** el polígono de la pierna (N−W, M, R) y el dial; que 90 kg dé R ≈ 2090 N y que con 15 kg en el
   bastón baje a ≈ 1110 N.
2. **D1:** pulsar θ 30° / 60° / 80° / 90° y comprobar que el HUD y la fila resaltada de la Tabla 2.3 coinciden.
3. **Área segura:** abrir el panel (⚙) en C1, D1 y H2: el modelo y las tarjetas deben subir por encima del panel (hay
   una transición de 250 ms).
4. **Pestañas a 1280 px:** las 8 caben; pasar el cursor por una inactiva muestra su nombre.
5. **Apunte fijo:** desplazar la teoría de B3, D2 y H1: el apunte queda siempre visible al pie.
6. **KaTeX en apuntes que cambian:** B1 (clase de palanca), D2 (postura), E1 (preset), G1 (receptor), H2 (nodo).
7. **Emoji en Windows:** cabeceras y pestañas son los únicos sitios con emoji; comprobar que ninguno sale como cuadro vacío.
8. **`V7-02`:** decidir si las tarjetas superpuestas deben plegarse.

---

## Hallazgos colaterales (no corregidos)

- (auditor) **Errata probable del libro** en la rodilla (D7-1) y cifras del Caso 4 calculadas con otro torque (D7-2):
  conviene contrastar ambas con el PDF original.
- (auditor) `sims.ts` (886 líneas) conserva funciones de dibujo 2D inactivas y `MODULES`; solo `MODULES`, `TOTAL` y
  `redrawSlide` (que hoy no dibuja nada salvo el conversor) siguen en uso. Candidato a limpieza en otra ronda.
- (auditor) `oxlint` pasa de 97 a 100 avisos (variables sin uso: `fCaneN` en `CaneCanvas`, `rShearN`/`fErectorKgf` en
  `SpineCanvas`, `mechAdv`/`rAtmKgf` en `JawCanvas`). Ningún error.
- (auditor) La captura de S20 con `page.screenshot` de Playwright no termina (espera de fuentes); con CDP sí. No afecta
  al usuario; anotado para quien automatice capturas.
- (auditor) `Capitulo2.tsx` crea un `ResizeObserver` por panel y no lo desconecta; los paneles viven todo el capítulo,
  así que no hay fuga práctica.
- (auditor) Los rótulos de vectores 3D usan nombres sin subíndice («Wb», «M (bíceps)») para no mostrar notación de
  teclado; los HUD y la teoría usan `<sub>` o KaTeX.

---

## Validación de la entrega

```bash
cd webapp && npm ci && npx tsc -b && npx oxlint src/chapters/cap2 && npm run build
```

Resultado en el contenedor (2026-11-26): `tsc -b` sin errores · `oxlint` 0 errores, 100 avisos · `vite build` correcto
(`Capitulo2` 502 kB). Recorrido Playwright a 1280×720: 21/21 diapositivas sin errores de consola, apunte visible en
20/20, 0 textos < 12 px, 0 notación cruda, emoji solo en contextos D1, 168 botones y todos los deslizadores en sus
extremos sin fallo.
