# Auditoría de pulido final — Capítulo 1 (ronda 1)

**Fecha:** 2026-11-14 · **Auditor/orquestador:** Claude (Fable) · **Ejecutor por defecto:** subagente `ejecutor-ticket`
**Alcance:** `webapp/src/chapters/cap1/**`. Fuente de verdad: `Capitulos/Capitulo_1/Capitulo_1.tex` (solo lectura).
**Este archivo es la única memoria del loop.** Para retomar: leer la *Tabla de control* y `git log`, seguir por el primer ticket no `CERRADO`.

## Cómo se auditó

| Evidencia | Ruta |
| :--- | :--- |
| Línea base, 51 capturas (desktop 1440×900, móvil 820×1180, **proyector 1280×720**) + `report.json` | `scratch/fable-r1-before/` |
| Texto DOM de cada diapositiva + métricas (scroll oculto, tipografía mínima, emoji, notación cruda) a 1280×720 | `scratch/fable-audit/all-slides.txt`, `scratch/fable-audit/dump/metrics.json` |
| Columna de teoría desplazada al final (lo que el proyector no enseña) | `scratch/fable-audit/dump/proj-NN-scrolled.png` |
| Recorrido de interacción en Chrome real (clics, sliders en extremos, teclado, lightbox) | `scratch/fable-audit/interact/*.png`, `log.txt`, `log2.txt` |
| Scripts reproducibles (solo lectura) | `scratch/fable-audit/{dump,interact,interact2,crash,summary}.mjs` |

Se leyó el `.tex` completo de §1.1–§1.5 (los Problemas quedan fuera: el deck es la clase, no el problemario).
`webapp/scripts/shoot-slides.mjs` ganó el viewport `proj` (1280×720); ese cambio está sin commit.

---

## Veredicto

El Capítulo 1 **se ve terminado pero no lo está para dictar desde él**. La base visual e interactiva es buena
(3D anatómico, C2 y B3 siguen siendo ejemplares, 0 errores de consola en el recorrido pasivo, teclado correcto).
Lo que falta es de otra naturaleza que en las rondas anteriores:

1. **Hay un fallo que deja la app en blanco.** En B4, «Test en H» tumba todo el capítulo (pantalla vacía, sin
   mensaje) cuando el primer fotograma llega con `dt` negativo. Se reproduce 2 de 2 veces en Chrome headless y 0 de 1
   en el navegador integrado: es una carrera, no un fallo fijo, pero su modo de fallar es el peor posible en clase.
   No hay `ErrorBoundary` a nivel de diapositiva.
2. **Hay cifras y atribuciones que no son las del libro.** Tabla 1.15 con estímulos cruzados (heptano, 60 Hz),
   dos factores distintos para «duplicar el estímulo» en la misma pantalla, «Tabla 1.14» rotulando algo que no es
   la Tabla 1.14, 1,85 m² atribuido a Du Bois (que da 1,82), ejes cinemáticos de B3 en una convención distinta a la
   de A1, términos regionales erróneos (Popliteus = «Rodilla»), y descriptores de somatotipo inventados.
3. **La cobertura del `.tex` está lejos del 100 %.** De los 53 contenidos de la matriz: 19 completos, 14 parciales
   y 20 ausentes o erróneos. De 15 tablas: 0 completas, 9 parciales, 6 ausentes (1.4, 1.7, 1.8, 1.9, 1.12, 1.14).
   De 16 figuras, 7 se muestran y 3 las sustituye el 3D. Las 6 ecuaciones sí están. Faltan
   justo los datos que más enganchan a un estudiante de salud: 37 °C, 120/80 mmHg, gasto cardíaco 5 L/min, tiempos
   característicos (1 s, 1 min, 2 min), los ejemplos de atletas por somatotipo.
4. **A 1280×720 la clase no cabe.** 12 de 17 diapositivas esconden parte de la teoría tras un scroll (visible 537 px
   de hasta 853), y el *Apunte de cátedra* —que cambia con cada clic— queda fuera de pantalla. El panel de controles
   flotante tapa el 20–25 % inferior del lienzo: los pies de las figuras, el eje x de D1 y D4, y en C3 «Vista 2D»
   tapa el propio arco del tobillo que se acaba de seleccionar. Hay texto de 9,6–12 px en todas las diapositivas.
5. **Los emoji siguen en todas partes** (cabeceras, pestañas, dentro de las gráficas, botones). `S4-01` nunca se
   ejecutó y `PRODUCT.md` pide lo contrario que el plan: es la decisión D1.

Nada de lo anterior exige rehacer: son ~59 tickets pequeños. El orden es el del encargo: primero lo que miente o
rompe, luego cobertura, luego legibilidad en proyector, al final lo estético.

---

## Decisiones que necesito de Paul (bloquean tickets)

| # | Decisión | Mi recomendación | Bloquea |
| :--- | :--- | :--- | :--- |
| **D1** | **Regla única de emoji.** `PRODUCT.md`: «color y emojis ocasionales». Plan anterior: «sin emoji». Hoy: emoji en pestañas, cabeceras, gráficas y botones. | **Emoji solo como icono de cabecera** (pestaña de módulo, cabecera de tarjeta, portada, apunte) y en pistas (💡). **Nunca** dentro de lienzos/gráficas, tablas de datos ni botones de control. Los que no renderizan (cuadro vacío en C3) se sustituyen. | `S6-01`, `S6-02` |
| **D2** | **Panel de controles a 720 px de alto.** Lo quieres flotante (revertiste `V2-05`), pero en proyector tapa ejes, pies y la articulación seleccionada. | **Área segura:** el panel sigue flotando y el lienzo sigue a sangre, pero cada lienzo compone su contenido por encima del panel. Alternativas: (b) panel colapsado por defecto si el alto ≤ 760 px; (c) dejarlo. | `V6-01`…`V6-03` |
| **D3** | **Cómo completar las tablas del libro sin romper las 17 diapositivas.** | **Pestañas dentro de las tarjetas existentes** (p. ej. C2: Longitud · Masa · Centro de masa · Radio de giro). Alternativas: (b) diapositivas nuevas; (c) aceptar tablas abreviadas y no llegar al 100 %. | `P6-20`…`P6-37` |
| **D4** | **Forma de los términos regionales en A3.** El `.tex` los deja como adjetivo en inglés (*Popliteal*, *Axiliary* [sic]); la web usa sustantivos latinos, varios mal (*Popliteus* es un músculo; *Femur*, un hueso). | **Adjetivo en español + término común** («Poplítea — parte posterior de la rodilla»), que es lo que oirán en clínica. Alternativas: (b) literal del `.tex`; (c) conservar los latinos y corregir solo los erróneos. | `P6-09`, `P6-10`, `P6-20` |
| **D5** | **`useHarmonicClock.ts` lo importa también el Cap. 2** (7 diapositivas; `cap2/Slide14` tiene el mismo patrón que falla en B4). | **Autorizar** un cambio de una línea (`dt ≥ 0`). Solo puede mejorar el Cap. 2. Sin él, `I6-01` protege B4 pero el Cap. 2 queda expuesto. | `I6-02` |
| **D6** | **Esfuerzos en MPa de D2** (32/34/36/88/215, rotura 150): no están en el capítulo. | **Mantener la simulación** (engancha y la física es correcta) con el rótulo «valores ilustrativos». Alternativa: quitarlos. | `P6-17` |

**Resueltas el 2026-11-14:** Paul aceptó las seis recomendaciones (D1–D6). Los tickets dejan de estar bloqueados.

**Protocolo de lotes paralelos** (decisión del orquestador): cuando varios ejecutores trabajan a la vez en el mismo
árbol, cada uno edita, pasa `npm run lint` y captura solo su diapositiva; **no** ejecuta `npm run build`, **no** lanza
`shoot-slides.mjs` completo y **no** hace commit. El orquestador hace una sola pasada de capturas y build para el
lote, verifica cada ticket y crea un commit por ticket. Los tickets en serie siguen el flujo normal del ejecutor.

**Bitácora del loop**
- 2026-11-15 · **Lote 1 cerrado** (9 tickets): `I6-01`, `I6-02`, `P6-01`, `P6-04`, `P6-05`, `P6-08`, `P6-09`, `P6-11`,
  `P6-13`. Verificado por el orquestador con `scratch/fable-r1-lote1/` (51 capturas, 0 errores de consola),
  `scratch/fable-r1-lote1/interact/`, lint sin avisos nuevos, build en verde y `crash.mjs` 3/3 sin fallo. `I6-02` se
  probó además solo (con `Slide7.tsx` original): el reloj corregido basta para evitar el fallo; Cap. 2 recapturado sin
  errores (`scratch/fix-I6-02/cap2/`). Una sesión se cortó a mitad del lote; los cuatro ejecutores interrumpidos habían
  aplicado su cambio completo y lo verificó el orquestador.
- 2026-11-15 · **Lote 2 cerrado** (6 tickets): `P6-02`, `P6-06`, `P6-10`, `P6-12`, `P6-14`, `P6-16`. Verificado con
  `scratch/fable-r1-lote2/` (51 capturas, 0 errores de consola), las capturas propias de cada ejecutor en
  `scratch/fix-<ID>/`, lint sin avisos nuevos y build en verde. Reserva aceptada en `P6-02`: el chip de «descarga
  eléctrica» queda bajo el panel de controles hasta `V6-02`. Nuevos tickets nacidos de colaterales: `P6-38`, `P6-39`.
  `I6-04` rediagnosticado (el fallo es del hover, no del clic).
- 2026-11-15 · **Lote 3 cerrado** (4 tickets): `P6-03`, `P6-07`, `P6-17`, `P6-38`. Verificado con
  `scratch/fable-r1-lote3/` (51 capturas, 0 errores de consola) y `scratch/fable-r1-lote3/interact/`, lint sin avisos
  nuevos y build en verde. Otra sesión se cortó a mitad: `I6-03` y `P6-18` no llegaron a editar nada y se relanzaron en
  el lote 4 junto con `P6-15` y `P6-39`. Nuevo ticket por colateral: `P6-40`. Quedan para el lote 5 (un solo ejecutor
  por archivo): `I6-04` (`Slide3.tsx` + `Capitulo1.tsx`), `P6-19` y `P6-40` (`sims.ts`, en serie).
- 2026-11-15 · **Lote 4 cerrado** (4 tickets): `I6-03`, `P6-15`, `P6-18`, `P6-39`. Verificado con
  `scratch/fable-r1-lote4/` (51 capturas, 0 errores de consola), `scratch/fix-I6-03/`, `scratch/fix-P6-18/`,
  `scratch/fix-P6-39/`; lint sin avisos nuevos (`sims.ts`: 23 antes y después), build en verde, `crash.mjs` sin fallo.
  Nota: las capturas de C2 y C4 no son estables píxel a píxel entre pasadas (ya diferían entre los lotes 2 y 3 sin
  cambios en esas diapositivas); se comparan a ojo.
- 2026-11-15 · **Lote 5 y FASE 1 CERRADA** (26 tickets, 25 commits `9d17d01..HEAD`, sin push). `P6-19` cerrado a la
  primera. `I6-04` necesitó los dos reintentos: (1/2) error de tipos que rompía el build; (2/2) carrera real entre
  hover y clic con toque instantáneo, resuelta derivando el apunte del estado de React. Verificación final:
  `scratch/fable-r1-fase1/` (51 capturas, 0 errores de consola), build en verde, lint sin avisos nuevos,
  `crash.mjs` sin fallo, `check-I6-04.mjs` 16/0, `check-I6-04-humano.mjs` 0 de 12 ×3, `dump.mjs` sin notación de
  teclado en el DOM. **Lección de protocolo:** en lotes paralelos el ejecutor debe pasar además una comprobación de
  tipos de solo lectura, `rtk proxy npx tsc -p tsconfig.app.json --noEmit --incremental false` desde `webapp/`
  (≈ 1 min; no escribe `.tsbuildinfo`), y reportar solo los errores de sus archivos.
- 2026-11-15 · **FASE 2, lote 1 despachado:** `P6-25` (pestañas de C1: es el **patrón de referencia** para las demás
  pestañas de la fase), `P6-20`, `P6-21`, `P6-23`, `P6-33`, `P6-34`. Orden previsto después: lote 2 = `P6-22`, `P6-32`,
  `P6-35`, `P6-36`, `P6-27`, `P6-30`; lote 3 = `P6-24`, `P6-26`, `P6-28`, `P6-31`; lote 4 = `P6-29`; cierre = `P6-37`.
- 2026-11-15 · **`P6-40` cerrado sin cambio**: el rótulo «Atletas: …» solo lo pinta `componentsPanel` (`sims.ts:4529`),
- 2026-11-26 · **FASES 2, 3 y 4 CERRADAS** (37 tickets, 37 commits `a82b192..32b802d` en la rama
  `feat/cap1-fases-2-3-4`, desde `main` = `e4dced4`). Los seis tickets que la tabla marcaba `EN CURSO` (`P6-20`,
  `P6-21`, `P6-23`, `P6-25`, `P6-33`, `P6-34`) no estaban en `main` y se rehicieron desde cero, empezando por `P6-25`
  como patrón de pestañas: clase `.card-tabs` en `legacy.css` (mismo conmutador segmentado de B1, `role="tab"`) y
  estado local con `useState` en cada diapositiva, sin componente compartido. Piezas nuevas: `Tex.tsx` (KaTeX en
  línea para celdas), `segmentTables.ts` (Tablas 1.7–1.9, solo datos) y `safeArea.ts` (alto que tapa el panel
  flotante abierto; lo usan los lienzos 2D, las gráficas y `AnatomyStage` vía `setViewOffset`). Verificación en
  sesión Cloud con el Chromium preinstalado: `npm ci`, `npx tsc -b`, `npx oxlint src/chapters/cap1` (44 avisos,
  los mismos que en `main`), `npm run build` en verde; `shoot-slides.mjs` (51 capturas, 0 errores de consola);
  medición del DOM a 1280×720 sin textos < 12 px en las 17 diapositivas; prueba de teclado del Resumen (Tab ×4 +
  Enter); recuento de filas con cursor de mano = filas interactivas en S5, S7–S10 y S15; capturas por ticket a
  1280×720 con el panel abierto y cerrado. `R6-01` no entraba en el encargo y sigue `PENDIENTE`.
  función que nadie llama (lint: «declared but never used»). No se ve en pantalla; queda como código muerto.

Solo informativo (no se toca, fase cerrada): el `.tex` dice «sobrepeso cuando el IMC es > 20»; la diapositiva usa los
rangos OMS (25). Conviene contrastar con el PDF original por si es errata de traducción. También *Axiliary* en la Tabla 1.1.

---

## Matriz de cobertura `.tex` → diapositiva

✅ completo · 🟡 parcial · 🔴 ausente o erróneo. «Ticket» = quién lo cierra.

### §1.1 Terminología anatómica

