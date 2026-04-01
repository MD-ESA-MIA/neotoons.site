import { IDatabaseProvider } from "./db/types";
import { SystemSettings, SystemIssue, DiagnosticReport, AITool } from "../socialTypes";
import { IssueStatus, IssueSeverity } from "../types";

export class SystemControllerService {
  constructor(private db: IDatabaseProvider) {}

  async executeCommand(command: string, adminId: string, adminName: string): Promise<{ success: boolean; message: string; changes?: any }> {
    const settings = await this.db.getSystemSettings();
    const tools = await this.db.getAITools();
    const issues = await this.db.getSystemIssues();
    
    const prompt = `You are the Full System Controller AI for an AI SaaS platform. 
    You have absolute authority to manage, update, fix, and evolve the entire platform.
    
    CURRENT STATE:
    - Settings: ${JSON.stringify(settings)}
    - Active Tools: ${JSON.stringify(tools)}
    - Active Issues: ${JSON.stringify(issues)}
    
    COMMAND: "${command}"
    
    YOUR CAPABILITIES:
    1. Update System Settings (pricing, models, features, branding)
    2. Manage AI Tools (create, update, delete no-code tools)
    3. Fix System Issues (apply automated fixes)
    4. Optimize Performance/Cost (adjust routing, disable failing models)
    
    TASK:
    Parse the command and return a JSON object representing the actions to take.
    If the command is complex, break it into multiple steps.
    
    RETURN FORMAT:
    {
      "success": boolean,
      "message": "Detailed explanation of actions",
      "actions": [
        {
          "type": "update_settings" | "create_tool" | "update_tool" | "delete_tool" | "fix_issue",
          "payload": any,
          "requiresConfirmation": boolean
        }
      ]
    }`;

    const { aiRouterService } = await import("./aiRouterService");
    const result = await aiRouterService.generateContent(prompt, adminId, {
      taskType: 'smart',
      systemInstruction: "You are the platform's operator. Execute commands precisely. Output ONLY valid JSON."
    });

    try {
      const parsed = JSON.parse(result.text);
      if (!parsed.success) return { success: false, message: parsed.message || "Failed to process command" };

      const results = [];
      for (const action of parsed.actions) {
        if (action.requiresConfirmation) {
          results.push({ ...action, status: 'pending_confirmation' });
          continue;
        }

        try {
          switch (action.type) {
            case 'update_settings':
              await this.db.updateSystemSettings(action.payload, adminId, adminName);
              break;
            case 'create_tool':
              await this.db.createAITool({ ...action.payload, id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, createdAt: new Date().toISOString() });
              break;
            case 'update_tool':
              await this.db.updateAITool(action.payload.id, action.payload.updates);
              break;
            case 'delete_tool':
              await this.db.deleteAITool(action.payload.id);
              break;
            case 'fix_issue':
              // This would call the auto-fix logic
              await this.db.updateSystemIssue(action.payload.id, { status: IssueStatus.RESOLVED, resolvedAt: new Date().toISOString() });
              break;
          }
          results.push({ ...action, status: 'executed' });
        } catch (err) {
          results.push({ ...action, status: 'failed', error: String(err) });
        }
      }

      return { 
        success: true, 
        message: parsed.message, 
        changes: results 
      };
    } catch (error) {
      console.error("[SystemController] Failed to parse AI response:", result.text);
      return { success: false, message: "The AI failed to generate a valid operation plan." };
    }
  }

  async getSystemStatus(): Promise<any> {
    const settings = await this.db.getSystemSettings();
    const issues = await this.db.getSystemIssues();
    const logs = await this.db.getAIUsageLogs();
    
    const uptime = "99.9%"; // Simulated
    const activeUsers = (await this.db.getUsers()).length;
    const totalRevenue = 12450; // Simulated
    
    const allModels = await this.db.getAIModels();
    const modelHealth = allModels.map(model => {
      const modelLogs = logs.filter(l => l.modelId === model.id);
      const errors = modelLogs.filter(l => l.status === 'error').length;
      const successRate = modelLogs.length > 0 ? ((modelLogs.length - errors) / modelLogs.length) * 100 : 100;
      return { name: model.name, successRate: successRate.toFixed(1) + "%", isActive: model.status === 'active' };
    });

    return {
      health: {
        status: issues.filter(i => i.status === IssueStatus.ACTIVE).length > 0 ? 'degraded' : 'healthy',
        score: 100 - (issues.filter(i => i.status === IssueStatus.ACTIVE).length * 10)
      },
      uptime,
      users: {
        active: activeUsers,
        total: activeUsers * 1.5 // Simulated
      },
      totalRevenue,
      modelHealth,
      activeIssues: issues.filter(i => i.status === IssueStatus.ACTIVE),
      recentChanges: (await this.db.getChangeLogs()).slice(-5)
    };
  }

  async applyOptimization(adminId: string, adminName: string): Promise<{ success: boolean; message: string }> {
    const logs = await this.db.getAIUsageLogs();
    const allModels = await this.db.getAIModels();
    
    const modelStats = allModels.map(model => {
      const modelLogs = logs.filter(l => l.modelId === model.id);
      const total = modelLogs.length;
      const errors = modelLogs.filter(l => l.status === 'error').length;
      const failureRate = total > 0 ? errors / total : 0;
      return { id: model.id, name: model.name, failureRate };
    });

    const failingModels = modelStats.filter(m => m.failureRate > 0.5 && allModels.find(am => am.id === m.id)?.status === 'active');
    
    if (failingModels.length > 0) {
      for (const fm of failingModels) {
        await this.db.updateAIModel(fm.id, { status: 'inactive', healthStatus: 'down' });
      }
      return { success: true, message: `Automatically disabled ${failingModels.length} failing models: ${failingModels.map(m => m.name).join(', ')}` };
    }

    return { success: true, message: "System is running optimally. No changes needed." };
  }
}
