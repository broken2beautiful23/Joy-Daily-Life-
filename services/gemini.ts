
import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `নাম: জয়। পরিচয়: লাইফ কোচ। নিয়ম: ১. শুধুমাত্র বাংলা ব্যবহার করুন। ২. সংক্ষেপে উত্তর দিন। ৩. বন্ধুত্বপূর্ণ আচরণ করুন। ৪. টেকনিক্যাল এপিআই নিয়ে বলবেন না।`;

const CHAT_MODEL = 'gemini-3-flash-preview';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * Generates a streaming response from Joy for instant feedback.
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  // Always create a fresh instance for the latest configuration
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: [{ 
        parts: [{ 
          text: `User ${userData.userName || 'Friend'}: "${userMessage}"` 
        }] 
      }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topK: 64,
        topP: 0.95,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error: any) {
    console.error("Joy Connection Error:", error);
    yield "দুঃখিত, বর্তমানে আমার সিস্টেমে একটু সমস্যা হচ্ছে। দয়া করে আবার চেষ্টা করুন।";
  }
}

/**
 * Converts text to speech using Gemini TTS model.
 */
export async function speakText(text: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text: text }] }],
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
    console.error("Joy TTS Error:", error);
    return null;
  }
}
