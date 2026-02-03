import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Enhanced Vite configuration with production optimizations
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: 'src/test/setup.ts',
    include: ['src/**/*.test.ts?(x)', 'src/**/*.spec.ts?(x)'],
    exclude: ['tests/e2e/**'],
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: false, // Set to true to auto-open browser
    strictPort: false, // Find next available port if 3000 is taken
  },
  
  // Preview server (for testing production builds)
  preview: {
    port: 4173,
    strictPort: false,
  },
  
  // Production build optimizations
  build: {
    // Target modern browsers (reduces bundle size)
    target: 'es2015',
    
    // Use terser for better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    
    // Disable source maps for production (enable if needed for debugging)
    sourcemap: false,
    
    // Rollup-specific options
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Split React libraries into separate chunk
          'react-vendor': ['react', 'react-dom'],
          // Add other vendor chunks as needed:
          // 'chart-vendor': ['recharts', 'd3'],
        },
        
        // Custom chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Report compressed size (useful for monitoring bundle size)
    reportCompressedSize: true,
    
    // Warn when chunks exceed this size (in KB)
    chunkSizeWarningLimit: 1000,
    
    // Output directory (default is 'dist')
    outDir: 'dist',
    
    // Clean output directory before build
    emptyOutDir: true,
  },
  
  // Resolve configuration
  resolve: {
    // Path aliases for cleaner imports (optional but recommended)
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@assets': '/src/assets',
    },
  },
  
  // CSS configuration
  css: {
    // CSS modules configuration
    modules: {
      localsConvention: 'camelCase',
    },
    
    // PostCSS configuration (make sure you have postcss.config.js)
    postcss: './postcss.config.js',
  },
})
