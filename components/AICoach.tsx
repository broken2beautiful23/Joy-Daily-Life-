
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Mic, MicOff, Volume2, VolumeX, 
  Bot, User, Zap, ArrowRight, Lightbulb, Wallet, Calendar
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
    const greeting = lang === 'bn' 
      ? `নমস্কার ${userName}! আমি জয়। আজ কীভাবে আপনাকে সাহায্য করতে পারি?` 
      : `Hello ${userName}! I am Joy. How can I help you today?`;
    if (messages.length === 0) setMessages([{ role: 'joy', text: greeting }]);
  }, [lang, userName, messages.length]);

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
    } catch (err) {
      console.error("Audio error:", err);
    }
  };

  const handleSendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    setMessages(prev => [...prev, { role: 'joy', text: '' }]);
    
    let fullResponse = '';
    try {
      const stream = chatWithJoyStream(userMsg, { userName });
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'joy', text: fullResponse };
          return newMsgs;
        });
      }
    } catch (err) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'joy', text: "দুঃখিত, সংযোগে সমস্যা হয়েছে।" };
        return newMsgs;
      });
    }

    setIsTyping(false);
    if (isVoiceEnabled && fullResponse) await playAudioResponse(fullResponse);
  };

  const quickPrompts = [
    { label: t.plan_day, icon: <Calendar size={18} />, prompt: lang === 'bn' ? 'আমার আজকের দিনটি সফল করার জন্য একটি পরিকল্পনা করে দাও।' : 'Plan my day to make it successful.' },
    { label: t.get_motivation, icon: <Lightbulb size={18} />, prompt: lang === 'bn' ? 'আমাকে কাজ করার জন্য কিছু মোটিভেশন দাও।' : 'Give me some motivation to work.' },
    { label: t.money_save, icon: <Wallet size={18} />, prompt: lang === 'bn' ? 'কিভাবে আমি আমার খরচ কমাতে পারি এবং টাকা জমাতে পারি?' : 'How can I reduce expenses and save money?' },
  ];

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
            <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`p-3 rounded-xl transition-all ${isVoiceEnabled ? 'bg-white/20 text-white' : 'text-white/40'}`}>
              {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 custom-scrollbar">
            {messages.map((msg, i) => (
              msg.text && (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                  <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-5 rounded-[32px] text-base font-bold shadow-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    }`}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-2 px-3">
                      {msg.role === 'joy' ? <Bot size={12} className="text-blue-500" /> : <User size={12} className="text-slate-400" />}
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {msg.role === 'user' ? userName : t.ai_name}
                      </span>
                    </div>
                  </div>
                </div>
              )
            ))}
            {isTyping && messages[messages.length - 1].text === '' && (
              <div className="flex justify-start">
                <div className="bg-white p-5 rounded-[32px] rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-white border-t border-slate-50">
            <div className="flex items-center gap-4">
              <button onClick={toggleListening} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white shadow-lg animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="relative flex-1">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={t.ask_joy} 
                  className="w-full pl-6 pr-16 py-5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-bold text-lg" 
                />
                <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Sparkles className="text-yellow-300 mb-6" size={32} />
            <h4 className="text-xl font-black mb-2 leading-tight">{lang === 'bn' ? 'এআই লাইফ কোচ' : 'AI Life Coach'}</h4>
            <p className="text-xs font-bold opacity-70 leading-relaxed">
              {lang === 'bn' ? 'আপনার সাফল্যের পথে আমি সবসময় আপনার সাথে আছি।' : 'I am always with you on your path to success.'}
            </p>
          </div>

          <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-[40px] border border-blue-50 p-8 space-y-6">
            <h5 className="text-[11px] font-black uppercase tracking-widest text-blue-500/60">{t.quick_tips}</h5>
            <div className="space-y-4">
              {quickPrompts.map((item, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSendMessage(item.prompt)}
                  className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white border border-blue-50 hover:border-blue-500 hover:shadow-xl transition-all group"
                >
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-800">{item.label}</p>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AICoach;
