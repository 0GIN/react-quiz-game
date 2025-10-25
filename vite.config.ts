/**
 * @fileoverview Konfiguracja Vite dla projektu React Quiz Game
 * 
 * Optymalizacje:
 * - Aliasy ścieżek według nowej struktury feature-based
 * - Code splitting z manualChunks dla lepszej wydajności
 * - Compression i minification
 * - Tree-shaking optimization
 * - Dev server configuration
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optymalizacja React
      babel: {
        plugins: [
          // Automatyczne usuwanie console.log TYLKO w produkcji
          ...(process.env.NODE_ENV === 'production' 
            ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] 
            : [])
        ]
      }
    })
  ],
  
  // Aliasy ścieżek - nowa struktura
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@api': path.resolve(__dirname, './src/api'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@config': path.resolve(__dirname, './src/config'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
      // Legacy aliases (do pełnego usunięcia)
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  
  // Optymalizacje build
  build: {
    // Sourcemaps tylko w development
    sourcemap: false,
    
    // Minifikacja
    minify: 'esbuild', // Szybsza alternatywa dla terser
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // KB
    
    // Rollup optimizations
    rollupOptions: {
      output: {
        // Manual chunking strategy dla lepszego cache
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // Other vendors
            return 'vendor';
          }
          
          // Feature-based chunking
          if (id.includes('/src/features/')) {
            const feature = id.split('/features/')[1]?.split('/')[0];
            return feature ? `feature-${feature}` : undefined;
          }
        },
        
        // Optymalizacja nazw plików
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Target dla lepszej kompatybilności
    target: 'es2015',
  },
  
  // Konfiguracja dev servera
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    // HMR optimization
    hmr: {
      overlay: true,
    },
  },
  
  // Preview server (dla testowania produkcyjnego builda)
  preview: {
    port: 4173,
    strictPort: false,
    open: true,
  },
  
  // Optymalizacje dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },
})
