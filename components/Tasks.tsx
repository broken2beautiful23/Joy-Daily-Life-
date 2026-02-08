
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Plus, Check, Trash2, Calendar, Flag, Hash, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface TasksProps {
  userId: string;
}

const Tasks: React.FC<TasksProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState<Task['category']>('Personal');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categoryTranslations = { Work: 'কাজ', Personal: 'ব্যক্তিগত', Study: 'পড়াশোনা', Health: 'স্বাস্থ্য' };

  useEffect(() => {
    if (userId) fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setTasks(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) {
      alert("কাজের বিবরণ দিন!");
      return;
    }
    if (!userId) {
      alert("লগইন সেশন পাওয়া যায়নি।");
      return;
    }
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
          user_id: userId,
          text: newTask, 
          completed: false, 
          category, 
          priority 
        }])
        .select();

      if (error) throw error;

      if (data) {
        setTasks(prev => [data[0], ...prev]);
        setNewTask('');
        alert("কাজটি লিস্টে যোগ করা হয়েছে!");
      }
    } catch (err: any) {
      alert(`ত্রুটি: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !currentStatus })
      .eq('id', id)
      .eq('user_id', userId);

    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
    }
  };

  const deleteTask = async (id: string) => {
    if (window.confirm('এই কাজটি কি চিরতরে মুছে ফেলতে চান?')) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (!error) {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    }
  };

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">টাস্ক ম্যানেজার</h2>
          <p className="text-slate-500 font-medium">আপনার আজকের {pendingCount}টি কাজ বাকি আছে।</p>
        </div>
      </header>

      <form onSubmit={addTask} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex gap-4">
          <input 
            type="text" 
            value={newTask} 
            onChange={(e) => setNewTask(e.target.value)} 
            placeholder="নতুন কাজ লিখুন..." 
            className="flex-1 text-lg border-none focus:ring-0 outline-none font-bold text-slate-700" 
            autoFocus 
          />
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Plus />}
          </button>
        </div>
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
          <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="text-sm font-semibold text-slate-600 bg-slate-50 border-none rounded-lg px-3 py-1 outline-none">
            <option value="Work">কাজ</option>
            <option value="Personal">ব্যক্তিগত</option>
            <option value="Study">পড়াশোনা</option>
            <option value="Health">স্বাস্থ্য</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="text-sm font-semibold text-slate-600 bg-slate-50 border-none rounded-lg px-3 py-1 outline-none">
            <option value="Medium">মাঝারি</option>
            <option value="Low">নিম্ন</option>
            <option value="High">উচ্চ</option>
          </select>
        </div>
      </form>

      {isLoading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">টাস্ক লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className={`flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 transition-all ${task.completed ? 'opacity-50 grayscale shadow-none' : 'shadow-sm hover:shadow-md'}`}>
              <button onClick={() => toggleTask(task.id, task.completed)} className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 hover:border-indigo-400'}`}>
                {task.completed && <Check size={16} strokeWidth={4} />}
              </button>
              <div className="flex-1">
                <h4 className={`font-semibold text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.text}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">খাত: {categoryTranslations[task.category as keyof typeof categoryTranslations] || task.category}</span>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="p-3 text-slate-300 hover:text-red-500">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {!isLoading && tasks.length === 0 && (
            <div className="py-20 text-center text-slate-300 italic">"শুরু করাই হলো এগিয়ে যাওয়ার মূল রহস্য।"</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