| Contenido del `.tex` | Dónde | Estado | Ticket |
| :--- | :--- | :---: | :--- |
| Derecha/izquierda desde el paciente (y < 0 / y > 0) | A1 | ✅ | — |
| Superior/craneal, inferior/caudal (z); anterior/ventral, posterior/dorsal (x) | A1 + rótulos 3D | ✅ | `A6-03` (legibilidad) |
| Medial/lateral (\|y\|), proximal/distal (r), superficial/profundo (ρ) | A1 | ✅ | — |
| Planos transverso (z), sagital (y), midsagital (y = 0), coronal (x) | A2 | ✅ | — |
| Fig. 1.1 | A1–A2 (modelo 3D) | ✅ | — |
| Tabla 1.1 — 24 términos regionales anteriores | A3: 10 chips + lista de consulta (14 restantes) | ✅ | `P6-09`, `P6-20` |
| Tabla 1.2 — 9 términos posteriores | A3: 6 chips + lista de consulta (3 restantes) | ✅ | `P6-09`, `P6-20` |
| *Brachium* → braquial; bíceps/tríceps = 2/3 orígenes | A3 (pista ampliada) | ✅ | `P6-20` |
| Anclas del texto (ojo derecho del paciente, venas cavas superior e inferior) | A3, apunte por defecto | ✅ | `P6-20` |

### §1.2 Movimiento en la máquina humana

| Contenido del `.tex` | Dónde | Estado | Ticket |
| :--- | :--- | :---: | :--- |
| GL: 3 traslacionales + 3 rotacionales | B1 | ✅ | — |
| Articulaciones fibrosas, cartilaginosas, sinoviales; cartílago y líquido sinovial; Fig. 1.3 | B2 | ✅ | — |
| 6 tipos sinoviales (Fig. 1.4) con sus GL | B2 (modelos 3D) | ✅ | — |
| Análogos físicos (bisagra de puerta, junta universal, grifo de ducha) | B2, bajo la tabla | ✅ | `P6-22` |
| Pierna 3+1+2 = 6 GL; brazo 3+1+2+1 = 7 GL; pivote radiocubital | B1 | ✅ | — |
| Fig. 1.5 (posicionamiento no único del brazo) | B1, miniatura con lightbox | ✅ | `P6-21` |
| Mano: muchos más GL (Fig. 1.6) | B1, texto + Fig. 1.6 | ✅ | `P6-21` |
| Rodilla y codo dividen el miembro en mitades casi iguales (Fig. 1.7) | B1, texto + Fig. 1.7 | ✅ | `P6-21` |
| Fig. 1.2 (esqueleto) | modelo 3D | ✅ | — |
| 4 componentes: huesos, ligamentos, músculos, tendones; origen e inserción; Fig. 1.8 | B4, «Principio antagonista» + Fig. 1.8 | ✅ | `P6-23` |
| Los músculos solo se contraen → pares antagonistas | B4 | ✅ | — |
| Flexión/extensión, abducción/aducción, rotación, pronación/supinación; Figs. 1.9–1.10 | B3 | ✅ | `P6-08` (ejes) |
| Regla del destornillador (supinación = atornillar con la derecha) | B4 | ✅ | `P6-23` |
| Fig. 1.11 (ejes de rotación) | B2 | ✅ | — |
| Bíceps/tríceps como palanca; Fig. 1.12 | B4 | ✅ | — |
| Ojo: aducción/abducción, elevación/depresión, intorsión/extorsión; Fig. 1.13 | B4, Tabla 1.3 (secundaria) + Fig. 1.13 | ✅ | `P6-24` |
| Fig. 1.14 (músculos oculares) | B4 (miniatura + ojo 3D con los 6 músculos rotulados) | ✅ | `V6-04` |
| Tabla 1.3 — acción primaria **y secundaria** | B4, pestaña «Por músculo» | ✅ | `P6-24` |
| Tabla 1.4 — combinaciones binoculares por dirección de mirada | B4, pestaña «Por mirada» | ✅ | `P6-24` |

### §1.3 El humano estándar

| Contenido del `.tex` | Dónde | Estado | Ticket |
| :--- | :--- | :---: | :--- |
| Tabla 1.5 — 29 parámetros | C1, 4 pestañas | ✅ | `P6-05`, `P6-15`, `P6-25` |
| Variación regional/temporal (8–17 cm en dos siglos); nota de la tabla (varones EE. UU. ~1975; mujeres) | C1, «Nota de la Tabla 1.5» | ✅ | `P6-25` |
| Tabla 1.6 — 13 longitudes L/H; Fig. 1.15 | C2: 9 interactivas + 4 de consulta | ✅ | `P6-10`, `P6-27` |
| Tabla 1.7 — masas y densidades segmentarias | C2, pestaña 1.7 | ✅ | `P6-28` |
| Tabla 1.8 — centro de masa por segmento | C2, pestaña 1.8 | ✅ | `P6-29` |
| Tabla 1.9 — radio de giro | C2, pestaña 1.9 | ✅ | `P6-29` |
| «Las tablas no siempre son coherentes entre sí» | C1 (apuntes) y C2 (pestaña 1.8) | ✅ | `P6-07` |
| Tabla 1.10 — 16 rangos con media y SD; regla del 68 %; Fig. 1.16 | C3: 16 filas con SD + Fig. 1.16 | ✅ | `P6-30` |
| Tabla 1.11 — masa y volumen de 29 órganos | C3: 12 de 29, con volumen (selección declarada) | 🟡 | `P6-31` |
| Tabla 1.12 — contenido molecular de una célula | C3, pestaña «Célula (1.12)» | ✅ | `P6-31` |
| Somatotipos ecto/meso/endo; Heath-Carter; ejemplos de atletas | C4 (fase 1) | ✅ | `P6-13`, `P6-14` |
| Tiempos característicos (1 s, 1 min, 2 min) | C1, tres chips | ✅ | `P6-26` |
| Viajes espaciales: ~10 efectos enlazados a capítulos | C4: 7 efectos con su capítulo | ✅ | `P6-32` |

### §1.4 Relaciones de escala y §1.5 Resumen

| Contenido del `.tex` | Dónde | Estado | Ticket |
| :--- | :--- | :---: | :--- |
| Ec. 1.1 f = a·m_b^α; alométrica vs isométrica (con sus ejemplos) | D1, con los ejemplos del libro | ✅ | `P6-33` |
| Tabla 1.13 — 15 parámetros con `a` y α | D1: 6 tarjetas con `a` + 9 en tabla | ✅ | `P6-11`, `P6-33` |
| Escalado óseo w ∝ L^(3/2), w/L ∝ m_b^(1/6), factor ~4; UCS | D2 | ✅ | `P6-17` |
| Ec. 1.2 Du Bois | D3 | ✅ | — |
| Índice m_b/H^p (p = 1–3); S (p = 3); IMC / Quételet (p = 2) | D3 | ✅ | `P6-35` |
| Ec. 1.3 densidad; Ecs. 1.4–1.5 grasa por sexo | D3 | ✅ | `P6-16` (rótulo) |
| Grasa normal 14–20 % / 21–27 %; mortalidad vs IMC | D3 | ✅ | `P6-35` |
| Salto ~2/3 m y carrera ~7 m/s (dentro de un factor 2); fuerza ∝ área | D2, «Lo que no escala con la masa» (fase 1) | ✅ | `P6-04` |
| Tabla 1.14 — 7 grupos adimensionales | D2, tarjeta propia | ✅ | `P6-34` |
| Ec. 1.6 Ley de Stevens; sublineal/superlineal; ~12 órdenes de magnitud | D4 | ✅ | `P6-02`, `P6-03` |
| Tabla 1.15 — 9 percepciones, 17 exponentes | D4: 9 percepciones, 16 exponentes (ver hallazgos) | ✅ | `P6-01`, `P6-36` |
| §1.5 Resumen (4 ideas) | Resumen: 3 viñetas por pilar | ✅ | `P6-37` |

**Recuento:** tablas 0 ✅ / 9 🟡 / 6 🔴 · ecuaciones 6 ✅ · figuras 7 de 16 mostradas (otras 3 sustituidas por 3D).

**Recuento tras las fases 2–4 (2026-11-26):** tablas 14 ✅ / 1 🟡 (1.11, selección declarada de 12 de 29) / 0 🔴 · ecuaciones 6 ✅ · figuras 13 de 16 mostradas (1.5, 1.6, 1.7, 1.8, 1.13 y 1.16 añadidas; otras 3 sustituidas por 3D).

---

## Convenciones de esta ronda

- **VE (verificación estándar):** capturas after en `scratch/fix-<ID>/` con `node scripts/shoot-slides.mjs --cap 1 --out ../scratch/fix-<ID>` (las relevantes son `proj-NN.png`) + `npm run lint` + `npm run build`.
- **FA (fuera de alcance estándar):** todo archivo no listado; `sims.ts` salvo que el ticket lo nombre; otros capítulos; `App.tsx`; `src/index.css`; los `.tex`.
- Severidad: **A** alta (miente, rompe o impide dictar) · **M** media · **B** baja.
- Estados: `PENDIENTE` · `BLOQUEADO (Dn)` · `EN CURSO` · `DEVUELTO (n/2)` · `CERRADO` · `ESCALADO`.
- Numeración de diapositivas: S0…S16 = índice de `SlideN.tsx` = `proj-NN.png`.
- Pestañas (D3): reutilizar el conmutador que ya existe en B1 («3D Cinemático | 2D Atlas», `Slide4.tsx`); estado local con `useState`. No crear un componente compartido nuevo.

---

## Tabla de control

| ID | Sev. | Fase | Título | Estado | Depende de | Commit |
| :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| `I6-01` | A | 1 | B4: «Test en H» no debe dejar la app en blanco | CERRADO | — | `9d17d01` |
| `I6-02` | A | 1 | Reloj armónico: `dt` nunca negativo | CERRADO | — | `9feff63` |
| `I6-03` | M | 1 | `ErrorBoundary` por diapositiva | CERRADO | `I6-01` | `663bbcf` |
| `P6-01` | A | 1 | D4: emparejar cada exponente con su estímulo | CERRADO | — | `8eb07df` |
| `P6-02` | A | 1 | D4: un solo factor al «duplicar el estímulo» | CERRADO | `P6-01` | `17f00f7` |
| `P6-03` | M | 1 | D4: unidades y apunte de sonoridad | CERRADO | `P6-02` | `440a90f` |
| `P6-04` | A | 1 | D2: retitular «Invariantes de escala (Tabla 1.14)» | CERRADO | — | `c6641dd` |
| `P6-05` | A | 1 | C1: quitar «(Du Bois)» del 1,85 m² | CERRADO | — | `8d54d9e` |
| `P6-06` | A | 1 | C1: apunte sin LaTeX crudo | CERRADO | `P6-05` | `a383f04` |
| `P6-07` | M | 1 | C1: TMB sin fórmula inventada | CERRADO | `P6-06` | `ad61e7d` |
| `P6-08` | A | 1 | B3: ejes cinemáticos en la convención de A1 | CERRADO | — | `93e06d6` |
| `P6-09` | A | 1 | A3: términos regionales correctos | CERRADO | — | `e405771` |
| `I6-04` | M | 1 | A3: la región poplítea no actualiza el apunte | CERRADO | `P6-09` | `f922d89` |
| `P6-10` | M | 1 | C2: nombres de segmento coherentes con A3 | CERRADO | `P6-09` | `8ac943f` |
| `P6-11` | A | 1 | D1 lienzo: coma decimal, m_b y potencias de 10 | CERRADO | — | `1b71c73` |
| `P6-12` | M | 1 | D1/D2: cabeceras sin notación de teclado | CERRADO | — | `01382ce` |
| `P6-13` | A | 1 | C4: descriptores de somatotipo del libro | CERRADO | — | `ad3a7e1` |
| `P6-14` | M | 1 | C4 lienzo: cociente hombro/cadera 2,25 | CERRADO | `P6-13` | `c058525` |
| `P6-15` | M | 1 | C1: unidades de la tabla (rpm, volemia) | CERRADO | `P6-07` | `93606ea` |
| `P6-16` | B | 1 | D3/Resumen: Ec., IMC, m_b, 1.2–1.5, «%» | CERRADO | — | `80bf76b` |
| `P6-17` | M | 1 | D2: MPa rotulados como ilustrativos y «t» | CERRADO | — | `ccd014d` |
| `P6-18` | M | 1 | C1 lienzo: rótulos al mover masa/estatura | CERRADO | — | `3069c65` |
| `P6-19` | M | 1 | C2: barra «Σ segmentos» sin suma sin sentido | CERRADO | — | `abf06be` |
| `P6-38` | M | 1 | C4: apuntes de somatotipo sin rasgos inventados | CERRADO | `P6-14` | `0cb333c` |
| `P6-39` | M | 1 | D4: eje, nombres y apuntes coherentes con el umbral | CERRADO | `P6-03` | `5bc3e35` |
| `P6-40` | M | 1 | C4 lienzo: «lanzadores» no son endomorfos | CERRADO | `P6-19` | `sin cambio: código muerto` |
| `P6-20` | A | 2 | A3: completar Tablas 1.1–1.2 | CERRADO | `P6-09` | `75d4c51` |
| `P6-21` | M | 2 | B1: la mano y las Figs. 1.5–1.7 | CERRADO | — | `8304470` |
| `P6-22` | B | 2 | B2: análogos cotidianos de cada articulación | CERRADO | — | `d71a2c0` |
| `P6-23` | A | 2 | B4: los cuatro componentes + Fig. 1.8 | CERRADO | `I6-01` | `7be5afb` |
| `P6-24` | A | 2 | B4: Tabla 1.3 completa, Tabla 1.4 y Fig. 1.13 | CERRADO | `P6-23` | `e8499ae` |
| `P6-25` | A | 2 | C1: Tabla 1.5 completa por grupos | CERRADO | `P6-15` | `a82b192` |
| `P6-26` | M | 2 | C1: tiempos característicos del cuerpo | CERRADO | `P6-25` | `00d7e1f` |
| `P6-27` | M | 2 | C2: filas faltantes de la Tabla 1.6 | CERRADO | `P6-10` | `73d7834` |
| `P6-28` | A | 2 | C2: Tabla 1.7 en pestaña | CERRADO | `P6-27` | `e275c2b` |
| `P6-29` | M | 2 | C2: Tablas 1.8 y 1.9 en pestañas | CERRADO | `P6-28` | `8801344` |
| `P6-30` | A | 2 | C3: Tabla 1.10 completa con SD + Fig. 1.16 | CERRADO | — | `882e3b6` |
| `P6-31` | M | 2 | C3: Tabla 1.11 con volumen + Tabla 1.12 | CERRADO | `P6-30` | `3e1ea45` |
| `P6-32` | M | 2 | C4: efectos de la microgravedad | CERRADO | `P6-13` | `b7db999` |
| `P6-33` | A | 2 | D1: Tabla 1.13 con `a` y los 15 parámetros | CERRADO | `P6-12` | `aab345a` |
| `P6-34` | A | 2 | D2: la Tabla 1.14 real | CERRADO | `P6-04` | `7ef03b7` |
| `P6-35` | M | 2 | D3: grasa normal, Quételet y familia m_b/H^p | CERRADO | `P6-16` | `cedd731` |
| `P6-36` | M | 2 | D4: Gusto, Temperatura y segundos valores | CERRADO | `P6-03` | `30bf37e` |
| `P6-37` | M | 2 | Resumen dictable | CERRADO | fases 1–2 | `c914900` |
| `A6-01` | A | 3 | Apunte de cátedra siempre visible | CERRADO | fase 2 | `701ea06` |
| `A6-02` | A | 3 | Piso tipográfico de 12 px en el DOM | CERRADO | `A6-01` | `a1a3d28` |
| `A6-03` | M | 3 | Rótulos de ejes 3D: tamaño, contraste, colisión | CERRADO | — | `bd9656f` |
| `A6-04` | M | 3 | D4: leyenda legible | CERRADO | `P6-36` | `5538ab6` |
| `V6-01` | A | 3 | Área segura: lienzos 2D de C1, C2, C3 y D3 | CERRADO | `P6-18`, `P6-19` | `2f6951d` |
| `V6-02` | A | 3 | Área segura: gráficas D1, D2 y D4 | CERRADO | `P6-11`, `A6-04` | `4b2ab5e` |
| `V6-03` | M | 3 | Área segura: encuadre 3D de B1, B2 y C3 | CERRADO | — | `66e0a06` |
| `V6-04` | A | 3 | B4: el ojo 3D debe mostrar sus músculos | CERRADO | `P6-24` | `992464a` |
| `R6-01` | M | 3 | B1 Atlas 2D: rótulos que vuelven a solaparse | PENDIENTE | `P6-21` | |
| `A6-05` | B | 3 | Resumen: tarjetas operables por teclado | CERRADO | `P6-37` | `ae653c9` |
| `V6-05` | B | 4 | A2: deslizadores con el color del sistema | CERRADO | — | `b535e57` |
| `V6-06` | B | 4 | D3: barra de composición recortada | CERRADO | `V6-01` | `b120e2f` |
| `V6-07` | B | 4 | D2: rótulo «FRACTURA» desbordado | CERRADO | `P6-17`, `V6-02` | `4b42602` |
| `V6-08` | B | 4 | D1: «Perro» tapado y «Comparativa animada» | CERRADO | `V6-02` | `113ca7f` |
| `V6-09` | B | 4 | Portada: pie recortado a 720 px | CERRADO | — | `fde72a4` |
| `I6-05` | B | 4 | Cursor de mano falso en tablas de consulta | CERRADO | fase 2 | `70a9705` |
| `S6-01a` | M | 4 | Sin emoji en las gráficas de D1, D2 y D4 | CERRADO | fases 1–3 | `d1c0156` |
| `S6-01b` | M | 4 | Sin emoji en los lienzos de C1–C4 y D3 | CERRADO | `S6-01a`, `V6-01` | `486e94e` |
| `S6-01c` | B | 4 | Sin emoji en botones y paneles de control | CERRADO | `S6-01b` | `3485497` |
| `S6-02` | B | 4 | C3: icono que sale como cuadro vacío (ex `S4-05`) | CERRADO | `S6-01` | `32b802d` |

