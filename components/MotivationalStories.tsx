
import React, { useState } from 'react';
import { translations, Language } from '../translations';
import { BookOpen, ArrowLeft, Star, Heart, Share2, Sparkles, Clock } from 'lucide-react';

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
  const t = translations[lang];

  const stories: Story[] = [
    {
      id: '1',
      title: lang === 'bn' ? 'ব্যর্থতা যখন সাফল্যের সোপান' : 'When Failure is the Step to Success',
      author: 'জয় কুমার বিশ্বাস',
      readTime: lang === 'bn' ? '৩ মিনিট' : '3 min',
      category: lang === 'bn' ? 'সাফল্য' : 'Success',
      preview: lang === 'bn' ? 'থমাস আলভা এডিসন হাজারবার ব্যর্থ হওয়ার পর বলেছিলেন, আমি ব্যর্থ হইনি, আমি ১০ হাজারটি উপায় খুঁজে পেয়েছি যা কাজ করে না।' : 'Thomas Edison said after failing a thousand times, "I have not failed. I\'ve just found 10,000 ways that won\'t work."',
      content: lang === 'bn' 
        ? 'একবার এক যুবক এক বৃদ্ধ জ্ঞানীর কাছে গিয়ে জিজ্ঞেস করল, "সাফল্যের রহস্য কী?" বৃদ্ধ তাকে পরের দিন সকালে নদীর ধারে দেখা করতে বললেন। সকালে নদীর ধারে যাওয়ার পর বৃদ্ধ তাকে গলা সমান পানিতে নিয়ে গেলেন এবং হঠাৎ যুবকের মাথা পানির নিচে চেপে ধরলেন। যুবকটি বাতাসের জন্য ছটফট করতে লাগল কিন্তু বৃদ্ধ তাকে ছাড়ছিলেন না। কিছুক্ষণ পর যখন তাকে ছেড়ে দেওয়া হলো, যুবকটি বড় বড় শ্বাস নিতে লাগল। বৃদ্ধ বললেন, "পানির নিচে তোমার বাতাসের জন্য যতটা ব্যাকুলতা ছিল, সাফল্যের জন্য যেদিন তোমার সেই একই ব্যাকুলতা আসবে, সেদিনই তুমি সফল হবে।" অর্থাৎ, সফল হওয়ার জন্য তীব্র আকাঙ্ক্ষা থাকতে হবে।'
        : 'A young man asked a wise elder the secret to success. The elder told him to meet him near the river the next morning. When they met, the elder took him into the river and suddenly pushed his head underwater. The young man struggled to breathe. When he was finally let up, the elder asked, "What did you want most when you were underwater?" The man said, "Air." The elder replied, "When you want success as badly as you wanted that air, you will have it."'
    },
    {
      id: '2',
      title: lang === 'bn' ? 'এক পা এগিয়ে চলা' : 'One Step Forward',
      author: 'জয় কুমার বিশ্বাস',
      readTime: lang === 'bn' ? '৪ মিনিট' : '4 min',
      category: lang === 'bn' ? 'অনুপ্রেরণা' : 'Inspiration',
      preview: lang === 'bn' ? 'হাজার মাইলের যাত্রা শুরু হয় একটি মাত্র ছোট পদক্ষেপের মাধ্যমে।' : 'A journey of a thousand miles begins with a single step.',
      content: lang === 'bn'
        ? 'একজন ভাস্কর যখন পাথর থেকে মূর্তি তৈরি করেন, তখন তিনি শুধু অপ্রয়োজনীয় অংশগুলো সরিয়ে ফেলেন। মূর্তিটি পাথরের ভেতরেই থাকে। আমাদের জীবনও তেমন। আমাদের ভেতরে অফুরন্ত সম্ভাবনা রয়েছে, শুধু নেতিবাচকতা এবং ভয় নামক অপ্রয়োজনীয় অংশগুলো সরিয়ে ফেলতে হবে। প্রতিদিন সামান্য উন্নতি একসময় বিশাল অর্জনে পরিণত হয়। আজ থেকে আপনার লক্ষ্যপূরণে অন্তত একটি ছোট কাজ শুরু করুন।'
        : 'When a sculptor carves a statue, he simply removes the unnecessary parts of the stone. The statue is already inside. Our lives are similar. We have endless potential within us; we just need to remove the unnecessary parts called negativity and fear. Small daily improvements lead to great achievements over time.'
    },
    {
      id: '3',
      title: lang === 'bn' ? 'বাঁশের গল্পের ধৈর্য' : 'Patience of the Bamboo',
      author: 'জয় কুমার বিশ্বাস',
      readTime: lang === 'bn' ? '৫ মিনিট' : '5 min',
      category: lang === 'bn' ? 'ধৈর্য' : 'Patience',
      preview: lang === 'bn' ? 'চীনা বাঁশগাছ রোপণের পর ৫ বছর পর্যন্ত কোনো দৃশ্যমান বৃদ্ধি দেখা যায় না, এরপর ৫ সপ্তাহে তা ৮০ ফুট বড় হয়।' : 'After planting Chinese bamboo, no growth is visible for 5 years, then it grows 80 feet in just 5 weeks.',
      content: lang === 'bn'
        ? 'আপনি যদি কোনো কাজ শুরু করে ফল না পান, তবে ভেঙে পড়বেন না। চীনা বাঁশগাছ যখন রোপণ করা হয়, প্রথম পাঁচ বছর তার কোনো বৃদ্ধিই মাটির উপরে দেখা যায় না। কিন্তু এই পাঁচ বছর সে মাটির নিচে তার শিকড়কে অত্যন্ত মজবুত করে। এরপর মাত্র ৫ সপ্তাহে এটি ৮০ ফুট লম্বা হয়। আপনার সংগ্রাম বা পরিশ্রম হয়তো এখন দৃশ্যমান নয়, কিন্তু আপনি আপনার সফলতার শিকড় মজবুত করছেন। ধৈর্য ধরুন, আপনার সময়ও আসবে।'
        : 'If you start something and don\'t see results, don\'t give up. When Chinese bamboo is planted, no growth is seen above ground for 5 years. But during those years, it strengthens its roots underground. Then in just 5 weeks, it grows 80 feet. Your struggle might not be visible now, but you are strengthening your roots. Have patience.'
    },
    {
      id: '4',
      title: lang === 'bn' ? 'পজিটিভ চিন্তার শক্তি' : 'Power of Positive Thinking',
      author: 'জয় কুমার বিশ্বাস',
      readTime: lang === 'bn' ? '৩ মিনিট' : '3 min',
      category: lang === 'bn' ? 'দৃষ্টিভঙ্গি' : 'Perspective',
      preview: lang === 'bn' ? 'আপনার ভেতরে দুটি নেকড়ে লড়াই করছে। কে জিতবে জানেন? যাকে আপনি খাবার দেন।' : 'Two wolves are fighting inside you. Do you know which one wins? The one you feed.',
      content: lang === 'bn'
        ? 'এক বৃদ্ধ তাঁর নাতিকে বলছেন, "আমাদের প্রত্যেকের ভেতরেই সারাক্ষণ এক ভীষণ যুদ্ধ চলে। এই যুদ্ধটি দুটি নেকড়ের মধ্যে। একটি নেকড়ে নেতিবাচক—সে রাগী, ঈর্ষাকাতর, লোভী এবং অহংকারী। অন্যটি ইতিবাচক—সে শান্ত, দয়ালু, বিনয়ী এবং সত্যবাদী।" নাতিটি কিছুক্ষণ ভেবে জিজ্ঞেস করল, "দাদু, শেষ পর্যন্ত কোন নেকড়েটি জেতে?" বৃদ্ধ মুচকি হেসে বললেন, "যেটিকে তুমি প্রতিদিন খাবার দেবে, সেই জিতবে।" অর্থাৎ, আপনি যদি প্রতিদিন ইতিবাচক চিন্তা করেন, তবে আপনার জীবন ইতিবাচক দিকেই মোড় নেবে।'
        : 'An old Cherokee is teaching his grandson about life. "A fight is going on inside me," he said to the boy. "It is a terrible fight and it is between two wolves. One is evil - he is anger, envy, greed, arrogance. The other is good - he is joy, peace, love, kindness." The grandson thought about it and asked, "Which wolf will win?" The old man simply replied, "The one you feed."'
    },
    {
      id: '5',
      title: lang === 'bn' ? 'নিজের ওপর বিশ্বাস' : 'Belief in Yourself',
      author: 'জয় কুমার বিশ্বাস',
      readTime: lang === 'bn' ? '৪ মিনিট' : '4 min',
      category: lang === 'bn' ? 'আত্মবিশ্বাস' : 'Self-Confidence',
      preview: lang === 'bn' ? 'আপনি যখন নিজেকে মূল্য দেন, তখন পৃথিবীর কেউ আপনাকে তুচ্ছ করতে পারে না।' : 'When you value yourself, no one in the world can belittle you.',
      content: lang === 'bn'
        ? 'একজন বিখ্যাত বক্তা তাঁর সেমিনারে ৫০০ টাকার একটি ঝকঝকে নোট হাতে নিয়ে জিজ্ঞেস করলেন, "কে কে এই নোটটি নিতে চান?" সবাই হাত তুলল। এরপর তিনি নোটটি হাতের তালুতে কচলালেন, নোটটি কুঁচকে গেল। আবার জিজ্ঞেস করলেন, "এখনও কে নিতে চান?" সবাই হাত তুলল। এবার তিনি নোটটি মেঝেতে ফেলে পা দিয়ে মাড়িয়ে দিলেন এবং ধুলোবালি মাখালেন। এরপর জিজ্ঞেস করলেন, "এখনও কি আপনারা এটি নিতে চান?" সবাই আবারও হাত তুলল। তিনি বললেন, "বন্ধুরা, আজ আমি তোমাদের একটি বড় শিক্ষা দিলাম। নোটটি নোংরা ও কুঁচকে গেলেও এর মূল্য একটুও কমেনি। তেমনই জীবনে অনেক সময় আপনার ওপর দিয়ে অনেক ঝড় যাবে, আপনি হোঁচট খাবেন, কিন্তু মনে রাখবেন—আপনার ভেতরের মূল্য বা সম্ভাবনা তাতে একটুও কমে যায় না।"'
        : 'A speaker started his seminar by holding up a $100 bill. "Who would like this bill?" he asked. Hands went up. He crumpled it up and asked, "Who still wants it?" All hands stayed up. Then he dropped it on the floor, stepped on it, and got it dirty. "Now who wants it?" Again, everyone raised their hands. "My friends," he said, "you have learned a valuable lesson. No matter what I did to the money, you still wanted it because it did not decrease in value. Many times in our lives, we are dropped, crumpled, and ground into the dirt by the decisions we make or the circumstances that come our way. But no matter what has happened, you never lose your value."'
    },
    {
      id: '6',
      title: lang === 'bn' ? 'ছোট ছোট পদক্ষেপের মাহাত্ম্য' : 'The Magic of Small Steps',
      author: 'জয় কুমার বিশ্বাস',
      readTime: lang === 'bn' ? '৩ মিনিট' : '3 min',
      category: lang === 'bn' ? 'সাফল্য' : 'Success',
      preview: lang === 'bn' ? 'পাহাড় কাটার জন্য ডিনামাইট নয়, হাতুড়ির ছোট ছোট আঘাতই যথেষ্ট।' : 'Small hits of a hammer are enough to move a mountain, not just dynamite.',
      content: lang === 'bn'
        ? 'দশরত মাঝির কথা আমরা সবাই জানি। তিনি একা একটি হাতুড়ি এবং ছেনি দিয়ে আস্ত একটি পাহাড় কেটে রাস্তা তৈরি করেছিলেন। অনেকে তাঁকে পাগল বলেছিল, কিন্তু তিনি প্রতিদিন সামান্য করে পাহাড় কাটতেন। তিনি ভাবেননি যে কালই রাস্তা হয়ে যাবে। তাঁর কাছে আজকের লক্ষ্য ছিল পাহাড়ের একটি ছোট টুকরো আলাদা করা। ২২ বছর পর তিনি সফল হয়েছিলেন। আমরা অনেক সময় বড় সাফল্যের অপেক্ষায় থেকে বর্তমানের ছোট ছোট কাজগুলো এড়িয়ে চলি। মনে রাখবেন, আজকের ছোট একটি সঠিক কাজই আগামীকালের বড় সাফল্যের কারিগর।'
        : 'Dashrath Manjhi, known as the "Mountain Man," carved a path through a mountain using only a hammer and chisel. Many called him mad, but he worked a little bit every day. He didn\'t wait for a miracle. His only goal each day was to break a small piece of stone. After 22 years, he achieved his goal. We often ignore small steps while waiting for big results. Remember, one small right step today is the architect of big success tomorrow.'
    }
  ];

  if (selectedStory) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-500 pb-20">
        <button 
          onClick={() => setSelectedStory(null)}
          className="flex items-center gap-2 text-blue-600 font-black mb-10 hover:translate-x-[-4px] transition-transform uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={20} /> {t.back_to_list}
        </button>

        <article className="bg-white/70 backdrop-blur-3xl rounded-[48px] border border-blue-50 shadow-2xl overflow-hidden p-12 lg:p-20 relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 pointer-events-none">
            <Sparkles size={120} />
          </div>
          
          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-4">
              <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{selectedStory.category}</span>
              <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Clock size={12} /> {selectedStory.readTime}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
              {selectedStory.title}
            </h1>

            <div className="flex items-center gap-4 border-y border-slate-50 py-6">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-inner">
                {selectedStory.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{selectedStory.author}</p>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t.ai_role}</p>
              </div>
            </div>

            <p className="text-xl md:text-2xl font-bold text-slate-600 leading-relaxed first-letter:text-6xl first-letter:font-black first-letter:text-blue-600 first-letter:mr-3 first-letter:float-left">
              {selectedStory.content}
            </p>

            <div className="pt-12 flex items-center gap-6">
              <button className="flex items-center gap-2 text-slate-400 font-black hover:text-rose-500 transition-colors uppercase tracking-widest text-xs">
                <Heart size={20} /> 1.2k
              </button>
              <button className="flex items-center gap-2 text-slate-400 font-black hover:text-blue-600 transition-colors uppercase tracking-widest text-xs">
                <Share2 size={20} /> {lang === 'bn' ? 'শেয়ার' : 'Share'}
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{t.stories_title}</h2>
          <p className="text-slate-500 font-bold">{lang === 'bn' ? 'আপনার মনকে চাঙ্গা করতে এবং অনুপ্রেরণা পেতে আমাদের গল্পগুলো পড়ুন।' : 'Read our stories to refresh your mind and get inspired.'}</p>
        </div>
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl p-4 rounded-3xl border border-blue-50 shadow-sm">
           <Star className="text-yellow-400 fill-yellow-400" size={24} />
           <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t.featured_story}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story) => (
          <div key={story.id} className="bg-white/80 backdrop-blur-2xl p-10 rounded-[40px] border border-blue-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 rotate-12 pointer-events-none transition-opacity">
               <Sparkles size={60} />
            </div>
            
            <div className="mb-6 flex items-center justify-between">
              <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{story.category}</span>
              <span className="text-slate-300 text-[9px] font-black uppercase tracking-widest">{story.readTime}</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors">
              {story.title}
            </h3>

            <p className="text-slate-500 font-bold leading-relaxed mb-8 flex-1 line-clamp-3 italic opacity-80">
              "{story.preview}"
            </p>

            <button 
              onClick={() => setSelectedStory(story)}
              className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-blue-100"
            >
              <BookOpen size={20} />
              <span className="text-xs uppercase tracking-widest">{t.read_more}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-600 rounded-[48px] p-12 lg:p-20 text-white shadow-2xl shadow-blue-200 relative overflow-hidden mt-12">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 pointer-events-none">
           <Sparkles size={160} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
            {lang === 'bn' ? 'আপনার নিজের গল্প লিখুন' : 'Write Your Own Story'}
          </h2>
          <p className="text-lg md:text-xl font-bold opacity-80 mb-10 leading-relaxed">
            {lang === 'bn' 
              ? 'প্রতিটি মানুষের জীবন একটি মহাকাব্য। আজ আপনি যা করছেন, কাল তা কারো কাছে অনুপ্রেরণা হতে পারে। আপনার দিনটিকে সার্থক করে তুলুন।' 
              : 'Every life is an epic. What you do today might be someone else\'s inspiration tomorrow. Make your day count.'}
          </p>
          <button 
            onClick={() => onNavigate('diary')}
            className="bg-white text-blue-600 px-10 py-5 rounded-[24px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            {lang === 'bn' ? 'ডায়েরি লিখতে যান' : 'Go to Diary'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotivationalStories;
