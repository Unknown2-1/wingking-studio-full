import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  // Assets & upload.html are reused from the preserved public deployment.
  publicDir: resolve(import.meta.dirname, '../live-public/dist'),
  build: {
    outDir: 'dist', emptyOutDir: true, target: 'es2022', manifest: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        upload: resolve(import.meta.dirname, 'upload.html'),
      },
    },
  },
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
});
