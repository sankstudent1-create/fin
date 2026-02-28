
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '../config/supabase';

export const ResetPasswordScreen = ({ onComplete }) => {
    const [password, setPassword] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPwd) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const { error: updateErr } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (updateErr) {
            setError(updateErr.message);
        } else {
            setSuccess(true);
            setTimeout(() => {
                onComplete?.();
            }, 2500);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/50 p-8 sm:p-12 relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-900/20 text-white">
                        {success ? <ShieldCheck size={32} /> : <Lock size={32} />}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                        {success ? 'Password Updated!' : 'Set New Password'}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {success
                            ? 'Your password has been changed successfully. Redirecting...'
                            : 'Create a strong new password for your Orange Finance account.'
                        }
                    </p>
                </div>

                {success ? (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-4 py-6"
                    >
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Check size={40} className="text-emerald-600" />
                        </div>
                        <p className="text-emerald-600 font-bold text-sm">Redirecting to your dashboard...</p>
                        <Loader2 size={20} className="animate-spin text-emerald-400" />
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* New Password */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 pl-12 pr-12 font-bold text-slate-900 focus:border-orange-500/50 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="Re-enter password"
                                    value={confirmPwd}
                                    onChange={(e) => setConfirmPwd(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:border-orange-500/50 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${password.length >= i * 3
                                                    ? password.length >= 10
                                                        ? 'bg-emerald-500'
                                                        : password.length >= 6
                                                            ? 'bg-orange-500'
                                                            : 'bg-rose-500'
                                                    : 'bg-slate-100'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-[10px] font-bold ${password.length >= 10 ? 'text-emerald-500' : password.length >= 6 ? 'text-orange-500' : 'text-rose-500'
                                    }`}>
                                    {password.length < 6 ? 'Too weak' : password.length < 10 ? 'Good' : 'Strong'} · {password.length} characters
                                </p>
                            </div>
                        )}

                        {/* Match indicator */}
                        {confirmPwd.length > 0 && (
                            <p className={`text-xs font-semibold ${password === confirmPwd ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {password === confirmPwd ? '✅ Passwords match' : '❌ Passwords don\'t match'}
                            </p>
                        )}

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium"
                            >
                                ❌ {error}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || password.length < 6 || password !== confirmPwd}
                            className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                            {loading ? 'Updating...' : 'Set New Password'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-300">
                        Orange Finance · Secured by Supabase
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
