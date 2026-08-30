import { cpSync, mkdirSync, renameSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const webappDir = path.dirname(fileURLToPath(import.meta.url))
const releaseDir = path.resolve(webappDir, '..', 'Capitulo1_Clase')
const cap1Assets = path.resolve(webappDir, 'public', 'assets', 'cap1')

function copyCap1Assets() {
  return {
    name: 'copy-cap1-assets',
    closeBundle() {
      const assetsDir = path.join(releaseDir, 'assets')
      mkdirSync(assetsDir, { recursive: true })
      cpSync(cap1Assets, path.join(assetsDir, 'cap1'), { recursive: true })
      cpSync(path.resolve(webappDir, 'public', 'favicon.svg'), path.join(releaseDir, 'favicon.svg'))
      cpSync(path.resolve(webappDir, 'public', 'icons.svg'), path.join(releaseDir, 'icons.svg'))
      renameSync(path.join(releaseDir, 'index-cap1.html'), path.join(releaseDir, 'index.html'))
    },
  }
}

export default defineConfig({
  plugins: [react(), copyCap1Assets()],
  publicDir: false,
  build: {
    outDir: releaseDir,
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(webappDir, 'index-cap1.html'),
    },
  },
})
