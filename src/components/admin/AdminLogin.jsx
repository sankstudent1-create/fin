import React, { useState } from 'react';
import { supabase } from '../../config/supabase';
import { Mail, KeyRound, Loader2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Standard Email & Password Authentication
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
        }

        // Supabase MFA (2FA) Check - If you have enrolled an Authenticator App in Supabase
        const mfaStatus = data.session?.user?.factors; // Check if factors are enrolled (requires premium/specific Supabase setup)

        // For standard implementations, we immediately pass the session and AdminScreen.jsx 
        // will automatically run the secondary RPC check (is_admin()) to verify their access.
        if (data?.session) {
            onLoginSuccess(data.session);
            // AdminScreen.jsx handles the loading state as it verifies the backend authorization
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-rose-500/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative border */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500" />

                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <ShieldCheck size={32} className="text-slate-800" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal</h2>
                    <p className="text-sm font-medium text-slate-500 mt-2">Secure restricted access area</p>
                </div>

                <motion.form
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handleLogin}
                    className="space-y-4"
                >
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Admin Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@orangefinance.com"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 mt-4">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-3.5 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/20 mt-6"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        Secure Login
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-4 font-semibold uppercase tracking-widest shadow-white/10">
                        {loading ? 'Authenticating...' : 'Protected by Supabase RPC Authorizers'}
                    </p>
                </motion.form>
            </motion.div>
        </div>
    );
};
