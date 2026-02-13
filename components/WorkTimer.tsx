
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Save, Zap, Coffee, Moon, Loader2, Settings2, BellOff } from 'lucide-react';
import { translations, Language } from '../translations';
import { supabase } from '../services/supabase';

interface WorkTimerProps {
  lang: Language;
  userId: string;
  globalState: {
    timeLeft: number;
    totalTime: number;
    isActive: boolean;
    mode: 'focus' | 'shortBreak' | 'longBreak' | 'custom';
    setTimeLeft: (val: number) => void;
    setTotalTime: (val: number) => void;
    setIsActive: (val: boolean) => void;
    setMode: (val: any) => void;
  }
}

const WorkTimer: React.FC<WorkTimerProps> = ({ lang, userId, globalState }) => {
  const { timeLeft, totalTime, isActive, mode, setTimeLeft, setTotalTime, setIsActive, setMode } = globalState;
  
  const [customMinutes, setCustomMinutes] = useState(25);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = translations[lang];

  const presets = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    custom: customMinutes * 60
  };

  // Alarm logic when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setSessionCompleted(true);
      playAlarm();
    }
  }, [timeLeft, isActive]);

  const playAlarm = () => {
    setIsAlarmPlaying(true);
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audioRef.current.loop = true;
      }
      audioRef.current.play();
    } catch (e) { console.log("Audio fail"); }
  };

  const stopAlarm = () => {
    setIsAlarmPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleTimer = () => {
    if (isAlarmPlaying) stopAlarm();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    stopAlarm();
    setIsActive(false);
    const time = mode === 'custom' ? customMinutes * 60 : presets[mode];
    setTimeLeft(time);
    setTotalTime(time);
    setSessionCompleted(false);
  };

  const switchMode = (newMode: 'focus' | 'shortBreak' | 'longBreak' | 'custom') => {
    stopAlarm();
    setMode(newMode);
    setIsActive(false);
    const time = newMode === 'custom' ? customMinutes * 60 : presets[newMode];
    setTimeLeft(time);
    setTotalTime(time);
    setSessionCompleted(false);
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setCustomMinutes(val);
    if (mode === 'custom') {
      setTimeLeft(val * 60);
      setTotalTime(val * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const logSession = async () => {
    if (!sessionTitle.trim() && (mode === 'focus' || mode === 'custom')) {
      alert(lang === 'bn' ? "কাজের একটি শিরোনাম দিন!" : "Enter a session title!");
      return;
    }

    setIsSaving(true);
    try {
      const durationHours = (totalTime - timeLeft) / 3600;
      const { error } = await supabase
        .from('work_logs')
        .insert([{
          user_id: userId,
          date: new Date().toISOString(),
          title: sessionTitle || (mode === 'focus' || mode === 'custom' ? 'Focus Session' : 'Break'),
          hours: parseFloat(durationHours.toFixed(2)),
          learning: mode === 'focus' || mode === 'custom' ? 'Productive focus session' : 'Rest and recovery'
        }]);

      if (error) throw error;
      alert(lang === 'bn' ? "সফলভাবে লগ করা হয়েছে!" : "Logged successfully!");
      resetTimer();
      setSessionTitle('');
    } catch (err: any) { alert(err.message); } 
    finally { setIsSaving(false); }
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <div className={`max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 ${isAlarmPlaying ? 'animate-pulse' : ''}`}>
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{t.timer_title}</h2>
        <p className={`font-bold uppercase tracking-widest text-xs ${isAlarmPlaying ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`}>
          {isAlarmPlaying 
            ? (lang === 'bn' ? 'অ্যালার্ম বাজছে! কাজ শেষ হয়েছে।' : 'Alarm Ringing! Session Finished.') 
            : (mode === 'focus' || mode === 'custom' ? t.focus_motivation : t.break_motivation)}
        </p>
      </div>

      <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[64px] border ${isAlarmPlaying ? 'border-rose-500 shadow-rose-200' : 'border-blue-50 dark:border-slate-800 shadow-blue-200'} shadow-2xl p-8 lg:p-16 flex flex-col items-center gap-10 relative overflow-hidden transition-colors duration-500`}>
        <div className="absolute inset-0 pointer-events-none opacity-5">
           <div className={`h-full ${isAlarmPlaying ? 'bg-rose-600' : 'bg-blue-600'} transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 relative z-10">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-3xl">
            {[
              { id: 'focus', label: t.focus, icon: <Zap size={14} /> },
              { id: 'shortBreak', label: t.short_break, icon: <Coffee size={14} /> },
              { id: 'longBreak', label: t.long_break, icon: <Moon size={14} /> },
              { id: 'custom', label: t.custom, icon: <Settings2 size={14} /> },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => switchMode(m.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === m.id ? 'bg-blue-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {mode === 'custom' && (
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 px-4 py-2 rounded-2xl shadow-sm animate-in zoom-in duration-300">
               <input type="number" value={customMinutes} onChange={handleCustomTimeChange} className="w-16 bg-transparent border-none font-black text-blue-600 text-center text-lg outline-none" min="1" max="999" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.minutes}</span>
            </div>
          )}
        </div>

        <div className="relative group">
          <div className={`absolute inset-0 ${isAlarmPlaying ? 'bg-rose-500/20' : 'bg-blue-500/5'} rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all`}></div>
          <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90 relative">
            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-50 dark:text-slate-800" />
            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="100 100" strokeDashoffset={100 - progress} strokeLinecap="round" className={`${isAlarmPlaying ? 'text-rose-600' : (mode === 'focus' || mode === 'custom' ? 'text-blue-600' : 'text-emerald-500')} transition-all duration-1000`} pathLength="100" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-7xl md:text-8xl font-black tabular-nums tracking-tighter ${isAlarmPlaying ? 'text-rose-600 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10">
          <button onClick={resetTimer} className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-all active:scale-90" title={t.reset}><RotateCcw size={24} /></button>
          <button onClick={isAlarmPlaying ? stopAlarm : toggleTimer} className={`w-28 h-28 rounded-[40px] flex items-center justify-center shadow-2xl transition-all active:scale-95 ${isAlarmPlaying ? 'bg-rose-600 text-white animate-bounce' : (isActive ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'bg-indigo-600 text-white')}`}>
            {isAlarmPlaying ? <BellOff size={48} /> : (isActive ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />)}
          </button>
          <button onClick={() => setSessionCompleted(true)} className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-all active:scale-90" title={t.log_this_session}><Save size={24} /></button>
        </div>
      </div>

      {sessionCompleted && (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border-2 border-indigo-500 shadow-2xl animate-in zoom-in duration-500 space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Zap size={28} /></div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{lang === 'bn' ? 'সেশন সম্পন্ন!' : 'Session Complete!'}</h3>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">কি কাজ করলেন তা লিখে রাখুন</p>
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            <input type="text" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder={lang === 'bn' ? "কাজের শিরোনাম..." : "What were you working on?"} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-6 px-8 font-black text-lg outline-none focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-white" />
            <div className="flex gap-4 pt-2">
              <button onClick={() => setSessionCompleted(false)} className="flex-1 py-5 rounded-[24px] font-black text-slate-400 uppercase tracking-widest text-[10px]">{t.cancel}</button>
              <button onClick={logSession} disabled={isSaving} className="flex-1 bg-indigo-600 text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-3 shadow-xl disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span className="text-[11px] uppercase tracking-widest">{t.log_this_session}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkTimer;
