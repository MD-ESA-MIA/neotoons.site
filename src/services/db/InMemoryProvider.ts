import { IDatabaseProvider } from './types';
import { User, Post, Story, Message, Notification, Report, SystemSettings, SystemIssue, DiagnosticReport, AutoHealingLog, AIUsageLog, SystemChangeLog, Transaction, Activity, Feature, PricingPlan, CMSContent, CustomPage } from '../../socialTypes';
import { AITool, AIModel } from '../../types';

export class InMemoryProvider implements IDatabaseProvider {
  private users: User[] = [];
  private posts: Post[] = [];
  private stories: Story[] = [];
  private messages: Message[] = [];
  private notifications: Notification[] = [];
  private reports: Report[] = [];
  private battles: any[] = [];
  private workspaces: any[] = [];
  private tasks: any[] = [];
  private activities: Activity[] = [];
  private transactions: Transaction[] = [];
  private systemIssues: SystemIssue[] = [];
  private diagnosticHistory: DiagnosticReport[] = [];
  private aiTools: AITool[] = [];
  private aiModels: AIModel[] = [
    {
      id: 'gemini-3-flash',
      name: 'Gemini 3 Flash',
      modelId: 'gemini-3-flash-preview',
      provider: 'google',
      apiKey: process.env.GEMINI_API_KEY || '',
      maxTokens: 4096,
      pricingPer1kTokens: 0,
      status: 'active',
      isFree: true,
      fallbackPriority: 1,
      type: 'fast',
      allowedPlans: ['free', 'pro', 'studio', 'premium'],
      createdAt: new Date().toISOString(),
      healthStatus: 'healthy',
      failureCount: 0
    },
    {
      id: 'gemini-3.1-pro',
      name: 'Gemini 3.1 Pro',
      modelId: 'gemini-3.1-pro-preview',
      provider: 'google',
      apiKey: process.env.GEMINI_API_KEY || '',
      maxTokens: 8192,
      pricingPer1kTokens: 0.01,
      status: 'active',
      isFree: false,
      fallbackPriority: 2,
      type: 'smart',
      allowedPlans: ['pro', 'studio', 'premium'],
      createdAt: new Date().toISOString(),
      healthStatus: 'healthy',
      failureCount: 0
    }
  ];
  private autoHealingLogs: AutoHealingLog[] = [];
  private aiUsageLogs: AIUsageLog[] = [];
  private features: Feature[] = [
    { id: 'ai-tools', name: 'AI Tools', enabled: true, description: 'Enable the AI tools section', category: 'Core' },
    { id: 'blog', name: 'Blog', enabled: true, description: 'Enable the blog section', category: 'Content' },
    { id: 'marketplace', name: 'Marketplace', enabled: false, description: 'Enable the marketplace', category: 'Commerce' },
    { id: 'referral', name: 'Referral System', enabled: false, description: 'Enable the referral system', category: 'Growth' },
    { id: 'beta-features', name: 'Beta Features', enabled: true, description: 'Experimental features for testers', category: 'System' },
  ];
  private pricingPlans: PricingPlan[] = [
    { id: 'free', name: 'Free', price: '0', interval: 'month', features: ['20 generations', 'Basic support'], status: true, credits: 20 },
    { id: 'pro', name: 'Pro', price: '29', interval: 'month', features: ['Unlimited generations', 'Priority support', 'Advanced AI models'], status: true, isPopular: true, credits: 500 },
    { id: 'enterprise', name: 'Enterprise', price: '99', interval: 'month', features: ['Custom solutions', 'Dedicated account manager'], status: true, credits: 2000 },
  ];
  private cmsContent: CMSContent = {
    id: 'global',
    heroTitle: 'Build, Automate & Scale with AI — All in One Platform',
    heroDescription: 'Create content, generate images, write code, and launch AI-powered tools without switching platforms or writing complex code.',
    footerText: '© 2026 NeoToons AI. All rights reserved.',
    aboutSection: 'We are building the next generation of creative tools.',
    updatedAt: new Date().toISOString()
  };
  private pages: CustomPage[] = [
    { id: 'privacy', title: 'Privacy Policy', slug: 'privacy', content: '# Privacy Policy\nYour privacy is important to us.', status: 'published', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'terms', title: 'Terms of Service', slug: 'terms', content: '# Terms of Service\nBy using our service, you agree to...', status: 'published', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  private systemSettings: SystemSettings = {
    id: 'default',
    general: {
      siteName: 'NEOTOONS AI',
      siteDescription: 'The ultimate AI SaaS platform for content creators.',
      supportEmail: 'neotoons.site.help@gmail.com',
      domain: 'app.neotoons.ai'
    },
    branding: {
      logoUrl: '',
      faviconUrl: '',
      primaryColor: '#6366f1',
      accentColor: '#8b5cf6'
    },
    features: {
      registrationEnabled: true,
      maintenanceMode: false,
      aiGenerationEnabled: true,
      battleSystemEnabled: true
    },
    monetization: {
      stripePriceProMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_default',
      stripePriceStudioMonthly: process.env.STRIPE_PRICE_STUDIO_MONTHLY || 'price_studio_default',
      stripePricePremiumMonthly: 'price_premium_default',
      freeCreditsPerMonth: 100,
      proCreditsPerMonth: 1000,
      premiumCreditsPerMonth: 2500,
      studioCreditsPerMonth: 5000
    },
    smartRouting: {
      preferCheaperModels: true,
      fallbackOnFailure: true,
      maxRetries: 2
    },
    updatedAt: new Date().toISOString()
  };

  private changeLogs: SystemChangeLog[] = [];

  constructor(initialData?: any) {
    if (initialData) {
      this.importData(initialData);
    }
  }

  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    this.users[index] = { ...this.users[index], ...updates };
    return this.users[index];
  }

  async deleteUser(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
    this.posts = this.posts.filter(p => p.authorId !== id);
    this.stories = this.stories.filter(s => s.authorId !== id);
  }

  async getPosts(): Promise<Post[]> {
    return [...this.posts];
  }

  async getPostById(id: string): Promise<Post | undefined> {
    return this.posts.find(p => p.id === id);
  }

  async createPost(post: Post): Promise<Post> {
    this.posts.push(post);
    return post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const index = this.posts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');
    this.posts[index] = { ...this.posts[index], ...updates };
    return this.posts[index];
  }

  async deletePost(id: string): Promise<void> {
    this.posts = this.posts.filter(p => p.id !== id);
  }

  async getStories(): Promise<Story[]> {
    return [...this.stories];
  }

  async getStoryById(id: string): Promise<Story | undefined> {
    return this.stories.find(s => s.id === id);
  }

  async createStory(story: Story): Promise<Story> {
    this.stories.push(story);
    return story;
  }

  async updateStory(id: string, updates: Partial<Story>): Promise<Story> {
    const index = this.stories.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Story not found');
    this.stories[index] = { ...this.stories[index], ...updates };
    return this.stories[index];
  }

  async deleteStory(id: string): Promise<void> {
    this.stories = this.stories.filter(s => s.id !== id);
  }

  async getMessages(): Promise<Message[]> {
    return [...this.messages];
  }

  async createMessage(message: Message): Promise<Message> {
    this.messages.push(message);
    return message;
  }

  async getNotifications(): Promise<Notification[]> {
    return [...this.notifications];
  }

  async createNotification(notification: Notification): Promise<Notification> {
    this.notifications.push(notification);
    return notification;
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Notification not found');
    this.notifications[index] = { ...this.notifications[index], ...updates };
    return this.notifications[index];
  }

  async getReports(): Promise<Report[]> {
    return [...this.reports];
  }

  async getReportById(id: string): Promise<Report | undefined> {
    return this.reports.find(r => r.id === id);
  }

  async createReport(report: Report): Promise<Report> {
    this.reports.push(report);
    return report;
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    const index = this.reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');
    this.reports[index] = { ...this.reports[index], ...updates };
    return this.reports[index];
  }

  async getBattles() { return [...this.battles]; }
  async createBattle(battle: any) { this.battles.push(battle); return battle; }
  async updateBattle(id: string, updates: Partial<any>) {
    const index = this.battles.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Battle not found');
    this.battles[index] = { ...this.battles[index], ...updates };
    return this.battles[index];
  }

  async getWorkspaces() { return [...this.workspaces]; }
  async getWorkspaceById(id: string) { return this.workspaces.find(w => w.id === id); }
  async createWorkspace(workspace: any) { this.workspaces.push(workspace); return workspace; }
  async updateWorkspace(id: string, updates: Partial<any>) {
    const index = this.workspaces.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Workspace not found');
    this.workspaces[index] = { ...this.workspaces[index], ...updates };
    return this.workspaces[index];
  }

  async getTasks() { return [...this.tasks]; }
  async getTaskById(id: string) { return this.tasks.find(t => t.id === id); }
  async createTask(task: any) { this.tasks.push(task); return task; }
  async updateTask(id: string, updates: Partial<any>) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    this.tasks[index] = { ...this.tasks[index], ...updates };
    return this.tasks[index];
  }

