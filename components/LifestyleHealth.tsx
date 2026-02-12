
import React, { useState, useEffect } from 'react';
import { 
  Apple, 
  Dumbbell, 
  BrainCircuit, 
  Plus, 
  Droplets, 
  Flame, 
  Heart, 
  Clock, 
  ArrowRight,
  ChevronRight,
  BookOpen,
  Trash2,
  Loader2
} from 'lucide-react';
import { translations, Language } from '../translations';
import { supabase } from '../services/supabase';

interface LifestyleHealthProps {
  lang: Language;
  userId: string;
}

const LifestyleHealth: React.FC<LifestyleHealthProps> = ({ lang, userId }) => {
  const [activeTab, setActiveTab] = useState<'diet' | 'fitness' | 'mental'>('diet');
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newLog, setNewLog] = useState('');
  const t = translations[lang];

  useEffect(() => {
    if (userId) fetchHealthLogs();
  }, [userId]);

  const fetchHealthLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('health_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) setHealthLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addHealthLog = async () => {
    if (!newLog.trim() || !userId) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('health_logs')
        .insert([{ 
          user_id: userId,
          entry: newLog,
          category: activeTab
        }])
        .select();
      if (!error && data) {
        setHealthLogs([data[0], ...healthLogs]);
        setNewLog('');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLog = async (id: string) => {
    const { error } = await supabase.from('health_logs').delete().eq('id', id).eq('user_id', userId);
    if (!error) setHealthLogs(healthLogs.filter(l => l.id !== id));
  };

  const content = {
    diet: {
      tips: [
        { title: 'প্রতিদিন প্রচুর পানি পান করুন', desc: 'কমপক্ষে ৩ লিটার পানি শরীরকে হাইড্রেটেড রাখে।' },
        { title: 'আঁশযুক্ত খাবার বেছে নিন', desc: 'শাকসবজি ও ফলমূল হজমশক্তি বাড়াতে সাহায্য করে।' },
        { title: 'প্রক্রিয়াজাত খাবার এড়িয়ে চলুন', desc: 'চিনি ও অতিরিক্ত লবণ রক্তচাপ বাড়াতে পারে।' }
      ],
      recipes: [
        { name: 'ওটস কিচুড়ি', time: '১৫ মিনিট', level: 'সহজ' },
        { name: 'ভেজিটেবল সালাদ', time: '১০ মিনিট', level: 'খুব সহজ' },
        { name: 'প্রোটিন স্মুদি', time: '৫ মিনিট', level: 'সহজ' }
      ]
    },
    fitness: {
      tips: [
        { title: 'প্রতিদিন ৩০ মিনিট হাঁটুন', desc: 'হৃৎপিণ্ডের কার্যকারিতা বাড়াতে হাঁটা অত্যন্ত জরুরি।' },
        { title: 'সকালে ১৫ মিনিট ইয়োগা', desc: 'শরীর ও মনের নমনীয়তা বাড়াতে ইয়োগা করুন।' },
        { title: 'পর্যাপ্ত ঘুম নিশ্চিত করুন', desc: 'মাসল রিকভারির জন্য ৭-৮ ঘণ্টা ঘুম প্রয়োজন।' }
      ],
      routines: [
        { name: 'সূর্য নমস্কার', type: 'ইয়োগা', benefit: 'পুরো শরীরের ব্যায়াম' },
        { name: 'পুশ-আপস', type: 'স্ট্রেন্থ', benefit: 'বুকের পেশি গঠন' },
        { name: 'প্ল্যাঙ্ক', type: 'কোর', benefit: 'পেটের মেদ কমানো' }
      ]
    },
    mental: {
      tips: [
        { title: 'গভীর শ্বাস নিন (Deep Breathing)', desc: 'মানসিক উদ্বেগ কমাতে এটি ম্যাজিকের মতো কাজ করে।' },
        { title: 'মেডিটেশন অ্যাপ ব্যবহার করুন', desc: 'প্রতিদিন ১০ মিনিট মেডিটেশন একাগ্রতা বাড়ায়।' },
        { title: 'ডিজিটাল ডিটক্স', desc: 'শোয়ার ১ ঘণ্টা আগে ফোন ব্যবহার বন্ধ করুন।' }
      ],
      affirmations: [
        "আমি আজ সব কাজে সফল হব।",
        "আমার মন শান্ত এবং স্থির।",
        "আমি নিজের ওপর বিশ্বাস করি।"
      ]
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.health_title}</h2>
          <p className="text-slate-500 font-bold mt-2">সুস্থ শরীর এবং প্রশান্ত মনের জন্য আপনার গাইড।</p>
        </div>
        <div className="flex bg-white/60 backdrop-blur-xl p-2 rounded-[28px] border border-slate-100 shadow-sm">
          <button onClick={() => setActiveTab('diet')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'diet' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-600'}`}>
            <Apple size={18} /> {lang === 'bn' ? 'ডায়েট' : 'Diet'}
          </button>
          <button onClick={() => setActiveTab('fitness')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'fitness' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-rose-500'}`}>
            <Dumbbell size={18} /> {lang === 'bn' ? 'ফিটনেস' : 'Fitness'}
          </button>
          <button onClick={() => setActiveTab('mental')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'mental' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}>
            <BrainCircuit size={18} /> {lang === 'bn' ? 'মানসিক' : 'Mental'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Tips & Info */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content[activeTab].tips.map((tip, idx) => (
              <div key={idx} className={`p-8 rounded-[32px] border bg-white shadow-sm hover:shadow-xl transition-all group ${activeTab === 'diet' ? 'border-emerald-50' : activeTab === 'fitness' ? 'border-rose-50' : 'border-indigo-50'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeTab === 'diet' ? 'bg-emerald-50 text-emerald-600' : activeTab === 'fitness' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
                  {activeTab === 'diet' ? <Apple size={24} /> : activeTab === 'fitness' ? <Dumbbell size={24} /> : <BrainCircuit size={24} />}
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-2">{tip.title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm overflow-hidden relative">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <BookOpen size={28} className={activeTab === 'diet' ? 'text-emerald-600' : activeTab === 'fitness' ? 'text-rose-500' : 'text-indigo-600'} />
              {activeTab === 'diet' ? t.diet_recipes : activeTab === 'fitness' ? t.fitness_yoga : t.mental_wellness}
            </h3>

            <div className="space-y-4">
              {activeTab === 'diet' && content.diet.recipes.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-emerald-100 transition-all cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-600"><Clock size={20} /></div>
                    <div>
                      <p className="font-black text-slate-800">{r.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.time} • {r.level}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300" />
                </div>
              ))}

              {activeTab === 'fitness' && content.fitness.routines.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-rose-100 transition-all cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-rose-500"><Flame size={20} /></div>
                    <div>
                      <p className="font-black text-slate-800">{r.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.type} • {r.benefit}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300" />
                </div>
              ))}

              {activeTab === 'mental' && content.mental.affirmations.map((a, i) => (
                <div key={i} className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 italic text-indigo-700 font-bold text-lg text-center">
                  "{a}"
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Health Log & Quick Stats */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
              <Heart size={100} />
            </div>
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10">{t.quick_health_log}</h3>
            
            <div className="space-y-4 relative z-10">
              <textarea 
                value={newLog}
                onChange={(e) => setNewLog(e.target.value)}
                placeholder={lang === 'bn' ? "আজ কি ব্যায়াম বা খাবার খেয়েছেন?" : "Log your workout or meals..."}
                className="w-full bg-white/10 border border-white/10 rounded-3xl p-5 font-bold text-sm h-28 resize-none focus:bg-white/20 outline-none transition-all"
              />
              <button 
                onClick={addHealthLog}
                disabled={isSaving}
                className="w-full bg-white text-slate-900 py-4 rounded-[24px] font-black flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                <span>{lang === 'bn' ? 'সেভ করুন' : 'Save Entry'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">সাম্প্রতিক লগ</h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {healthLogs.map((log) => (
                <div key={log.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-start justify-between group">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${log.category === 'diet' ? 'bg-emerald-50 text-emerald-600' : log.category === 'fitness' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
                      {log.category === 'diet' ? <Apple size={18} /> : log.category === 'fitness' ? <Dumbbell size={18} /> : <BrainCircuit size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{log.entry}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{new Date(log.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteLog(log.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {healthLogs.length === 0 && !isLoading && (
                <div className="py-10 text-center text-slate-300 italic font-bold">এখনো কোনো লগ নেই।</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifestyleHealth;
