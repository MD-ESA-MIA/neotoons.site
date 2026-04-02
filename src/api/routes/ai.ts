import express, { Request, Response } from 'express';
import { requireAuth } from '@clerk/express';
import { generateContent, clearCache, getCacheStats, checkProviderHealth, getProviderStats } from '../../ai/aiRouter';
import { AIRequest } from '../../ai/prompts/systemPrompt';
import { generateVoiceAudioChunks, mapSpeedToSlow } from '../../ai/providers/tts';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { counterRateLimitStore } from '../lib/rateLimitStore';
import { ownerAuthMiddleware } from './owner';
import { log } from '../../utils/logger';

const router = express.Router();
const AUDIO_CACHE_DIR = path.join(process.cwd(), 'cache', 'voice-audio');
const VOICE_HISTORY_FILE = path.join(process.cwd(), 'cache', 'voice-history.json');
const AI_AUDIO_LIMIT_WINDOW_MS = 60_000;
const AI_AUDIO_LIMIT_MAX_REQUESTS = 20;

const getLogContext = (req: Request) => ({
  requestId: req.requestId,
  ip: req.ip,
  userAgent: req.get('user-agent') || 'unknown',
});

function ensureAudioCacheDir(): void {
  if (!fs.existsSync(AUDIO_CACHE_DIR)) {
    fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
  }
}

function ensureVoiceHistoryFile(): void {
  const baseDir = path.dirname(VOICE_HISTORY_FILE);
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  if (!fs.existsSync(VOICE_HISTORY_FILE)) {
    fs.writeFileSync(VOICE_HISTORY_FILE, '[]', 'utf-8');
  }
}

interface VoiceHistoryRecord {
  id: string;
  originalText: string;
  optimizedVoice: string;
  lang: string;
  gender: VoiceGender;
  style: VoiceStyle;
  speed: number;
  createdAt: string;
  file?: string;
}

function readVoiceHistory(): VoiceHistoryRecord[] {
  ensureVoiceHistoryFile();
  const raw = fs.readFileSync(VOICE_HISTORY_FILE, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];

  return (parsed as Partial<VoiceHistoryRecord>[]).map((item) => ({
    id: item.id || crypto.randomBytes(6).toString('hex'),
    originalText: item.originalText || '',
    optimizedVoice: item.optimizedVoice || '',
    lang: item.lang || 'en',
    gender: item.gender === 'male' ? 'male' : 'female',
    style:
      item.style === 'youtube' || item.style === 'story' || item.style === 'formal'
        ? item.style
        : 'default',
    speed:
      typeof item.speed === 'number' && Number.isFinite(item.speed)
        ? Math.max(0.5, Math.min(1.5, item.speed))
        : 1,
    createdAt: item.createdAt || new Date().toISOString(),
    file: item.file,
  }));
}

