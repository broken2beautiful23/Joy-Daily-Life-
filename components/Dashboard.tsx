
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Wallet, TrendingDown, Loader2, ArrowRight,
  Sparkles, Zap, Star, LayoutGrid, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight,
  Target, CheckCircle2, Lightbulb, PiggyBank
} from 'lucide-react';
import { translations, Language } from '../translations';
import { Transaction } from '../types';
import { supabase } from '../services/supabase';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [progressData, setProgressData] = useState<any[]>([]);
  const t = translations[lang];

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      const { data: tx } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (tx) setTransactions(tx);
      
      generateProgressChart();
    } catch (e) {
      console.log("Supabase fetch failed");
    }
    setLoading(false);
  };

  const generateProgressChart = () => {
    const days = lang === 'bn' ? ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র"] : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    
    const chartData = days.map((day, idx) => ({
      name: day,
      score: 40 + Math.floor(Math.random() * 50) + (idx * 2), // Simulated Life Progress
      savings: 30 + Math.floor(Math.random() * 60) // Simulated Financial Performance
    }));
    
    setProgressData(chartData);
  };

  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const balance = totalIncome - totalExpense;

  const stats = [
    { label: 'মোট আয়', value: `৳${totalIncome.toLocaleString()}`, icon: <TrendingUp size={20}/>, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
    { label: 'মোট ব্যয়', value: `৳${totalExpense.toLocaleString()}`, icon: <TrendingDown size={20}/>, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/10' },
    { label: 'ব্যালেন্স', value: `৳${balance.toLocaleString()}`, icon: <Wallet size={20}/>, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
  ];

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const monthNamesBN = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  const weekDaysBN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];

  const improvementSteps = [
    { text: lang === 'bn' ? 'প্রতিদিন অন্তত ৫টি টাস্ক সম্পন্ন করুন' : 'Complete at least 5 tasks daily', icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
    { text: lang === 'bn' ? 'অপ্রয়োজনীয় খরচ কমিয়ে সঞ্চয় বাড়ান' : 'Reduce unnecessary costs to save more', icon: <PiggyBank size={16} className="text-emerald-600" /> },
    { text: lang === 'bn' ? 'বাজেট তৈরি করে আর্থিক লক্ষ্য সেট করুন' : 'Create a budget and set financial goals', icon: <Target size={16} className="text-orange-500" /> },
    { text: lang === 'bn' ? 'পেশাদার স্কিল শিখুন আয় বৃদ্ধির জন্য' : 'Learn pro skills to increase income', icon: <Zap size={16} className="text-indigo-500" /> },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-8 md:p-12 text-white shadow-lg">
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-300">
            <Sparkles size={12} />
            <span>Welcome Back</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
            সুপ্রভাত, {userName}!<br/><span className="text-indigo-400">জীবন ও অর্থ হোক সুশৃঙ্খল।</span>
          </h1>
          
          <p className="text-sm text-white/50 font-medium max-w-lg">
            আপনার ক্যারিয়ার উন্নতি এবং আর্থিক সঞ্চয়ের হিসাব এখন এক নজরে। আজ আপনি নতুন কী শিখবেন?
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
             <button 
              onClick={() => onNavigate('tasks')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2"
             >
               নতুন কাজ যোগ করুন <ArrowRight size={16} />
             </button>
             <button 
              onClick={onOpenAi}
              className="bg-white/10 border border-white/10 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/20"
             >
               এআই অ্যাসিস্ট্যান্ট
             </button>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="premium-card p-6 flex flex-col items-start hover:border-indigo-500/30 transition-colors">
            <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* LIFE & FINANCIAL PROGRESS GRAPH & STEPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* GRAPH SECTION */}
        <div className="lg:col-span-8 premium-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" />
              {t.life_progress_chart}
            </h3>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                  <span className="text-[9px] font-black uppercase text-slate-400">{t.score_label}</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] font-black uppercase text-slate-400">{t.savings_label}</span>
               </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                    fontWeight: '800',
                    fontSize: '12px',
                    padding: '12px'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Area 
                  type="monotone" 
                  name={t.score_label}
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  name={t.savings_label}
                  dataKey="savings" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorSavings)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* IMPROVEMENT STEPS SECTION */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 mb-6">
            <Lightbulb size={20} className="text-yellow-500" />
            {t.improvement_steps}
          </h3>
          <div className="space-y-4">
            {improvementSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:translate-x-1">
                <div className="mt-0.5">{step.icon}</div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug">{step.text}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={onOpenAi}
            className="w-full mt-6 bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            এআই পরামর্শ নিন
          </button>
        </div>
      </div>

      {/* GRID APPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        <div className="lg:col-span-8 premium-card p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                 <LayoutGrid size={20} className="text-indigo-500" />
                 শর্টকাট মেনু
              </h3>
              <button 
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`p-2 rounded-lg transition-all ${isCalendarOpen ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-indigo-500 hover:bg-indigo-50'}`}
              >
                <CalendarIcon size={20} />
              </button>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'diary', label: 'ডায়েরি', icon: '📔', color: 'bg-orange-50 dark:bg-orange-900/10' },
                { id: 'expenses', label: 'আয়-ব্যয়', icon: '💰', color: 'bg-emerald-50 dark:bg-emerald-900/10' },
                { id: 'tasks', label: 'কাজ', icon: '✅', color: 'bg-blue-50 dark:bg-blue-900/10' },
                { id: 'notes', label: 'নোটস', icon: '📝', color: 'bg-purple-50 dark:bg-purple-900/10' },
              ].map(app => (
                <button 
                  key={app.id} 
                  onClick={() => onNavigate(app.id)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl ${app.color} border border-transparent hover:border-slate-200 dark:hover:border-slate-700`}
                >
                  <span className="text-3xl">{app.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{app.label}</span>
                </button>
              ))}
           </div>
        </div>

        <div className="lg:col-span-4 bg-indigo-600 rounded-[32px] p-8 text-white flex flex-col justify-between shadow-lg">
           <div className="space-y-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                 <Zap size={20} className="text-yellow-300 fill-yellow-300" />
              </div>
              <h3 className="text-xl font-black tracking-tight leading-tight">সঞ্চয় হলো ভবিষ্যতের জন্য আজকের বড় উপহার।</h3>
              <p className="text-white/60 text-xs font-medium">প্রতিদিন অল্প অল্প সঞ্চয় আপনাকে একদিন বড় আর্থিক স্বাধীনতা দেবে।</p>
           </div>
           <button 
             onClick={() => onNavigate('expenses')}
             className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
           >
             সঞ্চয় শুরু করুন
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
