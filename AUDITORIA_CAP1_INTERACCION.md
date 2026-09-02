# Auditoría de interacción y animaciones — Capítulo 1

**Fecha:** 2026-09-02 · **Método:** recorrido manual slide por slide en el dev server
(navegador conducido) + lectura del código de cada `Slide*.tsx` y su `*Canvas.tsx`.
**Objetivo del usuario:** ¿los botones/sliders manejan el canvas de forma correcta y
anatómicamente coherente? ¿el canvas apoya de verdad al texto? ¿qué pulir? — para dejar cap1
como **estándar** de los demás capítulos.

> Nota de entorno: el panel Browser de Claude Code tiene un tope de contextos WebGL, así que
> las 8 diapositivas 3D (1, 2, 3, 4, 5, 6, 7, 10) a veces renderizan en blanco aquí. Eso es del
> entorno, no del código (verificado con `git stash`). Para esas, la auditoría se apoya en el
> código de animación/interacción, que sí es legible y evaluable.

---

## Veredicto

El capítulo tiene **muy buen material y varias diapositivas ejemplares** (8, 9, 11, 6). La base
está. Lo que impide que sea "un estándar" ya son **patrones repetidos** que hay que resolver una
vez y aplicar en todas:

1. **Fiabilidad del canvas** — el bucle de render de 4 canvas del módulo D (12–15) moría para
   siempre si `getContext` fallaba un frame o el canvas dibujaba sin layout. **Corregido** en
   esta sesión; hay que volverlo regla.
2. **Período "sin asentar" al entrar a un slide** — 1–3 s de canvas en blanco / LaTeX crudo
   visible / saltos de layout en cada visita nueva. Es lo que más ensucia la experiencia.
3. **Doble autoridad sobre el apunte** — cada slide escribe su texto rico en `#info-text-*` y
   `Capitulo1.tsx` lo pisa con su versión corta. El texto local del slide es **código muerto**.
4. **Affordances duplicadas** — el mismo control aparece 2–4 veces por slide (píldoras +
   chips + panel HUD + barra inferior). Infla la interfaz y multiplica el cableado.
5. **Controles colapsados por defecto** — sliders y presets escondidos tras un `⚙` diminuto.
6. **Encuadre 3D** — modelos pequeños, descentrados, con sopa de etiquetas encima del cuerpo.
7. **Sin helper de easing/timing compartido** — cada canvas reinventa su rAF y su suavizado.

---

## Lo que ya funciona bien (los patrones a replicar)

- **Slide 9 · Proporciones** — el modelo a seguir. Tabla de fracciones L/H arriba, y el canvas
  las hace concretas: figura con acotaciones por segmento, altura total, fórmula `0,259·H`, y
  una **barra Σ apilada** a la derecha. Al pasar el cursor por una fila de la tabla se resalta
  el segmento en la figura **y** su tramo en la barra. Eso es "el canvas apoya al texto".
- **Slide 6 · Tipos de movimiento** — anatómicamente el más sólido. Cada tipo (flexión,
  extensión, abd/aducción, rot. medial/lateral, pron/supinación, circunducción) mapea a la
  rotación articular correcta **y activa el músculo agonista correcto** (deltoides medio en
  abducción, subescapular en rot. interna, infraespinoso en externa, pronador/supinador +
  bíceps en supinación). La **cámara se recoloca por movimiento** para encuadrar el gesto.
  Easing sinusoidal `(sin+1)/2` = orgánico.
- **Slide 8 · Hombre estándar** — figura viva (torso que respira, ECG, órganos) + panel de
  constantes + fórmulas Du Bois/Kleiber en KaTeX. Sliders masa/estatura recalculan todo.
- **Slide 11 · Somatotipos** — 3 figuras (endo/meso/ecto) + somatocarta de Heath-Carter con el
  punto graficado. Seleccionar un somatotipo resalta la figura y mueve el punto.
- **Slide 5 · Articulaciones sinoviales** — 6 tipos de articulación, cada uno con su anatomía
  dedicada y el número de GL correcto (bisagra 1, trocoide 1, condílea 2, esferoidal 3…).

---

## Hallazgos transversales (resolver una vez → aplicar a todos los caps)

### A · Fiabilidad · el bucle de render no debe morir nunca — **CORREGIDO en cap1**

`StevensCanvas`, `AllometryCanvas`, `BoneScaleCanvas`, `BMICalculatorCanvas` tenían:

