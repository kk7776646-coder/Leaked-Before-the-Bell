import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { authRouter, extractAuth } from './server/authRoutes';
import { initStorage } from './server/storage';
import { isSupabaseConfigured } from './server/supabase';

async function startServer() {
  // Initialize storage directories
  initStorage();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middlewares
  const configuredCorsOrigin = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*'
    ? process.env.CORS_ORIGIN
    : true;
  app.use(cors({ origin: configuredCorsOrigin, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(extractAuth);

  // API Routes FIRST
  app.use('/api/auth', authRouter);
  app.use('/api', apiRouter);

  // Health check endpoints (root /health for Render and /api/health)
  const getHealthResponse = () => ({
    status: 'ok',
    service: 'LeakLens Production API',
    timestamp: new Date().toISOString(),
    supabase: {
      configured: isSupabaseConfigured(),
      url: process.env.SUPABASE_URL || 'https://wnemytwacfsekuwfqadr.supabase.co',
      bucket: 'documents',
    },
    environment: process.env.NODE_ENV || 'development',
  });

  app.get('/health', (req, res) => {
    res.json(getHealthResponse());
  });

  app.get('/api/health', (req, res) => {
    res.json(getHealthResponse());
  });

  // Vite middleware for development / Static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LeakLens Server] Running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
