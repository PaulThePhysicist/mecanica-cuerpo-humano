# Contexto del Proyecto: Traducción y Maquetación de "Physics of the Human Body"

Este archivo sirve como memoria y guía del proyecto para mantener el contexto siempre actualizado para el usuario y cualquier agente de IA.

**Última actualización:** 2026-08-12

---

## 1. Fase 1: Traducción y Maquetación LaTeX (COMPLETADA)

**VERDICTO: TRADUCCIÓN COMPLETA — 15/15 unidades compilando sin errores.**

El libro original ha sido traducido completamente al español y maquetado en archivos `.tex` y `.pdf` listos para Overleaf. 
- **Ubicación:** `Capitulos/Capitulo_1` a `Capitulo_13`, `Preliminares` y `Apendices`.
- **Estado:** Esta fase está cerrada. No se deben modificar los archivos LaTeX a menos que sea una corrección de errata solicitada explícitamente.

---

## 2. Fase 2: Experiencia Web Inmersiva (EN CURSO)

El proyecto actual busca tomar las figuras estáticas y las simulaciones del libro, y convertirlas en una experiencia web interactiva 2D/3D (nivel 3 de arquitectura web).

### Nivel 1 (Antiguo)
Se construyeron 13 archivos HTML monolíticos (`capitulo1.html` a `capitulo13.html`) dentro de las carpetas de cada capítulo. Estos contienen simulaciones valiosas en el Canvas API, pero son difíciles de escalar. **No se debe programar más sobre estos HTML monolíticos**, pero sí se deben usar como referencia de código físico y matemático (canteras).

### Nivel 3 (Actual)
Se ha inicializado una aplicación React escalable (`webapp/`) usando Vite. Todo el desarrollo de nuevas simulaciones y experiencias interactivas debe ocurrir dentro de este framework de React.
- **Stack:** React, Vite, TypeScript, Three.js, React Three Fiber.
- **Consultar:** Lee `ARCHITECTURE.md` para entender el flujo de trabajo de migración y la tubería de Blender (blender-mcp) para assets 3D anatómicos.

---

## 3. Estructura Limpia del Espacio de Trabajo

```
La Mecanica del Cuerpo Humano/
├── Irving P. Herman...pdf    ← Libro original (inglés)
├── contexto_proyecto.md      ← ESTE ARCHIVO (memoria)
├── STATUS.md                 ← Estado de los módulos y tareas
├── ARCHITECTURE.md           ← Arquitectura web y flujos 3D
│
├── Chapters/                 ← Los 27 PDFs originales troceados (Referencia)
│
├── Capitulos/                ← ENTREGABLES FINALES LATEX Y CANTERAS HTML
│   ├── Preliminares/
│   ├── Capitulo_1/           ← Contiene Capitulo_1.tex, .pdf, y capitulo1.html
│   └── ... 
│
└── webapp/                   ← PROYECTO REACT (DESARROLLO ACTUAL)
```

## 4. Notas Importantes para Agentes

- ¡La limpieza ya ocurrió! No busques carpetas antiguas como `_archivo` o scripts temporales. 
- Cualquier mejora a las simulaciones debe construirse como un componente de React en `webapp/`.
- No utilices herramientas de IA de texto-a-3D (generativas). Usa el flujo basado en **Blender y mallas anatómicas reales** documentado en `ARCHITECTURE.md`.
