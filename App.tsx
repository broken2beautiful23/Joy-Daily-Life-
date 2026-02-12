
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { translations, Language } from './translations';
import { supabase } from './services/supabase';
import { 
  Lock, LogOut, Menu, X, Sparkles, Mail, 
  ArrowRight, Search, Sun, Moon, 
  Loader2, User
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>('bn');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('ইউজার');
  const [isAiOpen, setIsAiOpen] = useState(false);
  
  const t = translations[lang] || translations['bn'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setUserName(session.user.email?.split('@')[0] || 'User');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setUserId(session.user.id);
        setUserName(session.user.email?.split('@')[0] || 'User');
      }
    });

    const savedDarkMode = localStorage.getItem('joylife_darkmode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) document.body.classList.add('dark-mode');

    return () => authListener.subscription.unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('joylife_darkmode', nextMode.toString());
    if (nextMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  };

  const renderContent = () => {
    if (!userId) return null;
    const components: Record<string, React.ReactElement> = {
      dashboard: <Dashboard lang={lang} userName={userName} userId={userId} onNavigate={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />,
      essentials: <DailyEssentials lang={lang} userName={userName} />,
      education: <EducationCareer lang={lang} userName={userName} />,
      entertainment: <EntertainmentHobbies lang={lang} userName={userName} />,
      health: <LifestyleHealth lang={lang} userId={userId} />,
      worktimer: <WorkTimer lang={lang} userId={userId} />,
      profwork: <ProfessionalWork lang={lang} userId={userId} />,
      worklog: <WorkLog lang={lang} userId={userId} />,
      stories: <MotivationalStories lang={lang} onNavigate={setActiveTab} />,
      diary: <Diary userId={userId} />,
      tasks: <Tasks userId={userId} />,
      expenses: <Expenses lang={lang} userId={userId} />,
      goals: <Goals userId={userId} />,
      study: <StudyPlanner userId={userId} />,
      notes: <Notes userId={userId} />,
      memories: <MemoryGallery userId={userId} />,
    };
    return components[activeTab] || components.dashboard;
  };

  if (!isAuthenticated && !isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[32px] p-8 w-full max-w-sm shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-indigo-600 rounded-2xl text-white mb-4">
              <Sparkles size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">JOY OS</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Your Daily Assistant</p>
          </div>

          <div className="space-y-4">
            <button onClick={() => setIsGuest(true)} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform">
              গেস্ট হিসেবে প্রবেশ করুন <ArrowRight size={18} />
            </button>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300"><span className="bg-white px-4">OR</span></div>
            </div>
            <button className="w-full py-4 bg-slate-50 text-slate-600 font-black rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
              অ্যাকাউন্টে লগইন করুন
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -320 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-card lg:translate-x-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg">
                <Sparkles size={20} />
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">JOY OS</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white font-black shadow-lg translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 font-bold'}`}
              >
                {item.icon}
                <span className="text-sm">{lang === 'bn' ? item.label : item.id.toUpperCase()}</span>
              </button>
            ))}
          </nav>

          <button onClick={() => { setIsGuest(false); setIsAuthenticated(false); }} className="mt-6 flex items-center gap-3 px-4 py-3.5 text-rose-500 font-black hover:bg-rose-50 rounded-2xl transition-all">
            <LogOut size={20} /> <span className="text-xs uppercase tracking-widest">বেরিয়ে যান</span>
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 glass-border-b flex items-center justify-between px-4 lg:px-10 z-40 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 bg-white border border-slate-100 rounded-xl text-indigo-600 shadow-sm">
              <Menu size={20}/>
            </button>
            
            {/* Optimized Search Bar for Mobile */}
            <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-2 rounded-2xl border border-slate-200/50 flex-1 max-w-[200px] sm:max-w-xs transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
               <Search size={16} className="text-slate-400 shrink-0" />
               <input type="text" placeholder="খুঁজুন..." className="bg-transparent border-none outline-none text-xs font-bold w-full text-slate-800" />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <button onClick={toggleDarkMode} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-indigo-600 shadow-sm active:scale-90">
               {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-black text-slate-900 leading-none">{userName}</p>
                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Online</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <FloatingAI 
          lang={lang} 
          userName={userName} 
          forceOpen={isAiOpen} 
          setForceOpen={setIsAiOpen} 
        />
      </div>
    </div>
  );
};

export default App;
