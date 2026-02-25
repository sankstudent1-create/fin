
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Palette, Shield, Database, LogOut, Upload,
    Sun, Moon, Monitor, Trash2, Download, Volume2, QrCode,
    Lock, Fingerprint, ChevronRight, AlertTriangle,
    Bell, Clock, Sparkles, ChevronLeft, Timer, MessageSquare
} from 'lucide-react';
import { supabase } from '../../config/supabase';

// --- User Preferences Manager ---
const PREFS_KEY = 'orange_fin_prefs';

const DEFAULT_PREFS = {
    sound_enabled: true,
    sound_volume: 70,
    sound_duration: 300, // ms
    notification_enabled: true,
    popup_duration: 3000, // ms — how long toast stays
    popup_style: 'pill', // 'pill' | 'card' | 'minimal' | 'banner'
    popup_position: 'bottom', // 'top' | 'bottom'
    theme: 'light',
    biometric_enabled: false,
};

const loadPrefs = () => {
    try {
        const saved = localStorage.getItem(PREFS_KEY);
        return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : { ...DEFAULT_PREFS };
    } catch { return { ...DEFAULT_PREFS }; }
};

const savePrefs = (prefs) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
};

// Expose globally for other components
export const getUserPrefs = loadPrefs;

// --- Toggle Component ---
const Toggle = ({ checked, onChange, color = 'orange' }) => {
    const colors = {
        orange: checked ? 'bg-orange-500' : 'bg-slate-200',
        emerald: checked ? 'bg-emerald-500' : 'bg-slate-200',
        blue: checked ? 'bg-blue-500' : 'bg-slate-200',
    };
    return (
        <button
            onClick={onChange}
            className={`w-14 h-8 rounded-full transition-all relative shadow-inner flex-shrink-0 ${colors[color]}`}
        >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${checked ? 'left-7' : 'left-1'}`} />
        </button>
    );
};

// --- Slider Component ---
const Slider = ({ value, onChange, min = 0, max = 100, label, suffix = '', icon: Icon }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                {Icon && <Icon size={14} className="text-slate-400" />}
                <span className="text-xs font-bold text-slate-500">{label}</span>
            </div>
            <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg tabular-nums">
                {value}{suffix}
            </span>
        </div>
        <input
            type="range" min={min} max={max} value={value}
            onChange={e => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-orange-500"
        />
    </div>
);

// --- Setting Row Component ---
const SettingRow = ({ icon: Icon, title, desc, children, iconColor = 'text-slate-500', iconBg = 'bg-slate-50' }) => (
    <div className="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className={`p-2.5 sm:p-3 ${iconBg} ${iconColor} rounded-xl sm:rounded-2xl flex-shrink-0`}>
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{title}</h4>
                {desc && <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">{desc}</p>}
            </div>
        </div>
        {children}
    </div>
);

// --- Section Header ---
const SectionHeader = ({ icon: Icon, title, desc }) => (
    <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {Icon && <Icon size={22} className="text-orange-500" />}
            {title}
        </h3>
        {desc && <p className="text-sm text-slate-400 font-medium mt-1 ml-0 sm:ml-9">{desc}</p>}
    </div>
);

// --- Popup Style Preview ---
const PopupStyleOption = ({ style, selected, onClick }) => {
    const styles = {
        pill: { label: 'Pill', desc: 'Rounded pill', preview: 'rounded-full px-4 py-2' },
        card: { label: 'Card', desc: 'Shadowed card', preview: 'rounded-2xl px-4 py-3 shadow-xl' },
        minimal: { label: 'Minimal', desc: 'Subtle bar', preview: 'rounded-lg px-4 py-2' },
        banner: { label: 'Banner', desc: 'Full width', preview: 'rounded-xl px-4 py-2 w-full' },
    };
    const s = styles[style];
    return (
        <button
            onClick={onClick}
            className={`p-3 sm:p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${selected
                    ? 'border-orange-400 bg-orange-50 shadow-md scale-[1.02]'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
        >
            {/* Mini preview */}
            <div className={`bg-emerald-500 text-white text-[8px] font-bold ${s.preview} mx-auto`}>
                ✅ Success
            </div>
            <span className="text-[10px] font-black text-slate-700">{s.label}</span>
            <span className="text-[8px] text-slate-400">{s.desc}</span>
        </button>
    );
};

export const SettingsModal = ({ isOpen, onClose, user, avatarUrl, onAvatarUpload, onOpenDigitalID }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [prefs, setPrefs] = useState(loadPrefs());
    const [showMobileNav, setShowMobileNav] = useState(true);

    // Sync prefs to localStorage on change
    useEffect(() => {
        savePrefs(prefs);
    }, [prefs]);

    const updatePref = (key, value) => {
        setPrefs(prev => ({ ...prev, [key]: value }));
    };

    const handleExportData = () => {
        const transactions = localStorage.getItem(`cached_tx_${user.id}`);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(transactions || '[]');
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `orange_finance_data_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'notifications', label: 'Alerts & Popups', icon: Bell, color: 'text-violet-600', bg: 'bg-violet-50' },
        { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'security', label: 'Security', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'data', label: 'Data & Privacy', icon: Database, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    const currentTab = tabs.find(t => t.id === activeTab);

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <SectionHeader icon={User} title="Profile" desc="Manage your personal identity" />

                        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
                            <div className="relative group shrink-0">
                                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-2xl sm:rounded-[2rem] backdrop-blur-sm">
                                    <Upload size={20} className="text-white drop-shadow-md" />
                                    <input type="file" className="hidden" onChange={onAvatarUpload} accept="image/*" />
                                </label>
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="font-black text-slate-900 text-xl sm:text-2xl mb-1">{user?.user_metadata?.full_name?.split(' ')[0] || 'User'}</h4>
                                <p className="text-slate-400 font-medium text-sm mb-3">{user?.email}</p>
                                <button
                                    onClick={onOpenDigitalID}
                                    className="bg-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-orange-600 shadow-sm hover:shadow-md hover:scale-105 transition-all inline-flex items-center gap-2 border border-orange-100"
                                >
                                    <QrCode size={14} /> Digital ID
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Display Name</label>
                                <input
                                    type="text"
                                    defaultValue={user?.user_metadata?.full_name}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-700 focus:border-orange-400 focus:bg-white outline-none transition-all shadow-sm text-sm"
                                />
                            </div>
                            <div className="opacity-60">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                                <input
                                    type="email"
                                    defaultValue={user?.email}
                                    disabled
                                    className="w-full bg-slate-100 border-2 border-transparent rounded-2xl px-5 py-3.5 font-bold text-slate-500 cursor-not-allowed text-sm"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <SectionHeader icon={Bell} title="Alerts & Popups" desc="Control sounds, notifications, and popup behavior" />

                        {/* Sound Settings */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sound</p>

                            <SettingRow icon={Volume2} title="Sound Effects" desc="Play interaction sounds" iconColor="text-violet-500" iconBg="bg-violet-50">
                                <Toggle checked={prefs.sound_enabled} onChange={() => updatePref('sound_enabled', !prefs.sound_enabled)} />
                            </SettingRow>

                            {prefs.sound_enabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3 pl-2"
                                >
                                    <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-100">
                                        <Slider
                                            icon={Volume2}
                                            label="Volume"
                                            value={prefs.sound_volume}
                                            onChange={(v) => updatePref('sound_volume', v)}
                                            suffix="%"
                                        />
                                        <Slider
                                            icon={Timer}
                                            label="Sound Duration"
                                            value={prefs.sound_duration}
                                            onChange={(v) => updatePref('sound_duration', v)}
                                            min={100}
                                            max={2000}
                                            suffix="ms"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Popup / Toast Settings */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Popup Notifications</p>

                            <SettingRow icon={MessageSquare} title="Popup Alerts" desc="Show toast notifications" iconColor="text-blue-500" iconBg="bg-blue-50">
                                <Toggle checked={prefs.notification_enabled} onChange={() => updatePref('notification_enabled', !prefs.notification_enabled)} color="blue" />
                            </SettingRow>

                            {prefs.notification_enabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 pl-2"
                                >
                                    {/* Duration */}
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <Slider
                                            icon={Clock}
                                            label="Popup Display Duration"
                                            value={prefs.popup_duration}
                                            onChange={(v) => updatePref('popup_duration', v)}
                                            min={1000}
                                            max={10000}
                                            suffix="ms"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            {prefs.popup_duration < 2000 ? '⚡ Quick flash' : prefs.popup_duration < 5000 ? '👌 Comfortable' : '⏳ Long stay'}
                                        </p>
                                    </div>

                                    {/* Position */}
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                        <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                            <Sparkles size={14} className="text-slate-400" /> Popup Position
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['top', 'bottom'].map(pos => (
                                                <button
                                                    key={pos}
                                                    onClick={() => updatePref('popup_position', pos)}
                                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${prefs.popup_position === pos
                                                            ? 'bg-orange-500 text-white shadow-lg'
                                                            : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600'
                                                        }`}
                                                >
                                                    {pos}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Popup Design */}
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                        <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                            <Palette size={14} className="text-slate-400" /> Popup Design
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {['pill', 'card', 'minimal', 'banner'].map(style => (
                                                <PopupStyleOption
                                                    key={style}
                                                    style={style}
                                                    selected={prefs.popup_style === style}
                                                    onClick={() => updatePref('popup_style', style)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <SectionHeader icon={Palette} title="Appearance" desc="Customize your visual experience" />

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Preference</p>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'light', icon: Sun, label: 'Light' },
                                    { id: 'dark', icon: Moon, label: 'Dark' },
                                    { id: 'system', icon: Monitor, label: 'Auto' },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => updatePref('theme', t.id)}
                                        className={`p-4 sm:p-6 rounded-2xl border-2 flex flex-col items-center gap-2 sm:gap-3 transition-all ${prefs.theme === t.id
                                                ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-lg shadow-orange-500/10'
                                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                            }`}
                                    >
                                        <t.icon size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <SectionHeader icon={Shield} title="Security" desc="Protect your account and data" />

                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 transition-all group shadow-sm">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-2.5 sm:p-3 bg-slate-50 text-slate-600 rounded-xl sm:rounded-2xl group-hover:bg-slate-100 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">Change Password</h4>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Update your account password</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600 flex-shrink-0" />
                            </button>

                            <SettingRow icon={Fingerprint} title="Biometric Login" desc="Face ID / fingerprint" iconColor="text-emerald-500" iconBg="bg-emerald-50">
                                <Toggle checked={prefs.biometric_enabled} onChange={() => updatePref('biometric_enabled', !prefs.biometric_enabled)} color="emerald" />
                            </SettingRow>
                        </div>
                    </div>
                );

            case 'data':
                return (
                    <div className="space-y-6">
                        <SectionHeader icon={Database} title="Data & Privacy" desc="Control your financial data" />

                        <div className="space-y-3">
                            <button
                                onClick={handleExportData}
                                className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-lg transition-all group shadow-sm"
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="p-2.5 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
                                        <Download size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-900">Export All Data</h4>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Download as JSON</p>
                                    </div>
                                </div>
                            </button>

                            <div className="pt-4">
                                <div className="p-5 rounded-2xl border-2 border-rose-100 bg-rose-50/30 space-y-4">
                                    <div className="flex items-center gap-2 text-rose-600">
                                        <AlertTriangle size={18} />
                                        <h4 className="font-black text-xs uppercase tracking-wider">Danger Zone</h4>
                                    </div>
                                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-rose-200 hover:bg-rose-500 hover:text-white transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-100 text-rose-500 rounded-lg group-hover:bg-rose-400 group-hover:text-white transition-colors">
                                                <Trash2 size={18} />
                                            </div>
                                            <span className="font-bold text-rose-900 group-hover:text-white text-sm">Delete Account</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
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
                        initial={{ scale: 0.95, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 40 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white w-full sm:max-w-5xl h-[92vh] sm:h-[85vh] sm:rounded-[2.5rem] rounded-t-[2rem] shadow-2xl flex flex-col sm:flex-row overflow-hidden ring-1 ring-white/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* === MOBILE: Top nav (horizontal scroll) === */}
                        {/* === DESKTOP: Sidebar === */}

                        {/* Desktop sidebar */}
                        <div className="hidden sm:flex w-20 lg:w-64 bg-slate-50 border-r border-slate-100 p-4 lg:p-6 flex-col justify-between flex-shrink-0">
                            <div className="space-y-4">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight hidden lg:block px-2">Settings</h2>
                                <nav className="space-y-1">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group ${activeTab === tab.id
                                                    ? 'bg-white shadow-lg shadow-orange-500/10 text-orange-600'
                                                    : 'text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm'
                                                }`}
                                        >
                                            <tab.icon size={20} className={`transition-colors flex-shrink-0 ${activeTab === tab.id ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                            <span className="font-bold text-sm hidden lg:block truncate">{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-rose-500 hover:bg-rose-50 group"
                            >
                                <LogOut size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                                <span className="font-bold text-sm hidden lg:block">Sign Out</span>
                            </button>
                        </div>

                        {/* Mobile top nav */}
                        <div className="sm:hidden flex-shrink-0">
                            {/* Drag handle */}
                            <div className="flex justify-center py-3">
                                <div className="w-10 h-1 bg-slate-200 rounded-full" />
                            </div>
                            {/* Mobile header */}
                            <div className="flex items-center justify-between px-5 pb-2">
                                <h2 className="text-lg font-black text-slate-900">Settings</h2>
                                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <X size={16} />
                                </button>
                            </div>
                            {/* Mobile tab pills */}
                            <div className="flex gap-2 px-5 pb-4 overflow-x-auto hide-scrollbar">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.id
                                                ? `${tab.bg} ${tab.color} shadow-sm`
                                                : 'bg-slate-50 text-slate-400'
                                            }`}
                                    >
                                        <tab.icon size={16} />
                                        <span className="text-xs font-bold">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10 relative bg-white">
                            {/* Desktop close button */}
                            <button onClick={onClose} className="hidden sm:flex absolute top-6 right-6 w-9 h-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10">
                                <X size={18} />
                            </button>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>

                            {/* Mobile sign-out */}
                            <div className="sm:hidden mt-8 mb-4">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-rose-500 bg-rose-50 font-bold text-sm"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
