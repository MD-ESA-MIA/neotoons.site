import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { log } from './logger.js';

/**
 * Secure authentication and authorization middleware
 */

interface JWTPayload {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'owner' | 'admin' | 'member';
      };
      startTime?: number;
      requestId?: string;
    }
  }
}

const getRequestContext = (req: Request) => ({
  requestId: req.requestId,
  ip: req.ip,
  userAgent: req.get('user-agent') || 'unknown',
});

/**
 * Validate JWT token from Authorization header
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  req.startTime = Date.now();

  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    log.warn('[AUTH] Missing token', { ...getRequestContext(req), path: req.path });
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256']
    }) as JWTPayload;

    // Check token expiry with buffer (token should not be used close to expiry)
    const timeUntilExpiry = (payload.exp * 1000) - Date.now();
    if (timeUntilExpiry < 60000) { // Less than 1 minute
      log.warn('[AUTH] Token near expiry', { userId: payload.id, ...getRequestContext(req) });
      return res.status(401).json({ error: 'Token expiring soon, please refresh' });
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role
    };

    log.api(req.method, req.path, 200, 0, req.user.id);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      log.warn('[AUTH] Token expired', { ...getRequestContext(req) });
      return res.status(401).json({ error: 'Token expired, please login again' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      log.warn('[AUTH] Invalid token', { error: error.message, ...getRequestContext(req) });
      return res.status(403).json({ error: 'Invalid token' });
    }
    log.error('[AUTH] Token validation error', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Check user is admin or owner
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!['admin', 'owner'].includes(req.user.role)) {
    log.security('Unauthorized admin access attempt', 'high', {
      userId: req.user.id,
      requestedPath: req.path,
      userRole: req.user.role,
      ...getRequestContext(req),
    });
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

/**
 * Check user is owner
 */
export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'owner') {
    log.security('Unauthorized owner access attempt', 'medium', {
      userId: req.user.id,
      userRole: req.user.role,
      ...getRequestContext(req),
    });
    return res.status(403).json({ error: 'Owner access required' });
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      return next();
    }

    const payload = jwt.verify(token, secret) as JWTPayload;
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    // Ignore errors - user just won't be authenticated
  }

  next();
};

/**
 * Rate limiting per user/IP
 * Use Redis in production for distributed rate limiting
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.user?.id || req.ip || 'unknown';
    const now = Date.now();

    let record = rateLimitStore.get(key);

    // Reset if window expired
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(key, record);
    }

    record.count++;

    // Send rate limit info in headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
      'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString()
    });

    if (record.count > maxRequests) {
      log.security('Rate limit exceeded', 'medium', {
        userId: req.user?.id || 'anonymous',
        ...getRequestContext(req),
        limit: maxRequests,
        window: `${windowMs / 1000}s`
      });

      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    next();
  };
};

/**
 * Stricter rate limiting for auth endpoints
 */
export const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

/**
 * Moderate rate limiting for API calls
 */
export const apiRateLimit = rateLimit(100, 60 * 1000); // 100 requests per minute

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  req.requestId = req.header('x-request-id') || randomUUID();
  res.setHeader('x-request-id', req.requestId);

  // Log response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    log.api(req.method, req.path, res.statusCode, duration, req.user?.id, {
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
    });
    return originalSend.call(this, data);
  };

  next();
};

/**
 * CSRF protection
 */
export const verifyCsrf = (req: Request, res: Response, next: NextFunction) => {
  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.header('x-csrf-token');
  const cookieHeader = req.headers.cookie || '';
  const cookieCsrf = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('csrf_token='))
    ?.split('=')
    .slice(1)
    .join('=');

  if (!csrfToken || !cookieCsrf || csrfToken !== cookieCsrf) {
    log.security('CSRF token validation failed', 'high', {
      userId: req.user?.id,
      ...getRequestContext(req),
      path: req.path
    });
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

/**
 * Error handler for all routes
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.error(`Unhandled error: ${req.method} ${req.path}`, err, {
    userId: req.user?.id,
    ip: req.ip
  });

  // Don't leak error details in production
  const isDev = process.env.NODE_ENV !== 'production';
  const message = isDev ? err.message : 'Internal server error';

  const payload: Record<string, unknown> = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      path: req.path,
      requestId: req.requestId || null,
      timestamp: new Date().toISOString(),
    },
  };

  if (isDev) {
    (payload.error as Record<string, unknown>).stack = err.stack;
  }

  res.status(500).json(payload);
};
