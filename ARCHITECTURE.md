# ARCHITECTURE & PROTOCOL

**Project:** La Física del Cuerpo Humano (Interactive Web Experience)
**Phase:** 2 (Web & 3D Immersion)

> [!IMPORTANT]
> The LaTeX translation phase is 100% complete. DO NOT attempt to translate or modify the `.tex` files. The new goal is to build an immersive interactive experience based on the original book.

---

## 1. Directory Structure

- `Chapters/` → The 27 original PDF chapters from Irving P. Herman's book. Use as absolute ground truth for physics and formulas.
- `Capitulos/` → The LaTeX translations, generated PDFs, and legacy `capituloN.html` files. These HTML files are the **Raw Material** containing the 2D physics simulations (Canvas API).
- `webapp/` → The new **Level 3 Framework** (React + Vite + TypeScript + Three.js). This is where all new development MUST occur.

---

## 2. Migration Protocol (Level 1 → Level 3)

The goal is to port the 13 monolithic HTML files (`Capitulos/capituloN.html`) into the React SPA in `webapp/`. 

When tasked with migrating a chapter:
1. **Extract Physics Logic:** Find the `drawXYZ` functions in the legacy HTML (e.g., `drawStab`, `drawWalking`). These are pure Canvas 2D renders driven by physics math.
2. **Port to React:** Create a React component in `webapp/src/components/` that uses a `useRef<HTMLCanvasElement>` and a `requestAnimationFrame` loop.
3. **Preserve the Math:** Do not change the physics math (angles, vectors, forces). The math is already verified against the textbook.
4. **Design System:** Use the project's color palette (ivory paper background, teal `#0d6e64` for stability, blood `#a92a1e` for instability/forces). Keep the academic "sweet spot" (serious but engaging).

---

## 3. The 3D Anatomy Pipeline (Blender + MCP)

The user explicitly wants anatomically correct 3D visualizations, specifically for synovial joints.
**Do not use Text-to-3D AI generators.** 

### The Workflow:
1. **Source of Truth:** Use real medical meshes (e.g., BodyParts3D) for osteology.
2. **Authoring (Blender):** Use Blender 4.4.1 + `blender-mcp`. The LLM Agent will dictate commands to Blender via the MCP server to rig, animate (e.g., flexion 0°-120°), and set PBR materials.
3. **Export:** Export the assembled joint/anatomy as a `.glb` file.
4. **Integration (Three.js):** Load the `.glb` into React via `@react-three/fiber` and `@react-three/drei` (`useGLTF`). 
5. **Interactivity:** Map React state (sliders, buttons) to the `.glb` animation mixer (`THREE.AnimationMixer`). Do not bake videos; the 3D model must be fully orbitable and scrubbable in the browser.

### Bridging 2D and 3D:
For modules where 2D vector physics (forces, torques, CM) must overlap with 3D anatomy, use `THREE.Vector3.project(camera)` to map 3D joint coordinates to 2D screen pixels, just as it was successfully implemented for the center of mass in Chapter 3.