  async getActivities(): Promise<Activity[]> { return [...this.activities]; }
  async createActivity(activity: Activity): Promise<Activity> { this.activities.push(activity); return activity; }

  async getTransactions(): Promise<Transaction[]> { return [...this.transactions]; }
  async createTransaction(transaction: Transaction): Promise<Transaction> { this.transactions.push(transaction); return transaction; }

  async getSystemIssues(): Promise<SystemIssue[]> {
    return [...this.systemIssues];
  }

  async createSystemIssue(issue: SystemIssue): Promise<SystemIssue> {
    this.systemIssues.push(issue);
    return issue;
  }

  async updateSystemIssue(id: string, updates: Partial<SystemIssue>): Promise<SystemIssue> {
    const index = this.systemIssues.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Issue not found');
    this.systemIssues[index] = { ...this.systemIssues[index], ...updates };
    return this.systemIssues[index];
  }

  async getDiagnosticHistory(): Promise<DiagnosticReport[]> {
    return [...this.diagnosticHistory];
  }

  async createDiagnosticReport(report: DiagnosticReport): Promise<DiagnosticReport> {
    this.diagnosticHistory.push(report);
    return report;
  }

  async getAutoHealingLogs(): Promise<AutoHealingLog[]> {
    return [...this.autoHealingLogs];
  }

