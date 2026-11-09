import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa: funciona em qualquer subpasta do GitHub Pages
export default defineConfig({ base: './', plugins: [react()] })
