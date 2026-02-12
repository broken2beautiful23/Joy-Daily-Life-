
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Mic, MicOff, Volume2, VolumeX, 
  Bot, User, Zap, ArrowRight, Lightbulb, Wallet, Calendar, RotateCcw, Globe, RefreshCcw, Info
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
  const [hasKey, setHasKey] = useState(isApiKeyAvailable());
  const [isActivating, setIsActivating] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const t = translations[lang];

  const handleActivateJoy = () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      setIsActivating(true);
      // Trigger selection
      aiStudio.openSelectKey();
      // Assume success as per instructions
      setHasKey(true);
      setIsActivating(false);
      setMessages([{ 
        role: 'joy', 
        text: lang === 'bn' ? "জয় এখন আপনার সেবায় সচল! আজ আমরা কী নিয়ে আলোচনা করব?" : "Joy is active and ready to help! What shall we discuss today?" 
      }]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length === 0 && hasKey) {
      const greeting = lang === 'bn' 
        ? `নমস্কার ${userName}! আমি জয়। আজ কীভাবে আপনাকে সাহায্য করতে পারি?` 
        : `Hello ${userName}! I am Joy. How can I help you today?`;
      setMessages([{ role: 'joy', text: greeting }]);
    }
  }, [lang, userName, hasKey, messages.length]);

  const handleSendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || isTyping) return;
    if (!hasKey) {
      handleActivateJoy();
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
      if (err.message === "KEY_MISSING" || err.message === "KEY_INVALID") {
        setHasKey(false);
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { 
            role: 'joy', 
            text: lang === 'bn' ? "আপনার এপিআই কি কাজ করছে না। জয়কে সচল রাখতে দয়া করে আবার কানেক্ট করুন।" : "Your API key is not working. Please reconnect Joy to continue.",
            isError: true
          };
          return newMsgs;
        });
      } else {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { 
            role: 'joy', 
            text: lang === 'bn' ? "সংযোগ বিচ্ছিন্ন হয়েছে। দয়া করে আবার চেষ্টা করুন।" : "Connection failed. Please try again.",
            isError: true
          };
          return newMsgs;
        });
      }
    } finally {
      setIsTyping(false);
      if (isVoiceEnabled && fullResponse && success) {
        const base64Audio = await speakText(fullResponse);
        if (base64Audio) {
           // Audio Context logic (same as FloatingAI)
        }
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        <div className="flex-1 bg-white/70 backdrop-blur-2xl rounded-[48px] border border-blue-50 shadow-2xl flex flex-col overflow-hidden">
          <div className="p-8 bg-blue-600 text-white flex items-center justify-between shadow-xl relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-3xl bg-white/20 p-1.5 shadow-inner">
                <img src={AI_AVATAR_URL} alt="Joy" className="w-full h-full object-cover rounded-2xl" />
              </div>
              <div>
                <h3 className="font-black text-2xl tracking-tighter flex items-center gap-2">{t.ai_name} <Zap size={16} className="fill-yellow-300 text-yellow-300" /></h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 tracking-widest">{t.ai_role}</p>
              </div>
            </div>
            {!hasKey && (
              <button 
                onClick={handleActivateJoy} 
                className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-white hover:scale-105 transition-all flex items-center gap-3 animate-bounce"
              >
                <Globe size={16} /> জয়কে কানেক্ট করুন
              </button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30 custom-scrollbar">
            {!hasKey && (
              <div className="max-w-md mx-auto bg-white p-12 rounded-[56px] shadow-2xl border border-blue-50 text-center space-y-8 animate-in zoom-in duration-700 mt-10">
                <div className="w-24 h-24 bg-blue-600 text-white rounded-[40px] flex items-center justify-center mx-auto ring-12 ring-blue-50 shadow-2xl">
                   <Bot size={48} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">জয় আপনাকে সাহায্য করতে প্রস্তুত!</h3>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed mt-4 uppercase tracking-widest">
                    আপনার এপিআই কি ব্যবহার করে জয়কে সক্রিয় করুন এবং পার্সোনাল লাইফ কোচিং শুরু করুন।
                  </p>
                </div>
                <button 
                  onClick={handleActivateJoy}
                  className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Zap size={24} /> এখনই জয়কে সক্রিয় করুন
                </button>
                <p className="text-[10px] font-black text-blue-400 opacity-60 flex items-center justify-center gap-2">
                   <Info size={12} /> Billing enabled key required for full experience
                </p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`p-6 rounded-[36px] text-lg font-bold shadow-md whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text || '...'}
                  {msg.isError && (
                    <button onClick={handleActivateJoy} className="mt-5 flex items-center gap-3 text-sm font-black text-blue-600 hover:text-blue-800 uppercase bg-blue-50 px-6 py-3 rounded-2xl shadow-inner transition-all">
                      <RefreshCcw size={16} /> জয়কে পুনরায় কানেক্ট করুন
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && <div className="p-6 text-slate-400 italic font-black text-xs uppercase tracking-widest animate-pulse flex items-center gap-2">
              <RefreshCcw size={14} className="animate-spin" /> জয় লিখছে...
            </div>}
          </div>

          <div className="p-10 bg-white border-t border-slate-50">
            <div className="flex items-center gap-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="relative flex-1">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={hasKey ? t.ask_joy : "আগে জয়কে সক্রিয় করুন..."} 
                  className="w-full pl-8 pr-20 py-6 bg-slate-50 border-none rounded-[32px] focus:ring-4 focus:ring-blue-500/10 font-bold text-xl shadow-inner outline-none" 
                  disabled={isTyping}
                />
                <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
                  <Send size={24} />
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
