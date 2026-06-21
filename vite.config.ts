import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: '/restbox/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-codemirror': [
            '@codemirror/autocomplete',
            '@codemirror/commands',
            '@codemirror/lang-json',
            '@codemirror/lint',
            '@codemirror/state',
            '@codemirror/view',
            'codemirror',
          ],
          'vendor-markdown': ['react-markdown', 'rehype-highlight', 'highlight.js'],
        },
      },
    },
  },
})
