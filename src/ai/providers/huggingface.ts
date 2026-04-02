import { AIResponse } from '../prompts/systemPrompt.js';

/**
 * Hugging Face Provider
 * Image generation and stable diffusion support
 */

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_BASE_URL = 'https://api-inference.huggingface.co';

// Models available
const IMAGE_GENERATION_MODELS = {
  fast: 'stabilityai/stable-diffusion-2',
  quality: 'stabilityai/stable-diffusion-2-1',
  premium: 'runwayml/stable-diffusion-v1-5',
};

export async function generateImagePromptWithHuggingFace(
  userInput: string,
  modelQuality: 'fast' | 'quality' | 'premium' = 'quality'
): Promise<AIResponse> {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('🔑 HUGGINGFACE_API_KEY is not configured');
  }

  try {
    // Use OpenRouter-like approach to generate image prompts first
    const imagePromptGeneration = await generateImagePrompt(userInput);
    
    // Return the optimized image prompt
    return {
      content: imagePromptGeneration,
      contentType: 'image-prompt',
      tokensUsed: 0,
      provider: `huggingface-${modelQuality}`,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.error('[Hugging Face Provider Error]:', error.message);
    throw error;
  }
}

/**
 * Generate actual image using Hugging Face API
 */
export async function generateImage(
  imagePrompt: string,
  modelQuality: 'fast' | 'quality' | 'premium' = 'quality'
): Promise<Buffer> {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('🔑 HUGGINGFACE_API_KEY is not configured');
  }

  try {
    const modelId = IMAGE_GENERATION_MODELS[modelQuality];
    const response = await fetch(
      `${HUGGINGFACE_BASE_URL}/models/${modelId}`,
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: imagePrompt,
          options: {
            wait_for_model: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`❌ Hugging Face API Error: ${response.statusText}`);
    }

    // Return image buffer
    return Buffer.from(await response.arrayBuffer());
  } catch (error: any) {
    console.error('[Image Generation Error]:', error.message);
    throw error;
  }
}

/**
 * Generate an optimized image prompt from user description
 */
async function generateImagePrompt(userInput: string): Promise<string> {
  const normalized = userInput.trim().replace(/\s+/g, ' ');
  const lowerInput = normalized.toLowerCase();

  const subject = extractSubject(normalized);
  const environment = detectEnvironment(lowerInput);
  const style = detectStyle(lowerInput);
  const lighting = detectLighting(lowerInput, style);
  const camera = detectCameraAngle(lowerInput);
  const details = buildDetails(lowerInput);
  const quality = 'ultra detailed, 4k, high resolution, sharp focus';

  const finalPrompt = [
    subject,
    environment,
    style,
    lighting,
    camera,
    details,
    quality,
  ]
    .filter(Boolean)
    .join(', ')
    .slice(0, 480);

  const negativePrompt =
    'blurry, low quality, distorted, bad anatomy, extra limbs, noisy, oversaturated, watermark, text artifacts';

  return `Final Prompt:\n"${finalPrompt}"\n\nNegative Prompt:\n"${negativePrompt}"`;
}

function extractSubject(input: string): string {
  const cleaned = input.replace(/^(create|generate|make|draw|design)\s+/i, '');
  return cleaned.length > 8 ? cleaned : 'a visually compelling main subject';
}

function detectEnvironment(lowerInput: string): string {
  if (lowerInput.includes('studio') || lowerInput.includes('product')) {
    return 'clean studio environment with uncluttered background';
  }
  if (lowerInput.includes('fantasy')) {
    return 'epic fantasy environment with atmospheric depth and rich worldbuilding';
  }
  if (lowerInput.includes('city') || lowerInput.includes('urban')) {
    return 'modern urban environment with layered depth';
  }
  if (lowerInput.includes('forest') || lowerInput.includes('nature')) {
    return 'lush natural environment with cinematic depth';
  }
  if (lowerInput.includes('logo')) {
    return 'clean isolated background optimized for brand usage';
  }
  return 'contextual environment with depth and visual storytelling';
}

function detectStyle(lowerInput: string): string {
  if (lowerInput.includes('anime')) return 'anime style with crisp linework and expressive color grading';
  if (lowerInput.includes('cinematic')) return 'cinematic visual style with filmic color grading';
  if (lowerInput.includes('digital art')) return 'digital art style with polished rendering';
  if (lowerInput.includes('realistic') || lowerInput.includes('photoreal')) {
    return 'photorealistic style with lifelike textures';
  }
  if (lowerInput.includes('logo')) return 'minimal, clean vector-inspired style';
  if (lowerInput.includes('portrait')) return 'realistic portrait style with natural skin detail';
  if (lowerInput.includes('fantasy')) return 'cinematic fantasy art style with dramatic atmosphere';
  if (lowerInput.includes('product')) return 'premium product photography style';
  return 'realistic cinematic style';
}

function detectLighting(lowerInput: string, style: string): string {
  if (lowerInput.includes('studio') || lowerInput.includes('product')) {
    return 'soft studio lighting with controlled highlights and shadows';
  }
  if (lowerInput.includes('portrait')) {
    return 'soft cinematic lighting focused on facial features';
  }
  if (style.includes('fantasy') || lowerInput.includes('fantasy')) {
    return 'dramatic cinematic lighting with volumetric glow';
  }
  return 'cinematic lighting with balanced contrast';
}

function detectCameraAngle(lowerInput: string): string {
  if (lowerInput.includes('portrait') || lowerInput.includes('face')) {
    return 'close-up portrait framing, eye-level angle';
  }
  if (lowerInput.includes('product')) {
    return 'three-quarter product angle with centered composition';
  }
  if (lowerInput.includes('logo')) {
    return 'straight-on composition, centered framing';
  }
  if (lowerInput.includes('wide')) {
    return 'wide-angle composition with foreground-background separation';
  }
  return 'cinematic mid-shot composition';
}

function buildDetails(lowerInput: string): string {
  const details: string[] = [];

  if (lowerInput.includes('logo')) {
    details.push('clean edges, strong silhouette, minimal visual noise');
  }
  if (lowerInput.includes('portrait')) {
    details.push('detailed facial features, natural skin texture, expressive eyes');
  }
  if (lowerInput.includes('fantasy')) {
    details.push('ornate textures, layered atmosphere, magical visual accents');
  }
  if (lowerInput.includes('product')) {
    details.push('precise material rendering, crisp reflections, premium finish');
  }

  if (details.length === 0) {
    details.push('rich textures, depth, polished composition, visually appealing mood');
  }

  return details.join(', ');
}

/**
 * Test Hugging Face connection
 */
export async function testHuggingFaceConnection(): Promise<boolean> {
  try {
    const response = await fetch(
      `${HUGGINGFACE_BASE_URL}/api/models?search=stable-diffusion`,
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Hugging Face connection test failed:', error);
    return false;
  }
}
