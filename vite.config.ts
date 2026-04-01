import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: env.VITE_API_URL || 'http://localhost:5000',
            changeOrigin: true,
          },
        },
      },
      plugins: [
        react(),
        tailwindcss(),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
