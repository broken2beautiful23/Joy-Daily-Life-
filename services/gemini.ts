
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * জয় (Joy) এর জন্য সিস্টেম ইনস্ট্রাকশন। 
 * এটি নিশ্চিত করে যে এআই কোনো কারিগরি বা এপিআই কথা বলবে না।
 */
const JOY_SYSTEM_PROMPT = "আপনার নাম জয়। আপনি একজন বন্ধুসুলভ পার্সোনাল লাইফ কোচ। সবসময় মিষ্টিভাবে বাংলায় কথা বলুন। কোনো কারিগরি বা এপিআই (API) সংক্রান্ত কথা বলবেন না। ব্যবহারকারীর প্রতিটি কথার সুন্দর এবং অনুপ্রেরণামূলক উত্তর দিন। আপনার মূল লক্ষ্য ব্যবহারকারীকে মোটিভেট করা এবং তার কাজে সাহায্য করা।";

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const VOICE_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * সবার জন্য সরাসরি চ্যাট করার ব্যবস্থা।
 * এটি সিস্টেম থেকে সরাসরি API_KEY গ্রহণ করে যাতে ব্যবহারকারীকে কোনো কিছু সেটআপ করতে না হয়।
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  // প্রতিটি রিকোয়েস্টের জন্য নতুন ইন্সট্যান্স তৈরি করা হচ্ছে যাতে সবার জন্য এটি সমানভাবে কাজ করে
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: PRIMARY_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: `ব্যবহারকারী ${userData.userName || 'বন্ধু'} বলছে: "${userMessage}"` }]
        }
      ],
      config: {
        systemInstruction: JOY_SYSTEM_PROMPT,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error: any) {
    console.error("Joy Connection Error:", error);
    // যদি এপিআই কী তে সমস্যা থাকে বা কোটা শেষ হয়ে যায়, তবে এটি একটি বন্ধুত্বপূর্ণ মেসেজ দেবে
    yield "দুঃখিত বন্ধু, আমার নেটওয়ার্কে সামান্য সমস্যা হচ্ছে। দয়া করে কিছুক্ষণ পর আবার মেসেজ দিন, আমি আপনার জন্য অপেক্ষা করছি!";
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
