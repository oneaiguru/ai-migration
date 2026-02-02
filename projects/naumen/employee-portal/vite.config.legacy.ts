import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2015', // Target older browsers
    rollupOptions: {
      output: {
        format: 'iife', // Use IIFE instead of ES modules
        entryFileNames: 'assets/[name].js', // Remove hash for debugging
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  server: {
    port: 3004,
    host: '0.0.0.0'
  }
})