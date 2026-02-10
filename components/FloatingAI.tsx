
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, X, Sparkles, 
  Minimize2, Volume2, VolumeX, Mic, MicOff, Zap
} from 'lucide-react';
import { chatWithJoyStream, speakText } from '../services/gemini';
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
      const greeting = lang === 'bn' 
        ? `নমস্কার ${userName}! আমি জয়। আজ কীভাবে আপনাকে সাহায্য করতে পারি?` 
        : `Hello ${userName}! I am Joy. How can I help you today?`;
      setMessages([{ role: 'joy', text: greeting }]);
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
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Mic error:", e);
      }
    }
  };

  const playAudioResponse = async (text: string) => {
    if (!isVoiceEnabled || !text || text.length < 2) return;
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
      console.error("Audio playback error:", err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userMsg = input.trim();
    if (!userMsg || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // AI উত্তরের জন্য প্লেসহোল্ডার মেসেজ যোগ করা
    setMessages(prev => [...prev, { role: 'joy', text: '' }]);
    
    let fullText = '';
    try {
      const stream = chatWithJoyStream(userMsg, { userName });
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'joy', text: fullText };
          return updated;
        });
      }
    } catch (err) {
      console.error("Joy Error:", err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'joy', text: "দুঃখিত, সংযোগে সমস্যা হচ্ছে। আপনার ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।" };
        return updated;
      });
    } finally {
      setIsTyping(false);
      if (isVoiceEnabled && fullText) {
        playAudioResponse(fullText);
      }
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[420px] h-[650px] bg-white rounded-[40px] shadow-2xl border border-blue-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="p-6 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl overflow-hidden">
                <img src={AI_AVATAR_URL} alt="Joy" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black text-lg">{t.ai_name}</h4>
                <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest">{t.ai_role}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`p-2 rounded-xl transition-all ${isVoiceEnabled ? 'bg-white/20' : 'opacity-40'}`}>
                {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl">
                <Minimize2 size={18} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`p-4 rounded-3xl max-w-[85%] text-sm font-bold shadow-sm ${
                  msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text || (msg.role === 'joy' ? 'জয় উত্তর দিচ্ছে...' : '')}
                </div>
              </div>
            ))}
            {isTyping && messages[messages.length-1]?.text === '' && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 flex gap-1 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-50">
            <div className="flex gap-3">
              <button onClick={toggleListening} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <form onSubmit={handleSendMessage} className="relative flex-1">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={t.ask_joy} 
                  className="w-full pl-6 pr-14 py-4 bg-slate-100 rounded-[20px] font-bold outline-none border-2 border-transparent focus:border-blue-500/10 focus:bg-white transition-all shadow-inner" 
                  disabled={isTyping}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping} 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-orange-400 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-orange-500 transition-colors"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Launcher Icon with Floating Effect */}
      <div className="relative cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <button className="w-14 h-14 bg-slate-900 rounded-full shadow-2xl flex items-center justify-center text-white ring-4 ring-white transition-all hover:scale-110 active:scale-95">
            <X size={28} />
          </button>
        ) : (
          <div className="relative w-20 h-24 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
            <div className="absolute bottom-10 animate-balloon">
              <div className="absolute -left-6 bottom-4 w-8 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full shadow-lg border border-white/20">
                <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-[1px] h-12 bg-slate-400/30"></div>
                <div className="absolute top-1 left-2 w-2 h-2 bg-white/40 rounded-full blur-[1px]"></div>
              </div>
              <div className="absolute left-0 bottom-8 w-10 h-12 bg-gradient-to-tr from-violet-600 to-violet-400 rounded-full shadow-xl border border-white/30 flex items-center justify-center">
                <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[1px] h-16 bg-slate-400/30"></div>
                <Sparkles size={14} className="text-white animate-pulse" />
              </div>
              <div className="absolute -right-6 bottom-4 w-8 h-10 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-full shadow-lg border border-white/20">
                <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-[1px] h-12 bg-slate-400/30"></div>
              </div>
            </div>
            <div className="absolute top-0 right-2 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm z-10"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingAI;
