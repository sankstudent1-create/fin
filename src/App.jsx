import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Wallet, Coffee, ShoppingBag, Car, Zap, Home, Heart, Smartphone, 
  Briefcase, Laptop, Gift, Star, X, Calendar, ArrowDownLeft, ArrowUpRight, 
  PieChart, List, ChevronRight, Lock, Mail, User, LogOut, Sparkles, 
  TrendingUp, Percent, ShieldCheck, Coins, Download, AlertCircle, Loader2, Trash2, Camera,
  WifiOff, RefreshCw, LayoutDashboard, FileText, Edit2, Globe, Tag, Baby
} from 'lucide-react';

// --- 🟢 CONFIGURATION ---
const SUPABASE_URL = "https://rtcwtaweamrgyimyhhup.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Y3d0YXdlYW1yZ3lpbXloaHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDcyODEsImV4cCI6MjA4NTE4MzI4MX0.6bD8rcBJjoi0pRBOPEWiToPDZ_09-aVu7MgYZIS7a-8";

// --- 🎨 SYSTEM MANAGER (Styles & Scripts) ---
// This component forces Tailwind and Supabase to load, fixing your CSS and Import errors.
const SystemManager = ({ onLoad }) => {
  useEffect(() => {
    // 1. Inject Tailwind CSS (Fixes broken design)
    if (!document.getElementById('tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => {
        // Configure Tailwind Theme
        window.tailwind.config = {
          theme: {
            extend: {
              colors: {
                orange: { 50: '#fff7ed', 100: '#ffedd5', 500: '#f97316', 600: '#ea580c' }
              },
              fontFamily: {
                sans: ['Outfit', 'sans-serif'],
              }
            }
          }
        };
      };
      document.head.appendChild(script);
    }

    // 2. Inject Google Fonts (Outfit)
    if (!document.getElementById('google-fonts')) {
      const link = document.createElement('link');
      link.id = 'google-fonts';
      link.rel = 'stylesheet';
      link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }

    // 3. Inject Supabase (Fixes 'Dynamic require' error)
    if (!window.supabase) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.onload = () => {
        const { createClient } = window.supabase;
        const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        onLoad(client);
      };
      document.body.appendChild(script);
    } else {
      // Already loaded
      const { createClient } = window.supabase;
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      onLoad(client);
    }
  }, []);

  return (
    <style>{`
      body { font-family: 'Outfit', sans-serif; background-color: #fff7ed; color: #431407; -webkit-tap-highlight-color: transparent; }
      .bg-mesh { background-color: #ff9a9e; background-image: radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%); }
      .warm-shadow { box-shadow: 0 8px 30px rgba(234, 88, 12, 0.12); }
      .glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #fed7aa; border-radius: 10px; }
      
      @media print {
        @page { margin: 0; size: A4; }
        body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        #print-root { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; background: white; padding: 40px; }
        .pdf-header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; }
        .pdf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .pdf-card { border: 1px solid #fed7aa; background: #fff7ed; padding: 20px; border-radius: 15px; }
        .pdf-table { width: 100%; border-collapse: collapse; }
        .pdf-table th { text-align: left; color: #9a3412; font-size: 12px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #fdba74; }
        .pdf-table td { padding: 12px 0; border-bottom: 1px solid #fed7aa; font-size: 14px; }
        .pdf-footer { position: fixed; bottom: 20px; width: 100%; text-align: center; font-size: 10px; color: #aaa; }
      }
      .print-only { display: none; }
    `}</style>
  );
};

// --- Config ---
const ICON_MAP = { Coffee, ShoppingBag, Car, Zap, Home, Heart, Smartphone, Briefcase, Laptop, Gift, Star, PieChart, Coins, TrendingUp, ShieldCheck, Baby, Percent, Camera, WifiOff, RefreshCw, LayoutDashboard, FileText, Tag, Globe };

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon_key: 'Coffee', type: 'expense', usage_count: 10 },
  { name: 'Shopping', icon_key: 'ShoppingBag', type: 'expense', usage_count: 8 },
  { name: 'Travel', icon_key: 'Car', type: 'expense', usage_count: 6 },
  { name: 'Bills', icon_key: 'Zap', type: 'expense', usage_count: 5 },
  { name: 'Rent', icon_key: 'Home', type: 'expense', usage_count: 4 },
  { name: 'Salary', icon_key: 'Briefcase', type: 'income', usage_count: 10 },
  { name: 'Freelance', icon_key: 'Laptop', type: 'income', usage_count: 5 },
];

