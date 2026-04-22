import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { AdminLogin } from '../../components/admin/AdminLogin';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { BiometricLock } from '../../components/modals/BiometricLock';
import { getUserPrefs } from '../../components/modals/SettingsModal';

export const AdminScreen = () => {
    const [session, setSession] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const hasVerified = useRef(false);
    const isVerifying = useRef(false);

    // Biometric states
    const [prefs] = useState(getUserPrefs());
    const [biometricLocked, setBiometricLocked] = useState(getUserPrefs().biometric_enabled);

    // 2FA states for already-logged-in users accessing admin route
    const [needs2FA, setNeeds2FA] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    useEffect(() => {
        const checkAdminSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setSession(session);
                await verifyAdmin(session.user.id);
            } else {
                setLoading(false);
            }
        };

        checkAdminSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
            if (s) {
                setSession(s);
                // Only trigger a hard verify on sign-in event
                if (!hasVerified.current && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                    verifyAdmin(s.user.id, false);
                }
            } else {
                setSession(null);
                setIsAdmin(null);
                hasVerified.current = false;
                setNeeds2FA(false); // Reset 2FA status
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // OTP countdown timer effect
    useEffect(() => {
        if (otpTimer > 0) {
            const timerId = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [otpTimer]);
    

    const isSending2FA = useRef(false);
    const trigger2FAEmail = async (userId, userEmail, token) => {
        if (isSending2FA.current) return;
        isSending2FA.current = true;
        
        try {
            const res = await fetch('/api/send-admin-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: userEmail })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                console.log("2FA sent specifically to already logged-in admin.");
                // Start OTP timer (e.g., 120 seconds to match backend cooldown)
                setOtpTimer(120);
            } else if (res.status === 429) {
                console.warn("OTP cooldown active. A waiting period is required before requesting anoher OTP.");
                setOtpTimer(120); // Sync frontend timer visually
            }
        } catch (e) {
            console.error('Failed to send 2FA', e);
        } finally {
            isSending2FA.current = false;
        }
    };

    const verifyAdmin = async (userId, silent = false) => {
        if (hasVerified.current || isVerifying.current) return;
        isVerifying.current = true;

        if (!silent) setLoading(true);
        // Secure RPC function to check if they are in the admins table
        const { data, error } = await supabase.rpc('is_admin');

        if (data === true) {
            setIsAdmin(true);
            hasVerified.current = true;

            // Just because they are logged in doesn't mean they bypassed 2FA.
            // If they are coming from dashboard, demand 2FA.
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setNeeds2FA(true);

            if (currentSession) {
                trigger2FAEmail(userId, currentSession.user.email, currentSession.access_token);
            }
        } else {
            console.warn('User is not an admin', error);
            setIsAdmin(false);
            hasVerified.current = false;
            // Sign out the non-admin user trying to access admin panel
            await supabase.auth.signOut();
            alert('Access Denied. You are not registered as an Admin.');
        }
        isVerifying.current = false;
        if (!silent) setLoading(false);
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setVerifyingOtp(true);
        const { data: isValid, error } = await supabase.rpc('verify_admin_otp', {
            submitted_code: otp
        });

        if (error || !isValid) {
            alert('Invalid or expired 2FA code.');
            setVerifyingOtp(false);
            return;
        }

        // Success!
        setOtp('');
        setOtpTimer(0);
        setNeeds2FA(false);
        setVerifyingOtp(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                    <Loader2 className="animate-spin text-white" size={30} />
                </div>
            </div>
        );
    }

    if (!session || (!isAdmin && !needs2FA)) {
        return <AdminLogin onLoginSuccess={(s) => {
            // AdminLogin internally handles BOTH password & OTP
            setSession(s);
            setIsAdmin(true);
            setNeeds2FA(false); // Bypasses internal screen since AdminLogin did it
        }} />;
    }

    // Secondary 2FA Screen for users accessing /admin while already logged in
    if (session && isAdmin && needs2FA) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all transform scale-100">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500" />
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner shadow-orange-500/20">
                            <ShieldCheck size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Verification</h2>
                        <p className="text-sm font-medium text-slate-500 mt-2">Enter the code sent to your email to continue</p>
                    </div>

                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                        <div className="bg-orange-50/80 border border-orange-200/50 rounded-2xl p-4 text-center mb-4">
                            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">2FA Code sent to</p>
                            <p className="text-sm font-black text-slate-800 mt-1">{session.user.email}</p>
                        </div>

                        <div>
                            <div className="relative max-w-[240px] mx-auto">
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="w-full py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-2xl font-black tracking-[0.5em] text-center focus:outline-none focus:border-orange-500 focus:bg-white transition-all transform shadow-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={verifyingOtp || otp.length !== 6}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white p-3.5 rounded-xl text-sm font-bold hover:from-orange-600 hover:to-rose-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/30 mt-6"
                        >
                            {verifyingOtp ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                            Verify & Enter Dashboard
                        </button>

                        <div className="flex flex-col gap-2 mt-4 text-center">
                            <button
                                type="button"
                                disabled={verifyingOtp || otpTimer > 0}
                                onClick={() => trigger2FAEmail(session.user.id, session.user.email, session.access_token)}
                                className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors py-2"
                            >
                                Resend Code{otpTimer > 0 ? ` (${otpTimer}s)` : ''}
                            </button>
                            <button
                                type="button"
                                onClick={() => supabase.auth.signOut()}
                                className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors py-2"
                            >
                                Logout
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (isAdmin && biometricLocked) {
        return (
            <BiometricLock
                isOpen={true}
                credentialId={prefs.biometric_credential_id}
                onUnlock={() => setBiometricLocked(false)}
                onCancel={() => window.location.href = '/'}
                title="Admin Vault Locked"
            />
        );
    }

    return <AdminDashboard session={session} onLogout={() => supabase.auth.signOut()} />;
};
