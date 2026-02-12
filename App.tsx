
import React, { useState, useEffect, useRef } from 'react';
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
import HabitTracker from './components/HabitTracker';
import { translations, Language } from './translations';
import { supabase } from './services/supabase';
import { 
  Lock, LogOut, Menu, X, Sparkles, Mail, 
  ArrowRight, RefreshCw, 
  User, Loader2, Eye, EyeOff, Search, Command,
  Sun, Moon, UserCheck, AlertCircle
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

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState(['', '', '', '', '', '']);
  const [authStage, setAuthStage] = useState<'credentials' | 'verification'>('credentials');

  useEffect(() => {
    // Check if was in guest mode
    const guestId = localStorage.getItem('joylife_guest_id');
    if (guestId && !isAuthenticated) {
      setIsGuest(true);
      setUserId(guestId);
      setUserName(lang === 'bn' ? 'মেহমান (Guest)' : 'Guest User');
    }

    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setIsGuest(false);
        setUserId(session.user.id);
        setUserName(session.user.email?.split('@')[0] || 'User');
      }
    }).catch(err => console.error("Supabase Session Error:", err));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setIsGuest(false);
        setUserId(session.user.id);
        setUserName(session.user.email?.split('@')[0] || 'User');
      } else if (!localStorage.getItem('joylife_guest_id')) {
        setUserId(null);
      }
    });

    const savedLang = localStorage.getItem('joylife_lang') as Language;
    if (savedLang) setLang(savedLang);

    const savedDarkMode = localStorage.getItem('joylife_darkmode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) document.body.classList.add('dark-mode');

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [lang]);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('joylife_darkmode', nextMode.toString());
    if (nextMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  };

  const handleLangToggle = () => {
    const newLang = lang === 'bn' ? 'en' : 'bn';
    setLang(newLang);
    localStorage.setItem('joylife_lang', newLang);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthLoading) return;
    setIsAuthLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          setAuthStage('verification');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        localStorage.removeItem('joylife_guest_id'); // Clear guest status on real login
      }
    } catch (err: any) {
      alert(err.message || "অ্যাক্সেস করতে সমস্যা হচ্ছে।");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGuestEntry = () => {
    let guestId = localStorage.getItem('joylife_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('joylife_guest_id', guestId);
    }
    setIsGuest(true);
    setUserId(guestId);
    setUserName(lang === 'bn' ? 'মেহমান (Guest)' : 'Guest User');
  };

  const handleVerify = async () => {
    const token = verificationCodeInput.join('');
    if (token.length < 6) return;
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });
      if (error) throw error;
      setAuthStage('credentials');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isGuest) {
      if (window.confirm(lang === 'bn' ? 'গেস্ট মোড থেকে বের হলে আপনার সাময়িক ডাটা হারিয়ে যেতে পারে। আপনি কি নিশ্চিত?' : 'Exiting guest mode may lose your temporary data. Are you sure?')) {
        setIsGuest(false);
        setUserId(null);
        localStorage.removeItem('joylife_guest_id');
      }
    } else {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
    }
    setActiveTab('dashboard');
  };

  // Helper to render the correct view
  const renderContent = () => {
    if (!userId) return null;
    switch (activeTab) {
      case 'dashboard': return <Dashboard lang={lang} userName={userName} userId={userId} onNavigate={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />;
      case 'essentials': return <DailyEssentials lang={lang} userName={userName} />;
      case 'education': return <EducationCareer lang={lang} userName={userName} />;
      case 'entertainment': return <EntertainmentHobbies lang={lang} userName={userName} />;
      case 'health': return <LifestyleHealth lang={lang} userId={userId} />;
      case 'worktimer': return <WorkTimer lang={lang} userId={userId} />;
      case 'profwork': return <ProfessionalWork lang={lang} userId={userId} />;
      case 'worklog': return <WorkLog lang={lang} userId={userId} />;
      case 'stories': return <MotivationalStories lang={lang} onNavigate={setActiveTab} />;
      case 'diary': return <Diary userId={userId} />;
      case 'tasks': return <Tasks userId={userId} />;
      case 'expenses': return <Expenses lang={lang} userId={userId} />;
      case 'goals': return <Goals userId={userId} />;
      case 'study': return <StudyPlanner userId={userId} />;
      case 'notes': return <Notes userId={userId} />;
      case 'memories': return <MemoryGallery userId={userId} />;
      default: return <Dashboard lang={lang} userName={userName} userId={userId} onNavigate={setActiveTab} onOpenAi={() => setIsAiOpen(true)} />;
    }
  };

  if (!isAuthenticated && !isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="glass-card rounded-[40px] p-8 md:p-12 w-full max-w-md animate-in fade-in zoom-in duration-500 shadow-2xl bg-white">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={24} />
                <span className="font-black text-xs uppercase tracking-widest text-indigo-600">Joy Kumar Biswas</span>
             </div>
             <button onClick={handleLangToggle} className="text-[10px] font-black uppercase text-slate-400 border border-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-50">
               {lang === 'bn' ? 'English' : 'বাংলা'}
             </button>
          </div>

          {authStage === 'credentials' ? (
            <>
              <h1 className="text-3xl font-black mb-2 tracking-tighter text-slate-900">
                {isSignUp ? (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি' : 'Create Account') : (lang === 'bn' ? 'স্বাগতম' : 'Welcome')}
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">আপনার নিত্যদিনের বন্ধু</p>
              
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button type="submit" disabled={isAuthLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all">
                  {isAuthLoading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? 'Sign Up' : 'Login')} <ArrowRight size={18} />
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300"><span className="bg-white px-4">OR</span></div>
              </div>

              <button 
                onClick={handleGuestEntry}
                className="w-full py-4 bg-slate-50 text-slate-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
              >
                <UserCheck size={18} />
                {t.continue_as_guest}
              </button>

              <div className="mt-6 text-center">
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">
                  {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center animate-in slide-in-from-right duration-500">
              <h1 className="text-3xl font-black mb-2 tracking-tighter text-slate-900">{t.verify_email}</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">ইমেলে পাঠানো ৬ সংখ্যার কোড দিন</p>
              <div className="flex gap-2 justify-center mb-8">
                {verificationCodeInput.map((val, i) => (
                  <input key={i} id={`code-${i}`} type="text" maxLength={1} value={val} 
                    onChange={(e) => {
                      const newCode = [...verificationCodeInput];
                      newCode[i] = e.target.value.slice(-1);
                      setVerificationCodeInput(newCode);
                      if (e.target.value && i < 5) document.getElementById(`code-${i+1}`)?.focus();
                    }}
                    className="w-10 h-12 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-800" 
                  />
                ))}
              </div>
              <button onClick={handleVerify} disabled={isAuthLoading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl mb-4">
                {isAuthLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : t.verify_reg}
              </button>
              <button onClick={() => setAuthStage('credentials')} className="text-[10px] font-black uppercase text-slate-400">{t.cancel}</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 glass-card border-r border-slate-100 bg-white ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl rotate-3">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Joy Kumar Biswas</h1>
          </div>

          {isGuest && (
            <div className="mb-8 p-5 bg-indigo-50 border border-indigo-100 rounded-[24px] space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <AlertCircle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.guest_mode_active}</span>
              </div>
              <p className="text-[9px] font-bold text-indigo-400 leading-relaxed uppercase tracking-tighter">
                {t.signup_to_save}
              </p>
              <button 
                onClick={() => { setIsGuest(false); setIsSignUp(true); }}
                className="w-full py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-md"
              >
                {t.sign_up_title}
              </button>
            </div>
          )}
          
          <nav className="flex-1 space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600 font-bold'}`}>
                {item.icon}
                <span className="text-sm tracking-tight">{lang === 'bn' ? item.label : item.id.toUpperCase()}</span>
              </button>
            ))}
          </nav>

          <button onClick={handleLogout} className="mt-8 flex items-center gap-3 px-6 py-4 text-rose-500 font-black hover:bg-rose-50 rounded-2xl transition-all">
            <LogOut size={20} /> <span className="text-sm uppercase tracking-widest">{t.sign_out}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative custom-scrollbar">
        <header className="sticky top-0 z-30 h-24 glass-card border-b px-4 sm:px-8 flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Menu size={24}/></button>
            
            {/* Search Bar - Responsive for Mobile */}
            <div className="flex items-center gap-2 bg-slate-100/50 px-3 sm:px-4 py-2 rounded-2xl border border-slate-100 flex-1 max-w-[140px] sm:max-w-[240px] md:max-w-[300px]">
               <Search size={16} className="text-slate-400 shrink-0" />
               <input 
                 type="text" 
                 placeholder={lang === 'bn' ? "খুঁজুন..." : "Search..."} 
                 className="bg-transparent border-none outline-none text-[10px] sm:text-xs font-bold w-full text-slate-800 placeholder:text-slate-400" 
               />
               <div className="hidden sm:block">
                 <Command size={14} className="text-slate-300" />
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-2">
            <button onClick={toggleDarkMode} className="p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:scale-110 transition-all text-indigo-600">
               {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLangToggle} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 text-slate-800">
               {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none">{userName}</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${isGuest ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {isGuest ? 'Guest Mode' : 'Active Now'}
                </p>
              </div>
              <div className={`w-9 h-9 sm:w-10 sm:h-10 ${isGuest ? 'bg-amber-500' : 'bg-indigo-600'} rounded-xl flex items-center justify-center text-white font-black uppercase shadow-lg text-sm`}>
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-8">
          {renderContent()}
        </div>

        <FloatingAI 
          lang={lang} 
          userName={userName} 
          forceOpen={isAiOpen} 
          setForceOpen={setIsAiOpen} 
        />
      </main>
    </div>
  );
};

export default App;