function writeVoiceHistory(items: VoiceHistoryRecord[]): void {
  ensureVoiceHistoryFile();
  fs.writeFileSync(VOICE_HISTORY_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

type VoiceStyle = 'default' | 'youtube' | 'story' | 'formal';
type VoiceGender = 'male' | 'female';

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (Array.isArray(forwarded)) return forwarded[0] || req.socket.remoteAddress || 'unknown';
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  return req.socket.remoteAddress || 'unknown';
}

function checkVoiceAudioRateLimit(ip: string): boolean {
  const { count } = counterRateLimitStore.increment(`ai-audio:${ip}`, AI_AUDIO_LIMIT_WINDOW_MS);
  return count <= AI_AUDIO_LIMIT_MAX_REQUESTS;
}

function applyVoiceStyle(text: string, style: VoiceStyle = 'default'): string {
  switch (style) {
    case 'youtube':
      return `Hey guys! ${text} Let's dive in.`;
    case 'story':
      return `Once upon a time, ${text}`;
    case 'formal':
      return `Dear audience, ${text}`;
    default:
      return text;
  }
}

/**
 * POST /api/ai/generate
 * Generate content based on user request
 * 
 * Request body:
 * {
 *   userInput: string,
 *   contentType?: 'story'|'script'|'caption'|'hooks'|'ideas'|'rewrite'|'video-description'|'image-prompt'|'voice-script',
 *   platform?: 'tiktok'|'youtube'|'instagram'|'twitter',
 *   tone?: 'funny'|'dramatic'|'inspirational'|'educational'|'controversial',
 *   context?: string,
 *   maxLength?: number
 * }
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { userInput, contentType, platform, tone, context, maxLength } = req.body;

    // Validation
    if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userInput is required and must be a non-empty string',
      });
    }

    // Build AIRequest
    const aiRequest: AIRequest = {
      userInput: userInput.trim(),
      contentType,
      platform,
      tone,
      context,
      maxLength,
    };

    // Generate content
    const { response, metadata } = await generateContent(aiRequest);
    log.api(req.method, req.path, 200, Date.now() - metadata.timestamp);

    return res.json({
      success: true,
      data: {
        content: response.content,
        contentType: response.contentType,
        tokensUsed: response.tokensUsed,
        provider: response.provider,
        timestamp: response.timestamp,
      },
      metadata: {
        requestId: metadata.requestId,
        intent: metadata.intent,
        platform: metadata.platform,
        tone: metadata.tone,
        complexity: metadata.complexity,
        provider: metadata.provider,
        generationTime: Date.now() - metadata.timestamp,
      },
    });
  } catch (error: any) {
    log.error('AI generation failed', error, { ...getLogContext(req), path: req.path });

    return res.status(500).json({
      success: false,
      error: error.message || 'Content generation failed',
      hint: 'Check your API keys (OPENROUTER_API_KEY, HUGGINGFACE_API_KEY) and try again',
    });
  }
});

/**
 * POST /api/ai/voice-optimize
 * Convert raw text into speech-friendly script for free/basic TTS engines
 *
 * Request body:
 * {
 *   text: string,
 *   tone?: 'funny'|'dramatic'|'inspirational'|'educational'|'controversial'|'casual',
 *   context?: string,
 *   maxLength?: number
 * }
 */
router.post('/voice-optimize', async (req: Request, res: Response) => {
  try {
    const { text, tone, context, maxLength } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'text is required and must be a non-empty string',
      });
    }

    const aiRequest: AIRequest = {
      userInput: text.trim(),
      contentType: 'voice-script',
      tone,
      context,
      maxLength,
    };

    const { response, metadata } = await generateContent(aiRequest);

    return res.json({
      success: true,
      data: {
        voiceText: response.content,
        contentType: response.contentType,
        tokensUsed: response.tokensUsed,
        provider: response.provider,
        timestamp: response.timestamp,
      },
      metadata: {
        requestId: metadata.requestId,
        tone: metadata.tone,
        complexity: metadata.complexity,
        provider: metadata.provider,
        generationTime: Date.now() - metadata.timestamp,
      },
    });
  } catch (error: any) {
    log.error('Voice optimize failed', error, { ...getLogContext(req), path: req.path });
    return res.status(500).json({
      success: false,
      error: error.message || 'Voice optimization failed',
    });
  }
});

/**
 * POST /api/ai/voice-audio
 * Render optimized voice text into a real MP3 audio file and stream it to client.
 *
 * Request body:
 * {
 *   text: string,
 *   lang?: string,
 *   gender?: 'male'|'female',
 *   speed?: number, // 0.5 to 1.5
 *   style?: 'default'|'youtube'|'story'|'formal',
 *   filename?: string
 * }
 */
