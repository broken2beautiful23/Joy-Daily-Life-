
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, X, Sparkles, 
  Minimize2, Volume2, VolumeX, Zap, Info, RefreshCw
} from 'lucide-react';
import { chatWithJoyStream, speakText, checkApiKeyStatus } from '../services/gemini';
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
  const [hasKey, setHasKey] = useState(checkApiKeyStatus());
  const [isActivating, setIsActivating] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const t = translations[lang];

  useEffect(() => {
    // Re-check key status whenever the component mounts or resets
    setHasKey(checkApiKeyStatus());
  }, [isOpen]);

  const handleActivateJoy = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      setIsActivating(true);
      try {
        await aiStudio.openSelectKey();
        // Assuming success as per rules to prevent race conditions
        setHasKey(true);
      } catch (e) {
        console.error("Activation failed", e);
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
    if (isOpen && messages.length === 0 && hasKey) {
      const greeting = lang === 'bn' 
        ? `নমস্কার ${userName}! আমি জয়। আজ কীভাবে আপনাকে সাহায্য করতে পারি?` 
        : `Hello ${userName}! I am Joy. How can I help you today?`;
      setMessages([{ role: 'joy', text: greeting }]);
    }
  }, [isOpen, hasKey, userName, lang, messages.length]);

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
      console.error(err);
      if (err.message === "KEY_MISSING" || err.message === "KEY_INVALID") {
        setHasKey(false);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: 'joy', 
            text: lang === 'bn' ? "দুঃখিত বন্ধু, জয়কে সক্রিয় করতে হবে। নিচের বাটনে ক্লিক করুন।" : "Sorry friend, Joy needs to be activated first.",
            isError: true
          };
          return updated;
        });
      } else {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: 'joy', 
            text: lang === 'bn' ? "আমি এই মুহূর্তে সংযোগ করতে পারছি না।" : "I can't connect right now.",
            isError: true
          };
          return updated;
        });
      }
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
              <div className="bg-amber-50 p-8 rounded-[32px] border border-amber-100 text-center space-y-4 shadow-sm animate-in fade-in zoom-in duration-500">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 tracking-tight">জয়কে সক্রিয় করুন</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    সবার ব্যবহারের জন্য জয়কে সচল করতে নিচের বাটনে ক্লিক করুন। এটি সম্পূর্ণ ফ্রি।
                  </p>
                </div>
                <button 
                  onClick={handleActivateJoy} 
                  disabled={isActivating}
                  className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isActivating ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                  {isActivating ? 'সক্রিয় হচ্ছে...' : 'সচল করুন'}
                </button>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`p-5 rounded-[28px] max-w-[85%] text-sm font-bold shadow-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : msg.isError 
                      ? 'bg-rose-50 text-rose-600 border border-rose-100 rounded-tl-none'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text || (msg.role === 'joy' ? 'জয় লিখছে...' : '')}
                  {msg.isError && (
                    <button onClick={handleActivateJoy} className="mt-3 flex items-center gap-1.5 text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      <Zap size={10} /> পুনরায় কানেক্ট করুন
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && messages[messages.length-1]?.text === '' && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-50">
            <div className="flex gap-3">
              <form onSubmit={handleSendMessage} className="relative flex-1">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={hasKey ? t.ask_joy : "আগে জয়কে সক্রিয় করুন..."} 
                  className="w-full pl-6 pr-14 py-5 bg-slate-100 rounded-[24px] font-bold outline-none border-2 border-transparent focus:border-blue-500/10 focus:bg-white transition-all shadow-inner" 
                  disabled={isTyping || !hasKey}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping || !hasKey} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Send size={22} />
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
              <div className="absolute left-0 bottom-8 w-14 h-16 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl shadow-2xl border border-white/40 flex items-center justify-center">
                <Sparkles size={20} className="text-white animate-pulse" />
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
