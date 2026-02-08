
import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { Clock, Gamepad2, Palette, Code, Plus, Trash2, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ProfLog {
  id: string;
  user_id: string;
  type: 'skip' | 'web' | 'canva';
  duration: string;
  date: string;
  note: string;
}

interface ProfessionalWorkProps {
  lang: Language;
  userId: string;
}

const ProfessionalWork: React.FC<ProfessionalWorkProps> = ({ lang, userId }) => {
  const [logs, setLogs] = useState<ProfLog[]>([]);
  const [selectedType, setSelectedType] = useState<'skip' | 'web' | 'canva'>('web');
  const [duration, setDuration] = useState('');
  const [note, setNote] = useState('');
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
        .from('prof_logs')
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
    if (!duration.trim() || !userId) {
      alert(lang === 'bn' ? "দয়া করে কাজের সময় দিন!" : "Please enter duration!");
      return;
    }
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('prof_logs')
        .insert([{
          user_id: userId,
          type: selectedType,
          duration,
          date: new Date().toISOString(),
          note
        }])
        .select();

      if (error) throw error;

      if (data) {
        setLogs([data[0], ...logs]);
        setDuration('');
        setNote('');
        alert(lang === 'bn' ? "রেকর্ড সফলভাবে সেভ হয়েছে!" : "Record saved!");
      }
    } catch (err: any) {
      alert(lang === 'bn' ? `ত্রুটি: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLog = async (id: string) => {
    if (window.confirm(lang === 'bn' ? 'মুছে ফেলতে চান?' : 'Confirm delete?') && userId) {
      const { error } = await supabase
        .from('prof_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) setLogs(logs.filter(l => l.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.prof_work_title}</h2>
          {isLoading && <Loader2 className="animate-spin text-blue-500 mt-2" size={20} />}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[48px] border border-blue-50 shadow-2xl space-y-8">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'skip', icon: <Gamepad2 size={20} />, label: t.skip_game },
                { id: 'web', icon: <Code size={20} />, label: t.web_design },
                { id: 'canva', icon: <Palette size={20} />, label: t.canva_work },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedType(item.id as any)}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-3xl border-2 transition-all ${selectedType === item.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:border-blue-100'}`}
                >
                  {item.icon}
                  <span className="text-[9px] font-black uppercase text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
            <input 
              type="text" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              className="w-full bg-blue-50/50 border border-blue-100 rounded-3xl py-6 px-8 font-black text-2xl text-blue-600 outline-none"
              placeholder={lang === 'bn' ? "২ ঘণ্টা ৩০ মিনিট" : "e.g. 2 hrs 30 min"}
            />
            <textarea 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              className="w-full bg-blue-50/50 border border-blue-100 rounded-3xl py-5 px-8 font-bold h-24 resize-none outline-none"
              placeholder={lang === 'bn' ? "আজ কি কি করলেন?" : "What did you do today?"}
            />
            <button 
              onClick={addLog} 
              disabled={isSaving}
              className="w-full blue-btn text-white font-black py-6 rounded-[28px] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
              <span>{isSaving ? (lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') : t.save}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-[32px] shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  {log.type === 'skip' ? <Gamepad2 size={24} /> : log.type === 'web' ? <Code size={24} /> : <Palette size={24} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-800">{log.duration}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {log.type === 'skip' ? t.skip_game : log.type === 'web' ? t.web_design : t.canva_work} • {new Date(log.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button onClick={() => deleteLog(log.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={22} />
              </button>
            </div>
          ))}
          {!isLoading && logs.length === 0 && <div className="p-20 text-center text-slate-300 italic font-bold">কোনো রেকর্ড নেই</div>}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalWork;
