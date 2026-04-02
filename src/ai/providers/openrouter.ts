import { AIRequest, AIResponse, NEOTOONS_SYSTEM_PROMPT } from '../prompts/systemPrompt.js';

/**
 * OpenRouter Provider
 * Primary AI provider for NeoToons
 * Supports multiple high-quality models with cost optimization
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Model selection strategy: quality + cost optimization
const MODEL_MAP = {
  fast: 'meta-llama/llama-2-7b-chat',          // Fast, cheap
  quality: 'mistralai/mistral-7b-instruct',    // Good quality, balanced
  premium: 'openai/gpt-3.5-turbo',             // High quality
  ultra: 'openai/gpt-4-turbo',                 // Maximum quality (expensive)
};

export async function generateWithOpenRouter(
  request: AIRequest,
  modelQuality: 'fast' | 'quality' | 'premium' | 'ultra' = 'quality'
): Promise<AIResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('🔑 OPENROUTER_API_KEY is not configured');
  }

  try {
    // Prepare the prompt with system instruction
    const messages = [
      {
        role: 'system' as const,
        content: NEOTOONS_SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: buildUserPrompt(request),
      },
    ];

    const model = MODEL_MAP[modelQuality];
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://neotoons.ai',
        'X-Title': 'NeoToons AI Service',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: request.maxLength || 2000,
        top_k: 40,
        frequency_penalty: 0.5,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      let errorMessage = `OpenRouter API Error: ${response.statusText}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          const err = errorData as any;
          errorMessage = `❌ OpenRouter API Error: ${err?.error?.message || errorMessage}`;
        }
      } catch (jsonErr) {
        console.error('Failed to parse error response:', jsonErr);
      }
      throw new Error(errorMessage);
    }

    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from OpenRouter');
      }
      data = await response.json();
    } catch (jsonErr: any) {
      throw new Error('Failed to parse OpenRouter response: ' + jsonErr.message);
    }
    
    const content = data.choices?.[0]?.message?.content;
    const tokensUsed = data.usage?.total_tokens || 0;

    if (!content) {
      throw new Error('⚠️ OpenRouter returned empty response');
    }

    return {
      content: content.trim(),
      contentType: request.contentType || 'script',
      tokensUsed,
      provider: `openrouter-${modelQuality}`,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.error('[OpenRouter Provider Error]:', error.message);
    throw error;
  }
}

/**
 * Build optimized prompt for the AI model
 */
function buildUserPrompt(request: AIRequest): string {
  let prompt = request.userInput;

  // Add content type hint if not detected
  if (request.contentType) {
    prompt = `[${request.contentType.toUpperCase()}]\n${prompt}`;
  }

  // Add platform context
  if (request.platform && request.platform !== 'generic') {
    prompt += `\n\nPlatform: ${request.platform}`;
  }

  // Add tone context
  if (request.tone) {
    prompt += `\nTone: ${request.tone}`;
  }

  // Voice-specific formatting instruction for deterministic TTS-ready output
  if (request.contentType === 'voice-script') {
    prompt +=
      '\n\nMode: Voice Engine (TTS optimization). Output only the final voice-ready text with natural pauses using commas/line breaks. No explanations.';
  }

  // Add context if provided
  if (request.context) {
    prompt += `\n\nContext: ${request.context}`;
  }

  // Add length guidance
  if (request.maxLength) {
    prompt += `\n\nLength: ~${request.maxLength} characters`;
  }

  return prompt;
}

/**
 * Test OpenRouter connection
 */
export async function testOpenRouterConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('OpenRouter connection test failed:', error);
    return false;
  }
}