  async createAutoHealingLog(log: AutoHealingLog): Promise<AutoHealingLog> {
    this.autoHealingLogs.push(log);
    return log;
  }

  async getAIUsageLogs(): Promise<AIUsageLog[]> {
    return [...this.aiUsageLogs];
  }

  async createAIUsageLog(log: AIUsageLog): Promise<AIUsageLog> {
    this.aiUsageLogs.push(log);
    return log;
  }

  async getAITools(): Promise<AITool[]> {
    return [...this.aiTools];
  }

  async createAITool(tool: AITool): Promise<AITool> {
    this.aiTools.push(tool);
    return tool;
  }

  async updateAITool(id: string, updates: Partial<AITool>): Promise<AITool> {
    const index = this.aiTools.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tool not found');
    this.aiTools[index] = { ...this.aiTools[index], ...updates };
    return this.aiTools[index];
  }

  async deleteAITool(id: string): Promise<void> {
    this.aiTools = this.aiTools.filter(t => t.id !== id);
  }

  // AI Models
  async getAIModels(): Promise<AIModel[]> {
    return [...this.aiModels];
  }

  async getAIModelById(id: string): Promise<AIModel | undefined> {
    return this.aiModels.find(m => m.id === id);
  }

  async createAIModel(model: AIModel): Promise<AIModel> {
    this.aiModels.push(model);
    return model;
  }

  async updateAIModel(id: string, updates: Partial<AIModel>): Promise<AIModel> {
    const index = this.aiModels.findIndex(m => m.id === id);
    if (index === -1) throw new Error('AI Model not found');
    this.aiModels[index] = { ...this.aiModels[index], ...updates };
    return this.aiModels[index];
  }

  async deleteAIModel(id: string): Promise<void> {
    this.aiModels = this.aiModels.filter(m => m.id !== id);
  }

