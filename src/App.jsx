import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Tesseract from 'tesseract.js';
// ⚠️ FOR VERCEL DEPLOYMENT: Uncomment the line below and install the package
// import { createClient } from '@supabase/supabase-js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  Plus, Wallet, Coffee, ShoppingBag, Car, Zap, Home, Heart, Smartphone, 
  Briefcase, Laptop, Gift, Star, X, Calendar, ArrowDownLeft, ArrowUpRight, 
  PieChart, List, ChevronRight, Lock, Mail, User, LogOut, Sparkles, 
  TrendingUp, Percent, ShieldCheck, Coins, Download, AlertCircle, Loader2, Trash2, Camera,
  WifiOff, RefreshCw, LayoutDashboard, FileText, Edit2, Globe, Tag, Baby,
  Smile, Filter, ChevronDown, CreditCard, Settings, Bell, CheckCircle2, Search,
  Image as ImageIcon, Sparkle, Scan, History, ArrowRight, Trash, Pencil, MoreVertical
} from 'lucide-react';

// --- 🟢 CONFIGURATION ---
const SUPABASE_URL = "https://rtcwtaweamrgyimyhhup.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Y3d0YXdlYW1yZ3lpbXloaHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDcyODEsImV4cCI6MjA4NTE4MzI4MX0.6bD8rcBJjoi0pRBOPEWiToPDZ_09-aVu7MgYZIS7a-8";

