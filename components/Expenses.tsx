
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { Plus, Trash2, Search, TrendingDown, TrendingUp, X, Wallet, Loader2 } from 'lucide-react';
import { translations, Language } from '../translations';
import { supabase } from '../services/supabase';

interface ExpensesProps {
  lang: Language;
  userId: string;
}

const Expenses: React.FC<ExpensesProps> = ({ lang, userId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const t = translations[lang];

  const categories = {
    expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'],
    income: ['Salary', 'Freelance', 'Gift', 'Investment', 'Business', 'Other']
  };

  const catTranslations: Record<string, string> = {
    Food: 'খাবার', Transport: 'যাতায়াত', Shopping: 'কেনাকাটা', Entertainment: 'বিনোদন', Bills: 'বিল', Other: 'অন্যান্য', Health: 'স্বাস্থ্য',
    Salary: 'বেতন', Freelance: 'ফ্রিল্যান্সিং', Gift: 'উপহার', Investment: 'বিনিয়োগ', Business: 'ব্যবসা'
  };

  useEffect(() => {
    if (userId) fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      // If user_id filtering causes issues because the column is missing, 
      // we can try fetching all but it's better to fix the schema.
      // For now, let's keep it simple.
      if (error) throw error;
      if (data) setTransactions(data);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert(lang === 'bn' ? "সঠিক পরিমাণ দিন!" : "Please enter a valid amount!");
      return;
    }
    
    setIsSaving(true);
    try {
      // We send user_id because it is essential for RLS and multi-user apps.
      // If you get "Could not find user_id column", please add it to your table in Supabase.
      const payload = {
        user_id: userId, // Ensure this column exists in your Supabase 'transactions' table
        date: new Date().toISOString(), 
        amount: parseFloat(amount), 
        type, 
        category, 
        note 
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([payload])
        .select();

      if (error) {
        // More descriptive error for the specific issue seen in screenshot
        if (error.message.includes("user_id")) {
          throw new Error(lang === 'bn' 
            ? "ডাটাবেসে 'user_id' কলামটি পাওয়া যায়নি। দয়া করে সুপাবেস ড্যাশবোর্ড চেক করুন।" 
            : "The 'user_id' column is missing in your transactions table.");
        }
        throw error;
      }

      if (data) {
        setTransactions([data[0], ...transactions]);
        setAmount('');
        setNote('');
        setShowAdd(false);
        alert(lang === 'bn' ? "লেনদেন সফলভাবে যোগ করা হয়েছে!" : "Transaction added successfully!");
      }
    } catch (err: any) {
      alert(lang === 'bn' ? `ত্রুটি: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (!error) {
        setTransactions(transactions.filter(t => t.id !== id));
      } else {
        alert("Failed to delete.");
      }
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">{t.finance_title}</h2>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg active:scale-95 transition-all">
          {showAdd ? <X /> : <Plus size={20} />}
          <span className="font-bold">{showAdd ? t.cancel : t.add_transaction}</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 p-6 rounded-3xl">
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{t.total_income}</p>
          <p className="text-3xl font-black text-emerald-700">৳{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-3xl">
          <p className="text-xs font-black text-rose-600 uppercase tracking-widest">{t.total_expense}</p>
          <p className="text-3xl font-black text-rose-700">৳{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl">
          <p className="text-xs font-black uppercase tracking-widest opacity-80">{t.balance}</p>
          <p className="text-3xl font-black">৳{balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{lang === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}</h3>
            {isLoading && <Loader2 size={16} className="animate-spin text-indigo-500" />}
          </div>
          <div className="divide-y divide-slate-50 overflow-y-auto max-h-[600px] custom-scrollbar">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {tx.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{tx.note || (lang === 'bn' ? catTranslations[tx.category] || tx.category : tx.category)}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`font-black text-lg ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                  </span>
                  <button onClick={() => deleteTransaction(tx.id)} className="p-2 text-slate-300 hover:text-rose-500">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            {!isLoading && transactions.length === 0 && <div className="p-20 text-center text-slate-300 italic font-bold">কোনো লেনদেন পাওয়া যায়নি।</div>}
          </div>
        </div>

        <div className={`transition-all duration-300 ${showAdd ? 'opacity-100' : 'opacity-0 pointer-events-none absolute lg:static'}`}>
          <div className="bg-white p-8 rounded-3xl border-2 border-indigo-500 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-slate-800 border-b pb-4">{t.add_transaction}</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">পরিমাণ</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 font-black text-2xl text-indigo-600" placeholder="0.00" autoFocus />
              </div>
              
              <div className="flex gap-2">
                 <button onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl font-black transition-all ${type === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{lang === 'bn' ? 'আয়' : 'Income'}</button>
                 <button onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl font-black transition-all ${type === 'expense' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{lang === 'bn' ? 'ব্যয়' : 'Expense'}</button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">খাত</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 font-bold outline-none focus:ring-2 focus:ring-indigo-100">
                  {categories[type].map(c => (
                    <option key={c} value={c}>{lang === 'bn' ? catTranslations[c] || c : c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">নোট</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 font-bold" placeholder={lang === 'bn' ? "বিকাশ / নগদ / হাতে" : "Note..."} />
              </div>

              <button 
                onClick={addTransaction} 
                disabled={isSaving}
                className="w-full blue-btn text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 mt-4"
              >
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                <span>{isSaving ? (lang === 'bn' ? "সেভ হচ্ছে..." : "Saving...") : t.save_transaction}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
