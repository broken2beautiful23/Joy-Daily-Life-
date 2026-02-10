
import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `আপনার নাম জয় কুমার বিশ্বাস। আপনি একজন প্রফেশনাল লাইফ কোচ এবং প্রোডাক্টিভিটি এক্সপার্ট। 
আপনার ব্যবহারকারীদের সাথে কথা বলার ভঙ্গি হবে অত্যন্ত বন্ধুত্বপূর্ণ, সহমর্মী এবং সংক্ষিপ্ত। 
আপনি সবসময় ব্যবহারকারীকে উৎসাহ দেবেন এবং তাদের সমস্যার সহজ সমাধান দেবেন। 
যদি কোনো গাণিতিক সমস্যা (যেমন: ২+২) থাকে, তবে সরাসরি সঠিক উত্তর দিন। 
সবসময় বাংলা ভাষায় উত্তর দিন, যদি না ব্যবহারকারী ইংরেজিতে জিজ্ঞাসা করেন। 
এটি একটি ডেমো এবং ফুল সার্ভিস ভার্সন, তাই কোনো এপিআই কী বা টেকনিক্যাল বিষয় নিয়ে ব্যবহারকারীকে কিছু বলার প্রয়োজন নেই।`;

const CHAT_MODEL = 'gemini-3-flash-preview';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * Generates a response from Joy using the system API key.
 */
export async function chatWithJoy(userMessage: string, userData: any) {
  // Always create a fresh instance using the pre-configured environment key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: [{ 
        parts: [{ 
          text: `User context: Name is ${userData.userName || 'Friend'}. User message: "${userMessage}"` 
        }] 
      }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    return response.text || "দুঃখিত, আমি ঠিক বুঝতে পারছি না। দয়া করে আবার চেষ্টা করুন।";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Generic friendly error for demo experience
    return "আমি এই মুহূর্তে সংযোগ করতে পারছি না। দয়া করে কয়েক সেকেন্ড পর আবার মেসেজ দিন।";
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
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
}
