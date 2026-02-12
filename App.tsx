
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
import { translations, Language } from './translations';
import { supabase } from './services/supabase';
import { 
  Lock, LogOut, Menu, X, Sparkles, Mail, 
  ArrowRight, ShieldCheck, RefreshCw, 
  User, Loader2, Eye, EyeOff, Flame, Sun, Search, Command
} from 'lucide-react';

type AppTheme = 'blue' | 'rose' | 'emerald' | 'dark' | 'naruto' | 'motivational';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>('bn');
  const [theme, setTheme] = useState<AppTheme>('blue');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

    // Close search dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const filteredSearchItems = NAVIGATION_ITEMS.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' || theme === 'naruto' ? 'bg-slate-950' : theme === 'motivational' ? 'bg-[#fffcf0]' : 'bg-blue-50'} p-4 font-sans`}>
        <div className="bg-white/90 backdrop-blur-3xl rounded-[48px] shadow-2xl p-10 w-full max-w-lg animate-in fade-in zoom-in duration-500 border border-white/50 relative z-10">
          
          <div className="flex justify-between items-center mb-10">
             <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${theme === 'motivational' ? 'bg-amber-500' : 'bg-blue-600'}`}>
                  {theme === 'motivational' ? <Sun size={20} /> : <Sparkles size={20} />}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${theme === 'motivational' ? 'text-amber-600' : 'text-blue-600'}`}>Joy Daily Life</span>
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
                    <Mail size={18} className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:${theme === 'motivational' ? 'text-amber-500' : 'text-blue-500'}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joy@example.com"
                      className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-opacity-10 outline-none transition-all font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="relative group">
                    <Lock size={18} className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:${theme === 'motivational' ? 'text-amber-500' : 'text-blue-500'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-14 pr-14 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-opacity-10 outline-none transition-all font-bold"
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
                      <ShieldCheck size={18} className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:${theme === 'motivational' ? 'text-amber-500' : 'text-blue-500'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-4 outline-none transition-all font-bold"
                        required
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isAuthLoading}
                  className={`w-full py-5 rounded-2xl text-white font-black text-lg blue-btn shadow-2xl flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed`}
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
                    className={`text-xs font-black uppercase tracking-widest hover:underline underline-offset-4 ${theme === 'motivational' ? 'text-amber-600' : 'text-blue-600'}`}
                  >
                    {isSignUp ? (lang === 'bn' ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Login') : (lang === 'bn' ? 'অ্যাকাউন্ট নেই? সাইন আপ করুন' : 'Don\'t have an account? Sign Up')}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center animate-in slide-in-from-right duration-500">
              <div className={`w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ${theme === 'motivational' ? 'bg-amber-50 text-amber-600' : ''}`}>
                <Mail size={40} />
              </div>
              <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">{t.verify_email}</h1>
              <p className="text-slate-400 mb-8 font-bold text-xs uppercase tracking-widest leading-relaxed">
                {lang === 'bn' ? 'আমরা আপনার ইমেলে একটি কোড পাঠিয়েছি:' : 'We sent a code to:'}<br/>
                <span className={`lowercase ${theme === 'motivational' ? 'text-amber-600' : 'text-blue-600'}`}>{email}</span>
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
                    className="w-12 h-14 text-center text-2xl font-black bg-white border border-slate-200 rounded-xl focus:ring-4 outline-none transition-all"
                    style={{ focusRingColor: theme === 'motivational' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)' } as any}
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
                  <button onClick={handleAuth} className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${theme === 'motivational' ? 'text-amber-500' : 'text-blue-500'}`}>
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
    <div className={`min-h-screen transition-all duration-700 ${theme === 'dark' || theme === 'naruto' ? 'bg-slate-950 text-slate-100' : theme === 'motivational' ? 'bg-[#fffcf0] text-[#451a03]' : 'bg-blue-50/30 text-slate-900'} flex font-sans`}>
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 transform transition-all duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${theme === 'dark' || theme === 'naruto' ? 'bg-slate-900 border-slate-800' : theme === 'motivational' ? 'bg-white/80 border-amber-50 backdrop-blur-xl shadow-2xl' : 'bg-white/80 border-blue-50 backdrop-blur-xl'} border-r`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className={`p-3 rounded-2xl text-white shadow-xl rotate-3 transition-all ${theme === 'naruto' ? 'bg-orange-600' : theme === 'motivational' ? 'bg-amber-500' : 'bg-blue-600'}`}>
              {theme === 'motivational' ? <Sun size={28} /> : theme === 'naruto' ? <Flame size={28} /> : <Sparkles size={28}/>}
            </div>
            <div>
              <h1 className={`text-2xl font-black leading-none tracking-tight transition-colors ${theme === 'dark' || theme === 'naruto' ? 'text-white' : 'text-slate-900'}`}>{t.app_name}</h1>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 transition-colors ${theme === 'naruto' ? 'text-orange-500' : theme === 'motivational' ? 'text-amber-600' : 'text-blue-500/60'}`}>{t.personal_os}</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {NAVIGATION_ITEMS.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 ${activeTab === item.id ? `blue-btn text-white font-black shadow-xl` : `${theme === 'motivational' ? 'text-amber-900/40 hover:text-amber-600 hover:bg-amber-50' : theme === 'naruto' ? 'text-orange-200/40 hover:text-orange-500 hover:bg-orange-500/5' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'} font-bold`}`}>
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
        <header className={`sticky top-0 z-30 w-full h-24 backdrop-blur-2xl border-b px-8 lg:px-12 flex items-center justify-between transition-all ${theme === 'dark' || theme === 'naruto' ? 'bg-slate-950/80 border-slate-800' : theme === 'motivational' ? 'bg-white/60 border-amber-50' : 'bg-white/60 border-blue-50'}`}>
          <div className="flex items-center gap-6 flex-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-3 lg:hidden rounded-2xl transition-all ${theme === 'naruto' ? 'text-orange-500 hover:bg-orange-500/10' : theme === 'motivational' ? 'text-amber-600 hover:bg-amber-50' : 'text-blue-600 hover:bg-blue-50'}`}>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* SEARCH BAR */}
            <div ref={searchRef} className="relative hidden sm:block w-full max-w-md ml-4">
               <div className="relative group">
                 <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-blue-600' : 'text-slate-400'}`} size={18} />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onFocus={() => setIsSearchFocused(true)}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder={lang === 'bn' ? "কি খুঁজছেন? ফিচারের নাম লিখুন..." : "What are you looking for? Search features..."}
                   className={`w-full pl-14 pr-12 py-3.5 bg-slate-50/50 border border-transparent rounded-2xl font-bold text-sm outline-none transition-all ${isSearchFocused ? 'bg-white border-blue-200 ring-4 ring-blue-500/5' : 'hover:bg-slate-100/50'}`}
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 pointer-events-none">
                    <Command size={14} />
                    <span className="text-[10px] font-black">K</span>
                 </div>
               </div>

               {isSearchFocused && (
                 <div className="absolute top-full left-0 w-full mt-3 bg-white/95 backdrop-blur-3xl rounded-3xl border border-blue-50 shadow-2xl shadow-blue-500/10 p-2 overflow-hidden animate-in slide-in-from-top-2 duration-300 z-50">
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {filteredSearchItems.length > 0 ? filteredSearchItems.map((item) => (
                        <button 
                          key={item.id} 
                          onClick={() => { setActiveTab(item.id); setIsSearchFocused(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 transition-all text-left group"
                        >
                          <div className={`p-2 rounded-xl transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-blue-600 shadow-inner'}`}>
                            {item.icon}
                          </div>
                          <div>
                            <p className={`font-black text-sm ${activeTab === item.id ? 'text-blue-600' : 'text-slate-800'}`}>
                              {lang === 'bn' ? item.label : item.id.toUpperCase()}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-70">
                              {lang === 'bn' ? 'সরাসরি যাওয়ার জন্য ক্লিক করুন' : 'Click to navigate'}
                            </p>
                          </div>
                        </button>
                      )) : (
                        <div className="p-10 text-center">
                           <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                              <Search className="text-slate-300" size={32} />
                           </div>
                           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">
                              {lang === 'bn' ? 'দুঃখিত, কোনো ফিচার খুঁজে পাওয়া যায়নি' : 'Sorry, no features found'}
                           </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 p-4 bg-slate-50/50 rounded-2xl border-t border-slate-50 flex items-center justify-between">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Sparkles size={12} className="text-blue-500" /> কুইক টিপ: যেকোনো ফিচারের নাম লিখুন
                       </p>
                       <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest">Joy Life Smart Search</span>
                    </div>
                 </div>
               )}
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                {(['blue', 'rose', 'emerald', 'dark', 'naruto', 'motivational'] as AppTheme[]).map(th => (
                  <button 
                    key={th} 
                    onClick={() => changeTheme(th)} 
                    title={t[`theme_${th}` as keyof typeof t] as string}
                    className={`w-6 h-6 rounded-lg transition-all ${
                      th === 'blue' ? 'bg-blue-500' : 
                      th === 'rose' ? 'bg-rose-500' : 
                      th === 'emerald' ? 'bg-emerald-500' : 
                      th === 'dark' ? 'bg-slate-800' : 
                      th === 'naruto' ? 'bg-orange-600' :
                      'bg-amber-400'
                    } ${theme === th ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : 'opacity-40 hover:opacity-100'}`} 
                  />
                ))}
             </div>
            
            <button onClick={handleLangToggle} className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black border transition-all ${theme === 'motivational' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              <User size={16} /> <span>{lang === 'bn' ? 'EN' : 'BN'}</span>
            </button>

            <div className={`hidden sm:flex items-center gap-4 pl-4 border-l transition-all ${theme === 'dark' || theme === 'naruto' ? 'border-slate-800' : theme === 'motivational' ? 'border-amber-50' : 'border-blue-50'}`}>
              <div className="hidden md:block text-right">
                <p className={`text-sm font-black transition-colors ${theme === 'dark' || theme === 'naruto' ? 'text-white' : 'text-slate-900'}`}>{userName}</p>
                <p className={`text-[10px] font-black uppercase transition-colors ${theme === 'naruto' ? 'text-orange-500/50' : theme === 'motivational' ? 'text-amber-500/50' : 'text-blue-500/50'}`}>Active Now</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-all ${theme === 'naruto' ? 'bg-orange-600' : theme === 'motivational' ? 'bg-amber-500' : 'bg-blue-600'}`}>
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
                case 'health': return <LifestyleHealth {...props} />;
                case 'worktimer': return <WorkTimer {...props} />;
                case 'profwork': return <ProfessionalWork {...props} />;
                case 'worklog': return <WorkLog {...props} />;
                case 'stories': return <MotivationalStories lang={lang} onNavigate={setActiveTab} />;
                case 'diary': return <Diary userId={userId} />;
                case 'tasks': return <Tasks userId={userId} />;
                case 'expenses': return <Expenses {...props} />;
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
    </div>
  );
};

export default App;
