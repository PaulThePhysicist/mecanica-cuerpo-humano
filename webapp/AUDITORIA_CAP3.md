# Auditoría — Capítulo 3 «Movimiento» (webapp)

**Fecha:** 2026-11-26 · **Rama:** `feat/cap3-auditoria` (desde `main` @ `e4dced4`)
**Alcance:** `webapp/src/chapters/cap3/**` frente a la fuente de verdad
`Capitulos/Capitulo_3/Capitulo_3.tex` (solo lectura).
**Método:** lectura completa del `.tex` (§3.1–§3.13 y problemas citados) y de las 19
diapositivas + `sims.ts` (motor 2D), `ab.ts` (primitivas), `useEngine.ts`, `Sim.tsx`,
`StabScene3D.tsx`, `cap3.css`; `tsc -b`, `oxlint`, `vite build` y capturas con
Chromium/Playwright a 1280×720 (`?preview=3`).
**Referencia de estándar:** `AUDITORIA_CAP1.md`, `AUDITORIA_CAP1_INTERACCION.md`,
`BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md`.

Convención de IDs: **F-nn** = fidelidad matemática/pedagógica frente al `.tex` ·
**T-nn** = deuda técnica (rendimiento, tokens, 3D, tipografía, área segura).

---

## 0 · Veredicto

El capítulo estaba **portado pero no auditado**: el esqueleto (19 diapositivas, 18 lienzos 2D,
una escena 3D) es bueno y la elección de temas sigue el hilo del libro, pero:

1. **Fidelidad:** 33 discrepancias con el `.tex`. Las graves: la tabla de los cuatro casos del
   lanzamiento tenía las etiquetas **cambiadas** (F-20); el CM del modelo de estabilidad estaba en
   0,55 H, valor que **no existe** en el libro (F-01); la regla del alcance «3/2 v₀ − 105» se citaba
   como regla general en pies cuando es una regla **empírica de golf en yardas con v₀ en ft/s**
   (F-31); el salto de longitud se describía con el ángulo de pierna al revés (F-17); la numeración
   de sección de 12 de 18 encabezados estaba desfasada (F-00).
2. **Bugs visibles:** siete párrafos mostraban etiquetas HTML literales (`<strong>…</strong>`,
   `<span class="tag">`) porque estaban dentro de cadenas JS (F-02); el slider «rigidez» del pogo
   no hacía nada (F-12); el reproductor de las seis fases dejaba el slider fuera de rango y el botón
   desincronizado (T-04); la figura 3D de estabilidad se inclinaba **en sentido contrario** al
   punto del CM y de lado en vez de adelante/atrás (T-09).
3. **Técnica:** un `requestAnimationFrame` global repintaba la diapositiva activa a 60 fps para
   siempre (T-01), la escena 3D renderizaba en bucle continuo y **mutaba los materiales cacheados
   del GLB compartido con el Cap. 1** (T-10), `cap3.css` redefinía `:root`, `html`, `body` y el
   reset `*` globalmente, con `body{user-select:none}` que se filtraba a toda la app (T-05), y
   la tipografía bajaba hasta 7 px en lienzo y ~9 px en DOM (T-07).

Todo lo anterior queda corregido en esta rama (ver §4). Lo que **no** cubre el deck (§3.1 tablas
de músculos, §3.8, §3.9, §3.11, rebote y rodadura de §3.12) queda listado en §2 como brecha de
alcance, no como error.

---

## 1 · Matriz de cobertura §-por-§

Leyenda: ✅ cubierto y fiel · 🟡 cubierto con errores (corregidos, ver F-nn) · ⬜ no cubierto
(fuera del deck) · ➕ añadido en esta ronda.

### §3.0 Introducción y clasificación de movimientos

| Elemento del `.tex` | Diapositiva | Estado |
|---|---|---|
| 5 categorías de movimiento (empujar/tirar, lanzar/golpear, locomoción en suelo, suspendida/libre, agua) | S0 (portada) | ⬜ solo módulos; la portada resume los 8 módulos del deck |
| «La mitad de la velocidad de la pelota viene del paso y la rotación del cuerpo» | S12 | ✅ (vía 10 + 45 + 45 mph) |

### §3.1 Cinemática y musculatura

| Elemento | Diapositiva | Estado |
|---|---|---|
| Fig. 3.1 convenciones θ_cadera/θ_rodilla/θ_tobillo | — | ⬜ |
| Tablas 3.1–3.3 (músculos del muslo, pierna, pie) | — | ⬜ |
| Fig. 3.5 modelo de 6 músculos (mono/biarticulares), Tabla 3.4 (lagartija) | — | ⬜ |

