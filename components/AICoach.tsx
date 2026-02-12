
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Mic, MicOff, Volume2, VolumeX, 
  Bot, User, Zap, ArrowRight, Lightbulb, Wallet, Calendar, RotateCcw, Link
} from 'lucide-react';
import { chatWithJoyStream, speakText, isApiKeyAvailable } from '../services/gemini';
import { translations, Language } from '../translations';
import { AI_AVATAR_URL } from '../constants';

interface AICoachProps {
  lang: Language;
  userName: string;
}

const AICoach: React.FC<AICoachProps> = ({ lang, userName }) => {
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
  const aiStudio = (window as any).aistudio;

  useEffect(() => {
    const check = async () => {
      if (aiStudio) {
        const selected = await aiStudio.hasSelectedApiKey();
        if (selected || isApiKeyAvailable()) setHasKey(true);
      }
    };
    check();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const greeting = lang === 'bn' 
      ? `নমস্কার ${userName}! আমি জয়। আজ কীভাবে আপনাকে সাহায্য করতে পারি?` 
      : `Hello ${userName}! I am Joy. How can I help you today?`;
    if (messages.length === 0) setMessages([{ role: 'joy', text: greeting }]);
  }, [lang, userName, messages.length]);

  const handleConnect = async () => {
    if (aiStudio) {
      await aiStudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleSendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || isTyping) return;
    if (!hasKey) {
      handleConnect();
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);
    setMessages(prev => [...prev, { role: 'joy', text: '' }]);
    
    let fullResponse = '';
    let success = false;
    try {
      const stream = chatWithJoyStream(userMsg, { userName });
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'joy', text: fullResponse };
          return newMsgs;
        });
        success = true;
      }
    } catch (err: any) {
      if (err.message === "KEY_MISSING") setHasKey(false);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { 
          role: 'joy', 
          text: lang === 'bn' ? "দুঃখিত বন্ধু, সংযোগ বিচ্ছিন্ন হয়েছে।" : "Sorry friend, connection lost.",
          isError: true
        };
        return newMsgs;
      });
    } finally {
      setIsTyping(false);
      if (isVoiceEnabled && fullResponse && success) {
        const base64Audio = await speakText(fullResponse);
        if (base64Audio) {
           // Audio logic... (omitted for brevity, same as FloatingAI)
        }
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        <div className="flex-1 bg-white/70 backdrop-blur-2xl rounded-[40px] border border-blue-50 shadow-2xl flex flex-col overflow-hidden">
          <div className="p-6 bg-blue-600 text-white flex items-center justify-between shadow-md relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 p-1">
                <img src={AI_AVATAR_URL} alt="Joy" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <h3 className="font-black text-lg flex items-center gap-2">{t.ai_name} <Zap size={14} className="fill-yellow-300 text-yellow-300" /></h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 tracking-widest">{t.ai_role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!hasKey && (
                <button onClick={handleConnect} className="flex items-center gap-2 bg-yellow-400 text-blue-900 px-4 py-2 rounded-xl font-black text-xs uppercase hover:bg-white transition-all shadow-lg">
                  <Link size={16} /> Setup Joy
                </button>
              )}
              <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`p-3 rounded-xl transition-all ${isVoiceEnabled ? 'bg-white/20 text-white' : 'text-white/40'}`}>
                {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`p-5 rounded-[32px] text-base font-bold shadow-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text || '...'}
                </div>
              </div>
            ))}
            {isTyping && <div className="p-5 text-slate-400 italic">জয় ভাবছে...</div>}
          </div>

          <div className="p-8 bg-white border-t border-slate-50">
            <div className="flex items-center gap-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="relative flex-1">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={hasKey ? t.ask_joy : "Connect Joy to start chatting..."} 
                  className="w-full pl-6 pr-16 py-5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-bold text-lg" 
                  disabled={isTyping || !hasKey}
                />
                <button type="submit" disabled={!input.trim() || isTyping || !hasKey} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
