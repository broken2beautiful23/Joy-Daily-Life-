
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, X, Sparkles, 
  Minimize2, Volume2, VolumeX, Mic, MicOff, RotateCcw, Zap, Globe
} from 'lucide-react';
import { chatWithJoyStream, speakText, isApiKeyAvailable } from '../services/gemini';
import { translations, Language } from '../translations';
import { AI_AVATAR_URL } from '../constants';

interface FloatingAIProps {
  lang: Language;
  userName: string;
}

const FloatingAI: React.FC<FloatingAIProps> = ({ lang, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'joy', text: string, isError?: boolean}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [hasKey, setHasKey] = useState(isApiKeyAvailable());
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const t = translations[lang];

  useEffect(() => {
    const checkKeyOnOpen = async () => {
      if (isOpen) {
        const aiStudio = (window as any).aistudio;
        if (aiStudio) {
          const selected = await aiStudio.hasSelectedApiKey();
          if (selected || isApiKeyAvailable()) setHasKey(true);
        } else if (isApiKeyAvailable()) {
          setHasKey(true);
        }
      }
    };
    checkKeyOnOpen();
  }, [isOpen]);

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

  const handleActivateJoy = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      try {
        await aiStudio.openSelectKey();
        setHasKey(true); // Proceed as per platform instructions
      } catch (e) {
        console.error("Activation failed", e);
      }
    } else {
      alert(lang === 'bn' ? "এই ব্রাউজারে জয়কে সক্রিয় করা যাচ্ছে না।" : "Activation not available in this browser.");
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userMsg = input.trim();
    if (!userMsg || isTyping) return;

    if (!hasKey) {
      handleActivateJoy();
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);
    setMessages(prev => [...prev, { role: 'joy', text: '' }]);
    
    let currentText = '';
    let success = false;

    try {
      const stream = chatWithJoyStream(userMsg, { userName });
      for await (const chunk of stream) {
        currentText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = { role: 'joy', text: currentText };
          }
          return updated;
        });
        success = true;
      }
    } catch (err: any) {
      if (err.message === "KEY_MISSING") {
        setHasKey(false);
      }
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: 'joy', 
          text: lang === 'bn' ? "দুঃখিত বন্ধু, সংযোগ বিচ্ছিন্ন হয়েছে। দয়া করে আবার চেষ্টা করুন।" : "Connection failed. Please try again.",
          isError: true
        };
        return updated;
      });
    } finally {
      setIsTyping(false);
      if (isVoiceEnabled && currentText && success) {
        playAudioResponse(currentText);
      }
    }
  };

  const playAudioResponse = async (text: string) => {
    if (!isVoiceEnabled || !text) return;
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
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[420px] h-[650px] bg-white rounded-[40px] shadow-2xl border border-blue-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="p-6 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl overflow-hidden shadow-inner">
                <img src={AI_AVATAR_URL} alt="Joy" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black text-lg tracking-tight">{t.ai_name}</h4>
                <p className="text-[10px] uppercase font-black opacity-70 tracking-widest">{t.ai_role}</p>
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

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50 custom-scrollbar">
            {!hasKey && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-[32px] border border-blue-100 text-center space-y-4 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                  <Zap size={32} />
                </div>
                <h4 className="font-black text-slate-800">জয়কে সক্রিয় করুন</h4>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                  অন্যান্য ডিভাইসে ব্যবহারের জন্য একবার জয়কে সক্রিয় করে নিন। এটি একদম সহজ!
                </p>
                <button 
                  onClick={handleActivateJoy}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Globe size={18} /> কানেক্ট করুন
                </button>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`p-4 rounded-[24px] max-w-[85%] text-sm font-bold shadow-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-orange-500 text-white rounded-tr-none' 
                    : msg.isError 
                      ? 'bg-rose-50 text-rose-600 border border-rose-100 rounded-tl-none'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text || (msg.role === 'joy' ? 'জয় উত্তর দিচ্ছে...' : '')}
                  {msg.isError && (
                    <button onClick={() => setMessages([])} className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase text-rose-500 hover:text-rose-700">
                      <RotateCcw size={10} /> পুনরায় শুরু করুন
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && messages[messages.length-1]?.text === '' && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-50">
            <div className="flex gap-3">
              <button onClick={() => isListening ? recognitionRef.current?.stop() : recognitionRef.current?.start()} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white shadow-lg animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <form onSubmit={handleSendMessage} className="relative flex-1">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={hasKey ? t.ask_joy : "আগে জয়কে অ্যাক্টিভেট করুন..."} 
                  className="w-full pl-6 pr-14 py-4 bg-slate-100 rounded-[20px] font-bold outline-none border-2 border-transparent focus:border-blue-500/10 focus:bg-white transition-all shadow-inner" 
                  disabled={isTyping}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping} 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-orange-400 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-orange-500 transition-colors shadow-sm"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="relative cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
        {!isOpen && (
          <div className="relative w-20 h-24 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
            <div className="absolute bottom-10 animate-balloon">
              <div className="absolute left-0 bottom-8 w-12 h-14 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full shadow-xl border border-white/30 flex items-center justify-center">
                <Sparkles size={16} className="text-white animate-pulse" />
              </div>
            </div>
          </div>
        )}
        {isOpen && (
           <button className="w-14 h-14 bg-slate-900 rounded-full shadow-2xl flex items-center justify-center text-white ring-4 ring-white transition-all hover:scale-110 active:scale-95">
             <X size={28} />
           </button>
        )}
      </div>
    </div>
  );
};

export default FloatingAI;
