
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * জয় (Joy) এর জন্য সিস্টেম ইনস্ট্রাকশন। 
 * এটি এমনভাবে সেট করা হয়েছে যাতে এআই সবসময় বন্ধুসুলভ আচরণ করে।
 */
const JOY_PROMPT = "আপনার নাম জয়। আপনি একজন বন্ধুসুলভ পার্সোনাল লাইফ কোচ। সবসময় মিষ্টিভাবে বাংলায় কথা বলুন। কোনো এপিআই বা টেকনিক্যাল সেটআপ নিয়ে কথা বলবেন না। ব্যবহারকারীকে মোটিভেশন দিন এবং তার কাজে সাহায্য করুন।";

const MODEL_NAME = 'gemini-3-flash-preview';
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';

/**
 * সবার জন্য সরাসরি চ্যাট করার ব্যবস্থা।
 * এতে কোনো ম্যানুয়াল এপিআই কী দেওয়ার প্রয়োজন নেই।
 */
export async function* chatWithJoyStream(userMessage: string, userData: any) {
  // সিস্টেম থেকে অটোমেটিক এপিআই কী নেওয়া হচ্ছে
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [{ 
        parts: [{ 
          text: `ব্যবহারকারী ${userData.userName || 'বন্ধু'} বলছে: "${userMessage}"` 
        }] 
      }],
      config: {
        systemInstruction: JOY_PROMPT,
        temperature: 0.8,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Connection Error:", error);
    yield "দুঃখিত বন্ধু, আমি এখন একটু ব্যস্ত আছি। দয়া করে এক মিনিট পর আবার মেসেজ দাও।";
  }
}

/**
 * ভয়েস বা কথা বলার ফাংশন।
 */
export async function speakText(text: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL_NAME,
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
    return null;
  }
}
