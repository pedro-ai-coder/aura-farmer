import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: '0.0.0.0', port: 5173 },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
