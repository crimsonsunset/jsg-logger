import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()], // Enable Preact support for DevTools components
  // Development server configuration
  server: {
    port: 5555,
    host: true,
    open: '/test-devtools.html',
    cors: true,
    headers: {
      // Aggressive cache-busting for DevTools development
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },

  // Build configuration (if needed)
  build: {
    // Keep this simple since we're mainly using this for dev
    outDir: 'dist',
    minify: false,
    sourcemap: true
  },

  // Configure how files are resolved
  resolve: {
    alias: {
      // Make sure imports work correctly
      '@': new URL('./', import.meta.url).pathname,
      '@devtools': new URL('./devtools/src', import.meta.url).pathname,
      // Preact/React compatibility for Evergreen UI
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  },

  // Ensure proper MIME types and static file serving (excluding .js which should be processed as modules)
  assetsInclude: ['**/*.json', '**/*.html'],
  
  // Optimizations
  optimizeDeps: {
    include: [
      // Pre-bundle these for faster dev server startup
      'preact',
      'preact/hooks', 
      'preact/compat',
      'evergreen-ui',
      'lodash.merge'
    ]
  },

  // Define for development
  define: {
    'import.meta.env.DEV_SERVER': '"vite"'
  }
});
