import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite = fast dev server for React.
// Port 3000 is the frontend. Backend stays on 4000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