**Paralelizables sin conflicto de archivos** (primer lote): `I6-01` (Slide7) ‖ `P6-01` (Slide15/StevensCanvas) ‖
`P6-04` (Slide13) ‖ `P6-05` (Slide8) ‖ `P6-08` (Slide6) ‖ `P6-11` (AllometryCanvas) ‖ `P6-13` (Slide11).
Los tickets que tocan `sims.ts` o `legacy.css` van siempre de uno en uno.

---

# FASE 1 · Lo que miente o rompe

## `I6-01` · B4: «Test en H» no debe dejar la app en blanco — VERIFICADO
- Diapositiva(s): S7 (B4 · Músculos antagonistas)
- Síntoma: al pulsar «▶ Test en H» la página queda vacía (`scratch/fable-audit/interact/crash-S7-testH.png`). `TypeError: Cannot read properties of undefined (reading 'x')` en `Slide7.tsx`, seguido de `(reading 'desc')` en el render. Reproducido 2/2 en Chrome headless; 0/1 en el navegador integrado.
- Por qué importa: una pantalla en blanco delante de la clase, sin forma de volver salvo recargar.
- Archivos: `src/chapters/cap1/Slide7.tsx` (línea 111).
- Causa: el primer `tick` del reloj puede llegar con `t < 0`; `Math.floor(negativo % 11)` da un índice negativo y `H_TEST_ORDER[idx]` es `undefined`.
- Pasos: sustituir
  ```ts
  const gKey = H_TEST_ORDER[Math.floor((t * 0.8) % H_TEST_ORDER.length)];
  ```
  por
  ```ts
  const step = Math.floor(Math.max(0, t) * 0.8) % H_TEST_ORDER.length;
  const gKey = H_TEST_ORDER[step] ?? 'center';
  ```
- Fuera de alcance: FA; `useHarmonicClock.ts` (es `I6-02`).
- Criterio de aceptación: `node scratch/fable-audit/crash.mjs` imprime para `S7-testH` «diapositiva viva: true» y «errores: 0», tres ejecuciones seguidas.
- Verificación: VE + la salida de `crash.mjs` + captura de S7 a los 3 s de animación.
- Depende de: ninguno.

## `I6-02` · Reloj armónico: `dt` nunca negativo — VERIFICADO
- Diapositiva(s): S4, S5, S6, S7, S10 (y 7 diapositivas del Cap. 2).
- Síntoma: causa raíz de `I6-01`. `last = performance.now()` se toma al montar el efecto y el primer `now` de `requestAnimationFrame` puede ser anterior → `dt < 0` → `t < 0`.
- Por qué importa: `cap2/Slide14.tsx:56` indexa un array con el mismo patrón y puede fallar igual.
- Archivos: `src/chapters/cap1/three/useHarmonicClock.ts` (línea 37).
- Pasos: `const dt = Math.min(0.1, (now - last) / 1000) * speed;` → `const dt = Math.max(0, Math.min(0.1, (now - last) / 1000)) * speed;`
- Fuera de alcance: FA; cualquier otro cambio en el hook; los `Slide*.tsx` del Cap. 2.
- Criterio de aceptación: con `I6-01` revertido en local (solo para la prueba, sin commit), `crash.mjs` no falla; con ambos aplicados, tampoco.
- Verificación: VE + `node scripts/shoot-slides.mjs --cap 2 --out ../scratch/fix-I6-02/cap2` sin errores de consola nuevos.
- Depende de: decisión D5.

## `I6-03` · `ErrorBoundary` por diapositiva — DIAGNOSTICADO
- Diapositiva(s): todas.
- Síntoma: un error de render en una diapositiva desmonta la app entera. No hay ningún `ErrorBoundary` salvo `ThreeErrorBoundary` dentro de `BodyScene.tsx`.
- Por qué importa: convierte cualquier fallo futuro en «esta diapositiva no cargó, sigue con la siguiente» en vez de pantalla en blanco.
- Archivos: `src/chapters/cap1/Capitulo1.tsx`. Localizar con `grep -n "SLIDES.map\|ThreeErrorBoundary" src/chapters/cap1/*.tsx`.
- Pasos: 1) definir en `Capitulo1.tsx` una clase `SlideErrorBoundary` (mismo patrón que `ThreeErrorBoundary`: `getDerivedStateFromError` + `componentDidCatch` con `console.error`). 2) Envolver cada diapositiva renderizada en `SLIDES.map` con `key` = índice, de modo que al cambiar de diapositiva se reinicie. 3) Fallback: tarjeta con «Esta diapositiva no pudo mostrarse» y un botón «Reintentar» que reinicia el estado; estilos con clases existentes (`.card`), sin colores literales.
- Fuera de alcance: FA; `App.tsx`; reestructurar el montaje ±1.
- Criterio de aceptación: forzando un `throw` temporal en `Slide7` (sin commit), la barra de módulos y el riel siguen operativos y S6/S8 se ven; quitado el `throw`, el recorrido de 17 es idéntico a la línea base.
- Verificación: VE + captura del fallback en `scratch/fix-I6-03/`.
- Depende de: `I6-01`.

## `P6-01` · D4: emparejar cada exponente con su estímulo — VERIFICADO
- Diapositiva(s): S15 (D4 · Ley de Stevens).
- Síntoma: la tabla dice «Olor (Heptano) n = 0,55», «Vibración (60 Hz en el dedo) n = 0,60» y «Sonoridad acústica (1000 Hz) n = 0,54» (`scratch/fable-r1-before/proj-15.png`). La Tabla 1.15 del `.tex` da: olor **café 0,55**, heptano 0,60; vibración **250 Hz 0,6**, 60 Hz 0,95; sonoridad **monoaural 0,54**, binaural 0,60 (no menciona 1000 Hz).
- Por qué importa: es una tabla del libro con dos filas cruzadas.
- Archivos: `src/chapters/cap1/Slide15.tsx` (líneas 41, 48, 55 y sus `desc`), `src/chapters/cap1/StevensCanvas.tsx` (línea 24 y las entradas vecinas de olor y vibración).
- Pasos: en ambos archivos, sin cambiar los valores de `n`: `'Sonoridad acústica (1000 Hz)'` → `'Sonoridad (monoaural)'`; `'Sonoridad (1 kHz)'` → `'Sonoridad (monoaural)'`; `'Olor (Heptano)'` → `'Olor (café)'`; `'Vibración (60 Hz en el dedo)'` → `'Vibración (250 Hz, en el dedo)'`. Revisar los `desc` de esas tres entradas y quitar cualquier mención a 1000 Hz, heptano o 60 Hz que quede contradiciendo el nombre.
- Fuera de alcance: FA; añadir filas (es `P6-36`); el chip «Estímulo 2S» (es `P6-02`).
- Criterio de aceptación: `grep -n "1000 Hz\|1 kHz\|Heptano\|60 Hz en el dedo" src/chapters/cap1/Slide15.tsx src/chapters/cap1/StevensCanvas.tsx` no devuelve nada, y tabla, panel del lienzo y leyenda muestran el mismo nombre para cada modalidad.
- Verificación: VE (S15 con «Ver todas» activo y con «Olor» seleccionado).
- Depende de: ninguno.

## `P6-02` · D4: un solo factor al «duplicar el estímulo» — DIAGNOSTICADO
- Diapositiva(s): S15.
- Síntoma: para brillo, la tabla y el panel dicen ×1,26 y el chip de la gráfica «Estímulo 2S (×1,35)»; para sonoridad, ×1,45 frente a ×1,64 (`scratch/fable-audit/interact/s15-brillo-solo.png`, `scratch/fable-r1-before/proj-15.png`). La tabla calcula 2ⁿ (umbral nulo); el chip calcula ((2S − S₀)/(S − S₀))ⁿ con S = 1,5 y S₀ = 0,5.
- Por qué importa: dos cifras distintas para la misma pregunta en la misma pantalla.
- Archivos: `src/chapters/cap1/StevensCanvas.tsx` (≈ líneas 290–327: `sRef`, `sDouble`, `ratioPerceived`, los dos `CFX.chip`), `src/chapters/cap1/Slide15.tsx` (cabecera de columna «Duplicar (2×S)»). Localizar: `grep -n "sRef\|sDouble\|Estímulo S\|Duplicar" src/chapters/cap1/StevensCanvas.tsx src/chapters/cap1/Slide15.tsx`.
- Pasos: 1) marcar los dos puntos por su **exceso sobre el umbral**: `sRef = s0 + 1`, `sDouble = s0 + 2` (comprobar que `s0 + 2` cae dentro del rango del eje x; si no, usar `s0 + 0.75` y `s0 + 1.5`). Así `ratioPerceived = 2ⁿ` exactamente. 2) Chips: `'S − S₀'` y `` `2·(S − S₀) (×${…})` ``. 3) Cabecera de columna y rótulo del panel: «Duplicar (S − S₀)».
- Fuera de alcance: FA; la paleta; los valores de `n`.
- Criterio de aceptación: para las 7 modalidades, el factor del chip, el de la tabla y el del panel coinciden al segundo decimal.
- Verificación: VE + capturas de S15 con brillo, sonoridad y descarga eléctrica seleccionadas.
- Depende de: `P6-01`.

## `P6-03` · D4: unidades y apunte de sonoridad — VERIFICADO
- Diapositiva(s): S15.
- Síntoma: el panel del lienzo rotula el brillo «Lux (cd/m²)» (el lux es lm/m²; cd/m² es luminancia) y la sonoridad «Presión acústica (dB)» (el dB es un nivel, no una presión). El apunte dice «12 órdenes de magnitud de **presión** sonora (de 10⁻¹² W/m²…)»: W/m² es intensidad; en presión son 6 órdenes.
- Por qué importa: errores de unidades en una clase de física.
- Archivos: `src/chapters/cap1/StevensCanvas.tsx` (líneas 23–24), `src/chapters/cap1/Slide15.tsx` (línea 44).
- Pasos: `unit: 'Lux (cd/m²)'` → `unit: 'Luminancia (cd/m²)'`; `unit: 'Presión acústica (dB)'` → `unit: 'Nivel sonoro (dB)'`; en `Slide15.tsx:44`, «de presión sonora» → «de intensidad sonora».
- Fuera de alcance: FA.
- Criterio de aceptación: `grep -n "Lux (cd\|Presión acústica (dB)\|de presión sonora" src/chapters/cap1/` no devuelve nada.
- Verificación: VE (S15 con brillo y con sonoridad).
- Depende de: `P6-02`.

## `P6-04` · D2: retitular «Invariantes de escala (Tabla 1.14)» — DIAGNOSTICADO
- Diapositiva(s): S13 (D2 · Escalado estructural).
- Síntoma: la tarjeta «Invariantes de escala (Tabla 1.14)» muestra el salto de ~2/3 m y la velocidad de ~7 m/s, que son texto de §1.4, no la Tabla 1.14 (grupos adimensionales). Además omite que ambos valen «dentro de un factor de 2».
- Por qué importa: quien busque la Tabla 1.14 en el libro encontrará otra cosa.
- Archivos: `src/chapters/cap1/Slide13.tsx`. Localizar: `grep -n "Invariantes de escala\|Salto vertical\|Velocidad máx" src/chapters/cap1/Slide13.tsx`.
- Pasos: título → «Lo que no escala con la masa (§1.4)». Chips → «Salto vertical: ~2/3 m (factor 2)» y «Carrera máx.: ~7 m/s (factor 2)». Conservar la frase de fuerza ∝ H² y peso ∝ H³; anteponer «Del ratón al elefante (masa ×10 000):».
- Fuera de alcance: FA; añadir la Tabla 1.14 (es `P6-34`).
- Criterio de aceptación: «Tabla 1.14» no aparece en S13; los dos chips llevan «factor 2».
- Verificación: VE.
- Depende de: ninguno.

## `P6-05` · C1: quitar «(Du Bois)» del 1,85 m² — VERIFICADO
- Diapositiva(s): S8 (C1 · El Hombre Estándar).
- Síntoma: la tabla dice «Área de superficie 1,85 m² (Du Bois)» y D3 calcula con Du Bois 1,82 m² para el mismo hombre de 70 kg y 1,72 m. 1,85 es el valor tabulado de la Tabla 1.5; el libro no lo atribuye a la Ec. 1.2 (lo contrasta en el Problema 1.36).
- Por qué importa: dos áreas distintas para el mismo cuerpo, y una mal atribuida.
- Archivos: `src/chapters/cap1/Slide8.tsx` (líneas 24, 26 y 115).
- Pasos: línea 24 `name: 'Área de Superficie (Du Bois)'` → `name: 'Área de superficie'`. Línea 115 `m² (Du Bois)` → `m²`. Línea 26, `desc` → `'<b>Área de superficie:</b> 1,85 m² es el valor tabulado (Tabla 1.5). La fórmula de Du Bois (Ec. 1.2, módulo D3) da 1,82 m² para 70 kg y 1,72 m: las tablas del libro no siempre coinciden entre sí. Clave para la disipación térmica y la dosificación farmacológica.'` (sin `$…$`).
- Fuera de alcance: FA; `standardMan.ts`; el valor que pinta el lienzo.
- Criterio de aceptación: «Du Bois» solo aparece en S8 dentro del apunte de esa fila.
- Verificación: VE + captura de S8 con la fila «Área de superficie» seleccionada.
- Depende de: ninguno.