```js
const ctx = canvas.getContext('2d');
if (!ctx) return;          // ← sale de render() sin volver a pedir requestAnimationFrame
```

Si `getContext` devolvía `null` un frame (carrera de doble-montaje de StrictMode) **o** el
cuerpo lanzaba `IndexSizeError` por dibujar con `rect = 0×0` (radio de arco negativo), el rAF
se cortaba y **el canvas quedaba congelado para siempre**. Es lo que hacía que las slides
12–15 aparecieran en blanco al saltar a ellas por los puntitos de navegación.

**Arreglo aplicado** (4 archivos): guard de tamaño + `getContext` que **reprograman el frame**:

```js
if (W < 8 || H < 8) { rafRef.current = requestAnimationFrame(render); return; }
...
const ctx = canvas.getContext('2d');
if (!ctx) { rafRef.current = requestAnimationFrame(render); return; }
```

Verificado: saltando directo a 12/13/14/15, canvas 616×308, `fill 100%`.

**Regla para el estándar:** todo bucle de canvas reprograma `requestAnimationFrame`
**incondicionalmente** (al principio del callback, o en `finally`), y no dibuja si `W<8||H<8`.
Los canvas que ya delegan el dibujo a `sims.ts` en un `loop` que siempre reprograma
(`StandardHumanCanvas`, `ProportionsCanvas`, `SomatotypeCanvas`, `MobilityCanvas`) nunca
fallaron — por eso los slides 8/9/11 son sólidos. Ese es el patrón bueno.

### B · El período "sin asentar" al entrar a un slide

En cada visita nueva a un slide se ve, durante 1–3 s: canvas en blanco o con el buffer a 300×150
estirado y borroso, el LaTeX del `eq-block` como texto crudo (`f = a\,m_b^\alpha`) junto al
render, y saltos de layout mientras corre la animación `fadeUp`. Se ve claramente en 12 y 15.

Causas: (1) la animación `fadeUp` de `.slide.active` corre mientras el canvas mide `rect` →
mide 0 o transformado; (2) `renderKatex()` re-escanea `document.body` con un `setTimeout(…, 300)`,
así que hay una ventana donde el TeX está sin renderizar; (3) el canvas no re-mide tras
asentarse (ahora sí, con el arreglo A).

**Para pulir:** montar el vecino ±1 ya está (de la auditoría previa), pero KaTeX y la primera
medición esperan a `.active`. Opciones: renderizar KaTeX del slide al montarse (no al activarse);
retrasar `fadeUp` hasta el segundo frame; o un esqueleto sutil los primeros 400 ms. Cualquiera
que sea, **definirlo una vez** en el shell del capítulo.

### C · Doble autoridad sobre `#info-text-*` (el "apunte de cátedra")

`Slide1.tsx` tiene `TERM_DESCRIPTIONS` (11 textos anatómicos cuidados). `Slide4.tsx` tiene
`JOINT_DESCRIPTIONS`. Pero `Capitulo1.tsx` (efecto de `[data-highlight]`) **también** enlaza un
`onclick`/`onmouseenter` a los mismos nodos que escribe desde su propio mapa `DESCRIPTIONS`, y
**corre después**. Resultado verificado en slide 1: al hacer clic en "z Superior/Inferior" se ve
*"Eje z: dirección superior / inferior (cefálico / podálico)."* (versión corta de `Capitulo1`),
no el texto largo de `Slide1.TERM_DESCRIPTIONS`. **Todo el texto local de los slides es código
muerto.**

**Para el estándar:** un único dueño del apunte. O el slide es dueño de su `#info-text` vía
estado React (y `Capitulo1` no toca esos nodos), o `Capitulo1` centraliza **todas** las
descripciones y los slides no definen las suyas. Recomendado: **el slide**, porque el texto vive
al lado del contenido que explica.

### D · Affordances duplicadas

- **Slide 1**: los términos son píldoras en la tarjeta 1 **y** en la tarjeta 2 (con `coord-r-proximal`
  y `coord-rho-superficial` repetidos entre tarjetas) **y** filas en el panel HUD. `coord-r-proximal`
  tiene **3 sitios clicables** en una pantalla.
- **Slide 2**: "Sagital / Coronal / Transverso" como filas de teoría **y** como botones `▶` en la
  barra inferior.
