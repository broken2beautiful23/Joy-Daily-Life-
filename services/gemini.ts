
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * জয় (Joy) এর জন্য সিস্টেম ইনস্ট্রাকশন। 
 */
const JOY_SYSTEM_PROMPT = "আপনার নাম জয়। আপনি একজন বন্ধুসুলভ পার্সোনাল লাইফ কোচ। সবসময় মিষ্টিভাবে বাংলায় কথা বলুন। ব্যবহারকারীর প্রতিটি কথার সুন্দর এবং অনুপ্রেরণামূলক উত্তর দিন। আপনার মূল লক্ষ্য ব্যবহারকারীকে মোটিভেট করা এবং তার কাজে সাহায্য করা। আপনার উত্তর ছোট এবং আকর্ষণীয় রাখুন। কোনো এপিআই বা টেকনিক্যাল কথা বলবেন না।";

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const VOICE_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * চ্যাট করার জন্য জেনারেটর ফাংশন।
 * @google/genai এর স্ট্যান্ডার্ড গাইডলাইন মেনে তৈরি।
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Critical: API Key is missing from environment.");
    yield "দুঃখিত বন্ধু, এআই সার্ভারের সাথে সংযোগের জন্য প্রয়োজনীয় কী (API Key) খুঁজে পাওয়া যাচ্ছে না। দয়া করে এডমিনকে জানান।";
    return;
  }

  // এপিআই কল করার আগে প্রতিবার নতুন করে ইন্সট্যান্স তৈরি করা হচ্ছে স্ট্যাবিলিটি নিশ্চিত করতে
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: PRIMARY_MODEL,
      contents: [{
        role: 'user',
        parts: [{ 
          text: `ব্যবহারকারীর নাম: ${userData.userName || 'বন্ধু'}। ব্যবহারকারীর বর্তমান বার্তা: "${userMessage}"` 
        }]
      }],
      config: {
        systemInstruction: JOY_SYSTEM_PROMPT,
        temperature: 0.8,
        topP: 0.9,
      },
    });

    let hasData = false;
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        hasData = true;
        yield text;
      }
    }

    if (!hasData) {
      yield "দুঃখিত বন্ধু, আমি এই মুহূর্তে উত্তর তৈরি করতে পারছি না। দয়া করে আবার চেষ্টা করো।";
    }
  } catch (error: any) {
    console.error("Gemini Stream Error Details:", error);
    if (error.message?.includes('403')) {
      yield "দুঃখিত বন্ধু, এপিআই কী-তে সমস্যা দেখা দিয়েছে (Permission Denied)।";
    } else if (error.message?.includes('429')) {
      yield "আমি এখন একটু বেশি ব্যস্ত আছি, দয়া করে ১ মিনিট পর আবার মেসেজ দিন।";
    } else {
      yield "দুঃখিত বন্ধু, নেটওয়ার্কে সামান্য সমস্যা হচ্ছে। দয়া করে আপনার ইন্টারনেট চেক করে আবার চেষ্টা করো।";
    }
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

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData || null;
  } catch (error: any) {
    console.error("Voice Generation Error:", error);
    return null;
  }
}
