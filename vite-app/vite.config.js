import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  server: {
    port: 53819,
    host: '0.0.0.0',
    cors: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        technology: resolve(__dirname, 'technology.html'),
        ecosystem: resolve(__dirname, 'ecosystem.html'),
        developers: resolve(__dirname, 'developers.html'),
        community: resolve(__dirname, 'community.html'),
        token: resolve(__dirname, 'token.html'),
        roadmap: resolve(__dirname, 'roadmap.html'),
        wallet: resolve(__dirname, 'wallet.html'),
      },
    },
  },
});