### §3.2 Bipedestación

| Elemento | Diapositiva | Estado |
|---|---|---|
| §3.2.1 Estabilidad general: línea de gravedad dentro de la base de sustentación; torques de vuelco (Figs. 3.6–3.7) | S1 | ✅ |
| Problema 3.1: pie 0,152 H apoyado al 25 % desde el talón (talón 0,038 H, dedos 0,114 H), masa uniforme → CM a 0,50 H | S1 | 🟡 F-01 (usaba CM 0,55 H, inexistente) |
| Fig. 3.8: CM real ≈ 58 % de H | S1 | ➕ conmutador 0,50 H / 0,58 H |
| Seis estrategias de estabilidad (bajar CM, ampliar base…), lordosis 32°→50° en embarazo, desplazamiento 3,2 cm | S1 (apunte) | ➕ resumido |
| Estabilidad local: ligamentos colaterales y cruzados, rótula, ilion corto | — | ⬜ |
| §3.2.2 Fuerzas sobre los pies: 700 N, 350 cm², 2 N/cm²; almohadilla/talón 10 N/cm² | S2 | ✅ |
| Marcha: 1400 N por pie → ≈ 40 N/cm²; pico ≈ 60 N/cm² con menor área | S2 | 🟡 F-03 (inventaba 23 cm² y omitía los 40 N/cm²) |

### §3.3 Marcha

| Elemento | Diapositiva | Estado |
|---|---|---|
| §3.3.1 Apoyo 60–65 % / oscilación 35–40 %; doble apoyo en el primer y último ~10 % del apoyo; FS/TO; subfases | S3 | 🟡 F-04 (precisión de redacción) |
| Ángulos sagitales (cadera 30°→−10°→35°, rodilla 5°/20°/40°/60–70°, tobillo) Fig. 3.11 | S3 (apunte) | ➕ cifras de rodilla y cadera |
| §3.3.2 Acción muscular (excéntrica/concéntrica por fase), Figs. 3.12–3.13 | — | ⬜ |
| §3.3.3 Fricción: F_f = μ_s N, Tabla 3.5, cartílago μ_k 0,003–0,01, μ_s > 0,15 para caminar, 0,17 a 3 mph (Fig. 3.17) | S4 | 🟡 F-05/F-06/F-07 |
| §3.3.4 Energética: ec. 3.1–3.5 (KE_H, KE_V, PE, E) y desfase PE+KE_V vs KE_H (Fig. 3.20) | S6 | ✅ (ec. 3.4 añadida) |
| §3.3.5 MAS y péndulos: ω = (k/m)^½, ω = (g/L)^½, ω = (mgd/I)^½, Steiner, radio de giro (ec. 3.6–3.28) | S5 | 🟡 parcial (ω y T½); ec. 3.27–3.28 ⬜ |
| §3.3.6 Modelo balístico: L = 0,53 H = 0,95 m → T½ = 0,98 s; varilla 0,80 s; dos segmentos d = 0,421 L, I = 0,256 m L² → 0,76 s; paso real ≈ 0,60 s (lento), 0,35 s (rápido) | S5 | 🟡 F-08 («¡cerca del tiempo real!» con 0,98 s) |
| §3.3.7 Péndulo invertido: v_max = (gR)^½ ≈ 3,0 m/s con R = 0,9 m; Luna 0,17 g → 1,2 m/s; Marte 0,4 g → 1,9 m/s; transición real ≈ 2,0 m/s; marcha atlética ≈ 4 m/s | S5 | 🟡 F-09 (Marte «g/3», Luna «g/6», R = L) |

### §3.4 Carrera

