
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
  ArrowUpRight
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
  const t = translations[lang];

  useEffect(() => {
    if (userId) fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: tx, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (!error && tx) {
        setTransactions(tx);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Process data for the Expenses/Income chart
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(tx => tx.date.startsWith(date));
      const income = dayTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expense = dayTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        name: new Date(date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' }),
        income,
        expense,
        fullDate: date
      };
    });
  }, [transactions, lang]);

  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const balance = totalIncome - totalExpense;

  const growthTips = [
    {
      icon: <CheckCircle2 className="text-blue-500" size={20} />,
      title: lang === 'bn' ? 'সকাল শুরু করুন পরিকল্পনা দিয়ে' : 'Start with a Plan',
      desc: lang === 'bn' ? 'দিনের শুরুতে ৩টি প্রধান কাজের তালিকা তৈরি করুন।' : 'List 3 major tasks at the start of your day.'
    },
    {
      icon: <Lightbulb className="text-amber-500" size={20} />,
      title: lang === 'bn' ? 'প্রতিদিন নতুন কিছু শিখুন' : 'Learn Daily',
      desc: lang === 'bn' ? 'অন্তত ১৫ মিনিট কোনো গঠনমূলক বই বা স্কিল নিয়ে সময় দিন।' : 'Spend at least 15 mins on a book or a new skill.'
    },
    {
      icon: <Wallet className="text-emerald-500" size={20} />,
      title: lang === 'bn' ? 'আর্থিক শৃঙ্খলা বজায় রাখুন' : 'Financial Discipline',
      desc: lang === 'bn' ? 'অপ্রয়োজনীয় ব্যয় কমিয়ে সঞ্চয়ের অভ্যাস গড়ে তুলুন।' : 'Reduce unnecessary costs and build a saving habit.'
    },
    {
      icon: <Rocket className="text-indigo-500" size={20} />,
      title: lang === 'bn' ? 'দীর্ঘমেয়াদী লক্ষ্য নির্ধারণ' : 'Long-term Goals',
      desc: lang === 'bn' ? 'আপনার স্বপ্নকে ছোট ছোট ধাপে ভাগ করে এগিয়ে যান।' : 'Break your dreams into small actionable steps.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.welcome} {userName}! 👋</h2>
          <p className="text-slate-500 mt-1 font-medium">{t.today_start}</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
          <Calendar className="text-indigo-600" size={20} />
          <span className="font-bold text-slate-700">
            {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">ডাটা লোড হচ্ছে...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: t.total_income, value: `৳${totalIncome.toLocaleString()}`, icon: <TrendingUp className="text-emerald-500" />, trend: 'Income', color: 'bg-emerald-50' },
              { label: t.total_expense, value: `৳${totalExpense.toLocaleString()}`, icon: <TrendingDown className="text-rose-500" />, trend: 'Expense', color: 'bg-rose-50' },
              { label: t.balance, value: `৳${balance.toLocaleString()}`, icon: <Wallet className="text-indigo-500" />, trend: 'Balance', color: 'bg-indigo-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-4 rounded-2xl ${stat.color} transition-colors group-hover:bg-white border border-transparent group-hover:border-slate-100`}>{stat.icon}</div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${i === 1 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
                <p className="text-3xl font-black text-slate-800 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Financial Graph Section */}
            <div className="lg:col-span-8 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">ব্যয় ও আয়ের গতিপথ</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">গত ৭ দিনের লেনদেন</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">আয়</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">ব্যয়</span>
                  </div>
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 11}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 11}} 
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      cursor={{stroke: '#e2e8f0', strokeWidth: 2}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#6366f1" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorIncome)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#fb7185" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorExpense)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Life Growth Instructions Section */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
                  <Lightbulb size={120} />
                </div>
                
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10">
                  জীবন গড়ার নির্দেশাবলী <ArrowUpRight size={24} />
                </h3>
                
                <div className="space-y-6 flex-1 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
                  {growthTips.map((tip, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 hover:bg-white/20 transition-all cursor-default group">
                      <div className="flex gap-4">
                        <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0 group-hover:scale-110 transition-transform">
                          {tip.icon}
                        </div>
                        <div>
                          <h4 className="font-black text-sm mb-1">{tip.title}</h4>
                          <p className="text-xs text-white/70 font-medium leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Rocket className="text-indigo-300" size={20} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 italic">
                      "আজকের পরিশ্রমই আগামীর সাফল্য।"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
