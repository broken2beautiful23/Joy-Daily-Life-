
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * জয় (Joy) এর জন্য সিস্টেম ইনস্ট্রাকশন। 
 */
const JOY_SYSTEM_PROMPT = "আপনার নাম জয়। আপনি একজন বন্ধুসুলভ পার্সোনাল লাইফ কোচ। সবসময় মিষ্টিভাবে বাংলায় কথা বলুন। ব্যবহারকারীর প্রতিটি কথার সুন্দর এবং অনুপ্রেরণামূলক উত্তর দিন। আপনার মূল লক্ষ্য ব্যবহারকারীকে মোটিভেট করা এবং তার কাজে সাহায্য করা। কোনো এপিআই বা টেকনিক্যাল কথা বলবেন না।";

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const VOICE_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * সবার জন্য সরাসরি চ্যাট করার ব্যবস্থা।
 * এটি সরাসরি process.env.API_KEY ব্যবহার করে যা সবার জন্য উন্মুক্ত।
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  // এপিআই কী চেক করে নতুন ইন্সট্যান্স তৈরি
  const apiKey = process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });
  
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
        topK: 40
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error: any) {
    console.error("Joy Connection Error Details:", error);
    // বিস্তারিত এরর মেসেজ না দিয়ে ব্যবহারকারীকে শান্ত রাখার চেষ্টা
    yield "একটু সমস্যা হচ্ছে বন্ধু। দয়া করে আবার মেসেজ দাও, আমি তোমার কথা শোনার জন্য তৈরি!";
  }
}

/**
 * টেক্সট থেকে কথা বলা (TTS) এর ফাংশন।
 */
export async function speakText(text: string): Promise<string | null> {
  const apiKey = process.env.API_KEY || '';
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

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData || null;
  } catch (error: any) {
    console.error("Voice Error:", error);
    return null;
  }
}
