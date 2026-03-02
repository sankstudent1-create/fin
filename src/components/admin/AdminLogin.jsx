import React, { useState } from 'react';
import { supabase } from '../../config/supabase';
import { Mail, KeyRound, Loader2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('password'); // 'password' or 'otp'

    // To store intermediate session while waiting for 2FA
    const [tempSession, setTempSession] = useState(null);

    const handlePasswordSubmit = async (e) => {
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

        // 2. Check if user is an admin before sending OTP
        const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin');

        if (adminError || isAdminData !== true) {
            await supabase.auth.signOut();
            setError("Access denied. You are not an admin.");
            setLoading(false);
            return;
        }

        setTempSession(data.session);

        // 3. Send OTP to email
        try {
            const res = await fetch('/api/send-admin-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });
            const otpData = await res.json();

            if (!res.ok || !otpData.success) {
                throw new Error(otpData.error || 'Failed to send OTP email');
            }

            // Success, move to OTP step
            setStep('otp');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to trigger 2FA email.');
            // Sign out since 2FA failed
            await supabase.auth.signOut();
            setTempSession(null);
        }

        setLoading(false);
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 4. Verify OTP using backend RPC
        const { data: isValid, error: verifyError } = await supabase.rpc('verify_admin_otp', {
            user_email: email,
            submitted_code: otp
        });

        if (verifyError || !isValid) {
            setError('Invalid or expired 2FA code.');
            setLoading(false);
            return;
        }

        // 5. Success! Complete Login
        onLoginSuccess(tempSession);
        // AdminScreen.jsx handles the loading state as it verifies the backend authorization
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

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 mb-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-bold text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {step === 'password' ? (
                        <motion.form
                            key="password-step"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handlePasswordSubmit}
                            className="space-y-4"
                        >
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
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                                Next
                            </button>
                            <p className="text-xs text-center text-slate-400 mt-4 font-semibold uppercase tracking-widest shadow-white/10">
                                Protected by Supabase RPC Authorizers
                            </p>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp-step"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleOtpSubmit}
                            className="space-y-4"
                        >
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center mb-6">
                                <p className="text-xs font-bold text-indigo-800">
                                    2FA Authorization Code sent to
                                </p>
                                <p className="text-sm font-black text-indigo-900 mt-1">{email}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">Enter 6-Digit Code</label>
                                <div className="relative max-w-[240px] mx-auto">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only numbers
                                        placeholder="000000"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-2xl font-black tracking-[0.5em] text-center focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white p-3.5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-600/20 mt-6"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                Verify & Authorize
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    setStep('password');
                                    setOtp('');
                                    setTempSession(null);
                                }}
                                className="w-full mt-4 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Cancel & Return to Login
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
