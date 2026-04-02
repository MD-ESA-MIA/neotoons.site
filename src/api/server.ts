import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import contactRoutes from './routes/contact.js';
import aiRoutes from './routes/ai.js';
import ownerRoutes, {
  ownerAuthMiddleware,
  ownerRateLimitMiddleware,
  ownerCsrfMiddleware,
} from './routes/owner.js';
import { requestLogger, errorHandler } from '../utils/middleware.js';
import { log } from '../utils/logger.js';

// Load environment variables
dotenv.config();

const requireEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const validateEnv = () => {
  const required = ['CLERK_SECRET_KEY', 'CLERK_PUBLISHABLE_KEY', 'FRONTEND_URL'];
  required.forEach(requireEnv);

  const requiresDatabaseUrl = process.env.REQUIRE_DATABASE_URL === 'true';
  if (requiresDatabaseUrl) {
    requireEnv('DATABASE_URL');
  }
};

const parseOriginList = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

validateEnv();

const FRONTEND_URL = requireEnv('FRONTEND_URL');
const ALLOWED_ORIGINS = Array.from(new Set([FRONTEND_URL, ...parseOriginList(process.env.FRONTEND_URLS)]));

const cspDirectives = {
  defaultSrc: ["'self'"],
  baseUri: ["'self'"],
  frameAncestors: ["'none'"],
  objectSrc: ["'none'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
  fontSrc: ["'self'", 'data:'],
  connectSrc: ["'self'", FRONTEND_URL, 'https:', 'wss:'],
};

const app: Express = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: cspDirectives,
  },
  referrerPolicy: { policy: 'no-referrer' },
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use((req: Request, res: Response, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.info(JSON.stringify({
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      userId: req.user?.id || req.__ownerSession?.id || null,
    }));
  });
  next();
});
app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(clerkMiddleware());

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', message: 'NeoToons AI Backend is running.' });
});

// Contact routes
app.use('/api/contact', contactRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// Owner and platform data routes
app.use('/api', requireAuth(), ownerAuthMiddleware, ownerRateLimitMiddleware, ownerCsrfMiddleware, ownerRoutes);

// Error handling middleware
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      path: req.path,
      requestId: req.requestId || null,
      timestamp: new Date().toISOString(),
    },
  });
});

app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  log.info('NeoToons AI backend started', {
    port: PORT,
    emailService: process.env.EMAIL_USER ? 'configured' : 'not_configured',
    frontendUrl: FRONTEND_URL,
    allowedOrigins: ALLOWED_ORIGINS,
  });
});

export default app;
