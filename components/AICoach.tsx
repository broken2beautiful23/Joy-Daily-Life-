
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Volume2, VolumeX, 
  Bot, Zap, RefreshCw, Info
} from 'lucide-react';
import { chatWithJoyStream, speakText, checkApiKeyStatus } from '../services/gemini';
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
  const [hasKey, setHasKey] = useState(checkApiKeyStatus());
  const [isActivating, setIsActivating] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const t = translations[lang];

  useEffect(() => {
    setHasKey(checkApiKeyStatus());
  }, []);

  const handleActivateJoy = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      setIsActivating(true);
      try {
        await aiStudio.openSelectKey();
        setHasKey(true);
        setMessages([{ role: 'joy', text: lang === 'bn' ? "জয় এখন সচল! আমি আপনাকে সাহায্য করতে প্রস্তুত।" : "Joy is now active! I'm ready to help you." }]);
      } catch (e) {
        console.error("Activation bridge failed", e);
      } finally {
        setIsActivating(false);
      }
    } else {
      setHasKey(checkApiKeyStatus());
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
  }, [lang, userName, messages.length, hasKey]);

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
      console.error(err);
      if (err.message === "KEY_MISSING" || err.message === "KEY_INVALID") {
        setHasKey(false);
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { 
            role: 'joy', 
            text: lang === 'bn' ? "দুঃখিত বন্ধু, জয়কে সক্রিয় করতে হবে।" : "Sorry friend, Joy needs activation.",
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
            {!hasKey && (
              <button 
                onClick={handleActivateJoy} 
                disabled={isActivating}
                className="bg-amber-400 text-amber-900 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl animate-bounce"
              >
                {isActivating ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                {isActivating ? 'লোডিং...' : 'জয়কে সচল করুন'}
              </button>
            )}
            {hasKey && (
              <div className="flex gap-2">
                <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`p-3 rounded-2xl transition-all ${isVoiceEnabled ? 'bg-white/20' : 'opacity-40'}`}>
                  {isVoiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
              </div>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30 custom-scrollbar">
            {!hasKey && (
              <div className="max-w-md mx-auto bg-white p-12 rounded-[56px] shadow-2xl border border-blue-50 text-center space-y-8 animate-in zoom-in duration-700 mt-10">
                <div className="w-24 h-24 bg-amber-500 text-white rounded-[40px] flex items-center justify-center mx-auto ring-12 ring-amber-50 shadow-2xl">
                   <Bot size={48} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">জয়কে সক্রিয় করুন</h3>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                    আপনার বন্ধুদের জন্য জয়কে সচল করতে নিচের বাটনে ক্লিক করুন। এটি সবার জন্য উন্মুক্ত।
                  </p>
                </div>
                <button 
                  onClick={handleActivateJoy}
                  className="w-full py-6 bg-amber-500 text-white rounded-[32px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Zap size={24} /> জয়কে আনলক করুন
                </button>
                <div className="flex items-center justify-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-60">
                   <Info size={14} /> এটি একটি সিকিউর কানেকশন
                </div>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`p-6 rounded-[36px] text-lg font-bold shadow-md whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text || '...'}
                  {msg.isError && (
                    <button onClick={handleActivateJoy} className="mt-4 flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-800 uppercase bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-inner">
                      <Zap size={14} /> জয়কে আবার কানেক্ট করুন
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && <div className="p-6 text-slate-400 italic font-black text-xs uppercase tracking-widest animate-pulse flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" /> জয় উত্তর দিচ্ছে...
            </div>}
          </div>

          <div className="p-10 bg-white border-t border-slate-50">
            <div className="flex items-center gap-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="relative flex-1">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={hasKey ? t.ask_joy : "প্রথমে জয়কে সচল করুন..."} 
                  className="w-full pl-8 pr-20 py-6 bg-slate-50 border-none rounded-[32px] focus:ring-4 focus:ring-blue-500/10 font-bold text-xl shadow-inner outline-none" 
                  disabled={isTyping || !hasKey}
                />
                <button type="submit" disabled={!input.trim() || isTyping || !hasKey} className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
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
