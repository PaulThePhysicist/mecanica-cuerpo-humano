# Contexto del Proyecto: Adaptación y Plataforma Web de "Physics of the Human Body"

Este archivo sirve como memoria autoritativa del proyecto para mantener el contexto siempre sincronizado para el usuario y cualquier agente de IA.

**Última actualización:** 2026-10-18  
**Repositorio GitHub:** `https://github.com/PaulThePhysicist/mecanica-cuerpo-humano.git` (Rama `main`)  
**Despliegue:** Vercel (Producción automática al hacer push a `main`).

---

## 1. Fase 1: Traducción y Maquetación LaTeX (COMPLETADA Y AUDITADA)

**VEREDICTO: TRADUCCIÓN COMPLETA — 15/15 unidades al 100%.**

El libro de Irving P. Herman ha sido completamente traducido al español y maquetado en LaTeX (`.tex` y `.pdf`).
- **Ubicación:** `Capitulos/Capitulo_1` a `Capitulo_13`, `Preliminares` y `Apendices`.
- **Auditoría Estructural:** Registrada en `reporte.md` con 100% de paridad en ecuaciones, figuras, tablas, problemas y citas bibliográficas contra el original en inglés.
- **Estado:** Esta fase está formalmente cerrada y congelada. No modificar los archivos LaTeX a menos que se trate de una errata puntual solicitada expresamente.

---

## 2. Fase 2: Experiencia Web Interactiva (EN CURSO - NIVEL 3)

La meta es transformar los diagramas estáticos y fórmulas en una experiencia web pedagógica inmersiva (2D/3D) para impartir clases universitarias y estudio autónomo.

### Estado Actual de la Webapp (`webapp/`):
- **Stack:** React 19 + TypeScript + Vite + KaTeX + Three.js / React Three Fiber.
- **Capítulos 1 y 2 en Producción:** Completamente auditados, pulidos en UI/interacción y activados en producción con `available: true` en `webapp/src/App.tsx`.
- **Capítulos 3 al 13 en Staging:** Todas las diapositivas (295 en total) y simulaciones base están migradas a React en `webapp/src/chapters/cap[3-13]`, pero configuradas con `available: false` en `App.tsx` hasta que se realice la auditoría individual de interacción y rendimiento.
- **Compilación:** `npm run build` (`tsc -b && vite build`) compila limpio con 0 errores y bundle optimizado con vendor chunking.

---

## 3. Estructura Limpia del Espacio de Trabajo

```
La Mecanica del Cuerpo Humano/
├── Irving P. Herman...pdf                      ← Libro original en inglés (fuente)
├── contexto_proyecto.md                        ← ESTE ARCHIVO (Memoria del proyecto)
├── STATUS.md                                   ← Matriz de avance y estado maestro
├── RETOMAR_PROYECTO.md                         ← Hoja de ruta para retomar en 2 meses
├── BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md   ← Estándar anatómico y tubería 3D
├── AUDITORIA_CAP1.md                           ← Modelo de auditoría de rendimiento
├── AUDITORIA_CAP1_INTERACCION.md               ← Modelo de auditoría pedagógica/UI
├── reporte.md                                  ← Auditoría estructural LaTeX (100%)
├── PRODUCT.md                                  ← Visión de producto y audiencia
├── vercel.json                                 ← Configuración de build para despliegue
│
├── Chapters/                                   ← PDFs originales fragmentados (referencia)
│
├── Capitulos/                                  ← FUENTE LATEX (Fase 1) Y CANTERAS HTML (Nivel 1)
│   ├── Preliminares/
│   ├── Capitulo_1/ .. Capitulo_13/
│   └── Apendices/
│
└── webapp/                                     ← APLICACIÓN REACT SPA (Nivel 3 - Fase 2)
    ├── src/
    │   ├── App.tsx                             ← Catálogo general y control de publicación
    │   ├── chapters/
    │   │   ├── cap1/                           ← Cap 1: 100% auditado y en producción
    │   │   ├── cap2/                           ← Cap 2: 100% auditado y en producción
    │   │   └── cap3/ .. cap13/                 ← Cap 3-13: Migrados, en staging (available: false)
    │   └── ...
    └── public/assets/cap1/                     ← Mallas GLB con espacio de coordenadas canónico
```

---

## 4. Reglas Críticas para Agentes y Continuidad

1. **No tocar los HTML monolíticos antiguos** en `Capitulos/Capitulo_*/capitulo*.html`: se conservan exclusivamente como "canteras" de referencia matemática y física.
2. **Todo desarrollo debe ocurrir en `webapp/`** siguiendo los patrones de React 19, TypeScript estricto y tokens CSS de `:root`.
3. **No generar assets con IA generativa 3D difusa**: usar la tubería anatómica de BodyParts3D documentada en `BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md` para garantizar rigor médico/biomecánico.
4. **Al retomar en 2 meses**: consultar directamente `RETOMAR_PROYECTO.md` para el paso a paso de arranque con el Capítulo 3.
