import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import autoprefixer from 'autoprefixer';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  // Create necessary directories if they don't exist
  const requiredDirs = [
    'src/js/components',
    'src/js/utils',
    'public/favicons',
    'public/icons'
  ];
  
  requiredDirs.forEach(dir => {
    const fullPath = resolve(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  });
  
  return {
    plugins: [
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'OptimaChain',
          short_name: 'OptimaChain',
          description: '革新的なスケーリング技術と高度なセキュリティを統合した次世代型分散型ブロックチェーンプラットフォーム',
          theme_color: '#0066ff',
          icons: [
            {
              src: 'favicons/favicon-16x16.png',
              sizes: '16x16',
              type: 'image/png'
            },
            {
              src: 'favicons/favicon-32x32.png',
              sizes: '32x32',
              type: 'image/png'
            },
            {
              src: 'favicons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'favicons/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
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
          // simulation: resolve(__dirname, 'simulation.html'), // Commented out as file doesn't exist
          wallet_index: resolve(__dirname, 'wallet/index.html'),
          dex_index: resolve(__dirname, 'dex/index.html'),
          validator_dashboard: resolve(__dirname, 'validator-dashboard.html'),
          whitepaper: resolve(__dirname, 'whitepaper/OptimaChain_Whitepaper.html'),
        },
        output: {
          manualChunks: {
            vendor: ['three', 'chart.js'],
            ui: ['./src/js/ui-utils.js'],
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
