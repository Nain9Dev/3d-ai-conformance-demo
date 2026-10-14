import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat model-viewer as a custom web component
          isCustomElement: (tag) => tag === 'model-viewer',
        },
      },
    }),
  ],
  server: {
    port: 5376,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8104',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8104',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5376,
    strictPort: true,
  },
});
