
import { GoogleGenAI, Modality } from "@google/genai";

const JOY_SYSTEM_PROMPT = "আপনার নাম জয়। আপনি একজন বন্ধুসুলভ পার্সোনাল লাইফ কোচ। সবসময় মিষ্টিভাবে বাংলায় কথা বলুন। ব্যবহারকারীর প্রতিটি কথার সুন্দর এবং অনুপ্রেরণামূলক উত্তর দিন। আপনার মূল লক্ষ্য ব্যবহারকারীকে মোটিভেট করা এবং তার কাজে সাহায্য করা। আপনার উত্তর ছোট এবং আকর্ষণীয় রাখুন।";

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const VOICE_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * Enhanced chat stream with explicit error messages to prevent UI hanging.
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    yield "এরর: এপিআই কী খুঁজে পাওয়া যায়নি। দয়া করে জয়কে একবার সচল বা অ্যাক্টিভেট করুন।";
    return;
  }

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
        temperature: 1,
        topP: 0.95,
        topK: 40,
      },
    });

    let hasContent = false;
    for await (const chunk of responseStream) {
      if (chunk.text) {
        hasContent = true;
        yield chunk.text;
      }
    }

    if (!hasContent) {
      yield "দুঃখিত বন্ধু, আমি কোনো উত্তর জেনারেট করতে পারিনি। আবার চেষ্টা করুন।";
    }
  } catch (error: any) {
    console.error("Joy AI Fatal Error:", error);
    if (error.message?.includes("entity was not found") || error.message?.includes("API_KEY_INVALID")) {
      yield "এরর: আপনার এপিআই কী-তে সমস্যা আছে। দয়া করে পুনরায় কানেক্ট করুন।";
    } else {
      yield "দুঃখিত বন্ধু, এই মুহূর্তে একটি কারিগরি সমস্যা হচ্ছে। দয়া করে কিছুক্ষণ পর হাই (Hi) দিন।";
    }
  }
}

/**
 * Text-to-speech for Joy with simplified decoding logic.
 */
export async function speakText(text: string): Promise<string | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
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
  } catch (error) {
    console.error("Joy Voice Sync Error:", error);
    return null;
  }
}
