
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { translations, Language } from '../translations';
import { 
  User, Mail, Phone, Lock, Camera, 
  Save, X, Loader2, CheckCircle, Info
} from 'lucide-react';

interface ProfileProps {
  userId: string;
  lang: Language;
  onClose: () => void;
  onProfileUpdate: (newName: string, newAvatar: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ userId, lang, onClose, onProfileUpdate }) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passUpdating, setPassUpdating] = useState(false);
  
  // Profile States
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Security States
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFullName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
        setBio(user.user_metadata?.bio || '');
        setPhone(user.user_metadata?.phone || '');
        setAvatarUrl(user.user_metadata?.avatar_url || '');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName, 
          bio: bio, 
          phone: phone,
          avatar_url: avatarUrl
        }
      });

      if (error) throw error;
      onProfileUpdate(fullName, avatarUrl);
      alert(t.update_success);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setPassUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      alert(t.password_updated);
      setNewPassword('');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setPassUpdating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Profile Sidebar */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-[#0f172a] shadow-2xl overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-300">
        <div className="p-8 pb-32">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.profile_settings}</h2>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[32px] overflow-hidden bg-indigo-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-indigo-600">
                    <User size={60} />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                <Camera size={20} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.change_photo}</p>
          </div>

          {/* Form */}
          <div className="space-y-10">
            {/* Personal Info */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Info size={18} className="text-indigo-600" />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.personal_info}</h3>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">{t.name}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">{t.bio}</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">{t.phone}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="+880123456789"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={updating}
                  className="w-full mt-2 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>{t.save}</span>
                </button>
              </form>
            </section>

            {/* Security Info */}
            <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <Lock size={18} className="text-indigo-600" />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.change_password}</h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">{t.new_password}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={passUpdating || !newPassword}
                  className="w-full bg-slate-900 dark:bg-slate-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {passUpdating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  <span>{t.change_password}</span>
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
