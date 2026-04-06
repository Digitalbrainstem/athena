import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: false,
    fs: {
      allow: ['..'],
    },
  },
  plugins: [
    {
      name: 'serve-content',
      configureServer(server) {
        const contentRoot = path.resolve(__dirname, '..', 'content');
        server.middlewares.use('/content', (req, res, next) => {
          const reqUrl = decodeURIComponent(req.url || '');
          const filePath = path.join(contentRoot, reqUrl);
          const resolved = path.resolve(filePath);
          if (!resolved.startsWith(contentRoot)) { next(); return; }
          if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) { next(); return; }
          const ext = path.extname(resolved).toLowerCase();
          const mimeMap: Record<string, string> = {
            '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
            '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
            '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
          };
          res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
          res.setHeader('Content-Length', fs.statSync(resolved).size.toString());
          res.setHeader('Accept-Ranges', 'bytes');
          fs.createReadStream(resolved).pipe(res);
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    root: '.',
    setupFiles: ['tests/setup.ts'],
  },
});
