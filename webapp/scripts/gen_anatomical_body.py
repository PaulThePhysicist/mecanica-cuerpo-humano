"""
Genera webapp/public/assets/cap1/human_body.glb — esqueleto anatómico propio
ensamblado desde BodyParts3D (STL, CC-BY-SA 2.1 Japan), cada hueso como malla
separada con nombre de nodo. Los STL de BodyParts3D vienen en coordenadas
absolutas del cuerpo en pose anatómica (mm), así que solo se cargan y unen;
NO hace falta re-posicionar.

Requiere venv aislado (numpy roto en el venv de Hermes):
  uv venv --python 3.13 .venv_assets
  uv pip install --python .venv_assets/Scripts/python.exe trimesh scipy
  env -u PYTHONPATH .venv_assets/Scripts/python.exe scripts/gen_anatomical_body.py
"""
import os, csv, io, re, json, struct
import numpy as np
import trimesh

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSET = os.path.join(ROOT, "public", "assets", "cap1")
STL_DIR = os.path.join(ROOT, "assets_source", "_bp3d_stl")
os.makedirs(STL_DIR, exist_ok=True)
OUT = os.path.join(ASSET, "human_body.glb")
CSV_PATH = os.path.join(os.environ.get("TEMP", "/tmp"), "FMA.csv")
BASE = "https://raw.githubusercontent.com/Kevin-Mattheus-Moerman/BodyParts3D/main/assets/BodyParts3D_data/stl/FMA{}.stl"

# ---- Huesos: (id_fma, nombre_nodo, etiqueta_region) ----
# region se usa solo para agrupar en A3 más adelante (no afecta el GLB).
SKULL = [("52734","frontal"),("52789","parietal_L"),("52788","parietal_R"),
 ("52739","temporal_L"),("52738","temporal_R"),("52735","occipital"),
 ("52736","sphenoid"),("52740","ethmoid"),("52893","zygomatic_L"),("52892","zygomatic_R"),
 ("53650","maxilla_L"),("53649","maxilla_R"),("53648","nasal_L"),("53647","nasal_R"),
 ("52748","mandible")]
VERT = [("12521","cervical3"),("12522","cervical4"),("12523","cervical5"),("12524","cervical6"),("12525","cervical7"),
 ("9165","thoracic1"),("9187","thoracic2"),("9209","thoracic3"),("9248","thoracic4"),("9922","thoracic5"),
 ("9945","thoracic6"),("9968","thoracic7"),("9991","thoracic8"),("10014","thoracic9"),("10037","thoracic10"),
 ("10059","thoracic11"),("10081","thoracic12"),
 ("13072","lumbar1"),("13073","lumbar2"),("13074","lumbar3"),("13075","lumbar4"),("13076","lumbar5"),
 ("16202","sacrum")]
GIRDLE = [("13323","clavicle_L"),("13322","clavicle_R"),("13396","scapula_L"),("13395","scapula_R")]
THORAX = [("7487","sternum")] + [(f,"rib_{}".format(i+1)) for i,f in enumerate([
 "7857","7882","7909","7957","7987","8012","8066","8093","8148","8175","8202","8229",
 "8256","8283","8310","8364","8391","8445","8472","8531","8532","8533","8534"])]
ARM = [("23131","humerus_L"),("23130","humerus_R"),
 ("23465","radius_L"),("23464","radius_R"),("23468","ulna_L"),("23467","ulna_R")]
# Carpo (8 huesos x2)
CARPO = [("24435","scaphoid_R"),("24436","scaphoid_L"),("24437","lunate_R"),("24438","lunate_L"),
 ("24439","triquetral_R"),("24440","triquetral_L"),("24441","pisiform_R"),("24442","pisiform_L"),
 ("24443","trapezium_R"),("24444","trapezium_L"),("24445","trapezoid_R"),("23725","trapezoid_L"),
 ("24446","capitate_R"),("24447","capitate_L"),("24448","hamate_R"),("24449","hamate_L")]
METACARPO = [(f,"metacarpal_{}".format(i+1)) for i,f in enumerate([
 "24464","24466","24467","24468","24469","24470","24471","24472","24473"])]  # 1R..5L
PHAL_HAND = []  # BodyParts3D no trae falanges de mano como STL separado
PELVIS = [("16587","hip_L"),("16586","hip_R")]
LEG = [("24475","femur_L"),("24474","femur_R"),("24487","patella_L"),("24486","patella_R"),
 ("24478","tibia_L"),("24477","tibia_R"),("24481","fibula_L"),("24480","fibula_R")]
