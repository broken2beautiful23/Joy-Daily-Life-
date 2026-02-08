
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { Plus, Trash2, Search, TrendingDown, TrendingUp, X, Wallet, Loader2 } from 'lucide-react';
import { translations, Language } from '../translations';
import { supabase } from '../services/supabase';

interface ExpensesProps {
  lang: Language;
}

const Expenses: React.FC<ExpensesProps> = ({ lang }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('General');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) setTransactions(data);
    setIsLoading(false);
  };

  const addTransaction = async () => {
    if (!amount) return;
    const newTx = { 
      id: `tx-${Date.now()}`, 
      date: new Date().toISOString(), 
      amount: parseFloat(amount), 
      type, 
      category, 
      note 
    };
    const { error } = await supabase.from('transactions').insert([newTx]);
    if (!error) {
      setTransactions([newTx as any, ...transactions]);
      setAmount('');
      setNote('');
      setShowAdd(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    const msg = lang === 'bn' ? 'আপনি কি নিশ্চিত যে এই লেনদেনটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this transaction?';
    if (window.confirm(msg)) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (!error) setTransactions(transactions.filter(t => t.id !== id));
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
          <p className="text-slate-500 font-medium">{lang === 'bn' ? 'আপনার আয় ও ব্যয়ের হিসাব এক জায়গায়।' : 'Keep track of your earnings and spendings.'}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all">
          {showAdd ? <X /> : <Plus size={20} />}
          <span className="font-bold">{showAdd ? t.cancel : t.add_transaction}</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500 text-white rounded-xl"><TrendingUp size={20}/></div>
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{t.total_income}</p>
          </div>
          <p className="text-3xl font-black text-emerald-700">৳{totalIncome.toLocaleString()}</p>
        </div>

        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-500 text-white rounded-xl"><TrendingDown size={20}/></div>
            <p className="text-xs font-black text-rose-600 uppercase tracking-widest">{t.total_expense}</p>
          </div>
          <p className="text-3xl font-black text-rose-700">৳{totalExpense.toLocaleString()}</p>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl"><Wallet size={20}/></div>
            <p className="text-xs font-black uppercase tracking-widest opacity-80">{t.balance}</p>
          </div>
          <p className="text-3xl font-black">৳{balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{lang === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}</h3>
            {isLoading && <Loader2 size={16} className="animate-spin text-indigo-500" />}
          </div>
          <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 group transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {tx.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{tx.note || (lang === 'bn' ? catTranslations[tx.category] || tx.category : tx.category)}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tx.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
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
            {!isLoading && transactions.length === 0 && <div className="p-20 text-center text-slate-300 italic">কোনো লেনদেন পাওয়া যায়নি।</div>}
          </div>
        </div>

        <div>
          {showAdd && (
            <div className="bg-white p-6 rounded-3xl border-2 border-indigo-500 shadow-2xl animate-in slide-in-from-bottom duration-300 sticky top-24">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" />
                {t.add_transaction}
              </h3>
              
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
                <button 
                  onClick={() => { setType('expense'); setCategory(categories.expense[0]); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {t.expense}
                </button>
                <button 
                  onClick={() => { setType('income'); setCategory(categories.income[0]); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {t.income}
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{t.amount} (৳)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 font-bold text-lg" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{t.category}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 font-bold">
                    {categories[type].map(c => (
                      <option key={c} value={c}>{lang === 'bn' ? catTranslations[c] || c : c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{t.note}</label>
                  <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 font-medium" placeholder={lang === 'bn' ? "নোট লিখুন..." : "Add a note..."} />
                </div>
                <button onClick={addTransaction} className={`w-full text-white font-black py-5 rounded-2xl shadow-xl ${type === 'income' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-rose-600 shadow-rose-100'}`}>
                  {t.save_transaction}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
