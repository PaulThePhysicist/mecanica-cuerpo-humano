/**
 * Materiales PBR canónicos del atlas anatómico (BIOMECHANICAL_3D_STANDARD §3).
 *
 * Instancias compartidas: importa `materials.bone` etc. en lugar de recrear un
 * `useMemo(() => new THREE.MeshStandardMaterial(...))` por escena. Para músculo
 * con emisión EMG variable usa `makeMuscleActive(intensity)`.
 *
 * NO mutar las instancias exportadas (son singletons entre escenas). Si una
 * escena necesita un color distinto puntual, usa `.clone()`.
 */
import * as THREE from 'three';

const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);

export const materials = {
  /** Hueso cortical marfil periosteal (grado médico). */
  bone: std({ color: new THREE.Color('#ede5d0'), roughness: 0.62, metalness: 0.04 }),

  /** Hueso de contexto / base fija (escápula, pelvis, vértebras base). */
  boneContext: std({ color: new THREE.Color('#ded3be'), roughness: 0.66, metalness: 0.04 }),

  /** Hueso de contexto translúcido (huesos vecinos que no son el foco). */
  boneGhost: std({ color: new THREE.Color('#dfd5c2'), roughness: 0.75, metalness: 0.04, transparent: true, opacity: 0.45 }),

  /** Articulación / hueso seleccionado — teal con emisión. */
  boneHighlight: std({ color: new THREE.Color('#0d6e64'), emissive: new THREE.Color('#083c35'), emissiveIntensity: 0.42, roughness: 0.5, metalness: 0.04 }),

  /** Cartílago hialino / discos — ice-mint translúcido (doble cara para superficies finas). */
  cartilage: std({ color: new THREE.Color('#68c5b8'), roughness: 0.28, metalness: 0.1, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),

  /** Músculo estriado activo bajo carga (emisión EMG base). */
  muscleActive: std({ color: new THREE.Color('#b02318'), emissive: new THREE.Color('#5a100a'), emissiveIntensity: 0.45, roughness: 0.5, metalness: 0.06 }),

  /** Músculo inactivo / antagonista relajado. */
  muscleIdle: std({ color: new THREE.Color('#8c534b'), roughness: 0.6, metalness: 0.05 }),

  /** Músculo en tono basal neutro (ni agonista ni claramente relajado). */
  muscleNeutral: std({ color: new THREE.Color('#9e473e'), roughness: 0.62, metalness: 0.04 }),

  /** Tendones nacarados / aponeurosis. */
  tendon: std({ color: new THREE.Color('#f5f0e6'), roughness: 0.35, metalness: 0.2 }),
} as const;

/** Músculo activo con intensidad de emisión EMG proporcional a la carga (0..1+). */
export function makeMuscleActive(emissiveIntensity: number): THREE.MeshStandardMaterial {
  return std({
    color: new THREE.Color('#b02318'),
    emissive: new THREE.Color('#5a100a'),
    emissiveIntensity: Math.max(0, emissiveIntensity),
    roughness: 0.5,
    metalness: 0.06,
  });
}

/**
 * Fondo de estudio anatómico. Viñeta cálida: centro apagado (no blanco puro) y
 * bordes claramente más oscuros, para que la anatomía marfil se despegue del
 * fondo en vez de fundirse con él.
 */
export const STUDIO_BG = 'radial-gradient(circle at 50% 38%, #ece3ce 0%, #ddd1b6 52%, #c6b697 100%)';

/** Alias del fondo profundo (mismo valor); nombre explícito para llamadas nuevas. */
export const STUDIO_BG_DEEP = STUDIO_BG;
