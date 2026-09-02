import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Vacía dist/ en cada build: con false se acumulaban cientos de bundles
    // obsoletos y assets ya retirados de public/.
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Vendor pesado en chunks propios y cacheables. Sin esto, `three` vivía
        // dentro del chunk de cada capítulo y cualquier cambio en un slide
        // invalidaba el caché del navegador de toda la librería 3D.
        manualChunks(id) {
          if (
            id.includes('node_modules/three/') ||
            id.includes('node_modules/@react-three/')
          ) {
            return 'three'
          }
          if (id.includes('node_modules/katex/')) {
            return 'katex'
          }
        },
      },
    },
  },
})
