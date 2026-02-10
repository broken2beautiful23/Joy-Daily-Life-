
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * জয় (Joy) এর জন্য সিস্টেম ইনস্ট্রাকশন। 
 */
const JOY_SYSTEM_PROMPT = "আপনার নাম জয়। আপনি একজন বন্ধুসুলভ পার্সোনাল লাইফ কোচ। সবসময় মিষ্টিভাবে বাংলায় কথা বলুন। ব্যবহারকারীর প্রতিটি কথার সুন্দর এবং অনুপ্রেরণামূলক উত্তর দিন। আপনার মূল লক্ষ্য ব্যবহারকারীকে মোটিভেট করা এবং তার কাজে সাহায্য করা। আপনার উত্তর ছোট এবং আকর্ষণীয় রাখুন।";

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const VOICE_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * চ্যাট করার জন্য জেনারেটর ফাংশন।
 * @google/genai এর স্ট্যান্ডার্ড গাইডলাইন মেনে তৈরি।
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  // এপিআই কী সরাসরি ব্যবহার করা হচ্ছে
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please contact administrator.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: PRIMARY_MODEL,
      // সহজ পদ্ধতিতে প্রম্পট পাঠানো হচ্ছে স্ট্যাবিলিটি নিশ্চিত করতে
      contents: `ব্যবহারকারীর নাম: ${userData.userName || 'বন্ধু'}। ব্যবহারকারীর বার্তা: "${userMessage}"`,
      config: {
        systemInstruction: JOY_SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.8,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error: any) {
    console.error("Critical Gemini Connection Error:", error);
    throw error;
  }
}

/**
 * টেক্সট থেকে কথা বলা (TTS) এর ফাংশন।
 */
export async function speakText(text: string): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

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
    console.error("Voice Generation Error:", error);
    return null;
  }
}
