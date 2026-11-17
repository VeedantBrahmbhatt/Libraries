import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Libraries/',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
});
