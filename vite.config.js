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
      includeAssets: ['registerSW.js','bank.svg', 'apple-touch-icon.png', 'robots.txt'], // Archivos estáticos
      manifest: {
        name: 'CharadaApp',
        short_name: 'Charada',
        id: 'charada-app',
        lang: 'es',
        dir: 'ltr',
        start_url: '/',
        display: 'fullscreen',
        orientation: 'portrait',
        description: 'Aplicacion para llevar los registros de listeros, colectores y bancos',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        scope: '/',
        categories: [
          'business',
          'lifestyle',
          'personalization',
          'productivity',
        ],
        icons: [
          {
            src: '/bank.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/bank.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ], //END ICONS
      }, //END MANIFEST
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'] // Cachear estos archivos para offline
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
