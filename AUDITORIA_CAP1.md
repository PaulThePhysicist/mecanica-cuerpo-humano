# Auditoría técnica — Capítulo 1 (webapp)

**Fecha:** 2026-09-02
**Alcance:** `webapp/src/chapters/cap1/**` + config de build/tipos/lint que lo afecta.
**Método:** lectura de código + `vite build` + `tsc -b` + `oxlint` sobre el estado actual de `main`.

---

## Veredicto

El capítulo **funciona y es apto para producción** en el sentido de que no crashea, tiene
`ErrorBoundary` y fallback de WebGL en el 3D, y el contenido está bien. Como proyecto para
aprender a programar, el nivel es **decente para lo ambicioso que es** (17 slides, 2D + Three.js +
KaTeX), pero arrastra el ADN de haber sido portado desde un HTML de JS vanilla: hay **una capa
React fina por encima de un motor imperativo grande** (`sims.ts`, 4.535 líneas, `@ts-nocheck`)
y eso genera los tres problemas reales que sí valen la pena arreglar:

1. **El bundle inicial pesa 1,88 MB (512 KB gzip)** — la home descarga *todo* Three.js + cap1 aunque no lo abras.
2. **Un `requestAnimationFrame` global repinta el canvas 2D a 60 fps para siempre**, aunque la diapositiva esté quieta.
3. **Fuga de listeners** en `Capitulo1.tsx`: se acumulan `addEventListener` cada vez que pasás el ratón por un plano/región.

Ninguno es un bug que rompa la página; los tres son "malas optimizaciones por desconocimiento"
—exactamente lo que querías detectar— y los tres tienen arreglo acotado.

---

## Lo que está bien hecho (para que no todo sea palo)

- **`BodyScene.tsx`** es el archivo más sólido: `ThreeErrorBoundary` con `getDerivedStateFromError` + `componentDidCatch`, `checkWebGLSupport()` con UI de fallback real, `useGLTF.preload()`, `useMemo` para el clonado caro de la escena y el armado de pivotes. Eso es código correcto.
- El **GLB ya está optimizado** (34 MB → 6,1 MB, commit `642fe74`). Bien.
- **Design system** limpio en `index.css` (`:root` con tokens de color/tipografía/curvas coherentes).
- Detalle fino: `window.__damp()` hace amortiguación **independiente del frame-rate** con `dt` real de `performance.now()` — se ve igual a 60/120/144 Hz. Eso no es de principiante.
- Atención a accesibilidad: `AccessibleOrbitControls`, `aria-pressed`/`aria-current`/`role="img"` en varios sitios, `:focus-visible` global.
- Los capítulos 2–13 **sí** están lazy-loaded y bien separados en chunks.
- `console.*` aparece **1 sola vez** en todo cap1 — no hay basura de debug.

---

## P0 · Carga y rendimiento (arreglar primero)

### P0-1 · El bundle de entrada arrastra Three.js + todo el cap1

**Evidencia (`vite build` de hoy):**

| Chunk | Tamaño | gzip |
|---|---:|---:|
| **`index.js` (entrada)** | **1.880 KB** | **514 KB** |
| `Capitulo2.js` (lazy) | 474 KB | 106 KB |
| `Capitulo3–13.js` (lazy, c/u) | 109–147 KB | 27–35 KB |
| `index.css` | 57 KB | 14 KB |

> `(!) Some chunks are larger than 500 kB after minification` — el propio Vite lo avisa.

**Causa:** [`src/App.tsx:5`](webapp/src/App.tsx) importa `Capitulo1` **estático** (no `lazy()`),
mientras que los otros 12 sí son `lazy()`. `Capitulo1` arrastra `sims.ts`, los 17 slides, ~20
componentes Canvas y **`three` + `@react-three/fiber` + `@react-three/drei`**. Todo eso cae en el
chunk de entrada. Confirmado: `grep three@ dist/assets/index-*.js` da positivo, igual que
`human_body.glb` y `redrawSlide`.

