
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, X, Loader2, Sparkles, 
  Minimize2, Volume2, VolumeX, Mic, MicOff, AlertCircle, Zap
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
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const greeting = lang === 'bn' 
          ? `নমস্কার ${userName}! আমি জয় কুমার বিশ্বাস। আজ আপনাকে কীভাবে সাহায্য করতে পারি?` 
          : `Hello ${userName}! I am Joy Kumar Biswas. How can I help you today?`;
        setMessages([{ role: 'joy', text: greeting }]);
      }, 600);
    }
  }, [isOpen, userName, lang]);

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

  const playAudioResponse = async (text: string) => {
    if (!isVoiceEnabled) return;
    try {
      const base64Audio = await speakText(text);
      if (base64Audio) {
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
      }
    } catch (err) {
      console.error("Audio playback failed:", err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userMsg = input.trim();
    
    if (!userMsg || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setError(null);
    setIsTyping(true);

    try {
      const response = await chatWithJoy(userMsg, { userName });
      setMessages(prev => [...prev, { role: 'joy', text: response }]);
      if (isVoiceEnabled) await playAudioResponse(response);
    } catch (error: any) {
      console.error("AI Error:", error);
      setError(lang === 'bn' ? "সাময়িক সমস্যা হচ্ছে। দয়া করে আবার চেষ্টা করুন।" : "Service temporarily unavailable. Please try again.");
      setMessages(prev => [...prev, { role: 'joy', text: lang === 'bn' ? "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।" : "Sorry, I am unable to respond at this moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[600px] bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-blue-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
          <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 overflow-hidden shadow-inner relative">
                <img src={AI_AVATAR_URL} alt="Joy" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h4 className="font-black text-sm leading-tight flex items-center gap-2">
                  {t.ai_name} <Zap size={12} className="text-yellow-300 fill-yellow-300" />
                </h4>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">{t.ai_role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`p-2 rounded-xl transition-all ${isVoiceEnabled ? 'bg-white/20 text-white shadow-inner' : 'text-white/40'}`}>
                {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <Minimize2 size={18} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div className={`p-4 rounded-3xl text-sm font-bold shadow-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.text}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest text-slate-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.role === 'user' ? userName : t.ai_name}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 mb-4 p-4 bg-red-50 text-red-700 rounded-2xl text-[11px] font-bold border border-red-100 flex items-center gap-2 animate-in zoom-in duration-300">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="p-5 bg-white border-t border-slate-100 shadow-inner">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleListening} 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <form onSubmit={handleSendMessage} className="relative flex-1 group">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={t.ask_joy} 
                  className="w-full pl-5 pr-12 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-bold transition-all placeholder:text-slate-400" 
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping} 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative overflow-hidden ${
          isOpen ? 'bg-slate-900 ring-4 ring-slate-100' : 'blue-btn ring-4 ring-blue-100'
        }`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? <X size={26} className="text-white" /> : <img src={AI_AVATAR_URL} alt="Joy" className="w-full h-full object-cover scale-110" />}
      </button>
    </div>
  );
};

export default FloatingAI;
