import { AppMode, User, IssueSeverity, IssueStatus, AITool, AIModel } from './types';
export { IssueSeverity, IssueStatus };
export type { User, AITool, AIModel };

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface Reaction {
  userId: string;
  type: ReactionType;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorBadge?: 'STUDIO' | 'PRO' | 'NEW';
  mode?: AppMode;
  title?: string;
  content: string;
  image?: string;
  storyRef?: string;
  reactions: Reaction[];
  likes: string[]; // user IDs
  comments: Comment[];
  shares: number;
  visibility: 'public' | 'private' | 'followers';
  isPinned?: boolean;
  createdAt: string;
  isAIExpanded?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  likes: string[]; // user IDs
  replies: Comment[];
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  image?: string;
  seen: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'reply' | 'reaction' | 'pin' | 'remove' | 'admin';
  fromUserId: string;
  fromUserName: string;
  senderName?: string; // Alias for fromUserName
  senderAvatar?: string;
  content: string;
  link?: string;
  postId?: string;
  commentId?: string;
  reactionType?: ReactionType;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  reason: 'spam' | 'hate_speech' | 'misinformation' | 'inappropriate' | 'other';
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface StoryBattle {
  id: string;
  storyA: Post;
  storyB: Post;
  votesA: string[]; // user IDs
  votesB: string[]; // user IDs
  expiresAt: string;
  winner?: 'A' | 'B';
}

export interface AIUsageLog {
  id: string;
  userId: string;
  modelId: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  cost: number;
  status: 'success' | 'error';
  error?: string;
  createdAt: string;
}

export interface SystemSettings {
  id: string;
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    domain: string;
  };
  branding: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    accentColor: string;
  };
  features: {
    registrationEnabled: boolean;
    maintenanceMode: boolean;
    aiGenerationEnabled: boolean;
    battleSystemEnabled: boolean;
  };
  monetization: {
    stripePriceProMonthly: string;
    stripePriceStudioMonthly: string;
    stripePricePremiumMonthly: string;
    freeCreditsPerMonth: number;
    proCreditsPerMonth: number;
    premiumCreditsPerMonth: number;
    studioCreditsPerMonth: number;
  };
  smartRouting: {
    preferCheaperModels: boolean;
    fallbackOnFailure: boolean;
    maxRetries: number;
  };
  updatedAt: string;
}

export interface SystemChangeLog {
  id: string;
  adminId: string;
  adminName: string;
  category: string;
  action: string;
  before: any;
  after: any;
  timestamp: string;
}

export interface SystemIssue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  category: 'api' | 'database' | 'integration' | 'performance' | 'security' | 'frontend' | 'config' | 'payments';
  location: string;
  impact: string;
  suggestedFix?: string;
  fixAction?: string; // Identifier for the one-click fix
  canAutoFix?: boolean;
  isPredictive?: boolean; // New: Predictive risk
  status: IssueStatus;
  detectedAt: string;
  resolvedAt?: string;
  metadata?: any;
}

export interface SmartInsight {
  id: string;
  type: 'optimization' | 'cost' | 'scalability' | 'security';
  title: string;
  description: string;
  impact: string;
  action?: string;
  actionLabel?: string;
}

export interface AutoHealingLog {
  id: string;
  issueId: string;
  issueTitle: string;
  actionTaken: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  status: 'healthy' | 'degraded' | 'critical';
  scores: {
    performance: number;
    security: number;
    ai: number;
    database: number;
    payments: number;
  };
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    latency?: number;
    category: 'performance' | 'security' | 'ai' | 'database' | 'payments' | 'config';
  }[];
  activeIssuesCount: number;
  summary: string;
  insights?: SmartInsight[];
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorBadge?: 'STUDIO' | 'PRO' | 'NEW';
  content?: string;
  image: string;
  views: string[]; // user IDs
  expiresAt: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  plan: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  stripeId?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  type: 'login' | 'registration' | 'post_create' | 'ai_generate' | 'subscription_change' | 'admin_action' | 'security_alert';
  description: string;
  metadata?: any;
  createdAt: string;
}

export interface Feature {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  category?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  interval: 'month' | 'year';
  features: string[];
  status: boolean;
  isPopular?: boolean;
  credits: number;
}

export interface CMSContent {
  id: string;
  heroTitle: string;
  heroDescription: string;
  footerText: string;
  aboutSection: string;
  updatedAt: string;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}