router.post('/voice-audio', async (req: Request, res: Response) => {
  try {
    const { text, lang, speed, filename, style, gender } = req.body;

    const clientIp = getClientIp(req);
    if (!checkVoiceAudioRateLimit(clientIp)) {
      log.security('AI voice audio rate limit exceeded', 'medium', {
        ...getLogContext(req),
        ip: clientIp,
        path: req.path,
      });
      return res.status(429).json({
        success: false,
        error: 'Too many audio requests. Please wait a minute and try again.',
      });
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'text is required and must be a non-empty string',
      });
    }

    const normalizedText = text.trim();
    if (normalizedText.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Text too short',
      });
    }
    if (normalizedText.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long',
      });
    }

    ensureAudioCacheDir();
    const resolvedLang =
      typeof lang === 'string' && lang.trim().length > 0
        ? lang.trim()
        : process.env.VOICE_TTS_DEFAULT_LANG || 'en';
    const parsedSpeed =
      typeof speed === 'number' && Number.isFinite(speed) ? Math.max(0.5, Math.min(1.5, speed)) : 1;
    const resolvedGender: VoiceGender = gender === 'male' ? 'male' : 'female';
    const genderAdjustedSpeed = resolvedGender === 'male' ? Math.max(0.5, parsedSpeed - 0.1) : parsedSpeed;
    const resolvedSlow = mapSpeedToSlow(parsedSpeed);
    const resolvedStyle: VoiceStyle =
      style === 'youtube' || style === 'story' || style === 'formal' ? style : 'default';

    log.info('Voice audio generated', {
      ...getLogContext(req),
      lang: resolvedLang,
      gender: resolvedGender,
      style: resolvedStyle,
      speed: genderAdjustedSpeed,
      textLength: normalizedText.length,
      ip: clientIp,
    });

    const cacheKey = crypto
      .createHash('md5')
      .update(`${normalizedText}|${resolvedLang}|${resolvedStyle}|${resolvedGender}|${genderAdjustedSpeed.toFixed(1)}`)
      .digest('hex');
    const cacheFilePath = path.join(AUDIO_CACHE_DIR, `${cacheKey}.mp3`);

    const safeFilename =
      typeof filename === 'string' && filename.trim().length > 0
        ? filename.replace(/[^a-zA-Z0-9-_]/g, '_')
        : `voice-${Date.now()}`;

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.mp3"`);

    if (fs.existsSync(cacheFilePath)) {
      const cachedStream = fs.createReadStream(cacheFilePath);
      cachedStream.on('error', (streamError) => {
        log.error('Voice audio cache stream failed', streamError, { ...getLogContext(req), path: req.path, ip: clientIp });
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: 'Failed to stream cached audio' });
        }
      });
      cachedStream.pipe(res);
      return;
    }

    const styledText = applyVoiceStyle(normalizedText, resolvedStyle);
    const cacheWriteStream = fs.createWriteStream(cacheFilePath, { flags: 'w' });

    for await (const chunk of generateVoiceAudioChunks(styledText, {
      lang: resolvedLang,
      slow: resolvedSlow,
      speed: genderAdjustedSpeed,
      interChunkDelayMs: 80,
    })) {
      cacheWriteStream.write(chunk);
      res.write(chunk);
    }

    cacheWriteStream.end();
    return res.end();
  } catch (error: any) {
    log.error('Voice audio generation failed', error, { ...getLogContext(req), path: req.path });
    return res.status(500).json({
      success: false,
      error: 'Failed to generate audio',
    });
  }
});

/**
 * POST /api/ai/voice-history
 * Persist voice history entry to file-backed JSON store.
 */
router.post('/voice-history', async (req: Request, res: Response) => {
  try {
    const { originalText, optimizedVoice, lang, style, speed, file, gender } = req.body;

    if (!originalText || !optimizedVoice) {
      return res.status(400).json({
        success: false,
        error: 'originalText and optimizedVoice are required',
      });
    }

    const resolvedStyle: VoiceStyle =
      style === 'youtube' || style === 'story' || style === 'formal' ? style : 'default';
    const resolvedGender: VoiceGender = gender === 'male' ? 'male' : 'female';
    const resolvedSpeed =
      typeof speed === 'number' && Number.isFinite(speed) ? Math.max(0.5, Math.min(1.5, speed)) : 1;
    const resolvedLang = typeof lang === 'string' && lang.trim() ? lang.trim() : 'en';

    const history = readVoiceHistory();
    const record: VoiceHistoryRecord = {
      id: crypto.randomBytes(6).toString('hex'),
      originalText: String(originalText),
      optimizedVoice: String(optimizedVoice),
      lang: resolvedLang,
      gender: resolvedGender,
      style: resolvedStyle,
      speed: resolvedSpeed,
      file: typeof file === 'string' ? file : undefined,
      createdAt: new Date().toISOString(),
    };

    history.push(record);
    writeVoiceHistory(history);

    return res.json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    log.error('Voice history save failed', error, { ...getLogContext(req), path: req.path });
    return res.status(500).json({
      success: false,
      error: 'Failed to save voice history',
    });
  }
});

/**
 * GET /api/ai/voice-history
 * Retrieve persisted voice history entries.
 */
