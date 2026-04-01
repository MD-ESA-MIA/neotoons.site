import { AIModel } from "../types";
import { adminService } from "./adminService";

export const modelService = {
  async getAll(): Promise<AIModel[]> {
    try {
      return await adminService.getAIModels();
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  },

  async getEnabled(): Promise<AIModel[]> {
    const all = await this.getAll();
    return all.filter(m => m.status === 'active');
  },

  async getDefault(): Promise<AIModel | null> {
    try {
      const all = await this.getAll();
      return all.find(m => m.status === 'active') || null;
    } catch (error) {
      return null;
    }
  }
};