- **Slide 4**: el modo Pierna/Brazo se puede fijar desde **4** sitios (2 píldoras + 2 chips de
  `concept-flow`).

Elegí **un** lugar canónico por tipo de control: selección conceptual → en la teoría (junto al
texto); parámetros continand (sliders, zoom, reset, animar) → en la barra del visor. El HUD
sobrante quítalo o hazlo solo-lectura.

### E · Controles colapsados por defecto

`prof-controls` / "Controles 3D" arrancan colapsados (`data-default-collapsed`, y el toggle que
añade `Capitulo1.tsx`). En slides 1, 4, 5 los sliders y presets están **ocultos** hasta que el
usuario encuentra el `⚙`. Para una clase, el control primario del slide debería estar visible de
entrada; colapsable sí, colapsado no.

### F · Encuadre 3D

- **Slide 1**: las etiquetas de ejes (`Anterior/Ventral`, `← Izquierda`, `Posterior/Dorsal`, `+x`,
  `+y`, `+|y|`) se amontonan **encima del torso** del esqueleto — ilegible.
- **Slide 4**: el modelo de la pierna sale **pequeño y en la esquina inferior derecha** del canvas.
- **Slide 4 (2D Atlas)**: "BÍCEPS BRAQUIAL" pisa "HÚMERO"; "Codo / Pivote / Muñeca" se solapan.

Necesita: un encuadre estándar (el modelo llena ~70% del alto, centrado), etiquetas con
`leader lines` que salgan del cuerpo hacia un margen, y colisión de etiquetas resuelta (o menos
etiquetas simultáneas). Slide 6 ya recoloca la cámara por gesto — generalizar esa idea.

### G · Sin helper de easing/timing compartido

Cada canvas reinventa el rAF y el suavizado: slide 4 `sin(t·1.6)`, slide 6 `(sin(t·1.8)+1)/2`
para casi todo **pero sawtooth `(t·0.35)%1` para circunducción** (salta al reiniciar), slides
8–11 usan `window.__damp` (suavizado exponencial), BodyScene usa `(sin(t·0.72−π/2)+1)/2`. El
codebase ya tiene `window.__damp` (frame-rate independiente, bien hecho) pero infrautilizado.

**Para el estándar:** un módulo `anim.ts` con `damp()`, `easeInOut()`, un `useRafLoop(cb)` que
ya trae el guard de tamaño y el reprogramado del hallazgo A, y ROMs anatómicos como constantes
compartidas. Circunducción debe usar un ciclo continuo (`sin`/`cos` de la fase), no sawtooth.

### H · El 3D no muestra fallback cuando el contexto se pierde a media carga

`BodyScene` tiene `ThreeErrorBoundary` + `checkWebGLSupport()`, pero solo cubren "WebGL no
soportado" o un throw en el árbol React. Si el `<Canvas>` monta y **luego** no consigue contexto
(entorno saturado), queda un canvas negro/vacío sin mensaje. Añadir un `onCreated`/timeout que,
si no hubo primer frame en ~2 s, muestre el fallback.

### I · Tipografía del canvas

Varios canvas (9, 12, 13, 15) rotulan con una **fuente pixel-mono** que choca con el `Source
Serif 4` elegante del resto. Unificar a `--sans`/`--mono` del design system.

---

## Notas por diapositiva

