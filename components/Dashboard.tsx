
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Wallet, TrendingDown, Loader2, ArrowRight,
  Sparkles, Zap, Star, LayoutGrid, Calendar
} from 'lucide-react';
import { translations, Language } from '../translations';
import { Transaction } from '../types';
import { supabase } from '../services/supabase';

interface DashboardProps {
  lang: Language;
  userName: string;
  userId: string;
  onNavigate: (tab: string) => void;
  onOpenAi: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ lang, userName, userId, onNavigate, onOpenAi }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const t = translations[lang];

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    const { data: tx } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (tx) setTransactions(tx);
    setLoading(false);
  };

  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const balance = totalIncome - totalExpense;

  const cards = [
    { label: 'মোট আয়', value: `৳${totalIncome.toLocaleString()}`, icon: <TrendingUp size={20}/>, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'মোট ব্যয়', value: `৳${totalExpense.toLocaleString()}`, icon: <TrendingDown size={20}/>, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'ব্যালেন্স', value: `৳${balance.toLocaleString()}`, icon: <Wallet size={20}/>, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* HERO HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-900 rounded-[40px] p-8 md:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-300">
            <Sparkles size={12} />
            <span>Joy OS Premium v2.0</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            সুপ্রভাত, {userName}!<br/><span className="text-indigo-400">আপনার দিনটি আজ দারুণ কাটুক।</span>
          </h1>
          
          <p className="text-sm md:text-base text-white/50 font-medium max-w-lg">
            আপনার দৈনন্দিন জীবনের সকল হিসাব, ডায়েরি এবং কাজের পরিকল্পনা এখন এক জায়গায়। আজ আপনি কী অর্জন করতে চান?
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
             <button 
              onClick={() => onNavigate('tasks')}
              className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
             >
               নতুন কাজ যোগ করুন <ArrowRight size={16} />
             </button>
             <button 
              onClick={onOpenAi}
              className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
             >
               এআই অ্যাসিস্ট্যান্ট
             </button>
          </div>
        </div>
      </motion.div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-[32px] group hover:border-indigo-500/20 transition-all cursor-default"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</h3>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* GRID APPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card rounded-[40px] p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                 <LayoutGrid size={20} className="text-indigo-500" />
                 দ্রুত অ্যাক্সেস
              </h3>
              <Calendar size={18} className="text-slate-300" />
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'diary', label: 'ডায়েরি', icon: '📔', color: 'bg-orange-50' },
                { id: 'expenses', label: 'আয়-ব্যয়', icon: '💰', color: 'bg-emerald-50' },
                { id: 'tasks', label: 'কাজ', icon: '✅', color: 'bg-blue-50' },
                { id: 'notes', label: 'নোটস', icon: '📝', color: 'bg-purple-50' },
              ].map(app => (
                <button 
                  key={app.id} 
                  onClick={() => onNavigate(app.id)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-[32px] ${app.color} border border-transparent hover:border-slate-200 transition-all group active:scale-95`}
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">{app.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{app.label}</span>
                </button>
              ))}
           </div>
        </div>

        <div className="lg:col-span-4 bg-indigo-600 rounded-[40px] p-8 text-white flex flex-col justify-between group overflow-hidden relative shadow-2xl">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
           <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                 <Zap size={20} className="text-yellow-300 fill-yellow-300" />
              </div>
              <h3 className="text-xl font-black tracking-tight leading-tight">সাফল্যের মূলমন্ত্র হলো ধৈর্য এবং প্রতিদিনের চেষ্টা।</h3>
              <p className="text-white/60 text-xs font-medium">আজকের একটি ছোট কাজ কাল বড় সাফল্যের ভিত্তি হতে পারে।</p>
           </div>
           <button 
             onClick={() => onNavigate('stories')}
             className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
           >
             অনুপ্রেরণা পান
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