// --- 🎨 SYSTEM MANAGER (Styles & Scripts) ---
const SystemManager = ({ onLoad }) => {
  useEffect(() => {
    // 1. Tailwind CSS
    if (!document.getElementById('tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => {
        window.tailwind.config = {
          theme: {
            extend: {
              colors: {
                orange: { 50: '#fff7ed', 100: '#ffedd5', 500: '#f97316', 600: '#ea580c' },
                emerald: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669' },
                rose: { 50: '#fff1f2', 100: '#ffe4e6', 500: '#f43f5e', 600: '#e11d48' }
              },
              fontFamily: {
                sans: ['Outfit', 'sans-serif'],
              },
              animation: {
                'bounce-subtle': 'bounce-subtle 2s infinite',
              },
              keyframes: {
                'bounce-subtle': {
                  '0%, 100%': { transform: 'translateY(-5%)' },
                  '50%': { transform: 'translateY(0)' },
                }
              }
            }
          }
        };
      };
      document.head.appendChild(script);
    }

    // 2. Google Fonts
    if (!document.getElementById('google-fonts')) {
      const link = document.createElement('link');
      link.id = 'google-fonts';
      link.rel = 'stylesheet';
      link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }

    // 3. Supabase
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
      const { createClient } = window.supabase;
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      onLoad(client);
    }

    // 4. Service Worker Registration
    if ('serviceWorker' in navigator && !window.location.href.includes('blob:')) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW Registered:', reg))
        .catch(err => console.log('SW Fail:', err));
    }

    // 5. Audio Context for Success Sound
    window.playSuccessSound = () => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      oscillator.stop(audioCtx.currentTime + 0.5);
    };

    window.triggerSuccess = (message) => {
      window.playSuccessSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fb923c', '#fdba74']
      });
    };

  }, []);

  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      body { font-family: 'Outfit', sans-serif; background-color: #fff7ed; color: #431407; -webkit-tap-highlight-color: transparent; }
      .bg-mesh { background-color: #ff9a9e; background-image: radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%); }
      .warm-shadow { box-shadow: 0 10px 40px rgba(234, 88, 12, 0.08); }
      .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.4); }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #fed7aa; border-radius: 10px; }
      
      .input-glow:focus { box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1); border-color: #f97316; }
      .scale-hover { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .scale-hover:hover { transform: scale(1.02); }
      .scale-active:active { transform: scale(0.96); }

      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @page { margin: 0; size: A4; }
        body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        #print-root { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; background: white; padding: 40px; }
        
        .pdf-header-container {
          border-bottom: 2px solid #f97316;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .pdf-brand-section h1 { font-size: 28px; font-weight: 800; color: #ea580c; margin: 0; }
        .pdf-brand-section p { font-size: 12px; color: #9a3412; margin: 4px 0 0 0; }
        
        .pdf-user-section { display: flex; align-items: center; gap: 15px; }
        .pdf-avatar { width: 50px; height: 50px; border-radius: 50%; border: 2px solid #f97316; }
        .pdf-user-info { text-align: right; }
        .pdf-user-name { font-weight: bold; font-size: 16px; color: #1f2937; display: block;}
        .pdf-user-email { font-size: 12px; color: #6b7280; }

        .pdf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .pdf-card { border: 1px solid #fed7aa; background: #fff7ed; padding: 20px; border-radius: 15px; }
        .pdf-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .pdf-table th { text-align: left; color: #9a3412; font-size: 12px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #fdba74; }
        .pdf-table td { padding: 12px 0; border-bottom: 1px solid #fed7aa; font-size: 13px; }
        .pdf-footer { position: fixed; bottom: 20px; width: 100%; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
      }
      .print-only { display: none; }
    `}</style>
  );
};

// --- Config ---
const ICON_MAP = { 
  Coffee, ShoppingBag, Car, Zap, Home, Heart, Smartphone, Briefcase, 
  Laptop, Gift, Star, PieChart, Coins, TrendingUp, ShieldCheck, Baby, 
  Percent, Camera, WifiOff, RefreshCw, LayoutDashboard, FileText, Tag, 
  Globe, Smile, CreditCard, Wallet, Settings, Bell, Search, ImageIcon, Scan 
};

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon_key: 'Coffee', type: 'expense', usage_count: 10 },
  { name: 'Shopping', icon_key: 'ShoppingBag', type: 'expense', usage_count: 8 },
  { name: 'Travel', icon_key: 'Car', type: 'expense', usage_count: 6 },
  { name: 'Bills', icon_key: 'Zap', type: 'expense', usage_count: 5 },
  { name: 'Rent', icon_key: 'Home', type: 'expense', usage_count: 4 },
  { name: 'Salary', icon_key: 'Briefcase', type: 'income', usage_count: 10 },
  { name: 'Freelance', icon_key: 'Laptop', type: 'income', usage_count: 5 },
  // Requested Default Referrals
  { name: 'PhonePe Refer', icon_key: 'Smartphone', type: 'income', usage_count: 3 },
  { name: 'Paytm Refer', icon_key: 'Wallet', type: 'income', usage_count: 3 },
  { name: 'GPay Refer', icon_key: 'CreditCard', type: 'income', usage_count: 3 },
];

const TOOLS = [
  { id: 'sip', name: 'SIP', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'lumpsum', name: 'Lumpsum', icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'fd', name: 'FD', icon: Lock, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'ppf', name: 'PPF', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: 'interest', name: 'Interest', icon: Percent, color: 'text-orange-600', bg: 'bg-orange-100' },
];

// --- 🛠️ OFFLINE & SYNC HOOK ---
const useOfflineSync = (supabase, userId, onSyncComplete) => {
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
      
      const pendingTxKey = `pending_tx_${userId}`;
      const pendingCatKey = `pending_cat_${userId}`;
      
      const pendingTx = JSON.parse(localStorage.getItem(pendingTxKey) || '[]');
      const pendingCat = JSON.parse(localStorage.getItem(pendingCatKey) || '[]');
      
      if (pendingTx.length === 0 && pendingCat.length === 0) return;

      setIsSyncing(true);
      
      // 1. Sync Categories First (Transactions depend on them)
      for (const action of pendingCat) {
        try {
          if (action.action === 'INSERT') {
            await supabase.from('categories').insert([action.data]);
          } else if (action.action === 'DELETE') {
            await supabase.from('categories').delete().eq('id', action.id);
          }
        } catch (e) { console.error("Cat Sync error:", e); }
      }
      localStorage.setItem(pendingCatKey, JSON.stringify([]));

      // 2. Sync Transactions
      for (const action of pendingTx) {
        try {
          if (action.action === 'INSERT') {
            const { id, ...dataToInsert } = action.data;
            await supabase.from('transactions').insert([dataToInsert]);
          } else if (action.action === 'DELETE') {
            await supabase.from('transactions').delete().eq('id', action.id);
          } else if (action.action === 'UPDATE') {
            const { id, ...updates } = action.data;
            await supabase.from('transactions').update(updates).eq('id', id);
          }
        } catch (e) { console.error("Tx Sync error:", e); }
      }
      
      localStorage.setItem(pendingTxKey, JSON.stringify([])); 
      setIsSyncing(false);
      if (onSyncComplete) onSyncComplete();
      window.triggerSuccess?.("All data synced!");
    };
    
    if (isOnline) syncData();
  }, [isOnline, userId, supabase]);

  return { isOnline, isSyncing };
};

// --- 🛠️ HEAD MANAGER (PWA - META ONLY) ---
// Note: Manifest is handled by the physical file now. We only inject meta tags.
const HeadManager = () => {
  useEffect(() => {
    document.title = "Orange Finance | Swinfosystems";
    
    // 1. Force PWA Scaling Limits
    let metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement('meta');
      metaViewport.name = "viewport";
      document.head.appendChild(metaViewport);
    }
    metaViewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

    // 2. Favicon (Explicitly point to root file to avoid conflict)
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = '/favicon.ico';
    document.head.appendChild(link);

    // 3. Apple Meta
    const appleMeta = document.createElement('meta');
    appleMeta.name = "apple-mobile-web-app-capable";
    appleMeta.content = "yes";
    document.head.appendChild(appleMeta);

  }, []);
  return null;
};

// --- 📊 COMPONENTS ---

// --- 🖼️ SUCCESS NOTIFICATION COMPONENT ---
const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[300px]"
    >
      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
        <CheckCircle2 size={24} className="text-white" />
      </div>
      <div>
        <p className="font-bold text-sm">{message}</p>
        <p className="text-[10px] text-gray-400">Action completed successfully</p>
      </div>
    </motion.div>
  );
};

// --- 📊 COMPONENTS ---

const StatCard = ({ label, value, type, icon: Icon }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white p-6 rounded-[2rem] border border-orange-50 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-50 text-emerald-500' : type === 'expense' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
        <Icon size={16} />
      </div>
    </div>
    <h2 className="text-2xl font-black text-gray-900 tracking-tight">₹ {value.toLocaleString()}</h2>
  </motion.div>
);

const TransactionItem = ({ t, categories, onEdit, onDelete }) => {
  const cat = categories.find(c => c.name === t.category);
  const CatIcon = ICON_MAP[cat?.icon_key] || Star;
  const isEmoji = cat?.isEmoji;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => onEdit(t)}
      className="bg-white p-4 rounded-3xl border border-gray-50 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all cursor-pointer active:scale-95"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'} text-xl shadow-inner`}>
          {isEmoji ? cat.icon_key : <CatIcon size={20} />}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm truncate w-32 tracking-tight">{t.title}</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            {t.category} • {t.date ? new Date(t.date).toLocaleDateString() : 'Syncing...'}
          </p>
        </div>
      </div>
      <div className="text-right flex items-center gap-3">
        <div>
          <span className={`block font-black text-sm tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
            {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} 
          className="text-gray-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16}/>
        </button>
      </div>
    </motion.div>
  );
};

// --- ⚙️ SETTINGS MODAL COMPONENT ---
const SettingsModal = ({ isOpen, onClose, user, avatarUrl, onAvatarUpload }) => {
  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('app_settings');
    return saved ? JSON.parse(saved) : { soundEnabled: true, darkMode: false, currency: 'INR' };
  });

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-3xl border border-orange-100">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('settings-avatar-input').click()}>
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
                <input id="settings-avatar-input" type="file" className="hidden" onChange={onAvatarUpload} accept="image/*" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{user?.user_metadata?.full_name || 'User'}</h3>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* App Preferences */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preferences</h4>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Bell size={18} className="text-orange-500" /></div>
                  <span className="font-bold text-sm text-gray-700">Sound Effects</span>
                </div>
                <button 
                  onClick={() => setAppSettings(s => ({...s, soundEnabled: !s.soundEnabled}))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${appSettings.soundEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appSettings.soundEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl opacity-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Sparkles size={18} className="text-purple-500" /></div>
                  <span className="font-bold text-sm text-gray-700">Dark Mode (Beta)</span>
                </div>
                <div className="w-12 h-6 rounded-full bg-gray-300 relative">
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => { onClose(); window.playSuccessSound?.(); }}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- 📸 AI RECEIPT SCANNER MODAL ---
const ReceiptScanner = ({ isOpen, onClose, onScanComplete }) => {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [extracted, setExtracted] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setExtracted(null);
    }
  };

  const runOCR = async () => {
    if (!file) return;
    setScanning(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      
      // Simple extraction logic (can be improved with LLM or better regex)
      const amountMatch = text.match(/(?:total|amt|amount|rs|₹)\s*[:.]?\s*(\d+(?:[.,]\d{2})?)/i);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;
      
      const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/);
      const date = dateMatch ? dateMatch[1] : new Date().toLocaleDateString();

      const titleMatch = text.split('\n')[0].trim(); // Usually the merchant name

      setExtracted({ title: titleMatch || 'Scanned Receipt', amount, date });
      window.playSuccessSound?.();
    } catch (err) {
      console.error(err);
      alert("Scan failed. Try again.");
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Scan className="text-orange-500" /> AI Scanner
            </h2>
            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full"><X size={20} /></button>
          </div>

          {!preview ? (
            <div 
              onClick={() => document.getElementById('receipt-input').click()}
              className="border-4 border-dashed border-orange-100 rounded-[2rem] p-12 text-center cursor-pointer hover:bg-orange-50 transition-colors group"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="text-orange-600" size={32} />
              </div>
              <p className="font-bold text-gray-600">Upload Receipt or Screenshot</p>
              <p className="text-xs text-gray-400 mt-2">Supports PNG, JPG</p>
              <input id="receipt-input" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border-2 border-orange-100 h-48 bg-gray-50">
                <img src={preview} className="w-full h-full object-contain" />
                <button onClick={() => setPreview(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm"><X size={16} /></button>
              </div>

              {scanning ? (
                <div className="text-center py-6">
                  <Loader2 className="animate-spin mx-auto text-orange-500 mb-2" size={32} />
                  <p className="font-bold text-gray-600">Extracting Data...</p>
                </div>
              ) : extracted ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-orange-800 uppercase tracking-widest">Extracted Information</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">Description</span>
                    <span className="font-bold text-gray-900">{extracted.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">Amount</span>
                    <span className="font-bold text-orange-600 text-xl">₹ {extracted.amount}</span>
                  </div>
                  <button 
                    onClick={() => { onScanComplete(extracted); onClose(); }}
                    className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg mt-2"
                  >
                    Confirm & Add
                  </button>
                </motion.div>
              ) : (
                <button onClick={runOCR} className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                  Start AI Extraction
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
// --- 📊 COMPONENTS ---
const TrendBarChart = ({ transactions, type }) => {
  const filtered = transactions.filter(t => t.type === type).slice(0, 10).reverse();
  const max = Math.max(...filtered.map(t => t.amount), 100);
  
  if (filtered.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-300">
      <PieChart size={32} className="mb-2 opacity-20" />
      <p className="text-[10px] font-bold uppercase tracking-widest">No data for chart</p>
    </div>
  );

  return (
    <div className="flex items-end justify-between h-40 w-full gap-2 mt-4 px-2">
      {filtered.map((t, i) => (
        <motion.div 
          key={i} 
          initial={{ height: 0 }}
          animate={{ height: `${(t.amount / max) * 100}%` }}
          className="flex flex-col items-center flex-1 group relative"
        >
           <div className={`w-full rounded-t-xl transition-all duration-500 shadow-sm ${t.type === 'income' ? 'bg-gradient-to-t from-emerald-500 to-emerald-300' : 'bg-gradient-to-t from-orange-500 to-orange-300'} group-hover:brightness-110`}>
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
               ₹{t.amount}
             </div>
           </div>
           <span className="text-[8px] font-extrabold text-gray-400 mt-2 uppercase tracking-tighter truncate w-full text-center">
             {t.date ? new Date(t.date).getDate() : '?'}
           </span>
        </motion.div>
      ))}
    </div>
  );
};

const PrintView = ({ user, stats, transactions, avatarUrl, filterLabel }) => (
  <div id="print-root" className="print-only">
    
    <div className="pdf-header-container">
       <div className="pdf-brand-section">
         <h1>Fin by Swinfosystems</h1>
         <p>fin.swinfosystems.online</p>
         <p className="text-[10px] text-gray-500 mt-1">Generated: {new Date().toLocaleDateString()}</p>
       </div>
       <div className="pdf-user-section">
         <div className="pdf-user-info">
            <span className="pdf-user-name">{user?.user_metadata?.full_name || 'User'}</span>
            <span className="pdf-user-email">{user?.email}</span>
         </div>
         <img src={avatarUrl} alt="Profile" className="pdf-avatar" crossOrigin="anonymous" />
       </div>
    </div>

    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Report Summary ({filterLabel})</h2>
    </div>

    <div className="pdf-grid">
       <div className="pdf-card">
          <p className="text-emerald-600 text-xs font-bold uppercase mb-2">Total Income</p>
          <h2 className="text-3xl font-bold text-gray-900">₹ {stats.income.toLocaleString()}</h2>
       </div>
       <div className="pdf-card">
          <p className="text-red-600 text-xs font-bold uppercase mb-2">Total Expense</p>
          <h2 className="text-3xl font-bold text-gray-900">₹ {stats.expense.toLocaleString()}</h2>
       </div>
    </div>

    <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction Details</h3>
    <table className="pdf-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Type</th>
          <th style={{textAlign: 'right'}}>Amount</th>
        </tr>
      </thead>
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

    <div className="pdf-footer">
       Financial Report • Generated via Fin by Swinfosystems • Secure & Private
    </div>
  </div>
);

// --- 🏠 MAIN SCREENS ---
export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSystemLoad = (client) => {
    setSupabase(client);
    
    // Check for cached session first for instant offline access
    const cachedSession = localStorage.getItem('supabase.auth.token');
    if (cachedSession) {
      try {
        const sessionData = JSON.parse(cachedSession);
        if (sessionData && sessionData.currentSession) {
          setSession(sessionData.currentSession);
          setLoading(false);
        }
      } catch (e) { console.error("Session parse error:", e); }
    }

    client.auth.getSession().then(({ data: { session } }) => { 
      if (session) {
        setSession(session);
        localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: session }));
      }
      setLoading(false); 
    });

    client.auth.onAuthStateChange((_event, session) => { 
      setSession(session); 
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: session }));
      } else {
        localStorage.removeItem('supabase.auth.token');
      }
      setLoading(false); 
    });
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
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editingCat, setEditingCat] = useState(null);

  // Forms
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', type: 'expense' });
  const [catForm, setCatForm] = useState({ name: '', icon_key: 'Star', type: 'expense', isEmoji: false });
  
  const [avatarUrl, setAvatarUrl] = useState(session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`);
  const fileInputRef = useRef(null);
  
  // Analytics Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [analysisType, setAnalysisType] = useState('expense'); // expense | income

  const success = (msg) => {
    setSuccessMsg(msg);
    window.triggerSuccess?.(msg);
  };

  // Offline Hook
  const { isOnline, isSyncing } = useOfflineSync(supabase, session.user.id, fetchData);

  // --- 🔄 FETCH DATA ---
  const fetchData = async () => {
    if (!session.user) return;
    const cacheKeyTx = `cached_tx_${session.user.id}`;
    const cacheKeyCat = `cached_cat_${session.user.id}`;

    // Load from cache first
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
        const mergedCats = [...DEFAULT_CATEGORIES, ...customCats];
        setCategories(mergedCats); 
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

  // --- 📝 TRANSACTIONS (Optimistic UI) ---
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
        success("Transaction updated!");
      } else {
        await supabase.from('transactions').insert([txData]);
        success("Transaction saved!");
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
      success(editingTx ? "Update queued (Offline)" : "Saved (Offline)");
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
    
    // Optimistic delete from UI state immediately
    const newTxList = transactions.filter(t => t.id !== id);
    setTransactions(newTxList);
    localStorage.setItem(`cached_tx_${session.user.id}`, JSON.stringify(newTxList));

    if (isOnline) {
      await supabase.from('transactions').delete().eq('id', id);
      success("Transaction deleted");
    } else {
      const pendingKey = `pending_tx_${session.user.id}`;
      const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
      pending.push({ action: 'DELETE', id });
      localStorage.setItem(pendingKey, JSON.stringify(pending));
      success("Deleted (Offline)");
    }
  };

  // --- 🏷️ CATEGORIES ---
  const handleSaveCategory = async () => {
    if (!catForm.name) return;
    const catData = {
      user_id: session.user.id,
      name: catForm.name,
      type: catForm.type,
      icon_key: catForm.icon_key,
      isEmoji: catForm.isEmoji
    };

    if (isOnline) {
      if (editingCat) {
        await supabase.from('categories').update(catData).eq('id', editingCat.id);
        window.triggerSuccess?.("Category updated!");
      } else {
        await supabase.from('categories').insert([{ ...catData, usage_count: 0 }]);
        window.triggerSuccess?.("Category created!");
      }
    } else {
      alert("Connect to internet to manage categories.");
      return;
    }
    fetchData();
    setShowCatModal(false);
    setEditingCat(null);
    setCatForm({ name: '', icon_key: 'Star', type: 'expense', isEmoji: false });
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category? Transactions using it will remain but icons might reset.')) return;
    if (isOnline) {
      await supabase.from('categories').delete().eq('id', id);
      window.triggerSuccess?.("Category deleted");
      fetchData();
    }
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
    if (filterMonth !== 'all') {
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === parseInt(filterMonth) && d.getFullYear() === parseInt(filterYear);
      });
    }
    return filtered;
  }, [transactions, filterMonth, filterYear]);

  const stats = useMemo(() => {
    const inc = filteredTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const exp = filteredTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [filteredTx]);

  const reportData = useMemo(() => {
    const relevantTx = filteredTx.filter(t => t.type === analysisType);
    const grouped = {};
    relevantTx.forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
    return Object.keys(grouped).map(cat => ({ 
      label: cat, value: grouped[cat], color: 'gray-500' 
    })).sort((a,b) => b.value - a.value);
  }, [filteredTx, analysisType]);

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="flex h-screen bg-[#fff7ed] text-slate-800 overflow-hidden">
      <HeadManager />
      {/* Passing filteredTx to print view ensures PDF respects filters */}
      <PrintView 
        user={session.user} 
        stats={stats} 
        reportData={reportData} 
        transactions={filteredTx} 
        avatarUrl={avatarUrl}
        filterLabel={filterMonth === 'all' ? `All Time` : `${monthNames[filterMonth]} ${filterYear}`}
      />

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
               <div className="w-12 h-12 rounded-2xl border-2 border-orange-200 overflow-hidden cursor-pointer shadow-sm hover:border-orange-500 transition-colors" onClick={() => fileInputRef.current.click()}>
                 <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                 <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
               </div>
               <div>
                 <p className="text-[10px] font-extrabold text-orange-600/60 uppercase tracking-tighter">{greeting}</p>
                 <h2 className="text-xl font-bold text-gray-900 tracking-tight">{session.user.user_metadata.full_name?.split(' ')[0]}</h2>
               </div>
            </div>
            <div className="flex items-center gap-3">
              {!isOnline && <div className="flex items-center gap-2 bg-rose-100 text-rose-600 px-3 py-1.5 rounded-full text-[10px] font-bold animate-pulse"><WifiOff size={14} /> Offline</div>}
              {isOnline && isSyncing && <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-bold"><RefreshCw size={14} className="animate-spin" /> Syncing</div>}
              <button 
                onClick={() => setShowSettings(true)} 
                className="p-3 bg-white rounded-2xl border border-orange-50 shadow-sm text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all scale-hover"
              >
                <Settings size={20} />
              </button>
            </div>
          </header>

          {activeTab === 'home' ? (
            <div className="animate-fade-in space-y-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard label="Total Balance" value={stats.balance} icon={Wallet} />
                  <StatCard label="Monthly Income" value={stats.income} type="income" icon={ArrowDownLeft} />
                  <StatCard label="Monthly Expense" value={stats.expense} type="expense" icon={ArrowUpRight} />
               </div>

               <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Financial Tools</h3>
                    <button 
                      onClick={() => setShowScanner(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-[10px] font-bold shadow-lg shadow-orange-500/20 scale-hover active:scale-95 transition-all"
                    >
                      <Scan size={14} /> AI Scan
                    </button>
                  </div>
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
                    <AnimatePresence mode="popLayout">
                      {transactions.map(t => (
                        <TransactionItem 
                          key={t.id} 
                          t={t} 
                          categories={categories} 
                          onEdit={handleEditClick} 
                          onDelete={handleDelete} 
                        />
                      ))}
                    </AnimatePresence>
                    {transactions.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-orange-100"
                      >
                        <Sparkles className="mx-auto text-orange-300 mb-4" size={48} />
                        <p className="text-gray-400 font-bold">No transactions found</p>
                        <p className="text-xs text-gray-300">Tap the + button to start tracking!</p>
                      </motion.div>
                    )}
                  </div>
               </div>
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div><h2 className="text-2xl font-bold text-gray-900">Analytics</h2><p className="text-sm text-gray-500">Track your spending patterns</p></div>
                  <div className="flex flex-wrap gap-2">
                    {/* Month Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex">
                       <select 
                         value={filterMonth} 
                         onChange={(e) => setFilterMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                         className="px-2 py-1.5 text-xs font-bold bg-transparent outline-none text-gray-600"
                       >
                         <option value="all">All Year</option>
                         {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
                       </select>
                    </div>
                    {/* Year Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex">
                       <select 
                         value={filterYear} 
                         onChange={(e) => setFilterYear(parseInt(e.target.value))}
                         className="px-2 py-1.5 text-xs font-bold bg-transparent outline-none text-gray-600"
                       >
                         {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                       </select>
                    </div>
                    <button onClick={() => window.print()} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"><Download size={14}/> PDF</button>
                  </div>
               </div>

               {/* Stats Summary for Selected Period */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl warm-shadow border border-gray-50">
                     <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Income ({filterMonth === 'all' ? 'All' : monthNames[filterMonth]})</p>
                     <p className="text-2xl font-bold text-gray-900">₹{stats.income.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl warm-shadow border border-gray-50">
                     <p className="text-red-600 text-xs font-bold uppercase mb-1">Expense ({filterMonth === 'all' ? 'All' : monthNames[filterMonth]})</p>
                     <p className="text-2xl font-bold text-gray-900">₹{stats.expense.toLocaleString()}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] warm-shadow border border-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase">Analysis</h4>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                           <button onClick={() => setAnalysisType('expense')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${analysisType === 'expense' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>Exp</button>
                           <button onClick={() => setAnalysisType('income')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${analysisType === 'income' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>Inc</button>
                        </div>
                      </div>
                      <TrendBarChart transactions={filteredTx} type={analysisType} />
                  </div>
                  <div className="space-y-3">
                      {reportData.map((cat, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                           <span className="font-bold text-gray-700 text-sm">{cat.label}</span>
                           <div className="text-right">
                              <span className="block font-bold text-gray-900">₹{cat.value.toLocaleString()}</span>
                              <div className="w-32 bg-gray-100 h-1.5 rounded-full mt-1 ml-auto"><div className="h-full rounded-full bg-orange-500" style={{width: `${Math.min((cat.value / (analysisType === 'expense' ? stats.expense : stats.income) || 1)*100, 100)}%`}}></div></div>
                           </div>
                        </div>
                      ))}
                      {reportData.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No data for this period.</p>}
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
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.category === cat.name ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                {cat.isEmoji ? cat.icon_key : <Icon size={18} />}
                              </div>
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
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Icon</label>
                      <button onClick={() => setCatForm(prev => ({ ...prev, isEmoji: !prev.isEmoji }))} className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        {catForm.isEmoji ? 'Switch to Icons' : 'Switch to Emojis'}
                      </button>
                    </div>
                    
                    {catForm.isEmoji ? (
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <input 
                          type="text" 
                          placeholder="Type an emoji (e.g. 🍕)" 
                          className="w-full bg-transparent outline-none text-center text-2xl"
                          maxLength={2}
                          value={catForm.icon_key}
                          onChange={(e) => setCatForm({ ...catForm, icon_key: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                         {Object.keys(ICON_MAP).map(key => {
                           const Icon = ICON_MAP[key];
                           return (
                             <button key={key} onClick={() => setCatForm({...catForm, icon_key: key})} className={`p-2 rounded-xl border ${catForm.icon_key === key ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500'}`}><Icon size={18} /></button>
                           )
                         })}
                      </div>
                    )}
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
      {/* Modals & Popups */}
      <AnimatePresence>
        {successMsg && <SuccessPopup message={successMsg} onClose={() => setSuccessMsg('')} />}
      </AnimatePresence>
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        user={session.user} 
        avatarUrl={avatarUrl}
        onAvatarUpload={handleAvatarUpload}
      />

      <ReceiptScanner 
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanComplete={(data) => {
          setFormData({
            title: data.title,
            amount: data.amount.toString(),
            category: 'Shopping',
            type: 'expense'
          });
          setShowModal(true);
        }}
      />
    </div>
  );
}
