import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  return {
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
      // Fix for Netlify deployment
      outDir: 'dist',
      emptyOutDir: true,
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
            ui: ['./src/js/ui-utils.js', './src/js/components/header.js', './src/js/components/footer.js'],
            blockchain: ['./src/js/blockchain-visual.js', './src/js/blockchain-utils.js'],
            validators: ['./src/js/validator-setup.js'],
            error: ['./src/js/error-handler.js']
          },
          // Ensure CSP compatibility by avoiding inline scripts
          inlineDynamicImports: false,
          // Improve caching with content hashing
          entryFileNames: isProd ? 'assets/[name].[hash].js' : 'assets/[name].js',
          chunkFileNames: isProd ? 'assets/[name].[hash].js' : 'assets/[name].js',
          assetFileNames: isProd ? 'assets/[name].[hash].[ext]' : 'assets/[name].[ext]'
        }
      },
      // Disable sourcemaps in production for security and performance
      sourcemap: isProd ? false : 'inline',
      // Use terser for better minification
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false
        },
        compress: {
          drop_console: isProd,
          drop_debugger: isProd
        }
      },
      // CSP compatibility settings
      cssCodeSplit: true,
      // Avoid using eval() in production builds
      target: isProd ? 'es2015' : 'modules',
      // Ensure proper asset handling
      assetsInlineLimit: 4096,
      // Improve build performance
      chunkSizeWarningLimit: 1000
    },
    // Define environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
      'process.env.VITE_APP_BUILD_TIME': JSON.stringify(new Date().toISOString())
    },
    // Resolve aliases for better imports
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/js/components'),
        '@utils': resolve(__dirname, 'src/js/utils'),
        '@styles': resolve(__dirname, 'src/css')
      }
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['three', 'chart.js'],
      exclude: []
    }
  };
});
