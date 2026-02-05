import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // GitHub Pages: set VITE_BASE_PATH in CI to e.g. /GrowDay/ for https://username.github.io/GrowDay/
    const base = process.env.VITE_BASE_PATH ?? '/';
    return {
      base,
      server: {
        port: 3000,
        host: 'localhost',
        strictPort: false, // Allow fallback to next available port
        // Fix HMR WebSocket connection
        hmr: {
          port: 3000,
          protocol: 'ws',
          host: 'localhost',
          clientPort: 3000,
        },
        // Add headers to fix Cross-Origin-Opener-Policy for Firebase Auth
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        },
      },
      plugins: [react(), tailwindcss()],
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
