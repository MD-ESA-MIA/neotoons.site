import { GoogleGenAI } from "@google/genai";
import { AIUsageLog, SystemSettings } from "../socialTypes";
import { AIModel } from "../types";

export interface GenerationResult {
  text: string;
  modelId: string;
  error?: string;
}

export const aiRouterService = {
  async generateContent(
    prompt: string, 
    userId: string, 
    options: { 
      modelId?: string; 
      taskType?: 'coding' | 'fast' | 'creative' | 'smart';
      toolSlug?: string;
      systemInstruction?: string;
    } = {}
  ): Promise<GenerationResult> {
    const { dbManager } = await import("./db/DatabaseManager");
    const db = dbManager.getProvider();
    const user = await db.getUserById(userId);

    if (!user) throw new Error("User not found");

    // Check Credits
    if (user.credits <= 0 && user.plan === 'free') {
      return { text: "", modelId: "", error: "You have run out of credits. Please upgrade your plan to continue." };
    }

    // 1. Fetch Active Models
    const allModels = await db.getAIModels();
    const activeModels = allModels.filter(m => m.status === 'active' && m.healthStatus !== 'down');

    if (activeModels.length === 0) {
      return { text: "", modelId: "", error: "No active AI models available at the moment." };
    }

    // 2. Select Initial Model
    let targetModel = this.selectModel(activeModels, options, user.plan);

    if (!targetModel) {
      return { text: "", modelId: "", error: "No suitable AI model found or allowed for your plan." };
    }

    // 3. Attempt Generation with Fallback based on Priority
    const modelsToTry = [
      targetModel,
      ...activeModels
        .filter(m => m.id !== targetModel?.id && m.allowedPlans.includes(user.plan))
        .sort((a, b) => a.fallbackPriority - b.fallbackPriority)
    ];

    for (const model of modelsToTry) {
      try {
        const result = await this.callModelAPI(model, prompt, options.systemInstruction);
        
        if (result.text) {
          // 4. Log Usage & Deduct Credits
          const tokens = this.estimateTokens((options.systemInstruction || "") + prompt + result.text);
          const cost = (tokens / 1000) * model.pricingPer1kTokens;
          
          // Deduct credits (1 credit = 1000 tokens for simplicity, or use cost)
          const creditsToDeduct = model.isFree ? 0 : Math.max(1, Math.ceil(tokens / 100)); 
          
          await db.updateUser(userId, { 
            credits: Math.max(0, user.credits - creditsToDeduct),
            usage: user.usage + tokens,
            generationCount: (user.generationCount || 0) + 1
          });

          await db.createAIUsageLog({
            id: `log_${Date.now()}`,
            userId,
            modelId: model.id,
            prompt,
            response: result.text,
            tokensUsed: tokens,
            cost,
            status: 'success',
            createdAt: new Date().toISOString()
          });

          // Reset failure count on success
          if (model.failureCount > 0) {
            await db.updateAIModel(model.id, { failureCount: 0, healthStatus: 'healthy' });
          }

          return { text: result.text, modelId: model.id };
        }
      } catch (error) {
        console.error(`[AI Router] Model ${model.name} (${model.modelId}) failed:`, error);
        
        // Update Health Status
        const newFailureCount = (model.failureCount || 0) + 1;
        const newStatus = newFailureCount >= 5 ? 'down' : (newFailureCount >= 3 ? 'degraded' : 'healthy');
        
        await db.updateAIModel(model.id, { 
          failureCount: newFailureCount,
          healthStatus: newStatus as any
        });

        await db.createAIUsageLog({
          id: `err_${Date.now()}`,
          userId,
          modelId: model.id,
          prompt,
          response: "",
          tokensUsed: 0,
          cost: 0,
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
          createdAt: new Date().toISOString()
        });
      }
    }

    return { text: "", modelId: "", error: "All AI models failed to respond. Please try again later." };
  },

  selectModel(activeModels: AIModel[], options: { modelId?: string; taskType?: string }, userPlan: string): AIModel | undefined {
    if (options.modelId && options.modelId !== 'auto') {
      const model = activeModels.find(m => m.id === options.modelId);
      if (model && model.allowedPlans.includes(userPlan)) return model;
    }

    // Filter by plan first
    const allowedModels = activeModels.filter(m => m.allowedPlans.includes(userPlan));
    if (allowedModels.length === 0) return undefined;

    // Smart Routing
    if (options.taskType === 'coding' || options.taskType === 'smart') {
      return allowedModels.find(m => m.type === 'smart') || allowedModels[0];
    }
    if (options.taskType === 'creative') {
      return allowedModels.find(m => m.type === 'creative') || allowedModels[0];
    }
    
    // Default to fast or highest priority
    return allowedModels.find(m => m.type === 'fast') || allowedModels.sort((a, b) => a.fallbackPriority - b.fallbackPriority)[0];
  },

  async callModelAPI(model: AIModel, prompt: string, systemInstruction?: string): Promise<{ text: string }> {
    if (model.provider === 'google') {
      const ai = new GoogleGenAI({ apiKey: model.apiKey || process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: model.modelId,
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined
      });
      return { text: response.text || "" };
    }

    // OpenAI, Anthropic, Grok, Groq, OpenRouter, etc.
    let baseUrl = model.baseUrl;
    if (!baseUrl) {
      switch (model.provider) {
        case 'openai': baseUrl = 'https://api.openai.com/v1'; break;
        case 'anthropic': baseUrl = 'https://api.anthropic.com/v1'; break;
        case 'groq': baseUrl = 'https://api.groq.com/openai/v1'; break;
        case 'grok': baseUrl = 'https://api.x.ai/v1'; break;
        case 'openrouter': baseUrl = 'https://openrouter.ai/api/v1'; break;
      }
    }

    if (!baseUrl) throw new Error(`No base URL for provider ${model.provider}`);

    // Handle Anthropic separately if needed, but many support OpenAI-compatible API
    if (model.provider === 'anthropic') {
       // Anthropic specific implementation if not using OpenAI proxy
       const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': model.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model.modelId,
          messages: [{ role: 'user', content: prompt }],
          system: systemInstruction,
          max_tokens: model.maxTokens || 1024
        })
      });
      const data = await response.json();
      return { text: data.content?.[0]?.text || "" };
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey}`
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: 0.7,
        max_tokens: model.maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { text: data.choices?.[0]?.message?.content || "" };
  },

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
};
