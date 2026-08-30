import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Vacía dist/ en cada build: con false se acumulaban cientos de bundles
    // obsoletos y assets ya retirados de public/.
    emptyOutDir: true,
  },
})
