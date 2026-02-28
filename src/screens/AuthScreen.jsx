
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/50 p-8 sm:p-12 relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 text-white">
                        <Wallet size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                        {isLogin ? 'Welcome Back' : 'Join Orange'}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {isLogin ? 'Enter your credentials to access your finance dashboard.' : 'Start your journey to better financial health today.'}
                    </p>
                </div>

                {/* ── Offline banner ── */}
                {isOffline && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-medium mb-6">
                        <WifiOff size={18} className="text-slate-300 shrink-0" />
                        <div>
                            <p className="font-bold">You're offline</p>
                            <p className="text-slate-400 text-xs">Reconnect to sign in to your account.</p>
                        </div>
                    </motion.div>
                )}

                {/* ── Supabase paused banner ── */}
                {supabaseDown && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl text-sm mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-bold text-amber-800">Backend Unreachable</p>
                                <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                                    The Supabase project appears to be <strong>paused</strong> (free tier auto-pauses after 1 week inactive).
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <a href="https://supabase.com/dashboard/project/joanfonaixkgbpbyuwch" target="_blank" rel="noreferrer"
                                        className="text-xs font-bold text-amber-700 underline">→ Resume on Supabase</a>
                                    <button onClick={() => { setSupabaseDown(false); setError(null); }}
                                        className="text-xs font-bold text-amber-600 flex items-center gap-1 ml-2 hover:text-amber-800">
                                        <RefreshCw size={11} /> Retry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Auth error ── */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3 mb-6"
                    >
                        <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
                        <div>
                            <p className="font-bold text-rose-700 mb-0.5">Authentication Failed</p>
                            <p className="text-rose-600 text-xs leading-relaxed">{error}</p>
                            <p className="text-rose-400 text-[10px] mt-1">Open DevTools → Console for full diagnostics</p>
                        </div>
                    </motion.div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <div className="relative">
                                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:border-orange-500/50 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="relative">
                            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:border-orange-500/50 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative">
                            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:border-orange-500/50 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Forgot Password */}
                    {isLogin && (
                        <div className="flex justify-end -mt-1">
                            {forgotSent ? (
                                <p className="text-xs font-bold text-emerald-600">✅ Reset link sent to {email}! Check your inbox.</p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    disabled={forgotLoading}
                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline transition-all disabled:opacity-50"
                                >
                                    {forgotLoading ? 'Sending...' : 'Forgot Password?'}
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || isOffline}
                        className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <span className="relative bg-white/80 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or Continue With</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 hover:border-slate-200 py-3 rounded-xl font-bold text-slate-600 transition-all hover:bg-slate-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button
                        type="button"
                        onClick={() => alert("Feature coming soon!")}
                        className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 hover:border-slate-200 py-3 rounded-xl font-bold text-slate-600 transition-all hover:bg-slate-50"
                    >
                        <Sparkles size={20} className="text-orange-500" />
                        Guest
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-orange-600 font-bold hover:underline"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </motion.div>

            <div className="absolute bottom-6 text-center w-full z-10 pointer-events-none">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Secured by Supabase & Orange Finance</p>
            </div>
        </div>
    );
};
