import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './config/supabase';
import { AuthScreen } from './screens/AuthScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';
import { Dashboard } from './screens/Dashboard';
import { SupportModal } from './components/modals/SupportModal';
import { BannerModal } from './components/modals/BannerModal';

import { AdminScreen } from './screens/admin/AdminScreen';

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


export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    // Check if we are on the admin path
    if (window.location.pathname.startsWith('/admin')) {
      setIsAdminRoute(true);
    }

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('%c🔄 Auth Event:', 'color:#f97316;font-weight:bold', event);

      // PASSWORD_RECOVERY: user clicked reset link → show "Set New Password" screen
      if (event === 'PASSWORD_RECOVERY') {
        setSession(session);
        setRecoveryMode(true);
        setLoading(false);
        return; // Don't go to dashboard, stay on reset screen
      }

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
    if (session && !recoveryMode && !isAdminRoute) {
      const hasSeenSupport = localStorage.getItem(`support_seen_${session.user.id}`);
      if (!hasSeenSupport) {
        setShowSupport(true);
        localStorage.setItem(`support_seen_${session.user.id}`, 'true');
      }
    }
  }, [session, recoveryMode, isAdminRoute]);

  // Handle recovery complete → go to dashboard
  const handleRecoveryComplete = () => {
    setRecoveryMode(false);
    // Clean up the URL hash fragments Supabase adds
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Skip rendering the normal app if we are exactly on the admin route
  if (isAdminRoute) {
    return (
      <>
        <SystemSetup />
        <AdminScreen />
      </>
    );
  }

  return (
    <>
      <SystemSetup />
      <AnimatePresence>
        {showSupport && session && !recoveryMode && (
          <BannerModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
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
        ) : recoveryMode && session ? (
          <ResetPasswordScreen key="recovery" onComplete={handleRecoveryComplete} />
        ) : (
          !session ? <AuthScreen key="auth" supabase={supabase} /> : <Dashboard key="dash" session={session} supabase={supabase} />
        )}
      </AnimatePresence>
    </>
  );
}