const TOOLS = [
  { id: 'sip', name: 'SIP', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'lumpsum', name: 'Lumpsum', icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'fd', name: 'FD', icon: Lock, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'ppf', name: 'PPF', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: 'interest', name: 'Interest', icon: Percent, color: 'text-orange-600', bg: 'bg-orange-100' },
];

// --- 🛠️ OFFLINE & SYNC HOOK ---
const useOfflineSync = (supabase, userId) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const syncData = async () => {
      if (!isOnline || !userId || !supabase) return;
      const pendingStr = localStorage.getItem(`pending_tx_${userId}`);
      if (!pendingStr) return;
      const pending = JSON.parse(pendingStr);
      if (pending.length === 0) return;

      setIsSyncing(true);
      const newPending = [];

      for (const action of pending) {
        try {
          if (action.action === 'INSERT') await supabase.from('transactions').insert([action.data]);
          else if (action.action === 'DELETE') await supabase.from('transactions').delete().eq('id', action.id);
          else if (action.action === 'UPDATE') { const { id, ...updates } = action.data; await supabase.from('transactions').update(updates).eq('id', id); }
        } catch (e) { newPending.push(action); }
      }
      localStorage.setItem(`pending_tx_${userId}`, JSON.stringify(newPending));
      setIsSyncing(false);
    };
    if (isOnline) syncData();
  }, [isOnline, userId, supabase]);

  return { isOnline, isSyncing };
};

