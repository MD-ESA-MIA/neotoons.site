import { SystemSettings, SystemIssue, DiagnosticReport, AITool, SystemChangeLog, AIModel } from '../socialTypes';

const getAdminHeaders = (json = false): HeadersInit => {
  const headers: Record<string, string> = {};
  if (json) {
    headers['Content-Type'] = 'application/json';
  }

  if (typeof document !== 'undefined') {
    const csrfCookie = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('csrf_token='));

    if (csrfCookie) {
      const csrfToken = decodeURIComponent(csrfCookie.split('=').slice(1).join('='));
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
    }
  }

  return headers;
};

const ownerFetch = async (url: string, init: RequestInit = {}) => {
  const token = localStorage.getItem('neotoons_clerk_token');
  const headers = new Headers(init.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    credentials: 'include',
    headers,
    ...init,
  });

  if (response.status === 401) {
    localStorage.removeItem('neotoons_user');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }

  return response;
};

export const adminService = {
  async getOwnerSessionStatus(): Promise<{ valid: boolean; message: string }> {
    try {
      const response = await ownerFetch('/api/system-status', {
        headers: getAdminHeaders(),
      });

      if (!response.ok) {
        return { valid: false, message: 'Session expired' };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return { valid: false, message: 'Invalid response' };
      }

      const data = await response.json();
      return { valid: true, message: data?.message || 'Session valid' };
    } catch (_error) {
      return { valid: false, message: 'Failed to check session' };
    }
  },

  async getSettings(): Promise<SystemSettings> {
    const response = await ownerFetch('/api/owner/settings', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const response = await ownerFetch('/api/owner/settings', {
      method: 'POST',
      headers: getAdminHeaders(true),
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  },

  async getAIModels(): Promise<AIModel[]> {
    const response = await ownerFetch('/api/ai-models');
    if (!response.ok) throw new Error('Failed to fetch AI models');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async createAIModel(model: Partial<AIModel>): Promise<AIModel> {
    const response = await ownerFetch('/api/ai-models', {
      method: 'POST',
      headers: getAdminHeaders(true),
      body: JSON.stringify(model),
    });
    if (!response.ok) throw new Error('Failed to create AI model');
    return response.json();
  },

  async updateAIModel(id: string, updates: Partial<AIModel>): Promise<AIModel> {
    const response = await ownerFetch(`/api/ai-models/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update AI model');
    return response.json();
  },

  async deleteAIModel(id: string): Promise<void> {
    const response = await ownerFetch(`/api/ai-models/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete AI model');
  },

  async testAIModel(model: AIModel): Promise<{ success: boolean; response: string }> {
    const response = await ownerFetch('/api/ai-models/test', {
      method: 'POST',
      headers: getAdminHeaders(true),
      body: JSON.stringify({ model }),
    });
    if (!response.ok) throw new Error('Failed to test AI model');
    return response.json();
  },

  async getChangeLogs(): Promise<SystemChangeLog[]> {
    const response = await ownerFetch('/api/owner/logs', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch logs');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async sendBotCommand(command: string): Promise<{ success: boolean; message: string; changes?: any }> {
    const response = await ownerFetch('/api/owner/bot/command', {
      method: 'POST',
      headers: getAdminHeaders(true),
      body: JSON.stringify({ command }),
    });
    if (!response.ok) throw new Error('Failed to send bot command');
    return response.json();
  },

  async runOptimization(): Promise<{ success: boolean; message: string }> {
    const response = await ownerFetch('/api/owner/bot/optimize', {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to run optimization');
    return response.json();
  },

  async getStats(): Promise<any> {
    const response = await ownerFetch('/api/dashboard', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  async getDiagnostics(): Promise<{ issues: SystemIssue[]; latestReport: DiagnosticReport | null; history: DiagnosticReport[] }> {
    const response = await ownerFetch('/api/diagnostics', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch diagnostics');
    return response.json();
  },

  async getSystemStatus(): Promise<any> {
    const response = await ownerFetch('/api/system-status', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch system status');
    return response.json();
  },

  async runDiagnostics(): Promise<DiagnosticReport> {
    const response = await ownerFetch('/api/diagnostics/run', {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to run diagnostics');
    return response.json();
  },

  async applyFix(issueId: string): Promise<void> {
    const response = await ownerFetch(`/api/diagnostics/fix/${issueId}`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to apply fix');
  },

  async reportFrontendIssue(issue: Partial<SystemIssue>): Promise<void> {
    const response = await ownerFetch('/api/diagnostics/report', {
      method: 'POST',
      headers: getAdminHeaders(true),
      body: JSON.stringify(issue),
    });
    if (!response.ok) throw new Error('Failed to report issue');
  },

  async chatWithAIBot(message: string): Promise<{ text: string; changes?: any[] }> {
    const response = await ownerFetch('/api/ai-bot/chat', {
      method: 'POST',
      headers: getAdminHeaders(true),
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('AI Bot is currently unavailable');
    return response.json();
  },

  async getAITools(): Promise<AITool[]> {
    const response = await ownerFetch('/api/ai/tools', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch AI tools usage');
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.tools)) return data.tools;
    return [];
  },

  async createAITool(tool: Partial<AITool>): Promise<AITool> {
    const response = await ownerFetch('/api/tools', {
      method: 'POST',
      headers: getAdminHeaders(true),
      body: JSON.stringify(tool),
    });
    if (!response.ok) throw new Error('Failed to create AI tool');
    return response.json();
  },

  async updateAITool(id: string, tool: Partial<AITool>): Promise<AITool> {
    const response = await ownerFetch(`/api/tools/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(true),
      body: JSON.stringify(tool),
    });
    if (!response.ok) throw new Error('Failed to update AI tool');
    return response.json();
  },

  async deleteAITool(id: string): Promise<void> {
    const response = await ownerFetch(`/api/tools/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete AI tool');
  },

  async getRevenue(): Promise<any> {
    const response = await ownerFetch('/api/revenue', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch revenue data');
    return response.json();
  },

  async getActivity(): Promise<any[]> {
    const response = await ownerFetch('/api/activity', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch activity logs');
    return response.json();
  },

  async getUsers(): Promise<any[]> {
    const response = await ownerFetch('/api/users', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async getFeatures(): Promise<any[]> {
    const response = await ownerFetch('/api/features', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch features');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async updateFeature(id: string, updates: any): Promise<any> {
    const response = await ownerFetch(`/api/features/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update feature');
    return response.json();
  },

  async getPricingPlans(): Promise<any[]> {
    const response = await ownerFetch('/api/pricing', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch pricing plans');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async createPricingPlan(plan: any): Promise<any> {
    const response = await ownerFetch('/api/pricing', {
      method: 'POST',
      headers: getAdminHeaders(true),
      body: JSON.stringify(plan),
    });
    if (!response.ok) throw new Error('Failed to create pricing plan');
    return response.json();
  },

  async updatePricingPlan(id: string, updates: any): Promise<any> {
    const response = await ownerFetch(`/api/pricing/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update pricing plan');
    return response.json();
  },

  async deletePricingPlan(id: string): Promise<void> {
    const response = await ownerFetch(`/api/pricing/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete pricing plan');
  },

  async getCMSContent(): Promise<any> {
    const response = await ownerFetch('/api/cms', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch CMS content');
    return response.json();
  },

  async updateCMSContent(updates: any): Promise<any> {
    const response = await ownerFetch('/api/cms', {
      method: 'PATCH',
      headers: getAdminHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update CMS content');
    return response.json();
  },

  async getPages(): Promise<any[]> {
    const response = await ownerFetch('/api/pages', {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch pages');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async getPageBySlug(slug: string): Promise<any> {
    const response = await ownerFetch(`/api/pages/slug/${slug}`, {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch page');
    return response.json();
  },

  async createPage(page: any): Promise<any> {
    const response = await ownerFetch('/api/pages', {
      method: 'POST',
      headers: getAdminHeaders(true),
      body: JSON.stringify(page),
    });
    if (!response.ok) throw new Error('Failed to create page');
    return response.json();
  },

  async updatePage(id: string, updates: any): Promise<any> {
    const response = await ownerFetch(`/api/pages/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update page');
    return response.json();
  },

  async deletePage(id: string): Promise<void> {
    const response = await ownerFetch(`/api/pages/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete page');
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    const response = await ownerFetch('/api/users/update-role', {
      method: 'POST',
      headers: getAdminHeaders(true),
      body: JSON.stringify({ userId, role }),
    });
    if (!response.ok) throw new Error('Failed to update user role');
  },

  async deleteUser(userId: string): Promise<void> {
    const response = await ownerFetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  async toggleUserBan(userId: string, isBanned: boolean): Promise<void> {
    const response = await ownerFetch(`/api/users/${userId}/ban`, {
      method: 'PATCH',
      headers: getAdminHeaders(true),
      body: JSON.stringify({ isBanned }),
    });
    if (!response.ok) throw new Error('Failed to toggle user ban');
  },
};

