import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  base: './',
  plugins: [VitePWA({
    registerType: 'prompt',
    includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
    manifest: {
      name: 'Cálculo VX', short_name: 'Cálculo VX', description: 'Calculadora aberta e verificável',
      lang: 'pt-BR', start_url: './', scope: './', display: 'standalone',
      background_color: '#0b1324', theme_color: '#0b1324',
      icons: [{src:'icon-192.png',sizes:'192x192',type:'image/png'}, {src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], maximumFileSizeToCacheInBytes: 6000000 }
  })],
})
