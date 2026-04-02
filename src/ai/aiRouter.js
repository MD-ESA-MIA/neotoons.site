import { detectIntent, detectPlatform, detectTone, extractContext, } from './utils/intentDetection';
import { generateWithOpenRouter } from './providers/openrouter';
import { generateImagePromptWithHuggingFace } from './providers/huggingface';
import { generateWithFallback, getCircuitBreakerStatus } from './providers/fallback';
// Request cache for identical inputs (TTL: 5 minutes)
const requestCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
/**
 * Main entry point for AI content generation
 */
export async function generateContent(request, options) {
    const requestId = generateRequestId();
    const timestamp = Date.now();
    try {
        // Enrich request with detected signals
        const enrichedRequest = await enrichRequest(request);
        const metadata = {
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
        let response;
        if (request.contentType === 'image-prompt') {
            // Image generation always goes to Hugging Face
            response = await generateImagePromptWithHuggingFace(request.userInput, selectImageModelQuality(metadata.complexity));
        }
        else {
            // Text generation: OpenRouter primary, fallback to Gemini
            try {
                response = await generateWithOpenRouter(enrichedRequest, selectModelQuality(metadata.complexity));
            }
            catch (error) {
                console.warn(`⚠️ OpenRouter failed, attempting fallback: ${error.message}`);
                if (options?.skipFallback) {
                    throw error;
                }
                // Check circuit breaker before attempting fallback
                const cbStatus = getCircuitBreakerStatus();
                if (cbStatus.isOpen) {
                    throw new Error(`🔴 Fallback provider is down. Please try again in a few moments.`);
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
    }
    catch (error) {
        console.error(`[AI Router Error] Request ${requestId}:`, error.message);
        throw new Error(`🚨 Content generation failed: ${error.message}`);
    }
}
/**
 * Enrich request with automatically detected signals
 */
async function enrichRequest(request) {
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
function selectModelQuality(complexity) {
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
function selectImageModelQuality(complexity) {
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
function calculateComplexity(userInput) {
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
    const hasComplexKeywords = keywords.some((kw) => userInput.toLowerCase().includes(kw));
    if (length > 300 || requestCount > 2 || hasComplexKeywords) {
        return 'high';
    }
    else if (length > 150 || requestCount > 1) {
        return 'medium';
    }
    else {
        return 'low';
    }
}
/**
 * Request caching utilities
 */
function generateCacheKey(request) {
    return `${request.contentType}:${request.platform}:${request.tone}:${request.userInput.substring(0, 50).toLowerCase()}`;
}
function getFromCache(key) {
    const entry = requestCache.get(key);
    if (!entry)
        return null;
    // Check TTL
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        requestCache.delete(key);
        return null;
    }
    return entry.response;
}
function setInCache(key, response) {
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
export function clearCache() {
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
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
/**
 * Health check for all providers
 */
export async function checkProviderHealth() {
    const health = {
        timestamp: Date.now(),
        providers: {
            openrouter: 'unknown',
            huggingface: 'unknown',
            fallback: 'unknown',
        },
    };
    try {
        // Test OpenRouter
        const { testOpenRouterConnection } = await import('./providers/openrouter');
        const orHealthy = await testOpenRouterConnection();
        health.providers.openrouter = orHealthy ? 'healthy' : 'unhealthy';
    }
    catch (error) {
        health.providers.openrouter = 'unhealthy';
    }
    try {
        // Test Hugging Face
        const { testHuggingFaceConnection } = await import('./providers/huggingface');
        const hfHealthy = await testHuggingFaceConnection();
        health.providers.huggingface = hfHealthy ? 'healthy' : 'unhealthy';
    }
    catch (error) {
        health.providers.huggingface = 'unhealthy';
    }
    try {
        // Test Fallback
        const { testFallbackConnection } = await import('./providers/fallback');
        const fbHealthy = await testFallbackConnection();
        health.providers.fallback = fbHealthy ? 'healthy' : 'unhealthy';
    }
    catch (error) {
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
