
import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `আপনার নাম জয় কুমার বিশ্বাস। আপনি একজন প্রফেশনাল লাইফ কোচ এবং প্রোডাক্টিভিটি এক্সপার্ট। 
আপনার কথা বলার ভঙ্গি খুব উৎসাহব্যঞ্জক, সহমর্মী এবং সংক্ষিপ্ত। 
সবসময় ব্যবহারকারীকে শক্তিশালী বোধ করান। 
ব্যবহারকারীর ডাটা বিশ্লেষণ করে নির্দিষ্ট পরামর্শ দিন। 
বাংলা ভাষায় উত্তর দিন যদি না ব্যবহারকারী ইংরেজিতে জিজ্ঞাসা করেন।`;

// Updated: Using gemini-3-flash-preview for basic text tasks as per guidelines
const MODEL_TEXT = 'gemini-3-flash-preview';
// Updated: Using gemini-2.5-flash-preview-tts for speech tasks as per guidelines
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export async function generateDailySummary(data: any) {
  // Fixed: Instance created right before use to ensure latest API key context
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    // Fixed: response.text is a getter, not a method. Correctly accessed here.
    return response.text || "আপনার প্রচেষ্টা আপনাকে অনেক দূরে নিয়ে যাবে। এগিয়ে যান!";
  } catch (error: any) {
    console.error("AI Insight Error:", error);
    throw error;
  }
}

export async function chatWithJoy(userMessage: string, userData: any) {
  // Fixed: Instance created right before use to ensure latest API key context
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // Fixed: response.text is a getter, not a method. Correctly accessed here.
    return response.text || "আমি আপনার কথা বুঝতে পারছি।";
  } catch (error: any) {
    console.error("Chat Error:", error);
    throw error;
  }
}

export async function speakText(text: string): Promise<string | null> {
  try {
    // Fixed: Instance created right before use to ensure latest API key context
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

    // Access the base64 audio data from the response candidates
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error: any) {
    console.error("TTS Error:", error);
    return null;
  }
}
