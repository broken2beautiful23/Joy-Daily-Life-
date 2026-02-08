
import React, { useState, useEffect } from 'react';
import { Target, Calendar, ChevronRight, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  targetDate: string;
}

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('ব্যক্তিগত');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('joy_goals').select('*');
    if (!error && data) setGoals(data);
    setIsLoading(false);
  };

  const addGoal = async () => {
    if (!newTitle.trim()) return;
    const goal = {
      id: `goal-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      progress: 0,
      targetDate: newTargetDate || 'অনির্ধারিত'
    };
    const { error } = await supabase.from('joy_goals').insert([goal]);
    if (!error) {
      setGoals([...goals, goal as any]);
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const updateProgress = async (id: string, current: number) => {
    const newVal = prompt('নতুন প্রগ্রেস লিখুন (০-১০০):', current.toString());
    if (newVal === null) return;
    const progress = Math.min(100, Math.max(0, parseInt(newVal) || 0));
    const { error } = await supabase.from('joy_goals').update({ progress }).eq('id', id);
    if (!error) setGoals(goals.map(g => g.id === id ? { ...g, progress } : g));
  };

  const deleteGoal = async (id: string) => {
    if (window.confirm('এই লক্ষ্যটি কি চিরতরে মুছে ফেলতে চান?')) {
      const { error } = await supabase.from('joy_goals').delete().eq('id', id);
      if (!error) setGoals(goals.filter(g => g.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">ভিশন বোর্ড</h2>
          {isLoading && <Loader2 className="animate-spin text-indigo-500 mt-2" size={16} />}
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 transition-all active:scale-95">
          {isAdding ? <X size={20}/> : <Plus size={20} />}
          {isAdding ? 'বাতিল' : 'নতুন লক্ষ্য'}
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 animate-in slide-in-from-top duration-300 space-y-4">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="লক্ষ্য কি?" className="w-full p-4 bg-slate-50 rounded-xl font-bold" />
          <div className="grid grid-cols-2 gap-4">
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="p-4 bg-slate-50 rounded-xl font-bold">
              <option>ক্যারিয়ার</option>
              <option>ব্যক্তিগত</option>
              <option>স্বাস্থ্য</option>
              <option>অর্থনীতি</option>
            </select>
            <input type="text" value={newTargetDate} onChange={(e) => setNewTargetDate(e.target.value)} placeholder="টার্গেট তারিখ" className="p-4 bg-slate-50 rounded-xl font-bold" />
          </div>
          <button onClick={addGoal} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl">সেভ করুন</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group">
            <button onClick={() => deleteGoal(goal.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500">
              <Trash2 size={20} />
            </button>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 rounded-xl"><Target className="text-slate-400" /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">{goal.category}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{goal.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium mb-6">
              <Calendar size={14} />
              <span>টার্গেট: {goal.targetDate}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-slate-400">অগ্রগতি</span>
                <span className="text-indigo-600">{goal.progress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600" style={{width: `${goal.progress}%`}}></div>
              </div>
            </div>
            <button onClick={() => updateProgress(goal.id, goal.progress)} className="w-full mt-6 py-3 text-slate-400 font-bold flex items-center justify-center gap-2 hover:text-indigo-600 transition-colors uppercase text-[10px] tracking-widest">
              হিসাব আপডেট করুন <ChevronRight size={16} />
            </button>
          </div>
        ))}
        {!isLoading && goals.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            কোনো লক্ষ্য যোগ করা হয়নি।
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
