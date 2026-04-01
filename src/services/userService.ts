import { dbService } from "./database";
import { User } from "../types";

export const userService = {
  /**
   * Get user by ID
   */
  async getById(userId: string) {
    return dbService.getOne('users', userId, null);
  },

  /**
   * Update user credits
   */
  async updateCredits(userId: string, amount: number) {
    const user = await this.getById(userId);
    if (!user) return false;

    const newCredits = Math.max(0, (user.credits || 0) + amount);
    const newUsage = (user.usage || 0) + (amount < 0 ? Math.abs(amount) : 0);

    return dbService.save('users', userId, { 
      credits: newCredits,
      usage: newUsage,
      generationCount: (user.generationCount || 0) + (amount < 0 ? 1 : 0)
    });
  },

  /**
   * Update user plan
   */
  async updatePlan(userId: string, planId: string, credits: number) {
    return dbService.save('users', userId, { 
      plan: planId,
      credits: credits,
      usage: 0 // Reset usage on plan upgrade? Or keep it? Usually reset or keep track separately.
    });
  },

  /**
   * Deduct credits for a tool usage
   */
  async deductCredits(userId: string, toolCredits: number) {
    return this.updateCredits(userId, -toolCredits);
  }
};
