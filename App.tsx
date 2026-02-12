
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
  Sun, Moon, Facebook, Instagram, Twitter, Github, Heart
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>('bn');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('ইউজার');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const t = translations[lang] || translations['bn'];

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState(['', '', '', '', '', '']);
  const [authStage, setAuthStage] = useState<'credentials' | 'verification'>('credentials');

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setUserName(session.user.email?.split('@')[0] || 'User');
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setUserId(session.user.id);
        setUserName(session.user.email?.split('@')[0] || 'User');
      } else {
        setUserId(null);
      }
    });

    const savedLang = localStorage.getItem('joylife_lang') as Language;
    if (savedLang) setLang(savedLang);

    const savedDarkMode = localStorage.getItem('joylife_darkmode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) document.body.classList.add('dark-mode');
  }, []);

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
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAuthLoading(false);
    }
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
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card rounded-[40px] p-8 md:p-12 w-full max-w-md animate-in fade-in zoom-in duration-500 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={24} />
                <span className="font-black text-xs uppercase tracking-widest text-indigo-600">Joy Daily Life</span>
             </div>
             <button onClick={handleLangToggle} className="text-[10px] font-black uppercase text-slate-400 border border-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-50">
               {lang === 'bn' ? 'English' : 'বাংলা'}
             </button>
          </div>

          {authStage === 'credentials' ? (
            <>
              <h1 className="text-3xl font-black mb-2 tracking-tighter">
                {isSignUp ? (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি' : 'Create Account') : (lang === 'bn' ? 'স্বাগতম' : 'Welcome')}
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">আপনার নিত্যদিনের বন্ধু</p>
              
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl outline-none font-bold" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button type="submit" disabled={isAuthLoading} className="w-full blue-btn text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg">
                  {isAuthLoading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? 'Sign Up' : 'Login')} <ArrowRight size={18} />
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">
                  {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center animate-in slide-in-from-right duration-500">
              <h1 className="text-3xl font-black mb-2 tracking-tighter">{t.verify_email}</h1>
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
                    className="w-10 h-12 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl" 
                  />
                ))}
              </div>
              <button onClick={handleVerify} disabled={isAuthLoading} className="w-full blue-btn text-white font-black py-4 rounded-2xl mb-4">
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
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 glass-card border-r border-slate-100 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl rotate-3">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">JoyLife OS</h1>
          </div>
          
          <nav className="flex-1 space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'blue-btn text-white font-black' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600 font-bold'}`}>
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
        <header className="sticky top-0 z-30 h-24 glass-card border-b px-8 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-indigo-600"><Menu size={24}/></button>
            <div className="hidden md:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
               <Search size={16} className="text-slate-400" />
               <input type="text" placeholder={lang === 'bn' ? "খুঁজুন..." : "Search..."} className="bg-transparent border-none outline-none text-xs font-bold w-40" />
               <Command size={14} className="text-slate-300" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:scale-110 transition-all text-indigo-600">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={handleLangToggle} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">
               {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none">{userName}</p>
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active Now</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                 {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 lg:p-12">
           <div className="max-w-7xl mx-auto pb-20">
              {(() => {
                const props = { lang, userName, userId: userId || '' };
                switch (activeTab) {
                  case 'dashboard': return <Dashboard {...props} />;
                  case 'essentials': return <DailyEssentials {...props} />;
                  case 'education': return <EducationCareer {...props} />;
                  case 'entertainment': return <EntertainmentHobbies {...props} />;
                  case 'health': return <LifestyleHealth {...props} />;
                  case 'worktimer': return <WorkTimer {...props} />;
                  case 'profwork': return <ProfessionalWork {...props} />;
                  case 'worklog': return <WorkLog {...props} />;
                  case 'habits': return <HabitTracker userId={userId || ''} />;
                  case 'stories': return <MotivationalStories lang={lang} onNavigate={setActiveTab} />;
                  case 'diary': return <Diary userId={userId || ''} />;
                  case 'tasks': return <Tasks userId={userId || ''} />;
                  case 'expenses': return <Expenses {...props} />;
                  case 'goals': return <Goals userId={userId || ''} />;
                  case 'study': return <StudyPlanner userId={userId || ''} />;
                  case 'notes': return <Notes userId={userId || ''} />;
                  case 'memories': return <MemoryGallery userId={userId || ''} />;
                  default: return <Dashboard {...props} />;
                }
              })()}
           </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-auto py-12 px-8 glass-card border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
               <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg"><Sparkles size={20}/></div>
                 <h3 className="text-2xl font-black tracking-tight text-slate-900">Joy Daily Life</h3>
               </div>
               <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm font-medium leading-relaxed">
                 {lang === 'bn' 
                   ? 'আপনার দৈনন্দিন জীবনকে সহজ, গতিশীল এবং আনন্দময় করতে আমরা বদ্ধপরিকর। উন্নত প্রযুক্তি এবং আর্টিফিশিয়াল ইন্টেলিজেন্সের সমন্বয়ে জয়লাইফ ওএস আপনার ব্যক্তিগত ডিজিটাল সহকারী।' 
                   : 'We are committed to making your daily life simple, dynamic, and joyful. Combining advanced technology and AI, JoyLife OS is your personal digital assistant.'}
               </p>
               <div className="flex gap-4">
                 {[Facebook, Instagram, Twitter, Github].map((Icon, i) => (
                   <button key={i} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:text-indigo-600 hover:scale-110 transition-all">
                     <Icon size={18} />
                   </button>
                 ))}
               </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">রিসোর্সসমূহ</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                {['ড্যাশবোর্ড', 'শিক্ষা ও ক্যারিয়ার', 'লাইফস্টাইল', 'মোটিভেশন'].map(l => (
                  <li key={l} className="hover:text-indigo-600 cursor-pointer transition-colors">{l}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">যোগাযোগ</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2"><Mail size={16}/> hello@joylife.os</li>
                <li className="flex items-center gap-2 italic">Made with <Heart size={14} className="text-rose-500 fill-rose-500" /> by Joy Kumar</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© ২০২৫ জয়লাইফ ওএস। সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <span className="cursor-pointer hover:text-indigo-600">প্রাইভেসি পলিসি</span>
               <span className="cursor-pointer hover:text-indigo-600">টার্মস অব সার্ভিস</span>
            </div>
          </div>
        </footer>

        {/* AI Assistant */}
        <FloatingAI lang={lang} userName={userName} />
      </main>
    </div>
  );
};

export default App;
