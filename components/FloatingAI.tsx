
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, X, UserCheck, Loader2, Sparkles, 
  Minimize2, Volume2, VolumeX, Mic, MicOff, AlertCircle 
} from 'lucide-react';
import { chatWithJoy, speakText } from '../services/gemini';
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
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  // Speech Recognition Setup
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

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [lang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition start failed:", e);
      }
    }
  };

  const playAudioResponse = async (text: string) => {
    if (!isVoiceEnabled) return;

    const base64Audio = await speakText(text);
    if (base64Audio) {
      try {
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
      } catch (err) {
        console.error("Audio playback failed:", err);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await chatWithJoy(userMsg, { userName });
      setMessages(prev => [...prev, { role: 'joy', text: response }]);
      
      // AI কথা বলা শুরু করবে
      if (isVoiceEnabled) {
        await playAudioResponse(response);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setError(lang === 'bn' ? "কানেকশনে সমস্যা হচ্ছে।" : "Connection problem.");
      setMessages(prev => [...prev, { role: 'joy', text: "দুঃখিত, বর্তমানে আমার সাথে সংযোগ স্থাপন করা সম্ভব হচ্ছে না। দয়া করে আবার চেষ্টা করুন।" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[600px] bg-white rounded-[32px] shadow-2xl border border-blue-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="p-5 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                <UserCheck size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm leading-tight">{t.ai_name}</h4>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">{t.ai_role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`p-2 rounded-lg transition-colors ${isVoiceEnabled ? 'bg-white/20 text-white' : 'text-white/50'}`}
                title={isVoiceEnabled ? "ভয়েস বন্ধ করুন" : "ভয়েস চালু করুন"}
              >
                {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Minimize2 size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                <div className="relative mb-6">
                  <Sparkles size={48} className="text-blue-400" />
                  <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse"></div>
                </div>
                <p className="text-sm font-bold leading-relaxed text-slate-600 px-4">
                  {lang === 'bn' 
                    ? 'নমস্কার! আমি জয় কুমার বিশ্বাস। আপনার দিনটি কেমন কাটছে? আপনি চাইলে মাইক্রোফোন আইকনে ক্লিক করে সরাসরি আমার সাথে কথা বলতে পারেন।' 
                    : 'Hello! I am Joy Kumar Biswas. How is your day? You can talk to me directly by clicking the microphone icon.'}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 mb-2 p-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-red-100">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={toggleListening}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              <form onSubmit={handleSendMessage} className="relative flex-1">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? (lang === 'bn' ? "বলুন, আমি শুনছি..." : "Listening...") : t.ask_joy}
                  className="w-full pl-5 pr-12 py-3.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all font-bold text-slate-800"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 group relative ${
          isOpen ? 'bg-slate-900 rotate-90' : 'blue-btn shadow-blue-400/30'
        }`}
      >
        {!isOpen && (
          <div className="absolute -top-1 -right-1 flex">
            <div className="w-5 h-5 bg-emerald-500 rounded-full border-4 border-white"></div>
            <div className="absolute -inset-1 bg-emerald-500 rounded-full opacity-50 animate-ping"></div>
          </div>
        )}
        {isOpen ? <X size={24} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default FloatingAI;
