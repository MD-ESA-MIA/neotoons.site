import { IDatabaseProvider } from './types';
import { InMemoryProvider } from './InMemoryProvider';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private currentProvider: IDatabaseProvider;

  private constructor() {
    // Default to InMemoryProvider
    this.currentProvider = new InMemoryProvider();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getProvider(): IDatabaseProvider {
    return this.currentProvider;
  }

  public async setProvider(newProvider: IDatabaseProvider, migrateData: boolean = true) {
    if (migrateData) {
      const data = await this.currentProvider.exportData();
      await newProvider.importData(data);
    }
    this.currentProvider = newProvider;
  }
}

export const dbManager = DatabaseManager.getInstance();
