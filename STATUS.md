# STATUS — Estado Maestro del Proyecto

**Última actualización:** 2026-10-18  
**Fase Actual:** Fase 2 — Plataforma Web Interactiva (React 19 + TypeScript + Vite + Canvas 2D + Three.js 3D + KaTeX)  
**Estado de Despliegue:** En producción en Vercel (conectado a `main` en GitHub).

---

## 🚀 Resumen Ejecutivo

| Aspecto | Estado | Detalle |
| :--- | :---: | :--- |
| **Repositorio Git** | 🟢 **Al día** | Sincronizado al 100% con `origin/main` (`PaulThePhysicist/mecanica-cuerpo-humano`). |
| **Fase 1 (Editorial LaTeX)** | ✅ **100% Cerrada** | 13/13 Capítulos + Preliminares + Apéndices verificados con paridad matemática y estructural 100% (`reporte.md`). |
| **Capítulos en Producción** | 🟢 **Cap. 1 y Cap. 2 Activos** | `available: true` en `App.tsx`. Acceso público directo en la SPA. |
| **Capítulos 3 al 13 (Staging)** | 🟡 **Migrados (Ocultos)** | Código y diapositivas React funcionales (295 slides totales), pero con `available: false` a la espera de auditoría individual y estandarización 3D. |
| **Compilación & Tipos** | 🟢 **Verde** | `npm run build` (`tsc -b && vite build`) exitoso con **0 errores**. |
| **Vendor Chunking** | ⚡ **Optimizado** | `index.js` inicial de solo **12.8 kB** (5 kB gzip); Three.js y KaTeX completamente desacoplados en lazy chunks. |
| **Estándar Biomecánico 3D** | 📐 **Estandarizado** | Especificación única en `BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md` con coordenadas canónicas y `AnatomyStage`. |

---

## 📋 Matriz de Estado por Capítulos (Fase 2 - Web)

| Capítulo | Título | Slides | Estado en Web | Estado de Producción (`App.tsx`) | Próxima Acción |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | Antropometría y Anatomía | 21 | ✅ Auditado y Optimizado | **`available: true` (Público)** | Listo en producción. |
| **2** | Estática del Cuerpo Humano | 23 | ✅ Auditado y Optimizado | **`available: true` (Público)** | Listo en producción. |
| **3** | El Movimiento | 19 | 🟡 Migrado (base) | `available: false` (Oculto) | **🎯 Siguiente objetivo al retomar**: Auditoría de interacción y migración a `AnatomyStage`. |
| **4** | Propiedades Mecánicas | 21 | 🟡 Migrado (base) | `available: false` (Oculto) | Pendiente de auditoría y tokens CSS. |
| **5** | Músculos y Mecánica Contráctil | 22 | 🟡 Migrado (base) | `available: false` (Oculto) | Pendiente de auditoría y acoplamiento con mallas musculares 3D. |
| **6** | Metabolismo, Energía y Calor | 23 | 🟡 Migrado (base) | `available: false` (Oculto) | Pendiente de auditoría. |
| **7** | Fluidos del Cuerpo | 23 | 🟡 Migrado (base) | `available: false` (Oculto) | Pendiente de auditoría. |
| **8** | Sistema Cardiovascular | 24 | 🟡 Migrado (base) | `available: false` (Oculto) | Pendiente de auditoría. |
| **9** | Los Pulmones y la Respiración | 24 | 🟡 Migrado (base) | `available: false` (Oculto) | Pendiente de auditoría. |
| **10** | Sonido, Habla y Audición | 24 | 🟡 Migrado (base) | `available: false` (Oculto) | Pendiente de auditoría. |
| **11** | Luz, Ojos y Visión | 24 | 🟡 Migrado (base) | `available: false` (Oculto) | Pendiente de auditoría. |
| **12** | Propiedades Eléctricas y Magnéticas | 24 | 🟡 Migrado (base) | `available: false` (Oculto) | Pendiente de auditoría. |
| **13** | Retroalimentación y Control | 24 | 🟡 Migrado (base) | `available: false` (Oculto) | Pendiente de auditoría. |

---

## 🛠️ Arquitectura Técnica de la Plataforma

- **Framework:** React 19 + TypeScript + Vite.
- **Tipografía y Matemáticas:** KaTeX con sintaxis estricta `\\( ... \\)` (inline) y `\\[ ... \\]` (bloque).
- **Simulaciones 2D:** Canvas HTML5 con `useHarmonicClock` o bucles rAF protegidos contra congelamientos y estados de reserva (`CanvasReserveState.tsx`).
- **Simulaciones 3D:** Three.js / React Three Fiber con el contenedor compartido `AnatomyStage`, materiales PBR unificados (`materials.ts`) y mallas anatómicas con centroide normalizado en `public/assets/cap1/`.
- **Despliegue Continuo:** Configurado en `vercel.json` con build automático al hacer push a `main`.

---

## 🏁 Protocolo para Retomar el Proyecto (Quick-Start)

Cuando se reactive el desarrollo (en 2 meses):

1. **Entorno local:**
   ```bash
   cd webapp
   npm install
   npm run dev
   ```
2. **Consultar guías y estándares:**
   - Hoja de ruta para retomar: `RETOMAR_PROYECTO.md`.
   - Especificaciones y arquitectura 3D: `BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md`.
   - Auditorías modelo (Cap 1 y Cap 2): `AUDITORIA_CAP1.md` y `AUDITORIA_CAP1_INTERACCION.md`.
3. **Misión inmediata (Capítulo 3):**
   - Ejecutar auditoría técnica y de interacción sobre `webapp/src/chapters/cap3/`.
   - Verificar desacople de rAF, adopción de tokens CSS de `:root`, y encuadre 3D de bipedestación/marcha.
   - Probar build con `npm run build`.
   - En `webapp/src/App.tsx`, cambiar `id: 3` a `available: true` para enviarlo a producción.
