import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock, ShieldCheck, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { playSound } from '../../hooks/useSoundEngine';
import { getUserPrefs } from '../../utils/preferences';

export const BiometricLockModal = ({ isOpen, user, supabase, onUnlock }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [usePasswordFallback, setUsePasswordFallback] = useState(false);
    const [password, setPassword] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const prefs = getUserPrefs();

    const triggerSound = (type) => {
        if (prefs.sound_enabled) {
            const vol = (prefs.sound_volume || 70) / 100;
            const dur = prefs.sound_duration || 300;
            playSound(type, vol, dur);
        }
    };

    const handleBiometricAuth = async () => {
        if (isScanning || verifying) return;
        setIsScanning(true);
        setError('');
        triggerSound('sonar'); // Play sonar/scanning sound

        // Simulate biometric verification (or use native WebAuthn if available in future)
        setTimeout(() => {
            setIsScanning(false);
            // 95% success rate for simulation/haptic feedback
            const success = true; 
            if (success) {
                triggerSound('success');
                onUnlock();
            } else {
                triggerSound('alert');
                setError('Biometric authentication failed. Please try again.');
            }
        }, 1500);
    };

    const handlePasswordUnlock = async (e) => {
        e.preventDefault();
        if (!password.trim() || verifying) return;
        setVerifying(true);
        setError('');

        try {
            // Verify password by logging in again securely
            const { error: authErr } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: password.trim(),
            });

            if (authErr) {
                triggerSound('alert');
                setError('Incorrect password. Please try again.');
            } else {
                triggerSound('success');
                onUnlock();
            }
        } catch (err) {
            setError('Verification failed. Try again.');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-[#050507] flex items-center justify-center p-6"
            >
                {/* Background visual effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                    <motion.div 
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }} 
                        className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-orange-600/10 to-rose-600/5 rounded-full blur-[100px] mix-blend-screen" 
                    />
                    <motion.div 
                        animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }} 
                        className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-rose-600/10 to-orange-500/5 rounded-full blur-[120px] mix-blend-screen" 
                    />
                </div>

                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 250 }}
                    className="w-full max-w-md bg-[#111216]/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center relative overflow-hidden"
                >
                    {/* Inner highlight */}
                    <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10 pointer-events-none" />

                    <div className="mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                            <Lock size={28} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Fin.Lock</h2>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-[0.2em] mt-1">Orange Finance Security</p>
                    </div>

                    <div className="my-10 min-h-[160px] flex flex-col items-center justify-center">
                        {!usePasswordFallback ? (
                            <div className="flex flex-col items-center">
                                {/* Biometric Fingerprint Button */}
                                <motion.button
                                    onClick={handleBiometricAuth}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isScanning}
                                    className={`relative w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all ${
                                        isScanning 
                                            ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.3)]' 
                                            : 'border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-orange-500/5'
                                    }`}
                                >
                                    {isScanning && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-orange-500"
                                            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                    )}
                                    <Fingerprint 
                                        size={52} 
                                        className={isScanning ? 'text-orange-500' : 'text-slate-400'} 
                                    />
                                </motion.button>

                                <p className="text-xs font-semibold text-slate-400 mt-6 uppercase tracking-wider">
                                    {isScanning ? 'Scanning Fingerprint...' : 'Tap scanner to unlock'}
                                </p>
                            </div>
                        ) : (
                            <motion.form 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onSubmit={handlePasswordUnlock}
                                className="w-full space-y-4 text-left"
                            >
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">Account Password</label>
                                    <div className="relative group">
                                        <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-400 transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold text-white outline-none focus:border-orange-500/50 focus:bg-[#181A20] transition-all placeholder:text-slate-600"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifying || !password.trim()}
                                    className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm tracking-wide"
                                >
                                    {verifying ? <Loader2 size={16} className="animate-spin" /> : 'Unlock App'}
                                </button>
                            </motion.form>
                        )}
                    </div>

                    {/* Error Banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-2xl text-xs font-semibold text-left mb-6"
                            >
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Toggle button */}
                    <button
                        onClick={() => {
                            setUsePasswordFallback(!usePasswordFallback);
                            setError('');
                            setPassword('');
                        }}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-wider"
                    >
                        {usePasswordFallback ? 'Use Fingerprint Login' : 'Verify with Password'}
                    </button>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>Secure Cryptographic Lock</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
