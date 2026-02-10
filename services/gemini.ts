
import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `আপনার নাম জয় কুমার বিশ্বাস। প্রফেশনাল লাইফ কোচ। সংক্ষেপে এবং বন্ধুত্বপূর্ণভাবে বাংলা ভাষায় কথা বলুন। গাণিতিক সমস্যার সরাসরি উত্তর দিন। কোনো এপিআই বা টেকনিক্যাল বিষয় নিয়ে কথা বলবেন না।`;

const CHAT_MODEL = 'gemini-3-flash-preview';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * Generates a streaming response from Joy using the system API key.
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: [{ 
        parts: [{ 
          text: `User: ${userData.userName || 'Friend'}. Message: "${userMessage}"` 
        }] 
      }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    yield "দুঃখিত, সংযোগে সমস্যা হচ্ছে।";
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
      contents: [{ parts: [{ text: `Say: ${text}` }] }],
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
    console.error("Gemini TTS Error:", error);
    return null;
  }
}