| # | Slide | Interacción | Coherencia anatómica | A pulir |
|---|---|---|---|---|
| 1 | Direcciones/coords (3D) | términos → aíslan el vector; hover y clic OK | ejes x/y/z y r/ρ correctos | sopa de etiquetas sobre el torso · 3 sitios por término · apunte local muerto (C) |
| 2 | Planos (3D) | plano → se resalta/aísla | sagital/coronal/transverso OK | botones ×2 (D) · en blanco si el contexto WebGL falla |
| 3 | Regiones (3D) | región → tiñe los huesos que la componen | `REGION_BONES` mapea bien | (no verificable visualmente aquí) |
| 4 | Grados de libertad (3D+2D) | modo 6/7, vista 3D/2D, capas Atlas/Huesos/Músculos, sliders por GL, Animar | 6 GL pierna / 7 GL brazo, pivote radiocubital = 7.º GL: correcto | modelo diminuto en la esquina · etiquetas 2D colisionan · modo fijable desde 4 sitios · sliders colapsados |
| 5 | Sinoviales (3D) | 3 presets (Ext 0° / Funcional 90° / Flexión 135°), Animar, sliders a1–a3 | 6 tipos, GL por tipo correcto, cámara por tipo | controles colapsados · en blanco si falla WebGL |
| 6 | Tipos de movimiento (3D) | 8 gestos, slider progreso, velocidad, Animar (auto-play) | **ejemplar** — gesto + músculo agonista + cámara | circunducción con sawtooth (G) · auto-play puede sorprender |
| 7 | Antagonistas (3D) | toggle "Ojo 3D (6 músculos)" ↔ "Brazo y Palanca", "Test en H" | (par agonista/antagonista) | canvas quedaba a 300×150 sin dimensionar (mismo patrón A, revisar `AntagonistCanvas`) |
| 8 | Hombre estándar (2D) | sliders masa/estatura, 6 constantes clicables, Reset | Du Bois, Kleiber 3/4, volemia 7,5%: correcto | HUD lateral tapaba la figura (bloque muerto ya quitado) |
| 9 | Proporciones (2D) | hover fila ↔ figura ↔ barra Σ; slider estatura | fracciones L/H de Drillis-Contini: correctas | **modelo a seguir** · acotaciones apretadas a la izquierda · fuente pixel |
| 10 | Movilidad (3D+2D) | tabla de articulaciones ↔ arco ROM 3D + canvas 2D | ROM en el rango correcto salvo: tobillo dorsi 35°/plantar 38° (deberían ~20/50) y muñeca ext 99° (alto) | dos visualizaciones a la vez compiten · ROMs a revisar |
| 11 | Somatotipos (2D) | seleccionar endo/meso/ecto → figura + somatocarta | Heath-Carter, ratio hombro/cadera: correcto | mini-carta se solapa con los pies de la figura |
| 12 | Alometría (2D) | selector de curva (BMR, área, FC, cerebro, vida, músculo), transición animada, slider masa | exponentes de Kleiber (0,75 / 0,65 / −0,25…): correctos | LaTeX crudo visible ~2 s al entrar (B) · fuente pixel |
| 13 | Escalado óseo (2D) | checkbox isométrico ↔ alométrico (w ∝ L^1.5), Rata/Caballo/Elefante | w/L ≈ 1 / 1,7 / 4: correcto | canvas moría al saltar aquí (A, corregido) |
| 14 | Índices (2D) | sliders masa/estatura, dial IMC, disco Du Bois, tubo densidad, barra composición | IMC, Du Bois, ρ, % graso por sexo: correctos | lanzaba `IndexSizeError` (corregido con guard de tamaño) |
| 15 | Ley de Stevens (2D) | slider exponente n (0,1–4), 7 modalidades sensoriales clicables | exponentes de Stevens (brillo 0,33 · sonoridad · dolor ~3,5): correctos | **quedaba en blanco al saltar aquí (A, corregido)** · colisión de etiquetas en el eje |
| 16 | Resumen | — | — | — |

---

## "cap1 como estándar" — checklist para construir los demás capítulos

**Canvas / animación**
- [ ] Un `useRafLoop(draw)` compartido: reprograma el frame **siempre**, no dibuja si `W<8||H<8`, cancela en cleanup.
- [ ] `anim.ts` con `damp()` (ya existe como `__damp`), `easeInOut()`, y ROMs anatómicos como constantes.
- [ ] Ciclos continuos (`sin`/`cos` de fase), nunca sawtooth con salto.
- [ ] Encuadre estándar: el sujeto ocupa ~70% del alto, centrado. Cámara recolocable por sub-tema (como slide 6).
- [ ] Etiquetas fuera del cuerpo con leader lines + resolución de colisiones. Límite de N etiquetas visibles.
- [ ] Rótulos del canvas con `--sans`/`--mono` del design system.
- [ ] 3D: fallback también si no hay primer frame en ~2 s, no solo si WebGL no existe.

**Interacción**
- [ ] Un solo lugar canónico por control (selección conceptual → teoría; parámetros → barra del visor). Sin HUD duplicado.
- [ ] El control primario del slide **visible** de entrada (colapsable, no colapsado).
- [ ] Un único dueño de `#info-text-*` (recomendado: el slide, vía estado React). `Capitulo1` no pisa nodos de slides.
- [ ] Todo botón/slider: label = comportamiento, y respuesta del canvas anatómicamente correcta (revisar músculo agonista, eje del plano, sentido del ROM).
- [ ] Feedback de estado activo consistente (`.active` / `aria-pressed` / `aria-selected`) en todas las affordances.

