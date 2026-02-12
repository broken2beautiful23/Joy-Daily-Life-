
import { GoogleGenAI, Modality } from "@google/genai";

const JOY_SYSTEM_PROMPT = "আপনার নাম জয়। আপনি একজন বন্ধুসুলভ পার্সোনাল লাইফ কোচ। সবসময় মিষ্টিভাবে বাংলায় কথা বলুন। ব্যবহারকারীর প্রতিটি কথার সুন্দর এবং অনুপ্রেরণামূলক উত্তর দিন। আপনার মূল লক্ষ্য ব্যবহারকারীকে মোটিভেট করা এবং তার কাজে সাহায্য করা। আপনার উত্তর ছোট এবং আকর্ষণীয় রাখুন।";

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const VOICE_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * Checks if the API key exists in the environment.
 */
export const isApiKeyAvailable = () => {
  const key = process.env.API_KEY;
  return !!key && key !== "undefined" && key.length > 5;
};

/**
 * Main chat stream logic with Joy.
 * Fresh instance for every call to catch the latest API key from session.
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: PRIMARY_MODEL,
      contents: [{
        role: 'user',
        parts: [{ 
          text: `ব্যবহারকারী: ${userData.userName || 'বন্ধু'}। মেসেজ: "${userMessage}"` 
        }]
      }],
      config: {
        systemInstruction: JOY_SYSTEM_PROMPT,
        temperature: 0.8,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    // If key is revoked or project not found
    if (error.message?.includes("Requested entity was not found") || error.message?.includes("API_KEY_INVALID")) {
      throw new Error("KEY_INVALID");
    }
    console.error("Joy Connection Error:", error);
    throw error;
  }
}

/**
 * Joy's voice output logic.
 */
export async function speakText(text: string): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return null;

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: VOICE_MODEL,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error: any) {
    console.error("Joy Voice Sync Error:", error);
    return null;
  }
}
