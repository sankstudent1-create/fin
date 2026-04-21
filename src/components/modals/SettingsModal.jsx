
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Palette, Shield, Database, LogOut, Upload,
    Sun, Moon, Monitor, Trash2, Download, Volume2, QrCode,
    Lock, Fingerprint, ChevronRight, AlertTriangle,
    Bell, Clock, Sparkles, Timer, MessageSquare, Camera,
    Check, Loader2, Edit3, Image, ChevronLeft, Play, ZoomIn,
    Mail, KeyRound, Eye, EyeOff, ShieldCheck, Send
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import {
    SOUND_EFFECTS, DEFAULT_SOUND_PREFS,
    loadSoundPrefs, saveSoundPrefs, playSound
} from '../../hooks/useSoundEngine';
import { createPDF } from '../../utils/pdfGenerator';
import { AnalyticsReport as PrintableReport, PrintStyles } from '../dashboard/PrintView';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactDOM from 'react-dom/client';

// ─── Preferences ────────────────────────────────────────────────────────────
const PREFS_KEY = 'orange_fin_prefs';
const DEFAULT_PREFS = {
    sound_enabled: true, sound_volume: 70, sound_duration: 300,
    sound_effect: 'chime',
    sound_on_tx: true, sound_on_delete: true, sound_on_success: true,
    notification_enabled: true, popup_duration: 3000,
    popup_style: 'pill', popup_position: 'bottom',
    theme: 'light', biometric_enabled: false,
    ui_density: 'normal',   /* compact | normal | comfortable */
};
const loadPrefs = () => { try { const s = localStorage.getItem(PREFS_KEY); return s ? { ...DEFAULT_PREFS, ...JSON.parse(s) } : { ...DEFAULT_PREFS }; } catch { return { ...DEFAULT_PREFS }; } };
const savePrefs = (p) => localStorage.setItem(PREFS_KEY, JSON.stringify(p));
export const getUserPrefs = loadPrefs;

// ─── Sub-components ──────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, color = 'orange' }) => {
    const bg = { orange: checked ? 'bg-orange-500' : 'bg-slate-200', emerald: checked ? 'bg-emerald-500' : 'bg-slate-200', blue: checked ? 'bg-blue-500' : 'bg-slate-200' };
    return (
        <button onClick={onChange} className={`w-12 h-7 rounded-full transition-colors relative shadow-inner flex-shrink-0 ${bg[color]}`}>
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${checked ? 'left-5.5' : 'left-0.5'}`} style={{ left: checked ? '1.375rem' : '0.125rem' }} />
        </button>
    );
};

const SettingRow = ({ icon: Icon, title, desc, children, iconColor = 'text-slate-500', iconBg = 'bg-slate-50' }) => (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all">
        <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 ${iconBg} ${iconColor} rounded-xl flex-shrink-0`}><Icon size={18} /></div>
            <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm leading-tight">{title}</p>
                {desc && <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>}
            </div>
        </div>
        {children}
    </div>
);

const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">{children}</p>
);

