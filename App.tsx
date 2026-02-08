
import React, { useState, useEffect } from 'react';
import { NAVIGATION_ITEMS } from './constants';
import Dashboard from './components/Dashboard';
import Diary from './components/Diary';
import Tasks from './components/Tasks';
import Expenses from './components/Expenses';
import HabitTracker from './components/HabitTracker';
import Goals from './components/Goals';
import StudyPlanner from './components/StudyPlanner';
import Notes from './components/Notes';
import MemoryGallery from './components/MemoryGallery';
import WorkLog from './components/WorkLog';
import MotivationalStories from './components/MotivationalStories';
import ProfessionalWork from './components/ProfessionalWork';
import FloatingAI from './components/FloatingAI';
import { translations, Language } from './translations';
import { supabase } from './services/supabase';
import { 
  Lock, LogOut, Menu, X, Sparkles, Mail, 
  ArrowRight, ShieldCheck, RefreshCw, 
  User, Palette, Loader2, Eye, EyeOff, Key
} from 'lucide-react';

type AppTheme = 'blue' | 'rose' | 'emerald' | 'dark';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>('bn');
  const [theme, setTheme] = useState<AppTheme>('blue');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  const t = translations[lang];

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState(['', '', '', '', '', '']);
  const [authStage, setAuthStage] = useState<'credentials' | 'verification'>('credentials');

  // Profile State
  const [userName, setUserName] = useState('ইউজার');

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkApiKey();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setUserName(session.user.email?.split('@')[0] || 'User');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setUserId(session.user.id);
        setUserName(session.user.email?.split('@')[0] || 'User');
      } else {
        setUserId(null);
      }
    });

    const savedLang = localStorage.getItem('joylife_lang') as Language;
    const savedTheme = localStorage.getItem('joylife_theme') as AppTheme;
    
    if (savedLang) setLang(savedLang);
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const changeTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('joylife_theme', newTheme);
    document.body.className = newTheme;
  };

  const handleLangToggle = () => {
    const newLang = lang === 'bn' ? 'en' : 'bn';
    setLang(newLang);
    localStorage.setItem('joylife_lang', newLang);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthLoading) return;
    
    if (!email.trim() || !password.trim()) {
      alert(lang === 'bn' ? "ইমেল এবং পাসওয়ার্ড দিন!" : "Please enter email and password!");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      alert(lang === 'bn' ? "পাসওয়ার্ড দুটি মেলেনি!" : "Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      alert(lang === 'bn' ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!" : "Password must be at least 6 characters!");
      return;
    }

    setIsAuthLoading(true);
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        if (data.session) {
          setIsAuthenticated(true);
          setUserId(data.session.user.id);
        } else if (data.user) {
          setAuthStage('verification');
          alert(lang === 'bn' ? "আপনার ইমেলে একটি ভেরিফিকেশন কোড পাঠানো হয়েছে।" : "A verification code has been sent to your email.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            await supabase.auth.resend({ type: 'signup', email });
            setAuthStage('verification');
          } else {
            throw error;
          }
        } else if (data.session) {
          setIsAuthenticated(true);
          setUserId(data.session.user.id);
        }
      }
    } catch (err: any) {
      alert(lang === 'bn' ? `ত্রুটি: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = verificationCodeInput.join('');
    if (token.length < 6) return;

    setIsAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: isSignUp ? 'signup' : 'email'
      });

      if (error) throw error;

      if (data.session) {
        setIsAuthenticated(true);
        setUserId(data.session.user.id);
        setAuthStage('credentials');
      }
    } catch (err: any) {
      alert(lang === 'bn' ? "ভেরিফিকেশন কোডটি সঠিক নয়!" : "Incorrect verification code!");
      setVerificationCodeInput(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserId(null);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated || !userId) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950' : 'bg-blue-50'} p-4 font-sans`}>
        <div className="bg-white/90 backdrop-blur-3xl rounded-[48px] shadow-2xl p-10 w-full max-w-lg animate-in fade-in zoom-in duration-500 border border-white/50 relative z-10">
          
          <div className="flex justify-between items-center mb-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Sparkles size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">Joy Daily Life</span>
             </div>
             <button onClick={handleLangToggle} className="text-[10px] font-black text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
               {lang === 'bn' ? 'English' : 'বাংলা'}
             </button>
          </div>

          {authStage === 'credentials' ? (
            <>
              <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
                  {isSignUp ? (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account') : (lang === 'bn' ? 'স্বাগতম' : 'Welcome Back')}
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  {isSignUp ? (lang === 'bn' ? 'আপনার তথ্য দিয়ে শুরু করুন' : 'Start your journey today') : (lang === 'bn' ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'Login to your account')}
                </p>
              </div>
              
              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joy@example.com"
                      className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-14 pr-14 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <ShieldCheck size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                        required
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isAuthLoading}
                  className="w-full py-5 rounded-2xl text-white font-black text-lg blue-btn shadow-2xl flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAuthLoading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      {isSignUp ? (lang === 'bn' ? 'সাইন আপ করুন' : 'Sign Up') : (lang === 'bn' ? 'লগইন করুন' : 'Login')}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <div className="text-center pt-4">
                  <button 
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setAuthStage('credentials'); }}
                    className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline underline-offset-4"
                  >
                    {isSignUp ? (lang === 'bn' ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Login') : (lang === 'bn' ? 'অ্যাকাউন্ট নেই? সাইন আপ করুন' : 'Don\'t have an account? Sign Up')}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center animate-in slide-in-from-right duration-500">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Mail size={40} />
              </div>
              <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">{t.verify_email}</h1>
              <p className="text-slate-400 mb-8 font-bold text-xs uppercase tracking-widest leading-relaxed">
                {lang === 'bn' ? 'আমরা আপনার ইমেলে একটি কোড পাঠিয়েছি:' : 'We sent a code to:'}<br/>
                <span className="text-blue-600 lowercase">{email}</span>
              </p>
              
              <div className="flex justify-center gap-2 mb-10">
                {verificationCodeInput.map((d, i) => (
                  <input key={i} id={`code-${i}`} type="text" maxLength={1} value={d} 
                    autoFocus={i === 0}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!/^\d*$/.test(val)) return;
                      const newCode = [...verificationCodeInput];
                      newCode[i] = val;
                      setVerificationCodeInput(newCode);
                      if (val && i < 5) document.getElementById(`code-${i+1}`)?.focus();
                      if (val && i === 5) {
                         const finalCode = newCode.join('');
                         if (finalCode.length === 6) setTimeout(() => handleVerify(), 100);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !verificationCodeInput[i] && i > 0) {
                        document.getElementById(`code-${i-1}`)?.focus();
                      }
                    }}
                    className="w-12 h-14 text-center text-2xl font-black bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => handleVerify()} 
                  disabled={isAuthLoading || verificationCodeInput.join('').length < 6}
                  className="w-full blue-btn text-white font-black py-5 rounded-2xl text-lg shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAuthLoading ? <Loader2 className="animate-spin" size={24} /> : t.verify_reg}
                </button>
                <div className="flex flex-col gap-2 pt-4">
                  <button onClick={handleAuth} className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 flex items-center justify-center gap-2">
                    <RefreshCw size={12}/> {t.resend_code}
                  </button>
                  <button onClick={() => { setAuthStage('credentials'); setIsSignUp(false); }} className="text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-slate-600">{t.cancel}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-blue-50/30 text-slate-900'} flex font-sans transition-colors duration-500`}>
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white/80 border-blue-50 backdrop-blur-xl'} border-r transform transition-all duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl rotate-3"><Sparkles size={28}/></div>
            <div>
              <h1 className={`text-2xl font-black leading-none tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t.app_name}</h1>
              <p className="text-[10px] text-blue-500/60 font-black uppercase tracking-[0.2em] mt-2">{t.personal_os}</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {NAVIGATION_ITEMS.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 ${activeTab === item.id ? `blue-btn text-white font-black shadow-xl` : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600 font-bold'}`}>
                <span>{item.icon}</span>
                <span className="text-sm tracking-tight">{lang === 'bn' ? item.label : item.id.toUpperCase()}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
             <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-[20px] font-black transition-all">
               <LogOut size={20} /> <span className="text-sm">{t.sign_out}</span>
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative custom-scrollbar">
        <header className={`sticky top-0 z-30 w-full h-24 ${theme === 'dark' ? 'bg-slate-950/80' : 'bg-white/60'} backdrop-blur-2xl border-b ${theme === 'dark' ? 'border-slate-800' : 'border-blue-50'} px-8 lg:px-12 flex items-center justify-between`}>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 lg:hidden text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="hidden md:block text-[11px] font-black uppercase tracking-[0.3em] text-blue-500/50">
              {NAVIGATION_ITEMS.find(i => i.id === activeTab)?.label || 'JOY LIFE'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {!hasApiKey && (
               <button onClick={handleSelectKey} className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm border border-amber-200 animate-pulse">
                 <Key size={14} /> <span>API কী সিলেক্ট করুন</span>
               </button>
             )}
             <div className="flex gap-1 bg-white p-1 rounded-xl border border-blue-50">
                {(['blue', 'rose', 'emerald', 'dark'] as AppTheme[]).map(th => (
                  <button key={th} onClick={() => changeTheme(th)} className={`w-6 h-6 rounded-lg ${th === 'blue' ? 'bg-blue-500' : th === 'rose' ? 'bg-rose-500' : th === 'emerald' ? 'bg-emerald-500' : 'bg-slate-800'} ${theme === th ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`} />
                ))}
             </div>
            
            <button onClick={handleLangToggle} className="flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black border bg-blue-50 border-blue-100 text-blue-600">
              <User size={16} /> <span>{lang === 'bn' ? 'EN' : 'BN'}</span>
            </button>

            <div className="flex items-center gap-4 pl-4 border-l border-blue-50">
              <div className="hidden md:block text-right">
                <p className="text-sm font-black text-slate-900">{userName}</p>
                <p className="text-[10px] font-black text-blue-500/50 uppercase">Active Now</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <User size={24} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-7xl mx-auto pb-24">
            {(() => {
              const props = { lang, userName, userId };
              switch (activeTab) {
                case 'dashboard': return <Dashboard {...props} />;
                case 'profwork': return <ProfessionalWork {...props} />;
                case 'worklog': return <WorkLog {...props} />;
                case 'stories': return <MotivationalStories lang={lang} onNavigate={setActiveTab} />;
                case 'diary': return <Diary userId={userId} />;
                case 'tasks': return <Tasks userId={userId} />;
                case 'expenses': return <Expenses {...props} />;
                case 'habits': return <HabitTracker userId={userId} />;
                case 'goals': return <Goals userId={userId} />;
                case 'study': return <StudyPlanner userId={userId} />;
                case 'notes': return <Notes userId={userId} />;
                case 'memories': return <MemoryGallery userId={userId} />;
                default: return <Dashboard {...props} />;
              }
            })()}
          </div>
        </div>
      </main>

      {/* Global Floating AI Assistant */}
      <FloatingAI lang={lang} userName={userName} />
    </div>
  );
};

export default App;
