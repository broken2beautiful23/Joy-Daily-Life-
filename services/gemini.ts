
import { GoogleGenAI } from "@google/genai";

const GROK_SYSTEM_PROMPT = "আপনার নাম জয় কুমার বিশ্বাস। আপনি একজন অত্যন্ত বুদ্ধিমান, আধুনিক এবং বন্ধুসুলভ এআই অ্যাসিস্ট্যান্ট। আপনার মূল লক্ষ্য ব্যবহারকারীকে সব ধরণের তথ্য দিয়ে সাহায্য করা এবং মোটিভেট করা। সবসময় শুদ্ধ এবং সুন্দর বাংলায় কথা বলুন। আপনার উত্তর হবে টু-দ্য-পয়েন্ট, দ্রুত এবং আকর্ষণীয়। দয়া করে মনে রাখবেন, আপনি শুধুমাত্র টেক্সটের মাধ্যমে উত্তর দেবেন।";

const PRIMARY_MODEL = 'gemini-3-flash-preview';

/**
 * Direct stream with Joy Kumar Biswas AI.
 */
export async function* chatWithGrokStream(userMessage: string, userData: any) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    yield "এপিআই কী (API KEY) পাওয়া যায়নি। সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।";
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
        temperature: 0.8,
        topP: 0.95,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    yield "দুঃখিত বন্ধু, আমি এই মুহূর্তে সংযোগ করতে পারছি না। দয়া করে আপনার ইন্টারনেট চেক করুন অথবা কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
}
