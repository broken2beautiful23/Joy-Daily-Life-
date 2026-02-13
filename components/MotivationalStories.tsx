
import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { 
  BookOpen, ArrowLeft, Star, Heart, 
  Share2, Sparkles, Clock, RefreshCw, 
  Zap, Quote, Lightbulb, Loader2 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Story {
  id: string;
  title: string;
  author: string;
  preview: string;
  content: string;
  category: string;
  readTime: string;
}

interface MotivationalStoriesProps {
  lang: Language;
  onNavigate: (tabId: string) => void;
}

const MotivationalStories: React.FC<MotivationalStoriesProps> = ({ lang, onNavigate }) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [aiStory, setAiStory] = useState<Story | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const t = translations[lang];

  const staticStories: Story[] = [
    {
      id: 's1',
      title: lang === 'bn' ? 'হাতি এবং দড়ির রহস্য' : 'The Elephant Rope',
      author: 'জয় কুমার বিশ্বাস',
      readTime: lang === 'bn' ? '২ মিনিট' : '2 min',
      category: lang === 'bn' ? 'বিশ্বাস' : 'Belief',
      preview: lang === 'bn' ? 'একটি বিশালাকার হাতিকে কেন সামান্য একটি দড়ি দিয়ে আটকে রাখা সম্ভব? কারণ তার ভেতরে থাকা এক অদৃশ্য দেয়াল।' : 'Why can a giant elephant be held by a tiny rope? Because of an invisible wall within.',
      content: lang === 'bn' 
        ? 'এক লোক বনের ধার দিয়ে যাওয়ার সময় দেখল একটি বিশাল হাতিকে সামান্য একটি দড়ি দিয়ে খুঁটির সাথে বেঁধে রাখা হয়েছে। হাতিটির শক্তি এতই বেশি যে সে চাইলেই এক ঝটকায় দড়িটি ছিঁড়ে ফেলতে পারে। কিন্তু সে চেষ্টা করছে না। লোকটির প্রশ্নের উত্তরে মাহুত বলল, "যখন এরা ছোট ছিল, তখন এদের এই একই দড়ি দিয়ে বাঁধা হতো। তখন তারা অনেক চেষ্টা করেও দড়িটি ছিঁড়তে পারত না। এখন তারা বড় হয়ে গেছে ঠিকই, কিন্তু তাদের মনে এই ধারণা গেঁথে গেছে যে—এই দড়ি ছেঁড়া তাদের পক্ষে অসম্ভব। তাই তারা আর চেষ্টাও করে না।" আমাদের জীবনও তেমনই; আমরা অতীতের ব্যর্থতাকে চিরস্থায়ী মনে করে নতুন করে চেষ্টা করা ছেড়ে দেই। বিশ্বাস করুন, আপনি পারবেন!'
        : 'A man saw a giant elephant held by a small rope. He asked the trainer why it didn\'t escape. The trainer replied, "When they are young, we use the same size rope. At that age, it\'s enough to hold them. As they grow up, they are conditioned to believe they cannot break the rope. They believe the rope can still hold them, so they never try to break free." Don\'t let past failures limit your future potential.'
    },
    {
      id: 's2',
      title: lang === 'bn' ? 'ভাঙা কলসের উপকথা' : 'The Cracked Pot',
      author: 'জয় কুমার বিশ্বাস',
      readTime: lang === 'bn' ? '৩ মিনিট' : '3 min',
      category: lang === 'bn' ? 'সার্থকতা' : 'Uniqueness',
      preview: lang === 'bn' ? 'নিজের খুঁত বা অপূর্ণতাকে ঘৃণা করবেন না, কারণ সেটিই হয়তো অন্যের জীবনে ফুল ফোটায়।' : 'Never hate your imperfections, for they might be the reason flowers grow in someone\'s life.',
      content: lang === 'bn'
        ? 'এক লোক দুটি কলস দিয়ে নদী থেকে পানি আনত। একটি কলস ছিল নিখুঁত, অন্যটি ছিল কিছুটা ফাটা। নদী থেকে ফেরার সময় ফাটা কলসটি দিয়ে অর্ধেক পানি পড়ে যেত। নিখুঁত কলসটি খুব গর্বিত ছিল, কিন্তু ফাটা কলসটি খুব লজ্জিত ছিল। একদিন ফাটা কলসটি মালিককে বলল, "আমি লজ্জিত যে আমার কারণে আপনি পুরো পানি পান না।" মালিক হাসলেন এবং বললেন, "যাওয়ার পথে রাস্তার পাশের ফুলগুলো কি দেখেছ? আমি জানি তোমার একপাশে ফাটল আছে, তাই আমি সেদিকের রাস্তায় ফুলের বীজ বুনেছিলাম। তুমি প্রতিদিন ফেরার পথে সেগুলোতে পানি দিয়েছ বলেই আজ রাস্তাটি এত সুন্দর হয়ে আছে।" অর্থাৎ, আপনার প্রতিটি অপূর্ণতার মাঝেও লুকিয়ে আছে এক অনন্য সৌন্দর্য।'
        : 'A water bearer had two large pots. One was perfect, the other had a crack. Every day, the cracked pot arrived half full. The perfect pot was proud, but the cracked pot was ashamed. The bearer said, "Did you notice the flowers on your side of the path? I knew about your flaw, so I planted seeds there. Every day as we return, you have watered them. Without you being just the way you are, we would not have this beauty."'
    },
    {
      id: 's3',
      title: lang === 'bn' ? 'প্রতিবন্ধকতাই যখন সুযোগ' : 'The Obstacle in Our Path',
      author: 'জয় কুমার বিশ্বাস',
      readTime: lang === 'bn' ? '২ মিনিট' : '2 min',
      category: lang === 'bn' ? 'সুযোগ' : 'Opportunity',
      preview: lang === 'bn' ? 'রাস্তার মাঝখানে একটি বড় পাথর কি শুধু আপনার পথ আটকে দেওয়ার জন্য, নাকি কিছু শেখানোর জন্য?' : 'Is a giant boulder in the road just an obstacle, or a hidden test of character?',
      content: lang === 'bn'
        ? 'বহুকাল আগে এক রাজা রাস্তার মাঝখানে একটি বিশাল পাথর রেখে আড়ালে দাঁড়িয়ে দেখতে লাগলেন কে এটি সরায়। অনেক ধনী বণিক এবং রাজসভার সদস্য পাশ দিয়ে চলে গেলেন, অনেকে রাজাকে দোষ দিলেন রাস্তা পরিষ্কার না রাখার জন্য। শেষে এক দরিদ্র কৃষক অনেক কষ্টে পাথরটি সরিয়ে দিলেন। পাথরের নিচে তিনি দেখলেন একটি থলি, যাতে অনেক স্বর্ণমুদ্রা এবং রাজার একটি চিরকুট ছিল। চিরকুটে লেখা ছিল—"এই পুরস্কার তার জন্য যে রাস্তার বাধা দূর করবে।" অর্থাৎ, প্রতিটি বাধা আমাদের জন্য নতুন একটি সুযোগ নিয়ে আসে।'
        : 'In ancient times, a King placed a boulder on a roadway. Many came by and simply walked around it, complaining about the King. Then a peasant came, and with great effort, pushed the boulder aside. Beneath it, he found a purse of gold and a note from the King stating that the gold was for the person who removed the obstacle. Every obstacle presents an opportunity to improve our condition.'
    }
  ];

  const generateAiStory = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = lang === 'bn' 
        ? "একটি সম্পূর্ণ নতুন, ছোট এবং অত্যন্ত শিক্ষামূলক মোটিভেশনাল গল্প তৈরি করো। গল্পটির একটি শিরোনাম, ১ লাইনের প্রিভিউ এবং বিস্তারিত শিক্ষামূলক অংশ থাকবে। উত্তরটি অবশ্যই সুন্দর বাংলায় হতে হবে।"
        : "Generate a brand new, short, and highly educational motivational story. Provide a Title, a 1-line preview, and the detailed story content. Ensure it is unique and inspiring.";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text;
      // Simple parsing or just display text
      const newStory: Story = {
        id: 'ai-' + Date.now(),
        title: lang === 'bn' ? 'আজকের বিশেষ এআই প্রেরণা' : 'Daily AI Inspiration',
        author: t.ai_name,
        readTime: lang === 'bn' ? '৩ মিনিট' : '3 min',
        category: lang === 'bn' ? 'এআই স্পেশাল' : 'AI Special',
        preview: lang === 'bn' ? 'আপনার জন্য জেনারেট করা একটি ইউনিক গল্প।' : 'A unique story generated just for you.',
        content: text
      };
      setAiStory(newStory);
      setSelectedStory(newStory);
    } catch (error) {
      console.error(error);
      alert(lang === 'bn' ? "দুঃখিত, এখন গল্প জেনারেট করা যাচ্ছে না।" : "Sorry, could not generate story at this time.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (selectedStory) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-500 pb-20 px-4">
        <button 
          onClick={() => setSelectedStory(null)}
          className="flex items-center gap-2 text-indigo-600 font-black mb-10 hover:translate-x-[-4px] transition-transform uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={20} /> {t.back_to_list}
        </button>

        <article className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-8 md:p-16 relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 pointer-events-none text-indigo-500">
            <Quote size={120} />
          </div>
          
          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-4">
              <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{selectedStory.category}</span>
              <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Clock size={12} /> {selectedStory.readTime}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
              {selectedStory.title}
            </h1>

            <div className="flex items-center gap-4 border-y border-slate-100 dark:border-slate-800 py-6">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-inner">
                {selectedStory.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">{selectedStory.author}</p>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Inspiration Guide</p>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg md:text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedStory.content}
              </p>
            </div>

            <div className="pt-12 flex flex-wrap items-center gap-6 border-t border-slate-100 dark:border-slate-800">
              <button className="flex items-center gap-2 text-slate-400 font-black hover:text-rose-500 transition-colors uppercase tracking-widest text-[10px]">
                <Heart size={18} /> Like
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(selectedStory.content);
                  alert(lang === 'bn' ? "গল্পটি কপি হয়েছে!" : "Story copied to clipboard!");
                }}
                className="flex items-center gap-2 text-slate-400 font-black hover:text-indigo-600 transition-colors uppercase tracking-widest text-[10px]"
              >
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 px-4">
      {/* HEADER WITH AI ACTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-slate-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
           <Sparkles size={160} />
        </div>
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 leading-none">
            {lang === 'bn' ? 'আজকের বিশেষ প্রেরণা' : 'Daily Inspiration'}
          </h2>
          <p className="text-sm md:text-lg font-bold opacity-70 leading-relaxed mb-8 italic">
            {lang === 'bn' 
              ? 'এআই-এর সাহায্যে প্রতিদিন নতুন নতুন অনুপ্রেরণা খুঁজুন এবং আপনার জীবনকে ইতিবাচক দিকে নিয়ে যান।' 
              : 'Discover new inspirations daily with AI and lead your life towards positivity.'}
          </p>
          <button 
            onClick={generateAiStory}
            disabled={isGenerating}
            className="group relative bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-indigo-600" />}
            <span className="text-xs uppercase tracking-widest">
              {isGenerating ? (lang === 'bn' ? 'জেনারেট হচ্ছে...' : 'Generating...') : (lang === 'bn' ? 'একটি নতুন গল্প তৈরি করুন' : 'Generate New Story')}
            </span>
            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 pointer-events-none"></div>
          </button>
        </div>
        <div className="hidden lg:block relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
             <Quote className="text-yellow-400" size={32} />
          </div>
        </div>
      </header>

      {/* STORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staticStories.map((story) => (
          <div key={story.id} className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 rotate-12 pointer-events-none transition-opacity">
               <Lightbulb size={60} className="text-indigo-500" />
            </div>
            
            <div className="mb-6 flex items-center justify-between">
              <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{story.category}</span>
              <span className="text-slate-300 text-[9px] font-black uppercase tracking-widest">{story.readTime}</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">
              {story.title}
            </h3>

            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8 flex-1 line-clamp-3 italic opacity-80">
              "{story.preview}"
            </p>

            <button 
              onClick={() => setSelectedStory(story)}
              className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all shadow-indigo-100 dark:shadow-none"
            >
              <BookOpen size={20} />
              <span className="text-[10px] uppercase tracking-widest">{t.read_more}</span>
            </button>
          </div>
        ))}
      </div>

      {/* CALL TO ACTION */}
      <div className="bg-indigo-600 rounded-[48px] p-10 lg:p-20 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden mt-12">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 pointer-events-none">
           <Star size={160} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
            {lang === 'bn' ? 'নিজের গল্পও কি লিখতে চান?' : 'Want to write your own?'}
          </h2>
          <p className="text-lg md:text-xl font-bold opacity-80 mb-10 leading-relaxed">
            {lang === 'bn' 
              ? 'আপনার প্রতিদিনের ডায়েরিই হতে পারে আগামীর কোনো এক প্রেরণা। আজ থেকেই লিখতে শুরু করুন।' 
              : 'Your daily diary could be someone\'s future inspiration. Start writing today.'}
          </p>
          <button 
            onClick={() => onNavigate('diary')}
            className="bg-white text-indigo-600 px-10 py-5 rounded-[24px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            {lang === 'bn' ? 'ডায়েরি লিখতে যান' : 'Go to Diary'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotivationalStories;
