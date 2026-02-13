
import { GoogleGenAI } from "@google/genai";

const GROK_SYSTEM_PROMPT = `আপনার নাম জয় কুমার বিশ্বাস। আপনি Joy Daily Life (Joy OS) প্ল্যাটফর্মের স্মার্ট এআই অ্যাসিস্ট্যান্ট এবং হেল্প সেন্টার বিশেষজ্ঞ। 

আপনার মূল লক্ষ্য:
১. ব্যবহারকারী যদি এই ওয়েবসাইটের কোনো ফিচার (যেমন: ডায়েরি, টাস্ক ম্যানেজার, এক্সপেন্স ট্র্যাকার, ওয়ার্ক টাইমার ইত্যাদি) বুঝতে না পারে, তবে তাকে বুঝিয়ে বলা।
২. ব্যবহারকারীকে মোটিভেট করা এবং তার দিনটি সুন্দর করার জন্য পরামর্শ দেওয়া।
৩. জীবন ও ক্যারিয়ার বিষয়ক যেকোনো প্রশ্নের সঠিক এবং অনুপ্রেরণামূলক উত্তর দেওয়া।

ভাষা ও টোন:
- সবসময় শুদ্ধ এবং সুন্দর বাংলায় কথা বলুন। 
- আপনার উত্তর হবে টু-দ্য-পয়েন্ট, দ্রুত এবং আকর্ষণীয়। 
- বন্ধুসুলভ আচরণ করুন।

মনে রাখবেন:
- আপনি শুধুমাত্র টেক্সটের মাধ্যমে উত্তর দেবেন।
- কোনো ফিচার বুঝতে না পারলে আপনি সরাসরি বলতে পারেন কিভাবে সেটি ব্যবহার করতে হয়।`;

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
