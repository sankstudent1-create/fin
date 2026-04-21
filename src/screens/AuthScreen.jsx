
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Mail, Lock, ArrowRight, Loader2, Sparkles, User, AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { supabase } from '../config/supabase';

export const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);
    const [supabaseDown, setSupabaseDown] = useState(false);

    // Track online/offline
    useEffect(() => {
        const on = () => { setIsOffline(false); setSupabaseDown(false); setError(null); };
        const off = () => { setIsOffline(true); };
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);

    // ─── Human-readable error mapper ────────────────────────────────────────
    const friendlyError = (err) => {
        const msg = err?.message || '';
        console.error('%c🔴 Auth Error', 'color:#ef4444;font-weight:bold', {
            message: msg, code: err?.code, status: err?.status, raw: err
        });
        // Network / connectivity
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('TIMEOUT') || msg.includes('ERR_CONNECTION')) {
            setSupabaseDown(true);
            return null; // Special banner is shown instead
        }
        // Auth specific
        if (msg.includes('Invalid login credentials'))
            return 'Wrong email or password. Please try again.';
        if (msg.includes('Email not confirmed'))
            return 'Please confirm your email first. Check your inbox for the verification link.';
        if (msg.includes('User already registered'))
            return 'An account with this email already exists. Try signing in instead.';
        if (msg.includes('Password should be'))
            return 'Password must be at least 6 characters.';
        if (msg.includes('rate limit') || msg.includes('429'))
            return 'Too many attempts. Please wait a minute before trying again.';
        if (msg.includes('signup is disabled'))
            return 'New sign-ups are currently disabled. Contact the administrator.';
        // Fallback — show raw message but also log it
        return msg || 'An unexpected error occurred. See browser console for details.';
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        if (isOffline) return;
        setLoading(true);
        setError(null);
        setSupabaseDown(false);

        console.group('%c🔐 Auth Attempt', 'color:#f97316;font-weight:bold');
        console.log('Mode:', isLogin ? 'Sign In' : 'Sign Up', '| Email:', email);

        try {
            if (isLogin) {
                console.log('→ Calling supabase.auth.signInWithPassword …');
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                console.log('%c✅ Sign In OK', 'color:#16a34a;font-weight:bold', data?.user?.email);
            } else {
                console.log('→ Calling supabase.auth.signUp …');
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName, avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` } },
                });
                if (error) throw error;
                console.log('%c✅ Sign Up OK', 'color:#16a34a;font-weight:bold', data?.user?.email);
                alert('Account created! Check your email for the confirmation link.');
            }
        } catch (err) {
            const msg = friendlyError(err);
            if (msg) setError(msg);
        } finally {
            console.groupEnd();
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (isOffline) return;
        console.log('%c🔐 Google OAuth initiated', 'color:#f97316;font-weight:bold');
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
            if (error) throw error;
        } catch (err) {
            const msg = friendlyError(err);
            if (msg) setError(msg);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Please enter your email address first, then click Forgot Password.');
            return;
        }
        setForgotLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: 'https://fin.swinfosystems.online',
            });
            if (error) throw error;
            setForgotSent(true);
            setTimeout(() => setForgotSent(false), 8000);
        } catch (err) {
            const msg = friendlyError(err);
            if (msg) setError(msg);
        }
        setForgotLoading(false);
    };

    return (
        <div className="min-h-screen w-full font-sans overflow-hidden bg-[#050505] flex lg:grid lg:grid-cols-2 selection:bg-orange-500/30 text-slate-50 antialiased">
            
            {/* ─── Left Marketing Panel (Desktop Only) ─── */}
            <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden bg-[#0B0D0F]">
                {/* Visual Background meshes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                    <div 
                        className="absolute inset-0 mix-blend-overlay z-0 opacity-20"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    ></div>
                    <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-gradient-to-br from-orange-600/30 via-rose-600/20 to-[#050505]/30 rounded-full blur-[140px] mix-blend-screen" />
                    <motion.div animate={{ rotate: -360, scale: [1, 1.3, 1] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[20%] -left-[10%] w-[900px] h-[900px] bg-gradient-to-tr from-rose-600/20 via-orange-500/20 to-amber-500/10 rounded-full blur-[160px] mix-blend-screen" />
                </div>
                
                <div className="relative z-10 flex items-center gap-4">
                    <motion.div 
                        animate={{ rotate: [0, 10, 0, -10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-14 h-14 bg-gradient-to-br from-orange-500 via-rose-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.5)] border border-white/20 relative overflow-hidden"
                    >
                        <div className="absolute inset-x-0 top-0 h-px bg-white/40"></div>
                        <Wallet className="text-white drop-shadow-lg relative z-10" size={28} />
                    </motion.div>
                    <h1 className="text-3xl font-black tracking-tight text-white font-outfit">Orange <span className="font-light text-white/40">Finance</span></h1>
                </div>

                <div className="relative z-10 space-y-10 max-w-xl">
                    <h2 className="text-6xl font-black leading-[1.1] tracking-tighter text-white drop-shadow-2xl font-outfit">
                        The evolution of <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400">financial control.</span>
                    </h2>
                    <p className="text-xl text-white/50 font-medium leading-relaxed font-outfit">
                        Scale your net worth with enterprise-grade analytics, smart forecasting, and a premium workspace designed for modern investors.
                    </p>

                    <div className="flex items-center gap-8 pt-6">
                        <div className="flex -space-x-5">
                            {[1,2,3,4,5].map(i => (
                                <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i*7}`} className="w-14 h-14 rounded-full border-4 border-[#0B0D0F] bg-[#14161A] shadow-xl" alt="user" />
                            ))}
                        </div>
                        <div className="text-sm font-bold font-outfit uppercase tracking-widest">
                            <p className="text-orange-500">Global Trust</p>
                            <p className="text-white/40">10k+ Portfolios</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-white/30 text-sm font-medium">
                    &copy; {new Date().getFullYear()} Orange Finance. All rights reserved.
                </div>
            </div>

            {/* ─── Right Auth Form Panel ─── */}
            <div className="w-full flex items-center justify-center p-4 sm:p-8 relative z-10">
                {/* Mobile Background Effects */}
                <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none select-none">
                    <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-gradient-to-br from-orange-600/20 to-rose-600/10 rounded-full blur-[100px] mix-blend-screen" />
                </div>

                <div className="w-full max-w-[440px] relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
                        className="relative w-full rounded-[2.5rem] bg-[#181A20]/80 backdrop-blur-3xl border border-white/5 p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden group/card"
                    >
                    {/* Inner highlight for premium hardware feel */}
                    <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10 pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    
                    {/* Ambient glow inside card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-orange-500/20 blur-[50px] pointer-events-none opacity-50 group-hover/card:opacity-100 transition-opacity duration-1000"></div>

                    {/* Header */}
                    <div className="mb-10 text-center relative z-10">
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                            className="w-20 h-20 bg-gradient-to-br from-orange-500 to-rose-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(249,115,22,0.4)] text-white relative overflow-hidden group"
                        >
                            <motion.div 
                                className="absolute inset-0 bg-white/30 rotate-45" 
                                initial={{ translateX: '-150%' }}
                                animate={{ translateX: '250%' }} 
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }} 
                            />
                            <Wallet size={36} className="relative z-10 drop-shadow-md" />
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md"
                        >
                            {isLogin ? 'Welcome Back' : 'Join Orange'}
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                            className="text-white/60 font-medium text-sm sm:text-base leading-relaxed tracking-wide"
                        >
                            {isLogin ? 'Enter your credentials to access your portfolio.' : 'Start your journey to better financial health today.'}
                        </motion.p>
                    </div>

                    <AnimatePresence>
                        {/* ── Offline banner ── */}
                        {isOffline && (
                            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 bg-rose-500/20 border border-rose-500/30 text-rose-100 px-4 py-3 rounded-2xl text-sm font-medium mb-6 shadow-lg backdrop-blur-md">
                                <WifiOff size={18} className="text-rose-400 shrink-0" />
                                <div>
                                    <p className="font-bold tracking-wide text-rose-200">You're offline</p>
                                    <p className="text-rose-200/70 text-xs">Reconnect to sign in to your account.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Supabase paused banner ── */}
                        {supabaseDown && (
                            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }}
                                className="bg-orange-500/20 border border-orange-500/30 px-4 py-3 rounded-2xl text-sm mb-6 shadow-lg backdrop-blur-md">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={18} className="text-orange-400 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-bold text-orange-200 tracking-wide">Backend Unreachable</p>
                                        <p className="text-orange-200/70 text-xs mt-0.5 leading-relaxed">
                                            The backend is currently starting up or unresponsive.
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => { setSupabaseDown(false); setError(null); }}
                                                className="text-xs font-bold bg-orange-500/30 text-orange-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-orange-500/50 transition-colors">
                                                <RefreshCw size={12} /> Retry Connection
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Auth error ── */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }}
                                className="bg-rose-500/20 border border-rose-500/30 text-rose-200 px-4 py-3 rounded-2xl text-sm font-medium flex items-start gap-3 mb-6 shadow-lg backdrop-blur-md overflow-hidden"
                            >
                                <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-400" />
                                <div>
                                    <p className="font-bold text-rose-100 mb-0.5 tracking-wide">Authentication Failed</p>
                                    <p className="text-rose-200/80 text-xs leading-relaxed">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                        <AnimatePresence mode='wait'>
                            {!isLogin && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="mb-4"
                                >
                                    <div className="relative group">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-400 group-focus-within:scale-110 transition-all" />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="auth-input w-full"
                                            required={!isLogin}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-4">
                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-400 group-focus-within:scale-110 transition-all" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="auth-input w-full"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-6">
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-400 group-focus-within:scale-110 transition-all" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="auth-input w-full"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Forgot Password */}
                        <AnimatePresence>
                            {isLogin && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex justify-end -mt-1 pt-1"
                                >
                                    {forgotSent ? (
                                        <p className="text-xs font-bold text-emerald-400">✅ Link sent! Check inbox.</p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            disabled={forgotLoading}
                                            className="text-xs font-bold text-orange-400 hover:text-orange-300 hover:underline transition-all disabled:opacity-50 tracking-wide"
                                        >
                                            {forgotLoading ? 'Processing...' : 'Recover Password'}
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading || isOffline}
                                className="w-full relative group/btn overflow-hidden bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black py-4 rounded-2xl shadow-[0_8px_30px_rgba(249,115,22,0.4)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed glass-panel"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                                <span className="relative z-10 flex items-center gap-2 tracking-wide text-lg">
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>
                                            {isLogin ? 'Sign In Securely' : 'Create Account'} 
                                            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </motion.div>
                    </form>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <span className="relative bg-[#1A1A1C] px-4 text-[10px] font-black text-white/40 uppercase tracking-widest rounded-full py-1.5 border border-white/10">
                            Quick Access
                        </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="grid grid-cols-2 gap-4">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 py-3 rounded-2xl font-bold text-white transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => alert("Guest mode coming soon!")}
                            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 py-3 rounded-2xl font-bold text-white transition-all shadow-sm group"
                        >
                            <Sparkles size={18} className="text-orange-400 group-hover:scale-110 transition-transform" />
                            Guest
                        </motion.button>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 text-center pt-6 border-t border-white/10">
                        <p className="text-white/50 text-sm font-medium tracking-wide">
                            {isLogin ? "New to Orange Finance?" : "Already have an account?"}{" "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-orange-400 font-bold hover:text-orange-300 hover:underline hover:underline-offset-4 transition-all ml-1"
                            >
                                {isLogin ? 'Create an account' : 'Sign In instead'}
                            </button>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    </div>
    );
};
