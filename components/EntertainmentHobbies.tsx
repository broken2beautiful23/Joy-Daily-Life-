
import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Map, 
  Book, 
  Camera, 
  RefreshCw, 
  ExternalLink, 
  Loader2,
  Film,
  Search,
  Compass
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Language } from '../translations';

interface EntertainmentHobbiesProps {
  lang: Language;
  userName: string;
}

const EntertainmentHobbies: React.FC<EntertainmentHobbiesProps> = ({ lang, userName }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [customSearch, setCustomSearch] = useState('');

  const fetchData = async (query?: string) => {
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = query || (lang === 'bn' 
      ? `বিনোদন ও শখ বিষয়ে আজকের সেরা ৩টি ভ্রমণ গাইড (কম খরচে), মুভি বা বই রিভিউ এবং বাগান করা বা ক্রাফটিং আইডিয়া সম্পর্কে বিস্তারিত জানাও।`
      : `Provide today's top 3 low-budget travel guides, movie or book reviews, and gardening or crafting ideas.`);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setData({
        text: response.text,
        links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      });
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lang]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            {lang === 'bn' ? 'বিনোদন ও শখ' : 'Entertainment & Hobbies'}
          </h2>
          <p className="text-slate-500 font-bold mt-2">
            {lang === 'bn' ? 'অবসর সময় কাটানোর সেরা আইডিয়া।' : 'Best ideas for your leisure time.'}
          </p>
        </div>
        <button 
          onClick={() => fetchData()} 
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-2xl font-black shadow-lg hover:bg-pink-700 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
          <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
        </button>
      </header>

      <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[32px] border border-pink-100 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-600" size={20} />
          <form onSubmit={(e) => { e.preventDefault(); fetchData(customSearch); }}>
            <input 
              type="text" 
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder={lang === 'bn' ? "মুভি রিভিউ, ট্রাভেল গাইড বা শখ সার্চ করুন..." : "Search movie reviews, travel guides or hobbies..."}
              className="w-full pl-14 pr-24 py-4 bg-pink-50/50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-pink-500/5 transition-all"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-pink-600 text-white rounded-xl font-black text-xs shadow-lg">
              {lang === 'bn' ? 'সার্চ' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-pink-600" size={40} />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">আপনার জন্য বিনোদনের ঝুলি সাজানো হচ্ছে...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-sm leading-relaxed prose max-w-none">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center">
                <Compass size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">অবসর ও গাইড</h3>
            </div>
            <div className="text-slate-700 font-medium text-lg whitespace-pre-wrap">
              {data?.text || "তথ্য লোড করতে সমস্যা হয়েছে।"}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
                 <Film size={100} />
               </div>
               <h3 className="text-xl font-black mb-6 relative z-10">{lang === 'bn' ? 'গাইড ও লিঙ্ক' : 'Guides & Links'}</h3>
               <div className="space-y-3 relative z-10">
                 {data?.links && data.links.length > 0 ? data.links.map((chunk: any, i: number) => {
                   const uri = chunk.web?.uri || chunk.maps?.uri;
                   const title = chunk.web?.title || chunk.maps?.title || "Visit Link";
                   if (!uri) return null;
                   return (
                     <a key={i} href={uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group">
                       <span className="text-xs font-bold truncate max-w-[180px]">{title}</span>
                       <ExternalLink size={14} className="group-hover:translate-x-1" />
                     </a>
                   );
                 }) : <p className="text-white/40 text-xs italic">কোনো লিঙ্ক পাওয়া যায়নি।</p>}
               </div>
            </div>

            <div className="bg-pink-50 p-8 rounded-[40px] border border-pink-100">
               <div className="flex items-center gap-3 mb-4">
                 <Map className="text-pink-600" size={24} />
                 <h3 className="font-black text-pink-900">ভ্রমণ টিপস</h3>
               </div>
               <p className="text-sm text-pink-800/70 font-bold italic leading-relaxed">
                 {lang === 'bn' ? 'ভ্রমণ শুধু আনন্দ নয়, এটি আপনাকে নতুনভাবে নিজেকে চিনতে শেখায়।' : 'Travel is not just fun, it helps you rediscover yourself.'}
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntertainmentHobbies;
