import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/customers': 'http://localhost:3001',
      '/api/restaurants': 'http://localhost:3002',
      '/api/drivers': 'http://localhost:3003',
      '/api/orders': 'http://localhost:3004',
      '/api/payments': 'http://localhost:3004',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});