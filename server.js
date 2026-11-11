import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware: CORS
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, same-origin)
    if (!origin || NODE_ENV === 'development') return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for initial cloud deployment
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware: Request Parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Middleware: Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'EduMaster Tuition Management Platform',
    version: '2.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Dynamic Import & Route Mount
async function startServer() {
  try {
    const authRoutes = (await import('./routes/authRoutes.js')).default;
    const paymentRoutes = (await import('./routes/paymentRoutes.js')).default;
    const studentRoutes = (await import('./routes/student.js')).default;
    const exportRoutes = (await import('./routes/exportRoutes.js')).default;

    // Mount API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/student', studentRoutes);
    app.use('/api/export', exportRoutes);

    console.log('[Routes] Mounted /api/auth, /api/payment, /api/student, /api/export');

    // Production Static Serving
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      console.log(`[Static] Serving frontend from ${distPath}`);
      app.use(express.static(distPath));
    } else {
      console.warn('[Static] Warning: dist folder not found. Run `npm run build` to generate production frontend.');
      app.get('/', (req, res) => {
        res.json({
          message: 'EduMaster Backend API is live. Build the frontend (`npm run build`) to serve the client UI.'
        });
      });
    }

    // 404 handler for unknown API routes
    app.use('/api', (req, res) => {
      res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`
      });
    });

    // SPA fallback: Any non-API request serves dist/index.html
    if (fs.existsSync(distPath)) {
      app.use((req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error('[Unhandled Error]', err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(NODE_ENV === 'development' ? { stack: err.stack } : {})
      });
    });

    // Start Listening
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`🚀 EduMaster Server running in ${NODE_ENV.toUpperCase()} mode`);
      console.log(`🌐 Public Port: ${PORT}`);
      console.log(`🩺 Healthcheck: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });

    // Graceful Shutdown
    const handleShutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] Closed all pending connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
