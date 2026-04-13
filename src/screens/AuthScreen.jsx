
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
        <div className="min-h-screen w-full flex font-sans bg-white overflow-hidden">
            {/* ─── Left Panel: Auth Form ─── */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 min-h-screen overflow-y-auto hide-scrollbar bg-slate-50 lg:bg-white">
                
                {/* Mobile-only background effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none lg:hidden">
                    <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-[400px] h-[400px] bg-gradient-to-br from-orange-400/20 to-rose-400/10 rounded-full blur-[60px]" />
                    <motion.div animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-rose-300/20 to-orange-500/10 rounded-full blur-[80px]" />
                </div>

                <div className="w-full max-w-md relative z-10 my-auto">
                    {/* Header */}
                    <div className="mb-10 lg:text-left text-center">
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                            className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-[1.2rem] flex items-center justify-center mb-6 shadow-xl shadow-orange-500/30 text-white relative overflow-hidden group lg:mx-0 mx-auto"
                        >
                            <motion.div 
                                className="absolute inset-0 bg-white/30 rotate-45" 
                                initial={{ translateX: '-150%' }}
                                animate={{ translateX: '250%' }} 
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }} 
                            />
                            <Wallet size={28} className="relative z-10 drop-shadow-md" />
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2"
                        >
                            {isLogin ? 'Welcome Back' : 'Join Orange'}
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                            className="text-slate-500 font-medium text-sm sm:text-base"
                        >
                            {isLogin ? 'Enter your credentials to securely access your portfolio.' : 'Start your journey to better financial health today.'}
                        </motion.p>
                    </div>

                    <AnimatePresence>
                        {/* ── Offline banner ── */}
                        {isOffline && (
                            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl text-sm font-medium mb-6 shadow-lg">
                                <WifiOff size={18} className="text-slate-300 shrink-0" />
                                <div>
                                    <p className="font-bold tracking-wide">You're offline</p>
                                    <p className="text-slate-400 text-xs">Reconnect to sign in to your account.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Supabase paused banner ── */}
                        {supabaseDown && (
                            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }}
                                className="bg-orange-50 border border-orange-200 px-4 py-3 rounded-2xl text-sm mb-6 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-bold text-orange-900 tracking-wide">Backend Unreachable</p>
                                        <p className="text-orange-800/80 text-xs mt-0.5 leading-relaxed">
                                            The backend is currently starting up or unresponsive.
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => { setSupabaseDown(false); setError(null); }}
                                                className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-orange-200 transition-colors">
                                                <RefreshCw size={12} /> Retry
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
                                className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-2xl text-sm font-medium flex items-start gap-3 mb-6 shadow-sm overflow-hidden"
                            >
                                <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
                                <div>
                                    <p className="font-bold text-rose-900 mb-0.5 tracking-wide">Authentication Failed</p>
                                    <p className="text-rose-700/80 text-xs leading-relaxed">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20, height: 0 }} 
                                    animate={{ opacity: 1, x: 0, height: 'auto' }} 
                                    exit={{ opacity: 0, x: 20, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="relative group">
                                        <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-100/70 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-orange-500/10"
                                            required={!isLogin}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                            <div className="relative group">
                                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100/70 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-orange-500/10"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                            <div className="relative group">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100/70 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-orange-500/10"
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
                                        <p className="text-xs font-bold text-emerald-600">✅ Link sent! Check inbox.</p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            disabled={forgotLoading}
                                            className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline transition-all disabled:opacity-50"
                                        >
                                            {forgotLoading ? 'Processing...' : 'Recover Password'}
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="pt-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading || isOffline}
                                className="w-full relative group overflow-hidden bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>
                                            {isLogin ? 'Sign In Securely' : 'Create Account'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </motion.div>
                    </form>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <span className="relative bg-white px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="grid grid-cols-2 gap-4">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 hover:border-orange-500/30 hover:bg-orange-50/50 py-3 rounded-2xl font-bold text-slate-600 transition-all shadow-sm"
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
                            className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 hover:border-orange-500/30 hover:bg-orange-50/50 py-3 rounded-2xl font-bold text-slate-600 transition-all shadow-sm group"
                        >
                            <Sparkles size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                            Guest
                        </motion.button>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 text-center lg:text-left">
                        <p className="text-slate-500 text-sm font-medium">
                            {isLogin ? "New to Orange Finance?" : "Already have an account?"}{" "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-orange-600 font-bold hover:text-orange-700 hover:underline hover:underline-offset-4 transition-all"
                            >
                                {isLogin ? 'Create an account' : 'Sign In instead'}
                            </button>
                        </p>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                    className="mt-12 text-center lg:text-left w-full lg:px-12"
                >
                    <div className="flex flex-col items-center lg:items-start justify-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Secured with Bank-Grade Encryption</p>
                        <div className="flex gap-1.5 opacity-50">
                            <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse"></div>
                            <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse delay-100"></div>
                            <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse delay-200"></div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ─── Right Panel: Visual Showcase (Hidden on Mobile) ─── */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
                {/* Stunning Dark Abstract Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0"></div>
                    <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-orange-600/40 to-rose-600/20 rounded-full blur-[100px]" />
                    <motion.div animate={{ rotate: -360, scale: [1, 1.3, 1] }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-10%] left-[-10%] w-[900px] h-[900px] bg-gradient-to-tr from-rose-600/30 to-orange-500/20 rounded-full blur-[140px]" />
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[20px]"></div>
                </div>

                {/* Floating Glassmorphic App Elements */}
                <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center">
                    
                    {/* Main Mockup Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50, rotateX: 20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ duration: 1, type: "spring", bounce: 0.4, delay: 0.2 }}
                        className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl relative"
                        style={{ transformPerspective: 1000 }}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-white/60 text-sm font-semibold mb-1">Total Balance</h3>
                                <p className="text-white text-4xl font-black tracking-tight">$124,500.00</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <ArrowRight className="text-white -rotate-45" size={24} />
                            </div>
                        </div>

                        {/* Faux graph */}
                        <div className="h-32 mb-8 flex items-end gap-2 justify-between">
                            {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ height: 0 }} 
                                    animate={{ height: `${h}%` }} 
                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1), type: "spring", bounce: 0 }}
                                    className="w-full bg-gradient-to-t from-orange-500/40 to-orange-400 rounded-t-sm"
                                />
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-rose-400 text-xs font-bold mb-1 uppercase tracking-wider">Out</div>
                                <div className="text-white font-bold text-lg">$12,340</div>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-emerald-400 text-xs font-bold mb-1 uppercase tracking-wider">In</div>
                                <div className="text-white font-bold text-lg">$34,890</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Floating mini cards */}
                    <motion.div
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-8 top-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl w-48 hidden xl:block"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><ArrowRight size={14} className="rotate-45" /></div>
                            <div>
                                <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Received</div>
                                <div className="text-white font-bold text-sm">Stripe Inc.</div>
                            </div>
                        </div>
                        <div className="text-emerald-400 font-black text-right">+$4,200.00</div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -left-8 bottom-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl w-48 hidden xl:block"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400"><ArrowRight size={14} className="-rotate-45" /></div>
                            <div>
                                <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Sent</div>
                                <div className="text-white font-bold text-sm">Apple Store</div>
                            </div>
                        </div>
                        <div className="text-rose-400 font-black text-right">-$1,999.00</div>
                    </motion.div>
                </div>

                {/* Typography over the design */}
                <div className="absolute bottom-12 left-12 right-12 z-20">
                    <motion.h2 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="text-white text-3xl font-black mb-3 drop-shadow-md">
                        Master your finances.
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="text-white/70 text-sm font-medium max-w-[300px]">
                        Enterprise-grade accounting and financial tools designed for modern businesses. Build the future with Orange Finance.
                    </motion.p>
                </div>
            </div>
        </div>
    );
};
