import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  
  // Build configuration for DevTools panel
  build: {
    // Output to devtools dist folder
    outDir: 'dist',
    
    // Keep the runtime injection pattern - build as ES modules
    lib: {
      entry: './src/panel-entry.jsx',
      name: 'JSGDevToolsPanel',
      fileName: 'panel-entry',
      formats: ['es']
    },
    
    // External dependencies (they'll be loaded from CDN in runtime)
    rollupOptions: {
      external: ['preact', 'preact/hooks', 'evergreen-ui'],
      output: {
        // Keep the dynamic import structure
        globals: {
          'preact': 'preact',
          'preact/hooks': 'preactHooks',
          'evergreen-ui': 'EvergreenUI'
        }
      }
    },
    
    // Enable minification with terser
    minify: 'terser',
    
    // Generate source maps
    sourcemap: true
  },
  
  // Dev server configuration
  server: {
    port: 5556,  // Different from main dev server
    host: true,
    open: true
  },
  
  // CSS configuration
  css: {
    modules: {
      // CSS Modules configuration
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  },
  
  // Alias configuration for cleaner imports and Evergreen UI compatibility
  resolve: {
    alias: {
      // React → preact/compat for Evergreen UI (built into Preact 10+)
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      
      // Path aliases
      '@': new URL('./src', import.meta.url).pathname,
      '@components': new URL('./src/components', import.meta.url).pathname,
      '@styles': new URL('./src/styles', import.meta.url).pathname
    }
  }
});
