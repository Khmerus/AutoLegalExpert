
import { GoogleGenAI } from "@google/genai";
import { DocumentFile } from "./types";
import { SYSTEM_INSTRUCTION, getPromptByStage } from "./prompts";

export const analyzeDocuments = async (files: DocumentFile[], stage: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API ключ не найден. Добавьте переменную API_KEY в настройки Vercel.");
  }

  // Создаем экземпляр прямо перед вызовом, как требует инструкция для Vercel/Live окружений
  const ai = new GoogleGenAI({ apiKey });
  
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
        thinkingConfig: { thinkingBudget: 32000 }
      }
    });

    if (!response.text) {
      return "Модель вернула пустой ответ. Попробуйте загрузить документы более четко.";
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const errorMsg = error.message || "";
    
    if (errorMsg.includes("API key not valid") || errorMsg.includes("API_KEY_INVALID")) {
      return "ОШИБКА: Ваш API-ключ недействителен. Пожалуйста, создайте новый ключ на aistudio.google.com и обновите настройки в Vercel (не забудьте сделать Redeploy).";
    }
    
    if (errorMsg.includes("Requested entity was not found")) {
      return "Ошибка: Модель 'gemini-3-pro-preview' недоступна для вашего ключа. Попробуйте использовать другой аккаунт Google AI Studio.";
    }

    if (errorMsg.includes("billing")) {
      return "Ошибка: Для использования этой модели необходимо подключить платный аккаунт (Billing) в Google Cloud.";
    }

    return `Ошибка анализа: ${errorMsg}`;
  }
};