## `P6-06` · C1: apunte sin LaTeX crudo — DIAGNOSTICADO
- Diapositiva(s): S8.
- Síntoma: al mover un deslizador el apunte pasa a `(peso $W = mg \approx 690\text{ N}$)` (`scratch/fable-audit/interact/s08-max.png`); al seleccionar «Tasa metabólica basal» muestra `$\text{TMB} = 70 \cdot (m / 70)^{0{,}75}\text{ kcal/h}$` (`scratch/fable-audit/interact/log.txt`).
- Por qué importa: es justo el texto que el profesor lee en voz alta.
- Archivos: `src/chapters/cap1/Slide8.tsx`. Localizar: `grep -n "info-text-c1\|dangerouslySetInnerHTML\|renderKatex\|innerHTML" src/chapters/cap1/Slide8.tsx src/chapters/cap1/Capitulo1.tsx`.
- Pasos: hacer que el apunte de C1 tenga un único dueño (estado React) y que KaTeX se vuelva a aplicar cada vez que cambia su contenido (mismo mecanismo que usan S10 y S12, cuyos apuntes sí renderizan al cambiar de fila). No sustituir las fórmulas por texto plano.
- Fuera de alcance: FA; el contenido de los `desc` (es `P6-07`).
- Criterio de aceptación: tras seleccionar cada una de las 6 filas y tras mover ambos deslizadores, el apunte no contiene `$` ni `\`.
- Verificación: VE + script puppeteer en `scratch/fix-P6-06/` que recorra las 6 filas y los 2 deslizadores y vuelque el texto del apunte.
- Depende de: `P6-05`.

## `P6-07` · C1: TMB sin fórmula inventada — VERIFICADO
- Diapositiva(s): S8.
- Síntoma: el apunte de TMB presenta `TMB = 70·(m/70)^0,75 kcal/h` como «Ley de Kleiber». El libro da 70 kcal/h en la Tabla 1.5 y Kleiber como 4,1·m_b^0,75 W en la Tabla 1.13 (≈ 99 W ≈ 85 kcal/h para 70 kg): no coinciden, y el propio libro avisa de que las tablas no siempre son coherentes.
- Por qué importa: enseña una fórmula que no está en el libro y esconde una discrepancia que es didáctica.
- Archivos: `src/chapters/cap1/Slide8.tsx` (línea 32).
- Pasos: `desc` → `` `<b>Tasa metabólica basal (TMB):</b> ${STANDARD_MAN.bmrKcalH} kcal/h = ${STANDARD_MAN.bmrKcalDay} kcal/día ≈ 81 W (Tabla 1.5). La ley de Kleiber (módulo D1) predice $4{,}1\\,m_b^{0{,}75} \\approx 99\\text{ W}$ para 70 kg: el libro advierte que sus tablas proceden de fuentes distintas y no siempre coinciden.` ``
- Fuera de alcance: FA; cómo escala el lienzo la TMB con el deslizador.
- Criterio de aceptación: el apunte de TMB muestra 70 kcal/h, 81 W y 99 W, con la fórmula renderizada.
- Verificación: VE + captura con la fila TMB seleccionada.
- Depende de: `P6-06`.

## `P6-08` · B3: ejes cinemáticos en la convención de A1 — VERIFICADO
- Diapositiva(s): S6 (B3 · Tipos de movimiento).
- Síntoma: el apunte dice «Eje Transversal (Frontal X)», «Eje Anteroposterior (Sagital Z)» y «Eje Longitudinal (Vertical Y)» (`scratch/fable-audit/dump/proj-06-scrolled.png`). Son los ejes de Three.js. En A1 y en el libro: x = anteroposterior, y = mediolateral, z = longitudinal.
- Por qué importa: contradice el sistema de coordenadas que se enseñó tres diapositivas antes.
- Archivos: `src/chapters/cap1/Slide6.tsx` (líneas 32, 45, 58, 71, 83, 96).
- Pasos: `'Eje Transversal (Frontal X)'` → `'Eje transversal (mediolateral, y)'` (×2); `'Eje Anteroposterior (Sagital Z)'` → `'Eje anteroposterior (x)'` (×2); `'Eje Longitudinal (Vertical Y)'` → `'Eje longitudinal (z)'` (×2).
- Fuera de alcance: FA; la geometría y la cámara de `MovementCanvas.tsx`.
- Criterio de aceptación: `grep -n "Frontal X\|Sagital Z\|Vertical Y" src/chapters/cap1/` no devuelve nada.
- Verificación: VE + capturas del apunte para flexión, abducción y rotación medial.
- Depende de: ninguno.

## `P6-09` · A3: términos regionales correctos — DIAGNOSTICADO
- Diapositiva(s): S3 (A3 · Regiones anatómicas).
- Síntoma: «Popliteus — Rodilla» (el `.tex`: *Popliteal* = parte posterior de la rodilla; *popliteus* es un músculo), «Femur — Muslo» (es el hueso; la región es femoral), «Crus — Pierna» (crural = frente de la pierna), «Acromion — Hombro» (acromial = parte superior del hombro), «Sural: pantorrilla» (sural = parte posterior de la pierna) (`scratch/fable-r1-before/proj-03.png`).
- Por qué importa: es la diapositiva de vocabulario; un término mal aprendido se arrastra.
- Archivos: `src/chapters/cap1/Slide3.tsx` (`REGIONS_LIST`, `REGION_DESCRIPTIONS`), `src/chapters/cap1/Capitulo1.tsx` (`DESCRIPTIONS`, claves `region-*`).
- Pasos (si D4 = recomendación): cambiar solo `name` y `trans` (y la primera palabra en negrita de cada descripción), **sin tocar los `id`**: Torácica — Pecho · Digital — Dedo (de la mano o del pie) · Glútea — Nalga · Plantar — Planta del pie · Vertebral — Columna vertebral · Cefálica — Cabeza · Cervical — Cuello · Acromial — Parte superior del hombro · Coxal — Cadera · Braquial — Brazo (superior) · Antebraquial — Antebrazo · Carpiana — Muñeca · Femoral — Muslo · Poplítea — Parte posterior de la rodilla · Crural — Frente de la pierna · Tarsiana — Tobillo. En el bloque inferior: Occipital — Parte posterior de la cabeza · Sural — Parte posterior de la pierna (pantorrilla). Pista: «*Braquial* viene de *brachium* (brazo): bíceps braquial, tríceps braquial».
- Fuera de alcance: FA; `BodyScene.tsx` y el mapa `REGION_BONES`; añadir términos (es `P6-20`).
- Criterio de aceptación: los 18 términos visibles coinciden con las Tablas 1.1–1.2 en significado; cada chip sigue tiñendo los mismos huesos que antes.
- Verificación: VE + captura con «Poplítea» seleccionada.
- Depende de: decisión D4.

## `I6-04` · A3: la región poplítea no actualiza el apunte — DIAGNOSTICADO
- Diapositiva(s): S3.
- Síntoma (rediagnosticado el 2026-11-15 con `scratch/fable-audit/check-I6-04.mjs`): el **clic** actualiza el apunte en las 16 regiones con el texto largo de `Slide3.tsx`; el **hover** no hace nada en 6 (torácica, digital, glútea, plantar, vertebral, coxal) y en las otras 10 muestra un texto distinto y más corto, el de `DESCRIPTIONS` en `Capitulo1.tsx`. La pista dice «Pasa el cursor o haz clic».
- Por qué importa: el mismo chip dice dos cosas según se pase el cursor o se pulse, y un tercio no responde al cursor.
- Archivos: `src/chapters/cap1/Slide3.tsx` (≈ línea 59), `src/chapters/cap1/Capitulo1.tsx` (≈ línea 74). Localizar: `grep -n "region-popliteus" src/chapters/cap1/`.
- Pasos: dejar un solo dueño del apunte de A3: `REGION_DESCRIPTIONS` de `Slide3.tsx`, tanto en hover como en clic. Quitar de `DESCRIPTIONS` (`Capitulo1.tsx`) las 10 claves `region-*` y evitar que el efecto genérico de `[data-highlight]` escriba en el apunte de A3. El resaltado 3D por hover debe seguir igual.
- Fuera de alcance: FA; los textos de `REGION_DESCRIPTIONS`; las claves de `DESCRIPTIONS` que no sean `region-*`.
- Segunda devolución (2026-11-15): el primer arreglo dejó un único dueño pero imperativo (`innerHTML` desde clic, mouseenter y mouseleave). Con clic instantáneo tras posar el cursor (lo que hace un toque en pantalla táctil o pizarra digital) el chip queda activo y el apunte en el texto por defecto: `scratch/fable-audit/check-I6-04-humano.mjs` da «fallos: 2 de 12», ambos con pausa 0 ms. Se pide derivar el apunte del estado de React (`hoverRegion ?? activeRegion`) y conmutar la selección contra `localRegion`.
- Criterio de aceptación: `node scratch/fable-audit/check-I6-04.mjs` termina con «chips: 16 · fallos: 0», el texto de hover es el mismo que el de clic, y `node scratch/fable-audit/check-I6-04-humano.mjs` da «fallos: 0 de 12» tres veces seguidas.
- Verificación: VE + la salida de `check-I6-04.mjs`.
- Depende de: `P6-09`.

## `P6-10` · C2: nombres de segmento coherentes con A3 — DIAGNOSTICADO
- Diapositiva(s): S9 (C2 · Proporciones segmentarias).
- Síntoma: «Pantorrilla (Crus)», «Muslo (Femur)», «Cabeza (Caput)», «Mano (Manus)», «Pie (Pes)», «Brazo Superior (Brachium)». Los paréntesis latinos no están en el libro y «Crus» significa otra cosa en A3.
- Por qué importa: el mismo término con dos significados en dos módulos.
- Archivos: `src/chapters/cap1/Slide9.tsx` (`SEGMENTS_DATA`). Localizar: `grep -n "Caput\|Crus\|Manus\|Pes)" src/chapters/cap1/`.
- Pasos: usar los nombres de la Tabla 1.6: Altura de la cabeza · Altura del cuello · Brazo (superior) · Antebrazo · Mano · Muslo · Pantorrilla · Longitud del pie · Ancho de hombros. Si el lienzo rotula con cadenas propias en `sims.ts`, cambiarlas igual (solo las cadenas).
- Fuera de alcance: FA; valores L/H; colores.
- Criterio de aceptación: ningún paréntesis latino en S9, ni en la tabla ni en el lienzo.
- Verificación: VE.
- Depende de: `P6-09`.

## `P6-11` · D1 lienzo: coma decimal, m_b y potencias de 10 — VERIFICADO
- Diapositiva(s): S12 (D1 · Reglas alométricas).
- Síntoma: título «f = 4.1 · mᵦ⁰·⁷⁵» (punto decimal; el subíndice se lee β, no b); eje y «1e+4, 1e+3, 0.1» mientras el eje x usa «10⁻², 10⁻¹…» (`scratch/fable-audit/interact/s12-panel-cerrado.png`).
- Por qué importa: viola la coma decimal y enseña una variable que no existe (m_β).
- Archivos: `src/chapters/cap1/AllometryCanvas.tsx` (líneas 202, 445, 457).
- Pasos: 1) línea 445: formatear `activeCurve.a` con `fmt` (coma) y pintar la masa como «m» seguida de una «b» en subíndice dibujado (segunda llamada a `fillText` con fuente al 70 % y desplazada +3 px), no con `ᵦ`; igual en la línea 457. 2) línea 202: sustituir `toExponential(0)` y `String(val)` por el mismo formateador de potencias de 10 que usa el eje x; los valores entre 0,01 y 999 con coma decimal.
- Fuera de alcance: FA; datos de las curvas; emoji de las especies (es `S6-01`).
- Criterio de aceptación: en S12, con las 6 curvas, no aparece ningún punto decimal, ningún «e+» ni ningún «β».
- Verificación: VE + capturas de las 6 curvas con el panel cerrado.
- Depende de: ninguno.

## `P6-12` · D1/D2: cabeceras sin notación de teclado — VERIFICADO
- Diapositiva(s): S12, S13.
- Síntoma: subtítulos «f = a · m_b^α · del ratón al elefante» y «(w ∝ L^3/2)»; casilla «Alométrico Real (w ∝ L^1,5)».
- Por qué importa: regla global «cero notación de teclado»; es lo primero que se lee.
- Archivos: `src/chapters/cap1/Slide12.tsx` (línea 128), `src/chapters/cap1/Slide13.tsx`. Localizar: `grep -n "L^3/2\|L^1,5\|m_b^α" src/chapters/cap1/`.
- Pasos: pasar esas tres expresiones a KaTeX en línea (`$f = a\,m_b^{\alpha}$`, `$w \propto L^{3/2}$`), con el mismo mecanismo que ya renderiza el `eq-block` de cada diapositiva. En S13 cambiar además «patas de ratón gigante» por «patas de rata gigante» (el libro compara rata y elefante, y el lienzo dibuja una rata).
- Fuera de alcance: FA; el título pintado dentro del lienzo de D2.
- Criterio de aceptación: `metrics.json` de `dump.mjs` no lista ninguna cadena `raw` con `^` ni `_` en S12 y S13.
- Verificación: VE + `node scratch/fable-audit/dump.mjs && node scratch/fable-audit/summary.mjs`.
- Depende de: ninguno.

## `P6-13` · C4: descriptores de somatotipo del libro — DIAGNOSTICADO
- Diapositiva(s): S11 (C4 · Somatotipos y variación).
- Síntoma: «Endomorfo: mayor flotabilidad, centro de gravedad bajo, **densidad ósea elevada**»; «Mesomorfo: relación hombro/cadera > 1,15, alta fuerza específica»; ternas [1,0 · 1,5 · 6,5] sin leyenda. Nada de eso está en el `.tex`, que sí da una descripción clara y ejemplos de atletas que no se usan.
- Por qué importa: datos inventados junto a datos del libro, y se pierde el mejor gancho de la sección.
- Archivos: `src/chapters/cap1/Slide11.tsx`. Localizar: `grep -n "features:" src/chapters/cap1/Slide11.tsx`.
- Pasos: `features` → Ectomorfo: «Cuerpo largo, delgado y magro; huesos finos, poca grasa y poco músculo; caderas más anchas que los hombros. Ballet, salto de altura, maratón.» Mesomorfo: «Cuerpo sólido, musculoso y atlético; hombros más anchos que las caderas. Halterofilia, boxeo, lucha.» Endomorfo: «Cuerpo redondeado, en forma de pera; huesos grandes y exceso de tejido graso; hombros algo más anchos que las caderas. Sumo; adultos sedentarios.» Bajo las tres tarjetas, una línea: «Terna ilustrativa (endo · meso · ecto), escala 1–7. De lanzadores a velocistas a fondistas, la mesomorfia baja y la ectomorfia sube.» Añadir en el párrafo de Heath-Carter cómo se mide cada componente (masa y altura; codo, rodilla, brazo y pantorrilla; pliegues cutáneos).
- Fuera de alcance: FA; el lienzo (es `P6-14`); la tarjeta de microgravedad (es `P6-32`).
- Criterio de aceptación: `grep -n "flotabilidad\|densidad ósea\|1,15" src/chapters/cap1/Slide11.tsx` no devuelve nada; cada tarjeta nombra al menos dos deportes.
- Verificación: VE.
- Depende de: ninguno.

## `P6-14` · C4 lienzo: cociente hombro/cadera 2,25 — DIAGNOSTICADO
- Diapositiva(s): S11.
- Síntoma: el lienzo rotula el mesomorfo con «hombro/cadera 2,25» (`scratch/fable-r1-before/proj-11.png`): un cociente imposible en un cuerpo humano y ausente del libro.
- Por qué importa: cifra absurda proyectada en grande.
- Archivos: `src/chapters/cap1/sims.ts` (función de somatotipos). Localizar: `grep -n "hombro/cadera" src/chapters/cap1/sims.ts`.
- Pasos: sustituir el rótulo numérico por el cualitativo del libro: ecto «caderas > hombros», meso «hombros > caderas», endo «hombros ≳ caderas». No tocar la geometría de las figuras.
- Fuera de alcance: FA; cualquier otra función de `sims.ts`.
- Criterio de aceptación: no aparece ningún cociente numérico en el lienzo de S11 para los tres tipos.
- Verificación: VE + capturas con ecto, meso y endo seleccionados.
- Depende de: `P6-13`.

## `P6-15` · C1: unidades de la tabla (rpm, volemia) — VERIFICADO
- Diapositiva(s): S8.
- Síntoma: fila «Frecuencia cardíaca — 65 latidos/min · 5,2 L» (5,2 L es el volumen sanguíneo, sin rotular); «Capacidad pulmonar — 6,0 L total · 15 rpm» (rpm se lee revoluciones por minuto; el libro: 15/min).
- Por qué importa: unidades incompletas o ambiguas en la tabla de referencia.
- Archivos: `src/chapters/cap1/Slide8.tsx` (líneas 37, 43, 133 y la fila de frecuencia cardíaca). Localizar: `grep -n "rpm\|latidos/min" src/chapters/cap1/`.
- Pasos: «65 latidos/min · 5,2 L» → «65 latidos/min · 5,2 L de sangre»; `rpm` → `resp/min` en todas sus apariciones de cap1 (incluidas las pintadas en lienzo si las hay). Ampliado el 2026-11-15 (colateral de `P6-07`): `name: 'Tasa Metabólica Basal (Kleiber)'` → `'Tasa metabólica basal'` en `PARAMS_DATA.bmr`, porque el apunte ya presenta 70 kcal/h como valor de la Tabla 1.5 y Kleiber solo como contraste.
- Fuera de alcance: FA; añadir filas (es `P6-25`).
- Criterio de aceptación: `grep -rn "rpm" src/chapters/cap1/` no devuelve nada.
- Verificación: VE.
- Depende de: `P6-07`.

## `P6-16` · D3/Resumen: Ec., IMC, m_b, 1.2–1.5, «%» — DIAGNOSTICADO
- Diapositiva(s): S14, S16.
- Síntoma: «(Eq. 1.2)»; subtítulo «Ecuaciones 1.2–1.3» cuando la diapositiva muestra de la 1.2 a la 1.5; «20,2%» sin espacio; en el Resumen «índices S y BMI» y «f = a·m^α» (en el resto: IMC y m_b).
- Por qué importa: inconsistencias de nomenclatura entre módulos.
- Archivos: `src/chapters/cap1/Slide14.tsx`, `src/chapters/cap1/Slide16.tsx` (línea 51), `src/chapters/cap1/BMICalculatorCanvas.tsx` si pinta «Eq.». Localizar: `grep -n "Eq\.\|BMI\|Ecuaciones 1" src/chapters/cap1/`.
- Pasos: «Eq.» → «Ec.»; «Ecuaciones 1.2–1.3» → «Ecuaciones 1.2–1.5»; «BMI» → «IMC»; `m^\\alpha` → `m_b^{\\alpha}`; porcentajes del apunte de D3 con espacio fino antes de «%».
- Fuera de alcance: FA.
- Criterio de aceptación: los dos primeros greps anteriores no devuelven nada en cap1 (salvo comentarios).
- Verificación: VE.
- Depende de: ninguno.

## `P6-17` · D2: MPa rotulados como ilustrativos y «t» — DIAGNOSTICADO
- Diapositiva(s): S13.
- Síntoma: «σ 32 MPa · OK», «FRACTURA: 215 MPa», «σ_rotura ≈ 150 MPa» se presentan como datos; no están en el capítulo. Masa del elefante «5 ton».
- Por qué importa: el estudiante no distingue dato del libro de valor de demostración.
- Archivos: `src/chapters/cap1/BoneScaleCanvas.tsx` (líneas 118–129, 220, subtítulo), `src/chapters/cap1/Slide13.tsx` (líneas 24, 40, 229).
- Pasos (si D6 = recomendación): añadir al subtítulo del lienzo «· esfuerzos ilustrativos»; en la línea 229 «Tensión límite (ilustrativa)»; `ton` → `t`. Ampliado el 2026-11-15 con dos colaterales de `P6-12` en el mismo archivo: `Slide13.tsx:40` «patas de ratón escaladas» → «patas de rata escaladas»; `Slide13.tsx:197`, insignia `'ALOMÉTRICO (w ∝ L^3/2)'` → sin notación de teclado (`'ALOMÉTRICO'`, y lo equivalente en la rama isométrica).
- Fuera de alcance: FA; los valores numéricos.
- Criterio de aceptación: la palabra «ilustrativ» es visible en el lienzo y en la tarjeta; no queda «ton».
- Verificación: VE en modo alométrico e isométrico.
- Depende de: decisión D6.

## `P6-18` · C1 lienzo: rótulos al mover masa/estatura — DIAGNOSTICADO
- Diapositiva(s): S8.
- Síntoma: con los deslizadores en 130 kg y 2,10 m el lienzo dice «Hombre Estándar · 70 kg», «REFERENCIA 130 kg · 2,74 m²», y mantiene sangre 5,2 L, pulmón 6,0 L, fluidos 51 L y 65 lpm (`scratch/fable-audit/interact/s08-max.png`).
- Por qué importa: mezcla en un mismo panel valores recalculados y constantes de 70 kg sin distinguirlos.
- Archivos: `src/chapters/cap1/sims.ts` (dibujo del hombre estándar). Localizar: `grep -n "REFERENCIA\|CONSTANTES VITALES" src/chapters/cap1/sims.ts`.
- Pasos: cuando masa o estatura difieren de la referencia: título «Sujeto · {masa} kg», etiqueta «SUJETO» en lugar de «REFERENCIA», y las filas que no se recalculan (sangre, pulmón, fluidos, frecuencias) con el sufijo «(ref. 70 kg)» en color atenuado. En la referencia, nada cambia.
- Fuera de alcance: FA; inventar leyes de escala para esas constantes.
- Criterio de aceptación: en 130 kg / 2,10 m no aparece «70 kg» en el título ni «REFERENCIA»; en 70 kg / 1,72 m la captura es idéntica a la línea base.
- Verificación: VE + capturas en referencia, mínimo y máximo.
- Depende de: ninguno.

## `P6-19` · C2: barra «Σ segmentos» sin suma sin sentido — DIAGNOSTICADO
- Diapositiva(s): S9.
- Síntoma: la barra apilada suma cabeza + cuello + brazo + antebrazo + mano + muslo + pantorrilla + pie (≈ 217 cm para H = 172 cm): segmentos no colineales cuya suma no es ninguna longitud del cuerpo.
- Por qué importa: una «Σ» que supera la estatura invita a una pregunta sin respuesta.
- Archivos: `src/chapters/cap1/sims.ts` (dibujo de proporciones, `stackedBar`). Localizar: `grep -n "Σ segmentos\|stackedBar" src/chapters/cap1/sims.ts`.
- Pasos: retitular la barra «Segmentos a escala» y eliminar la línea de total «Σ = …». La barra queda como comparación de tamaños relativos, que es lo que enseña.
- Fuera de alcance: FA; rediseñar la barra; el resaltado por hover.
- Criterio de aceptación: no aparece «Σ» en S9; el resaltado fila ↔ figura ↔ barra sigue funcionando.
- Verificación: VE + captura con una fila seleccionada y el panel cerrado.
- Depende de: ninguno.

## `P6-38` · C4: apuntes de somatotipo sin rasgos inventados — VERIFICADO
- Diapositiva(s): S11.
- Síntoma: al seleccionar un somatotipo, el apunte añade rasgos que no están en el libro: «caja torácica plana» (ecto), «tórax en V, cintura estrecha y articulaciones robustas» (meso), «órganos digestivos» (endo). Hallado por el ejecutor de `P6-13`.
- Por qué importa: mismo problema que `P6-13`, en el texto que se dicta.
- Archivos: `src/chapters/cap1/Slide11.tsx` (líneas 26, 37, 48; y 28, 39, 50).
- Pasos: reescribir los tres `desc` solo con contenido del `.tex` (líneas 521 y 531): ecto «cuerpo largo y magro; prototipos: bailarines de ballet, saltadores de altura y corredores de maratón (alta ectomorfia, baja mesomorfia y endomorfia)»; meso «cuerpo sólido y atlético; atletas de fuerza: halterofilia, boxeo, lucha»; endo «cuerpo redondeado con exceso de tejido graso; prototipos: luchadores de sumo y hombres sedentarios de mediana edad». Eliminar el campo `athletes` sin uso.
- Fuera de alcance: FA; los `features` (ya corregidos); el lienzo.
- Criterio de aceptación: `grep -n "torácica plana\|tórax en V\|órganos digestivos\|athletes" src/chapters/cap1/Slide11.tsx` no devuelve nada.
- Verificación: VE + apunte de los tres tipos.
- Depende de: `P6-14`.

## `P6-39` · D4: eje, nombres y apuntes coherentes con el umbral — DIAGNOSTICADO
- Diapositiva(s): S15.
- Síntoma (hallado por el ejecutor de `P6-02`): el eje x dice «Estímulo S (múltiplos de S₀)» con marcas 1S₀…4S₀ pero el umbral se dibuja en 0,5 («Umbral S₀ = 0,5»); tres modalidades se llaman distinto en el lienzo y en la tabla («Presión palmar» / «Presión en la palma», «Pesadez (Levantar)» / «Pesadez (Levantar pesos)», «Descarga eléctrica» / «Descarga eléctrica (60 Hz)»); los apuntes de brillo y descarga siguen hablando de «duplicar el flujo (2S)» / «2× en la corriente»; el pie del panel usa notación de teclado («2^n», «(S - S₀)^n»).
- Por qué importa: si la unidad del eje es S₀, el umbral no puede estar en 0,5; son los restos del modelo de umbral nulo que `P6-02` retiró.
- Archivos: `src/chapters/cap1/StevensCanvas.tsx` (≈ línea 172 y nombres de `SENSATIONS`), `src/chapters/cap1/Slide15.tsx` (líneas 37, 79, 197, 227).
- Pasos: 1) eje x → «Estímulo S (unidades relativas)» con marcas 1, 2, 3, 4 (coma decimal si procede). 2) Igualar los tres nombres del lienzo a los de la tabla. 3) Apuntes: «duplicar el exceso sobre el umbral (S − S₀)» en lugar de «duplicar S». 4) Pie del panel: pasar las dos expresiones a KaTeX o a caracteres tipográficos (2ⁿ, «−»).
- Fuera de alcance: FA; valores de `n`; la paleta.
- Criterio de aceptación: «múltiplos de S₀» no aparece; los 7 nombres coinciden entre tabla, leyenda y panel; no queda `^` visible en S15.
- Verificación: VE + capturas de S15 con brillo y descarga.
- Depende de: `P6-03`.

## `P6-40` · C4 lienzo: «lanzadores» no son endomorfos — DIAGNOSTICADO
- Diapositiva(s): S11.
- Síntoma (hallado por el ejecutor de `P6-38`): `sims.ts` líneas ≈ 4364/4369/4374 tienen un campo `athletes` propio que la línea ≈ 4556 pinta como «Atletas: …». Para el endomorfo dice «Luchadores de sumo · lanzadores»; el libro sitúa a los lanzadores de peso y disco en el extremo de **alta mesomorfia**.
- Por qué importa: contradice el `.tex` (línea 531) y la tarjeta ya corregida.
- Archivos: `src/chapters/cap1/sims.ts`. Localizar: `grep -n "athletes\|Atletas:" src/chapters/cap1/sims.ts`.
- Pasos: primero comprobar si ese texto llega a verse en el lienzo actual (en las capturas de la línea base no aparece). Si se ve: endo → «Luchadores de sumo · adultos sedentarios»; ecto → «Ballet · salto de altura · maratón»; meso → «Halterofilia · boxeo · lucha». Si no se ve nunca (código muerto), no tocar y reportarlo.
- Fuera de alcance: FA; cualquier otra función de `sims.ts`.
- Criterio de aceptación: ningún rótulo del lienzo de S11 asocia «lanzadores» al endomorfo.
- Verificación: VE + capturas con los tres tipos.
- Depende de: `P6-19` (turno de `sims.ts`).

---

# FASE 2 · Cobertura del `.tex` (bloqueada por D3)

Datos: copiarlos **literalmente** del `.tex` (líneas indicadas). Ninguna cifra de memoria.

## `P6-20` · A3: completar Tablas 1.1–1.2 — DIAGNOSTICADO
- Diapositiva(s): S3.
- Síntoma: 18 de 33 términos; el bloque inferior se titula «SIN CHIP 3D EQUIVALENTE ARRIBA» (texto interno de desarrollo).
- Por qué importa: es el vocabulario que el estudiante de salud más va a reutilizar.
- Archivos: `src/chapters/cap1/Slide3.tsx`.
- Pasos: sustituir el bloque «Términos regionales adicionales» por una tabla compacta de consulta en dos columnas, «Más términos (Tablas 1.1–1.2)», con los 15 que faltan (`.tex` líneas 77–121): abdominal, axilar, bucal, frontal, inguinal, lingual, mamaria, mentoniana, nasal, oral, palmar, pedia, esternal, umbilical, sacra, más occipital y sural. Sin cursor de mano. Añadir la frase de bíceps/tríceps (= dos/tres orígenes) y, en el apunte por defecto, el ancla «las venas cavas superior e inferior recogen la sangre por encima y por debajo del corazón».
- Fuera de alcance: FA; nuevos chips 3D.
- Criterio de aceptación: los 33 términos de las Tablas 1.1–1.2 están en S3; «SIN CHIP» no aparece.
- Verificación: VE + `proj-03` desplazada al final.
- Depende de: D3, `P6-09`.

## `P6-21` · B1: la mano y las Figs. 1.5–1.7 — DIAGNOSTICADO
- Diapositiva(s): S4.
- Síntoma: la tarjeta «Mano y pie» no dice que la mano tiene muchos más GL (Fig. 1.6); faltan la Fig. 1.5 (dos posturas del brazo, misma mano) y la Fig. 1.7 (por qué codo y rodilla parten el miembro en mitades casi iguales).
- Por qué importa: son las tres ideas «de ingeniería» de la sección y las que más se recuerdan.
- Archivos: `src/chapters/cap1/Slide4.tsx`. Activos ya en `public/assets/cap1/`: Fig. 1.5 = `16.png`, Fig. 1.6 = `15.png`, Fig. 1.7 = `17.png`.
- Pasos: añadir a la tarjeta «Mano y pie» una fila de tres miniaturas con `ChapterImageLightbox` (mismo patrón que `Slide6.tsx:317`) y pie de una línea cada una: «7 GL para 6 coordenadas: muchas posturas, una misma mano», «Cada dedo suma articulaciones de 1 y 2 GL», «Dos tramos iguales barren el área máxima». Corregir «tobillo (2 GL)» añadiendo «(en silla de montar)», como dice el libro.
- Fuera de alcance: FA; el modelo 3D.
- Criterio de aceptación: las tres miniaturas abren su lightbox y se cierran con Escape.
- Verificación: VE + captura de cada lightbox.
- Depende de: D3.

## `P6-22` · B2: análogos cotidianos de cada articulación — DIAGNOSTICADO
- Diapositiva(s): S5.
- Síntoma: el libro ancla cada tipo en un objeto (bisagra de puerta, junta universal del coche, grifo de ducha); la tabla no.
- Por qué importa: es el puente para quien no es físico.
- Archivos: `src/chapters/cap1/Slide5.tsx`.
- Pasos: añadir bajo la tabla de 6 tipos una línea: «Análogos: bisagra de puerta (1 GL) · junta universal de un coche (2 GL) · grifo de ducha (rótula, 3 GL)». Sin columna nueva.
- Fuera de alcance: FA.
- Criterio de aceptación: la línea es visible sin scroll a 1280×720 o inmediatamente bajo la tabla.
- Verificación: VE.
- Depende de: D3.

## `P6-23` · B4: los cuatro componentes + Fig. 1.8 — DIAGNOSTICADO
- Diapositiva(s): S7.
- Síntoma: en todo el capítulo no aparecen las palabras «ligamento» ni «tendón» (`scratch/fable-audit/all-slides.txt`). Falta la Fig. 1.8 y la regla del destornillador.
- Por qué importa: es la base de los Caps. 2–5 y lo pide el `.tex` (líneas 198–202).
- Archivos: `src/chapters/cap1/Slide7.tsx`. Fig. 1.8 = `public/assets/cap1/18.png`.
- Pasos: en la tarjeta «Principio antagonista», antes del texto actual, cuatro chips: «Huesos — estructura; cartílago hialino en las sinoviales», «Ligamentos — unen hueso con hueso», «Músculos — los motores (esquelético; también cardíaco y liso)», «Tendones — unen músculo con hueso (origen e inserción)». Añadir la miniatura de la Fig. 1.8 a la tarjeta de referencias y la línea «Supinar = atornillar con la mano derecha; pronar = desatornillar».
- Fuera de alcance: FA; el lienzo.
- Criterio de aceptación: los cuatro términos están en S7 y la Fig. 1.8 abre en lightbox.
- Verificación: VE.
- Depende de: D3, `I6-01`.

## `P6-24` · B4: Tabla 1.3 completa, Tabla 1.4 y Fig. 1.13 — DIAGNOSTICADO
- Diapositiva(s): S7.
- Síntoma: la tarjeta se titula «(Tablas 1.3–1.4)» pero solo trae la acción primaria de la 1.3; la 1.4 no está. No se nombran intorsión ni extorsión. Prosa en monoespaciada en la columna de acción.
- Por qué importa: el ejemplo clínico (test en H) depende de la Tabla 1.4.
- Archivos: `src/chapters/cap1/Slide7.tsx`. Fig. 1.13 = `113.png`. Datos: `.tex` líneas 272–277 y 293–298.
- Pasos: tarjeta con dos pestañas. «Por músculo (Tabla 1.3)»: músculo · acción primaria · acción secundaria (6 filas, literal). «Por mirada (Tabla 1.4)»: dirección · ojo derecho · ojo izquierdo (6 filas, literal). Columna de acción en `--sans`. Una línea: «Solo el par recto medial/lateral va limpio con un movimiento; la torsión (intorsión/extorsión) es acción secundaria». Añadir la miniatura de la Fig. 1.13.
- Fuera de alcance: FA; `EYE_GAZE_PRESETS`.
- Criterio de aceptación: las 12 filas coinciden celda a celda con el `.tex`.
- Verificación: VE + captura de cada pestaña.
- Depende de: D3, `P6-23`.

## `P6-25` · C1: Tabla 1.5 completa por grupos — DIAGNOSTICADO
- Diapositiva(s): S8.
- Síntoma: 10 de 29 valores. Faltan 37,0 / 34,0 °C, 120/80 mmHg, gasto cardíaco 5,0 L/min, hematocrito 0,43, O₂ 0,26 y CO₂ 0,21 L/min, capacidad vital 4,8 L, volumen corriente 0,5 L, espacio muerto 0,15 L, área pulmonar 90 m², capacidad calorífica, grasa subcutánea 5 mm, reparto de fluidos 53/40/7 %, eficiencia 0–25 %.
- Por qué importa: son las constantes que un estudiante de salud reconoce; hoy la diapositiva no permite dictarlas.
- Archivos: `src/chapters/cap1/Slide8.tsx`, `src/chapters/cap1/standardMan.ts` (añadir las constantes que falten, con comentario «Tabla 1.5»). Datos: `.tex` líneas 320–348.
- Pasos: la tarjeta de la tabla pasa a 4 pestañas: «General» (edad, altura, masa, peso, área, grasa, grasa subcutánea, fluidos y su reparto) · «Calor y energía» (temperaturas, capacidad calorífica, TMB con sus cuatro unidades, eficiencia) · «Corazón y sangre» (frecuencia, volumen, hematocrito, gasto en reposo y fórmula general, presiones) · «Respiración» (frecuencia, O₂, CO₂, capacidades, volumen corriente, espacio muerto, área). Las 6 filas que hoy son interactivas conservan su comportamiento. Sustituir el texto de la tarjeta «¿Para qué sirve el estándar?» por la nota de la tabla: varones de EE. UU. hacia 1975; amplias variaciones; valores distintos en mujeres; la estatura europea subió 8–17 cm en dos siglos.
- Fuera de alcance: FA; el lienzo.
- Criterio de aceptación: los 29 parámetros de la Tabla 1.5 están en S8 con sus unidades y coma decimal.
- Verificación: VE + captura de cada pestaña.
- Depende de: D3, `P6-15`.

## `P6-26` · C1: tiempos característicos del cuerpo — DIAGNOSTICADO
- Diapositiva(s): S8.
- Síntoma: ausente (`.tex` línea 533).
- Por qué importa: tres cifras memorables que dan escala temporal a todo el curso.
- Archivos: `src/chapters/cap1/Slide8.tsx`.
- Pasos: añadir a la tarjeta de la nota una línea de tres chips: «~1 s — un latido, una respiración» · «~1 min — la sangre da una vuelta al cuerpo» · «~2 min — cada ATP se gasta y se regenera».
- Fuera de alcance: FA.
- Criterio de aceptación: los tres chips son visibles en S8.
- Verificación: VE.
- Depende de: D3, `P6-25`.

## `P6-27` · C2: filas faltantes de la Tabla 1.6 — DIAGNOSTICADO
- Diapositiva(s): S9.
- Síntoma: faltan ancho del pecho 0,174, ancho de caderas / separación de piernas 0,191, del tobillo a la planta 0,039 y ancho del pie 0,055.
- Por qué importa: tabla del libro incompleta.
- Archivos: `src/chapters/cap1/Slide9.tsx` (`SEGMENTS_DATA`). Datos: `.tex` líneas 375–388.
- Pasos: añadir las 4 filas como filas de consulta (sin resaltado en el lienzo ni cursor de mano), separadas por un filete de las 9 interactivas.
- Fuera de alcance: FA; `sims.ts`.
- Criterio de aceptación: 13 filas con los valores del `.tex`; las 9 originales siguen resaltando la figura.
- Verificación: VE.
- Depende de: D3, `P6-10`.

## `P6-28` · C2: Tabla 1.7 en pestaña — DIAGNOSTICADO
- Diapositiva(s): S9.
- Síntoma: masas y densidades de los segmentos, ausentes.
- Por qué importa: el Cap. 2 (estática) las usa desde la primera diapositiva.
- Archivos: `src/chapters/cap1/Slide9.tsx` (+ `src/chapters/cap1/segmentTables.ts` nuevo, solo datos). Datos: `.tex` líneas 405–416.
- Pasos: convertir la tarjeta en pestañas «Longitud (1.6)» · «Masa y densidad (1.7)». La segunda: segmento · m/m_b · masa para 70 kg (calculada, 1 decimal) · densidad (g/cm³), 12 filas. Una línea: «Medidas en cadáveres: masa por pesada, volumen por agua desplazada (Arquímedes, Cap. 7)».
- Fuera de alcance: FA; el lienzo; las Tablas 1.8–1.9 (es `P6-29`).
- Criterio de aceptación: 12 filas idénticas al `.tex`; la suma tronco + cabeza y cuello + 2 brazos + 2 piernas da 1,000.
- Verificación: VE + captura de la pestaña.
- Depende de: D3, `P6-27`.

## `P6-29` · C2: Tablas 1.8 y 1.9 en pestañas — DIAGNOSTICADO
- Diapositiva(s): S9.
- Síntoma: centro de masa y radio de giro por segmento, ausentes.
- Por qué importa: completan la antropometría; se citan en los Caps. 2 y 3.
- Archivos: `src/chapters/cap1/Slide9.tsx`, `src/chapters/cap1/segmentTables.ts`. Datos: `.tex` líneas 436–447 y 469–479.
- Pasos: añadir las pestañas «Centro de masa (1.8)» (proximal · distal) y «Radio de giro (1.9)» (CdM · proximal · distal). Una línea por pestaña con la intuición: «dónde se equilibra el segmento» y «cuánto cuesta hacerlo girar (Cap. 3)». Conservar «--» donde el `.tex` lo pone.
- Fuera de alcance: FA; el lienzo.
- Criterio de aceptación: 12 y 11 filas idénticas al `.tex`.
- Verificación: VE + captura de cada pestaña.
- Depende de: D3, `P6-28`.

## `P6-30` · C3: Tabla 1.10 completa con SD + Fig. 1.16 — DIAGNOSTICADO
- Diapositiva(s): S10.
- Síntoma: 9 de 16 filas y sin desviación estándar; el texto remite a «Fig. 1.16», que no se muestra.
- Por qué importa: la SD y la regla del 68 % son el único contenido estadístico del capítulo.
- Archivos: `src/chapters/cap1/romTable.ts`, `src/chapters/cap1/Slide10.tsx`. Fig. 1.16 = `116.png`. Datos: `.tex` líneas 495–510.
- Pasos: añadir las 7 filas que faltan y una columna «SD». Las filas sin arco 3D son de consulta (sin cursor de mano). Nota al pie: «≈ 68 % de las personas cae entre media − SD y media + SD». Miniatura de la Fig. 1.16 con lightbox.
- Fuera de alcance: FA; nuevos arcos 3D.
- Criterio de aceptación: 16 filas con media y SD idénticas al `.tex`; las 9 originales siguen animando el esqueleto.
- Verificación: VE + `proj-10` desplazada.
- Depende de: D3.

## `P6-31` · C3: Tabla 1.11 con volumen + Tabla 1.12 — DIAGNOSTICADO
- Diapositiva(s): S10.
- Síntoma: 8 órganos sin columna de volumen; la Tabla 1.12 (célula) no existe en la web.
- Por qué importa: la célula es terreno propio de los estudiantes de biología.
- Archivos: `src/chapters/cap1/Slide10.tsx`. Datos: `.tex` líneas 543–571 y 589–595.
- Pasos: tarjeta con pestañas «Órganos (1.11)» y «Célula (1.12)». Órganos: añadir columna «Volumen (cm³)» y las filas piel, sangre (contenido de los vasos), tracto gastrointestinal y vejiga; pie «Selección de 12 de 29». Célula: las 7 filas completas (molécula · % de masa · peso molecular · n.º de moléculas · n.º de tipos), potencias de 10 en KaTeX.
- Fuera de alcance: FA.
- Criterio de aceptación: valores idénticos al `.tex`; ninguna potencia en notación de teclado.
- Verificación: VE + captura de cada pestaña.
- Depende de: D3, `P6-30`.

## `P6-32` · C4: efectos de la microgravedad — DIAGNOSTICADO
- Diapositiva(s): S11.
- Síntoma: 2 efectos de unos 10 (`.tex` línea 603).
- Por qué importa: cada efecto enlaza con un capítulo del curso; es un índice motivador.
- Archivos: `src/chapters/cap1/Slide11.tsx`.
- Pasos: convertir el párrafo en lista corta: «+2,5 cm de estatura (discos, Cap. 2)» · «Cara hinchada, piernas de pájaro (fluidos, Cap. 8)» · «Presión intracraneal y visión (Cap. 11)» · «Menos volumen de sangre (Cap. 8)» · «Mareo: canales semicirculares (Cap. 12)» · «Se traga por peristalsis, no por gravedad» · «Atrofia de músculo, hueso y corazón (Caps. 5, 4, 8)».
- Fuera de alcance: FA.
- Criterio de aceptación: 7 efectos con su capítulo.
- Verificación: VE.
- Depende de: D3, `P6-13`.

## `P6-33` · D1: Tabla 1.13 con `a` y los 15 parámetros — DIAGNOSTICADO
- Diapositiva(s): S12.
- Síntoma: 6 de 15 parámetros y sin el coeficiente `a`; «Unidad: Hz / lpm» ambiguo; faltan los ejemplos de alométrica (altura frente a masa) e isométrica (masa de la pierna frente a masa).
- Por qué importa: sin `a` no se puede calcular nada con la tabla.
- Archivos: `src/chapters/cap1/Slide12.tsx`. Datos: `.tex` líneas 628–642.
- Pasos: mostrar `a` junto a α en las 6 tarjetas existentes («a = 4,1 · α = 0,75»); frecuencia cardíaca en «Hz». Añadir debajo una tabla de consulta «Resto de la Tabla 1.13» con los 9 parámetros restantes (parámetro · a · α), notación científica en KaTeX. Añadir los dos ejemplos del libro a la línea alométrica/isométrica. Quitar «rigen en 7 órdenes de magnitud» (no está en el libro).
- Fuera de alcance: FA; `AllometryCanvas.tsx`.
- Criterio de aceptación: los 15 parámetros con `a` y α idénticos al `.tex`.
- Verificación: VE + `proj-12` desplazada.
- Depende de: D3, `P6-12`.

## `P6-34` · D2: la Tabla 1.14 real — DIAGNOSTICADO
- Diapositiva(s): S13.
- Síntoma: los grupos adimensionales independientes del tamaño no están.
- Por qué importa: es la conclusión de la sección: hay cocientes que valen lo mismo en un ratón y en un elefante.
- Archivos: `src/chapters/cap1/Slide13.tsx`. Datos: `.tex` líneas 687–693.
- Pasos: nueva tarjeta «Cocientes que no dependen del tamaño (Tabla 1.14)» tras la de `P6-04`, con las 7 filas (cociente · a · α) y la frase gancho: «~1,5 × 10⁹ latidos y ~3 × 10⁸ respiraciones en una vida, sea cual sea el tamaño» (inversos de 6,8 × 10⁻¹⁰ y 3 × 10⁻⁹, redondeados; comprobar el cálculo).
- Fuera de alcance: FA.
- Criterio de aceptación: 7 filas idénticas al `.tex`.
- Verificación: VE.
- Depende de: D3, `P6-04`.

## `P6-35` · D3: grasa normal, Quételet y familia m_b/H^p — DIAGNOSTICADO
- Diapositiva(s): S14.
- Síntoma: faltan los rangos de grasa normal (14–20 % hombres, 21–27 % mujeres), el nombre «índice de Quételet» y la idea de la familia m_b/H^p (p = 3 para S, p = 2 para el IMC). El apunte da 20,2 % de grasa al hombre estándar, que en C1 tiene 15 %, sin explicarlo.
- Por qué importa: el IMC es el índice que todos conocen; aquí se entiende de dónde sale.
- Archivos: `src/chapters/cap1/Slide14.tsx`. Datos: `.tex` líneas 662–677.
- Pasos: una línea bajo las ecuaciones: «Familia $m_b/H^p$: p = 3 → índice ponderal S; p = 2 → IMC (índice de Quételet)». Otra: «Grasa normal: 14–20 % (hombres), 21–27 % (mujeres)». En el apunte, cuando el resultado difiera del 15 % de la Tabla 1.5, añadir «(la Tabla 1.5 da 15 %: fuentes distintas)».
- Fuera de alcance: FA; los rangos OMS ya mostrados.
- Criterio de aceptación: las tres piezas son visibles en S14.
- Verificación: VE.
- Depende de: D3, `P6-16`.

## `P6-36` · D4: Gusto, Temperatura y segundos valores — DIAGNOSTICADO
- Diapositiva(s): S15.
- Síntoma: faltan dos percepciones (gusto 0,8 / 1,3 / 1,3; temperatura 1,0 / 1,6) y los segundos valores de brillo (0,5), sonoridad (0,60), olor (0,60) y vibración (0,95).
- Por qué importa: gusto y temperatura son las más cercanas a la experiencia del estudiante.
- Archivos: `src/chapters/cap1/Slide15.tsx`, `src/chapters/cap1/StevensCanvas.tsx`, `src/chapters/cap1/colorTokens.ts` (si la serie necesita 2 tonos más: **detenerse y reportar**, no añadir literales). Datos: `.tex` líneas 723–731.
- Pasos: añadir las dos percepciones como filas seleccionables (gusto: sal 1,3; temperatura: calor 1,6) y una columna «Otros valores» con el resto de la Tabla 1.15 para las 9 filas.
- Fuera de alcance: FA.
- Criterio de aceptación: 9 percepciones y 17 exponentes idénticos al `.tex`.
- Verificación: VE + captura con gusto y con temperatura seleccionados.
- Depende de: D3, `P6-03`.

## `P6-37` · Resumen dictable — DIAGNOSTICADO
- Diapositiva(s): S16.
- Síntoma: cuatro tarjetas de una frase a `.68rem`, con el tercio superior vacío (`scratch/fable-r1-before/proj-16.png`); no recoge antagonistas, tablas antropométricas ni Stevens en palabras.
- Por qué importa: es la diapositiva de cierre de la clase.
- Archivos: `src/chapters/cap1/Slide16.tsx`.
- Pasos: cada tarjeta pasa a 3 viñetas con lo esencial de su módulo (una idea, una cifra, una pregunta de repaso), tamaño de cuerpo igual al de las demás tarjetas, alineadas arriba. Mantener el clic que lleva al módulo.
- Fuera de alcance: FA.
- Criterio de aceptación: sin hueco superior a 1280×720; ningún texto por debajo de 13 px; KaTeX renderizado.
- Verificación: VE.
- Depende de: fases 1 y 2 cerradas (para resumir el contenido final).

---

# FASE 3 · Legibilidad en proyector e interacción

## `A6-01` · Apunte de cátedra siempre visible — DIAGNOSTICADO
- Diapositiva(s): S3–S7, S9–S15 (12 de 17).
- Síntoma: a 1280×720 la columna de teoría mide 537 px visibles y su contenido hasta 853 (`metrics.json`). El apunte es el último bloque: queda fuera de pantalla y se actualiza sin que nadie lo vea.
- Por qué importa: el apunte es lo que el profesor dicta tras cada clic.
- Archivos: `src/chapters/cap1/legacy.css`. Localizar la clase del apunte: `grep -n "Apunte de cátedra" src/chapters/cap1/Slide1.tsx` y su regla en `legacy.css`.
- Pasos: dentro de `.cap1-presentation`, fijar el apunte al borde inferior de la columna con `position: sticky; bottom: 0`, fondo opaco con token y sombra superior sutil; limitar su alto a ~35 % de la columna con scroll interno si se excede.
- Fuera de alcance: FA; `src/index.css`; el breakpoint móvil.
- Criterio de aceptación: en `proj-NN.png` de las 17 diapositivas el apunte es visible sin desplazar; en móvil la captura no cambia.
- Verificación: VE (comparar `proj-*` y `mob-*` con la línea base).
- Depende de: fase 2 (el contenido final determina los altos).

## `A6-02` · Piso tipográfico de 12 px en el DOM — DIAGNOSTICADO
- Diapositiva(s): todas.
- Síntoma: `metrics.json` registra texto de 9,6 a 11,9 px en las 16 diapositivas con contenido (pistas 11,1; rótulos de control 10,9; notas 10,3–10,7; el `.68rem` del Resumen).
- Por qué importa: ilegible desde el fondo del aula.
- Archivos: `src/chapters/cap1/legacy.css` (y `fontSize` en línea de `Slide*.tsx` solo si no hay regla CSS).
- Pasos: subir a un mínimo de 12 px (rótulos de control, notas, pistas) y 13 px (celdas de tabla) las reglas que quedan por debajo, usando `max(12px, …)` sobre el valor actual. No cambiar el tamaño raíz.
- Fuera de alcance: FA; texto pintado en lienzo (son `A6-03`, `A6-04`, `R6-01`).
- Criterio de aceptación: `node scratch/fable-audit/dump.mjs && node scratch/fable-audit/summary.mjs` no lista ningún tamaño < 12 px en ninguna diapositiva; ninguna pestaña ni cabecera envuelve a dos líneas.
- Verificación: VE + la salida de `summary.mjs`.
- Depende de: `A6-01`.

## `A6-03` · Rótulos de ejes 3D: tamaño, contraste, colisión — DIAGNOSTICADO
- Diapositiva(s): S1, S2, S3, S10.
- Síntoma: «↑ Superior / Craneal», «Anterior / Ventral», «Posterior / Dorsal» en ~11 px, color apagado, y los dos del eje x caen sobre las piernas del esqueleto (`scratch/fable-r1-before/proj-01.png`).
- Por qué importa: son los términos que la diapositiva enseña.
- Archivos: `src/chapters/cap1/AnatomyCanvas.tsx` (`<Axes>`). Localizar: `grep -n "Anterior / Ventral" src/chapters/cap1/`.
- Pasos: subir el tamaño de los rótulos secundarios a ≥ 13 px en pantalla, usar el token de tinta principal con halo claro, y desplazar los del eje x fuera de la silueta (hacia el extremo de la flecha).
- Fuera de alcance: FA; la cámara; `BodyScene.tsx`.
- Criterio de aceptación: en `proj-01/02/03` los 6 rótulos se leen y ninguno toca el esqueleto.
- Verificación: VE (también `desk-*` y `mob-*` de esas diapositivas).
- Depende de: ninguno.

## `A6-04` · D4: leyenda legible — DIAGNOSTICADO
- Diapositiva(s): S15.
- Síntoma: la leyenda de «Ver todas» va en ~9 px y gris claro; las curvas no activas apenas se distinguen (`scratch/fable-r1-before/proj-15.png`).
- Por qué importa: con siete (nueve tras `P6-36`) curvas, la leyenda es la única clave.
- Archivos: `src/chapters/cap1/StevensCanvas.tsx`.
- Pasos: leyenda a ≥ 12 px con el color pleno de cada serie y la activa en negrita; curvas inactivas con opacidad ≥ 0,45.
- Fuera de alcance: FA; la paleta.
- Criterio de aceptación: los nombres de la leyenda se leen en `proj-15.png` al 100 %.
- Verificación: VE.
- Depende de: `P6-36`.

## `V6-01` · Área segura: lienzos 2D de C1, C2, C3 y D3 — DIAGNOSTICADO
- Diapositiva(s): S8, S9, S10 (vista 2D), S14.
- Síntoma: el panel flotante tapa piernas y pies de las figuras, el final de la barra de segmentos, la barra de composición de D3 y, en C3 «Vista 2D», el arco del tobillo seleccionado (`scratch/fable-audit/interact/s10-2d.png`).
- Por qué importa: se tapa justo lo que se está señalando.
- Archivos: `src/chapters/cap1/sims.ts` (composición `CFX`), `src/chapters/cap1/BMICalculatorCanvas.tsx`. Localizar: `grep -n "scene(\|floorY\|pad" src/chapters/cap1/sims.ts | head -40`.
- Pasos (si D2 = recomendación): medir el alto real del panel abierto (`.prof-controls` no colapsado) y pasarlo como margen inferior de composición; el fondo y la cuadrícula siguen llegando al borde, las figuras y cotas se componen por encima. Con el panel cerrado, margen 0.
- Fuera de alcance: FA; `legacy.css`; la posición del panel.
- Criterio de aceptación: en `proj-08/09/14` y en C3 2D con «Tobillo», ningún elemento con información queda bajo el panel abierto.
- Verificación: VE + capturas con panel abierto y cerrado.
- Depende de: D2, `P6-18`, `P6-19`.

## `V6-02` · Área segura: gráficas D1, D2 y D4 — DIAGNOSTICADO
- Diapositiva(s): S12, S13, S15.
- Síntoma: el panel tapa el eje x y sus marcas en D1 y D4, y los rótulos bajo los huesos en D2.
- Por qué importa: una gráfica sin eje x no se puede leer.
- Archivos: `src/chapters/cap1/AllometryCanvas.tsx`, `src/chapters/cap1/BoneScaleCanvas.tsx`, `src/chapters/cap1/StevensCanvas.tsx`.
- Pasos: mismo criterio que `V6-01`: `pad.bottom` crece en el alto del panel abierto.
- Fuera de alcance: FA.
- Criterio de aceptación: en `proj-12/13/15` con el panel abierto se leen el eje x, su título y los rótulos inferiores.
- Verificación: VE.
- Depende de: D2, `P6-11`, `A6-04`.

## `V6-03` · Área segura: encuadre 3D de B1, B2 y C3 — DIAGNOSTICADO
- Diapositiva(s): S4, S5, S10.
- Síntoma: la pierna de B1 ocupa ~25 % del ancho, arriba, con el tobillo bajo el panel; el brazo de B2 y el esqueleto de C3 quedan cortados por el panel (`scratch/fable-r1-before/proj-04.png`, `proj-10.png`).
- Por qué importa: el tobillo es uno de los tres sitios donde B1 cuenta GL.
- Archivos: `src/chapters/cap1/three/AnatomyStage.tsx` y el encuadre de `KinematicsCanvas.tsx`, `SynovialJointCanvas.tsx`, `MobilityCanvas.tsx`. Leer antes `BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md`.
- Pasos: desplazar el objetivo de cámara hacia arriba en la fracción que ocupa el panel abierto y ajustar la distancia para que el sujeto llene ~70 % del alto libre.
- Fuera de alcance: FA; mallas y materiales.
- Criterio de aceptación: en `proj-04/05/10` el sujeto entero queda por encima del panel y ocupa ≥ 60 % del alto libre.
- Verificación: VE (también `desk-*`).
- Depende de: D2.

## `V6-04` · B4: el ojo 3D debe mostrar sus músculos — DIAGNOSTICADO
- Diapositiva(s): S7.
- Síntoma: el botón dice «Ojo 3D (6 Músculos)» y la escena muestra una esfera gris con un anillo y un único muñón marrón; la pupila se ve blanca (`scratch/fable-r1-before/proj-07.png`, `desk-07.png`).
- Por qué importa: el título de la diapositiva es «6 músculos, 6 direcciones» y no se ve ninguno.
- Archivos: `src/chapters/cap1/AntagonistCanvas.tsx`.
- Pasos: cámara por defecto en vista lateral-superior (tres cuartos) desde la que se vean los cuatro rectos, los dos oblicuos y la tróclea; pupila oscura; rótulo corto por músculo (RL, RM, RS, RI, OS, OI) fuera del globo.
- Fuera de alcance: FA; la lógica de mirada; nuevas mallas.
- Criterio de aceptación: en `proj-07.png` se cuentan 6 músculos rotulados y la pupila es oscura.
- Verificación: VE + capturas en mirada centro, derecha y abajo-izquierda.
- Depende de: `P6-24`.

## `R6-01` · B1 Atlas 2D: rótulos que vuelven a solaparse — DIAGNOSTICADO
- Diapositiva(s): S4 (vista «2D Atlas», modo brazo).
- Síntoma: «HÚMERO» bajo «BÍCEPS BRAQUIAL», «CÚBITO»/«RADIO» superpuestos, «Muñeca» cortado en el borde, texto de ~8 px (`scratch/fable-audit/interact/s04-atlas.png`). `V2-03` lo dio por resuelto a 1440×900.
- Por qué importa: regresión visible en el viewport de clase.
- Archivos: `src/chapters/cap1/KinematicsAtlas2D.tsx`.
- Pasos: escalar el dibujo al alto libre, rótulos a ≥ 11 px en pantalla con líneas guía hacia un margen, y recorte de seguridad para que ninguno salga del lienzo.
- Fuera de alcance: FA.
- Criterio de aceptación: a 1280×720, en brazo y pierna, ningún rótulo se solapa ni se corta.
- Verificación: VE + script en `scratch/fix-R6-01/` que active «2D Atlas» en ambos modos.
- Depende de: `P6-21`.

## `A6-05` · Resumen: tarjetas operables por teclado — VERIFICADO
- Diapositiva(s): S16.
- Síntoma: las cuatro tarjetas son `<div onClick>` sin `role`, `tabIndex` ni manejo de Enter (`Slide16.tsx:22–53`).
- Por qué importa: el resto del capítulo se navega con teclado.
- Archivos: `src/chapters/cap1/Slide16.tsx`.
- Pasos: convertir cada tarjeta en `<button type="button" className="card">` (o añadir `role="button"`, `tabIndex={0}` y `onKeyDown` para Enter/Espacio) conservando el aspecto.
- Fuera de alcance: FA.
- Criterio de aceptación: con Tab se recorren las 4 tarjetas con foco visible y Enter lleva al módulo.
- Verificación: VE + script de teclado en `scratch/fix-A6-05/`.
- Depende de: `P6-37`.

---

# FASE 4 · Estética

## `V6-05` · A2: deslizadores con el color del sistema — DIAGNOSTICADO
- Diapositiva(s): S2.
- Síntoma: los tres deslizadores «Pos.» salen en el azul nativo del navegador; el resto del capítulo usa teal.
- Archivos: `src/chapters/cap1/legacy.css` o `Slide2.tsx`. Localizar: `grep -n "accent-color" src/chapters/cap1/`.
- Pasos: aplicar a esos `input[type=range]` el mismo `accent-color` (token) que los demás.
- Fuera de alcance: FA.
- Criterio de aceptación: ningún control azul nativo en `proj-02.png`.
- Verificación: VE.
- Por qué importa: consistencia. · Depende de: ninguno.

## `V6-06` · D3: barra de composición recortada — DIAGNOSTICADO
- Diapositiva(s): S14.
- Síntoma: «Grasa: 14,1 kg» se corta en el borde derecho y asoma un fragmento de texto («aró») (`scratch/fable-r1-before/proj-14.png`).
- Archivos: `src/chapters/cap1/BMICalculatorCanvas.tsx`.
- Pasos: limitar el ancho de la barra y de sus rótulos al área del lienzo; localizar y recolocar el texto que asoma.
- Fuera de alcance: FA.
- Criterio de aceptación: nada cortado en el borde derecho, con masa mínima y máxima.
- Verificación: VE + capturas en los dos extremos.
- Por qué importa: pulido. · Depende de: `V6-01`.

## `V6-07` · D2: rótulo «FRACTURA» desbordado — DIAGNOSTICADO
- Diapositiva(s): S13 (modo isométrico).
- Síntoma: «FRACTURA: 215 MPa» sale de su banda roja por la derecha (`scratch/fable-audit/interact/s13-isometrico.png`).
- Archivos: `src/chapters/cap1/BoneScaleCanvas.tsx` (≈ línea 199).
- Pasos: medir el texto y dimensionar la banda a su ancho, o partir en dos líneas.
- Fuera de alcance: FA.
- Criterio de aceptación: el texto completo queda dentro de la banda.
- Verificación: VE en modo isométrico.
- Por qué importa: pulido. · Depende de: `P6-17`, `V6-02`.

## `V6-08` · D1: «Perro» tapado y «Comparativa animada» — DIAGNOSTICADO
- Diapositiva(s): S12.
- Síntoma: el rótulo «Perro» queda bajo «Humano»; la línea de tendencia tacha «Conejo»; el recuadro «Comparativa animada — Baja escala / Alta escala» solo tiene sentido para la frecuencia cardíaca y para las demás curvas escribe «escala» dos veces.
- Archivos: `src/chapters/cap1/AllometryCanvas.tsx` (≈ líneas 372–434).
- Pasos: alternar los rótulos de especie a un lado y otro de la recta; mostrar el recuadro solo con la curva de frecuencia cardíaca.
- Fuera de alcance: FA.
- Criterio de aceptación: los 8 rótulos de especie se leen enteros en las 6 curvas; el recuadro no aparece salvo en frecuencia cardíaca.
- Verificación: VE con las 6 curvas.
- Por qué importa: pulido. · Depende de: `V6-02`.

## `V6-09` · Portada: pie recortado a 720 px — DIAGNOSTICADO
- Diapositiva(s): S0.
- Síntoma: la línea «Physics of the Human Body — Irving P. Herman…» queda cortada por abajo (`scratch/fable-r1-before/proj-00.png`).
- Archivos: `src/chapters/cap1/Slide0.tsx`, `legacy.css`.
- Pasos: reducir el espacio vertical entre bloques cuando el alto ≤ 760 px.
- Fuera de alcance: FA.
- Criterio de aceptación: el pie se lee entero en `proj-00.png`; `desk-00.png` no cambia.
- Verificación: VE.
- Por qué importa: es la primera pantalla. · Depende de: ninguno.

## `I6-05` · Cursor de mano falso en tablas de consulta — DIAGNOSTICADO
- Diapositiva(s): S10 y las tablas de consulta que añade la fase 2.
- Síntoma: `.data-mini tr{cursor:pointer}` (`legacy.css` ≈ línea 454) pone mano sobre filas que no hacen nada.
- Archivos: `src/chapters/cap1/legacy.css` y las tablas interactivas (`Slide5`, `Slide8`, `Slide10`, `Slide12`, `Slide15`).
- Pasos: quitar el `cursor:pointer` genérico y aplicarlo solo a las filas con `onClick` (clase o atributo ya existente de `E3-02`).
- Fuera de alcance: FA.
- Criterio de aceptación: mano solo sobre filas que responden al clic.
- Verificación: VE + nota de comprobación manual por tabla.
- Por qué importa: una promesa de interacción falsa. · Depende de: fase 2.

## `S6-01` · Regla de emoji (D1 resuelta) — sustituye a `S4-01`

**Regla única:** emoji permitido solo como icono de cabecera (pestaña de módulo, cabecera de tarjeta, portada,
«Apunte de cátedra») y al inicio de una pista («💡 Pasa el cursor…»). **Prohibido** dentro de lienzos y gráficas,
en celdas de tablas de datos y en botones o controles. Los símbolos tipográficos con significado (♂ ♀ ✓ ▶ ⏸ ⚙ × ↔)
no son emoji a efectos de esta regla. Inventario del 2026-11-15: 144 apariciones en 26 archivos de `cap1/`.
Se ejecuta en tres tickets para no superar tres archivos por encargo:

### `S6-01a` · Sin emoji en las gráficas de D1, D2 y D4 — DIAGNOSTICADO
- Diapositiva(s): S12, S13, S15.
- Síntoma: animales 🐭🐕🐘🐋 junto a los puntos de datos de D1; 🐀🐎🐘 y ⚠️ en D2; 🔊 💡 en el panel de D4. Se pintan con la fuente de emoji del sistema operativo y compiten con los datos.
- Por qué importa: regla D1; en una gráfica el emoji es ruido sobre el dato.
- Archivos: `src/chapters/cap1/AllometryCanvas.tsx`, `src/chapters/cap1/BoneScaleCanvas.tsx`, `src/chapters/cap1/StevensCanvas.tsx`.
- Pasos: quitar todo emoji de las cadenas que se pintan con `fillText`/`CFX` (los nombres «Ratón», «Elefante»… ya identifican la especie). «⚠️ FRACTURA» → «FRACTURA». No tocar posiciones ni colores.
- Fuera de alcance: FA; cabeceras de tarjeta en los `Slide*.tsx`.
- Criterio de aceptación: el inventario de emoji de esos tres archivos queda en 0 (salvo comentarios).
- Verificación: VE (S12 con 2 curvas, S13 en ambos modos, S15 con 2 modalidades).
- Depende de: fases 1–3 (para no chocar con `P6-11`, `P6-17`, `V6-02`, `V6-07`, `V6-08`, `A6-04`).

### `S6-01b` · Sin emoji en los lienzos de C1–C4 y D3 — DIAGNOSTICADO
- Diapositiva(s): S8, S9, S10, S11, S14.
- Síntoma: títulos de lienzo con 🫁 📏 🏹 🧬 y rótulos 🏃 💪 🍐 bajo las figuras de somatotipo.
- Por qué importa: regla D1.
- Archivos: `src/chapters/cap1/sims.ts` (solo cadenas; **no** tocar `MODULES`, que son las pestañas), `src/chapters/cap1/BMICalculatorCanvas.tsx`.
- Pasos: quitar el emoji de cada cadena pintada en lienzo. Localizar con una búsqueda de caracteres U+1F000–U+1FAFF y U+2600–U+27BF en ambos archivos; descartar `MODULES` y las funciones muertas ya anotadas (`drawAllometry`, `drawStevens`, `calcBMI`).
- Fuera de alcance: FA; cualquier otra cosa de `sims.ts`.
- Criterio de aceptación: `proj-08/09/10(2D)/11/14.png` sin emoji dentro del lienzo; las pestañas de módulo conservan su icono.
- Verificación: VE.
- Depende de: `S6-01a`, `V6-01`.

### `S6-01c` · Sin emoji en botones y paneles de control — DIAGNOSTICADO
- Diapositiva(s): S7, S13 y los paneles 3D.
- Síntoma: botones «👁️ Ojo 3D (6 Músculos)», «🦾 Brazo y Palanca», casilla «⚠️ Modo Isométrico», y emoji en `HudPanel`, `AnatomyStage` y `AccessibleOrbitControls`.
- Por qué importa: regla D1; un control se identifica por su texto.
- Archivos: `src/chapters/cap1/Slide7.tsx`, `src/chapters/cap1/Slide13.tsx`, `src/chapters/cap1/HudPanel.tsx` (y, si el emoji está ahí, `three/AnatomyStage.tsx` y `AccessibleOrbitControls.tsx`: en ese caso reportar y partir).
- Pasos: quitar el emoji de los rótulos de botones, casillas e insignias de panel. Conservar los de `card-hdr` y las pistas.
- Fuera de alcance: FA.
- Criterio de aceptación: ningún botón ni casilla del capítulo contiene emoji.
- Verificación: VE (S7, S13).
- Depende de: `S6-01b`.

## `S6-02` · C3: icono que sale como cuadro vacío — DIAGNOSTICADO
- Ex `S4-05`. Cabecera «Masa de los órganos» (`Slide10.tsx`): el glifo no existe en Windows 10 y se pinta como un rectángulo (`scratch/fable-r1-before/proj-10-scrolled` y `proj-10.png`).

---

## Hallazgos colaterales

Los ejecutores añaden aquí lo que vean y **no** corrijan.

- (`P6-13`) `Slide11.tsx` líneas 26/37/48: los apuntes (`desc`) de cada somatotipo contienen rasgos que no están en el libro («caja torácica plana», «tórax en V», «cintura estrecha», «articulaciones robustas», «órganos digestivos»). Líneas 28/39/50: campo `athletes` sin uso, con deportes que el libro no menciona. **Candidato a ticket** (ver `P6-38`).
- (`P6-09`) `DESCRIPTIONS` de `Capitulo1.tsx` solo cubre 10 de las 16 regiones y usa un formato distinto al de `Slide3.tsx`: dos fuentes para el mismo apunte (`I6-04`).
- (`P6-01`) El ejecutor cambió además `unit: 'Amplitud 60 Hz (μm)'` → `'Amplitud 250 Hz (μm)'` en `StevensCanvas.tsx` para que no contradijera el nombre nuevo; aceptado.
- (`P6-11`) El chip de la curva de frecuencia cardíaca rotula «HR: 1,39 Hz» (sigla en inglés; en el resto, FC) y su valor flotante pisa el rótulo «Perro». Va con `V6-08`.
- (`P6-10`) `sims.ts:3851–3859` (`C2_PARTS`): el lienzo de C2 rotula con nombres cortos («Brazo», «Ancho hombros») distintos de los de la tabla. Se dejan cortos por espacio; «Ancho hombros» → «Ancho de hombros» puede ir con `P6-19`.
- (`P6-06`) `Slide10.tsx` y `Slide12.tsx` usan `dangerouslySetInnerHTML={{ __html: … }}` sin memoizar; en C3 el apunte probablemente se recompone con KaTeX en cada fotograma de la animación. No medido; sin efecto visible.
- (`P6-06`) `Capitulo1.tsx:307–311` guarda `infoTexts.current['c1']` y nada lo consume: código muerto.
- (`P6-14`) `C4_TYPES` en `sims.ts:4360–4376` usa colores literales y emoji (el emoji va con `S6-01b`).
- (`P6-18`) Fuera de la referencia, los chips «♥ 65 lpm» y «15/min» sobre el pecho (los dibuja `organWindow` en `sims.ts`) siguen a color pleno aunque también son valores de 70 kg. El lienzo usa «lpm» y «15/min» donde la tabla dice «latidos/min» y «resp/min».
- (`P6-18`) `CFX.title` en `sims.ts` ignora el texto recibido para C1 y C2 y pinta un título fijo; se amplió lo mínimo para aceptar «Sujeto».
- (`P6-39`) En D4 con «descarga eléctrica», el chip «S − S₀» pisa la marca «1» del eje x. Va con `V6-02`.
- (`I6-03`) El fallback de error no conserva la cabecera de módulo de la diapositiva y el párrafo se parte a 72 caracteres. Solo estético.
- (auditor) `sims.ts:4369–4379`: las ternas que sitúan el punto en la somatocarta (ecto 1,5·2,0·6,0) no coinciden con las de la tarjeta de `Slide11.tsx` (1,0·1,5·6,5). Ambas son ilustrativas.
- (auditor) Las figuras del libro (lightbox) conservan sus rótulos en inglés («Flexion», «Extension»). Son imágenes escaneadas; traducirlas es otra fase.
- (auditor) `scratch/fix-S4-01/` contiene capturas de un intento anterior de `S4-01` que nunca se commiteó.
- (auditor) `STATUS.md` dice que el Cap. 1 tiene 21 diapositivas; son 17.
- (auditor) Siguen vigentes los colaterales de código muerto de `EJECUTAR_CORRECCIONES_CAP1.md` (`calcBMI`, `drawAllometry`, `drawStevens`, `PLANES`, selectores `data-*` huérfanos). No afectan a lo que se ve; fuera de esta ronda.
- (`P6-33`) La Tabla 1.13 del `.tex` dice «Volumen pulmonar efectivo, en m²»: un volumen va en m³ (probable errata de traducción). Se copió literal; conviene contrastar con el PDF original.
- (`P6-36`) La Tabla 1.15 tiene 16 exponentes (2+2+2+2+3+2+1+1+1), no 17 como decía el ticket; están los 16.
- (`P6-36`) Gusto y temperatura usan las series `--ink` y `--blood` (tokens existentes de `:root`, espejados en `colorTokens.ts`): `--series-1..7` solo da 7 tonos. Si se quiere una escala categórica de 9, añadir `--series-8/9` en `src/index.css` (fuera de alcance).
- (`P6-24`) `EYE_GAZE_PRESETS` (fuera de alcance) describe las diagonales con dos músculos de un mismo ojo («Abajo-derecha: recto inferior + recto lateral»); la Tabla 1.4 da los pares binoculares (RI del derecho + OS del izquierdo). No se contradicen, pero conviene alinear el apunte con la tabla.
- (`S6-01a`) El subtítulo del lienzo de D2 sigue con «w/L ∝ mᵦ¹ᐟ⁶» (subíndice que se lee β), el mismo defecto que `P6-11` corrigió en D1; y en D4 el exponente en superíndice del título y del panel se pinta con «·» como separador («2⁰·⁵⁴»), porque Unicode no tiene coma en superíndice. Ambos se arreglan dibujándolos como en D1 (`drawScriptedText`).
- (`V6-03`) B3: en algunas fases de la animación el encuadre corta el hombro por arriba, con el panel abierto o cerrado (preexistente; B3 no estaba en el ticket).
- (`S6-01b`) Quedan emoji pintados en lienzo en funciones de `sims.ts` que no dibujan C1–C4 ni D3: `drawGL` (💡 y los iconos de los 6 tipos sinoviales) y `drawAntagonist` (🔄). B1, B2 y B4 son hoy escenas 3D; si esos lienzos 2D ya no se muestran es código muerto, si no, ticket aparte.
- (`S6-01c`) `three/AnatomyStage.tsx` conserva ⚠️ en el mensaje de respaldo cuando no hay WebGL (no es un control). Se reporta, como pedía el ticket.
- (`I6-05`) El ticket se limitó a tablas: las píldoras `.pill` sin acción (clasificación fibrosas/cartilaginosas/sinoviales en B2; «Salto vertical»/«Carrera máx.» en D2) siguen con cursor de mano.
- (`V6-01`) Con el panel abierto, el tramo «Cuello» de la barra a escala de C2 queda demasiado fino para su rótulo (la cifra «8,9 cm» sí se lee).
- (`V6-06`) En D3, con IMC bajo (≈ 13,5) la aguja del dial pasa por encima de la cifra central.
- (`P6-25`) El apunte de «Corazón y sangre» en C1 dice «aprox. 7,5 % de la masa» y «lpm»: el porcentaje no está en el libro y la unidad no coincide con la tabla («latidos/min»).
- (`V6-04`) La vista del ojo es en tres cuartos desde el lado lateral: los vientres de OS y OI se ven poco (sus rótulos marcan la tróclea y el origen del OI). Una vista que los muestre enteros tapa la pupila; queda a criterio de Paul en Chrome.
