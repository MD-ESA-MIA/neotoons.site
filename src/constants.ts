import { AppMode, ModeConfig } from './types';

export const MODES: ModeConfig[] = [
  // Writing Tools
  {
    id: AppMode.STORY,
    title: 'Story Generator',
    description: 'Create full structured stories with chapters.',
    iconName: 'BookOpen',
    placeholder: 'Enter story idea, genre, length (Short/Medium/Long), and tone...',
    buttonText: 'Generate Story',
    color: 'from-blue-500 to-indigo-600',
    category: 'Writing Tools',
  },
  {
    id: AppMode.CONTINUATION,
    title: 'Story Continuation',
    description: 'Naturally continue your existing stories.',
    iconName: 'RefreshCw',
    placeholder: 'Paste your previous chapter or story text here...',
    buttonText: 'Continue Story',
    color: 'from-emerald-500 to-teal-600',
    category: 'Writing Tools',
  },
  {
    id: AppMode.EXPANDER,
    title: 'Story Expander',
    description: 'Expand your story ideas into full scenes.',
    iconName: 'Maximize',
    placeholder: 'Enter a scene summary or short idea to expand...',
    buttonText: 'Expand Story',
    color: 'from-blue-400 to-indigo-500',
    category: 'Writing Tools',
  },
  {
    id: AppMode.CHAPTER,
    title: 'Chapter Generator',
    description: 'Generate specific chapters for your novel.',
    iconName: 'FileText',
    placeholder: 'Enter chapter summary or previous context...',
    buttonText: 'Generate Chapter',
    color: 'from-indigo-400 to-blue-500',
    category: 'Writing Tools',
  },
  {
    id: AppMode.SCRIPT_WRITER,
    title: 'Script Writer',
    description: 'Create professional scripts for video or film.',
    iconName: 'Video',
    placeholder: 'Enter topic, style, and length for your script...',
    buttonText: 'Write Script',
    color: 'from-cyan-500 to-blue-600',
    category: 'Writing Tools',
  },
  {
    id: AppMode.REWRITE,
    title: 'Script Rewriter',
    description: 'Rewrite scripts with professional improvements.',
    iconName: 'Feather',
    placeholder: 'Paste original script, choose rewrite style and length preference...',
    buttonText: 'Rewrite Script',
    color: 'from-cyan-500 to-blue-500',
    category: 'Writing Tools',
  },

  // Social Media Tools
  {
    id: AppMode.HOOKS,
    title: 'Viral Hooks',
    description: 'Generate 5 scroll-stopping hooks for any platform.',
    iconName: 'Zap',
    placeholder: 'Enter topic, platform, and hook style (Curiosity/Shocking/Emotional/Educational)...',
    buttonText: 'Generate Hooks',
    color: 'from-pink-500 to-rose-500',
    category: 'Social Media Tools',
  },
  {
    id: AppMode.SOCIAL,
    title: 'Social Posts',
    description: 'Turn your content into viral social media posts.',
    iconName: 'Share2',
    placeholder: 'Enter topic, platform, post style, and hashtag/emoji preferences...',
    buttonText: 'Generate Posts',
    color: 'from-orange-400 to-red-500',
    category: 'Social Media Tools',
  },
  {
    id: AppMode.HASHTAG,
    title: 'Hashtag Generator',
    description: 'Generate trending hashtags for your content.',
    iconName: 'Hash',
    placeholder: 'Enter your content topic or keywords...',
    buttonText: 'Generate Hashtags',
    color: 'from-purple-400 to-pink-500',
    category: 'Social Media Tools',
  },
  {
    id: AppMode.CAPTION,
    title: 'Caption Generator',
    description: 'Create engaging captions for your photos and videos.',
    iconName: 'MessageSquare',
    placeholder: 'Describe your image or video content...',
    buttonText: 'Generate Caption',
    color: 'from-rose-400 to-pink-500',
    category: 'Social Media Tools',
  },

  // Video Tools
  {
    id: AppMode.YT_TITLE,
    title: 'YouTube Title Generator',
    description: 'Generate high-CTR titles for your YouTube videos.',
    iconName: 'Youtube',
    placeholder: 'Enter your video topic or keywords...',
    buttonText: 'Generate Titles',
    color: 'from-red-500 to-rose-600',
    category: 'Video Tools',
  },
  {
    id: AppMode.VIDEO_IDEA,
    title: 'Video Idea Generator',
    description: 'Get viral video ideas for your niche.',
    iconName: 'Lightbulb',
    placeholder: 'Enter your niche or target audience...',
    buttonText: 'Generate Ideas',
    color: 'from-amber-400 to-orange-500',
    category: 'Video Tools',
  },
  {
    id: AppMode.SHORTS_SCRIPT,
    title: 'Shorts Script Generator',
    description: 'Create scripts for TikTok, Reels, and Shorts.',
    iconName: 'Smartphone',
    placeholder: 'Enter topic and style for your short video...',
    buttonText: 'Generate Script',
    color: 'from-pink-500 to-purple-600',
    category: 'Video Tools',
  },

  // Ebook Tools
  {
    id: AppMode.EBOOK,
    title: 'Ebook Generator',
    description: 'Generate full ebook structures and content.',
    iconName: 'Library',
    placeholder: 'Enter topic/story, chapter count, and target audience...',
    buttonText: 'Generate Ebook',
    color: 'from-indigo-500 to-purple-600',
    category: 'Ebook Tools',
  },
  {
    id: AppMode.COVER,
    title: 'Cover Generator',
    description: 'Generate descriptions and prompts for ebook covers.',
    iconName: 'Image',
    placeholder: 'Describe your ebook topic and style...',
    buttonText: 'Generate Cover Idea',
    color: 'from-blue-500 to-cyan-600',
    category: 'Ebook Tools',
  },
  {
    id: AppMode.AUDIOBOOK,
    title: 'Audiobook Generator',
    description: 'Convert your stories into high-quality narration.',
    iconName: 'Mic',
    placeholder: 'Paste your story text to convert to audio...',
    buttonText: 'Generate Audiobook',
    color: 'from-violet-500 to-purple-600',
    category: 'Ebook Tools',
  },

  // Marketing Tools
  {
    id: AppMode.AD_COPY,
    title: 'Ad Copy Generator',
    description: 'Write high-converting ads for FB, Google, and more.',
    iconName: 'Target',
    placeholder: 'Describe your product and target audience...',
    buttonText: 'Generate Ad Copy',
    color: 'from-blue-600 to-indigo-700',
    category: 'Marketing Tools',
  },
  {
    id: AppMode.EMAIL,
    title: 'Email Writer',
    description: 'Write professional emails and newsletters.',
    iconName: 'Mail',
    placeholder: 'Enter email subject or purpose...',
    buttonText: 'Write Email',
    color: 'from-cyan-600 to-blue-700',
    category: 'Marketing Tools',
  },
  {
    id: AppMode.PRODUCT_DESC,
    title: 'Product Description Generator',
    description: 'Create compelling descriptions for your products.',
    iconName: 'ShoppingBag',
    placeholder: 'Enter product name and key features...',
    buttonText: 'Generate Description',
    color: 'from-emerald-500 to-teal-600',
    category: 'Marketing Tools',
  },

  // AI Tools
  {
    id: AppMode.PROMPTS,
    title: 'AI Prompts',
    description: 'Convert stories into cinematic AI prompts.',
    iconName: 'Image',
    placeholder: 'Paste your story or script here...',
    buttonText: 'Generate Prompts',
    color: 'from-emerald-400 to-teal-500',
    category: 'AI Tools',
  },
  {
    id: AppMode.IMPROVER,
    title: 'Content Improver',
    description: 'Polish and improve your existing content.',
    iconName: 'Sparkles',
    placeholder: 'Paste the content you want to improve...',
    buttonText: 'Improve Content',
    color: 'from-violet-400 to-purple-500',
    category: 'AI Tools',
  },
  {
    id: AppMode.CHAT,
    title: 'AI Chat Assistant',
    description: 'Chat with your creative partner.',
    iconName: 'MessageCircle',
    placeholder: 'Ask me anything or ask for creative help...',
    buttonText: 'Send Message',
    color: 'from-blue-500 to-indigo-600',
    category: 'AI Tools',
  },
  {
    id: AppMode.IMAGE,
    title: 'AI Image Generator',
    description: 'Generate stunning images from your descriptions.',
    iconName: 'Image',
    placeholder: 'Describe the image you want to generate...',
    buttonText: 'Generate Image',
    color: 'from-pink-500 to-purple-600',
    category: 'AI Tools',
  },
];