router.get('/voice-history', async (req: Request, res: Response) => {
  try {
    const limitRaw = req.query.limit;
    const limit =
      typeof limitRaw === 'string' && Number.isFinite(Number(limitRaw))
        ? Math.max(1, Math.min(100, Number(limitRaw)))
        : 25;

    const history = readVoiceHistory();
    const sorted = [...history].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.json({
      success: true,
      data: sorted.slice(0, limit),
    });
  } catch (error: any) {
    log.error('Voice history lookup failed', error, { ...getLogContext(req), path: req.path });
    return res.status(500).json({
      success: false,
      error: 'Failed to load voice history',
    });
  }
});

/**
 * GET /api/ai/voice-history/:id
 * Retrieve a single history record by public share ID.
 */
router.get('/voice-history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = readVoiceHistory();
    const record = history.find((item) => item.id === id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Voice history item not found',
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    log.error('Voice history item lookup failed', error, { ...getLogContext(req), path: req.path });
    return res.status(500).json({
      success: false,
      error: 'Failed to load voice history item',
    });
  }
});

/**
 * GET /api/ai/voice-analytics
 * Return basic analytics from persisted voice history.
 */
router.get('/voice-analytics', async (req: Request, res: Response) => {
  try {
    const history = readVoiceHistory();
    const totalGenerations = history.length;

    const languageCounts = history.reduce<Record<string, number>>((acc, item) => {
      acc[item.lang] = (acc[item.lang] || 0) + 1;
      return acc;
    }, {});

    const styleCounts = history.reduce<Record<string, number>>((acc, item) => {
      acc[item.style] = (acc[item.style] || 0) + 1;
      return acc;
    }, {});

    const genderCounts = history.reduce<Record<string, number>>((acc, item) => {
      acc[item.gender] = (acc[item.gender] || 0) + 1;
      return acc;
    }, {});

    const mostUsedLanguage =
      Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'n/a';

    const avgTextLength =
      totalGenerations > 0
        ? Math.round(
            history.reduce((sum, item) => sum + (item.originalText?.length || 0), 0) /
              totalGenerations
          )
        : 0;

    return res.json({
      success: true,
      data: {
        totalGenerations,
        mostUsedLanguage,
        avgTextLength,
        languageCounts,
        styleCounts,
        genderCounts,
      },
    });
  } catch (error: any) {
    log.error('Voice analytics lookup failed', error, { ...getLogContext(req), path: req.path });
    return res.status(500).json({
      success: false,
      error: 'Failed to load voice analytics',
    });
  }
});

/**
 * POST /api/ai/batch
 * Generate multiple content pieces in batch
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { requests } = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'requests must be a non-empty array',
      });
    }

    if (requests.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 requests per batch',
      });
    }

    // Generate all
    const results = await Promise.all(
      requests.map((req) =>
        generateContent(req).catch((error) => ({
          success: false,
          error: error.message,
          request: req,
        }))
      )
    );

    const successful = results.filter((r) => 'response' in r);
    const failed = results.filter((r) => 'error' in r);

    return res.json({
      success: failed.length === 0,
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      },
      results: successful.map((r) => ({
        content: r.response.content,
        contentType: r.response.contentType,
        provider: r.response.provider,
        generationTime: Date.now() - r.metadata.timestamp,
      })),
      errors: failed,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Batch generation failed',
    });
  }
});

/**
 * GET /api/ai/health
 * Check provider health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await checkProviderHealth();

    const allHealthy = Object.values(health.providers).every(
      (status) => status === 'healthy'
    );
    const anyHealthy = Object.values(health.providers).some(
      (status) => status === 'healthy'
    );

    return res.json({
      success: anyHealthy,
      status: allHealthy ? 'all-healthy' : anyHealthy ? 'degraded' : 'unavailable',
      health: {
        timestamp: health.timestamp,
        providers: health.providers,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Health check failed',
    });
  }
});

/**
 * GET /api/ai/stats
 * Get AI service statistics and cache info
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = getProviderStats();

    return res.json({
      success: true,
      stats: {
        circuitBreaker: stats.circuitBreakerStatus,
        cache: {
          size: stats.cacheStats.size,
          maxSize: stats.cacheStats.maxSize,
          ttl: stats.cacheStats.ttl,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve stats',
    });
  }
});

/**
 * POST /api/ai/clear-cache
 * Clear the request cache (admin only)
 */
router.post('/clear-cache', requireAuth(), ownerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // TODO: Verify admin token
    clearCache();

    return res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

export default router;
