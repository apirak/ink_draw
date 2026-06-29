import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        bird: resolve(__dirname, 'bird.html'),
        koi: resolve(__dirname, 'koi.html'),
      },
    },
  },
});
