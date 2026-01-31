import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Fix HMR WebSocket connection
        hmr: {
          port: 3000,
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Copy public folder contents to dist
      publicDir: 'public',
      build: {
        // Generate sourcemaps for debugging
        sourcemap: true,
      },
      // Fix CSP eval issue in development
      esbuild: {
        supported: {
          'top-level-await': true
        },
      },
    };
});