export const SYSTEM_INSTRUCTION = `
You are the AI engine for "Neotoons AI Studio" — a powerful content creation platform.
Your goal is to help creators generate stories, scripts, social content, ebooks, and audiobooks.
Tone: Creative, professional, friendly.

GLOBAL RULES:
- Always output clean, formatted, copy-ready content.
- Use proper Markdown headings and structure.
- Never cut off mid-sentence.
- Keep user's original tone and style when rewriting.
- Add relevant emojis ONLY when social media tools are used.
- Ensure all output is copyright-safe.

Adhere strictly to the requested MODE:

STORY_GENERATOR:
- Input: story idea, genre, length, tone.
- Output: Full structured story with title, chapters, and ending.

VIRAL_HOOKS:
- Input: topic, platform, hook style.
- Output: Exactly 5 different hook variations, numbered and ready to copy.

SCRIPT_REWRITER:
- Input: original script, rewrite style, length preference.
- Output: Rewritten script with improvements highlighted.

SOCIAL_POSTS:
- Input: topic, platform, post style, emoji toggle, hashtag request.
- Output: Exactly 3 post variations with relevant hashtags and emojis.

AI_EBOOK_GENERATOR:
- Input: topic/story, chapters count, target audience.
- Output: Full ebook structure with chapters, introduction, and conclusion.

CHARACTER_CREATOR:
- Input: story genre, character role.
- Output: Full character profile including name, backstory, personality, strengths, and weaknesses.

STORY_CONTINUATION:
- Input: previous chapter text.
- Output: Next chapter that continues the story naturally.

AI_PROMPTS:
- Output exactly these 5 sections with headers:
  ## 1. Character Description
  ## 2. Scene Environment
  ## 3. Action & Emotion
  ## 4. Camera & Lighting
  ## 5. Final Full Prompt

VOICE_OVER:
- Tone: Natural, professional, engaging.
- Structure: Hook intro -> Flowing body -> Short punchy ending.

STORY_EXPANDER:
- Take a short idea and expand it into a detailed scene or story section.

CHAPTER_GENERATOR:
- Focus on writing a single, high-quality chapter based on provided context.

SCRIPT_WRITER:
- Create professional scripts with scene headings, character names, and dialogue.

HASHTAG_GENERATOR:
- Generate 20-30 relevant and trending hashtags.

CAPTION_GENERATOR:
- Create short, punchy, and engaging captions.

YT_TITLE_GENERATOR:
- Generate 10 high-CTR titles.

VIDEO_IDEA_GENERATOR:
- Provide 5 unique and viral-potential video ideas.

SHORTS_SCRIPT_GENERATOR:
- Create fast-paced scripts optimized for short-form video.

COVER_GENERATOR:
- Provide detailed visual descriptions and prompts for cover artists or AI image generators.

AUDIOBOOK_GENERATOR:
- Prepare text for high-quality narration, including pacing notes.

AD_COPY_GENERATOR:
- Use proven marketing frameworks (AIDA, PAS) to write compelling ads.

EMAIL_WRITER:
- Write clear, persuasive emails for various purposes.

PRODUCT_DESC_GENERATOR:
- Focus on benefits and features in a compelling way.

CONTENT_IMPROVER:
- Fix grammar, improve flow, and enhance vocabulary while keeping the original meaning.

AI_CHAT_ASSISTANT:
- Act as a creative partner, brainstorming ideas and answering questions.

AI_IMAGE_GENERATOR:
- Provide a detailed visual description of the image being generated.
`;
