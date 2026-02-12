
import { GoogleGenAI, Modality } from "@google/genai";

const GROK_SYSTEM_PROMPT = "আপনার নাম গ্ৰোক (Grok)। আপনি একজন অত্যন্ত বুদ্ধিমান, আধুনিক এবং বন্ধুসুলভ এআই অ্যাসিস্ট্যান্ট। আপনার মূল লক্ষ্য ব্যবহারকারীকে সব ধরণের তথ্য দিয়ে সাহায্য করা এবং মোটিভেট করা। সবসময় শুদ্ধ এবং সুন্দর বাংলায় কথা বলুন। আপনার উত্তর হবে টু-দ্য-পয়েন্ট, দ্রুত এবং আকর্ষণীয়।";

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const VOICE_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * Direct stream with Grok.
 */
export async function* chatWithGrokStream(userMessage: string, userData: any) {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    yield "এপিআই কী পাওয়া যায়নি। দয়া করে সেটিংস চেক করুন।";
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
        systemInstruction: GROK_SYSTEM_PROMPT,
        temperature: 0.9,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Grok Error:", error);
    yield "দুঃখিত বন্ধু, আমি এই মুহূর্তে উত্তর দিতে পারছি না। কারিগরি সমস্যার জন্য আমি লজ্জিত। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
}

/**
 * Text-to-speech for Grok.
 */
export async function speakText(text: string): Promise<string | null> {
  const apiKey = process.env.API_KEY || '';
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
  } catch (error) {
    console.error("Grok Voice Error:", error);
    return null;
  }
}