Fue una decisión deliberada (commit `609f427`, "carga directa sin lazy-loading"), pero el
trade-off quedó al revés: **toda visita a la home paga 514 KB gzip de JS** (≈1,5–2 s de descarga
en 4G + parse de 1,88 MB) aunque nunca abra el capítulo. Es la causa de la pantalla negra larga
en el primer arranque.

**Arreglo (elegí uno):**
- **Mínimo:** volver a `const Capitulo1 = lazy(() => import('./chapters/cap1/Capitulo1'))` como los demás. La home baja a ~50–80 KB gzip; al entrar al cap se descarga su chunk con un spinner. Es el patrón que ya usás para cap2–13.
- **Mejor:** además, en `vite.config.ts` separar el vendor pesado en su propio chunk cacheable:
  ```ts
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          katex: ['katex'],
        },
      },
    },
  }
  ```
  Hoy no hay `manualChunks`, así que **cualquier cambio en un slide invalida el caché de los 1,88 MB enteros**.
- **Extra:** los slides con `<Canvas>` 3D (`Slide6`, mobility, etc.) pueden ser `React.lazy` dentro del propio cap1, para no cargar Three.js hasta que se llega a esas diapositivas.

---

### P0-2 · rAF global repintando el canvas 60 fps aunque no haya nada animando

**Ubicación:** [`src/chapters/cap1/useEngine.ts:50-63`](webapp/src/chapters/cap1/useEngine.ts)

```js
const loop = () => {
  redrawSlide(current.current);          // ← repinta TODO el canvas 2D del slide activo
  raf = requestAnimationFrame(loop);     // ← cada frame, para siempre
};
```

`redrawSlide()` ([`sims.ts:4520`](webapp/src/chapters/cap1/sims.ts)) llama al `draw*()` completo
del slide (limpiar + redibujar diagrama, texto, figuras…). Para los slides 4–15 —o sea **el núcleo
interactivo entero**— esto corre **60 veces por segundo de forma permanente**, aunque la
diapositiva esté 100 % estática, sin animación activa y sin que muevas ningún slider. En un portátil
son ~5–15 % de CPU constante y el ventilador girando por nada.

Lo irónico: los loops de animación *reales* (`startGLRaf`, `startJointsRaf`, `startMovementRaf`)
**sí** están bien hechos — comprueban `offsetParent` (visibilidad) y se autodetienen. Y ya existe
el mecanismo on-demand correcto: `EngineContext` + `engine.requestDraw()`. El rAF global es
redundante y es el que consume.

**Arreglo:** eliminar el `loop` permanente de `useEngine`. Disparar `redrawSlide()`:
- una vez al cambiar de slide (ya se hace en `Capitulo1.tsx:199`),
- en el `input`/`change` de cada slider (ya hay listeners para eso),
- y dejar rAF **solo** mientras un botón "Animar" esté activo (ya lo gestionan los `start*Raf`).

Con eso, una diapositiva quieta consume 0 % de CPU.

---

### P0-3 · Fuga de listeners en el efecto gigante de `Capitulo1.tsx`

**Ubicación:** [`src/chapters/cap1/Capitulo1.tsx:258-461`](webapp/src/chapters/cap1/Capitulo1.tsx)
(un `useEffect` de ~200 líneas)

- **No devuelve función de limpieza.**
- Dependencias: `[activeSlide, planeSel, regionSel]`. Pero `planeSel`/`regionSel` cambian **en `mouseenter`** (líneas 356-364, 382-389: los `onmouseenter` llaman `setPlaneSel(key)` / `setRegionSel(key)`).
- Cada vez que el efecto vuelve a correr, ejecuta de nuevo:
  ```js
  document.querySelectorAll('[data-joint]').forEach(tr => {
    tr.addEventListener('mouseenter', () => setJoint(j));   // ← se APILA
    tr.addEventListener('click', () => setJoint(j));         // ← se APILA
  });
  // idem [data-prop], [data-mobility], [data-somatotype], [data-allometry],
  //      [data-bone], [data-stevens], y los sliders glShoulder/antagSlider/...
  ```

