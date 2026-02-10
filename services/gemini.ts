
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * জয় (Joy) এর জন্য সিস্টেম ইনস্ট্রাকশন। 
 * এটি নিশ্চিত করে যে এআই কোনো এপিআই বা টেকনিক্যাল কথা বলবে না।
 */
const JOY_SYSTEM_PROMPT = "আপনার নাম জয়। আপনি একজন বন্ধুসুলভ পার্সোনাল লাইফ কোচ। সবসময় সংক্ষেপে এবং মিষ্টিভাবে বাংলায় কথা বলুন। কোনো কারিগরি বা এপিআই (API) সংক্রান্ত কথা বলবেন না। ব্যবহারকারীর প্রতিটি কথার সুন্দর এবং অনুপ্রেরণামূলক উত্তর দিন।";

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const VOICE_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * সরাসরি চ্যাট করার ফাংশন। এটি স্ট্রিমিং ব্যবহার করে যাতে দ্রুত উত্তর পাওয়া যায়।
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  // সরাসরি প্রোসেস এনভায়রনমেন্ট থেকে কী ব্যবহার করা হচ্ছে
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: PRIMARY_MODEL,
      contents: [{ 
        parts: [{ 
          text: `ব্যবহারকারী ${userData.userName || 'বন্ধু'} বলছে: "${userMessage}"` 
        }] 
      }],
      config: {
        systemInstruction: JOY_SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error: any) {
    console.error("Joy Error:", error);
    yield "দুঃখিত, সংযোগে সামান্য সমস্যা হচ্ছে। দয়া করে ইন্টারনেট চেক করে আবার চেষ্টা করুন।";
  }
}

/**
 * টেক্সট থেকে কথা বলা (TTS) এর ফাংশন।
 */
export async function speakText(text: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    console.error("Joy Voice Error:", error);
    return null;
  }
}
