import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // three + postprocessing make one large chunk; that's expected for a single-page deck
  build: { chunkSizeWarningLimit: 1600 },
})