Resultado: pasás el ratón por los planos de la slide 2 diez veces → cada fila de las tablas
interactivas tiene ~10 listeners `mouseenter` duplicados → cada hover dispara `drawProportions()`
10 veces, cada slider dispara `redrawSlide()` 10 veces. **Se degrada cuanto más usás el capítulo.**
El conteo lo confirma: 37 `addEventListener` vs 6 `removeEventListener` en cap1.

> Los listeners de dentro de `sims.ts` (`canvas.addEventListener` en L180-228) **no** fugan —
> usan el guard `canvas.__glHoverAttached`. El problema es específico de este efecto de React.

**Arreglo:** partir ese `useEffect` monstruo en efectos por-concern, cada uno con su `return () => { ... removeEventListener }`. Los handlers que sí se pueden asignar de forma idempotente (`el.onclick = ...`, que reemplaza en vez de apilar) déjalos; los `addEventListener` necesitan limpieza o un guard como el de `sims.ts`. Alternativa más limpia: **event delegation** — un solo listener en el contenedor del slide que mira `event.target.closest('[data-joint]')`.

---

## P1 · Prácticas y mantenibilidad

### P1-1 · TypeScript prácticamente apagado

- [`webapp/tsconfig.app.json`](webapp/tsconfig.app.json) **no tiene `strict`** (ni `strictNullChecks`, ni `noImplicitAny`), y `noUnusedLocals`/`noUnusedParameters` están en `false`. No hay `tsconfig` base que lo aporte (lo confirmé: `grep strict tsconfig*.json` = nada).
- [`sims.ts:1`](webapp/src/chapters/cap1/sims.ts) empieza con `// @ts-nocheck` → **4.535 líneas, el código más complejo del proyecto, sin ningún chequeo de tipos**.
- [`Capitulo1.tsx:31`](webapp/src/chapters/cap1/Capitulo1.tsx): `const { ... } = SIM as any` → todas las funciones de simulación entran como `any`.
- 62 ocurrencias de `: any` / `as any` / `<any>` en cap1. 6 `@ts-ignore`.

Para un proyecto cuyo objetivo es *aprender a programar bien*, este es el punto #1: estás
escribiendo TS con casi todas las redes de seguridad quitadas. `tsc -b` da exit 0, pero es una
señal débil con `strict` off y `@ts-nocheck` puesto.

**Arreglo (incremental, sin frenar todo):**
1. `"strict": true` en `tsconfig.app.json`. Ver cuántos errores salen fuera de `sims.ts`.
2. Arreglar los de los componentes React (suelen ser pocos y reveladores: nulls sin comprobar).
3. `sims.ts`: cambiar `@ts-nocheck` por `@ts-check` con `// @ts-expect-error` puntuales, o tiparlo por partes. No urge, pero anotalo como deuda consciente.

### P1-2 · `oxlint` configurado casi vacío — y ya está encontrando bugs que nadie lee

[`webapp/.oxlintrc.json`](webapp/.oxlintrc.json) solo activa 2 reglas (`rules-of-hooks`,
`only-export-components`). Aun así, `npx oxlint` sobre cap1 devuelve **50 warnings** que no
están conectados a ningún gate. Entre ellos, cosas reales:

- **`no-dupe-else-if` en `sims.ts:1513-1515`** → ver "Bug concreto" abajo.
- **`oxc(erasing-op)` ×7** (`sims.ts:535, 539, 542, 545, 564, 1402, 2313`): "expression will always evaluate to zero" — multiplicaciones por 0 / restas `x-x` que probablemente quedaron de un refactor. Revisar si son intencionales o errores de dibujo.
- `jointList`, `organPanel`, `componentsPanel` en `sims.ts`: **funciones declaradas y nunca usadas** (~180 líneas muertas).