  // Features
  async getFeatures(): Promise<Feature[]> {
    return this.features;
  }

  async updateFeature(id: string, updates: Partial<Feature>): Promise<Feature> {
    const index = this.features.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Feature not found');
    this.features[index] = { ...this.features[index], ...updates };
    return this.features[index];
  }

  // Pricing
  async getPricingPlans(): Promise<PricingPlan[]> {
    return this.pricingPlans;
  }

  async createPricingPlan(plan: PricingPlan): Promise<PricingPlan> {
    this.pricingPlans.push(plan);
    return plan;
  }

  async updatePricingPlan(id: string, updates: Partial<PricingPlan>): Promise<PricingPlan> {
    const index = this.pricingPlans.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Plan not found');
    this.pricingPlans[index] = { ...this.pricingPlans[index], ...updates };
    return this.pricingPlans[index];
  }

  async deletePricingPlan(id: string): Promise<void> {
    this.pricingPlans = this.pricingPlans.filter(p => p.id !== id);
  }

  // CMS
  async getCMSContent(): Promise<CMSContent> {
    return this.cmsContent;
  }

  async updateCMSContent(updates: Partial<CMSContent>): Promise<CMSContent> {
    this.cmsContent = { ...this.cmsContent, ...updates, updatedAt: new Date().toISOString() };
    return this.cmsContent;
  }

  // Pages
  async getPages(): Promise<CustomPage[]> {
    return this.pages;
  }

  async createPage(page: CustomPage): Promise<CustomPage> {
    this.pages.push(page);
    return page;
  }

  async updatePage(id: string, updates: Partial<CustomPage>): Promise<CustomPage> {
    const index = this.pages.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Page not found');
    this.pages[index] = { ...this.pages[index], ...updates, updatedAt: new Date().toISOString() };
    return this.pages[index];
  }

  async deletePage(id: string): Promise<void> {
    this.pages = this.pages.filter(p => p.id !== id);
  }

  async getSystemSettings(): Promise<SystemSettings> {
    return { ...this.systemSettings };
  }

  async updateSystemSettings(settings: Partial<SystemSettings>, adminId?: string, adminName?: string): Promise<SystemSettings> {
    const before = JSON.parse(JSON.stringify(this.systemSettings));
    this.systemSettings = { 
      ...this.systemSettings, 
      ...settings, 
      updatedAt: new Date().toISOString() 
    };
    
    if (adminId && adminName) {
      this.changeLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        adminId,
        adminName,
        category: 'system_settings',
        action: 'update',
        before,
        after: JSON.parse(JSON.stringify(this.systemSettings)),
        timestamp: new Date().toISOString()
      });
    }
    
    return { ...this.systemSettings };
  }

  async getChangeLogs(): Promise<SystemChangeLog[]> {
    return [...this.changeLogs];
  }

  async exportData() {
    return {
      users: this.users,
      posts: this.posts,
      stories: this.stories,
      messages: this.messages,
      notifications: this.notifications,
      reports: this.reports,
      battles: this.battles,
      workspaces: this.workspaces,
      tasks: this.tasks,
      systemSettings: this.systemSettings,
      transactions: this.transactions,
      activities: this.activities,
      aiModels: this.aiModels,
      aiTools: this.aiTools,
    };
  }

  async importData(data: any) {
    if (data.users) this.users = data.users;
    if (data.posts) this.posts = data.posts;
    if (data.stories) this.stories = data.stories;
    if (data.messages) this.messages = data.messages;
    if (data.notifications) this.notifications = data.notifications;
    if (data.reports) this.reports = data.reports;
    if (data.battles) this.battles = data.battles;
    if (data.workspaces) this.workspaces = data.workspaces;
    if (data.tasks) this.tasks = data.tasks;
    if (data.systemSettings) this.systemSettings = data.systemSettings;
    if (data.transactions) this.transactions = data.transactions;
    if (data.activities) this.activities = data.activities;
    if (data.aiModels) this.aiModels = data.aiModels;
    if (data.aiTools) this.aiTools = data.aiTools;
  }
}
