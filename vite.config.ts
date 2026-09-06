import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react({
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  // Pre-bundle heavy dependencies so dev server loads fast
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'zustand',
      'react-hot-toast',
      'date-fns',
      'date-fns/locale/fr',
      'clsx',
      'tailwind-merge',
      'i18next',
      'react-i18next',
      // Pre-bundle recharts tree to avoid per-module discovery
      'recharts',
    ],
    // Exclude heavy packages that are lazy-loaded
    exclude: [
      '@react-pdf/renderer',
    ],
  },

  css: {
    postcss: './postcss.config.cjs',
  },

  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@react-pdf'))        return 'pdf'
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          if (id.includes('@supabase'))          return 'supabase'
          if (id.includes('@tanstack'))          return 'query'
          if (id.includes('react-router'))       return 'router'
          if (id.includes('react-dom'))          return 'react-dom'
          if (id.includes('lucide-react'))       return 'icons'
        },
      },
    },
  },

  server: {
    port: 5173,
    // Faster HMR
    hmr: { overlay: true },
  },
})
