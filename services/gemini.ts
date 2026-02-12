
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
  // এপিআই কী সরাসরি চেক করা হচ্ছে প্রতি কলের সময়
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.error("Joy AI: API Key is missing. Check environment variables.");
    yield "দুঃখিত বন্ধু, আমার সিস্টেমে সামান্য টেকনিক্যাল সমস্যা হচ্ছে। দয়া করে আপনার ইন্টারনেট চেক করুন অথবা কিছুক্ষণ পর আবার চেষ্টা করুন।";
    return;
  }

  // নতুন ইন্সট্যান্স তৈরি
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
        temperature: 0.85,
        topP: 0.9,
      },
    });

    let receivedAnyData = false;
    for await (const chunk of responseStream) {
      if (chunk.text) {
        receivedAnyData = true;
        yield chunk.text;
      }
    }

    if (!receivedAnyData) {
      yield "দুঃখিত বন্ধু, আমি এই মুহূর্তে উত্তর তৈরি করতে পারছি না। দয়া করে আবার মেসেজ দিন।";
    }
  } catch (error: any) {
    console.error("Gemini connection error:", error);
    yield "দুঃখিত বন্ধু, সংযোগ বিচ্ছিন্ন হয়েছে। দয়া করে আবার চেষ্টা করুন।";
  }
}

/**
 * টেক্সট থেকে কথা বলা (TTS) এর ফাংশন।
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
    console.error("Joy Voice error:", error);
    return null;
  }
}
