import { dbService } from "./database";
import { PlatformCostConfig, AIUsage } from "../types";

const COLLECTION_CONFIG = "platform_cost_config";
const COLLECTION_USAGE = "ai_usage";

const DEFAULT_CONFIG: PlatformCostConfig = {
  dailyLimit: 100, // in credits or actual currency equivalent
  monthlyLimit: 2500,
  maxTokensPerRequest: 4096,
  maxRequestsPerUser: 100,
  currentDailySpend: 0,
  currentMonthlySpend: 0,
  lastResetDate: new Date().toISOString().split('T')[0]
};

export const costControlService = {
  async getConfig(): Promise<PlatformCostConfig> {
    const config = await dbService.getOne<PlatformCostConfig>(COLLECTION_CONFIG, "global", DEFAULT_CONFIG);
    if (!config) return DEFAULT_CONFIG;

    // Check for reset
    const today = new Date().toISOString().split('T')[0];
    if (config.lastResetDate !== today) {
      const updatedConfig = {
        ...config,
        currentDailySpend: 0,
        lastResetDate: today
      };
      // If month changed, reset monthly too
      if (config.lastResetDate.split('-')[1] !== today.split('-')[1]) {
        updatedConfig.currentMonthlySpend = 0;
      }
      await this.saveConfig(updatedConfig);
      return updatedConfig;
    }

    return config;
  },

  async saveConfig(config: PlatformCostConfig): Promise<boolean> {
    return dbService.save(COLLECTION_CONFIG, "global", config);
  },

  async trackUsage(usage: AIUsage): Promise<void> {
    await dbService.save(COLLECTION_USAGE, usage.id, usage);
    
    const config = await this.getConfig();
    const updatedConfig = {
      ...config,
      currentDailySpend: config.currentDailySpend + usage.cost,
      currentMonthlySpend: config.currentMonthlySpend + usage.cost
    };
    await this.saveConfig(updatedConfig);
  },

  async isLimitReached(): Promise<boolean> {
    const config = await this.getConfig();
    return config.currentDailySpend >= config.dailyLimit || config.currentMonthlySpend >= config.monthlyLimit;
  },

  async getUserUsage(userId: string): Promise<AIUsage[]> {
    const all = await dbService.getAll<AIUsage>(COLLECTION_USAGE, []);
    return all.filter(u => u.userId === userId);
  },

  async canUserMakeRequest(userId: string): Promise<boolean> {
    const config = await this.getConfig();
    const userUsage = await this.getUserUsage(userId);
    const today = new Date().toISOString().split('T')[0];
    const userTodayUsage = userUsage.filter(u => u.createdAt.startsWith(today));
    return userTodayUsage.length < config.maxRequestsPerUser;
  }
};