**Entrada al slide**
- [ ] KaTeX se renderiza al **montar** el slide (vecino ±1), no al activarse.
- [ ] Sin salto de layout ni contenido "crudo" visible: retrasar `fadeUp` o mostrar esqueleto ~400 ms.

**Datos**
- [ ] ROMs y exponentes citando tabla/figura de Herman. Revisar los de slide 10 (tobillo, muñeca).

---

## Estado de ejecución — 2026-09-02

Aplicado y verificado en navegador (recorrido de los 17 slides, sin errores nuevos, `npm run
build` OK). **Solo `cap1/` + config compartida. cap2–13 sin tocar. Nada commiteado.**

| Hallazgo | Estado | Qué se hizo |
|---|---|---|
| **A** · bucle rAF que moría | ✅ | `StevensCanvas`, `AllometryCanvas`, `BoneScaleCanvas`, `BMICalculatorCanvas`: `if(!ctx)` y el guard de tamaño ahora **reprograman** el frame. Revisados los demás bucles — los que delegan a `sims.ts` (`StandardHumanCanvas`, `Proportions`, `Somatotype`, `Mobility`) ya reprograman siempre. |
| **B** · LaTeX crudo visible al entrar | ✅ | `renderKatex(root)` acotado a la diapositiva + movido a `useLayoutEffect` (antes de pintar). Verificado: 0 frames con LaTeX crudo al entrar a slide 12. |
| **E** · controles colapsados por defecto | ✅ | `Capitulo1.tsx`: por defecto **expandidos** (salvo `data-default-collapsed`, que mantienen los 3D de terminología 1/2/3). Además el estado inicial ya **no se persiste** en localStorage, solo la elección explícita del usuario. |
| **D** · affordances duplicadas | 🟡 parcial | Slide 4: quitados los chips `concept-flow` (duplicaban las píldoras de modo). Slides 1 y 2: quitado el `HudPanel` (subconjunto estricto de las píldoras de teoría). **Slides 3, 5, 6, 7: el `HudPanel` NO es duplicado — es el panel de control primario** (selección de región / tipo articular / gesto / mirada); quitarlo sin reubicar sus controles regresaría esas slides. Queda para la ronda con baseline visual. |
| **KinematicsAtlas2D** (atlas 2D de slide 4) | ✅ | Dibujaba una sola vez; si la 1.ª pintura era con el contenedor colapsado quedaba a 200×200. Añadido `ResizeObserver` → redibuja al cambiar de tamaño. Verificado: 717×391. |
| **C** · doble autoridad sobre `#info-text-*` | 🟡 parcial | Slide 1: borrado el `TERM_DESCRIPTIONS` local y su escritura de `innerHTML` (era pisado por `Capitulo1`); ahora `Capitulo1.DESCRIPTIONS` es la única fuente. Slide 4: su `JOINT_DESCRIPTIONS` **sí** es la fuente viva (Capitulo1 no toca claves de articulación) — se deja. |
| **F** · encuadre 3D / sopa de etiquetas | ⏸️ diferido | Necesita iteración visual (baseline `shoot-slides.mjs`). Es código 3D difícil de verificar en el panel Browser. |
| **G** · sawtooth de circunducción | ⏸️ descartado | En `MovementCanvas` la pose se deriva de `sin(progress·2π)` — es **periódica y continua** en el ángulo; no hay salto visible. Solo queda la inconsistencia de tener dos fórmulas de `progress`; bajo valor. |
| **H** · fallback 3D si no hay 1.er frame | ⏸️ diferido | Es específico del tope de contextos del panel Browser; añadir un timeout a producción arriesga falsos positivos en equipos lentos. |
| **I** · tipografía pixel en canvas | ⏸️ descartado | Las fuentes son las del design system (`Karla` / `JetBrains Mono`); el aspecto "crunchy" era por el buffer del canvas mal dimensionado — resuelto vía A/B/`ResizeObserver`. |
| Slide 10 · ROMs (tobillo, muñeca) | ⏸️ flag | Son datos de tabla de Herman; se marca para revisar contra la fuente, no se cambia a ciegas. |

**Lo que falta (ronda con baseline visual):** consolidar los `HudPanel` de 3/5/6/7 en un lugar
consistente; encuadre y etiquetas 3D (F); revisar ROMs de slide 10.
