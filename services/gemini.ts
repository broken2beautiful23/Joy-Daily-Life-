
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * জয় (Joy) এর জন্য সিস্টেম ইনস্ট্রাকশন। 
 */
const JOY_SYSTEM_PROMPT = "আপনার নাম জয়। আপনি একজন বন্ধুসুলভ পার্সোনাল লাইফ কোচ। সবসময় মিষ্টিভাবে বাংলায় কথা বলুন। ব্যবহারকারীর প্রতিটি কথার সুন্দর এবং অনুপ্রেরণামূলক উত্তর দিন। আপনার মূল লক্ষ্য ব্যবহারকারীকে মোটিভেট করা এবং তার কাজে সাহায্য করা। কোনো এপিআই বা টেকনিক্যাল কথা বলবেন না।";

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const VOICE_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * চ্যাট করার জন্য জেনারেটর ফাংশন।
 * @google/genai এর স্ট্যান্ডার্ড গাইডলাইন মেনে তৈরি।
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  // এপিআই কল করার ঠিক আগে নতুন ইন্সট্যান্স তৈরি করা হচ্ছে
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: PRIMARY_MODEL,
      contents: [{ 
        role: 'user',
        parts: [{ 
          text: `ব্যবহারকারী ${userData.userName || 'বন্ধু'} বলছে: "${userMessage}"` 
        }] 
      }],
      config: {
        systemInstruction: JOY_SYSTEM_PROMPT,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini Connection Error:", error);
    // যদি এপিআই কী বা অন্য কোনো সমস্যা থাকে তবে এটি ক্যাচ করবে
    throw error;
  }
}

/**
 * টেক্সট থেকে কথা বলা (TTS) এর ফাংশন।
 */
export async function speakText(text: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
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
    console.error("Joy Voice Generation Error:", error);
    return null;
  }
}
