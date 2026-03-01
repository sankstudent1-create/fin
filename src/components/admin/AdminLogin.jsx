import React, { useState } from 'react';
import { supabase } from '../../config/supabase';
import { Mail, KeyRound, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Supabase sends standard magic link, we must request OTP specifically using sign_in
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: { shouldCreateUser: false } // Admins must already exist
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setStep(2);
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Verify the 6-digit OTP
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email'
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else if (data?.session) {
            onLoginSuccess(data.session);
            // Don't need to setLoading(false) as screen unmounts and AdminScreen loads
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
                    <p className="text-sm font-medium text-slate-500 mt-2">Secure restricted access via Email OTP</p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOtp}
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
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-3.5 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/20"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Send OTP Code</>}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleVerifyOtp}
                            className="space-y-4"
                        >
                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-bold text-center">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Verification Code</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-2xl tracking-[0.5em] text-center font-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-center text-slate-500 mt-3">Enter the 6-digit code sent to your email.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white p-3.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 transition-all"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                Verify & Proceed
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStep(1); setOtp(''); setError(null); }}
                                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 mt-2 p-2"
                            >
                                Use a different email
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
