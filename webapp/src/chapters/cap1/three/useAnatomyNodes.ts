/**
 * Acceso unificado a las mallas GLB del atlas anatómico.
 *
 *   const bones = useAnatomyNodes('body');
 *   <mesh geometry={bones.humerus_R.geometry} material={materials.bone} />
 *
 * Todos los GLB comparten el espacio canónico del esqueleto (ver
 * scripts/bp3d_transform.json), así que las mallas de distintos paquetes se
 * montan como hermanas sin transformar.
 */
import { useGLTF } from '@react-three/drei';
import type * as THREE from 'three';

export const ANATOMY_GLB = {
  body: '/assets/cap1/human_body.glb',
  muscles_arm: '/assets/cap1/human_muscles_arm.glb',
  muscles_hip_leg: '/assets/cap1/human_muscles_hip_leg.glb',
  muscles_full: '/assets/cap1/human_muscles_full.glb',
} as const;

export type AnatomyPack = keyof typeof ANATOMY_GLB;

type NodeMap = Record<string, THREE.Mesh>;

/** Devuelve el mapa de nodos (`nodes`) de un paquete GLB del atlas. */
export function useAnatomyNodes(pack: AnatomyPack): NodeMap {
  const { nodes } = useGLTF(ANATOMY_GLB[pack]) as unknown as { nodes: NodeMap };
  return nodes;
}

/** Escena completa del paquete (para clonar / recorrer con traverse). */
export function useAnatomyScene(pack: AnatomyPack): THREE.Group {
  const { scene } = useGLTF(ANATOMY_GLB[pack]) as unknown as { scene: THREE.Group };
  return scene;
}

export const preloadAnatomy = (...packs: AnatomyPack[]) => {
  (packs.length ? packs : (Object.keys(ANATOMY_GLB) as AnatomyPack[])).forEach((p) =>
    useGLTF.preload(ANATOMY_GLB[p]),
  );
};

// El esqueleto lo usan casi todas las escenas — precárgalo siempre.
useGLTF.preload(ANATOMY_GLB.body);
