import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..'],
    },
  },
  test: {
    environment: 'jsdom',
    include: ['../tests/client/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/utils/**/*.js'],
      exclude: ['../tests/client/**/*.{test,spec}.{js,jsx}', 'src/main.jsx'],
    },
  },
});
