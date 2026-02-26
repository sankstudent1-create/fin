
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Palette, Shield, Database, LogOut, Upload,
    Sun, Moon, Monitor, Trash2, Download, Volume2, QrCode,
    Lock, Fingerprint, ChevronRight, AlertTriangle,
    Bell, Clock, Sparkles, Timer, MessageSquare, Camera,
    Check, Loader2, Edit3, Image, ChevronLeft
} from 'lucide-react';
import { supabase } from '../../config/supabase';

// ─── Preferences ────────────────────────────────────────────────────────────
const PREFS_KEY = 'orange_fin_prefs';
const DEFAULT_PREFS = {
    sound_enabled: true, sound_volume: 70, sound_duration: 300,
    notification_enabled: true, popup_duration: 3000,
    popup_style: 'pill', popup_position: 'bottom',
    theme: 'light', biometric_enabled: false,
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
export const SettingsModal = ({ isOpen, onClose, user, avatarUrl, onAvatarUpload, onOpenDigitalID }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [prefs, setPrefs] = useState(loadPrefs());
    const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '');
    const [savingName, setSavingName] = useState(false);
    const [nameSaved, setNameSaved] = useState(false);
    const [deletingAvatar, setDeletingAvatar] = useState(false);
    const [localAvatar, setLocalAvatar] = useState(avatarUrl || '');
    const fileRef = useRef(null);

    // Keep localAvatar in sync when avatarUrl prop changes
    useEffect(() => { setLocalAvatar(avatarUrl || ''); }, [avatarUrl]);

    useEffect(() => { savePrefs(prefs); }, [prefs]);
    const updatePref = (key, value) => setPrefs(prev => ({ ...prev, [key]: value }));

    // ── Avatar helpers ───────────────────────────────────────────────────────
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Preview immediately
        const preview = URL.createObjectURL(file);
        setLocalAvatar(preview);
        // Upload
        await onAvatarUpload(e);
    };

    const handleDeleteAvatar = async () => {
        setDeletingAvatar(true);
        try {
            const ext = 'jpg';
            const path = `${user.id}/avatar.${ext}`;
            await supabase.storage.from('avatars').remove([path]);
            await supabase.auth.updateUser({ data: { avatar_url: '' } });
            setLocalAvatar('');
        } catch (err) {
            console.error('Avatar delete error:', err);
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
        const tx = localStorage.getItem(`cached_tx_${user?.id}`);
        const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(tx || '[]');
        const a = document.createElement('a');
        a.href = url; a.download = `fin_data_${Date.now()}.json`;
        document.body.appendChild(a); a.click(); a.remove();
    };

    const handleSignOut = async () => { await supabase.auth.signOut(); window.location.reload(); };

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
                                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors"
                                >
                                    <Camera size={12} className="text-white" />
                                </button>
                                <input ref={fileRef} type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 flex-1">
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
                                >
                                    <Upload size={14} className="text-orange-500" /> Upload New Photo
                                </button>
                                {localAvatar && (
                                    <button
                                        onClick={handleDeleteAvatar}
                                        disabled={deletingAvatar}
                                        className="flex items-center gap-2 bg-white border border-rose-200 text-rose-500 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-rose-50 transition-all disabled:opacity-50"
                                    >
                                        {deletingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        {deletingAvatar ? 'Removing...' : 'Remove Photo'}
                                    </button>
                                )}
                                <p className="text-[10px] text-slate-400">JPG, PNG or WebP · Max 5MB</p>
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
                </div>
            );

            // ── NOTIFICATIONS ────────────────────────────────────────────────
            case 'notifications': return (
                <div className="space-y-5">
                    <div className="space-y-2">
                        <SectionLabel>Sound</SectionLabel>
                        <SettingRow icon={Volume2} title="Sound Effects" desc="Play sounds on transactions" iconColor="text-violet-500" iconBg="bg-violet-50">
                            <Toggle checked={prefs.sound_enabled} onChange={() => updatePref('sound_enabled', !prefs.sound_enabled)} />
                        </SettingRow>
                        {prefs.sound_enabled && (
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-slate-500">Volume</span>
                                        <span className="font-bold text-orange-600">{prefs.sound_volume}%</span>
                                    </div>
                                    <input type="range" min={0} max={100} value={prefs.sound_volume} onChange={e => updatePref('sound_volume', +e.target.value)} className="w-full accent-orange-500" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-slate-500">Duration</span>
                                        <span className="font-bold text-orange-600">{prefs.sound_duration}ms</span>
                                    </div>
                                    <input type="range" min={100} max={2000} value={prefs.sound_duration} onChange={e => updatePref('sound_duration', +e.target.value)} className="w-full accent-orange-500" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <SectionLabel>Popup Alerts</SectionLabel>
                        <SettingRow icon={MessageSquare} title="Toast Notifications" desc="Show popups on actions" iconColor="text-blue-500" iconBg="bg-blue-50">
                            <Toggle checked={prefs.notification_enabled} onChange={() => updatePref('notification_enabled', !prefs.notification_enabled)} color="blue" />
                        </SettingRow>
                        {prefs.notification_enabled && (
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-slate-500">Display Duration</span>
                                        <span className="font-bold text-orange-600">{(prefs.popup_duration / 1000).toFixed(1)}s</span>
                                    </div>
                                    <input type="range" min={1000} max={10000} step={500} value={prefs.popup_duration} onChange={e => updatePref('popup_duration', +e.target.value)} className="w-full accent-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-3">Position</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['top', 'bottom'].map(pos => (
                                            <button key={pos} onClick={() => updatePref('popup_position', pos)}
                                                className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${prefs.popup_position === pos ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                                {pos}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-3">Style</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['pill', 'card', 'minimal', 'banner'].map(style => (
                                            <button key={style} onClick={() => updatePref('popup_style', style)}
                                                className={`p-3 rounded-xl text-center transition-all border-2 ${prefs.popup_style === style ? 'border-orange-400 bg-orange-50 scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                                <div className={`bg-emerald-500 text-white text-[8px] font-bold mx-auto mb-1.5 px-2 py-1 ${style === 'pill' ? 'rounded-full' : style === 'card' ? 'rounded-xl shadow-lg' : style === 'banner' ? 'rounded-lg w-full' : 'rounded-md'}`}>✓ Done</div>
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
                    <div className="space-y-2">
                        <SectionLabel>Theme Preference</SectionLabel>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'light', icon: Sun, label: 'Light', desc: 'Always bright' },
                                { id: 'dark', icon: Moon, label: 'Dark', desc: 'Easy on eyes' },
                                { id: 'system', icon: Monitor, label: 'Auto', desc: 'Follows device' },
                            ].map(t => (
                                <button key={t.id} onClick={() => updatePref('theme', t.id)}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${prefs.theme === t.id ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-500/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                    <t.icon size={22} className={prefs.theme === t.id ? 'text-orange-500' : 'text-slate-400'} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{t.label}</p>
                                        <p className="text-[9px] text-slate-400">{t.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 ml-1 mt-2">Dark mode coming soon — stay tuned 🌙</p>
                    </div>
                </div>
            );

            // ── SECURITY ─────────────────────────────────────────────────────
            case 'security': return (
                <div className="space-y-3">
                    <SectionLabel>Account Protection</SectionLabel>
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-slate-100 transition-colors"><Lock size={18} /></div>
                            <div className="text-left">
                                <p className="font-semibold text-slate-800 text-sm">Change Password</p>
                                <p className="text-[10px] text-slate-400">Update your account password</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
                    </button>
                    <SettingRow icon={Fingerprint} title="Biometric Login" desc="Use Face ID or fingerprint" iconColor="text-emerald-500" iconBg="bg-emerald-50">
                        <Toggle checked={prefs.biometric_enabled} onChange={() => updatePref('biometric_enabled', !prefs.biometric_enabled)} color="emerald" />
                    </SettingRow>
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
                        <button className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all group">
                            <div className="p-2 bg-rose-100 text-rose-500 rounded-lg group-hover:bg-red-400 group-hover:text-white transition-colors"><Trash2 size={16} /></div>
                            <span className="font-semibold text-rose-800 group-hover:text-white text-sm">Delete Account & All Data</span>
                        </button>
                        <p className="text-[9px] text-rose-400 ml-1">This action is permanent and cannot be undone.</p>
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
