
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NAVIGATION_ITEMS } from './constants';
import Dashboard from './components/Dashboard';
import Diary from './components/Diary';
import Tasks from './components/Tasks';
import Expenses from './components/Expenses';
import Goals from './components/Goals';
import StudyPlanner from './components/StudyPlanner';
import Notes from './components/Notes';
import MemoryGallery from './components/MemoryGallery';
import WorkLog from './components/WorkLog';
import MotivationalStories from './components/MotivationalStories';
import ProfessionalWork from './components/ProfessionalWork';
import WorkTimer from './components/WorkTimer';
import LifestyleHealth from './components/LifestyleHealth';
import DailyEssentials from './components/DailyEssentials';
import EducationCareer from './components/EducationCareer';
import EntertainmentHobbies from './components/EntertainmentHobbies';
import FloatingAI from './components/FloatingAI';
import Profile from './components/Profile';
import { translations, Language } from './translations';
import { supabase } from './services/supabase';
import { 
  LogOut, Menu, X, Sparkles, 
  ArrowRight, Search, Sun, Moon,
  MessageSquare, Facebook, Instagram, Mail,
  LogIn, UserPlus, Ghost, Lock, Mail as MailIcon, Loader2, User,
  Play, Pause, RotateCcw, Zap, Maximize2
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>('bn');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('ইউজার');
  const [userAvatar, setUserAvatar] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // --- Global Timer State ---
  const [timerTimeLeft, setTimerTimeLeft] = useState(25 * 60);
  const [timerTotalTime, setTimerTotalTime] = useState(25 * 60);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak' | 'custom'>('focus');
  const timerIntervalRef = useRef<any>(null);

  // Auth UI States
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const t = translations[lang] || translations['bn'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User');
        setUserAvatar(session.user.user_metadata?.avatar_url || '');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setUserId(session.user.id);
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User');
        setUserAvatar(session.user.user_metadata?.avatar_url || '');
      } else {
        setUserId(null);
        setUserAvatar('');
      }
    });

    const savedDarkMode = localStorage.getItem('joylife_darkmode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) document.body.classList.add('dark-mode');

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Global Timer Logic ---
  useEffect(() => {
    if (timerIsActive && timerTimeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerTimeLeft === 0) {
      setTimerIsActive(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerIsActive, timerTimeLeft]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert(lang === 'bn' ? "রেজিস্ট্রেশন সফল! ইমেইল চেক করুন।" : "Signup successful! Check your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('joylife_darkmode', nextMode.toString());
    if (nextMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  };

  const filteredSuggestions = useMemo(() => {
    return searchQuery.trim() === '' 
      ? NAVIGATION_ITEMS 
      : NAVIGATION_ITEMS.filter(item => 
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredSuggestions.length > 0) {
      setActiveTab(filteredSuggestions[0].id);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (id: string) => {
    setActiveTab(id);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    if (!userId && !isGuest) return null;
    const effectiveUserId = userId || 'guest_user_id';
    
    switch (activeTab) {
      case 'dashboard': return <Dashboard lang={lang} userName={userName} userId={effectiveUserId} onNavigate={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />;
      case 'essentials': return <DailyEssentials lang={lang} userName={userName} />;
      case 'education': return <EducationCareer lang={lang} userName={userName} />;
      case 'entertainment': return <EntertainmentHobbies lang={lang} userName={userName} />;
      case 'health': return <LifestyleHealth lang={lang} userId={effectiveUserId} />;
      case 'worktimer': return (
        <WorkTimer 
          lang={lang} 
          userId={effectiveUserId} 
          globalState={{
            timeLeft: timerTimeLeft,
            totalTime: timerTotalTime,
            isActive: timerIsActive,
            mode: timerMode,
            setTimeLeft: setTimerTimeLeft,
            setTotalTime: setTimerTotalTime,
            setIsActive: setTimerIsActive,
            setMode: setTimerMode
          }} 
        />
      );
      case 'profwork': return <ProfessionalWork lang={lang} userId={effectiveUserId} />;
      case 'worklog': return <WorkLog lang={lang} userId={effectiveUserId} />;
      case 'stories': return <MotivationalStories lang={lang} onNavigate={setActiveTab} />;
      case 'diary': return <Diary userId={effectiveUserId} />;
      case 'tasks': return <Tasks userId={effectiveUserId} />;
      case 'expenses': return <Expenses lang={lang} userId={effectiveUserId} />;
      case 'goals': return <Goals userId={effectiveUserId} />;
      case 'study': return <StudyPlanner userId={effectiveUserId} />;
      case 'notes': return <Notes userId={effectiveUserId} />;
      case 'memories': return <MemoryGallery userId={effectiveUserId} />;
      default: return <Dashboard lang={lang} userName={userName} userId={effectiveUserId} onNavigate={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />;
    }
  };

  if (!isAuthenticated && !isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="bg-white dark:bg-[#0f172a] rounded-[40px] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex flex-col items-center mb-10">
                <div className="p-4 bg-indigo-600 rounded-[24px] text-white mb-6 shadow-xl shadow-indigo-500/20">
                  <Sparkles size={32} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center leading-none">Joy Daily Life</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Smart Life Dashboard</p>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl mb-8">
                <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${authMode === 'login' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                  <LogIn size={16} /> {t.log_in_title}
                </button>
                <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${authMode === 'signup' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                  <UserPlus size={16} /> {t.sign_up_title}
                </button>
              </div>

              <form onSubmit={handleAuthAction} className="space-y-4">
                <div className="relative">
                  <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white font-bold transition-all" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white font-bold transition-all" />
                </div>
                <button type="submit" disabled={authLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/10 transition-all disabled:opacity-50">
                  {authLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                  <span>{authMode === 'login' ? t.log_in_title : t.sign_up_title}</span>
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white dark:bg-[#0f172a] px-4 text-slate-400">OR</span></div>
              </div>

              <button onClick={() => setIsGuest(true)} className="w-full bg-slate-900 dark:bg-slate-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all">
                <Ghost size={20} />
                <span>{t.continue_as_guest}</span>
              </button>
            </div>
          </div>
          <p className="mt-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">{t.footer_copyright}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-[#020617] transition-colors duration-500">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800 transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md">
                <Sparkles size={18} />
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">JOY OS</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={20} /></button>
          </div>
          
          <nav className="flex-1 space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold'}`}>
                {item.icon}
                <span className="text-sm">{lang === 'bn' ? item.label : item.id.toUpperCase()}</span>
              </button>
            ))}
          </nav>

          <button onClick={async () => { if (isAuthenticated) await supabase.auth.signOut(); setIsGuest(false); setIsAuthenticated(false); }} className="mt-6 flex items-center gap-3 px-4 py-3 text-rose-500 font-black hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors">
            <LogOut size={20} /> <span className="text-xs uppercase tracking-widest">{t.sign_out}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 z-40 transition-colors">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-indigo-600"><Menu size={24}/></button>
            <div ref={searchRef} className="relative flex-1 max-w-sm flex items-center gap-2 group">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/20 flex-1 cursor-pointer" onClick={() => setShowSuggestions(true)}>
                <Search size={16} className="text-slate-400" />
                <form onSubmit={handleSearchSubmit} className="flex-1">
                  <input type="text" value={searchQuery} onFocus={() => setShowSuggestions(true)} onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }} placeholder="খুঁজুন..." className="bg-transparent border-none outline-none text-xs font-bold w-full text-slate-800 dark:text-white" />
                </form>
              </div>
              <a href="mailto:joybiswas01672@gmail.com?subject=Complaint/Idea" className="p-2.5 bg-slate-50 dark:bg-slate-800 text-indigo-600 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 transition-all"><MessageSquare size={18} /></a>
              {showSuggestions && (
                <div className="search-suggestion-list custom-scrollbar">
                  {filteredSuggestions.length > 0 ? filteredSuggestions.map((item) => (
                    <div key={item.id} onClick={() => handleSuggestionClick(item.id)} className="suggestion-item border-b border-slate-50 dark:border-slate-800 last:border-none">
                      <span className="text-indigo-500">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  )) : <div className="p-4 text-xs font-bold text-slate-400 italic text-center">কিছু পাওয়া যায়নি</div>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-indigo-600 border border-slate-100 dark:border-slate-700">
               {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
              <button onClick={() => !isGuest && setShowProfile(true)} className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm overflow-hidden transition-all ${isGuest ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:ring-4 hover:ring-indigo-500/10'}`}>
                {userAvatar ? <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" /> : userName.charAt(0)}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="p-6 lg:p-10 min-h-[calc(100vh-140px)]">
            {renderContent()}
          </div>

          {/* Floating Mini Timer UI */}
          {timerIsActive && activeTab !== 'worktimer' && (
            <div className="fixed bottom-24 right-6 z-[45] animate-in slide-in-from-right duration-500 pointer-events-auto">
              <div 
                className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-indigo-500/30 p-4 rounded-[28px] shadow-2xl flex items-center gap-4 group cursor-pointer hover:border-indigo-500 transition-all"
                onClick={() => setActiveTab('worktimer')}
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                    <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#4f46e5" strokeWidth="4" strokeDasharray="100 100" strokeDashoffset={100 - ((timerTotalTime - timerTimeLeft) / timerTotalTime * 100)} strokeLinecap="round" pathLength="100" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={14} className="text-indigo-600 fill-indigo-600" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{formatTime(timerTimeLeft)}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTimerIsActive(!timerIsActive); }} 
                      className="p-1.5 bg-indigo-600 text-white rounded-lg"
                    >
                      {timerIsActive ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                    </button>
                  </div>
                  <p className="text-[9px] font-black uppercase text-indigo-500 tracking-widest">{timerMode === 'focus' ? 'Focus Session' : 'Break Time'}</p>
                </div>
                <button 
                   onClick={(e) => { e.stopPropagation(); setTimerIsActive(false); setTimerTimeLeft(timerTotalTime); }}
                   className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
                <Maximize2 size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors ml-1" />
              </div>
            </div>
          )}

          <footer className="bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-slate-800 py-10 px-6 mt-10">
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md"><Sparkles size={16} /></div>
                <h2 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase">Joy Daily Life</h2>
              </div>
              <div className="flex items-center gap-6">
                <a href="https://facebook.com/share/1F146kFatT/" target="_blank" className="p-3 bg-slate-50 dark:bg-slate-800 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><Facebook size={20} /></a>
                <a href="https://instagram.com/joykumarbiswas" target="_blank" className="p-3 bg-slate-50 dark:bg-slate-800 text-pink-600 rounded-2xl hover:bg-pink-600 hover:text-white transition-all"><Instagram size={20} /></a>
                <a href="mailto:joybiswas01672@gmail.com" className="p-3 bg-slate-50 dark:bg-slate-800 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all"><Mail size={20} /></a>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.footer_copyright}</p>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter mt-1">Designed by Joy Kumar Biswas</p>
              </div>
            </div>
          </footer>
        </main>

        <FloatingAI lang={lang} userName={userName} forceOpen={isAiOpen} setForceOpen={setIsAiOpen} />
        {showProfile && userId && <Profile userId={userId} lang={lang} onClose={() => setShowProfile(false)} onProfileUpdate={(newName, newAvatar) => { setUserName(newName); setUserAvatar(newAvatar); }} />}
      </div>
    </div>
  );
};

export default App;
