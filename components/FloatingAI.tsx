
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, UserCheck, Loader2, Sparkles, Minimize2 } from 'lucide-react';
import { chatWithJoy } from '../services/gemini';
import { translations, Language } from '../translations';

interface FloatingAIProps {
  lang: Language;
  userName: string;
}

const FloatingAI: React.FC<FloatingAIProps> = ({ lang, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'joy', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await chatWithJoy(userMsg, { userName });
      setMessages(prev => [...prev, { role: 'joy', text: response || "আমি আপনার কথা বুঝতে পেরেছি।" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'joy', text: "দুঃখিত, বর্তমানে আমার সার্ভারে সমস্যা হচ্ছে।" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-blue-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="p-6 bg-blue-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                <UserCheck size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm leading-tight">{t.ai_name}</h4>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">{t.ai_role}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-blue-50/20">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                <Sparkles size={40} className="mb-4 text-blue-400" />
                <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                  {lang === 'bn' ? 'শুভ দিন! আমি জয় কুমার বিশ্বাস। আপনাকে আজ কীভাবে সাহায্য করতে পারি?' : 'Good day! I am Joy Kumar Biswas. How can I help you today?'}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-blue-50'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-blue-50 shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-blue-50">
            <div className="relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.ask_joy}
                className="w-full pl-6 pr-14 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:bg-white transition-all font-bold text-slate-800"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 group relative ${
          isOpen ? 'bg-slate-900 rotate-90' : 'blue-btn'
        }`}
      >
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full border-4 border-white animate-pulse"></div>
        {isOpen ? <X size={24} /> : <MessageSquare size={28} />}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-20 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
            {t.ai_name} এর সাথে কথা বলুন
          </div>
        )}
      </button>
    </div>
  );
};

export default FloatingAI;
