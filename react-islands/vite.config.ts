import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Inaricom React islands — multi-entry build
// Output: ../inaricom-core/assets/react/ (vrai plugin actif cote WP)
// Enqueue cote WP via manifest.json lu par ReactIslandEnqueue
//
// base : en build prod, prefixe tous les imports dynamiques + import.meta.env.BASE_URL
// par le path WordPress du plugin. En dev (vite serve), base = '/' car les assets
// public/ sont servis a la racine 5173.
export default defineConfig(({ command }) => ({
  base:
    command === 'build'
      ? '/wp-content/plugins/inaricom-core/assets/react/'
      : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../inaricom-core/assets/react'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        homepage: path.resolve(__dirname, 'src/islands/homepage.tsx'),
        cybersec: path.resolve(__dirname, 'src/islands/cybersec.tsx'),
        ia: path.resolve(__dirname, 'src/islands/ia.tsx'),
      },
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? ''
          if (name.endsWith('.css')) return 'css/[name]-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
}))
