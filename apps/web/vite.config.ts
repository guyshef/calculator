import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/exercises\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercises-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
      manifest: {
        name: 'Math Calculator Kids',
        short_name: 'MathKids',
        theme_color: '#FF6B35',
        background_color: '#FFF9F0',
        display: 'standalone',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    }),
  ],
  resolve: {
    alias: {
      '@calculator/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      // When running behind Docker port-mapping, the browser connects to the
      // host port, not the internal container port. VITE_HMR_PORT is set in
      // docker-compose.yml to match the exposed host port (e.g. 3010).
      clientPort: process.env.VITE_HMR_PORT ? parseInt(process.env.VITE_HMR_PORT) : undefined,
    },
    proxy: {
      '/api-proxy': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api-proxy/, ''),
      },
    },
  },
});
