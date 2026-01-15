
import { GoogleGenAI } from "@google/genai";
import { DocumentFile } from "./types";
import { SYSTEM_INSTRUCTION, getPromptByStage } from "./prompts";

export const analyzeDocuments = async (files: DocumentFile[], stage: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const fileParts = files.map(file => ({
    inlineData: {
      data: file.base64,
      mimeType: file.mimeType
    }
  }));

  const prompt = getPromptByStage(stage);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          ...fileParts,
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 28000 }
      }
    });

    return response.text || "Не удалось получить ответ от экспертной системы.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("Requested entity was not found")) {
        return "Ошибка: Модель 'gemini-3-pro-preview' не найдена или недоступна для вашего ключа.";
    }
    return `Ошибка анализа: ${error.message || "Неизвестная ошибка"}`;
  }
};
