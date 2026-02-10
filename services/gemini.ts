
import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `আপনার নাম জয় কুমার বিশ্বাস। আপনি একজন প্রফেশনাল লাইফ কোচ এবং প্রোডাক্টিভিটি এক্সপার্ট। 
আপনার কথা বলার ভঙ্গি খুব উৎসাহব্যঞ্জক, সহমর্মী এবং সংক্ষিপ্ত। 
সবসময় ব্যবহারকারীকে শক্তিশালী বোধ করান। 
বাংলা ভাষায় উত্তর দিন যদি না ব্যবহারকারী ইংরেজিতে জিজ্ঞাসা করেন।`;

const MODEL_TEXT = 'gemini-3-flash-preview';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

/**
 * Creates a fresh instance of GoogleGenAI to ensure updated API context.
 */
const getAIInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function generateDailySummary(data: any) {
  const ai = getAIInstance();
  
  const prompt = `
    নিচের ডাটা বিশ্লেষণ করে ব্যবহারকারীর দিনের একটি মোটিভেশনাল সামারি দিন এবং আগামীকালের জন্য পরামর্শ দিন:
    ডাটা: ${JSON.stringify(data)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return response.text || "আপনার প্রচেষ্টা আপনাকে অনেক দূরে নিয়ে যাবে। এগিয়ে যান!";
  } catch (error: any) {
    console.error("AI Insight Error:", error);
    return "আজকের দিনটি আপনার জন্য একটি নতুন অভিজ্ঞতা ছিল। আগামীকাল আরও ভালো করার চেষ্টা করুন!";
  }
}

export async function chatWithJoy(userMessage: string, userData: any) {
  const ai = getAIInstance();

  const prompt = `
    ব্যবহারকারীর বর্তমান অবস্থা: ${JSON.stringify(userData)}
    ব্যবহারকারী বলেছেন: "${userMessage}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
    });
    return response.text || "আমি আপনার কথা বুঝতে পারছি। দয়া করে একটু বুঝিয়ে বলুন।";
  } catch (error: any) {
    console.error("Chat Error:", error);
    throw error;
  }
}

export async function speakText(text: string): Promise<string | null> {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: `Say cheerfully: ${text}`,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error: any) {
    console.error("TTS Error:", error);
    return null;
  }
}
