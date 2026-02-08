
import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, BookOpen, Plus, Trash2, PenTool, Sparkles, X, Loader2 } from 'lucide-react';
import { translations, Language } from '../translations';
import { supabase } from '../services/supabase';

interface WorkLogEntry {
  id: string;
  user_id: string;
  date: string;
  title: string;
  hours: number;
  learning: string;
}

interface WorkLogProps {
  lang: Language;
  userId: string;
}

const WorkLog: React.FC<WorkLogProps> = ({ lang, userId }) => {
  const [logs, setLogs] = useState<WorkLogEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('');
  const [learning, setLearning] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    if (userId) fetchLogs();
  }, [userId]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (!error && data) setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = async () => {
    if (!title || !hours || !userId) {
      alert(lang === 'bn' ? "দয়া করে সব তথ্য পূরণ করুন!" : "Please fill all fields!");
      return;
    }
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('work_logs')
        .insert([{
          user_id: userId,
          date: new Date().toISOString(),
          title,
          hours: parseFloat(hours),
          learning
        }])
        .select();

      if (error) throw error;

      if (data) {
        setLogs([data[0], ...logs]);
        setTitle('');
        setHours('');
        setLearning('');
        setShowAdd(false);
        alert(lang === 'bn' ? "সফলভাবে যোগ করা হয়েছে!" : "Logged successfully!");
      }
    } catch (err: any) {
      alert(lang === 'bn' ? `ত্রুটি: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLog = async (id: string) => {
    const msg = lang === 'bn' ? 'আপনি কি নিশ্চিত যে এই লগটি ডিলিট করতে চান?' : 'Are you sure you want to delete this log?';
    if (window.confirm(msg) && userId) {
      const { error } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) setLogs(logs.filter(l => l.id !== id));
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date.split('T')[0] === todayStr);
  const totalHoursToday = todayLogs.reduce((sum, l) => sum + l.hours, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.work_log_title}</h2>
          {isLoading && <Loader2 className="animate-spin text-indigo-500 mt-2" size={16} />}
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="blue-btn text-white px-8 py-4 rounded-2xl flex items-center gap-3 shadow-2xl shadow-blue-100 font-black transition-all active:scale-95"
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
          <span>{showAdd ? t.cancel : t.add_log_btn}</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-blue-50 p-8 rounded-[32px] shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-blue-500/50 uppercase tracking-[0.2em] mb-1">{t.total_work_today}</p>
            <p className="text-3xl font-black text-slate-800">{totalHoursToday} {lang === 'bn' ? 'ঘণ্টা' : 'Hours'}</p>
          </div>
        </div>

        <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-2xl shadow-blue-100 flex items-center gap-6 relative overflow-hidden">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <BookOpen size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">{t.today_summary}</p>
            <p className="text-xl font-bold leading-tight">
              {todayLogs.length > 0 
                ? (lang === 'bn' ? `আজ আপনি ${todayLogs.length}টি নতুন কাজ করেছেন!` : `You've logged ${todayLogs.length} tasks today!`) 
                : (lang === 'bn' ? 'আজকের প্রথম কাজের লগ যোগ করুন' : 'Log your first work session today')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {showAdd && (
          <div className="lg:col-span-5 bg-white/80 backdrop-blur-2xl p-10 rounded-[40px] border border-blue-50 shadow-2xl animate-in slide-in-from-left duration-500 sticky top-28">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <PenTool size={24} className="text-blue-600" />
              {t.add_log_btn}
            </h3>
            
            <div className="space-y-6">
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-5 px-6 font-black"
                placeholder={lang === 'bn' ? "কি কাজ করেছেন?" : "What did you work on?"}
              />
              <input 
                type="number" 
                value={hours} 
                onChange={(e) => setHours(e.target.value)} 
                className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-5 px-6 font-black text-2xl text-blue-600"
                placeholder="0.0"
              />
              <textarea 
                value={learning} 
                onChange={(e) => setLearning(e.target.value)} 
                className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-5 px-6 font-bold h-32 resize-none"
                placeholder={lang === 'bn' ? "নতুন কি শিখলেন?" : "What new thing did you learn?"}
              />
              <button 
                onClick={addLog} 
                disabled={isSaving}
                className="w-full blue-btn text-white font-black py-5 rounded-[24px] shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="animate-spin" size={20} />}
                {isSaving ? (lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') : t.save}
              </button>
            </div>
          </div>
        )}

        <div className={`${showAdd ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {logs.map((log) => (
            <div key={log.id} className="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-[28px] shadow-sm hover:shadow-xl group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800 leading-tight mb-1">{log.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.hours} {lang === 'bn' ? 'ঘণ্টা' : 'Hours'} • {new Date(log.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => deleteLog(log.id)} className="p-3 text-slate-300 hover:text-rose-500">
                  <Trash2 size={22} />
                </button>
              </div>
            </div>
          ))}
          {!isLoading && logs.length === 0 && <div className="p-20 text-center text-slate-300 italic font-bold">কোনো কাজের লগ নেই</div>}
        </div>
      </div>
    </div>
  );
};

export default WorkLog;
