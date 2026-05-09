import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Marginalia is built independently from the Atlas. Cloudflare Pages should
// be configured to build from this `marginalia/` subdirectory: `yarn build`
// in this folder, output `marginalia/dist/`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
