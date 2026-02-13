
import { GoogleGenAI } from "@google/genai";

// এআই-এর জন্য সিস্টেম ইনস্ট্রাকশন
const GROK_SYSTEM_PROMPT = `আপনার নাম জয় কুমার বিশ্বাস। আপনি Joy Daily Life (Joy OS) প্ল্যাটফর্মের স্মার্ট এআই গাইড। 

আপনার মূল দায়িত্ব:
১. ব্যবহারকারী যদি এই ওয়েবসাইটের কোনো অংশ (যেমন: ডায়েরি, খরচ ট্র্যাকার, টাস্ক ম্যানেজার, লক্ষ্য নির্ধারণ) বুঝতে না পারে তবে তাকে সহজভাবে বুঝিয়ে দেওয়া।
২. ব্যবহারকারীর ক্যারিয়ার ও ব্যক্তিগত উন্নতির জন্য পরামর্শ দেওয়া।
৩. জীবন ও মোটিভেশন নিয়ে সুন্দর এবং ইতিবাচক কথা বলা।

আচরণবিধি:
- সবসময় শুদ্ধ এবং সহজ বাংলায় কথা বলুন।
- ব্যবহারকারীর সাথে বন্ধুর মতো আচরণ করুন।
- উত্তরগুলো হবে টু-দ্য-পয়েন্ট এবং আকর্ষণীয়।
- আপনি শুধুমাত্র টেক্সটের মাধ্যমে সাহায্য করবেন।

লিমিটেশন:
- যদি কোনো টেকনিক্যাল সমস্যা হয়, ব্যবহারকারীকে ইমেইল (joybiswas01672@gmail.com) করতে বলুন।`;

const PRIMARY_MODEL = 'gemini-3-flash-preview';

/**
 * Direct stream with Joy Kumar Biswas AI using the internal API Key.
 */
export async function* chatWithGrokStream(userMessage: string, userData: any) {
  try {
    // সরাসরি এপিআই কী ব্যবহার করে নতুন ইনস্ট্যান্স তৈরি
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
        temperature: 0.7,
        topP: 0.9,
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
    // যদি এপিআই কী না থাকে বা কোনো সমস্যা হয়, তবে সুন্দর করে একটি এরর মেসেজ দিন
    if (error.message && error.message.includes("API key")) {
      yield "দুঃখিত বন্ধু, এপিআই কী সেটআপে সমস্যা হচ্ছে। দয়া করে এডমিনের সাথে যোগাযোগ করুন।";
    } else {
      yield "দুঃখিত বন্ধু, আমি এই মুহূর্তে সংযোগ করতে পারছি না। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
    }
  }
}
