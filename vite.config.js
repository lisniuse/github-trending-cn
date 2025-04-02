import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'development' ? '/' : './',
  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 3000,
    strictPort: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
});