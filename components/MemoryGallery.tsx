
import React, { useState, useEffect } from 'react';
import { Memory } from '../types';
import { Camera, Trash2, Heart, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface MemoryGalleryProps {
  userId: string;
}

const MemoryGallery: React.FC<MemoryGalleryProps> = ({ userId }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (userId) fetchMemories();
  }, [userId]);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (!error && data) setMemories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { data, error } = await supabase
          .from('memories')
          .insert([{ 
            user_id: userId,
            url: reader.result as string, 
            caption: 'নতুন স্মৃতি', 
            date: new Date().toISOString() 
          }])
          .select();
        
        if (error) throw error;

        if (data) {
          setMemories([data[0], ...memories]);
          alert("স্মৃতি আপলোড হয়েছে!");
        }
      } catch (err: any) {
        alert(`আপলোড ব্যর্থ: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteMemory = async (id: string) => {
    if (window.confirm('মুছে ফেলতে চান?')) {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) {
        setMemories(memories.filter(m => m.id !== id));
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">স্মৃতি গ্যালারি</h2>
          <p className="text-slate-500">আপনার জীবনের সুন্দর মুহূর্তগুলো ফ্রেমবন্দি করুন।</p>
        </div>
        <label className={`cursor-pointer bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
          <span>{isUploading ? 'আপলোড হচ্ছে...' : 'স্মৃতি আপলোড করুন'}</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {memories.map((memory) => (
            <div key={memory.id} className="relative bg-white p-3 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid group hover:shadow-xl transition-all hover:-translate-y-1">
              <img src={memory.url} alt={memory.caption} className="w-full rounded-xl object-cover" />
              <div className="mt-3 flex items-center justify-between">
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(memory.date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
                <div className="flex gap-1">
                  <button className="p-2 text-slate-300 hover:text-pink-500 transition-colors"><Heart size={18} /></button>
                  <button onClick={() => deleteMemory(memory.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="মুছে ফেলুন">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && memories.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white/50 rounded-[40px] border border-dashed border-slate-200">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><Camera size={48} className="text-slate-300" /></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">আপনার গ্যালারি খালি। প্রথম ছবিটি আপলোড করুন!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemoryGallery;
