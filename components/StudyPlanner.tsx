
import React, { useState, useEffect } from 'react';
import { Book, Clock, Target, CheckCircle, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface StudySession {
  id: string;
  user_id: string;
  subject: string;
  duration: string;
  topic: string;
  done: boolean;
}

interface StudyPlannerProps {
  userId: string;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ userId }) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) fetchSessions();
  }, [userId]);

  const fetchSessions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId);
    if (!error && data) setSessions(data);
    setIsLoading(false);
  };

  const addSession = async () => {
    if (!subject.trim() || !userId) return;
    const newSession = {
      id: `study-${Date.now()}`,
      user_id: userId,
      subject,
      duration: duration || 'অনির্দিষ্ট সময়',
      topic: topic || 'জেনারেল স্টাডি',
      done: false
    };
    const { error } = await supabase.from('study_sessions').insert([newSession]);
    if (!error) {
      setSessions([...sessions, newSession as any]);
      setSubject(''); setDuration(''); setTopic('');
      setIsAdding(false);
    }
  };

  const toggleDone = async (id: string, currentStatus: boolean) => {
    if (!userId) return;
    const { error } = await supabase
      .from('study_sessions')
      .update({ done: !currentStatus })
      .eq('id', id)
      .eq('user_id', userId);
    if (!error) {
      setSessions(sessions.map(s => s.id === id ? { ...s, done: !currentStatus } : s));
    }
  };

  const deleteSession = async (id: string) => {
    if (window.confirm('এই সেশনটি ডিলিট করতে চান?') && userId) {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) setSessions(sessions.filter(s => s.id !== id));
    }
  };

  const totalDone = sessions.filter(s => s.done).length;
  const progressPercent = sessions.length > 0 ? Math.round((totalDone / sessions.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">পড়াশোনা প্ল্যানার</h2>
          {isLoading && <Loader2 className="animate-spin text-indigo-500 mt-2" size={16} />}
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2">
           {isAdding ? <X size={20}/> : <Plus size={20} />}
           {isAdding ? 'বাতিল' : 'নতুন সেশন'}
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 animate-in slide-in-from-top duration-300 space-y-4">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="বিষয়ের নাম" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" />
          <div className="grid grid-cols-2 gap-4">
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="সময় (যেমন: ২ ঘণ্টা)" className="p-4 bg-slate-50 rounded-xl outline-none font-bold" />
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="টপিক" className="p-4 bg-slate-50 rounded-xl outline-none font-bold" />
          </div>
          <button onClick={addSession} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl">প্ল্যানে যোগ করুন</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">মোট সেশন</p>
            <p className="text-xl font-bold text-slate-800">{sessions.length} টি</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Target size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">লক্ষ্যমাত্রা পূরণ</p>
            <p className="text-xl font-bold text-slate-800">{progressPercent}%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Book size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">বিষয়সমূহ</p>
            <p className="text-xl font-bold text-slate-800">{new Set(sessions.map(s => s.subject)).size} টি সক্রিয়</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-bold text-slate-800">আজকের পড়াশোনার পরিকল্পনা</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {sessions.map((session) => (
            <div key={session.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div onClick={() => toggleDone(session.id, session.done)} className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition-all ${session.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {session.done ? <CheckCircle size={20} /> : <Book size={20} />}
                </div>
                <div>
                  <h4 className={`font-bold text-slate-800 ${session.done ? 'line-through opacity-50' : ''}`}>{session.subject}</h4>
                  <p className="text-sm text-slate-500">{session.topic} • {session.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleDone(session.id, session.done)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${session.done ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-600 text-white shadow-md'}`}
                >
                  {session.done ? 'সম্পন্ন' : 'শুরু করুন'}
                </button>
                <button onClick={() => deleteSession(session.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-100 transition-opacity">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {!isLoading && sessions.length === 0 && (
            <div className="p-20 text-center text-slate-300 italic">আজকের কোনো পড়ার সেশন নেই।</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
