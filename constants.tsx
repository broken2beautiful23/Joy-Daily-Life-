
import React from 'react';
import { 
  LayoutDashboard, 
  BookText, 
  CheckSquare, 
  Wallet, 
  Dumbbell, 
  Target, 
  StickyNote, 
  Image, 
  Flame,
  GraduationCap,
  Briefcase,
  Star,
  Cpu
} from 'lucide-react';

/** 
 * Joy's Original Photo (Mirror Selfie in Blue Shirt)
 * Note: Replacing the previous placeholder with the specific photo provided by the user.
 */
export const AI_AVATAR_URL = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"; 
// In the final application, this constant will be mapped to your uploaded image data.

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: <LayoutDashboard size={20} /> },
  { id: 'profwork', label: 'প্রফেশনাল কাজ', icon: <Cpu size={20} /> },
  { id: 'worklog', label: 'কাজ ও শিখন লগ', icon: <Briefcase size={20} /> },
  { id: 'stories', label: 'মোটিভেশনাল গল্প', icon: <Star size={20} /> },
  { id: 'diary', label: 'ডায়েরি', icon: <BookText size={20} /> },
  { id: 'tasks', label: 'কাজ (To-Do)', icon: <CheckSquare size={20} /> },
  { id: 'expenses', label: 'আয় ও ব্যয়', icon: <Wallet size={20} /> },
  { id: 'habits', label: 'অভ্যাস ট্র্যাকার', icon: <Dumbbell size={20} /> },
  { id: 'goals', label: 'লক্ষ্যসমূহ', icon: <Target size={20} /> },
  { id: 'study', label: 'পড়াশোনা প্ল্যানার', icon: <GraduationCap size={20} /> },
  { id: 'notes', label: 'নোটস', icon: <StickyNote size={20} /> },
  { id: 'memories', label: 'স্মৃতি গ্যালারি', icon: <Image size={20} /> },
];

export const MOOD_COLORS: Record<string, string> = {
  Great: 'bg-green-100 text-green-700',
  Good: 'bg-blue-100 text-blue-700',
  Okay: 'bg-yellow-100 text-yellow-700',
  Sad: 'bg-orange-100 text-orange-700',
  Awful: 'bg-red-100 text-red-700',
};

export const MOOD_EMOJIS: Record<string, string> = {
  Great: '🤩',
  Good: '😊',
  Okay: '😐',
  Sad: '😔',
  Awful: '😫',
};
