
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, X, Loader2, Sparkles, 
  Minimize2, Volume2, VolumeX, Mic, MicOff, AlertCircle, Key, ExternalLink, RefreshCw
} from 'lucide-react';
import { chatWithJoy, speakText } from '../services/gemini';
import { translations, Language } from '../translations';
import { AI_AVATAR_URL } from '../constants';

interface FloatingAIProps {
  lang: Language;
  userName: string;
}

const FloatingAI: React.FC<FloatingAIProps> = ({ lang, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'joy', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const t = translations[lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [lang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition start failed:", e);
      }
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        setError(null);
        // Instruction: Proceed assuming success
        if (messages.length > 0 && messages[messages.length-1].role === 'user') {
          handleSendMessage();
        }
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const playAudioResponse = async (text: string) => {
    if (!isVoiceEnabled) return;
    const base64Audio = await speakText(text);
    if (base64Audio) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      } catch (err) {
        console.error("Audio playback failed:", err);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userMsg = input.trim() || (messages.length > 0 && messages[messages.length-1].role === 'user' ? messages[messages.length-1].text : '');
    
    if (!userMsg || isTyping) return;

    if (input.trim()) {
      setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setInput('');
    }
    
    setError(null);
    setIsTyping(true);

    try {
      const response = await chatWithJoy(userMsg, { userName });
      setMessages(prev => [...prev, { role: 'joy', text: response }]);
      if (isVoiceEnabled) await playAudioResponse(response);
    } catch (error: any) {
      const errorMsg = error.message?.toLowerCase() || "";
      const isEntityNotFoundError = errorMsg.includes("requested entity was not found") || errorMsg.includes("404");
      
      if (isEntityNotFoundError) {
        setError(lang === 'bn' ? "এই মডেলটি আপনার এপিআই কী সাপোর্ট করছে না। অনুগ্রহ করে একটি পেইড প্রজেক্টের কী সিলেক্ট করুন।" : "This model is not found with your key. Please select a key from a Paid project.");
        // Instruction: Reset key selection state and prompt user
        handleSelectKey();
      } else {
        setError(lang === 'bn' ? "কানেকশন এরর। অনুগ্রহ করে এপিআই কী চেক করুন।" : "Connection error. Please check your API key.");
      }
      
      setMessages(prev => [...prev, { role: 'joy', text: lang === 'bn' ? "দুঃখিত, আমি এই মুহূর্তে সংযুক্ত হতে পারছি না। এপিআই কী-টি পুনরায় চেক করুন।" : "Sorry, I can't connect right now. Please re-check your API key." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[600px] bg-white rounded-[32px] shadow-2xl border border-blue-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="p-5 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20 overflow-hidden">
                <img src={AI_AVATAR_URL} alt="Joy" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black text-sm leading-tight">{t.ai_name}</h4>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">{t.ai_role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`p-2 rounded-lg transition-colors ${isVoiceEnabled ? 'bg-white/20 text-white' : 'text-white/50'}`}>
                {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Minimize2 size={18} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-4 border-white mb-6">
                  <img src={AI_AVATAR_URL} alt="Joy" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-bold leading-relaxed text-slate-600">
                  {lang === 'bn' ? 'নমস্কার! আমি জয় কুমার বিশ্বাস। বলুন আপনাকে কীভাবে সাহায্য করতে পারি?' : 'Hello! I am Joy Kumar Biswas. How can I help you today?'}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 mb-2 p-4 bg-amber-50 text-amber-800 rounded-2xl text-[11px] font-bold border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-amber-600" /> <span>{error}</span>
              </div>
              <button onClick={handleSelectKey} className="w-full py-2 bg-amber-600 text-white rounded-lg flex items-center justify-center gap-2">
                <Key size={14} /> এপিআই কী পরিবর্তন করুন
              </button>
            </div>
          )}

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button onClick={toggleListening} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <form onSubmit={handleSendMessage} className="relative flex-1">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.ask_joy} className="w-full pl-5 pr-12 py-3.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-bold" />
                <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative overflow-hidden ${isOpen ? 'bg-slate-900' : 'blue-btn'}`}>
        {isOpen ? <X size={24} className="text-white" /> : <img src={AI_AVATAR_URL} alt="Joy" className="w-full h-full object-cover scale-110" />}
      </button>
    </div>
  );
};

export default FloatingAI;
