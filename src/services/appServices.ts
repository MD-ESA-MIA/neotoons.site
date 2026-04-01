import axios from 'axios';
import { Feature, PricingPlan, CMSContent, CustomPage } from '../socialTypes';
import { AITool as Plugin } from '../types';

export type { Feature, PricingPlan, CMSContent, CustomPage, Plugin };

const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = API_ROOT ? `${API_ROOT}/api` : '/api';

const normalizeArrayPayload = <T>(payload: unknown, collectionKeys: string[] = []): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    for (const key of collectionKeys) {
      if (Array.isArray(record[key])) {
        return record[key] as T[];
      }
    }

    const values = Object.values(record);
    if (values.length > 0 && values.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
      return values as T[];
    }
  }

  return [];
};

type ResponseNormalizer = (payload: unknown) => unknown;

// Generic service for handling standard CRUD and subscriptions
class BaseService<T> {
  protected endpoint: string;
  private listeners: ((data: any) => void)[] = [];
  private data: any = null;
  private normalizeResponse?: ResponseNormalizer;

  constructor(endpoint: string, normalizeResponse?: ResponseNormalizer) {
    this.endpoint = `${API_BASE}/${endpoint}`;
    this.normalizeResponse = normalizeResponse;
  }

  private normalize(payload: unknown): unknown {
    if (!this.normalizeResponse) {
      return payload;
    }

    return this.normalizeResponse(payload);
  }

  async getAll(): Promise<T[]> {
    const res = await axios.get(this.endpoint);
    const normalized = this.normalize(res.data);
    this.data = normalized;
    this.notify();
    return normalized as T[];
  }

  async getOne(): Promise<T> {
    const res = await axios.get(this.endpoint);
    const normalized = this.normalize(res.data);
    this.data = normalized;
    this.notify();
    return normalized as T;
  }

  async update(updates: Partial<T>): Promise<T> {
    const res = await axios.patch(this.endpoint, updates);
    const normalized = this.normalize(res.data);
    this.data = normalized;
    this.notify();
    return normalized as T;
  }

  async save(data: T): Promise<boolean> {
    try {
      // @ts-ignore
      if (data.id) {
        // @ts-ignore
        await axios.patch(`${this.endpoint}/${data.id}`, data);
      } else {
        await axios.post(this.endpoint, data);
      }
      await this.getAll();
      return true;
    } catch (err) {
      console.error('Failed to save:', err);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await axios.delete(`${this.endpoint}/${id}`);
      await this.getAll();
      return true;
    } catch (err) {
      console.error('Failed to delete:', err);
      return false;
    }
  }

  subscribe(callback: (data: any) => void) {
    this.listeners.push(callback);
    // Initial fetch
    this.fetchInitial();
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private async fetchInitial() {
    try {
      const res = await axios.get(this.endpoint);
      this.data = this.normalize(res.data);
      this.notify();
    } catch (err) {
      console.error(`Failed to fetch ${this.endpoint}:`, err);
    }
  }

  private notify() {
    if (this.data !== null) {
      this.listeners.forEach(l => l(this.data));
    }
  }
}

export const featureService = new BaseService<Feature>(
  'features',
  (payload) => normalizeArrayPayload<Feature>(payload, ['features', 'items', 'data'])
);
export const cmsService = new BaseService<CMSContent>('cms');
export const pricingService = new BaseService<PricingPlan>(
  'pricing',
  (payload) => normalizeArrayPayload<PricingPlan>(payload, ['pricing', 'plans', 'items', 'data'])
);
export const pageService = new BaseService<CustomPage>(
  'pages',
  (payload) => normalizeArrayPayload<CustomPage>(payload, ['pages', 'items', 'data'])
);
export const pluginService = new BaseService<Plugin>(
  'public/tools',
  (payload) => normalizeArrayPayload<Plugin>(payload, ['tools', 'plugins', 'items', 'data'])
);
