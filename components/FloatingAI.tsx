
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, X, MessageSquare, 
  Minimize2, Loader2, Bot
} from 'lucide-react';
import { chatWithGrokStream } from '../services/gemini';
import { translations, Language } from '../translations';
import { AI_AVATAR_URL } from '../constants';

interface FloatingAIProps {
  lang: Language;
  userName: string;
  forceOpen?: boolean;
  setForceOpen?: (val: boolean) => void;
}

const FloatingAI: React.FC<FloatingAIProps> = ({ lang, userName, forceOpen, setForceOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'grok', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      if (setForceOpen) setForceOpen(false);
    }
  }, [forceOpen, setForceOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = lang === 'bn' 
        ? `নমস্কার ${userName}! আমি জয়। আজ আমি আপনাকে আপনার এই লাইফ ড্যাশবোর্ডের যেকোনো বিষয়ে সাহায্য করতে পারি। আপনি কি জানতে চান?` 
        : `Hello ${userName}! I am Joy. I can help you with anything on this dashboard. What would you like to know?`;
      setMessages([{ role: 'grok', text: greeting }]);
    }
  }, [isOpen, userName, lang, messages.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userMsg = input.trim();
    if (!userMsg || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);
    
    // Placeholder for AI response
    setMessages(prev => [...prev, { role: 'grok', text: '' }]);
    
    let currentText = '';
    try {
      const stream = chatWithGrokStream(userMsg, { userName });
      for await (const chunk of stream) {
        currentText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = { role: 'grok', text: currentText };
          }
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'grok', text: "দুঃখিত, কোনো একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।" };
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (setForceOpen) setForceOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-48px)] sm:w-[380px] md:w-[420px] h-[550px] sm:h-[650px] bg-white dark:bg-[#0f172a] rounded-[32px] sm:rounded-[40px] shadow-2xl border border-indigo-50 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 pointer-events-auto">
          <div className="p-6 bg-indigo-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl overflow-hidden shadow-inner shrink-0 flex items-center justify-center border border-white/30">
                <Bot size={28} />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-lg tracking-tight truncate">{t.ai_name}</h4>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                   <p className="text-[10px] uppercase font-black opacity-70 tracking-widest truncate">Platform Guide</p>
                </div>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <Minimize2 size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/30 dark:bg-slate-900/10 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] max-w-[90%] sm:max-w-[85%] text-sm font-bold shadow-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                }`}>
                  {msg.text || (msg.role === 'grok' ? <Loader2 className="animate-spin text-indigo-500" size={16} /> : '')}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-6 bg-white dark:bg-[#0f172a] border-t border-slate-50 dark:border-slate-800">
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder={t.ask_joy} 
                className="w-full pl-6 pr-14 py-4 sm:py-5 bg-slate-100 dark:bg-slate-800 rounded-[20px] sm:rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-indigo-500/20 dark:text-white transition-all shadow-inner" 
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping} 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors shadow-lg"
              >
                {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="relative pointer-events-auto cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
        {!isOpen && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-[24px] sm:rounded-[30px] flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-800 hover:scale-110 active:scale-95 transition-all">
            <MessageSquare size={28} className="text-white" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
          </div>
        )}
        {isOpen && (
           <button className="w-14 h-14 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-800 transition-all hover:scale-110 active:scale-95">
             <X size={28} />
           </button>
        )}
      </div>
    </div>
  );
};

export default FloatingAI;
