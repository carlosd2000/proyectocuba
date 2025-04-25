import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// importacion de PWA
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // Configuración de PWA
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'], // Archivos estáticos
      devOptions: { enabled: true },
      manifest: {
        name: 'Mi App Vue PWA',
        short_name: 'VuePWA',
        description: 'Una PWA con Vue y Vite',
        theme_color: '#ffffff',
        icons: [
          {
            "src": "bank.svg",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
              "src": "vite.svg",
              "sizes": "512x512",
              "type": "image/svg+xml"
          }
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
