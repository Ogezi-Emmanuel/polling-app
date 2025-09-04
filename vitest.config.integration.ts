import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['lib/**/*.integration.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
    environment: 'node',
    // You might need to adjust the timeout for integration tests
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});