| Elemento | Diapositiva | Estado |
|---|---|---|
| §3.4.1 Apoyo 40 % / fuera del suelo 60 % (15 % flotación + 30 % oscilación + 15 % flotación) | S3 | ✅ (desglose ➕) |
| Tabla 3.6 ángulos máximos en carrera; Fig. 3.30 momento angular vertical (brazos cancelan ~90 %) | — | ⬜ |
| §3.4.3 Energética: ec. 3.35–3.37 (KE_H y PE en fase), F_max = 2,7 W_b ≈ 1900 N (4,5 m/s), sprint 3,6 m_b g; Aquiles 4700 N, reacción 6400 N | S6, S7 | 🟡 F-10 (correr «cuesta más»: no está en el texto) · ➕ fuerzas |
| 100 J de KE perdidos por pisada; Aquiles 35 J (93 %), arco 17 J (80 %), ≈ 50 J recuperables / 50 J musculares; matiz Fig. 3.26 (~5 %); zapatillas 7 J (54–66 %); pista 12 J, k ≈ 3×80 000 N/m, +2 % | S7 | 🟡 F-11 («100 J de energía metabólica») · F-12 (slider muerto) |
| Aceleración hasta sprint: ec. 3.38–3.47, v_n² = (2FL/m_leg)[1 − xⁿ], v_final = (2FL/m_leg)^½ = 10,0 m/s; 10,4 m/s clase mundial (100/200 m, 2014) | S8 | 🟡 F-13 («la masa que se acelera es la de la pierna») · F-14 (Bolt no está en el texto) · ➕ serie por zancadas |
| §3.4.4 Pogo / pelota que rebota: TE = KE + PE + EE constante (Fig. 3.35) | S7 | ✅ |
| Saltito y Tabla 3.7 (bípedos vs cuadrúpedos) | — | ⬜ |

### §3.5 Salto

| Elemento | Diapositiva | Estado |
|---|---|---|
| §3.5.1 CM 1,0 → 0,65 → 1,05 m; ec. 3.48–3.60; W_b = 620 N (140 lb), ⟨N⟩ = 300 lb (1334 N), s = 0,43 m → H = 0,49 m, τ = 0,28 s; H = 2s²/(gτ²) | S9 | 🟡 F-15 (622/1342 N mezclados) · ➕ ec. 3.60 |
| Squat jump 0,2× → 0,4× isométrico; contramovimiento > isométrico (excéntrico) | S9 | 🟡 F-16 (sin cifras) |
| §3.5.2 Pértiga: ec. 3.61–3.62, h_CM 0,9 m, h_min 0,1 m, v 9,5 m/s → 5,4 m; récord 6,16 m (2014); despegue 13–15°; empuje de brazos | S10 | 🟡 F-18 (récord atribuido a «la pértiga aporta más») |
| §3.5.3 Altura vs longitud: ángulo de **pierna en el implante** 45–50° / 60–70°, v ≈ 7 m/s / hasta ≈ 11 m/s; Hill ec. 3.63–3.66 | S10 | 🟡 F-17 («despegar en un ángulo menor» — es al revés) |

### §3.6 Lanzar una pelota

| Elemento | Diapositiva | Estado |
|---|---|---|
| Tabla 3.8 músculos del lanzamiento; Fig. 3.44 modelos (a)–(d) | — | ⬜ |
| Ec. 3.67–3.85: τ = (M d_M − W_F d_F − W_B d_B) sin θ; I = ⅓ m_F L² + m_B L² = 1053 kg·cm²; L = 0,2 H ≈ 36 cm; m_F ≈ 2 kg; pelota 0,146 kg; 20 N/cm², M = 405 N, d_M = 4 cm; θ 135°→45°; v_B = L(πα)^½ | S11 | 🟡 F-19 (faltaban M, d_M, rango) |
| Casos a–d: a 2 in ⟨sin⟩ 0,707 (5,77 m/s, 12,9 mph); b 2 in ⟨sin⟩ 1 (6,86; 15,3); c 3 in (11,2; 25,0); d 3 in sin gravedad (11,9; 26,5) | S11 | 🟡 **F-20 etiquetas cambiadas** |
| Correcciones: 30–40 N/cm², ×2,6 otros flexores → ~45 mph; Koufax | S11 (apunte) | ➕ resumido |
| Seis fases (Fig. 3.49): preparación, zancada, armado, aceleración, desaceleración, seguimiento; pie a 0,50 s, suelta a 0,64 s; pelvis 550–700 °/s … hombro 6900–9800 °/s; 10 + 45 + 45 ≈ 100 mph | S12 | 🟡 F-21 («Balance» como fase 1) |
| ~200 J elásticos en el hombro (~54 % de 346 J); lanzador vs mariscal (0,42 vs 0,14 kg, 90–100 vs 50–60 mph) | S13 (apunte) | ✅ |
| §3.6.2 Potencia: ec. 3.86–3.93; τ = 36,45 N·m, Ω 15,7/31,4 rad/s → 570 W (0,76 hp) / 1140 W (1,5 hp); bíceps 2 in: 178/356 W | S13 | 🟡 F-22 (analogía «aspiradora» fuera del texto) · ➕ 178/356 W |

