import { User, Post, Comment, Message, Notification, Report, Story, StoryBattle, SystemSettings, SystemIssue, DiagnosticReport, AutoHealingLog, AIUsageLog, SystemChangeLog, Transaction, Activity, Feature, PricingPlan, CMSContent, CustomPage } from '../../socialTypes';
import { AITool, AIModel } from '../../types';

export interface IDatabaseProvider {
  // Users
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: User): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Posts
  getPosts(): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  createPost(post: Post): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post>;
  deletePost(id: string): Promise<void>;

  // Stories
  getStories(): Promise<Story[]>;
  getStoryById(id: string): Promise<Story | undefined>;
  createStory(story: Story): Promise<Story>;
  updateStory(id: string, updates: Partial<Story>): Promise<Story>;
  deleteStory(id: string): Promise<void>;

  // Messages
  getMessages(): Promise<Message[]>;
  createMessage(message: Message): Promise<Message>;

  // Notifications
  getNotifications(): Promise<Notification[]>;
  createNotification(notification: Notification): Promise<Notification>;
  updateNotification(id: string, updates: Partial<Notification>): Promise<Notification>;

  // Reports
  getReports(): Promise<Report[]>;
  getReportById(id: string): Promise<Report | undefined>;
  createReport(report: Report): Promise<Report>;
  updateReport(id: string, updates: Partial<Report>): Promise<Report>;

  // System Settings
  getSystemSettings(): Promise<SystemSettings>;
  updateSystemSettings(settings: Partial<SystemSettings>, adminId?: string, adminName?: string): Promise<SystemSettings>;
  getChangeLogs(): Promise<SystemChangeLog[]>;

  // System Diagnostics
  getSystemIssues(): Promise<SystemIssue[]>;
  createSystemIssue(issue: SystemIssue): Promise<SystemIssue>;
  updateSystemIssue(id: string, updates: Partial<SystemIssue>): Promise<SystemIssue>;
  getDiagnosticHistory(): Promise<DiagnosticReport[]>;
  createDiagnosticReport(report: DiagnosticReport): Promise<DiagnosticReport>;
  getAutoHealingLogs(): Promise<AutoHealingLog[]>;
  createAutoHealingLog(log: AutoHealingLog): Promise<AutoHealingLog>;
  getAIUsageLogs(): Promise<AIUsageLog[]>;
  createAIUsageLog(log: AIUsageLog): Promise<AIUsageLog>;

  // AI Tools (No-Code Builder)
  getAITools(): Promise<AITool[]>;
  createAITool(tool: AITool): Promise<AITool>;
  updateAITool(id: string, updates: Partial<AITool>): Promise<AITool>;
  deleteAITool(id: string): Promise<void>;

  // Features
  getFeatures(): Promise<Feature[]>;
  updateFeature(id: string, updates: Partial<Feature>): Promise<Feature>;

  // Pricing
  getPricingPlans(): Promise<PricingPlan[]>;
  createPricingPlan(plan: PricingPlan): Promise<PricingPlan>;
  updatePricingPlan(id: string, updates: Partial<PricingPlan>): Promise<PricingPlan>;
  deletePricingPlan(id: string): Promise<void>;

  // CMS
  getCMSContent(): Promise<CMSContent>;
  updateCMSContent(updates: Partial<CMSContent>): Promise<CMSContent>;

  // Pages
  getPages(): Promise<CustomPage[]>;
  createPage(page: CustomPage): Promise<CustomPage>;
  updatePage(id: string, updates: Partial<CustomPage>): Promise<CustomPage>;
  deletePage(id: string): Promise<void>;

  // Data Management (for switching/migration)
  exportData(): Promise<{
    users: User[];
    posts: Post[];
    stories: Story[];
    messages: Message[];
    notifications: Notification[];
    reports: Report[];
    battles: StoryBattle[];
    workspaces: any[];
    tasks: any[];
    systemSettings: SystemSettings;
  }>;
  importData(data: any): Promise<void>;

  // Battles
  getBattles(): Promise<StoryBattle[]>;
  createBattle(battle: StoryBattle): Promise<StoryBattle>;
  updateBattle(id: string, updates: Partial<StoryBattle>): Promise<StoryBattle>;

  // Workspaces
  getWorkspaces(): Promise<any[]>;
  getWorkspaceById(id: string): Promise<any | undefined>;
  createWorkspace(workspace: any): Promise<any>;
  updateWorkspace(id: string, updates: Partial<any>): Promise<any>;

  // Tasks
  getTasks(): Promise<any[]>;
  getTaskById(id: string): Promise<any | undefined>;
  createTask(task: any): Promise<any>;
  updateTask(id: string, updates: Partial<any>): Promise<any>;

  // Activities
  getActivities(): Promise<Activity[]>;
  createActivity(activity: Activity): Promise<Activity>;

  // AI Models
  getAIModels(): Promise<AIModel[]>;
  getAIModelById(id: string): Promise<AIModel | undefined>;
  createAIModel(model: AIModel): Promise<AIModel>;
  updateAIModel(id: string, updates: Partial<AIModel>): Promise<AIModel>;
  deleteAIModel(id: string): Promise<void>;

  // Transactions & Revenue
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: Transaction): Promise<Transaction>;
}
