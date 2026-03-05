import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiPort = env.VITE_API_PORT || env.PORT || '3005';
    const apiTarget = `http://localhost:${apiPort}`;
    return {
      server: {
        port: Number(env.VITE_PORT) || 3000,
        host: '0.0.0.0',
        strictPort: true,
        proxy: {
          '/api': { target: apiTarget, changeOrigin: true },
          '/auth': { target: apiTarget, changeOrigin: true },
          '/users': { target: apiTarget, changeOrigin: true },
          '/balances': { target: apiTarget, changeOrigin: true },
          '/contracts': { target: apiTarget, changeOrigin: true },
          '/transactions': { target: apiTarget, changeOrigin: true },
          '/deposits': { target: apiTarget, changeOrigin: true },
          '/payments': { target: apiTarget, changeOrigin: true },
          '/unified': { target: apiTarget, changeOrigin: true },
          '/cycles': { target: apiTarget, changeOrigin: true },
        },
      },
      plugins: [tailwindcss(), react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