FOOT = [("24483","talus_L"),("24482","talus_R"),("24497","calcaneus_L"),("24498","calcaneus_R"),
("24501","navicular_L"),("24500","navicular_R"),("24522","cuneiform_med_L"),("24521","cuneiform_med_R"),
("24524","cuneiform_int_L"),("24523","cuneiform_int_R"),("24526","cuneiform_lat_L"),("24525","cuneiform_lat_R"),
("24529","cuboid_L"),("24528","cuboid_R"),
("24508","metatarsal1_L"),("24507","metatarsal1_R"),("24510","metatarsal2_L"),("24509","metatarsal2_R"),
("24512","metatarsal3_L"),("24511","metatarsal3_R"),("24514","metatarsal4_L"),("24513","metatarsal4_R"),
("24516","metatarsal5_L"),("24515","metatarsal5_R")]
PHAL_FOOT = []  # BodyParts3D no trae falanges de pie como STL separado

ALL = SKULL+VERT+GIRDLE+THORAX+ARM+CARPO+METACARPO+PHAL_HAND+PELVIS+LEG+FOOT+PHAL_FOOT

BONE_COLOR = np.array([0.90, 0.85, 0.74, 1.0])  # marfil cálido

def ensure_stl(fid):
    p = os.path.join(STL_DIR, f"FMA{fid}.stl")
    if os.path.exists(p) and os.path.getsize(p) > 2000:
        return p
    import urllib.request, time
    for attempt in range(6):
        try:
            urllib.request.urlretrieve(BASE.format(fid), p)
            if os.path.getsize(p) > 2000:
                return p
        except Exception as e:
            time.sleep(1.5 + attempt*1.5)  # backoff ante 503 (rate-limit)
    print("  !! FALLO descarga FMA{}".format(fid))
    return None

def load_mesh(fid, node):
    p = ensure_stl(fid)
    if not p:
        return None
    try:
        m = trimesh.load(p)
        if isinstance(m, trimesh.Scene):
            m = trimesh.util.concatenate(m.dump())
        if not hasattr(m, "vertices") or len(m.vertices) == 0:
            return None
        m = m.copy()
        # color
        m.visual = trimesh.visual.ColorVisuals(mesh=m, face_colors=np.tile(BONE_COLOR, (len(m.faces),1)))
        return m
    except Exception as e:
        print("  !! error cargando FMA{}: {}".format(fid, e))
        return None

def main():
    scene = trimesh.Scene()
    loaded = 0
    for fid, node in ALL:
        m = load_mesh(fid, node)
        if m is None:
            continue
        scene.add_geometry(m, geom_name=node, node_name=node)
        loaded += 1
    print("Mallas cargadas: {}/{}".format(loaded, len(ALL)))
    # BodyParts3D entrega el cuerpo acostado a lo largo de Z (cabeza +Z, pies ~0).
    # Lo ponemos de pie: rotar -90 deg about X  ->  (x,y,z) -> (x, z, -y)
    R = trimesh.transformations.rotation_matrix(-np.pi/2.0, [1,0,0])
    for gn in list(scene.geometry):
        scene.geometry[gn].apply_transform(R)
    # recentrar en el origen (centroid de la escena)
    cb = scene.centroid
    T = np.eye(4); T[:3,3] = -cb
    for gn in list(scene.geometry):
        scene.geometry[gn].apply_transform(T)
    # escalar a 1.0 de alto
    bounds = scene.bounds
    height = bounds[1][1]-bounds[0][1]
    scale = 1.0/height
    S = np.diag([scale,scale,scale,1.0])
    for gn in list(scene.geometry):
        scene.geometry[gn].apply_transform(S)
    nb = scene.bounds
    print("bbox final: min", np.round(nb[0],3), "max", np.round(nb[1],3), "alto", round(height*scale,3))
    scene.export(OUT, file_type="glb")
    # validar
    v = trimesh.load(OUT)
    nv = sum(len(g.vertices) for g in (v.geometry.values() if isinstance(v,trimesh.Scene) else [v]))
    print("GLB exportado:", OUT, "meshes=", len(v.geometry) if isinstance(v,trimesh.Scene) else 1, "vertices=", nv)
    print("ATRIBUCION: BodyParts3D, (c) DBCLS licensed under CC Attribution-Share Alike 2.1 Japan")

if __name__ == "__main__":
    main()
