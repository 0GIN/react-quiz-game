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
      babel: {
        plugins: [
          ...(process.env.NODE_ENV === 'production'
            ? [['transform-remove-console', { exclude: ['error', 'warn'] }]]
            : [])
        ]
      }
    })
  ],

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
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },

  build: {
    sourcemap: true,
    // Use no minify to validate runtime on Vercel; can switch back later
    minify: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor'
            }
            return 'vendor'
          }
          if (id.includes('/src/features/')) {
            const feature = id.split('/features/')[1]?.split('/')[0]
            return feature ? `feature-${feature}` : undefined
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Lower target for broader compatibility
    target: 'es2015'
  },

  server: {
    port: 5173,
    strictPort: false,
    open: true,
    hmr: { overlay: true }
  },

  preview: {
    port: 4173,
    strictPort: false,
    open: true
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
  }
})
