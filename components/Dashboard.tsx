
import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Flame, 
  Wallet,
  Calendar,
  TrendingDown,
  BrainCircuit,
  UserCheck,
  Send,
  Loader2,
  X,
  MessageSquare
} from 'lucide-react';
import { generateDailySummary, chatWithJoy } from '../services/gemini';
import { translations, Language } from '../translations';
import { Transaction } from '../types';
import { supabase } from '../services/supabase';

interface DashboardProps {
  lang: Language;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ lang, userName }) => {
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const [floatingChatInput, setFloatingChatInput] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const t = translations[lang];

  useEffect(() => {
    fetchDashboardData();
  }, [userName]);

  const fetchDashboardData = async () => {
    setLoading(true);
    // Fetch transactions from Supabase instead of localStorage
    const { data: tx, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && tx) {
      setTransactions(tx);
      const summary = await generateDailySummary({
        userName,
        finance: `Income: ${tx.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0)}, Expense: ${tx.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)}`
      });
      setAiInsight(summary || "");
    }
    setLoading(false);
  };

  const handleChat = async (e: React.FormEvent, input: string, isFloating: boolean) => {
    e.preventDefault();
    if (!input.trim() || isChatting) return;

    const msg = input;
    if (isFloating) setFloatingChatInput('');
    else setChatInput('');
    
    setIsChatting(true);
    const response = await chatWithJoy(msg, { userName, transactions });
    setAiInsight(response || "");
    setIsChatting(false);
  };

  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const balance = totalIncome - totalExpense;

  const moodData = [
    { day: lang === 'bn' ? 'সোম' : 'Mon', mood: 4 },
    { day: lang === 'bn' ? 'মঙ্গল' : 'Tue', mood: 3 },
    { day: lang === 'bn' ? 'বুধ' : 'Wed', mood: 5 },
    { day: lang === 'bn' ? 'বৃহস্পতি' : 'Thu', mood: 4 },
    { day: lang === 'bn' ? 'শুক্র' : 'Fri', mood: 5 },
    { day: lang === 'bn' ? 'শনি' : 'Sat', mood: 2 },
    { day: lang === 'bn' ? 'রবি' : 'Sun', mood: 4 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.welcome} {userName}! 👋</h2>
          <p className="text-slate-500 mt-1 font-medium">{t.today_start}</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
          <Calendar className="text-indigo-600" size={20} />
          <span className="font-bold text-slate-700">{new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t.habit_streak, value: lang === 'bn' ? '১২ দিন' : '12 Days', icon: <Flame className="text-orange-500" />, trend: '+2', color: 'bg-orange-50' },
          { label: t.total_income, value: `৳${totalIncome.toLocaleString()}`, icon: <TrendingUp className="text-emerald-500" />, trend: 'Income', color: 'bg-emerald-50' },
          { label: t.total_expense, value: `৳${totalExpense.toLocaleString()}`, icon: <TrendingDown className="text-rose-500" />, trend: 'Expense', color: 'bg-rose-50' },
          { label: t.balance, value: `৳${balance.toLocaleString()}`, icon: <Wallet className="text-indigo-500" />, trend: 'Balance', color: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} transition-colors group-hover:bg-white border border-transparent group-hover:border-slate-100`}>{stat.icon}</div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${i === 2 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
            <p className="text-2xl font-black text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 tracking-tight">
            {t.mood_analytics} <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{t.last_7_days}</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 11}} dy={10} />
                <YAxis hide domain={[1, 5]} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={5} dot={{r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff'}} animationDuration={2000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col shadow-2xl shadow-indigo-200 min-h-[500px]">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
            <BrainCircuit size={200} />
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                <UserCheck size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-70">{t.ai_assistant}</p>
                <h4 className="text-xl font-black tracking-tight">{t.ai_name}</h4>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
              <div className="space-y-4">
                <span className="inline-block text-[10px] font-black bg-white/10 px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-widest">{t.ai_focus}</span>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
                  {loading ? (
                    <div className="flex items-center gap-3 italic opacity-70">
                      <Loader2 className="animate-spin" size={16} />
                      <p>{lang === 'bn' ? 'ভাবছি...' : 'Thinking...'}</p>
                    </div>
                  ) : (
                    <p className="text-lg font-bold leading-relaxed italic animate-in fade-in slide-in-from-bottom-2 duration-700">
                      "{aiInsight}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t.ai_role}</p>
                {isChatting && <Loader2 className="animate-spin opacity-50" size={14} />}
              </div>
              
              <form onSubmit={(e) => handleChat(e, chatInput, false)} className="relative group">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t.ask_joy}
                  disabled={isChatting}
                  className="w-full bg-white/10 hover:bg-white/20 focus:bg-white text-white focus:text-slate-900 px-6 py-5 rounded-3xl backdrop-blur-xl transition-all border border-white/20 outline-none pr-16 font-bold placeholder:text-white/40 focus:placeholder:text-slate-400"
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim() || isChatting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-90 disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
