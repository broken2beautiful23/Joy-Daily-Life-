
import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Newspaper, 
  ShoppingBag, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  Loader2,
  MapPin,
  Navigation
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Language } from '../translations';

interface DailyEssentialsProps {
  lang: Language;
  userName: string;
}

const DailyEssentials: React.FC<DailyEssentialsProps> = ({ lang, userName }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [customSearch, setCustomSearch] = useState('');
  const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getLocation = () => {
    return new Promise<{ lat: number, lon: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  };

  const fetchData = async (query?: string) => {
    setLoading(true);
    setLocationError(null);
    
    let currentLoc = location;
    
    // Try to get location if not already available
    if (!currentLoc && !query) {
      try {
        currentLoc = await getLocation();
        setLocation(currentLoc);
      } catch (err) {
        console.error("Location error:", err);
        setLocationError(lang === 'bn' ? "লোকেশন পাওয়া যায়নি। ডিফল্ট তথ্য দেখানো হচ্ছে।" : "Location not found. Showing default info.");
      }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const locationString = currentLoc 
      ? `অক্ষাংশ: ${currentLoc.lat}, দ্রাঘিমাংশ: ${currentLoc.lon}` 
      : (lang === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh');

    const prompt = query || (lang === 'bn' 
      ? `ইউজারের বর্তমান লোকেশন (${locationString}) অনুযায়ী আজকের আবহাওয়া, এই এলাকার আশেপাশের গুরুত্বপূর্ণ ব্রেকিং নিউজ এবং কিছু সেরা অনলাইন শপিং ডিল বা ডিসকাউন্ট অফার সম্পর্কে জানাও। তথ্যগুলো অবশ্যই রিয়েল-টাইম এবং আধুনিক হতে হবে।`
      : `Provide today's weather for user's current location (${locationString}), top 5 breaking news around this area or country, and some of the best online shopping deals or discount offers. The information must be real-time and up-to-date.`);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      setData({ text, links });
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
            {lang === 'bn' ? 'নিত্যপ্রয়োজনীয় তথ্য' : 'Daily Essentials'}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <MapPin size={16} className="text-indigo-600" />
            <p className="text-slate-500 font-bold">
              {location 
                ? (lang === 'bn' ? 'আপনার বর্তমান লোকেশন অনুযায়ী আপডেট' : 'Updated based on your location')
                : (lang === 'bn' ? 'আপনার এলাকার আবহাওয়া ও খবর' : 'Local weather and news')}
            </p>
          </div>
          {locationError && (
            <p className="text-rose-500 text-[10px] font-black uppercase mt-1 tracking-widest">{locationError}</p>
          )}
        </div>
        <button 
          onClick={() => fetchData()} 
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
          <span>{lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}</span>
        </button>
      </header>

      {/* QUICK SEARCH AREA */}
      <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[32px] border border-indigo-100 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={20} />
          <form onSubmit={(e) => { e.preventDefault(); fetchData(customSearch); }}>
            <input 
              type="text" 
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder={lang === 'bn' ? "যেকোনো নির্দিষ্ট তথ্য সার্চ করুন (যেমন: আবহাওয়া, ডিল)..." : "Search specific info (e.g., weather, deals)..."}
              className="w-full pl-14 pr-24 py-4 bg-indigo-50/50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg"
            >
              {lang === 'bn' ? 'সার্চ' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative w-20 h-20">
             <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">
            {lang === 'bn' ? 'বাস্তব সময়ের তথ্য সংগ্রহ করা হচ্ছে...' : 'Fetching real-time updates...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info Display */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-sm leading-relaxed prose prose-slate max-w-none animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {lang === 'bn' ? 'বিস্তারিত আপডেট' : 'Detailed Updates'}
                </h3>
              </div>
              <div className="text-slate-700 font-medium text-lg whitespace-pre-wrap">
                {data?.text || (lang === 'bn' ? 'তথ্য পাওয়া যায়নি।' : 'No data available.')}
              </div>
            </div>
          </div>

          {/* Sidebar: Links & Quick Cards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden transition-all hover:scale-[1.02]">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
                 <CloudSun size={100} />
               </div>
               <h3 className="text-xl font-black mb-6 relative z-10">{lang === 'bn' ? 'তথ্যসূত্র (Sources)' : 'Information Sources'}</h3>
               <div className="space-y-3 relative z-10 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 {data?.links && data.links.length > 0 ? data.links.map((chunk: any, i: number) => {
                   const uri = chunk.web?.uri || chunk.maps?.uri;
                   const title = chunk.web?.title || chunk.maps?.title || (lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details');
                   if (!uri) return null;
                   return (
                     <a key={i} href={uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group">
                       <span className="text-xs font-bold truncate max-w-[180px]">{title}</span>
                       <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0" />
                     </a>
                   );
                 }) : (
                   <p className="text-white/60 text-xs italic">
                     {lang === 'bn' ? 'লিঙ্ক পাওয়া যায়নি।' : 'No links available.'}
                   </p>
                 )}
               </div>
            </div>

            <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 group transition-all hover:bg-emerald-100/50">
               <div className="flex items-center gap-3 mb-6">
                 <ShoppingBag className="text-emerald-600 group-hover:scale-110 transition-transform" size={24} />
                 <h3 className="font-black text-emerald-900">{lang === 'bn' ? 'সেরা ডিলসমূহ' : 'Best Deals'}</h3>
               </div>
               <p className="text-sm text-emerald-800/70 font-bold italic leading-relaxed">
                 {lang === 'bn' ? 'লোকেশন অনুযায়ী সেরা অনলাইন শপিং ডিসকাউন্টগুলো উপরে সারসংক্ষেপে চেক করুন।' : 'Check the main summary above for the best online shopping discounts near you.'}
               </p>
            </div>

            <div className="bg-rose-50 p-8 rounded-[40px] border border-rose-100 group transition-all hover:bg-rose-100/50">
               <div className="flex items-center gap-3 mb-6">
                 <Newspaper className="text-rose-600 group-hover:scale-110 transition-transform" size={24} />
                 <h3 className="font-black text-rose-900">{lang === 'bn' ? 'সদ্য প্রাপ্ত সংবাদ' : 'Latest News'}</h3>
               </div>
               <p className="text-sm text-rose-800/70 font-bold italic leading-relaxed">
                 {lang === 'bn' ? 'আপনার এলাকার আশেপাশে কী ঘটছে তা জানতে রিফ্রেশ করুন।' : 'Click refresh to find out what\'s happening in and around your area.'}
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyEssentials;
