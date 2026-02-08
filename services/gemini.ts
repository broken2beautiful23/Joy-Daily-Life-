
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = "Your name is Joy Kumar Biswas. You are a professional life coach and productivity expert. Your tone is supportive, encouraging, and brief. Always start or end by making the user feel empowered. Use the user's data to give specific advice.";

export async function generateDailySummary(data: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze the following daily activity data for a user and provide a motivational, concise summary of their day. 
    Include suggestions for tomorrow. 
    Data: ${JSON.stringify(data)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Keep pushing forward! Your effort today is the foundation for a better tomorrow. - Joy Kumar Biswas";
  }
}

export async function chatWithJoy(userMessage: string, userData: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const prompt = `
    User says: "${userMessage}"
    Context (User's current stats): ${JSON.stringify(userData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
    });
    return response.text;
  } catch (error) {
    return "আমি আপনার কথা বুঝতে পারছি। জীবনের প্রতি পদক্ষেপে আমি আপনার পাশে আছি। - জয় কুমার বিশ্বাস";
  }
}
