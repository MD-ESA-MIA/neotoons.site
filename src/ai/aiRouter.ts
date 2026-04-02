import { AIRequest, AIResponse, NEOTOONS_SYSTEM_PROMPT } from './prompts/systemPrompt.js';
import {
  detectIntent,
  detectPlatform,
  detectTone,
  extractContext,
} from './utils/intentDetection.js';
import { generateWithOpenRouter } from './providers/openrouter.js';
import { generateImagePromptWithHuggingFace } from './providers/huggingface.js';
import { generateWithFallback, getCircuitBreakerStatus } from './providers/fallback.js';

/**
 * AI Router - Centralized orchestrator for content generation
 * Routes requests to optimal provider based on content type, complexity, and availability
 */

interface RequestMetadata {
  requestId: string;
  timestamp: number;
  intent: string;
  platform: string;
  tone: string;
  complexity: 'low' | 'medium' | 'high';
  provider: string;
}

// Request cache for identical inputs (TTL: 5 minutes)
const requestCache = new Map<string, { response: AIResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Main entry point for AI content generation
 */
export async function generateContent(
  request: AIRequest,
  options?: { skipCache?: boolean; skipFallback?: boolean }
): Promise<{ response: AIResponse; metadata: RequestMetadata }> {
  const requestId = generateRequestId();
  const timestamp = Date.now();

  try {
    // Enrich request with detected signals
    const enrichedRequest = await enrichRequest(request);
    const metadata: RequestMetadata = {
      requestId,
      timestamp,
      intent: enrichedRequest.contentType || request.contentType,
      platform: enrichedRequest.platform || 'generic',
      tone: enrichedRequest.tone || 'neutral',
      complexity: calculateComplexity(request.userInput),
      provider: 'pending',
    };

    // Check cache (skip for image generation)
    if (!options?.skipCache && request.contentType !== 'image-prompt') {
      const cacheKey = generateCacheKey(enrichedRequest);
      const cached = getFromCache(cacheKey);
      if (cached) {
        metadata.provider = cached.provider || 'cache';
        console.log(`✅ Cache hit for request ${requestId}`);
        return { response: cached, metadata };
      }
    }

    // Route to best provider
    let response: AIResponse;

    if (request.contentType === 'image-prompt') {
      // Image generation always goes to Hugging Face
      response = await generateImagePromptWithHuggingFace(
        request.userInput,
        selectImageModelQuality(metadata.complexity)
      );
    } else {
      // Text generation: OpenRouter primary, fallback to Gemini
      try {
        response = await generateWithOpenRouter(
          enrichedRequest,
          selectModelQuality(metadata.complexity)
        );
      } catch (error: any) {
        console.warn(`⚠️ OpenRouter failed, attempting fallback: ${error.message}`);
        
        if (options?.skipFallback) {
          throw error;
        }

        // Check circuit breaker before attempting fallback
        const cbStatus = getCircuitBreakerStatus();
        if (cbStatus.isOpen) {
          throw new Error(
            `🔴 Fallback provider is down. Please try again in a few moments.`
          );
        }

        response = await generateWithFallback(enrichedRequest);
      }
    }

    // Cache successful response
    if (!options?.skipCache) {
      const cacheKey = generateCacheKey(enrichedRequest);
      setInCache(cacheKey, response);
    }

    metadata.provider = response.provider;

    return { response, metadata };
  } catch (error: any) {
    console.error(`[AI Router Error] Request ${requestId}:`, error.message);
    throw new Error(`🚨 Content generation failed: ${error.message}`);
  }
}

/**
 * Enrich request with automatically detected signals
 */
async function enrichRequest(request: AIRequest): Promise<AIRequest> {
  return {
    ...request,
    contentType: request.contentType || detectIntent(request.userInput),
    platform: request.platform || detectPlatform(request.userInput),
    tone: request.tone || detectTone(request.userInput),
    context: request.context || extractContext(request.userInput),
  };
}

/**
 * Select model quality based on request complexity
 */
function selectModelQuality(
  complexity: 'low' | 'medium' | 'high'
): 'fast' | 'quality' | 'premium' | 'ultra' {
  switch (complexity) {
    case 'low':
      return 'fast'; // Quick captions, short hooks
    case 'medium':
      return 'quality'; // Standard scripts, stories
    case 'high':
      return 'premium'; // Complex narratives, multi-part content
    default:
      return 'quality';
  }
}

function selectImageModelQuality(
  complexity: 'low' | 'medium' | 'high'
): 'fast' | 'quality' | 'premium' {
  switch (complexity) {
    case 'low':
      return 'fast';
    case 'medium':
      return 'quality';
    case 'high':
      return 'premium';
    default:
      return 'quality';
  }
}

/**
 * Calculate request complexity based on user input characteristics
 */
function calculateComplexity(userInput: string): 'low' | 'medium' | 'high' {
  const length = userInput.length;
  const requestCount = (userInput.match(/\?/g) || []).length;
  const keywords = [
    'detailed',
    'complex',
    'comprehensive',
    'analyze',
    'multi-part',
    'series',
    'episode',
  ];
  const hasComplexKeywords = keywords.some((kw) =>
    userInput.toLowerCase().includes(kw)
  );

  if (length > 300 || requestCount > 2 || hasComplexKeywords) {
    return 'high';
  } else if (length > 150 || requestCount > 1) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Request caching utilities
 */

function generateCacheKey(request: AIRequest): string {
  return `${request.contentType}:${request.platform}:${request.tone}:${request.userInput.substring(0, 50).toLowerCase()}`;
}

function getFromCache(key: string): AIResponse | null {
  const entry = requestCache.get(key);
  if (!entry) return null;

  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    requestCache.delete(key);
    return null;
  }

  return entry.response;
}

function setInCache(key: string, response: AIResponse): void {
  requestCache.set(key, {
    response,
    timestamp: Date.now(),
  });

  // Prevent cache from growing indefinitely
  if (requestCache.size > 500) {
    const oldestKey = requestCache.keys().next().value;
    requestCache.delete(oldestKey);
  }
}

/**
 * Clear cache manually
 */
export function clearCache(): void {
  requestCache.clear();
  console.log('✅ AI Router cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: requestCache.size,
    maxSize: 500,
    ttl: CACHE_TTL,
    entries: Array.from(requestCache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      provider: value.response.provider,
    })),
  };
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Health check for all providers
 */
