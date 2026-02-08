
import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import { Plus, Flame, Check, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface HabitTrackerProps {
  userId: string;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ userId }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);
    if (!error && data) setHabits(data);
    setIsLoading(false);
  };

  const addHabit = async () => {
    if (!newHabitName.trim() || !userId) return;
    const newHabit = { 
      id: `habit-${Date.now()}`, 
      user_id: userId,
      name: newHabitName, 
      completedDates: [], 
      streak: 0, 
      targetPerWeek: 7 
    };
    const { error } = await supabase.from('habits').insert([newHabit]);
    if (!error) {
      setHabits([...habits, newHabit as any]);
      setNewHabitName('');
    }
  };

  const toggleDay = async (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(date);
    const newDates = isCompleted 
      ? habit.completedDates.filter(d => d !== date) 
      : [...habit.completedDates, date];

    const { error } = await supabase
      .from('habits')
      .update({ completedDates: newDates })
      .eq('id', habitId)
      .eq('user_id', userId);
    if (!error) {
      setHabits(habits.map(h => h.id === habitId ? { ...h, completedDates: newDates } : h));
    }
  };

  const deleteHabit = async (id: string) => {
    if (window.confirm('এই অভ্যাসটি কি ডিলিট করতে চান?')) {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) setHabits(habits.filter(h => h.id !== id));
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">অভ্যাস ট্র্যাকার</h2>
          {isLoading && <Loader2 className="animate-spin text-indigo-500 mt-2" size={16} />}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="নতুন অভ্যাসের নাম..." className="bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none font-bold" />
          <button onClick={addHabit} className="bg-indigo-600 text-white p-3 rounded-xl shadow-md active:scale-95 transition-all"><Plus /></button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 text-left">
                <th className="py-4 px-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">অভ্যাসের নাম</th>
                {days.map(d => (
                  <th key={d} className="py-4 px-2 text-center">
                    <span className="text-[10px] font-black text-slate-400 block uppercase">{weekDayNames[new Date(d).getDay() as keyof typeof weekDayNames]}</span>
                    <span className="text-sm font-black text-slate-700">{new Date(d).getDate()}</span>
                  </th>
                ))}
                <th className="py-4 px-4 text-center font-black text-slate-400 uppercase text-[10px] tracking-widest">স্ট্রিক</th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="py-6 px-4"><span className="font-bold text-slate-800 text-lg">{habit.name}</span></td>
                  {days.map(d => {
                    const isDone = habit.completedDates.includes(d);
                    return (
                      <td key={d} className="py-6 px-2 text-center">
                        <button onClick={() => toggleDay(habit.id, d)} className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${isDone ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}>
                          {isDone ? <Check size={20} /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-6 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-500 font-black bg-orange-50 px-3 py-2 rounded-xl">
                      <Flame size={18} />
                      <span>{habit.streak}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <button onClick={() => deleteHabit(habit.id)} className="p-2 text-slate-300 hover:text-red-500">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && habits.length === 0 && (
            <div className="text-center py-20 text-slate-300 italic font-medium">কোনো অভ্যাস ট্র্যাকিং করা হচ্ছে না।</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
