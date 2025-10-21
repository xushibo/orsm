import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true
  },
  resolve: {
    alias: {
      '@': '/Users/bo/polyv/1024/object-recognition-story-machine/worker/src'
    }
  }
});
