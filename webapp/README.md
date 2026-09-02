# La Física del Cuerpo Humano — webapp

Tratado interactivo basado en *Physics of the Human Body* (Irving P. Herman, Springer, 2016).
Cada capítulo es una presentación de diapositivas con simulaciones físicas en Canvas 2D y
escenas 3D (Three.js), fórmulas con KaTeX y navegación por teclado.

## Stack

React 19 · TypeScript · Vite 8 · `@react-three/fiber` + `drei` + `three` · KaTeX · oxlint

## Scripts

| Comando | Qué hace |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo (Vite, por defecto en `:5173`). |
| `npm run build` | `tsc -b` + `vite build` → `dist/`. |
| `npm run build:cap1` | Build aislado solo del Capítulo 1 (`index-cap1.html` + `vite.config.cap1.ts`). |
| `npm run lint` | oxlint. |
| `npm run preview` | Sirve el `dist/` ya compilado. |

## Estructura

```
src/
  main.tsx            Punto de entrada → App
  App.tsx             Catálogo de capítulos + router por estado (useState)
  index.css           Design system: tokens de color, tipografía, componentes base
  chapters/
    capN/
      CapituloN.tsx   Orquestador del capítulo (navegación, teclado, KaTeX, barra de módulos)
      Slide0..N.tsx   Una diapositiva por archivo
      sims.ts         Funciones de dibujo Canvas 2D (física verificada contra el libro)
      useEngine.ts    Loop de requestAnimationFrame + estado de parámetros/flags
      *Canvas.tsx     Simulaciones concretas (2D o 3D con react-three-fiber)
      capN.css        Estilos del capítulo
public/
  assets/capN/        Imágenes (PNG) y modelos 3D (.glb) servidos tal cual
scripts/              Utilidades de generación/inspección de GLB (Python + Node); no entran al build
```

## Estado de los capítulos

Publicados: **1 (Antropometría y Anatomía)** y **2 (Estática del Cuerpo)** — `available: true`
en el arreglo `CHAPTERS` de `src/App.tsx`.

Los capítulos 3–13 existen en `src/chapters/` pero están marcados `available: false`
(botón "🔒 EN PREPARACIÓN"). Se van activando de uno en uno.

### Activar un capítulo

En `src/App.tsx`, poner `available: true` en su entrada de `CHAPTERS`.

## Notas de mantenimiento

- `tsconfig.app.json` **excluye del type-check** los capítulos 4 y 6–13. `npm run build`
  no valida tipos en esas carpetas (Vite las transpila igual). Quitar los `exclude` cuando
  cada capítulo entre en revisión.
- Carpetas locales que **no** se versionan (ver `.gitignore`): `.venv_assets/` (virtualenv de
  las herramientas de assets), `assets_source/` (material fuente antes de optimizar).
- Auditoría de estado del proyecto: ver el informe generado el 2026-09-01.
