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
        ecosystem: resolve(__dirname, 'pages/ecosystem.html'),
        developers: resolve(__dirname, 'pages/developers.html'),
        community: resolve(__dirname, 'pages/community.html'),
        token: resolve(__dirname, 'pages/token.html'),
        roadmap: resolve(__dirname, 'pages/roadmap.html'),
        simulation: resolve(__dirname, 'simulation.html'),
        wallet_index: resolve(__dirname, 'wallet/index.html'),
        dex_index: resolve(__dirname, 'dex/index.html'),
        validator_dashboard: resolve(__dirname, 'validator-dashboard.html'),
        whitepaper: resolve(__dirname, 'whitepaper/OptimaChain_Whitepaper.html'),
      },
      output: {
        manualChunks: {
          vendor: ['three', 'chart.js'],
          ui: ['./src/js/ui-utils.js', './src/js/components/header.js', './src/js/components/footer.js']
        }
      }
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false
      },
      compress: {
        drop_console: true
      }
    }
  },
});
