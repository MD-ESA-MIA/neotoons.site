import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { log } from '../../utils/logger';

const router: Router = express.Router();

const requireEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const JWT_SECRET = requireEnv('JWT_SECRET');
const ADMIN_SESSION_SECRET = requireEnv('ADMIN_SESSION_SECRET');
const COOKIE_SECURE = process.env.NODE_ENV === 'production';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  handler: (req, res) => {
    log.security('Auth rate limit exceeded', 'medium', {
      ...getLogContext(req),
      path: req.path,
    });
    res.status(429).json({ error: 'Too many authentication attempts. Please try again later.' });
  },
});

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  passwordHash: string;
  createdAt: Date;
}

const mockUsers: Map<string, User> = new Map();

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, pair) => {
      const [rawKey, ...rest] = pair.split('=');
      if (!rawKey || rest.length === 0) return acc;
      acc[rawKey] = decodeURIComponent(rest.join('='));
      return acc;
    }, {});
};

const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyAuthToken = (token: string): { id: string; email: string; username: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; username: string };
  } catch (_error) {
    return null;
  }
};

const getAdminEmails = () => {
  const configured = process.env.CLERK_ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
  return configured
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const getRoleByEmail = (email: string): 'owner' | 'admin' | 'member' => {
  const adminEmails = getAdminEmails();
  const normalized = email.toLowerCase();
  if (!adminEmails.includes(normalized)) return 'member';
  return adminEmails[0] === normalized ? 'owner' : 'admin';
};

const issueAdminCookie = (res: Response, user: User) => {
  if (user.role !== 'owner' && user.role !== 'admin') {
    res.clearCookie('admin_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: COOKIE_SECURE,
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    });
    res.clearCookie('csrf_token', {
      httpOnly: false,
      sameSite: 'strict',
      secure: COOKIE_SECURE,
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    });
    return;
  }

  const adminToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    ADMIN_SESSION_SECRET,
    { expiresIn: '1d' }
  );

  res.cookie('admin_token', adminToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });

  const csrfToken = randomBytes(32).toString('hex');
  res.cookie('csrf_token', csrfToken, {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const getLogContext = (req: Request) => ({
  requestId: req.requestId,
  ip: req.ip,
  userAgent: req.get('user-agent') || 'unknown',
});

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name, username } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = Array.from(mockUsers.values()).find((u) => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = `user_${Date.now()}`;
    const newUser: User = {
      id: userId,
      email,
      name,
      username,
      role: getRoleByEmail(email),
      passwordHash,
      createdAt: new Date(),
    };

    mockUsers.set(userId, newUser);

    const token = generateToken(newUser);
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    issueAdminCookie(res, newUser);

    log.auth('register', newUser.id, {
      ...getLogContext(req),
      role: newUser.role,
    });

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    log.error('Registration failed', error, { ...getLogContext(req), path: req.path });
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = Array.from(mockUsers.values()).find((u) => u.email === email);
    if (!user) {
      log.auth('failed_login', 'unknown', { ...getLogContext(req), reason: 'unknown_email' });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      log.auth('failed_login', user.id, { ...getLogContext(req), reason: 'invalid_password' });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    issueAdminCookie(res, user);

    log.auth('login', user.id, {
      ...getLogContext(req),
      role: user.role,
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    log.error('Login failed', error, { ...getLogContext(req), path: req.path });
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

router.get('/me', (req: Request, res: Response) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.auth_token;

  if (!token) {
    log.warn('Session lookup without auth cookie', { ...getLogContext(req), path: req.path });
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    log.security('Invalid auth session cookie', 'medium', {
      ...getLogContext(req),
      path: req.path,
    });
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const user = Array.from(mockUsers.values()).find((item) => item.id === payload.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
  });
});

router.patch('/me', (req: Request, res: Response) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    log.security('Invalid auth session cookie', 'medium', {
      ...getLogContext(req),
      path: req.path,
    });
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const user = Array.from(mockUsers.values()).find((item) => item.id === payload.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, username } = req.body || {};
  if (typeof name === 'string' && name.trim()) {
    user.name = name.trim();
  }
  if (typeof username === 'string' && username.trim()) {
    user.username = username.trim();
  }

  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
  });
});

router.post('/logout', (_req: Request, res: Response) => {
  const cookies = parseCookies(_req.headers.cookie);
  const logoutPayload = cookies.auth_token ? verifyAuthToken(cookies.auth_token) : null;
  res.clearCookie('auth_token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: COOKIE_SECURE,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
  res.clearCookie('admin_token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: COOKIE_SECURE,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
  res.clearCookie('csrf_token', {
    httpOnly: false,
    sameSite: 'strict',
    secure: COOKIE_SECURE,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
  log.auth('logout', logoutPayload?.id || 'unknown', { ...getLogContext(_req), path: '/api/auth/logout' });
  res.json({ success: true });
});

export default router;
