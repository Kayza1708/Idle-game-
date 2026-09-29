import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The stability suite measures wall-clock simulation time. Running it in
  // parallel with every other CPU-heavy simulation makes that assertion a
  // scheduler benchmark rather than a game-performance regression check.
  test: { environment: 'node', maxWorkers: 1 },
});