// ─── MAIN MODAL ──────────────────────────────────────────────────────────────
export const SettingsModal = ({ isOpen, onClose, user, avatarUrl, onAvatarUpload, onOpenDigitalID, transactions = [], allTransactions = [], stats = {}, filterLabel = '', onPrefsChange }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [prefs, setPrefs] = useState(loadPrefs());
    const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '');
    const [savingName, setSavingName] = useState(false);
    const [nameSaved, setNameSaved] = useState(false);
    const [deletingAvatar, setDeletingAvatar] = useState(false);
    const [localAvatar, setLocalAvatar] = useState(avatarUrl || '');
    const fileRef = useRef(null);

    // Email Report state
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [emailPeriod, setEmailPeriod] = useState('current'); // 'current', 'month', 'year', 'all'

    // Keep localAvatar in sync when avatarUrl prop changes
    useEffect(() => { setLocalAvatar(avatarUrl || ''); }, [avatarUrl]);

    useEffect(() => { 
        savePrefs(prefs); 
        if (onPrefsChange) onPrefsChange(prefs);
    }, [prefs]);

    const updatePref = (key, value) => setPrefs(prev => ({ ...prev, [key]: value }));

    // ── Avatar helpers ───────────────────────────────────────────────────────
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarToast, setAvatarToast] = useState('');

    const showAvatarMsg = (msg) => { setAvatarToast(msg); setTimeout(() => setAvatarToast(''), 3000); };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        // 1 — instant local preview
        const preview = URL.createObjectURL(file);
        setLocalAvatar(preview);
        setUploadingAvatar(true);

        try {
            const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
            const filePath = `${user.id}/avatar.${ext}`;

            // 2 — upload to Supabase Storage
            const { error: upErr } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });
            if (upErr) throw upErr;

            // 3 — get public URL (cache-busted)
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

            // 4 — persist to auth metadata
            const { error: metaErr } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
            if (metaErr) throw metaErr;

            // 5 — update local display
            setLocalAvatar(publicUrl);
            showAvatarMsg('✅ Photo updated!');
        } catch (err) {
            console.error('Avatar upload error:', err);
            setLocalAvatar(avatarUrl || '');
            showAvatarMsg('❌ Upload failed');
        }

        setUploadingAvatar(false);
    };

    const handleDeleteAvatar = async () => {
        setDeletingAvatar(true);
        try {
            // Standardizing path to 'avatar' name
            // We'll try to remove common extensions if extension mapping isn't fully tracked
            // or better, extract from current localAvatar url
            let fileName = 'avatar.jpg';
            if (localAvatar && localAvatar.includes('/avatars/')) {
                const parts = localAvatar.split('/');
                const last = parts[parts.length - 1].split('?')[0];
                if (last) fileName = last;
            }
            
            const path = `${user.id}/${fileName}`;
            await supabase.storage.from('avatars').remove([path]);
            const { error } = await supabase.auth.updateUser({ data: { avatar_url: '' } });
            if (!error) {
                setLocalAvatar('');
                showAvatarMsg('✅ Photo removed');
            }
        } catch (err) {
            console.error('Avatar delete error:', err);
            showAvatarMsg('❌ Error removing photo');
        }
        setDeletingAvatar(false);
    };

    // ── Name save ────────────────────────────────────────────────────────────
    const handleSaveName = async () => {
        if (!displayName.trim() || savingName) return;
        setSavingName(true);
        const { error } = await supabase.auth.updateUser({ data: { full_name: displayName.trim() } });
        setSavingName(false);
        if (!error) { setNameSaved(true); setTimeout(() => setNameSaved(false), 2500); }
    };

    // ── Export ───────────────────────────────────────────────────────────────
    const handleExportData = () => {
        const data = {
            profile: {
                name: displayName,
                email: user?.email,
                avatar: localAvatar
            },
            preferences: prefs,
            transactions: allTransactions,
            exported_at: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; 
        a.download = `orange_fin_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
    };

    // ── Email Report ─────────────────────────────────────────────────────────
    const handleEmailReport = async () => {
        if (sendingEmail) return;
        setSendingEmail(true);
        setEmailError('');
        setEmailSent(false);

        try {
            // Determine transactions and stats based on selected period
            let reportTxs = transactions;
            let reportLabel = filterLabel || 'All Time';
            let reportStats = stats;

            if (emailPeriod !== 'current') {
                const now = new Date();
                const d = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
                const currentMonth = d.toISOString().slice(0, 7);
                const currentYear = d.toISOString().slice(0, 4);

                if (emailPeriod === 'month') {
                    reportTxs = allTransactions.filter(t => t.date.startsWith(currentMonth));
                    reportLabel = 'This Month';
                } else if (emailPeriod === 'year') {
                    reportTxs = allTransactions.filter(t => t.date.startsWith(currentYear));
                    reportLabel = 'This Year';
                } else if (emailPeriod === 'all') {
                    reportTxs = allTransactions;
                    reportLabel = 'All Time';
                }

                // Recalculate stats for custom period
                const newStats = { income: 0, expense: 0, balance: 0 };
                reportTxs.forEach(t => {
                    if (t.type === 'income') newStats.income += parseFloat(t.amount);
                    else newStats.expense += parseFloat(t.amount);
                });
                newStats.balance = newStats.income - newStats.expense;
                reportStats = newStats;
            }

            if (reportTxs.length === 0) throw new Error('No transactions in selected period.');

            // Step 1: Render the premium AnalyticsReport off-screen (Truly Silent)
            const container = document.createElement('div');
            container.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:210mm;background:#fff;z-index:-9999;opacity:0.001;pointer-events:none;';
            document.body.appendChild(container);

            // Create React root and render
            const root = ReactDOM.createRoot(container);
            await new Promise((resolve) => {
                root.render(
                    <div id="print-root-email" style={{ width: '210mm', padding: '1px' }}>
                        <PrintStyles />
                        <PrintableReport
                            user={user}
                            stats={reportStats}
                            transactions={reportTxs}
                            filterLabel={reportLabel}
                        />
                    </div>
                );
                // Increased wait for 10s to ensure full complex analytics are rendered
                setTimeout(resolve, 10000);
            });

            // Step 2: Capture with html2canvas at ULTRA resolution
            const element = container.querySelector('#print-root-email');
            const canvas = await html2canvas(element, {
                scale: 3, // High quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 794, 
                windowWidth: 1200, // Prevention of mobile/iOS truncation
                scrollX: 0,
                scrollY: 0,
            });

            // Step 3: Convert to PDF (A4 dimensions)
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            const pageHeight = 297; 
            let yOffset = 0;

            while (yOffset < pdfHeight) {
                if (yOffset > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfWidth, pdfHeight, undefined, 'FAST');
                yOffset += pageHeight;
            }

            // Cleanup
            root.unmount();
            document.body.removeChild(container);

            // Step 4: Convert PDF to base64
            const pdfBlob = pdf.output('blob');
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(pdfBlob);
            });

            // Step 5: Send to serverless function
            const res = await fetch('/api/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: user?.email,
                    reportName: `OrangeFin_Report_${reportLabel.replace(/\s+/g, '_')}.pdf`,
                    filterLabel: reportLabel,
                    stats: reportStats,
                    pdfBase64: base64,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to send email');

            setEmailSent(true);
            setTimeout(() => setEmailSent(false), 5000);
        } catch (err) {
            console.error('Email report error:', err);
            setEmailError(err.message || 'Failed to send report');
            setTimeout(() => setEmailError(''), 5000);
        } finally {
            setSendingEmail(false);
        }
    };
    const handleSignOut = async () => { await supabase.auth.signOut(); window.location.reload(); };
    const handleDeleteAccount = async () => {
        if (!window.confirm("⚠️ DANGER: Are you absolutely sure? This will delete all your transactions and sign you out permanently. This cannot be undone.")) return;
        
        try {
            // 1. Delete all transactions
            const { error: txError } = await supabase
                .from('transactions')
                .delete()
                .eq('user_id', user.id);
            
            if (txError) throw txError;

            // 2. Sign out
            await supabase.auth.signOut();
            window.location.reload();
        } catch (err) {
            console.error('Delete account error:', err);
            alert("Error deleting data. Please contact support.");
        }
    };

    // ── Security: Reset Password, Change Email, Update Password ─────────
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [changeEmailMode, setChangeEmailMode] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMsg, setEmailMsg] = useState('');
    const [changePwdMode, setChangePwdMode] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMsg, setPwdMsg] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [emailCurrentPwd, setEmailCurrentPwd] = useState('');
    const [showEmailPwd, setShowEmailPwd] = useState(false);
    const [pwdVerified, setPwdVerified] = useState(false);
    const [emailPwdVerified, setEmailPwdVerified] = useState(false);

    // Re-authenticate user by verifying current password
    const verifyCurrentPassword = async (pwd) => {
        if (!user?.email || !pwd.trim()) return false;
        const { error } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: pwd.trim(),
        });
        return !error;
    };

    const handleResetPassword = async () => {
        if (!user?.email || resetLoading) return;
        setResetLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: 'https://fin.swinfosystems.online',
        });
        setResetLoading(false);
        if (!error) {
            setResetSent(true);
            setTimeout(() => setResetSent(false), 5000);
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail.trim() || emailLoading) return;
        if (!emailPwdVerified) {
            setEmailLoading(true);
            setEmailMsg('');
            const valid = await verifyCurrentPassword(emailCurrentPwd);
            setEmailLoading(false);
            if (!valid) {
                setEmailMsg('❌ Current password is incorrect.');
                return;
            }
            setEmailPwdVerified(true);
            setEmailMsg('✅ Password verified! Now enter your new email.');
            return;
        }
        setEmailLoading(true);
        setEmailMsg('');
        const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
        setEmailLoading(false);
        if (error) {
            setEmailMsg(`❌ ${error.message}`);
        } else {
            setEmailMsg('✅ Confirmation sent to both old & new email! Confirm on both to complete.');
            setNewEmail('');
            setEmailCurrentPwd('');
            setEmailPwdVerified(false);
            setTimeout(() => { setEmailMsg(''); setChangeEmailMode(false); }, 6000);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword.trim() || pwdLoading) return;
        if (!pwdVerified) {
            setPwdLoading(true);
            setPwdMsg('');
            const valid = await verifyCurrentPassword(currentPassword);
            setPwdLoading(false);
            if (!valid) {
                setPwdMsg('❌ Current password is incorrect.');
                return;
            }
            setPwdVerified(true);
            setPwdMsg('✅ Password verified! Now set your new password.');
            return;
        }
        if (newPassword.length < 6) { setPwdMsg('❌ Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setPwdMsg('❌ Passwords do not match.'); return; }
        setPwdLoading(true);
        setPwdMsg('');
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setPwdLoading(false);
        if (error) {
            setPwdMsg(`❌ ${error.message}`);
        } else {
            setPwdMsg('✅ Password updated successfully!');
            setNewPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
            setPwdVerified(false);
            setTimeout(() => { setPwdMsg(''); setChangePwdMode(false); }, 3000);
        }
    };

    if (!isOpen) return null;

    const initials = (displayName || user?.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'notifications', label: 'Alerts', icon: Bell, color: 'text-violet-600', bg: 'bg-violet-50' },
        { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'security', label: 'Security', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'data', label: 'Data', icon: Database, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    // ── TAB CONTENT ──────────────────────────────────────────────────────────
    const renderContent = () => {
        switch (activeTab) {

            // ── PROFILE ─────────────────────────────────────────────────────
            case 'profile': return (
                <div className="space-y-5">
                    {/* Avatar Card */}
                    <div className="bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100 rounded-2xl p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Profile Photo</p>
                        <div className="flex items-center gap-5">
                            {/* Avatar display */}
                            <div className="relative flex-shrink-0">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-gradient-to-br from-orange-400 to-rose-500">
                                    {localAvatar ? (
                                        <img src={localAvatar} alt="Avatar" className="w-full h-full object-cover" onError={() => setLocalAvatar('')} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-white text-2xl font-black">{initials}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Camera badge */}
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors disabled:opacity-70"
                                >
                                    {uploadingAvatar ? <Loader2 size={11} className="text-white animate-spin" /> : <Camera size={12} className="text-white" />}
                                </button>
                                <input ref={fileRef} type="file" className="hidden" onChange={handleAvatarChange} accept="image/jpeg,image/png,image/webp" />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 flex-1">
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-60"
                                >
                                    {uploadingAvatar ? <Loader2 size={14} className="animate-spin text-orange-500" /> : <Upload size={14} className="text-orange-500" />}
                                    {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                                </button>
                                {localAvatar && (
                                    <button
                                        onClick={handleDeleteAvatar}
                                        disabled={deletingAvatar || uploadingAvatar}
                                        className="flex items-center gap-2 bg-white border border-rose-200 text-rose-500 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-rose-50 transition-all disabled:opacity-50"
                                    >
                                        {deletingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        {deletingAvatar ? 'Removing...' : 'Remove Photo'}
                                    </button>
                                )}
                                {avatarToast ? (
                                    <p className={`text-[11px] font-semibold ${avatarToast.startsWith('✅') ? 'text-emerald-500' : 'text-rose-500'}`}>{avatarToast}</p>
                                ) : (
                                    <p className="text-[10px] text-slate-400">JPG, PNG or WebP · Max 5MB</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Display Name */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Display Name</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={displayName}
                                onChange={e => { setDisplayName(e.target.value); setNameSaved(false); }}
                                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:border-orange-400 focus:bg-white outline-none transition-all text-sm"
                                placeholder="Your name"
                            />
                            <button
                                onClick={handleSaveName}
                                disabled={savingName || !displayName.trim()}
                                className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${nameSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40'}`}
                            >
                                {savingName ? <Loader2 size={14} className="animate-spin" /> : nameSaved ? <Check size={14} /> : <Check size={14} />}
                                {savingName ? 'Saving' : nameSaved ? 'Saved!' : 'Save'}
                            </button>
                        </div>
                    </div>

                    {/* Email (read-only) */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                        <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-3">
                            <span className="font-semibold text-slate-500 text-sm flex-1 truncate">{user?.email}</span>
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wide">Verified</span>
                        </div>
                    </div>

                    {/* Digital ID */}
                    <button
                        onClick={onOpenDigitalID}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all group"
                    >
                        <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-100 transition-colors">
                            <QrCode size={18} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-semibold text-slate-800 text-sm">Digital Finance ID</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Your shareable financial identity card</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                    </button>

                    {/* Email Report */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">📧 Email Report</p>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                            Send your financial report as a premium PDF to your registered email. Includes income, expenses, and full transaction history.
                        </p>

                        {/* Email preview */}
                        <div className="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-3 mb-3 border border-blue-100">
                            <Mail size={16} className="text-blue-500 flex-shrink-0" />
                            <span className="font-semibold text-slate-600 text-sm truncate flex-1">{user?.email}</span>
                        </div>

                        {/* Period config */}
                        <div className="flex items-center justify-between mb-4 bg-white/50 border border-blue-50 p-2 rounded-xl">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-blue-400" />
                                <span className="text-xs font-bold text-slate-600">Period</span>
                            </div>
                            <select
                                value={emailPeriod}
                                onChange={(e) => setEmailPeriod(e.target.value)}
                                className="bg-transparent text-xs font-bold text-blue-600 outline-none cursor-pointer appearance-none pr-4 min-w-[120px] text-right"
                            >
                                <option value="current">Current View ({filterLabel || 'All'})</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time History</option>
                            </select>
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleEmailReport}
                            disabled={sendingEmail || transactions.length === 0}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${emailSent
                                ? 'bg-emerald-500 text-white'
                                : emailError
                                    ? 'bg-rose-100 text-rose-600'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50'
                                }`}
                        >
                            {sendingEmail ? (
                                <><Loader2 size={16} className="animate-spin" /> Generating & Sending...</>
                            ) : emailSent ? (
                                <><Check size={16} /> Report Sent! Check your inbox ✉️</>
                            ) : emailError ? (
                                <><AlertTriangle size={16} /> {emailError}</>
                            ) : (
                                <><Send size={16} /> Email My Report</>
                            )}
                        </button>

                        {transactions.length === 0 && (
                            <p className="text-[10px] text-amber-600 mt-2 text-center font-semibold">No transactions in the current period to report.</p>
                        )}
                    </div>
                </div>
            );

            // ── NOTIFICATIONS / SOUND ────────────────────────────────────────
            case 'notifications': return (
                <div className="space-y-5">

                    {/* ── Sound master toggle ── */}
                    <div className="space-y-2">
                        <SectionLabel>Sound Engine</SectionLabel>
                        <SettingRow icon={Volume2} title="Sound Effects" desc="Plays on transactions, deletes & alerts" iconColor="text-violet-500" iconBg="bg-violet-50">
                            <Toggle checked={prefs.sound_enabled} onChange={() => updatePref('sound_enabled', !prefs.sound_enabled)} />
                        </SettingRow>

                        {prefs.sound_enabled && (
                            <div className="space-y-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">

                                {/* Effect selector */}
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-2">Sound Effect</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(SOUND_EFFECTS).map(([key, { label, desc }]) => (
                                            <button key={key}
                                                onClick={() => {
                                                    updatePref('sound_effect', key);
                                                    /* Small save so saveSoundPrefs keeps in sync */
                                                    saveSoundPrefs({ ...loadSoundPrefs(), effect: key, volume: prefs.sound_volume / 100, duration_ms: prefs.sound_duration });
                                                    playSound(key, prefs.sound_volume / 100, prefs.sound_duration);
                                                }}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${prefs.sound_effect === key
                                                    ? 'border-violet-400 bg-violet-50'
                                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                                    }`}>
                                                <span className="text-base leading-none">{label.split(' ')[0]}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-slate-700 truncate">{label.split(' ').slice(1).join(' ')}</p>
                                                    <p className="text-[9px] text-slate-400">{desc}</p>
                                                </div>
                                                {prefs.sound_effect === key && <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Volume */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-slate-500">Volume</span>
                                        <span className="font-bold text-violet-600">{prefs.sound_volume}%</span>
                                    </div>
                                    <input type="range" min={0} max={100} value={prefs.sound_volume}
                                        onChange={e => updatePref('sound_volume', +e.target.value)}
                                        className="w-full accent-violet-500" />
                                </div>

                                {/* Duration */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-slate-500">Duration</span>
                                        <span className="font-bold text-violet-600">{prefs.sound_duration}ms</span>
                                    </div>
                                    <input type="range" min={100} max={2000} step={50} value={prefs.sound_duration}
                                        onChange={e => updatePref('sound_duration', +e.target.value)}
                                        className="w-full accent-violet-500" />
                                    <div className="flex justify-between text-[9px] text-slate-300 font-medium">
                                        <span>100ms (short)</span><span>2000ms (long)</span>
                                    </div>
                                </div>

                                {/* Preview button */}
                                <button
                                    onClick={() => playSound(prefs.sound_effect || 'chime', prefs.sound_volume / 100, prefs.sound_duration)}
                                    className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-500/20">
                                    <Play size={13} /> Play Sound Now
                                </button>

                                {/* Per-event toggles */}
                                <div className="pt-1 border-t border-slate-200 space-y-2">
                                    <p className="text-xs font-semibold text-slate-400 mb-1">Play sound when…</p>
                                    {[
                                        { key: 'sound_on_tx', label: 'Adding a transaction' },
                                        { key: 'sound_on_delete', label: 'Deleting a transaction' },
                                        { key: 'sound_on_success', label: 'Successful save / update' },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                                            <span className="text-xs font-semibold text-slate-600">{label}</span>
                                            <Toggle checked={prefs[key] ?? true} onChange={() => updatePref(key, !prefs[key])} color="orange" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Toast alerts ── */}
                    <div className="space-y-2">
                        <SectionLabel>Popup Alerts</SectionLabel>
                        <SettingRow icon={MessageSquare} title="Toast Notifications" desc="Show popups on actions" iconColor="text-blue-500" iconBg="bg-blue-50">
                            <Toggle checked={prefs.notification_enabled} onChange={() => updatePref('notification_enabled', !prefs.notification_enabled)} color="blue" />
                        </SettingRow>
                        {prefs.notification_enabled && (
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-slate-500">Display Duration</span>
                                        <span className="font-bold text-blue-600">{(prefs.popup_duration / 1000).toFixed(1)}s</span>
                                    </div>
                                    <input type="range" min={1000} max={10000} step={500} value={prefs.popup_duration}
                                        onChange={e => updatePref('popup_duration', +e.target.value)} className="w-full accent-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-2">Position</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['top', 'bottom'].map(pos => (
                                            <button key={pos} onClick={() => updatePref('popup_position', pos)}
                                                className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${prefs.popup_position === pos ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                                ↑ {pos}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-2">Toast Style</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['pill', 'card', 'minimal', 'banner'].map(style => (
                                            <button key={style} onClick={() => updatePref('popup_style', style)}
                                                className={`p-3 rounded-xl text-center transition-all border-2 ${prefs.popup_style === style ? 'border-blue-400 bg-blue-50 scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                                <div className={`bg-emerald-500 text-white text-[8px] font-bold mx-auto mb-1.5 px-2 py-0.5 ${style === 'pill' ? 'rounded-full' : style === 'card' ? 'rounded-lg shadow' : style === 'banner' ? 'rounded w-full' : 'rounded'}`}>✓ Done</div>
                                                <span className="text-[10px] font-bold text-slate-600 capitalize">{style}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );

            // ── APPEARANCE ───────────────────────────────────────────────────
            case 'appearance': return (
                <div className="space-y-5">

                    {/* Theme */}
                    <div className="space-y-2">
                        <SectionLabel>Theme Preference</SectionLabel>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'light', icon: Sun, label: 'Light', desc: 'Bright & clean' },
                                { id: 'dark', icon: Moon, label: 'Dark', desc: 'Easy on eyes' },
                                { id: 'system', icon: Monitor, label: 'Auto', desc: 'Follows device' },
                            ].map(t => (
                                <button key={t.id} onClick={() => updatePref('theme', t.id)}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${prefs.theme === t.id
                                        ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-500/10'
                                        : 'border-slate-100 bg-white hover:border-slate-200'
                                        }`}>
                                    <t.icon size={22} className={prefs.theme === t.id ? 'text-orange-500' : 'text-slate-400'} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{t.label}</p>
                                        <p className="text-[9px] text-slate-400">{t.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 ml-1 mt-1">Updates colors and interface styling 🎨</p>
                    </div>

                    {/* UI Density / Size */}
                    <div className="space-y-2">
                        <SectionLabel>UI Density</SectionLabel>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'compact', icon: ZoomIn, label: 'Compact', desc: 'More content', padding: 'p-2.5' },
                                { id: 'normal', icon: ZoomIn, label: 'Normal', desc: 'Balanced', padding: 'p-3.5' },
                                { id: 'comfortable', icon: ZoomIn, label: 'Comfortable', desc: 'More space', padding: 'p-5' },
                            ].map(d => (
                                <button key={d.id} onClick={() => updatePref('ui_density', d.id)}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${prefs.ui_density === d.id
                                        ? 'border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-500/10'
                                        : 'border-slate-100 bg-white hover:border-slate-200'
                                        }`}>
                                    {/* Visual preview of density */}
                                    <div className={`w-full bg-slate-100 rounded-lg ${d.padding} space-y-1`}>
                                        {[1, 2].map(n => (
                                            <div key={n} className="h-1 bg-slate-300 rounded-full" />
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-800">{d.label}</p>
                                        <p className="text-[9px] text-slate-400">{d.desc}</p>
                                    </div>
                                    {prefs.ui_density === d.id && (
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 ml-1">Saved to your device — applies immediately</p>
                    </div>

                </div>
            );

            // ── SECURITY ─────────────────────────────────────────────────────
            case 'security': return (
                <div className="space-y-5">
                    <SectionLabel>Account Protection</SectionLabel>

                    {/* ── Change Password (inline with current password verification) ── */}
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                        <button
                            onClick={() => { setChangePwdMode(!changePwdMode); setPwdMsg(''); setPwdVerified(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-slate-100 transition-colors"><KeyRound size={18} /></div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800 text-sm">Change Password</p>
                                    <p className="text-[10px] text-slate-400">Verify identity, then set new password</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className={`text-slate-300 transition-transform ${changePwdMode ? 'rotate-90' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {changePwdMode && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                                        {/* Step 1: Current Password */}
                                        <div className="relative">
                                            <ShieldCheck size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${pwdVerified ? 'text-emerald-500' : 'text-amber-500'}`} />
                                            <input
                                                type={showCurrentPwd ? 'text' : 'password'}
                                                placeholder={pwdVerified ? '✅ Current password verified' : '🔐 Enter current password first'}
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                disabled={pwdVerified}
                                                onKeyDown={e => e.key === 'Enter' && !pwdVerified && handleUpdatePassword()}
                                                className={`w-full border-2 rounded-xl py-3 pl-10 pr-10 font-semibold text-sm outline-none transition-all ${pwdVerified
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                    : 'bg-amber-50 border-amber-200 text-slate-800 focus:border-amber-400 focus:bg-white'
                                                    }`}
                                            />
                                            {!pwdVerified && (
                                                <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showCurrentPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            )}
                                        </div>

                                        {!pwdVerified && (
                                            <>
                                                {pwdMsg && (
                                                    <p className={`text-xs font-semibold ${pwdMsg.startsWith('✅') ? 'text-emerald-600' : 'text-rose-500'}`}>{pwdMsg}</p>
                                                )}
                                                <button
                                                    onClick={handleUpdatePassword}
                                                    disabled={pwdLoading || !currentPassword.trim()}
                                                    className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                                >
                                                    {pwdLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                                    {pwdLoading ? 'Verifying...' : 'Verify Current Password'}
                                                </button>
                                            </>
                                        )}

                                        {/* Step 2: New Password (only after verification) */}
                                        {pwdVerified && (
                                            <>
                                                <div className="relative">
                                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type={showNewPwd ? 'text' : 'password'}
                                                        placeholder="New Password (min 6 chars)"
                                                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                                        autoFocus
                                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-10 font-semibold text-slate-800 text-sm focus:border-orange-400 focus:bg-white outline-none transition-all"
                                                    />
                                                    <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                        {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type={showNewPwd ? 'text' : 'password'}
                                                        placeholder="Confirm New Password"
                                                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleUpdatePassword()}
                                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 font-semibold text-slate-800 text-sm focus:border-orange-400 focus:bg-white outline-none transition-all"
                                                    />
                                                </div>
                                                {newPassword && confirmPassword && (
                                                    <p className={`text-[10px] font-bold ${newPassword === confirmPassword ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {newPassword === confirmPassword ? '✅ Passwords match' : '❌ Passwords don\'t match'}
                                                    </p>
                                                )}
                                                {pwdMsg && pwdMsg !== '✅ Password verified! Now set your new password.' && (
                                                    <p className={`text-xs font-semibold ${pwdMsg.startsWith('✅') ? 'text-emerald-600' : 'text-rose-500'}`}>{pwdMsg}</p>
                                                )}
                                                <button
                                                    onClick={handleUpdatePassword}
                                                    disabled={pwdLoading || !newPassword.trim() || newPassword !== confirmPassword || newPassword.length < 6}
                                                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                                >
                                                    {pwdLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                    {pwdLoading ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Change Email (with current password verification) ── */}
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                        <button
                            onClick={() => { setChangeEmailMode(!changeEmailMode); setEmailMsg(''); setEmailPwdVerified(false); setEmailCurrentPwd(''); setNewEmail(''); }}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors"><Mail size={18} /></div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800 text-sm">Change Email</p>
                                    <p className="text-[10px] text-slate-400">Verify identity, then update email</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className={`text-slate-300 transition-transform ${changeEmailMode ? 'rotate-90' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {changeEmailMode && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                                        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Current:</span>
                                            <span className="text-xs font-semibold text-slate-600 truncate">{user?.email}</span>
                                        </div>

                                        {/* Step 1: Verify Current Password */}
                                        <div className="relative">
                                            <ShieldCheck size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${emailPwdVerified ? 'text-emerald-500' : 'text-amber-500'}`} />
                                            <input
                                                type={showEmailPwd ? 'text' : 'password'}
                                                placeholder={emailPwdVerified ? '✅ Identity verified' : '🔐 Enter current password'}
                                                value={emailCurrentPwd}
                                                onChange={e => setEmailCurrentPwd(e.target.value)}
                                                disabled={emailPwdVerified}
                                                className={`w-full border-2 rounded-xl py-3 pl-10 pr-10 font-semibold text-sm outline-none transition-all ${emailPwdVerified
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                    : 'bg-amber-50 border-amber-200 text-slate-800 focus:border-amber-400 focus:bg-white'
                                                    }`}
                                            />
                                            {!emailPwdVerified && (
                                                <button type="button" onClick={() => setShowEmailPwd(!showEmailPwd)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showEmailPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            )}
                                        </div>

                                        {!emailPwdVerified && (
                                            <>
                                                {emailMsg && (
                                                    <p className={`text-xs font-semibold ${emailMsg.startsWith('✅') ? 'text-emerald-600' : 'text-rose-500'}`}>{emailMsg}</p>
                                                )}
                                                <button
                                                    onClick={() => handleChangeEmail()}
                                                    disabled={emailLoading || !emailCurrentPwd.trim()}
                                                    className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                                >
                                                    {emailLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                                    {emailLoading ? 'Verifying...' : 'Verify Identity'}
                                                </button>
                                            </>
                                        )}

                                        {/* Step 2: New Email (only after verification) */}
                                        {emailPwdVerified && (
                                            <>
                                                <div className="relative">
                                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="email" placeholder="New Email Address"
                                                        value={newEmail} onChange={e => setNewEmail(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleChangeEmail()}
                                                        autoFocus
                                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 font-semibold text-slate-800 text-sm focus:border-orange-400 focus:bg-white outline-none transition-all"
                                                    />
                                                </div>
                                                {emailMsg && emailMsg !== '✅ Password verified! Now enter your new email.' && (
                                                    <p className={`text-xs font-semibold ${emailMsg.startsWith('✅') ? 'text-emerald-600' : 'text-rose-500'}`}>{emailMsg}</p>
                                                )}
                                                <button
                                                    onClick={handleChangeEmail}
                                                    disabled={emailLoading || !newEmail.trim()}
                                                    className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                                >
                                                    {emailLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                                    {emailLoading ? 'Sending...' : 'Send Confirmation Email'}
                                                </button>
                                                <p className="text-[10px] text-slate-400 leading-relaxed">📩 Confirmation will be sent to both old and new email. You must confirm on both.</p>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Reset Password via Email ── */}
                    <button
                        onClick={handleResetPassword}
                        disabled={resetLoading || resetSent}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all group disabled:opacity-60"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-100 transition-colors">
                                {resetLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-slate-800 text-sm">
                                    {resetSent ? '✅ Reset Email Sent!' : 'Send Reset Password Email'}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    {resetSent ? `Check ${user?.email} for the reset link` : 'Receive a password reset link via email'}
                                </p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                    </button>

                    <SectionLabel>Authentication</SectionLabel>

                    <SettingRow icon={Fingerprint} title="Biometric Login" desc="Use Face ID or fingerprint" iconColor="text-emerald-500" iconBg="bg-emerald-50">
                        <Toggle checked={prefs.biometric_enabled} onChange={() => updatePref('biometric_enabled', !prefs.biometric_enabled)} color="emerald" />
                    </SettingRow>

                    {/* Session Info */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Current Session</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Signed in · Session active</p>
                    </div>
                </div>
            );

            // ── DATA & PRIVACY ───────────────────────────────────────────────
            case 'data': return (
                <div className="space-y-4">
                    <SectionLabel>Your Data</SectionLabel>
                    <button onClick={handleExportData}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform"><Download size={18} /></div>
                        <div className="text-left">
                            <p className="font-semibold text-slate-800 text-sm">Export All Data</p>
                            <p className="text-[10px] text-slate-400">Download as JSON file</p>
                        </div>
                    </button>

                    <div className="p-4 rounded-2xl bg-rose-50/50 border-2 border-rose-100 space-y-3 mt-2">
                        <div className="flex items-center gap-2 text-rose-600">
                            <AlertTriangle size={16} />
                            <p className="text-xs font-bold uppercase tracking-wider">Danger Zone</p>
                        </div>
                        <button 
                            onClick={handleDeleteAccount}
                            className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all group"
                        >
                            <div className="p-2 bg-rose-100 text-rose-500 rounded-lg group-hover:bg-rose-400 group-hover:text-white transition-colors"><Trash2 size={16} /></div>
                            <span className="font-semibold text-rose-800 group-hover:text-white text-sm">Delete Account & All Data</span>
                        </button>
                        <p className="text-[9px] text-rose-400 ml-1">This action is permanent and clears all transaction history.</p>
                    </div>
                </div>
            );
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                        className="bg-white w-full sm:max-w-4xl h-[92vh] sm:h-[82vh] sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col sm:flex-row overflow-hidden ring-1 ring-slate-200/50"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ── DESKTOP SIDEBAR ──────────────────────────────── */}
                        <div className="hidden sm:flex w-56 lg:w-64 bg-slate-50/80 border-r border-slate-100 flex-col justify-between flex-shrink-0 p-5">
                            <div>
                                {/* Mini profile */}
                                <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-orange-400 to-rose-500 flex-shrink-0">
                                        {localAvatar
                                            ? <img src={localAvatar} alt="" className="w-full h-full object-cover" onError={() => setLocalAvatar('')} />
                                            : <div className="w-full h-full flex items-center justify-center"><span className="text-white text-sm font-bold">{initials}</span></div>
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate">{displayName || 'User'}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                                    </div>
                                </div>

                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Settings</p>
                                <nav className="space-y-1">
                                    {tabs.map(tab => (
                                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activeTab === tab.id ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'}`}>
                                            <tab.icon size={17} className={activeTab === tab.id ? 'text-orange-500' : 'text-slate-400'} />
                                            <span className="font-semibold text-sm">{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all w-full">
                                <LogOut size={17} />
                                <span className="font-semibold text-sm">Sign Out</span>
                            </button>
                        </div>

                        {/* ── MOBILE TOP NAV ───────────────────────────────── */}
                        <div className="sm:hidden flex-shrink-0">
                            <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
                            <div className="flex items-center justify-between px-5 py-3">
                                <h2 className="text-lg font-bold text-slate-900">Settings</h2>
                                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400"><X size={16} /></button>
                            </div>
                            <div className="flex gap-2 px-5 pb-3 overflow-x-auto hide-scrollbar">
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap flex-shrink-0 text-xs font-bold transition-all ${activeTab === tab.id ? `${tab.bg} ${tab.color}` : 'bg-slate-100 text-slate-400'}`}>
                                        <tab.icon size={13} />{tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── CONTENT ──────────────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto bg-white">
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{tabs.find(t => t.id === activeTab)?.label}</h3>
                                </div>
                                <button onClick={onClose} className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-5 sm:p-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        {renderContent()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Mobile sign-out */}
                            <div className="sm:hidden px-5 pb-8">
                                <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-rose-500 bg-rose-50 font-semibold text-sm">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