### §3.7 Bateo y movimientos de balanceo

| Elemento | Diapositiva | Estado |
|---|---|---|
| Péndulo doble A–B–C (Fig. 3.53); ¼ con muñecas fijas, ⅔ con quiebre; transferencia incluso sin torque de muñeca | S14 | ✅ |
| 2,5 kW = 1,3 (cabeza) + 0,5 (mango) + 0,7 (brazos); metabólica ×18; 250 W/kg → 10 kg de músculo; 4/7 bajo la cintura | S14 | 🟡 F-23 («astil»; faltaba ×18 y 4/7) |

### §3.8 Otros tipos de movimiento · §3.9 Modelado multisegmento

| Elemento | Diapositiva | Estado |
|---|---|---|
| Ciclismo (Figs. 3.54–3.56), clavados (Tabla 3.9, Figs. 3.57–3.59) | — | ⬜ |
| Modelo de dos segmentos, ec. 3.94–3.101 | — | ⬜ (mencionado como cierre en S11/S12) |

### §3.10 Colisiones del cuerpo humano

| Elemento | Diapositiva | Estado |
|---|---|---|
| §3.10.1 ec. 3.102–3.107: Δx = v²/(2a), F = m v/t, P = m v/(A t) | S16 | ✅ |
| Colisiones parcialmente elásticas: ec. 3.108–3.111, Tabla 3.10 (e) | S15 | ✅ (ec. 3.126 = 3.110 aplicada) |
| §3.10.2 Cabeza 3 kg, 1 m/s, 10 ms, 5 mm → 10 g, 300 N; salto 1 m: 4,5 m/s, 1 cm, 100 g, 7×10⁴ N; tibia 3 cm² → 230 N/mm² > UCS 170 MPa | S16 | ✅ |
| Supervivencia (8/12/15/35/9 m/s), no supervivible ≥ 175–200 g (Fig. 3.61) | S16 | 🟡 F-24 («tolerancia 175–200 g»; zonas «seguro/lesión/fractura» inventadas) |
| GSI ec. 3.115–3.116 (exponente 2,5), 1000 → 50 % fatal, ≈ 400 conmoción leve; HIC ec. 3.117 (1000 → 7 %, 1500 → 26 %, 3200 → ~100 %); ejemplo 50 mph, 10 ms: GSI 7800 (inelástica) / 44 000 (elástica); fútbol americano 98 g vs 60 g | S16 | 🟡 F-25 (`2.5` con punto) · F-26 (preset «Coche» inventado) · ➕ HIC y 50 mph |
| §3.10.3 Boxeo: m_brazo = 0,050 m_b, m_cabeza = 0,081 m_b; ec. 3.121–3.125; 0,236 / 0,382; 30 mph → 3,2 m/s, 51 g, 6,3 ms, GSI 117; Δx 0,5 cm → 332; 45 mph → 593; puño limpio 5,1 m/s, 1340 g, 0,39 ms, GSI 25 600; peso pesado GSI ≈ 400 | S17 | 🟡 F-27 («el guante no reduce la fuerza») |
| Kárate: 10–14 m/s, 4000 m/s², 5 ms, 2800 N | S17 (apunte) | ➕ |
| §3.10.4 Golpear pelotas: ec. 3.126; W_pelota = 5,125 oz, e = 0,55; v_bate = 63 − 0,39 W (ec. 3.130) → 38,5 oz y 95,1 mph con v_pelota = −80 mph; ec. 3.127 → 15 oz; punto dulce ⅔ (centro de percusión = nodo); jonrón 100 mph a ~35°; bate 50/58 mph | S15 | 🟡 F-28 (`W_b` choca con peso corporal) · ➕ 15 oz y 58 mph |
| §3.10.5 Carrera como colisión: 1,5 m/s, 12 mm → 187,5 m/s²; masas efectivas 1,26 / 2,10 / 3,91 m_b g; Tabla 3.11 | S7 (apunte) | ➕ Tabla 3.11 parcial (pista 240 kN/m, 12 J) |
| §3.10.6–7 Salto sobre superficies, masticación (200–400 N) | — | ⬜ |

### §3.11 Aceleración sostenida

| Elemento | Diapositiva | Estado |
|---|---|---|
| ±g_z, ±g_x, ±g_y, presión arterial 120/96/170 → 120/0/370 mmHg a +5 g_z | — | ⬜ (candidato natural para S16 o una S19 futura) |

