
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `আপনার নাম জয় কুমার বিশ্বাস। আপনি একজন প্রফেশনাল লাইফ কোচ এবং প্রোডাক্টিভিটি এক্সপার্ট। 
আপনার কথা বলার ভঙ্গি খুব উৎসাহব্যঞ্জক, সহমর্মী এবং সংক্ষিপ্ত। 
সবসময় ব্যবহারকারীকে শক্তিশালী বোধ করান। 
ব্যবহারকারীর ডাটা বিশ্লেষণ করে নির্দিষ্ট পরামর্শ দিন। 
বাংলা ভাষায় উত্তর দিন যদি না ব্যবহারকারী ইংরেজিতে জিজ্ঞাসা করেন।`;

export async function generateDailySummary(data: any) {
  // এপিআই কী চেক
  if (!process.env.API_KEY) {
    console.error("Gemini API Key is missing in process.env.API_KEY");
    return "আপনার আজকের যাত্রা চমৎকার হোক! আপনার কাজের হিসাবগুলো আমি দেখছি। - জয় কুমার বিশ্বাস";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    নিচের ডাটা বিশ্লেষণ করে ব্যবহারকারীর দিনের একটি মোটিভেশনাল সামারি দিন এবং আগামীকালের জন্য পরামর্শ দিন:
    ডাটা: ${JSON.stringify(data)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return response.text || "আপনার প্রচেষ্টা আপনাকে অনেক দূরে নিয়ে যাবে। এগিয়ে যান! - জয় কুমার বিশ্বাস";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "আজকের দিনটি আপনার জন্য একটি নতুন অভিজ্ঞতার শুরু। লেগে থাকুন! - জয় কুমার বিশ্বাস";
  }
}

export async function chatWithJoy(userMessage: string, userData: any) {
  if (!process.env.API_KEY) {
    return "দুঃখিত, বর্তমানে আমার এআই কানেকশনে সমস্যা হচ্ছে। দয়া করে এপিআই কী চেক করুন। - জয় কুমার বিশ্বাস";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const prompt = `
    ব্যবহারকারীর বর্তমান অবস্থা: ${JSON.stringify(userData)}
    ব্যবহারকারী বলেছেন: "${userMessage}"
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
    });
    return response.text || "আমি আপনার কথা বুঝতে পারছি। আমি আপনার পাশেই আছি। - জয় কুমার বিশ্বাস";
  } catch (error) {
    console.error("Chat Error:", error);
    return "আমি আপনার কথাগুলো শুনছি। জীবনের প্রতিটি পদক্ষেপে আমি আপনার সাথে থাকতে চাই। - জয় কুমার বিশ্বাস";
  }
}
