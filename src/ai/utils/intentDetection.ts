import { AIRequest, ContentType } from '../prompts/systemPrompt';

const INTENT_KEYWORDS = {
  story: ['story', 'narrative', 'tale', 'plot', 'character', 'write a story', 'create a story', 'tell me a story'],
  script: ['script', 'video script', 'short form', 'reel', 'viral video', 'tiktok script', 'youtube short', 'script for'],
  caption: ['caption', 'captions', 'instagram caption', 'post caption', 'follow up', 'engagement', 'copy for post'],
  hooks: ['hook', 'hooks', 'opening line', 'opener', 'intro', 'attention grabber', 'scroll stopper'],
  ideas: ['ideas', 'suggestions', 'brainstorm', 'concept', 'content ideas', 'topic ideas', 'give me ideas'],
  rewrite: ['rewrite', 'improve', 'rephrase', 'make better', 'enhance', 'polish', 'edit this'],
  'video-description': ['description', 'video description', 'youtube description', 'video desc', 'seo', 'tags'],
  'image-prompt': ['image', 'image prompt', 'midjourney', 'dall-e', 'generate image', 'create image', 'draw', 'generate art'],
  'voice-script': ['tts', 'text to speech', 'voice over', 'voiceover', 'narration', 'spoken', 'speech', 'voice script', 'read aloud']
} as Record<ContentType, string[]>;

/**
 * Detect the user's intent from their input
 */
export function detectIntent(userInput: string): ContentType {
  const lowerInput = userInput.toLowerCase();
  
  // Check each content type
  for (const [contentType, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword)) {
        return contentType as ContentType;
      }
    }
  }
  
  // Default detection based on input length and structure
  if (userInput.length > 500) return 'story';
  if (userInput.includes('?')) return 'ideas';
  
  // Ultimate default
  return 'script';
}

/**
 * Detect the platform from user context
 */
export function detectPlatform(userInput: string): 'tiktok' | 'youtube' | 'instagram' | 'twitter' | 'generic' {
  const lowerInput = userInput.toLowerCase();
  
  if (lowerInput.includes('tiktok') || lowerInput.includes('short') || lowerInput.includes('viral')) return 'tiktok';
  if (lowerInput.includes('youtube') || lowerInput.includes('long form')) return 'youtube';
  if (lowerInput.includes('instagram') || lowerInput.includes('reel')) return 'instagram';
  if (lowerInput.includes('twitter') || lowerInput.includes('tweet')) return 'twitter';
  
  return 'generic';
}

/**
 * Detect tone from user input
 */
export function detectTone(userInput: string): AIRequest['tone'] {
  const lowerInput = userInput.toLowerCase();
  
  if (lowerInput.includes('funny') || lowerInput.includes('humor') || lowerInput.includes('comedy')) return 'funny';
  if (lowerInput.includes('dramatic') || lowerInput.includes('emotional')) return 'dramatic';
  if (lowerInput.includes('inspire') || lowerInput.includes('motivat')) return 'inspirational';
  if (lowerInput.includes('teach') || lowerInput.includes('learn') || lowerInput.includes('educational')) return 'educational';
  if (lowerInput.includes('controversial') || lowerInput.includes('debate')) return 'controversial';
  
  return 'casual';
}

/**
 * Extract context clues for better AI responses
 */
export function extractContext(userInput: string): string | undefined {
  // Look for context markers
  const contextMarkers = ['about:', 'context:', 'background:', 'target audience:', 'for:', 'about'];
  
  for (const marker of contextMarkers) {
    const index = userInput.toLowerCase().indexOf(marker);
    if (index !== -1) {
      return userInput.substring(index + marker.length).trim();
    }
  }
  
  return undefined;
}

/**
 * Clean and normalize user input
 */
export function normalizeInput(userInput: string): string {
  return userInput
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/["']/g, '"');
}