**Arreglo:** añadir el preset recomendado y, sobre todo, **`react/exhaustive-deps`**:
```json
{
  "plugins": ["react", "typescript", "oxc"],
  "categories": { "correctness": "error" },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",
    "eslint/no-unused-vars": "warn"
  }
}
```
`exhaustive-deps` habría marcado el `termSel` que se lee en `Capitulo1.tsx:320,335` sin estar en las deps del efecto (closure obsoleto), y la familia de problemas del P0-3.

### P1-3 · Doble autoridad sobre el mismo nodo del DOM

En [`Slide8.tsx`](webapp/src/chapters/cap1/Slide8.tsx) el nodo `#info-text-c1` lo renderiza React
con `dangerouslySetInnerHTML` (L153-155) **y a la vez** `handleSelectParam` le escribe
`.innerHTML` a mano (L61-64). Lo mismo hace el efecto de `Capitulo1.tsx` con los `#info-text-*`.
Cuando React vuelve a renderizar, puede pisar el texto imperativo (o al revés) → parpadeos y
estados inconsistentes. Hay 110 `document.getElementById`/`querySelector` en cap1 y 10
`dangerouslySetInnerHTML`; varios se solapan.

**Arreglo:** que cada nodo tenga **un solo dueño**. Si el contenido es reactivo, que lo ponga
React vía estado y se elimina el `innerHTML =` manual. `dangerouslySetInnerHTML` con strings
estáticas del propio código es seguro hoy, pero es una puerta de XSS abierta el día que ese texto
venga de fuera.

### P1-4 · Los 17 slides están montados a la vez

[`Capitulo1.tsx:484`](webapp/src/chapters/cap1/Capitulo1.tsx) hace `SLIDES.map(...)` y renderiza
**todos**, alternando la clase `.active`. Es decir, cada componente Canvas y cada escena Three.js
de cada slide se instancia al entrar al capítulo. Se pasa `isActive` como prop para que se
autolimiten, pero el árbol montado es enorme.

**Arreglo:** renderizar solo el slide activo (± 1 vecino para precarga). `{SLIDES.map((S,i) => Math.abs(i - activeSlide) <= 1 && <S .../>)}` ya ayudaría mucho.

### P1-5 · `useMemo` con efecto secundario

[`Capitulo1.tsx:124-128`](webapp/src/chapters/cap1/Capitulo1.tsx): `isRevisit` calcula su valor
**mutando `seen.current`** dentro del cuerpo del `useMemo`. `useMemo` debe ser puro; React puede
re-ejecutarlo o descartarlo. Funciona por suerte. Moverlo a un `useEffect` o a un chequeo
explícito en render.

### P1-6 · Falta `<StrictMode>`

[`src/main.tsx`](webapp/src/main.tsx) monta `<App/>` sin `<React.StrictMode>`. En un proyecto
para aprender es justo lo que querés: en dev hace doble-invoke de efectos y destapa precisamente
los bugs de limpieza como el P0-3. Es gratis (solo dev).

### P1-7 · CSS: KaTeX cargado dos veces + fuentes por `@import`

[`src/index.css:1-2`](webapp/src/index.css):
- `@import` de KaTeX desde jsdelivr **además** del `import 'katex/dist/katex.min.css'` que ya está en `main.tsx` (bundleado). Se descarga dos veces. Quitar el `@import`.
- Google Fonts por `@import` dentro del CSS = bloqueante y en serie (el navegador descarga `index.css`, lo parsea, y *recién ahí* descubre las fuentes). Moverlo a `<link>` en `index.html`, donde ya tenés los `preconnect` esperando.

---

## P2 · Higiene

