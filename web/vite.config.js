// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    outDir: '../html', // build dans le dossier html de ta ressource
    emptyOutDir: true,
  },
  base: './', // important pour le routing en mode file:// ou sur FiveM
})