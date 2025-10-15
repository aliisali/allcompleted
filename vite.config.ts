import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1500,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            return 'vendor-libs';
          }
          if (id.includes('/components/Admin/')) {
            return 'admin';
          }
          if (id.includes('/components/Dashboard/')) {
            return 'dashboards';
          }
          if (id.includes('/components/Jobs/')) {
            return 'jobs';
          }
          if (id.includes('/components/ARModule/')) {
            return 'ar-modules';
          }
        }
      }
    }
  },
  define: {
    global: 'window',
    'process.env': {},
    process: {
      env: {}
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
