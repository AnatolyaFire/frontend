import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Конфиг Vite для production на сервере с nginx
export default defineConfig({
  plugins: [react()],

  // ⚙️ Важно! Указываем базовый путь деплоя
  base: '/app/',

  // Настройки дев-сервера (локально)
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/token': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Дополнительно: билд-оптимизация для прода
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
});
