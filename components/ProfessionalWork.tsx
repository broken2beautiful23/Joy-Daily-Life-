
import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { Clock, Gamepad2, Palette, Code, Plus, Trash2, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ProfLog {
  id: string;
  type: 'skip' | 'web' | 'canva';
  duration: string;
  date: string;
  note: string;
}

interface ProfessionalWorkProps {
  lang: Language;
}

const ProfessionalWork: React.FC<ProfessionalWorkProps> = ({ lang }) => {
  const [logs, setLogs] = useState<ProfLog[]>([]);
  const [selectedType, setSelectedType] = useState<'skip' | 'web' | 'canva'>('web');
  const [duration, setDuration] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('prof_logs').select('*').order('date', { ascending: false });
    if (!error && data) setLogs(data);
    setIsLoading(false);
  };

  const addLog = async () => {
    if (!duration.trim()) return;
    const newLog = {
      id: `prof-${Date.now()}`,
      type: selectedType,
      duration,
      date: new Date().toISOString(),
      note
    };
    const { error } = await supabase.from('prof_logs').insert([newLog]);
    if (!error) {
      setLogs([newLog as any, ...logs]);
      setDuration('');
      setNote('');
    }
  };

  const deleteLog = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই রেকর্ডটি মুছে ফেলতে চান?')) {
      const { error } = await supabase.from('prof_logs').delete().eq('id', id);
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
              className="w-full bg-blue-50/50 border border-blue-100 rounded-3xl py-6 px-8 font-black text-2xl text-blue-600"
              placeholder="যেমন: ২ ঘণ্টা ৩০ মিনিট"
            />
            <textarea 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              className="w-full bg-blue-50/50 border border-blue-100 rounded-3xl py-5 px-8 font-bold h-24 resize-none"
              placeholder="আজ কি কি করলেন?"
            />
            <button onClick={addLog} className="w-full blue-btn text-white font-black py-6 rounded-[28px] flex items-center justify-center gap-3">
              <Plus size={24} /> <span>{t.save}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-[32px] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">{log.type === 'skip' ? <Gamepad2 size={24} /> : log.type === 'web' ? <Code size={24} /> : <Palette size={24} />}</div>
                <div>
                  <h4 className="font-black text-slate-800">{log.duration}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => deleteLog(log.id)} className="p-3 text-slate-300 hover:text-rose-500"><Trash2 size={22} /></button>
            </div>
          ))}
          {!isLoading && logs.length === 0 && <div className="p-20 text-center text-slate-300 italic">কোনো রেকর্ড নেই</div>}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalWork;
