
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { Plus, StickyNote, Trash2, Edit3, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface NotesProps {
  userId: string;
}

const Notes: React.FC<NotesProps> = ({ userId }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userId) fetchNotes();
  }, [userId]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (!error && data) setNotes(data);
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ 
          user_id: userId,
          title: 'নতুন নোট', 
          content: '', 
          updated_at: new Date().toISOString() 
        }])
        .select();

      if (error) throw error;

      if (data) {
        setNotes([data[0], ...notes]);
        startEditing(data[0]);
      }
    } catch (err: any) {
      alert(`ত্রুটি: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (note: any) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEdit = async () => {
    if (!editingId || !userId) return;
    const updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('notes')
      .update({ 
        title: editTitle, 
        content: editContent, 
        updated_at 
      })
      .eq('id', editingId)
      .eq('user_id', userId);

    if (!error) {
      setNotes(notes.map(n => n.id === editingId ? { ...n, title: editTitle, content: editContent, updated_at } : n));
      setEditingId(null);
    } else {
      alert("সেভ করতে সমস্যা হয়েছে।");
    }
  };

  const deleteNote = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই নোটটি ডিলিট করতে চান?')) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) setNotes(notes.filter(n => n.id !== id));
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">নোটস</h2>
          {(isLoading || isSaving) && <Loader2 className="animate-spin text-indigo-500 mt-2" size={16} />}
        </div>
        <button onClick={createNote} disabled={isSaving} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:bg-indigo-700 disabled:opacity-50">
          <Plus size={20} />
          <span>নতুন নোট</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div key={note.id} className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group relative ${editingId === note.id ? 'ring-2 ring-indigo-500' : 'hover:shadow-xl'}`}>
            {editingId === note.id ? (
              <div className="space-y-4">
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full text-lg font-bold border-none focus:ring-0 p-0 outline-none" placeholder="শিরোনাম..." />
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full h-32 border-none focus:ring-0 p-0 resize-none outline-none" placeholder="লিখতে শুরু করুন..." autoFocus />
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 text-slate-400 font-bold">বাতিল</button>
                  <button onClick={saveEdit} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold">সেভ করুন</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><StickyNote size={20} /></div>
                  <div className="flex gap-1">
                    <button onClick={() => startEditing(note)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={18} /></button>
                    <button onClick={() => deleteNote(note.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{note.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-4 leading-relaxed whitespace-pre-wrap">{note.content || 'খালি নোট...'}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-slate-400 font-bold uppercase">আপডেট: {new Date(note.updated_at).toLocaleDateString('bn-BD')}</div>
              </>
            )}
          </div>
        ))}
        {!isLoading && notes.length === 0 && (
          <div className="col-span-full py-28 text-center bg-white/50 rounded-[40px] border border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <StickyNote size={40} />
             </div>
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">কোনো নোট নেই। নতুন নোট যোগ করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
