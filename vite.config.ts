import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { generateRobotsTxt, generateAdsTxt } from './src/services/sitemapService';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sitemap-dev-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0];
          if (url === '/robots.txt') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(generateRobotsTxt());
          }
          if (url === '/ads.txt') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(generateAdsTxt());
          }
          next();
        });
      },
    },
  ],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});