- **JSX muerto:** `Slide8.tsx:160` → `{false && <HudPanel …>}` con ~140 líneas de panel completo detrás de `false &&`. Tree-shakeado en runtime, pero es ruido en el archivo y mantiene el import de `HudPanel`. Buscar el patrón en el resto de slides.
- **Globals en `window` al importar:** `sims.ts:28-56` asigna `window.__stage`, `window.go`, `window.__damp` en el top-level del módulo. Contamina el namespace global y corre como efecto secundario del import.
- **Singletons mutables de módulo** en `sims.ts` (`glMode`, `glAnimationActive`, `glRaf`, `_glDisp`…) sobreviven a desmontar/remontar el capítulo. Si salís al índice y volvés a entrar, conservan el estado anterior. No crashea, pero es fuga de estado.
- **`<Canvas>` sin `dpr={[1, 2]}`** ([`BodyScene.tsx:538`](webapp/src/chapters/cap1/BodyScene.tsx)): en un móvil de 3× DPR renderiza a resolución 3× completa.
- **`useFrame` en `AnatomyModel`** ([`BodyScene.tsx:339`](webapp/src/chapters/cap1/BodyScene.tsx)) resetea 7 grupos de rotación **cada frame** aunque `jointMotion === null`. Combinado con el `frameloop="always"` por defecto de r3f (no se usa `frameloop="demand"` en ningún `<Canvas>` de cap1), la escena 3D nunca queda en reposo.
- **`App.tsx`:** `import React` sin usar (runtime `react-jsx`); hover de las tarjetas hecho con mutación imperativa de `e.currentTarget.style` en vez de `:hover` en CSS; 12 `lazy()` para capítulos que hoy son inalcanzables (`available: false`).
- **Sin tests, sin CI, sin LICENSE.** Para un proyecto personal está bien, pero un GitHub Action de ~10 líneas (`tsc --noEmit` + `oxlint`) evitaría que estas cosas vuelvan a entrar sin que te enteres.
- **Funciones de dibujo gigantes** en `sims.ts`: `drawJoints` ≈ 590 líneas, `drawGL` ≈ 500, `drawMovement` ≈ 230. Difíciles de razonar. No urge partirlas, pero es donde se esconden los `erasing-op` y el `no-dupe-else-if`.

---

## Bug concreto encontrado

**`sims.ts:1513-1516` — la articulación "pivote / radiocubital" (slide 5) no se dibuja.**

```js
} else if (currentJoint === 'pivot') {
} else if (currentJoint === 'pivot') {   // ← vacío
} else if (currentJoint === 'pivot') {   // ← vacío
} else if (currentJoint === 'pivot') {   // ← vacío
  // 🔩 Pivote (1D) -> Radiocubital Proximal   ← código real, INALCANZABLE
  subLabel = 'Articulación Radiocubital Proximal (Trocoide)';
  ...
```

Cuatro ramas idénticas; gana la primera (vacía), así que al seleccionar "pivote" en la tabla de
articulaciones el `draw` no pinta ese caso. `oxlint` ya lo marca (`no-dupe-else-if`,
"its branch will never be executed") — nadie lo vio porque `npm run lint` no está en ningún gate.

**Arreglo:** borrar las tres líneas 1513-1515. Verificar visualmente el pivote en la slide 5
después.

---

## Plan de acción sugerido (orden)

| # | Acción | Esfuerzo | Impacto |
|---|---|---|---|
| 1 | Borrar `sims.ts:1513-1515` (bug del pivote) | 2 min | corrige feature rota |
| 2 | `Capitulo1` a `lazy()` + `manualChunks` para `three`/`katex` en `vite.config.ts` | 30 min | home de 514 KB → ~60 KB gzip |
| 3 | Quitar el rAF permanente de `useEngine.ts`, dibujar on-demand | 1–2 h | CPU en reposo ~10 % → 0 % |
| 4 | Partir el `useEffect` de `Capitulo1.tsx:258` en efectos con cleanup (o delegation) | 2–3 h | corta la fuga de listeners |
| 5 | `"strict": true` en `tsconfig.app.json`; arreglar errores fuera de `sims.ts` | 2–4 h | red de seguridad de tipos |
| 6 | `.oxlintrc.json` con `correctness` + `exhaustive-deps`; GitHub Action `tsc + oxlint` | 1 h | evita regresiones |
| 7 | `<StrictMode>` en `main.tsx` + quitar `@import` duplicado de KaTeX | 15 min | destapa bugs de efectos; -1 descarga |
| 8 | Renderizar solo el slide activo ± 1 en vez de los 17 | 1–2 h | menos memoria / arranque |
| 9 | Limpieza: JSX muerto, funciones sin usar de `sims.ts`, `dpr` en `<Canvas>` | 1 h | higiene |

