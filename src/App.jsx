import React, { useState, useEffect } from 'react';
import { Loader2, Heart, Sparkles, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handlePayment } from './utils/razorpay';
import { supabase } from './config/supabase';
import { AuthScreen } from './screens/AuthScreen';
import { Dashboard } from './screens/Dashboard';

// --- SYSTEM MANAGER (PWA & SETUP) ---
const SystemSetup = () => {
  useEffect(() => {
    // 1. Google Fonts
    if (!document.getElementById('google-fonts')) {
      const link = document.createElement('link');
      link.id = 'google-fonts';
      link.rel = 'stylesheet';
      link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }

    // 2. Service Worker Registration
    if ('serviceWorker' in navigator && !window.location.href.includes('blob:')) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW Registered:', reg))
        .catch(err => console.log('SW Fail:', err));
    }

    // 3. PWA Meta Tags
    document.title = "Orange Finance | Swinfosystems";
    let metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement('meta');
      metaViewport.name = "viewport";
      document.head.appendChild(metaViewport);
    }
    metaViewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

  }, []);
  return null;
};

const SupportOverlay = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [customAmount, setCustomAmount] = useState('');

  const donate = async (amt) => {
    const finalAmount = amt || parseInt(customAmount);
    if (!finalAmount || finalAmount < 1) {
      alert("Please enter a valid amount");
      return;
    }

    const userName = user?.user_metadata?.full_name || 'Supporter';
    handlePayment({
      amount: finalAmount,
      user: user,
      description: `Support by ${userName} to fin.swinfosystems.online`,
      notes: {
        "Infrastructure": "Thanks to agriwadi for support",
        "Platform": "fin.swinfosystems.online"
      },
      onSuccess: () => {
        localStorage.setItem(`donated_${user.id}`, 'true');
        onComplete();
      },
      onError: (err) => {
        alert("Payment canceled or failed.");
        onComplete();
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-[500] bg-slate-900/90 backdrop-blur-3xl flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 40, rotateX: 15 }} animate={{ scale: 1, y: 0, rotateX: 0 }}
        className="max-w-xl w-full bg-white rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative border border-white/20"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500"></div>
        <button onClick={onComplete} className="absolute top-8 right-8 p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
          <X size={20} className="text-slate-400" />
        </button>

        <div className="p-16 text-center">
          <div className="w-24 h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 relative">
            <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full animate-pulse"></div>
            <Heart size={48} className="text-orange-500 fill-orange-500 relative z-10" />
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase">Direct Support</h2>
          <p className="text-slate-500 font-bold leading-relaxed mb-12 max-w-sm mx-auto uppercase text-[10px] tracking-[0.2em] opacity-60">
            swinfosystems x agriwadi <br /> empowering financial freedom
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[100, 500, 1000].map(amt => (
              <button
                key={amt}
                onClick={() => donate(amt)}
                className="bg-slate-50 hover:bg-slate-900 hover:text-white border-2 border-slate-100 hover:border-slate-800 p-8 rounded-[2rem] transition-all group scale-active"
              >
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-40 group-hover:opacity-100">Tier {amt === 100 ? 'I' : amt === 500 ? 'II' : 'III'}</p>
                <p className="text-3xl font-black italic tabular-nums">₹{amt}</p>
              </button>
            ))}
          </div>

          <div className="relative mb-10 group">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
              <span className="text-2xl font-black text-slate-300 group-focus-within:text-orange-500 transition-colors">₹</span>
            </div>
            <input
              type="number"
              placeholder="Enter Custom Amount..."
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] pl-16 pr-8 py-8 font-black text-2xl focus:border-slate-900 outline-none transition-all placeholder:text-slate-200"
            />
          </div>

          <Button
            onClick={() => donate(null)}
            className="w-full py-8 text-xl shadow-2xl rounded-[2rem] uppercase tracking-widest font-black flex items-center justify-center gap-4"
          >
            Initiate Contribution <ArrowRight size={24} />
          </Button>

          <button onClick={onComplete} className="mt-10 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] hover:text-slate-900 transition-colors">
            Exit Mission Portal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: session }));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: session }));
      } else {
        localStorage.removeItem('supabase.auth.token');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    if (session) {
      const hasSeenSupport = localStorage.getItem(`support_seen_${session.user.id}`);
      if (!hasSeenSupport) {
        setShowSupport(true);
        localStorage.setItem(`support_seen_${session.user.id}`, 'true');
      }
    }
  }, [session]);

  return (
    <>
      <SystemSetup />
      <AnimatePresence>
        {showSupport && session && (
          <SupportOverlay user={session.user} onComplete={() => setShowSupport(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {loading && !session ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center bg-bg-warm transition-all"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse mb-6">
              <Loader2 className="animate-spin text-white" size={40} />
            </div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">Initializing Fin...</p>
          </motion.div>
        ) : (
          !session ? <AuthScreen key="auth" supabase={supabase} /> : <Dashboard key="dash" session={session} supabase={supabase} />
        )}
      </AnimatePresence>
    </>
  );
}