### §3.12 Vuelo de la pelota · §3.13 Resumen

| Elemento | Diapositiva | Estado |
|---|---|---|
| Ec. 3.134–3.137 con arrastre F = ½ C_D A ρ v², C_D ≈ 0,45 (Re 10³–2×10⁵), crisis de arrastre ×¼ | S18 | ✅ |
| Óptimo 45° (vacío) vs ~35–40° (aire); «gran igualador» | S18 | ✅ |
| Regla empírica de **golf**: carry (yd) ≈ (3/2) v₀ − 105 con v₀ en ft/s | S18 | 🟡 **F-31** (presentada como regla general en pies) |
| Magnus: topspin ↓, backspin ↑, hoyuelos | S18 | 🟡 F-32 («50–130 rev/s» no está en el texto) |
| Tabla 3.12 balística, esquiador (ec. 3.138–3.139), rebote y rodadura (ec. 3.140–3.157) | — | ⬜ |
| §3.13 Resumen | S18 (flujo de conceptos) | 🟡 F-33 (faltaba «Bateo» en el flujo) |

### Inventario cuantitativo

| | En el `.tex` (§3.0–§3.12) | Cubierto por el deck | Notas |
|---|---:|---:|---|
| Secciones de primer nivel | 12 + resumen | 9 | faltan §3.1, §3.8, §3.9, §3.11 |
| Ecuaciones numeradas (3.1–3.157) | 157 | ≈ 45 | núcleo de cada modelo; MAS/Steiner y rebote fuera |
| Tablas (3.1–3.13) | 13 | 4 parciales (3.5, 3.10, 3.11, 3.12 indirecta) | Tablas 3.1–3.4, 3.6–3.9 ⬜ |
| Figuras | 86 | 0 imágenes; 18 lienzos + 1 escena 3D | el deck no muestra figuras del libro |

---

## 2 · Hallazgos de fidelidad (F) — detalle

