import { NEOTOONS_SYSTEM_PROMPT } from '../prompts/systemPrompt';
/**
 * Fallback Provider - Gemini Integration
 * Used when primary providers (OpenRouter, Hugging Face) are unavailable
 * Circuit breaker pattern to prevent cascading failures
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
const circuitBreaker = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
};
// Configuration
const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 60000; // 1 minute
export async function generateWithFallback(request) {
    // Check circuit breaker
    if (isCircuitOpen()) {
        throw new Error('🔴 Fallback provider circuit breaker is open. Service temporarily unavailable.');
    }
    if (!GEMINI_API_KEY) {
        throw new Error('🔑 GEMINI_API_KEY is not configured for fallback');
    }
    try {
        const response = await generateWithGemini(request);
        // Reset circuit breaker on success
        resetCircuitBreaker();
        return response;
    }
    catch (error) {
        recordFailure();
        console.error('[Fallback Provider Error]:', error.message);
        throw new Error(`⚠️ Fallback provider failed: ${error.message}. Retrying with another provider.`);
    }
}
/**
 * Generate content using Gemini API
 */
async function generateWithGemini(request) {
    const userPrompt = buildFallbackPrompt(request);
    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `${NEOTOONS_SYSTEM_PROMPT}\n\n${userPrompt}`,
                    },
                ],
            },
        ],
        safetySettings: [
            {
                category: 'HARM_CATEGORY_UNSPECIFIED',
                threshold: 'BLOCK_NONE',
            },
        ],
        generationConfig: {
            temperature: 0.8,
            top_p: 0.9,
            top_k: 40,
            max_output_tokens: 1024,
        },
    };
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limited - Gemini API quota exceeded');
            }
            throw new Error(`Gemini API error: ${response.statusText}`);
        }
        let data;
        try {
            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                throw new Error('Invalid response format from Gemini API');
            }
            data = await response.json();
        }
        catch (jsonErr) {
            throw new Error('Failed to parse Gemini API response: ' + jsonErr.message);
        }
        if (!data.candidates || !data.candidates[0]?.content?.parts) {
            throw new Error('Invalid Gemini API response format');
        }
        const content = data.candidates[0].content.parts
            .map((part) => part.text)
            .join('\n')
            .trim();
        return {
            content,
            contentType: request.contentType,
            tokensUsed: data.usageMetadata?.totalTokenCount || 0,
            provider: 'gemini-fallback',
            timestamp: Date.now(),
        };
    }
    catch (error) {
        throw new Error(`Gemini API call failed: ${error.message}`);
    }
}
/**
 * Build optimized prompt for fallback provider
 */
function buildFallbackPrompt(request) {
    let prompt = request.userInput;
    // Add content type hint
    if (request.contentType) {
        prompt += `\n\n[Output Format: ${request.contentType}]`;
    }
    // Add platform context
    if (request.platform) {
        prompt += `\n[Platform: ${request.platform}]`;
    }
    // Add tone context
    if (request.tone) {
        prompt += `\n[Tone: ${request.tone}]`;
    }
    // Add custom context
    if (request.context) {
        prompt += `\n[Context: ${request.context}]`;
    }
    // Add length guidelines
    if (request.maxLength) {
        prompt += `\n[Max Length: ${request.maxLength} characters]`;
    }
    return prompt;
}
/**
 * Circuit Breaker Pattern Implementation
 */
function isCircuitOpen() {
    if (!circuitBreaker.isOpen) {
        return false;
    }
    // Check if reset timeout has elapsed
    const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailureTime;
    if (timeSinceLastFailure > RESET_TIMEOUT) {
        // Attempt to reset
        circuitBreaker.isOpen = false;
        circuitBreaker.failureCount = 0;
        return false;
    }
    return true;
}
function recordFailure() {
    circuitBreaker.failureCount++;
    circuitBreaker.lastFailureTime = Date.now();
    if (circuitBreaker.failureCount >= FAILURE_THRESHOLD) {
        circuitBreaker.isOpen = true;
        console.warn(`🔴 Fallback provider circuit breaker opened after ${FAILURE_THRESHOLD} failures`);
    }
}
function resetCircuitBreaker() {
    circuitBreaker.failureCount = 0;
    circuitBreaker.isOpen = false;
}
/**
 * Get circuit breaker status
 */
export function getCircuitBreakerStatus() {
    return {
        isOpen: circuitBreaker.isOpen,
        failureCount: circuitBreaker.failureCount,
        lastFailureTime: circuitBreaker.lastFailureTime,
        status: circuitBreaker.isOpen ? 'OPEN' : 'CLOSED',
    };
}
/**
 * Test Gemini connection
 */
export async function testFallbackConnection() {
    try {
        const testRequest = {
            userInput: 'test',
            contentType: 'script',
        };
        const response = await generateWithGemini(testRequest);
        return !!response.content;
    }
    catch (error) {
        console.error('Fallback provider connection test failed:', error);
        return false;
    }
}