Los puntos **1–4 son los que responden a tu pregunta** ("problemas de carga, malas
optimizaciones"). Del 5 en adelante es "construir buenos hábitos", que era la otra mitad.

---

## Estado de ejecución — 2026-09-02

Aplicado y verificado (build `npm run build` OK con `strict`; navegación por los 17 slides en
navegador, canvases 2D pintando, sin errores nuevos en consola). **14 archivos** — solo `cap1/` +
config compartida. **cap2–13 sin tocar. Nada commiteado** (queda en el working tree para que lo revises).

| # | Estado | Nota |
|---|---|---|
| 1 | ✅ | `sims.ts:1513` — dupe quitado. Ojo: `drawJoints` es **código muerto** (slide 5 usa `SynovialJointCanvas` 3D), así que es limpieza, no un bug en vivo. |
| 2 | ✅ | `App.tsx` → `lazy(Capitulo1)` + `vite.config.ts` `manualChunks`. **Entry `index.js`: 1,88 MB → 12,8 KB** (gz **514 KB → 5 KB**). `three` (328 gz) y `katex` (78 gz) en chunks propios cacheables. |
| 3 | ✅ | `useEngine.ts` — loop 60 fps permanente → ráfaga de ~30 frames tras cada nav/resize/`requestDraw`, luego para. En reposo: 0 rAF. |
| 4 | ✅ | `Capitulo1.tsx` — `bindOnce` (guard por nodo) en todos los `addEventListener`; `termSel` añadido a las deps. |
| 5 | ✅ | `tsconfig.app.json` `"strict": true`. Blast radius real = **0 errores** fuera de `sims.ts` (`@ts-nocheck`). |
| 6 | ✅ | `.oxlintrc.json`: `categories.correctness` + `react/exhaustive-deps`. `.github/workflows/ci.yml` nuevo (tsc bloqueante, lint no-bloqueante, build). |
| 7 | ✅ | `<StrictMode>` en `main.tsx`. Reveló que las module-tabs se duplicaban (5→10) en el doble-montaje → efecto reescrito idempotente + cleanup. `@import` KaTeX duplicado quitado; fuentes Google a `<link>`. |
| 8 | ✅ | `Capitulo1.tsx` — solo monta slide activo ±1. De ~15 canvases/contextos WebGL a ~3. |
| 9 | ✅ (parcial) | `Slide8.tsx`: bloque muerto `{false && <HudPanel>}` (~140 líneas) + import borrados. `BodyScene.tsx`: `dpr={[1,2]}`, `useFrame` sale temprano si no hay articulación seleccionada. Dead code de `sims.ts` (`jointList`/`organPanel`/…) y los 7 `erasing-op` **NO** tocados: sin baseline visual, cambiar geometría de dibujo a ciegas es justo el riesgo que querías evitar. |
| — | ✅ extra | **Bug en vivo hallado durante la verificación:** `BMICalculatorCanvas.tsx` lanzaba `IndexSizeError` (radio de arco negativo) al dibujar sin layout (slide oculta / en transición). Guard `if (W < 8 || H < 8)`. |

**`isRevisit`**: el `useMemo` con efecto ya está corregido (se lee en render + `seen.add` en `useEffect`).

**No fixable desde el código:** el flood de `THREE.WebGLRenderer: context could not be created` que
ves en el panel Browser de Claude Code es un tope de contextos WebGL del entorno, no de la app
(pasa igual en `main` sin mis cambios — verificado con `git stash`). La ventana ±1 lo **mitiga**:
con 3 slides montados en vez de 17, los slides 3D ya obtienen contexto.
