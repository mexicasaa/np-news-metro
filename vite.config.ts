import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { generateRobotsTxt, generateAdsTxt } from './src/services/sitemapService';
import { processR2Upload } from './api/r2-upload.js';
import translateHandler from './api/translate.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      __APP_BUILD_TIME__: JSON.stringify(Date.now()),
      __APP_VERSION__: JSON.stringify('1.0.1'),
    },
    plugins: [
      react(),
      {
        name: 'sitemap-and-api-dev-server',
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
            if (url === '/api/translate') {
              let bodyStr = '';
              req.on('data', (chunk) => {
                bodyStr += chunk;
              });
              req.on('end', async () => {
                try {
                  const parsedBody = bodyStr ? JSON.parse(bodyStr) : {};
                  const mockReq = {
                    method: req.method,
                    body: parsedBody,
                    query: Object.fromEntries(new URL(req.url || '', 'http://localhost').searchParams.entries()),
                  };
                  let statusCode = 200;
                  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                  const mockRes = {
                    setHeader(k: string, v: string) { headers[k] = v; },
                    status(code: number) { statusCode = code; return mockRes; },
                    json(data: any) {
                      res.statusCode = statusCode;
                      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
                      res.end(JSON.stringify(data));
                    },
                    end() {
                      res.statusCode = statusCode;
                      res.end();
                    }
                  };
                  await translateHandler(mockReq, mockRes);
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err?.message || 'Dev server translate failed' }));
                }
              });
              return;
            }
            if (url === '/api/r2-upload' && req.method === 'POST') {
              let bodyStr = '';
              req.on('data', (chunk) => {
                bodyStr += chunk;
              });
              req.on('end', async () => {
                try {
                  const body = JSON.parse(bodyStr || '{}');
                  const result = await processR2Upload(body, env);
                  res.statusCode = result.status || 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(result.data));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err?.message || 'Dev server R2 upload failed' }));
                }
              });
              return;
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
  };
});