| ID | Diap. | Antes | Libro (`.tex`) | Corrección |
|---|---|---|---|---|
| F-00 | 5–17 | Encabezados `3.4`…`3.11` desfasados (péndulo en «3.4», energética «3.5», pogo «3.6», salto «3.7», lanzar «3.8», golf «3.9», bateo «3.10», colisiones «3.11») | Péndulo §3.3.5–3.3.7, carrera §3.4, salto §3.5, lanzar §3.6, golf §3.7, bateo §3.10.4, colisiones §3.10 | Numeración por subsección real; contador «n / 19» ahora coincide con la barra inferior |
| F-01 | 1 | CM a 0,55 H → 11,7° / 3,9° | Prob. 3.1: masa uniforme → 0,50 H → **12,8° / 4,3°**; Fig. 3.8: real ≈ 0,58 H → 11,1° / 3,7° | Conmutador 0,50 H / 0,58 H en el lienzo y ambos resultados en la teoría |
| F-02 | 5,7,8,12,13,16 | `<strong>`, `<span class="tag">` impresos como texto | — | Reescrito en JSX |
| F-03 | 2 | 1400 N / 23 cm² ≈ 60 N/cm² | 1400 N → ≈ 40 N/cm²; pico ≈ 60 N/cm² por menor área | Cadena del libro (2 → 10 → 40 → 60 N/cm²); lienzo con ambos niveles |
| F-04 | 3 | «doble apoyo ~12 % del ciclo» (numéricamente compatible: 2 × 10 % de 62 %) | el libro lo expresa como el primer y último ~10 % **del apoyo** | Redactado como en el libro; el lienzo marca «DOBLE APOYO» y las barras muestran el desfase del 50 % entre piernas |
| F-05 | 4 | «3 mph requiere μ_s ≥ 0,15; el zapato entrega 0,17» | μ_s > 0,15 en general; **0,17 es el requerido a 3 mph** (Fig. 3.17) | Corregido; el lienzo distingue tres zonas: < 0,15 resbala · 0,15–0,17 solo paso lento · ≥ 0,17 camina a 3 mph |
| F-06 | 4 | hielo μ ≈ 0,05 | Tabla 3.5: hielo/hielo 0,1 (0,02 cinético a 4 m/s) | Corregido |
| F-07 | 4 | «umbral 0,15 de la tabla 3.5»; cartílago «10–30× menor» | el 0,15 sale del texto/Fig. 3.17; cartílago 0,003–0,01 (rodilla, Tabla 3.5: 0,005–0,02) | Corregido |
| F-08 | 5 | «T½ = 0,98 s ¡cerca del tiempo real!» | real ≈ 0,60 s (lento); bola-hilo 0,98 «aceptable», varilla 0,80 «mucho mejor», 2 segmentos 0,76 | Corregido + cifra real en lienzo |
| F-09 | 5 | Luna g/6, Marte g/3, v_max con R = L | Luna 0,17 g, Marte 0,4 g, R = 0,9 m | `g` y R del libro (R escala con H) |
| F-10 | 6 | «correr cuesta más que caminar a la misma rapidez» | no está; sí: recuperación ~70 % al caminar vs ~5 % (Fig. 3.26) | Sustituido |
| F-11 | 7 | «se pierden 100 J de energía metabólica» | 100 J de **energía cinética** por pisada; la metabólica es ~5× | Corregido |
| F-12 | 7 | slider «rigidez» sin efecto | pista sintonizada: +12 J, k ≈ 240 kN/m | Reemplazado por conmutador «suelo / pista sintonizada» con balance 35·0,93 + 17·0,80 (+12) J |
| F-13 | 8 | «la masa que se acelera es la de la pierna» | el cuerpo acelera zancada a zancada; el límite depende de m_leg porque cada pierna recién apoyada parte de 0 | Serie geométrica ec. 3.46 en teoría y barras v₁…v₁₀ en el lienzo |
| F-14 | 8 | «Usain Bolt … 23 mph» | «clase mundial en 100 y 200 m ≈ 10,4 m/s (2014)» | Atribución del libro |
| F-15 | 9 | W_b 622 N, ⟨N⟩ 1334 N en texto; 1342 N en lienzo | 140 lb = 620 N; 300 lb; neto 160 lb = 710 N | Unificado a 620 N / 1334 N (300 lb) |
| F-16 | 9 | contramovimiento sin cifras | squat 0,2× → 0,4× isométrico | Añadido |
| F-17 | 10 | «despegar en un ángulo menor para cubrir distancia»; columna «Ángulo» | longitud: pierna **más pronunciada** 60–70°; altura 45–50°; es el ángulo de la pierna en el implante | Corregido |
| F-18 | 10 | récord > modelo «porque la pértiga aporta más» | el saltador empuja con los brazos desde la pértiga vertical | Corregido |
| F-19 | 11 | sin M, d_M, rango de θ | M = 405 N, d_M = 4 cm, 135° → 45° | Añadido |
| F-20 | 11 | a «2 in sin g», b «3 in sin g», c «2 in con g», d «3 in con g» | a 2 in ⟨sin⟩ 0,707 · b 2 in ⟨sin⟩ 1 · c 3 in ⟨sin⟩ 1 · d 3 in sin gravedad | Tabla, `<select>` y lienzo corregidos |
| F-21 | 12 | fase 1 «Balance» | «movimiento de preparación»; el punto de equilibrio es t = 0 | Corregido; límites intermedios marcados como esquemáticos |
| F-22 | 13 | «rivaliza con una aspiradora» | — | Retirado; añadido 178/356 W (bíceps 2 in) |
| F-23 | 14 | «astil» | «mango del palo»; metabólica ×18 | Corregido |
| F-24 | 16 | zonas «seguro <25 g · lesión · fractura · fatal» | anclas: 60 g sin conmoción, 98 g conmoción, ≥ 175–200 g no supervivible | Barra G con anclas del libro + tensión tibial vs UCS 170 MPa |
| F-25 | 16 | `(a/g)^{2.5}` | 2,5 | `2{,}5` |
| F-26 | 16 | preset «Coche 16,7 m/s, 30 cm, 70 kg» | ejemplo del libro: cabeza a 50 mph (22,3 m/s), 10 ms (Δx = 11,2 cm) → GSI 7800 | Preset reemplazado; GSI inelástico en el lienzo |
| F-27 | 17 | «el guante no reduce la fuerza» | el guante baja a_decel (↑t_col, ↑A) y vuelve la colisión inelástica | Corregido |
| F-28 | 15 | `W_b` para el bate | `W_b` es peso corporal en el capítulo | `W_\text{bate}` |
| F-29 | todas | decimales `0,95` en KaTeX (se renderizaba «0, 95») | — | `0{,}95` |
| F-30 | barra | `v_B = L√(πα)` y similares con `_`/`^` crudos en badges y lecturas | — | Badges en KaTeX; lecturas dinámicas con subíndices Unicode o palabras |
| F-31 | 18 | «alcance con aire ≈ 3/2 v₀ − 105 (pies)» | pelota de **golf**, carry en **yardas**, v₀ en **ft/s** | Corregido |
| F-32 | 18 | golf «50–130 rev/s» | no aparece | Retirado |
| F-33 | 18 | flujo de resumen sin «Bateo»; apunte «dama de los juegos» | arrastre = «el gran igualador» | Corregido |

