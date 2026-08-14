import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin to copy index.html to 404.html for GitHub Pages SPA routing
function copySpaFallback() {
  return {
    name: 'copy-spa-fallback',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const indexHtml = path.resolve(distDir, 'index.html')
      const fallbackHtml = path.resolve(distDir, '404.html')
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, fallbackHtml)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/FrosterGym/',
  plugins: [react(), copySpaFallback()],
})
