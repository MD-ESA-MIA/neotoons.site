import { GoogleGenAI } from "@google/genai";
import { AppMode } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const getModelId = () => 'gemini-3-flash-preview';

export const generateContent = async (
  mode: string,
  userInput: string,
  modelId: string = 'gemini-3-flash-preview',
  maxTokens: number = 4000
): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("⚠️ Configuration Error: API Key is missing. Please check your environment settings and try again.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: 'user',
          parts: [
            { text: userInput }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        maxOutputTokens: maxTokens,
      },
    });

    if (!response.text) {
       const candidate = response.candidates?.[0];
       if (candidate?.finishReason) {
         if (candidate.finishReason === 'SAFETY') {
           throw new Error("🛡️ Safety Filter: Your request was blocked by our safety filters. Please try a different prompt and avoid sensitive content.");
         }
         if (candidate.finishReason === 'RECITATION') {
            throw new Error("📝 Copyright Notice: Your request was flagged for copyright concerns. Please rephrase your prompt with original content.");
         }
       }
       return "❌ No content generated. Your prompt may be incomplete. Try adding more details.";
    }

    return response.text;
  } catch (error: any) {
    console.error("API Error:", error);
    const msg = error.message?.toLowerCase() || "";
    
    if (msg.includes("401") || msg.includes("api key") || msg.includes("unauthenticated")) {
      throw new Error("🔐 Authentication Failed: Your API key is invalid or expired. Please check your configuration.");
    }
    
    if (msg.includes("429") || msg.includes("quota") || msg.includes("resource exhausted")) {
      throw new Error("⏱️ Rate Limit Reached: You've used all your requests for now. Please try again in a few minutes.");
    }

    if (msg.includes("500") || msg.includes("503") || msg.includes("overloaded") || msg.includes("service unavailable")) {
      throw new Error("🔧 Service Temporarily Unavailable: Our AI engine is experiencing issues. We're working on it – please try again in a moment.");
    }
    
    throw new Error(error.message || "❌ Something went wrong during generation. Please try again or contact support.");
  }
};
