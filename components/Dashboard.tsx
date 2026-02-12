
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Wallet,
  Calendar,
  TrendingDown,
  Loader2,
  Lightbulb,
  CheckCircle2,
  Rocket,
  ArrowRight,
  Clock as ClockIcon,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { translations, Language } from '../translations';
import { Transaction } from '../types';
import { supabase } from '../services/supabase';

interface DashboardProps {
  lang: Language;
  userName: string;
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ lang, userName, userId }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const t = translations[lang];

  useEffect(() => {
    if (userId) fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [userId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: tx } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (tx) setTransactions(tx);
    } finally {
      setLoading(false);
    }
  };

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (lang === 'bn') {
      if (hour < 12) return "শুভ সকাল";
      if (hour < 16) return "শুভ দুপুর";
      if (hour < 19) return "শুভ বিকেল";
      return "শুভ রাত্রি";
    }
    return hour < 12 ? "Good Morning" : hour < 16 ? "Good Afternoon" : hour < 19 ? "Good Evening" : "Good Night";
  }, [currentTime, lang]);

  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* IMPROVED HERO SECTION */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[48px] p-8 md:p-20 text-white shadow-2xl">
        {/* Animated Background Grids */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-left duration-700">
              <Sparkles size={14} className="text-yellow-400" />
              {lang === 'bn' ? 'আপনার ব্যক্তিগত সহকারী' : 'Your Personal Assistant'}
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] animate-in slide-in-from-bottom duration-700">
              {lang === 'bn' 
                ? 'আপনার দৈনন্দিন জীবনকে সহজ করতে আমরা আছি আপনার পাশে' 
                : 'Empowering Your Daily Journey Every Step of the Way'}
            </h1>
            
            <p className="text-lg md:text-xl font-medium text-white/70 leading-relaxed max-w-xl animate-in fade-in duration-1000">
              {lang === 'bn'
                ? 'জয়লাইফ ওএস-এর সাথে আধুনিক জীবন যাপন করুন। খরচ কমানো, কাজের দক্ষতা বাড়ানো এবং সুন্দর স্মৃতি জমানো এখন হবে এক ক্লিকে।'
                : 'Live modernly with JoyLife OS. Managing expenses, enhancing productivity, and saving memories is now just a click away.'}
            </p>

            <div className="flex flex-wrap gap-4 animate-in slide-in-from-bottom duration-1000">
               <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                 {lang === 'bn' ? 'শুরু করুন' : 'Get Started'} <ArrowRight size={18} />
               </button>
               <button className="bg-white/5 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                 {lang === 'bn' ? 'বিস্তারিত জানুন' : 'Learn More'}
               </button>
            </div>
          </div>

          <div className="hidden lg:flex justify-center relative">
             <div className="relative w-80 h-80 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-spin [animation-duration:30s]"></div>
                <div className="w-64 h-64 bg-indigo-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl">
                   <Zap size={100} className="text-white fill-yellow-400" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{greeting}, {userName}! 👋</h2>
          <p className="text-slate-500 font-bold mt-1 opacity-70">এখানে আপনার আজকের সারসংক্ষেপ দেওয়া হলো।</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 px-8 py-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
            <ClockIcon size={24} />
          </div>
          <div>
            <div className="text-2xl font-black tabular-nums tracking-tighter">
              {currentTime.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
              {currentTime.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long' })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t.total_income, value: `৳${totalIncome.toLocaleString()}`, icon: <TrendingUp size={24}/>, trend: 'Income', color: 'bg-emerald-50 text-emerald-600' },
          { label: t.total_expense, value: `৳${totalExpense.toLocaleString()}`, icon: <TrendingDown size={24}/>, trend: 'Expense', color: 'bg-rose-50 text-rose-600' },
          { label: t.balance, value: `৳${balance.toLocaleString()}`, icon: <Wallet size={24}/>, trend: 'Balance', color: 'bg-indigo-50 text-indigo-600' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>{stat.icon}</div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${stat.color}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.1em]">{stat.label}</h3>
            <p className="text-4xl font-black mt-1 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 rounded-[40px] border border-slate-100 flex flex-col h-[500px]">
           <h3 className="text-xl font-black mb-8 flex items-center gap-3">
             <Star className="text-yellow-400" />
             আপনার সাপ্তাহিক প্রগ্রেস
           </h3>
           <div className="flex-1 w-full">
             {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={Array.from({length:7}).map((_,i)=>({name:i, val: Math.random()*100}))}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <Tooltip />
                    <Area type="monotone" dataKey="val" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
             )}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl flex flex-col justify-between h-full group hover:scale-[1.02] transition-transform">
              <div className="space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Lightbulb size={24} className="text-yellow-400" />
                  আজকের কুইক টিপস
                </h3>
                <p className="text-lg font-bold leading-relaxed opacity-90 italic">
                  "সাফল্যের মূল চাবিকাঠি হলো ফোকাস। বড় কাজগুলোকে ছোট ছোট ভাগে ভাগ করে আজই শুরু করুন।"
                </p>
              </div>
              <div className="pt-8 border-t border-white/20 mt-8">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Rocket size={20}/></div>
                   <div>
                     <p className="text-sm font-black tracking-tight">আপনার লক্ষ্য স্থির করুন</p>
                     <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">জয়লাইফ ওএস গাইড</p>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