---

## 3 · Hallazgos técnicos (T)

| ID | Dónde | Problema | Corrección |
|---|---|---|---|
| T-01 | `useEngine.ts` | rAF global perpetuo: `redrawSlide()` a 60 fps aunque la diapositiva esté quieta | Repintado **bajo demanda** (`requestDraw` en slider/resize/fuentes); `useHarmonicClock` (dt ≥ 0, acotado a 0,1 s) **solo** mientras haya una animación activa en la diapositiva visible |
| T-02 | S5, S13 | péndulo y potencia dependían del reloj global (animaban «solos») | S5 con ▶/⏸ explícito; S13 sin amortiguación por reloj (valor exacto, sin bucle) |
| T-03 | S11, S14 | `throwPhase`/`golfPhase` nunca avanzaban (dibujo congelado) | ▶ «lanzar» (cámara lenta ×10, se detiene en la suelta) y ▶ swing |
| T-04 | S3, S7, S12 | estado `playing` local duplicado del flag del motor; S12 se paraba en 0,8 s con slider de máx. 0,64 | Un solo dueño (flags del motor + versión reactiva); slider S12 hasta 0,80 s |
| T-05 | `cap3.css` | redefinía `:root`, `html`, `body`, `*` **globalmente**; `body{user-select:none}` se filtraba al resto de la app | Eliminado; solo tokens propios `--c3-*`; `user-select:text` en `.theory`/`.apuntes`, `none` solo en controles y lienzos |
| T-06 | `cap3.css`, `ab.ts`, `sims.ts`, `Slide0`, `StabScene3D` | ~120 literales hex/rgba | Tokens de `:root` (`index.css` + `--c3-*`), `color-mix()` para tintes; lienzos leen la paleta con `getComputedStyle` una vez por repintado |
| T-07 | lienzos y CSS | rótulos de 7–11 px en canvas; 0,48–0,68 rem en DOM (≈ 8–11 px a 1280 px) | Piso de 12 px en `AB.text` y en todo `ctx.font`; `max(12px, …)` en CSS |
| T-08 | `Sim.tsx` | sin estado de reserva si `getContext('2d')` es `null` | `CanvasReserveState` (copia local del patrón E5-02 de cap2) |
| T-09 | `StabScene3D` | modelo visto de frente e inclinado **lateralmente** con `rotation.z = +θ` (sentido opuesto al CM 2D); puente por `window.__stab3d` | Vista de perfil (anterior → +x), `rotation.z = −θ`, proyección por `ref` (sin globales) |
| T-10 | `StabScene3D` | `<Canvas>` propio, `frameloop` continuo, y **mutaba `roughness/metalness` de los materiales cacheados del GLB** (compartidos con cap1) | `AnatomyStage` + `useAnatomyScene('body')` + `materials.bone` compartido; `frameloop="demand"` (redibuja solo al orbitar); ErrorBoundary local con `CanvasReserveState` |
| T-11 | `Capitulo3.tsx` | KaTeX re-escaneaba `document.body` + `setTimeout(400)` (LaTeX crudo visible) | `renderMathInElement` acotado a `<main>` en `useLayoutEffect` |
| T-12 | Slides | lecturas (`.readout`) con doble dueño (texto JSX + `textContent` del motor) | El motor es el único dueño (`aria-live="polite"`) |
| T-13 | `sims.ts` | 7 avisos `no-unused-expressions` (`i ? lineTo : moveTo`) | `if/else` |
| T-14 | `Slide0`, S18 | `<span onClick>` sin rol ni teclado | `<button type="button">` |
| T-15 | 1280×720 | pestañas de módulo desbordaban (Vuelo invisible); barra de controles tapaba el fondo del lienzo; 5 columnas de teoría con scroll oculto (hasta 90 px) | Sin la marca del libro ≤ 1440 px; controles bajo el lienzo; ritmo vertical ajustado y textos recortados — residuo ≤ 8 px |
| T-16 | `ab.ts` | `fmt()` recortaba ceros **enteros** con `/\.?0+$/`: 10 → «1», 100 → «1», 570 → «57» (lecturas de presión, G, mph…) y ocultaba «0,80 s» / «10,0 m/s» | Decimales fijos con coma; sin recortes |