export async function checkProviderHealth() {
  const health = {
    timestamp: Date.now(),
    providers: {
      openrouter: 'unknown' as 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
      huggingface: 'unknown' as 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
      fallback: 'unknown' as 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
    },
  };

  try {
    // Test OpenRouter
    const { testOpenRouterConnection } = await import(
      './providers/openrouter.js'
    );
    const orHealthy = await testOpenRouterConnection();
    health.providers.openrouter = orHealthy ? 'healthy' : 'unhealthy';
  } catch (error) {
    health.providers.openrouter = 'unhealthy';
  }

  try {
    // Test Hugging Face
    const { testHuggingFaceConnection } = await import(
      './providers/huggingface.js'
    );
    const hfHealthy = await testHuggingFaceConnection();
    health.providers.huggingface = hfHealthy ? 'healthy' : 'unhealthy';
  } catch (error) {
    health.providers.huggingface = 'unhealthy';
  }

  try {
    // Test Fallback
    const { testFallbackConnection } = await import('./providers/fallback.js');
    const fbHealthy = await testFallbackConnection();
    health.providers.fallback = fbHealthy ? 'healthy' : 'unhealthy';
  } catch (error) {
    health.providers.fallback = 'unhealthy';
  }

  return health;
}

/**
 * Get detailed provider statistics
 */
export function getProviderStats() {
  return {
    circuitBreakerStatus: getCircuitBreakerStatus(),
    cacheStats: getCacheStats(),
  };
}

export type { AIRequest, AIResponse };
