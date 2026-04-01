import express, { Request, Response, Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { counterRateLimitStore } from '../lib/rateLimitStore';
import { log } from '../../utils/logger';

type UserRole = 'owner' | 'admin' | 'member';

interface OwnerUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: string;
  joinedAt: number;
  createdAt: number;
  lastActive: number;
  generationCount: number;
  isBanned: boolean;
  isOnline: boolean;
  avatar?: string;
}

interface ActivityRecord {
  id: string;
  userId: string;
  adminId: string;
  userName: string;
  type: string;
  description: string;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

interface ToolUsageRecord {
  id: string;
  tool: string;
  calls: number;
  avgTokens: number;
  successRate: number;
  createdAt: number;
}

interface AdminSessionPayload {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      __ownerSession?: AdminSessionPayload;
    }
  }
}

const router: Router = express.Router();

const DB_DIR = path.resolve(process.cwd(), 'db');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const ACTIVITY_FILE = path.join(DB_DIR, 'activity.json');
const TOOLS_USAGE_FILE = path.join(DB_DIR, 'ai-tools-usage.json');

const defaultToolsUsage: ToolUsageRecord[] = [
  { id: 'tool_story_generator', tool: 'story_generator', calls: 0, avgTokens: 0, successRate: 100, createdAt: Date.now() },
  { id: 'tool_script_rewriter', tool: 'script_rewriter', calls: 0, avgTokens: 0, successRate: 100, createdAt: Date.now() },
  { id: 'tool_voice_engine', tool: 'voice_engine', calls: 0, avgTokens: 0, successRate: 100, createdAt: Date.now() },
  { id: 'tool_image_prompt', tool: 'image_prompt', calls: 0, avgTokens: 0, successRate: 100, createdAt: Date.now() },
  { id: 'tool_social_posts', tool: 'social_posts', calls: 0, avgTokens: 0, successRate: 100, createdAt: Date.now() },
];

const toEpoch = (value: unknown, fallback: number = Date.now()) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const getAdminId = (req: Request) => {
  if (req.__ownerSession?.id) return req.__ownerSession.id;
  return 'owner_system';
};

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) return {} as Record<string, string>;
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

const getLogContext = (req: Request) => ({
  requestId: req.requestId,
  ip: req.ip,
  userAgent: req.get('user-agent') || 'unknown',
});

export const ownerRequestLogger = (req: Request, _res: Response, next: () => void) => {
  const start = Date.now();
  _res.on('finish', () => {
    log.api(req.method, req.path, _res.statusCode, Date.now() - start, req.__ownerSession?.id, getLogContext(req));
  });
  next();
};

const logRouteError = (req: Request, error: unknown) => {
  const err = error as { message?: string };
  log.error('Owner route failed', err instanceof Error ? err : new Error(err?.message || 'Unknown error'), {
    path: req.path,
    userId: req.__ownerSession?.id,
    ...getLogContext(req),
  });
};

