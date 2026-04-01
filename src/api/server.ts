import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import contactRoutes from './routes/contact';
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import ownerRoutes, {
  ownerAuthMiddleware,
  ownerRateLimitMiddleware,
  ownerCsrfMiddleware,
} from './routes/owner';
import { requestLogger, errorHandler } from '../utils/middleware';
import { log } from '../utils/logger';

// Load environment variables
dotenv.config();

const requireEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const parseOriginList = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

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
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', message: 'NeoToons AI Backend is running.' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Contact routes
app.use('/api/contact', contactRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// Owner and platform data routes
app.use('/api', ownerAuthMiddleware, ownerRateLimitMiddleware, ownerCsrfMiddleware, ownerRoutes);

// Error handling middleware
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
