import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: './', // works for static hosts and GitHub Pages out of the box
  server: {
    port: 5173,
    strictPort: true, // fail instead of silently drifting to 5174/5175
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