---

## 4 · Estado de ejecución — 2026-11-26

Commits en `feat/cap3-auditoria`: `23caadf` (esta matriz) y `b6b1775` (correcciones).
Alcance respetado: solo `webapp/src/chapters/cap3/**` y este archivo; `App.tsx` intacto
(Cap. 3 sigue con `available: false`, accesible con `?preview=3`).

### 4.1 Verificación automática

| Comprobación | Resultado |
|---|---|
| `npm ci` | ✅ |
| `npx tsc -b` | ✅ 0 errores |
| `npx oxlint src/chapters/cap3` | ✅ 0 avisos (antes: 7 `no-unused-expressions`) |
| `npm run build` | ✅ (`Capitulo3` 115 kB / 33 kB gzip; el aviso de >500 kB es el chunk `three` compartido, preexistente) |
| KaTeX: `.katex-error` en las 19 diapositivas | 0 (se halló y corrigió `\text{kg·cm}` → `\cdotp` en rojo) |
| Texto visible con `\(`, `\[`, `x_y`, `^{` crudos | 0 |
| rAF por segundo con la diapositiva quieta (portada, S1 con el 3D cargado, S3) | **0** (antes 60 permanentes) |
| rAF animando (S3 ▶) / tras pausar / al terminar solas (S11, S12) | 60 / 0 / 0 |
| Desborde vertical de `.theory` a 1280×720 | ≤ 8 px (S1), resto 0–3 px |
| Errores de página (Playwright, 19 diapositivas + interacciones) | 0 |

### 4.2 Lo que NO se hizo (y por qué)

- **Brechas de alcance (§1, ⬜):** §3.1 (Tablas 3.1–3.4), §3.8, §3.9, §3.11 (aceleración
  sostenida), rebote/rodadura de §3.12 y las 86 figuras del libro. Añadirlas exige
  diapositivas nuevas (cambia `TOTAL` y los módulos); queda como propuesta: S19
  «Aceleración sostenida» (tolerancias ±g_z, presión arterial a +5 g_z) y una
  diapositiva de musculatura de la marcha con las Tablas 3.1–3.3.
- **Modelo de Magnus** de S18: el coeficiente `km = 0,008` es ilustrativo (el libro no da uno
  para béisbol); está rotulado «esquemático» en el lienzo.
- **Límites intermedios de las seis fases** (S12): el libro solo fija 0, 0,50 y 0,64 s; el resto
  se rotula como esquemático.
- **Curvas de energía** (S6) y **N(t)** (S9) son cualitativas (formas de las Figs. 3.20/3.32/3.38),
  no datos digitalizados.

### 4.3 Diapositivas con foco especial en la inspección visual (Vercel Preview, `?preview=3`)

| Prioridad | Diap. | Qué mirar |
|---|---|---|
| 🔴 | **S1 Estabilidad (3D)** | Encuadre del esqueleto de perfil en el proyector real (GPU real, no SwiftShader); que talón/dedos 2D caigan bajo el pie 3D al orbitar; que el pad «Controles 3D» expandido no tape los rótulos de ángulo; tiempo de carga del GLB. |
| 🔴 | **S11 Lanzar** | Animación «▶ Lanzar» (cámara lenta ×12): forma del bíceps y del arco 135°→45°; tabla resaltada al cambiar de caso. |
| 🟠 | S14 Golf | Pose del péndulo doble durante «▶ Swing» (es esquemática: brazos colgando ±70°, muñeca armada 90°). |
| 🟠 | S9 Salto | Rótulos `W` y `⟨N⟩` cerca de la curva N(t) en el extremo izquierdo/derecho del gráfico. |
| 🟠 | S8 Sprint | Rótulos «v final» y «clase mundial 10,4 m/s» al mover F por encima de ≈ 610 N (se cruzan las líneas). |
| 🟡 | S16 Colisiones | Preset «Cabeza 50 mph»: G > 250 sale de escala (se marca «↑»); comprobar legibilidad. |
| 🟡 | S1, S5, S18 | Teoría al límite de altura a 1280×720 (≤ 8 px de scroll): confirmar en el proyector. |
| 🟡 | Todas | Piso de 12 px: los rótulos de lienzo crecieron (antes 7–11 px); revisar solapes residuales. |