const rotateCsrfToken = (res: Response) => {
  const newToken = randomBytes(32).toString('hex');
  res.cookie('csrf_token', newToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const ownerCsrfMiddleware = (req: Request, res: Response, next: () => void) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const cookies = parseCookies(req.headers.cookie);
  const csrfCookie = cookies.csrf_token;
  const csrfHeader = req.header('x-csrf-token');

  if (!csrfCookie || !csrfHeader || csrfHeader !== csrfCookie) {
    log.security('Owner CSRF token validation failed', 'high', {
      userId: req.__ownerSession?.id,
      ...getLogContext(req),
      path: req.path,
    });
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

export const ownerRateLimitMiddleware = (req: Request, res: Response, next: () => void) => {
  const key = req.__ownerSession?.id || req.ip || 'owner_unknown';
  const { count } = counterRateLimitStore.increment(key, RATE_LIMIT_WINDOW_MS);

  if (count > RATE_LIMIT_MAX_REQUESTS) {
    log.security('Owner rate limit exceeded', 'medium', {
      userId: req.__ownerSession?.id,
      ...getLogContext(req),
      path: req.path,
      limit: RATE_LIMIT_MAX_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });
    return res.status(429).json({ error: 'Too many owner requests. Please retry shortly.' });
  }

  next();
};

export const ownerAuthMiddleware = (req: Request, res: Response, next: () => void) => {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) {
    return res.status(500).json({ error: 'Missing ADMIN_SESSION_SECRET' });
  }
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.admin_token;

  if (!token) {
    log.warn('Missing admin session cookie', { ...getLogContext(req), path: req.path });
    return res.status(401).json({ error: 'Missing admin session' });
  }

  try {
    const payload = jwt.verify(token, secret) as AdminSessionPayload;
    if (!payload || (payload.role !== 'owner' && payload.role !== 'admin')) {
      log.security('Invalid admin session role', 'high', {
        ...getLogContext(req),
        path: req.path,
        role: payload?.role,
      });
      return res.status(403).json({ error: 'Owner access required' });
    }

    req.__ownerSession = payload;
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (_error) {
    log.security('Invalid or expired admin session', 'medium', {
      ...getLogContext(req),
      path: req.path,
    });
    return res.status(401).json({ error: 'Invalid or expired admin session' });
  }
};

const safeParse = <T>(raw: string, fallback: T): T => {
  try {
    return JSON.parse(raw) as T;
  } catch (_error) {
    return fallback;
  }
};

const normalizeRole = (role: unknown): UserRole => {
  if (role === 'owner' || role === 'admin' || role === 'member') return role;
  if (role === 'user') return 'member';
  return 'member';
};

const buildSeedUsers = (): OwnerUserRecord[] => {
  const now = Date.now();
  const ownerEmails = (process.env.CLERK_ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'owner@neotoons.ai')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  return ownerEmails.map((email, index) => ({
    id: `seed-owner-${index + 1}`,
    name: index === 0 ? 'Platform Owner' : `Admin ${index}`,
    email,
    role: index === 0 ? 'owner' : 'admin',
    plan: 'studio',
    joinedAt: now,
    createdAt: now,
    lastActive: now,
    generationCount: 0,
    isBanned: false,
    isOnline: true,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
  }));
};

const ensureDbFiles = async () => {
  await fs.mkdir(DB_DIR, { recursive: true });

  try {
    await fs.access(USERS_FILE);
  } catch (_error) {
    await fs.writeFile(USERS_FILE, JSON.stringify(buildSeedUsers(), null, 2), 'utf-8');
  }

  try {
    await fs.access(ACTIVITY_FILE);
  } catch (_error) {
    await fs.writeFile(ACTIVITY_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  try {
    await fs.access(TOOLS_USAGE_FILE);
  } catch (_error) {
    await fs.writeFile(TOOLS_USAGE_FILE, JSON.stringify(defaultToolsUsage, null, 2), 'utf-8');
  }
};

const readUsers = async (): Promise<OwnerUserRecord[]> => {
  await ensureDbFiles();
  const raw = await fs.readFile(USERS_FILE, 'utf-8');
  const parsed = safeParse<OwnerUserRecord[]>(raw, []);

  return parsed.map((user) => ({
    ...user,
    role: normalizeRole(user.role),
    generationCount: Number(user.generationCount || 0),
    isBanned: Boolean(user.isBanned),
    isOnline: typeof user.isOnline === 'boolean' ? user.isOnline : true,
    joinedAt: toEpoch(user.joinedAt ?? user.createdAt),
    createdAt: toEpoch(user.createdAt ?? user.joinedAt),
    lastActive: toEpoch(user.lastActive),
    plan: user.plan || 'free',
  }));
};

const writeUsers = async (users: OwnerUserRecord[]) => {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
};

const readActivity = async (): Promise<ActivityRecord[]> => {
  await ensureDbFiles();
  const raw = await fs.readFile(ACTIVITY_FILE, 'utf-8');
  const parsed = safeParse<ActivityRecord[]>(raw, []);
  return parsed.map((item) => ({
    ...item,
    createdAt: toEpoch(item.createdAt),
    adminId: item.adminId || 'owner_system',
  }));
};

const writeActivity = async (items: ActivityRecord[]) => {
  await fs.writeFile(ACTIVITY_FILE, JSON.stringify(items, null, 2), 'utf-8');
};

const readToolUsage = async (): Promise<ToolUsageRecord[]> => {
  await ensureDbFiles();
  const raw = await fs.readFile(TOOLS_USAGE_FILE, 'utf-8');
  const parsed = safeParse<ToolUsageRecord[]>(raw, defaultToolsUsage);
  return parsed.map((tool, index) => ({
    ...tool,
    id: tool.id || `tool_${tool.tool || index}`,
    createdAt: toEpoch(tool.createdAt),
  }));
};

const logActivity = async (entry: Omit<ActivityRecord, 'id' | 'createdAt'>) => {
  const activity = await readActivity();
  const item: ActivityRecord = {
    id: `activity_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    ...entry,
  };
  const next = [item, ...activity].slice(0, 200);
  await writeActivity(next);
};

router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (error: any) {
    logRouteError(_req, error);
    res.status(500).json({ error: error.message || 'Failed to load users' });
  }
});

router.post('/users', async (req: Request, res: Response) => {
  try {
    const incoming = req.body || {};
    if (!incoming.id || !incoming.email) {
      return res.status(400).json({ error: 'id and email are required' });
    }

    const users = await readUsers();
    const existingIndex = users.findIndex((user) => user.id === incoming.id || user.email === incoming.email);
    const now = Date.now();

    const record: OwnerUserRecord = {
      id: String(incoming.id),
      name: String(incoming.name || incoming.displayName || 'User'),
      email: String(incoming.email),
      role: normalizeRole(incoming.role),
      plan: String(incoming.plan || 'free'),
      joinedAt: toEpoch(incoming.joinedAt ?? incoming.createdAt, now),
      createdAt: toEpoch(incoming.createdAt, now),
      lastActive: toEpoch(incoming.lastActive, now),
      generationCount: Number(incoming.generationCount || 0),
      isBanned: Boolean(incoming.isBanned),
      isOnline: true,
      avatar: incoming.avatar ? String(incoming.avatar) : undefined,
    };

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...record, lastActive: now };
    } else {
      users.unshift(record);
      await logActivity({
        userId: record.id,
        adminId: getAdminId(req),
        userName: record.name,
        type: 'USER_CREATED',
        description: `${record.name} joined the platform.`,
        metadata: { source: 'api_users_post' },
      });
    }

    await writeUsers(users);
    log.audit('OWNER_USER_UPSERT', getAdminId(req), record.id, {
      email: record.email,
      role: record.role,
    }, { path: req.path });
    res.json({ success: true, user: record });
  } catch (error: any) {
    logRouteError(req, error);
    res.status(500).json({ error: error.message || 'Failed to save user' });
  }
});

router.post('/users/update-role', async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body || {};
    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    const users = await readUsers();
    const index = users.findIndex((user) => user.id === userId);
    if (index < 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[index].role = normalizeRole(role);
    users[index].lastActive = Date.now();
    await writeUsers(users);

    await logActivity({
      userId: users[index].id,
      adminId: getAdminId(req),
      userName: users[index].name,
      type: 'USER_ROLE_UPDATED',
      description: `Role changed to ${users[index].role}.`,
      metadata: { role: users[index].role },
    });

    rotateCsrfToken(res);
    log.audit('OWNER_USER_ROLE_UPDATED', getAdminId(req), users[index].id, {
      role: users[index].role,
    }, { path: req.path });
    res.json({ success: true, user: users[index] });
  } catch (error: any) {
    logRouteError(req, error);
    res.status(500).json({ error: error.message || 'Failed to update role' });
  }
});

router.patch('/users/:userId/role', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const role = req.body?.role;
    if (!role) {
      return res.status(400).json({ error: 'role is required' });
    }

    const users = await readUsers();
    const index = users.findIndex((user) => user.id === userId);
    if (index < 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[index].role = normalizeRole(role);
    users[index].lastActive = Date.now();
    await writeUsers(users);

    await logActivity({
      userId: users[index].id,
      adminId: getAdminId(req),
      userName: users[index].name,
      type: 'USER_ROLE_UPDATED',
      description: `Role changed to ${users[index].role}.`,
      metadata: { role: users[index].role },
    });

    rotateCsrfToken(res);
    res.json({ success: true, user: users[index] });
  } catch (error: any) {
    logRouteError(req, error);
    res.status(500).json({ error: error.message || 'Failed to update role' });
  }
});

router.patch('/users/:userId/ban', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { isBanned } = req.body || {};

    const users = await readUsers();
    const index = users.findIndex((user) => user.id === userId);
    if (index < 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[index].isBanned = Boolean(isBanned);
    users[index].lastActive = Date.now();
    await writeUsers(users);

    await logActivity({
      userId: users[index].id,
      adminId: getAdminId(req),
      userName: users[index].name,
      type: users[index].isBanned ? 'USER_BANNED' : 'USER_UNBANNED',
      description: users[index].isBanned ? 'User was banned.' : 'User was unbanned.',
      metadata: { isBanned: users[index].isBanned },
    });

    log.audit('OWNER_USER_BAN_UPDATED', getAdminId(req), users[index].id, {
      isBanned: users[index].isBanned,
    }, { path: req.path });
    res.json({ success: true, user: users[index] });
  } catch (error: any) {
    logRouteError(req, error);
    res.status(500).json({ error: error.message || 'Failed to update ban state' });
  }
});

router.delete('/users/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const users = await readUsers();
    const target = users.find((user) => user.id === userId);
    const next = users.filter((user) => user.id !== userId);

    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    await writeUsers(next);
    await logActivity({
      userId,
      adminId: getAdminId(req),
      userName: target.name,
      type: 'USER_DELETED',
      description: `${target.name} was deleted by owner.`,
      metadata: { deletedUserId: userId },
    });

    rotateCsrfToken(res);
    log.audit('OWNER_USER_DELETED', getAdminId(req), userId, {
      deletedUserName: target.name,
    }, { path: req.path });
    res.json({ success: true });
  } catch (error: any) {
    logRouteError(req, error);
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const users = await readUsers();
    const activity = await readActivity();

    const totalUsers = users.length;
    const totalGenerations = users.reduce((sum, user) => sum + Number(user.generationCount || 0), 0);
    const activeUsers = users.filter((user) => !user.isBanned).length;
    const revenue = 0;

    const payload = {
      totalUsers,
      totalGenerations,
      activeUsers,
      revenue,
      totalRevenue: revenue,
      avgCostPerRequest: 0,
      profitMargin: 0,
      growth: 0,
      growthData: [
        { name: 'Mon', users: totalUsers, revenue: revenue },
        { name: 'Tue', users: totalUsers, revenue: revenue },
        { name: 'Wed', users: totalUsers, revenue: revenue },
        { name: 'Thu', users: totalUsers, revenue: revenue },
        { name: 'Fri', users: totalUsers, revenue: revenue },
        { name: 'Sat', users: totalUsers, revenue: revenue },
        { name: 'Sun', users: totalUsers, revenue: revenue },
      ],
      revenueData: [
        { name: 'Mon', revenue },
        { name: 'Tue', revenue },
        { name: 'Wed', revenue },
        { name: 'Thu', revenue },
        { name: 'Fri', revenue },
        { name: 'Sat', revenue },
        { name: 'Sun', revenue },
      ],
      activityData: [
        { name: 'Mon', activity: activity.length },
        { name: 'Tue', activity: activity.length },
        { name: 'Wed', activity: activity.length },
        { name: 'Thu', activity: activity.length },
        { name: 'Fri', activity: activity.length },
        { name: 'Sat', activity: activity.length },
        { name: 'Sun', activity: activity.length },
      ],
    };

    res.json(payload);
  } catch (error: any) {
    logRouteError(_req, error);
    res.status(500).json({ error: error.message || 'Failed to load dashboard' });
  }
});

router.get('/activity', async (_req: Request, res: Response) => {
  try {
    const activity = await readActivity();
    res.json(activity.slice(0, 100));
  } catch (error: any) {
    logRouteError(_req, error);
    res.status(500).json({ error: error.message || 'Failed to load activity' });
  }
});

router.get('/system-status', async (_req: Request, res: Response) => {
  try {
    const users = await readUsers();
    res.json({
      status: 'healthy',
      message: 'Owner backend API is operational.',
      services: {
        usersApi: 'up',
        dashboardApi: 'up',
        activityApi: 'up',
      },
      metrics: {
        totalUsers: users.length,
        timestamp: Date.now(),
      },
    });
  } catch (error: any) {
    logRouteError(_req, error);
    res.status(500).json({ error: error.message || 'Failed to read system status' });
  }
});

router.get('/ai/tools', async (_req: Request, res: Response) => {
  try {
    const tools = await readToolUsage();
    res.json({
      tools,
      updatedAt: Date.now(),
    });
  } catch (error: any) {
    logRouteError(_req, error);
    res.status(500).json({ error: error.message || 'Failed to load AI tools usage' });
  }
});

export default router;