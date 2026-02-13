
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, X, Sparkles, 
  Minimize2, Loader2
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
        ? `নমস্কার ${userName}! আমি জয়। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?` 
        : `Hello ${userName}! I am Joy. How can I assist you today?`;
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
        updated[updated.length - 1] = { role: 'grok', text: "দুঃখিত, কোনো একটি সমস্যা হয়েছে।" };
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
        <div className="mb-4 w-[calc(100vw-48px)] sm:w-[380px] md:w-[420px] h-[550px] sm:h-[650px] bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl border border-blue-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 pointer-events-auto">
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl overflow-hidden shadow-inner shrink-0">
                <img src={AI_AVATAR_URL} alt="Joy AI" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-lg tracking-tight truncate">{t.ai_name}</h4>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   <p className="text-[10px] uppercase font-black opacity-70 tracking-widest truncate">{t.ai_role}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl">
                <Minimize2 size={18} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] max-w-[90%] sm:max-w-[85%] text-sm font-bold shadow-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text || (msg.role === 'grok' ? <Loader2 className="animate-spin text-blue-500" size={16} /> : '')}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-6 bg-white border-t border-slate-50">
            <div className="flex gap-3">
              <form onSubmit={handleSendMessage} className="relative flex-1">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={t.ask_joy} 
                  className="w-full pl-6 pr-14 py-4 sm:py-5 bg-slate-100 rounded-[20px] sm:rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-blue-500/10 focus:bg-white transition-all shadow-inner" 
                  disabled={isTyping}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center disabled:opacity-50 hover:bg-black transition-colors shadow-lg"
                >
                  {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="relative pointer-events-auto cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
        {!isOpen && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 rounded-[24px] sm:rounded-[30px] flex items-center justify-center shadow-2xl border border-white/10 hover:scale-110 active:scale-95 transition-all">
            <span className="text-xl">💬</span>
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
