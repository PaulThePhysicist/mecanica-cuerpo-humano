"""
Optimiza y comprime los GLBs de músculos para WebGL ultra-rápido (< 4 MB por módulo regional).
Decima cada malla muscular a ~2200 caras conservando la forma anatómica exacta y orientación.
"""
import os, time
import numpy as np
import trimesh

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSET = os.path.join(ROOT, "public", "assets", "cap1")
STL_DIR = os.path.join(ROOT, "assets_source", "_bp3d_stl")

from gen_anatomical_muscles import ARM_MUSCLES, HIP_LEG_MUSCLES, TRUNK_MUSCLES, PACKAGES, load_muscle_mesh, MUSCLE_COLOR

def optimize_and_export(filename, muscle_list, label, max_faces=2200):
    out_path = os.path.join(ASSET, filename)
    print(f"\nOptimizando {filename} (target ~{max_faces} caras por msculo)...", flush=True)
    scene = trimesh.Scene()
    count = 0

    for fid, node_name in muscle_list:
        p = os.path.join(STL_DIR, f"FMA{fid}.stl")
        if not os.path.exists(p):
            continue
        try:
            m = trimesh.load(p)
            if isinstance(m, trimesh.Scene):
                m = trimesh.util.concatenate(m.dump())
            if not hasattr(m, "vertices") or len(m.vertices) == 0:
                continue
            m = m.copy()
            # Decimacin cuadrtica optimizada para WebGL fluido
            if len(m.faces) > max_faces:
                try:
                    # face_count por nombre: el primer posicional de
                    # simplify_quadric_decimation es `percent` (0-1), y pasarle
                    # un conteo de caras lanza ValueError.
                    m = m.simplify_quadric_decimation(face_count=max_faces)
                except Exception as e:
                    print(f"  !! Decimacion fallida en {node_name}: {type(e).__name__}: {e}", flush=True)
            m.visual = trimesh.visual.ColorVisuals(mesh=m, face_colors=np.tile(MUSCLE_COLOR, (len(m.faces), 1)))
            scene.add_geometry(m, node_name=node_name)
            count += 1
            print(f"  [OK] {node_name:<36} -> {len(m.faces)} caras | {len(m.vertices)} verts", flush=True)
        except Exception as e:
            print(f"  !! Error procesando {node_name}: {e}", flush=True)

    glb_bytes = scene.export(file_type="glb")
    with open(out_path, "wb") as f:
        f.write(glb_bytes)

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f" -> Generado {filename} OPTIMIZADO: {count} mallas | {size_mb:.2f} MB", flush=True)

def main():
    t0 = time.time()
    optimize_and_export("human_muscles_arm.glb", ARM_MUSCLES, "Miembro Superior", 2200)
    optimize_and_export("human_muscles_hip_leg.glb", HIP_LEG_MUSCLES, "Cadera y Pierna", 2200)
    optimize_and_export("human_muscles_trunk.glb", TRUNK_MUSCLES, "Tronco y Mandbula", 2200)
    optimize_and_export("human_muscles_full.glb", ARM_MUSCLES + HIP_LEG_MUSCLES + TRUNK_MUSCLES, "Atlas Completo", 1800)
    print(f"\nOptimizacin completa en {time.time()-t0:.1f}s!", flush=True)

if __name__ == "__main__":
    main()
