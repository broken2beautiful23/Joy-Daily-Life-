
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Volume2, VolumeX, 
  Bot, Zap, RefreshCw
} from 'lucide-react';
import { chatWithJoyStream, speakText } from '../services/gemini';
import { translations, Language } from '../translations';
import { AI_AVATAR_URL } from '../constants';

interface AICoachProps {
  lang: Language;
  userName: string;
}

const AICoach: React.FC<AICoachProps> = ({ lang, userName }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'joy', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const t = translations[lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = lang === 'bn' 
        ? `নমস্কার ${userName}! আমি জয়। আজ কীভাবে আপনাকে সাহায্য করতে পারি?` 
        : `Hello ${userName}! I am Joy. How can I help you today?`;
      setMessages([{ role: 'joy', text: greeting }]);
    }
  }, [lang, userName, messages.length]);

  const handleSendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || isTyping) return;

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
      if (isVoiceEnabled && fullResponse && success) {
        const base64Audio = await speakText(fullResponse);
        if (base64Audio) {
           if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
           const ctx = audioContextRef.current;
           const binaryString = atob(base64Audio);
           const bytes = new Uint8Array(binaryString.length);
           for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
           const dataInt16 = new Int16Array(bytes.buffer);
           const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
           const channelData = buffer.getChannelData(0);
           for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
           const source = ctx.createBufferSource();
           source.buffer = buffer;
           source.connect(ctx.destination);
           source.start();
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
            <div className="flex gap-2">
              <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`p-3 rounded-2xl transition-all ${isVoiceEnabled ? 'bg-white/20' : 'opacity-40'}`}>
                {isVoiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`p-6 rounded-[36px] text-lg font-bold shadow-md whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text || (msg.role === 'joy' ? 'জয় উত্তর দিচ্ছে...' : '')}
                </div>
              </div>
            ))}
            {isTyping && messages[messages.length-1]?.text === '' && (
              <div className="p-6 text-slate-400 italic font-black text-xs uppercase tracking-widest animate-pulse flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin" /> জয় লিখছে...
              </div>
            )}
          </div>

          <div className="p-10 bg-white border-t border-slate-50">
            <div className="flex items-center gap-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="relative flex-1">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={t.ask_joy} 
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
