
import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import { Plus, Flame, Check, Trash2, Loader2, X } from 'lucide-react';
import { supabase } from '../services/supabase';

interface HabitTrackerProps {
  userId: string;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ userId }) => {
  const [habits, setHabits] = useState<any[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const today = new Date();
  const days = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weekDayNames = { 0: 'রবি', 1: 'সোম', 2: 'মঙ্গল', 3: 'বুধ', 4: 'বৃহস্প', 5: 'শুক্র', 6: 'শনি' };

  useEffect(() => {
    if (userId) fetchHabits();
  }, [userId]);

  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);
      if (!error && data) setHabits(data);
    } finally {
      setIsLoading(false);
    }
  };

  const addHabit = async () => {
    if (!newHabitName.trim() || !userId) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([{ 
          user_id: userId,
          name: newHabitName, 
          completed_dates: [], 
          streak: 0, 
          target_per_week: 7 
        }])
        .select();
      if (!error && data) {
        setHabits([...habits, data[0]]);
        setNewHabitName('');
        setShowAdd(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = async (habit: any, date: string) => {
    if (!userId) return;
    const currentDates = [...(habit.completed_dates || [])];
    const index = currentDates.indexOf(date);
    
    if (index > -1) {
      currentDates.splice(index, 1);
    } else {
      currentDates.push(date);
    }

    const { error } = await supabase
      .from('habits')
      .update({ completed_dates: currentDates })
      .eq('id', habit.id)
      .eq('user_id', userId);

    if (!error) {
      setHabits(habits.map(h => h.id === habit.id ? { ...h, completed_dates: currentDates } : h));
    }
  };

  const deleteHabit = async (id: string) => {
    if (window.confirm('মুছে ফেলতে চান?')) {
      const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', userId);
      if (!error) setHabits(habits.filter(h => h.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">অভ্যাস ট্র্যাকার</h2>
          {isLoading && <Loader2 className="animate-spin text-indigo-500 mt-2" size={16} />}
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all">
          {showAdd ? <X size={20} /> : <Plus size={20} />}
          <span className="font-bold">{showAdd ? 'বাতিল' : 'নতুন অভ্যাস'}</span>
        </button>
      </header>

      {showAdd && (
        <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xl flex gap-4 animate-in slide-in-from-top duration-300">
          <input 
            type="text" 
            value={newHabitName} 
            onChange={(e) => setNewHabitName(e.target.value)} 
            placeholder="নতুন অভ্যাস লিখুন..." 
            className="flex-1 bg-slate-50 border-none rounded-xl px-6 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button 
            onClick={addHabit} 
            disabled={isSaving}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'যোগ করুন'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {habits.map((habit) => (
          <div key={habit.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:shadow-xl transition-all">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                <Flame size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">{habit.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  স্ট্রিক: {habit.completed_dates?.length || 0} দিন সম্পন্ন
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {days.map((date) => {
                const isCompleted = habit.completed_dates?.includes(date);
                const dayName = weekDayNames[new Date(date).getDay() as keyof typeof weekDayNames];
                return (
                  <button
                    key={date}
                    onClick={() => toggleDay(habit, date)}
                    className={`w-12 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2 ${
                      isCompleted 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' 
                        : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase">{dayName}</span>
                    {isCompleted ? <Check size={18} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                  </button>
                );
              })}
              <button 
                onClick={() => deleteHabit(habit.id)}
                className="ml-4 p-3 text-slate-200 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitTracker;
