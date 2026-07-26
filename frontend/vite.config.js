import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- 1. Ye import karo

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- 2. Ye plugin list me add karo
  ],
})