// --- 📊 COMPONENTS ---
const TrendBarChart = ({ transactions }) => {
  const data = transactions.slice(0, 10).reverse();
  const max = Math.max(...data.map(t => t.amount), 100);
  return (
    <div className="flex items-end justify-between h-32 w-full gap-2 mt-4">
      {data.map((t, i) => (
        <div key={i} className="flex flex-col items-center flex-1 group">
           <div className={`w-full rounded-t-lg transition-all duration-500 ${t.type === 'income' ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ height: `${(t.amount / max) * 100}%` }}></div>
           <span className="text-[10px] text-gray-400 mt-1 font-medium truncate w-full text-center hidden sm:block">
             {t.date ? new Date(t.date).getDate() : '?'}
           </span>
        </div>
      ))}
      {data.length === 0 && <div className="text-gray-400 text-xs w-full text-center">No recent data</div>}
    </div>
  );
};

const PrintView = ({ user, stats, reportData, transactions }) => (
  <div id="print-root" className="print-only">
    <div className="pdf-header">
       <div><h1 className="text-3xl font-bold">Financial Report</h1><p className="opacity-90 mt-1">Generated for {user?.user_metadata?.full_name || user?.email}</p></div>
       <div className="text-right"><h2 className="text-2xl font-bold opacity-80">{new Date().toLocaleDateString()}</h2><p className="text-xs uppercase tracking-widest opacity-70">Orange Finance</p></div>
    </div>
    <div className="pdf-grid">
       <div className="pdf-card"><p className="text-orange-600 text-xs font-bold uppercase mb-2">Total Balance</p><h2 className="text-4xl font-bold text-gray-900">₹ {stats.balance.toLocaleString()}</h2></div>
       <div className="pdf-card">
          <div className="flex justify-between mb-2"><span className="text-emerald-600 text-xs font-bold uppercase">Income</span><span className="text-red-600 text-xs font-bold uppercase">Expense</span></div>
          <div className="flex justify-between items-end"><span className="text-xl font-bold text-gray-800">₹{stats.income.toLocaleString()}</span><span className="text-xl font-bold text-gray-800">₹{stats.expense.toLocaleString()}</span></div>
       </div>
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 border-gray-200">Transaction History</h3>
    <table className="pdf-table">
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th style={{textAlign: 'right'}}>Amount</th></tr></thead>
      <tbody>
        {transactions.map(t => (
          <tr key={t.id}>
            <td>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
            <td>{t.title}</td>
            <td>{t.category}</td>
            <td style={{color: t.type === 'income' ? 'green' : 'red', textTransform: 'capitalize'}}>{t.type}</td>
            <td style={{textAlign: 'right', fontWeight: 'bold'}}>₹{t.amount.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="pdf-footer">Generated by Orange Finance • Developed by Swinfosystems • fin.swinfosystems.online</div>
  </div>
);

// --- 🏠 MAIN SCREENS ---
export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Called when SystemManager successfully loads the Supabase script
  const handleSystemLoad = (client) => {
    setSupabase(client);
    client.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    client.auth.onAuthStateChange((_event, session) => { setSession(session); setLoading(false); });
  };

  return (
    <>
      <SystemManager onLoad={handleSystemLoad} />
      {(loading || !supabase) ? (
        <div className="min-h-screen flex items-center justify-center bg-orange-50 text-orange-500"><Loader2 className="animate-spin" size={40}/></div>
      ) : (
        !session ? <AuthScreen supabase={supabase} /> : <Dashboard session={session} supabase={supabase} />
      )}
    </>
  );
}

// 🔐 AUTH SCREEN
const AuthScreen = ({ supabase }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) throw error;
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6 animate-fade-in no-print">
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] w-full max-w-sm warm-shadow-lg border border-white/50 animate-slide-up">
        <div className="text-center mb-8">
           <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-500/30 transform -rotate-6">
             <Wallet className="text-white" size={40} />
           </div>
           <h1 className="text-2xl font-bold text-gray-900">Orange Finance</h1>
           <p className="text-gray-500 text-sm">by Swinfosystems</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-transparent outline-none font-semibold text-gray-800" placeholder="John Doe" required />
            </div>
          )}
          <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
             <label className="block text-[10px] font-bold text-gray-400 uppercase">Email</label>
             <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent outline-none font-semibold text-gray-800" placeholder="name@mail.com" required />
          </div>
          <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
             <label className="block text-[10px] font-bold text-gray-400 uppercase">Password</label>
             <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent outline-none font-semibold text-gray-800" placeholder="••••••••" required />
          </div>
          <button disabled={loading} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500">
          {isLogin ? "New here? " : "Have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-orange-600 font-bold hover:underline">{isLogin ? 'Sign Up' : 'Log In'}</button>
        </p>
      </div>
    </div>
  );
};

// 🏠 DASHBOARD (Protected)
const Dashboard = ({ session, supabase }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Forms
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', type: 'expense' });
  const [catForm, setCatForm] = useState({ name: '', icon_key: 'Star', type: 'expense' });
  
  const [avatarUrl, setAvatarUrl] = useState(session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`);
  const fileInputRef = useRef(null);
  
  // Analytics Filters
  const [filterTime, setFilterTime] = useState('month'); 
  const [filterType, setFilterType] = useState('all'); 

  // Offline Hook
  const { isOnline, isSyncing } = useOfflineSync(supabase, session.user.id);

  // --- 🔄 FETCH DATA ---
  const fetchData = async () => {
    if (!session.user) return;
    const cacheKeyTx = `cached_tx_${session.user.id}`;
    const cacheKeyCat = `cached_cat_${session.user.id}`;

    // Load from cache
    const cachedTx = localStorage.getItem(cacheKeyTx);
    const cachedCat = localStorage.getItem(cacheKeyCat);
    if (cachedTx) setTransactions(JSON.parse(cachedTx));
    if (cachedCat) setCategories([...DEFAULT_CATEGORIES, ...JSON.parse(cachedCat)]);

    if (!isOnline) { setLoading(false); return; }

    // Fetch Fresh
    try {
      const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      const { data: catData } = await supabase.from('categories').select('*').order('usage_count', { ascending: false });
      
      if (txData) {
        setTransactions(txData);
        localStorage.setItem(cacheKeyTx, JSON.stringify(txData));
      }
      if (catData && catData.length > 0) {
        const customCats = catData.filter(c => !DEFAULT_CATEGORIES.some(d => d.name === c.name));
        setCategories([...DEFAULT_CATEGORIES, ...customCats]); 
        localStorage.setItem(cacheKeyCat, JSON.stringify(customCats));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    if (isOnline) {
      const channel = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public' }, fetchData).subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [isOnline]);

  // --- 📝 TRANSACTIONS ---
  const handleSaveTx = async () => {
    if (!formData.amount || !formData.title) return;
    const txData = {
      user_id: session.user.id,
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      date: new Date().toISOString()
    };

    if (isOnline) {
      if (editingTx) {
        await supabase.from('transactions').update(txData).eq('id', editingTx.id);
      } else {
        await supabase.from('transactions').insert([txData]);
        const cat = categories.find(c => c.name === formData.category);
        if (cat && cat.id) { 
           await supabase.from('categories').update({ usage_count: (cat.usage_count || 0) + 1 }).eq('id', cat.id);
        }
      }
    } else {
      const action = editingTx ? 'UPDATE' : 'INSERT';
      const payload = editingTx ? { ...txData, id: editingTx.id } : txData;
      const pendingKey = `pending_tx_${session.user.id}`;
      const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
      pending.push({ action, data: payload });
      localStorage.setItem(pendingKey, JSON.stringify(pending));
      fetchData(); 
    }

    setShowModal(false);
    setEditingTx(null);
    setFormData({ title: '', amount: '', category: 'Food', type: 'expense' });
  };

  const handleEditClick = (tx) => {
    setEditingTx(tx);
    setFormData({ title: tx.title, amount: tx.amount, category: tx.category, type: tx.type });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    if (isOnline) {
      await supabase.from('transactions').delete().eq('id', id);
    } else {
      const pendingKey = `pending_tx_${session.user.id}`;
      const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
      pending.push({ action: 'DELETE', id });
      localStorage.setItem(pendingKey, JSON.stringify(pending));
      fetchData(); 
    }
  };

  // --- 🏷️ CATEGORIES ---
  const handleSaveCategory = async () => {
    if (!catForm.name) return;
    if (isOnline) {
      await supabase.from('categories').insert([{
        user_id: session.user.id,
        name: catForm.name,
        type: catForm.type,
        icon_key: catForm.icon_key,
        usage_count: 0
      }]);
    } else {
      alert("Category creation requires online connection to sync correctly.");
      return;
    }
    setShowCatModal(false);
    setCatForm({ name: '', icon_key: 'Star', type: 'expense' });
  };

  // --- 🖼️ AVATAR ---
  const handleAvatarUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const fileName = `${session.user.id}-${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
      setAvatarUrl(data.publicUrl);
    } catch (error) { alert("Error: " + error.message); }
  };

  // --- 📊 DERIVED STATE ---
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
  }, [categories]);

  const filteredTx = useMemo(() => {
    let filtered = transactions;
    const now = new Date();
    if (filterTime === 'month') filtered = filtered.filter(t => new Date(t.date).getMonth() === now.getMonth());
    else if (filterTime === 'quarter') {
      const d = new Date(); d.setMonth(d.getMonth() - 3);
      filtered = filtered.filter(t => new Date(t.date) >= d);
    }
    if (filterType !== 'all') filtered = filtered.filter(t => t.type === filterType);
    return filtered;
  }, [transactions, filterTime, filterType]);

  const stats = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [transactions]);

  const reportData = useMemo(() => {
    const relevantTx = filteredTx.filter(t => t.type === 'expense');
    const grouped = {};
    relevantTx.forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
    return Object.keys(grouped).map(cat => ({ 
      label: cat, value: grouped[cat], color: 'gray-500' 
    })).sort((a,b) => b.value - a.value);
  }, [filteredTx]);

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="flex h-screen bg-[#fff7ed] text-slate-800 overflow-hidden">
      <PrintView user={session.user} stats={stats} reportData={reportData} transactions={filteredTx} />

      {/* 🖥️ DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-orange-100 flex-col p-6 shadow-sm z-20 no-print">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-md"><Wallet size={20} /></div>
          <h1 className="text-xl font-bold text-gray-900">Orange</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}><LayoutDashboard size={20} /> Dashboard</button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}><PieChart size={20} /> Reports</button>
        </nav>
        <div className="mt-auto pt-6 border-t border-orange-50 text-center">
          <p className="text-[10px] text-gray-400 mb-4">Powered by <a href="https://swinfosystems.online" target="_blank" className="underline">Swinfosystems</a></p>
          <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 text-red-500 text-sm font-medium hover:bg-red-50 py-2 rounded-lg transition-colors"><LogOut size={16} /> Sign Out</button>
        </div>
      </aside>

      {/* 📱 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative no-print">
        <div className="max-w-5xl mx-auto px-6 py-8 pb-32 lg:pb-8">
          
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full border-2 border-orange-200 overflow-hidden cursor-pointer" onClick={() => fileInputRef.current.click()}>
                 <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                 <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
               </div>
               <div>
                 <p className="text-xs font-bold text-orange-800/60 uppercase">{greeting}</p>
                 <h2 className="text-lg font-bold text-gray-900 truncate max-w-[150px]">{session.user.user_metadata.full_name?.split(' ')[0]}</h2>
               </div>
            </div>
            {!isOnline && <div className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse"><WifiOff size={14} /> Offline</div>}
            {isOnline && isSyncing && <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold"><RefreshCw size={14} className="animate-spin" /> Syncing...</div>}
            <div className="hidden lg:flex items-center gap-4">
               <button onClick={() => { setEditingTx(null); setShowModal(true); }} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"><Plus size={18} /> Add New</button>
            </div>
          </header>

          {activeTab === 'home' ? (
            <div className="animate-fade-in space-y-8">
               <div className="bg-mesh rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden transform transition-all hover:scale-[1.01]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
                     <div>
                        <div className="flex items-center gap-2 mb-2 opacity-90"><span className="text-xs font-bold uppercase tracking-widest">Total Balance</span></div>
                        <h1 className="text-5xl font-extrabold tracking-tight">₹ {stats.balance.toLocaleString()}</h1>
                     </div>
                     <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-1 md:flex-none bg-black/10 backdrop-blur-md rounded-2xl p-4 min-w-[140px] border border-white/10">
                           <div className="flex items-center gap-2 text-emerald-100 mb-1"><ArrowDownLeft size={16} /> <span className="text-xs font-bold uppercase">Income</span></div>
                           <p className="font-bold text-xl">₹{stats.income.toLocaleString()}</p>
                        </div>
                        <div className="flex-1 md:flex-none bg-black/10 backdrop-blur-md rounded-2xl p-4 min-w-[140px] border border-white/10">
                           <div className="flex items-center gap-2 text-rose-100 mb-1"><ArrowUpRight size={16} /> <span className="text-xs font-bold uppercase">Expense</span></div>
                           <p className="font-bold text-xl">₹{stats.expense.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Financial Tools</h3>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                     {TOOLS.map(t => (
                       <div key={t.id} className="min-w-[100px] bg-white p-4 rounded-2xl border border-orange-50 warm-shadow flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform cursor-pointer">
                          <div className={`p-3 rounded-xl ${t.bg} ${t.color}`}><t.icon size={20}/></div>
                          <span className="text-xs font-bold text-gray-600">{t.name}</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div>
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                    <span className="text-[10px] text-gray-400">Tap to edit</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transactions.map(t => {
                      const CatIcon = ICON_MAP[categories.find(c => c.name === t.category)?.icon_key || 'Star'];
                      return (
                        <div key={t.id} onClick={() => handleEditClick(t)} className="bg-white p-4 rounded-2xl border border-gray-50 warm-shadow flex items-center justify-between group hover:border-orange-200 transition-colors cursor-pointer active:scale-95">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                {CatIcon ? <CatIcon size={20} /> : <Star size={20} />}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 text-sm truncate w-32">{t.title}</h4>
                                <p className="text-xs text-gray-400 font-medium">{t.date ? new Date(t.date).toLocaleDateString() : 'Syncing...'}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className={`block font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>{t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}</span>
                              <div className="flex justify-end gap-2 mt-1">
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className="text-red-400 p-1 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                              </div>
                           </div>
                        </div>
                      )
                    })}
                    {transactions.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No transactions found.</div>}
                  </div>
               </div>
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div><h2 className="text-2xl font-bold text-gray-900">Analytics</h2><p className="text-sm text-gray-500">Track your spending patterns</p></div>
                  <div className="flex gap-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex">
                       <button onClick={() => setFilterTime('month')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterTime === 'month' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>Month</button>
                       <button onClick={() => setFilterTime('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterTime === 'all' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>All</button>
                    </div>
                    <button onClick={() => window.print()} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"><Download size={14}/> PDF</button>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] warm-shadow border border-gray-50">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Spending Trend</h4>
                      <TrendBarChart transactions={transactions} />
                  </div>
                  <div className="space-y-3">
                      {reportData.map((cat, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                           <span className="font-bold text-gray-700 text-sm">{cat.label}</span>
                           <div className="text-right">
                              <span className="block font-bold text-gray-900">₹{cat.value.toLocaleString()}</span>
                              <div className="w-32 bg-gray-100 h-1.5 rounded-full mt-1 ml-auto"><div className="h-full rounded-full bg-orange-500" style={{width: `${Math.min((cat.value / (stats.expense || 1))*100, 100)}%`}}></div></div>
                           </div>
                        </div>
                      ))}
                  </div>
               </div>
            </div>
          )}
          
          <div className="mt-12 text-center border-t border-orange-100 pt-6 no-print">
             <p className="text-xs text-gray-400 font-medium">Developed by <a href="https://swinfosystems.online" target="_blank" className="text-orange-500 hover:underline">Swinfosystems</a></p>
             <p className="text-[10px] text-gray-300 mt-1">fin.swinfosystems.online</p>
          </div>
        </div>
      </main>

      {/* 📱 MOBILE NAV */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-2 rounded-[2rem] shadow-2xl border border-white/50 flex justify-between items-center z-50 max-w-sm mx-auto no-print">
         <button onClick={() => setActiveTab('home')} className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors ${activeTab === 'home' ? 'bg-orange-50 text-orange-600' : 'text-gray-400'}`}><LayoutDashboard size={20} /></button>
         <div className="relative -top-8">
            <button onClick={() => { setEditingTx(null); setShowModal(true); }} className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all border-4 border-white"><Plus size={28} /></button>
         </div>
         <button onClick={() => setActiveTab('reports')} className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors ${activeTab === 'reports' ? 'bg-orange-50 text-orange-600' : 'text-gray-400'}`}><PieChart size={20} /></button>
      </nav>

      {/* --- ADD/EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center no-print">
           <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
           <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] p-8 animate-slide-up h-[85vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-900">{editingTx ? 'Edit Transaction' : 'Add Transaction'}</h2>
                 <button onClick={() => setShowModal(false)} className="bg-gray-50 p-2 rounded-full"><X size={20}/></button>
              </div>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-6">
                 {['expense', 'income'].map(t => (
                   <button key={t} onClick={() => setFormData({...formData, type: t})} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${formData.type === t ? 'bg-white shadow text-gray-900' : 'text-gray-400'}`}>{t}</button>
                 ))}
              </div>
              <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6">
                 <div className="text-center">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</label>
                    <div className="flex justify-center items-center gap-2 mt-2">
                       <span className="text-3xl text-gray-300 font-bold">₹</span>
                       <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="text-5xl font-extrabold text-gray-900 w-40 text-center outline-none" placeholder="0" autoFocus />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-center mb-3">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                       <button onClick={() => setShowCatModal(true)} className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">+ Custom</button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                       {sortedCategories.filter(c => c.type === formData.type).slice(0, 8).map(cat => {
                         const Icon = ICON_MAP[cat.icon_key] || Star;
                         return (
                           <button key={cat.name} onClick={() => setFormData({...formData, category: cat.name})} className={`flex flex-col items-center gap-2 p-2 rounded-2xl border-2 transition-all ${formData.category === cat.name ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:bg-gray-50'}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.category === cat.name ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}><Icon size={18} /></div>
                              <span className="text-[10px] font-bold text-gray-500 truncate w-full text-center">{cat.name}</span>
                           </button>
                         )
                       })}
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Note</label>
                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-100" placeholder="e.g. Dinner" />
                 </div>
                 <button onClick={handleSaveTx} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-transform">{editingTx ? 'Update Transaction' : 'Save Transaction'}</button>
              </div>
           </div>
        </div>
      )}

      {/* --- NEW CATEGORY MODAL --- */}
      {showCatModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center no-print">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCatModal(false)}></div>
           <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-fade-in m-4">
              <h3 className="text-xl font-bold mb-4">New Category</h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Name</label>
                    <input autoFocus value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full border-b-2 border-orange-100 py-2 font-bold text-lg outline-none focus:border-orange-500" placeholder="e.g. Gym" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Icon</label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                       {Object.keys(ICON_MAP).map(key => {
                         const Icon = ICON_MAP[key];
                         return (
                           <button key={key} onClick={() => setCatForm({...catForm, icon_key: key})} className={`p-2 rounded-xl border ${catForm.icon_key === key ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500'}`}><Icon size={18} /></button>
                         )
                       })}
                    </div>
                 </div>
                 <div className="flex gap-2">
                    {['expense', 'income'].map(t => (
                       <button key={t} onClick={() => setCatForm({...catForm, type: t})} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border ${catForm.type === t ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500'}`}>{t}</button>
                    ))}
                 </div>
                 <button onClick={handleSaveCategory} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg mt-2">Create Category</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
