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
        simulation: resolve(__dirname, 'simulation.html'),
        wallet_index: resolve(__dirname, 'wallet/index.html'),
        dex_index: resolve(__dirname, 'dex/index.html'),
      },
    },
  },
});
