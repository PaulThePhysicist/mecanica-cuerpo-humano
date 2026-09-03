import React from 'react';

/**
 * Rig de luz de estudio anatómico, compartido por todas las escenas 3D.
 *
 * El problema que resuelve: casi todas las escenas usaban `ambientLight` a
 * 0.85–0.95 (aplana la forma → aspecto lavado) y NINGUNA tenía luz de contra,
 * así que la silueta no se despegaba del fondo. Este rig baja el ambiente,
 * sube la principal y añade una luz de contra fría que perfila el borde.
 *
 *   <Canvas>
 *     <StudioLights />
 *     ...
 *   </Canvas>
 *
 * `keyIntensity` permite subir/bajar la principal por escena sin romper el
 * balance del resto.
 */
export function StudioLights({ keyIntensity = 1.7 }: { keyIntensity?: number }) {
  return (
    <>
      {/* Ambiente bajo: deja que la forma se modele. */}
      <ambientLight intensity={0.52} color="#fffcf5" />
      {/* Principal cálida, arriba-derecha-frente. */}
      <directionalLight position={[6, 9, 6]} intensity={keyIntensity} color="#fff6e6" castShadow />
      {/* Relleno frío, izquierda. */}
      <directionalLight position={[-6, 4, -5]} intensity={0.5} color="#dcecf7" />
      {/* Contra: detrás y algo arriba; perfila la silueta contra el fondo. */}
      <directionalLight position={[-2, 3.5, -7]} intensity={0.95} color="#ffffff" />
      {/* Rebote tenue desde abajo. */}
      <directionalLight position={[0, -4, 3]} intensity={0.18} color="#faf0e6" />
    </>
  );
}
