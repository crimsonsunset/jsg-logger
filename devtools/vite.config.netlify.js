import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// Netlify-specific build configuration
// Builds as standalone SPA (not library mode)
export default defineConfig({
  plugins: [preact()],
  
  // Build as standalone web application
  build: {
    outDir: 'dist',
    
    // Standard SPA build (no library mode)
    minify: 'terser',
    sourcemap: true,
    
    rollupOptions: {
      // Bundle everything - no externals for standalone deployment
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          'vendor-preact': ['preact', 'preact/hooks', 'preact/compat'],
          'vendor-ui': ['evergreen-ui'],
          'vendor-logger': ['pino', 'lodash.merge']
        }
      }
    }
  },
  
  // Dev server configuration (same as main config)
  server: {
    port: 5556,
    host: true,
    open: true,
    fs: {
      allow: ['..']
    }
  },
  
  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  },
  
  // Alias configuration for Evergreen UI compatibility
  resolve: {
    alias: {
      // React → preact/compat for Evergreen UI
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      
      // JSG Logger alias - point to parent directory
      '@jsg-logger': new URL('../index.js', import.meta.url).pathname,
      
      // Path aliases
      '@': new URL('./src', import.meta.url).pathname,
      '@components': new URL('./src/components', import.meta.url).pathname,
      '@styles': new URL('./src/styles', import.meta.url).pathname
    },
    preserveSymlinks: false
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['pino', 'lodash.merge'],
    esbuildOptions: {
      alias: {
        'react': 'preact/compat',
        'react-dom': 'preact/compat'
      }
    }
  }
});

