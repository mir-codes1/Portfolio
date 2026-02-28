import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.ktx2'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-three':   ['three'],
          'vendor-r3f':     ['@react-three/fiber', '@react-three/drei'],
          'vendor-post':    ['@react-three/postprocessing'],
          'vendor-spring':  ['@react-spring/three'],
          'vendor-zustand': ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
