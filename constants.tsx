
import React from 'react';
import { 
  LayoutDashboard, 
  BookText, 
  CheckSquare, 
  Wallet, 
  Target, 
  StickyNote, 
  Image, 
  GraduationCap,
  Briefcase,
  Star,
  Cpu,
  Timer,
  Sparkles
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: <LayoutDashboard size={20} /> },
  { id: 'aicoach', label: 'গ্ৰোক এআই', icon: <Sparkles size={20} className="text-indigo-500 animate-pulse" /> },
  { id: 'worktimer', label: 'ওয়ার্ক টাইমার', icon: <Timer size={20} className="text-orange-500" /> },
  { id: 'profwork', label: 'প্রফেশনাল কাজ', icon: <Cpu size={20} /> },
  { id: 'worklog', label: 'কাজ ও শিখন লগ', icon: <Briefcase size={20} /> },
  { id: 'stories', label: 'মোটিভেশনাল গল্প', icon: <Star size={20} /> },
  { id: 'diary', label: 'ডায়েরি', icon: <BookText size={20} /> },
  { id: 'tasks', label: 'কাজ (To-Do)', icon: <CheckSquare size={20} /> },
  { id: 'expenses', label: 'আয় ও ব্যয়', icon: <Wallet size={20} /> },
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

export const AI_AVATAR_URL = 'https://api.dicebear.com/7.x/bottts/svg?seed=GrokX';
