
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Rocket, 
  TrendingUp, 
  RefreshCw, 
  ExternalLink, 
  Loader2,
  Lightbulb,
  Search,
  Zap,
  BookOpen
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Language } from '../translations';

// Global cache to persist data during the session
let educationCache: Record<string, any> = {};

interface EducationCareerProps {
  lang: Language;
  userName: string;
}

const EducationCareer: React.FC<EducationCareerProps> = ({ lang, userName }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(educationCache[lang] || null);
  const [customSearch, setCustomSearch] = useState('');

  const fetchData = useCallback(async (query?: string) => {
    // If not a manual refresh or search, and we have data in cache, don't show loading
    if (!query && educationCache[lang]) {
      setData(educationCache[lang]);
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const prompt = query || (lang === 'bn' 
        ? `শিক্ষা ও ক্যারিয়ার বিষয়ে আজকের সেরা ৩টি স্কিল ডেভেলপমেন্ট টিপস, প্রোডাক্টিভিটি বাড়ানোর কৌশল এবং বর্তমান চাকরির বাজারের গুরুত্বপূর্ণ খবর বা সুযোগ সম্পর্কে বিস্তারিত জানাও। তথ্যগুলো বুলেট পয়েন্ট আকারে সুন্দর করে সাজিয়ে দাও।`
        : `Provide today's top 3 skill development tips, productivity hacks, and important job market news or opportunities in a well-structured format.`);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const result = {
        text: response.text,
        links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };

      // Update cache
      if (!query) {
        educationCache[lang] = result;
      }
      setData(result);
    } catch (error) {
      console.error("Gemini Error:", error);
      // If error occurs, keep existing data or show error message
      if (!data) {
        setData({ text: lang === 'bn' ? "তথ্য লোড করতে সমস্যা হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।" : "Error loading information. Please try again later.", links: [] });
      }
    } finally {
      setLoading(false);
    }
  }, [lang, data]);

  useEffect(() => {
    fetchData();
  }, [lang]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {lang === 'bn' ? 'শিক্ষা ও ক্যারিয়ার' : 'Education & Career'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">
            {lang === 'bn' ? 'ভবিষ্যৎ গড়ার স্মার্ট গাইড।' : 'Smart guide to building your future.'}
          </p>
        </div>
        <button 
          onClick={() => fetchData()} 
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl font-black shadow-lg hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
          <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
        </button>
      </header>

      {/* SEARCH AREA */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-[32px] border border-orange-100 dark:border-slate-800 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600" size={20} />
          <form onSubmit={(e) => { e.preventDefault(); fetchData(customSearch); }}>
            <input 
              type="text" 
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder={lang === 'bn' ? "নির্দিষ্ট টপিক সার্চ করুন (যেমন: পাইথন শিখা, রিজিউম টিপস)..." : "Search specific topics (e.g., Learn Python, Resume tips)..."}
              className="w-full pl-14 pr-24 py-4 bg-orange-50/50 dark:bg-slate-800/50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all text-slate-900 dark:text-white"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-black text-xs shadow-lg hover:bg-orange-700 transition-all">
              {lang === 'bn' ? 'সার্চ' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-slate-900/30 rounded-[48px] border border-dashed border-orange-200 dark:border-slate-800">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-orange-100 dark:border-orange-900/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">স্মার্ট গাইড তৈরি করা হচ্ছে...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900/80 p-8 md:p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm leading-relaxed prose dark:prose-invert max-w-none relative overflow-hidden">
             {loading && (
               <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <Loader2 className="animate-spin text-orange-600" size={32} />
               </div>
             )}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">ক্যারিয়ার আপডেট</h3>
            </div>
            <div className="text-slate-700 dark:text-slate-300 font-medium text-lg whitespace-pre-wrap">
              {data?.text}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 dark:bg-slate-800/80 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none group-hover:rotate-45 transition-transform duration-700">
                 <Rocket size={100} />
               </div>
               <h3 className="text-xl font-black mb-6 relative z-10">{lang === 'bn' ? 'সুপার রিসোর্স' : 'Super Resources'}</h3>
               <div className="space-y-3 relative z-10 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                 {data?.links && data.links.length > 0 ? data.links.map((chunk: any, i: number) => {
                   const uri = chunk.web?.uri || chunk.maps?.uri;
                   const title = chunk.web?.title || chunk.maps?.title || "Visit Link";
                   if (!uri) return null;
                   return (
                     <a key={i} href={uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group/link">
                       <span className="text-xs font-bold truncate max-w-[180px]">{title}</span>
                       <ExternalLink size={14} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                     </a>
                   );
                 }) : <p className="text-white/40 text-xs italic">কোনো লিঙ্ক পাওয়া যায়নি।</p>}
               </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/10 p-8 rounded-[40px] border border-orange-100 dark:border-orange-900/20">
               <div className="flex items-center gap-3 mb-4">
                 <Lightbulb className="text-orange-600" size={24} />
                 <h3 className="font-black text-orange-900 dark:text-orange-300">স্মার্ট টিপস</h3>
               </div>
               <p className="text-sm text-orange-800/70 dark:text-orange-400 font-bold italic leading-relaxed">
                 {lang === 'bn' ? 'প্রতিদিন মাত্র ১ ঘণ্টা নতুন কিছু শিখলে বছরে ৩৬৫ ঘণ্টা এগিয়ে থাকবেন আপনি।' : 'Learning just 1 hour daily puts you 365 hours ahead in a year.'}
               </p>
            </div>
            
            <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl flex flex-col items-center text-center gap-4">
               <Zap className="fill-white" size={32} />
               <p className="text-xs font-black uppercase tracking-widest">Focus Mode</p>
               <p className="text-sm font-bold opacity-80 leading-snug">আপনার পড়াশোনা বা কাজের সময় ট্র্যাক করতে ওয়ার্ক টাইমার ব্যবহার করুন।</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationCareer;
