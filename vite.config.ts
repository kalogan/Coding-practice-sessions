/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// One project, two entries (the preview-harness "second entry" pattern):
//   index.html   -> production learning app      -> served at /
//   preview.html -> harness shell (inspection)   -> served at /preview (see vercel.json)
// Both mount the SAME real components + SAME algorithm registry. Never a fork.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        preview: 'preview.html',
        playground: 'playground.html',
        learn: 'learn.html',
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
