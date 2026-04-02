import { Router, Request, Response } from 'express';
import { emailService } from '../../services/emailService.js';
import { dbService } from '../../services/database.js';
import { counterRateLimitStore } from '../lib/rateLimitStore.js';
import { log } from '../../utils/logger.js';

const router = Router();

const CONTACT_RATE_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_RATE_MAX = 5;

const checkRateLimit = (req: Request): boolean => {
  const ip = req.ip || 'unknown';
  const { count } = counterRateLimitStore.increment(ip, CONTACT_RATE_WINDOW_MS);
  if (count > CONTACT_RATE_MAX) {
    log.security('Contact form rate limit exceeded', 'medium', {
      ...getLogContext(req),
      path: req.path,
      windowMs: CONTACT_RATE_WINDOW_MS,
    });
  }
  return count <= CONTACT_RATE_MAX;
};

const getLogContext = (req: Request) => ({
  requestId: req.requestId,
  ip: req.ip,
  userAgent: req.get('user-agent') || 'unknown',
});

// Sanitize input
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000); // Max 1000 characters
};

// POST /api/contact/send
router.post('/send', async (req: Request, res: Response) => {
  try {
    if (!checkRateLimit(req)) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
      });
    }

    const { name, email, subject, message } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ success: false, error: 'Name must be between 2 and 100 characters' });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 200) {
      return res.status(400).json({ success: false, error: 'Subject must be between 3 and 200 characters' });
    }
    if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 5000) {
      return res.status(400).json({ success: false, error: 'Message must be between 10 and 5000 characters' });
    }

    const sanitizedData = {
      name: sanitizeInput(name),
      email: email.trim().toLowerCase(),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message),
    };

    const emailResult = await emailService.sendContactFormEmail(sanitizedData);

    if (!emailResult.success) {
      log.error('Contact form email delivery failed', new Error(String(emailResult.error || 'Unknown email error')), {
        ...getLogContext(req),
        path: req.path,
      });
      return res.status(500).json({
        success: false,
        error: 'Failed to send message. Please try again later.',
      });
    }

    try {
      await dbService.save('contact_messages', `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, {
        ...sanitizedData,
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'received',
      });
    } catch (dbError) {
      log.warn('Failed to persist contact message', {
        ...getLogContext(req),
        path: req.path,
        error: dbError instanceof Error ? dbError.message : String(dbError),
      });
    }

    log.info('Contact form submission received', {
      ...getLogContext(req),
      path: req.path,
      subject: sanitizedData.subject,
    });

    res.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      messageId: emailResult.messageId,
    });
  } catch (error) {
    log.error('Contact form submission error', error, { ...getLogContext(req), path: req.path });
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    });
  }
});

export default router;
