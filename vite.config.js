import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo-.png'],
      manifest: {
        name: 'mecaphi',
        short_name: 'mecaphi',
        description: 'Mecaphi - Sistema ERP para Autopeças e Ferro Velho',
        theme_color: '#1E3A8A',
        background_color: '#F3F4F6',
        display: 'standalone',
        icons: [
          {
            src: 'logo-.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
