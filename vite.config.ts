import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows process.env.API_KEY to work during build/preview if needed,
    // though for security in client-side apps, ensure you understand how your env vars are exposed.
    'process.env': process.env
  }
});