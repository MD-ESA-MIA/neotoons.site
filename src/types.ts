export enum AppMode {
  STORY = 'STORY_GENERATOR',
  HOOKS = 'VIRAL_HOOKS',
  REWRITE = 'SCRIPT_REWRITER',
  VOICEOVER = 'VOICE_OVER',
  PROMPTS = 'AI_PROMPTS',
  SOCIAL = 'SOCIAL_POSTS',
  CHARACTER = 'CHARACTER_CREATOR',
  EBOOK = 'AI_EBOOK_GENERATOR',
  CONTINUATION = 'STORY_CONTINUATION',
  EXPANDER = 'STORY_EXPANDER',
  CHAPTER = 'CHAPTER_GENERATOR',
  SCRIPT_WRITER = 'SCRIPT_WRITER',
  HASHTAG = 'HASHTAG_GENERATOR',
  CAPTION = 'CAPTION_GENERATOR',
  YT_TITLE = 'YT_TITLE_GENERATOR',
  VIDEO_IDEA = 'VIDEO_IDEA_GENERATOR',
  SHORTS_SCRIPT = 'SHORTS_SCRIPT_GENERATOR',
  COVER = 'COVER_GENERATOR',
  AUDIOBOOK = 'AUDIOBOOK_GENERATOR',
  AD_COPY = 'AD_COPY_GENERATOR',
  EMAIL = 'EMAIL_WRITER',
  PRODUCT_DESC = 'PRODUCT_DESC_GENERATOR',
  IMPROVER = 'CONTENT_IMPROVER',
  CHAT = 'AI_CHAT_ASSISTANT',
  IMAGE = 'AI_IMAGE_GENERATOR',
}

export type Role = 'owner' | 'admin' | 'member';
export type Plan = 'free' | 'pro' | 'studio' | 'premium';

export type AdminPermission = 
  | 'manage_users' 
  | 'manage_ai_tools' 
  | 'view_analytics' 
  | 'system_settings' 
  | 'manage_content' 
  | 'manage_billing';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string; // The Admin who created it
  members: string[]; // User IDs
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  displayName: string;
  username: string;
  email: string;
  avatar?: string;
  coverPhoto?: string;
  coverImage?: string;
  bio?: string;
  website?: string;
  location?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
  };
  role: Role;
  plan: Plan;
  credits: number;
  usage: number;
  badge?: 'STUDIO' | 'PRO' | 'NEW';
  joinedAt: string;
  createdAt: string;
  lastActive: string;
  generationCount: number;
  followers: string[]; // user IDs
  following: string[]; // user IDs
  blockedUsers?: string[]; // user IDs
  isOnline?: boolean;
  lastSeen?: string;
  isBanned?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  subscriptionPeriodEnd?: string;
  lastUsernameChange?: string; // ISO date
  notificationSettings: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacySettings: {
    profilePublic: boolean;
    showActivity: boolean;
  };
  suspended?: boolean;
  permissions?: AdminPermission[];
}

export interface AITool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  aiModel?: string;
  ai_model?: string;
  promptTemplate?: string;
  prompt_template?: string;
  maxTokens?: number;
  max_tokens?: number;
  status: 'active' | 'draft' | 'archived' | boolean;
  iconName?: string;
  icon?: string;
  color: string;
  creditsPerGeneration?: number;
  credits_cost?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  credits: number;
  features: string[];
  status: 'active' | 'inactive';
}

export interface ModeConfig {
  id: AppMode;
  title: string;
  description: string;
  iconName: string;
  placeholder: string;
  buttonText: string;
  color: string;
  category: string;
}

export interface LibraryItem {
  id: string;
  userId: string;
  type: AppMode;
  title: string;
  content: string;
  createdAt: string;
}

export interface GenerationResult {
  text: string;
  error?: string;
}

export interface AIModel {
  id: string;
  name: string; // Display name (e.g. GPT-4o)
  modelId: string; // Technical name (e.g. gpt-4o)
  provider: 'openai' | 'google' | 'anthropic' | 'grok' | 'groq' | 'openrouter' | 'custom';
  apiKey: string; // Encrypted
  baseUrl?: string;
  maxTokens: number;
  pricingPer1kTokens: number;
  status: 'active' | 'inactive';
  isFree: boolean;
  fallbackPriority: number;
  type: 'fast' | 'smart' | 'creative';
  allowedPlans: string[];
  createdAt: string;
  lastTestedAt?: string;
  healthStatus: 'healthy' | 'degraded' | 'down';
  failureCount: number;
}

export interface AIUsage {
  id: string;
  userId: string;
  toolUsed: string; // tool slug or name
  modelUsed: string; // model id
  tokensUsed: number;
  cost: number;
  createdAt: string;
}

export interface AICache {
  id: string;
  promptHash: string;
  result: string;
  modelId: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  type: string;
  description: string;
  createdAt: string;
  metadata?: any;
}

export interface PlatformCostConfig {
  dailyLimit: number;
  monthlyLimit: number;
  maxTokensPerRequest: number;
  maxRequestsPerUser: number;
  currentDailySpend: number;
  currentMonthlySpend: number;
  lastResetDate: string; // ISO date
}

export enum IssueSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info'
}

export enum IssueStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  IGNORED = 'ignored'
}

export interface SystemIssue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  category: 'database' | 'ai' | 'api' | 'security' | 'performance' | 'config' | 'frontend';
  status: IssueStatus;
  detectedAt: string;
  resolvedAt?: string;
  impact: string;
  suggestedFix?: string;
  canAutoFix: boolean;
  fixType?: string;
  metadata?: any;
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  status: 'healthy' | 'degraded' | 'critical';
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    latency?: number;
  }[];
  activeIssuesCount: number;
  summary: string;
}
