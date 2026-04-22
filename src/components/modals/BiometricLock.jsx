import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock, ShieldCheck, AlertCircle, Loader2, UserCheck } from 'lucide-react';
import { verifyBiometrics } from '../../utils/biometric';

/**
 * BiometricLock Component
 * 
 * An overlay that prevents access to sensitive areas until biometric verification is successful.
 * 
 * @param {boolean} isOpen - Whether the lock is active
 * @param {string} credentialId - The stored biometric credential ID
 * @param {function} onUnlock - Callback on successful verification
 * @param {function} onCancel - Callback if the user cancels or fails
 * @param {string} title - Optional title for the lock screen
 */
export const BiometricLock = ({ isOpen, credentialId, onUnlock, onCancel, title = "Sensitive Access Required" }) => {
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleVerify = async () => {
        if (verifying) return;
        setVerifying(true);
        setError('');

        try {
            const result = await verifyBiometrics(credentialId);
            if (result) {
                setSuccess(true);
                setTimeout(() => {
                    onUnlock();
                }, 800);
            }
        } catch (err) {
            console.error("Biometric Verification Failed:", err);
            setError(err.message || "Verification failed. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    // Auto-trigger on mount
    useEffect(() => {
        if (isOpen && credentialId) {
            handleVerify();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-base/90 backdrop-blur-2xl px-6"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-sm glass-panel border-main p-8 rounded-[2.5rem] text-center space-y-6 shadow-2xl"
                >
                    {/* Visual Status */}
                    <div className="relative mx-auto w-24 h-24">
                        <motion.div
                            animate={success ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                            className={`w-full h-full rounded-3xl flex items-center justify-center transition-colors duration-500 ${
                                success ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 
                                error ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                                'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-neon'
                            }`}
                        >
                            {success ? <UserCheck size={44} /> : verifying ? <Loader2 size={44} className="animate-spin" /> : <Fingerprint size={44} />}
                        </motion.div>
                        
                        {/* Lock Badge */}
                        <div className="absolute -top-2 -right-2 bg-secondary border border-main w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                            <Lock size={14} className="text-dim" />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-main tracking-tight">
                            {success ? "Identity Verified" : title}
                        </h2>
                        <p className="text-xs font-bold text-dim uppercase tracking-widest">
                            {success ? "Accessing your vault..." : "Place your finger on the sensor or use Face ID"}
                        </p>
                    </div>

                    {/* Error Notice */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-bold border border-rose-500/20"
                            >
                                <AlertCircle size={14} />
                                <span className="flex-1">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Controls */}
                    <div className="flex flex-col gap-3 py-2">
                        <button
                            onClick={handleVerify}
                            disabled={verifying || success}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                success ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                        >
                            {verifying ? "Verifying..." : success ? "Welcome Back" : "Retry Biometric Login"}
                        </button>
                        
                        {!success && (
                            <button
                                onClick={onCancel}
                                className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-dim hover:text-main transition-colors"
                            >
                                Cancel & Go Back
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        End-to-End Secure
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
