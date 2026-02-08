
import React, { useState, useEffect } from 'react';
import { MOOD_COLORS, MOOD_EMOJIS } from '../constants';
import { Mood, DiaryEntry } from '../types';
import { Plus, Search, Calendar as CalendarIcon, Star, Trash2, X, BookText, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface DiaryProps {
  userId: string;
}

const Diary: React.FC<DiaryProps> = ({ userId }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood>(Mood.GOOD);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const moodTranslations: Record<string, string> = {
    Great: 'অসাধারণ',
    Good: 'ভালো',
    Okay: 'ঠিক আছে',
    Sad: 'দুঃখিত',
    Awful: 'খুব খারাপ'
  };

  useEffect(() => {
    if (userId) fetchEntries();
  }, [userId]);

  const fetchEntries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (!error && data) {
      setEntries(data);
    }
    setIsLoading(false);
  };

  const addEntry = async () => {
    if (!newContent.trim() || !userId) return;
    
    const newEntry = {
      id: Date.now().toString(),
      user_id: userId,
      date: new Date().toISOString(),
      mood: selectedMood,
      content: newContent,
      isImportant: false
    };

    const { error } = await supabase
      .from('diary_entries')
      .insert([newEntry]);

    if (!error) {
      setEntries([newEntry, ...entries]);
      setNewContent('');
      setIsAdding(false);
    } else {
      alert('ডাটা সেভ করতে সমস্যা হয়েছে।');
    }
  };

  const deleteEntry = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই ডায়েরি এন্ট্রিটি চিরতরে মুছে ফেলতে চান?')) {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (!error) {
        setEntries(entries.filter(e => e.id !== id));
      }
    }
  };

  const filteredEntries = entries.filter(e => 
    e.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">আমার গোপন ডায়েরি</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
          {isAdding ? <X /> : <Plus size={20} />}
          <span>{isAdding ? 'বাতিল' : 'নতুন কিছু লিখুন'}</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 animate-in slide-in-from-top duration-300">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">আজ আপনার অনুভব কেমন?</label>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Object.values(Mood).map((m) => (
                <button key={m} onClick={() => setSelectedMood(m)} className={`flex flex-col items-center gap-2 p-4 min-w-[80px] rounded-2xl transition-all border-2 ${selectedMood === m ? 'bg-indigo-50 border-indigo-500 scale-105' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                  <span className="text-3xl">{MOOD_EMOJIS[m]}</span>
                  <span className="text-xs font-bold text-slate-700">{moodTranslations[m]}</span>
                </button>
              ))}
            </div>
          </div>
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="আজ কি হলো? আপনার মনের কথা লিখুন..." className="w-full h-48 p-6 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 border-none outline-none resize-none text-slate-700 leading-relaxed text-lg" />
          <div className="mt-6 flex justify-end">
            <button onClick={addEntry} className="bg-indigo-600 text-white font-bold py-3 px-10 rounded-xl hover:bg-indigo-700 shadow-md">গল্পটি সেভ করুন</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="স্মৃতিগুলো খুঁজুন..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">ডাটা লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEntries.length > 0 ? filteredEntries.map((entry) => (
            <article key={entry.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md group relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{MOOD_EMOJIS[entry.mood]}</span>
                  <div>
                    <h4 className="font-bold text-slate-800">{new Date(entry.date).toLocaleDateString('bn-BD', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><CalendarIcon size={12} /> {new Date(entry.date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => deleteEntry(entry.id)} className="p-2 text-slate-400 hover:text-red-500" title="মুছে ফেলুন">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className={`p-1 mb-4 inline-block rounded-md text-[10px] font-bold uppercase tracking-widest px-2 ${MOOD_COLORS[entry.mood]}`}>
                অনুভব: {moodTranslations[entry.mood]}
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
            </article>
          )) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookText size={40} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">এখনও কিছু লেখা হয়নি। আপনার দিনের গল্প শুরু করুন!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Diary;
