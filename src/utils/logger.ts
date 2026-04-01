import fs from 'node:fs';
import path from 'node:path';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const levelOrder: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const resolvedLevel = (process.env.LOG_LEVEL as LogLevel | undefined) || (process.env.NODE_ENV === 'production' ? 'warn' : 'info');

const redactSensitiveData = (value: string): string => {
  return value
    .replace(/password["\s:]*["\w]*/gi, 'password: [REDACTED]')
    .replace(/token["\s:]*["\w]*/gi, 'token: [REDACTED]')
    .replace(/api[_-]?key["\s:]*["\w]*/gi, 'api_key: [REDACTED]')
    .replace(/email["\s:]*["\w.]+/gi, 'email: [REDACTED]')
    .replace(/phone["\s:]*["\w\-\+]+/gi, 'phone: [REDACTED]')
    .replace(/ssn["\s:]*[\d\-]+/gi, 'ssn: [REDACTED]')
    .replace(/card[_-]?number["\s:]*[\d]+/gi, 'card_number: [REDACTED]');
};

const serializeMeta = (meta?: Record<string, any>): string => {
  if (!meta || Object.keys(meta).length === 0) {
    return '';
  }

  try {
    return JSON.stringify(meta);
  } catch (_error) {
    return '[unserializable-meta]';
  }
};

const appendLog = (fileName: string, payload: Record<string, any>) => {
  try {
    fs.appendFileSync(path.join(logsDir, fileName), `${JSON.stringify(payload)}\n`, 'utf-8');
  } catch (_error) {
    // Logging must never break the app.
  }
};

const shouldLog = (level: LogLevel) => levelOrder[level] <= levelOrder[resolvedLevel];

const write = (level: LogLevel, message: string, meta?: Record<string, any>) => {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const redactedMessage = redactSensitiveData(message);
  const payload = {
    level,
    timestamp,
    message: redactedMessage,
    meta: meta || {},
  };

  const line = `[${timestamp}] [${level.toUpperCase()}] ${redactedMessage}${meta && Object.keys(meta).length ? ` ${serializeMeta(meta)}` : ''}`;

  if (level === 'error') {
    console.error(line);
    appendLog('error.log', payload);
  } else if (level === 'warn') {
    console.warn(line);
    appendLog('combined.log', payload);
  } else {
    console.info(line);
    appendLog('combined.log', payload);
  }
};

const logger = {
  info: (message: string, meta?: Record<string, any>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, any>) => write('warn', message, meta),
  error: (message: string, error?: Error | unknown, meta?: Record<string, any>) => {
    if (error instanceof Error) {
      write('error', message, { ...meta, error: error.message, stack: error.stack });
      return;
    }

    write('error', message, meta);
  },
  audit: (action: string, userId: string, targetId: string, changes: Record<string, any>, meta?: Record<string, any>) => {
    const payload = {
      action,
      adminId: userId,
      targetId,
      changes,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    write('info', `[AUDIT] ${action}`, payload);
    appendLog('audit.log', { level: 'info', timestamp: new Date().toISOString(), message: `[AUDIT] ${action}`, meta: payload });
  },
  auth: (action: 'login' | 'logout' | 'register' | 'failed_login', userId: string, meta?: Record<string, any>) =>
    write('info', `[AUTH] ${action}`, { action, userId, ...meta }),
  api: (method: string, routePath: string, statusCode: number, duration: number, userId?: string, meta?: Record<string, any>) =>
    write('info', `${method} ${routePath} ${statusCode}`, { method, path: routePath, statusCode, duration, userId, ...meta }),
  security: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: Record<string, any>) =>
    write('warn', `[SECURITY] ${event}`, { event, severity, ...meta }),
};

export const log = logger;
export default logger;
