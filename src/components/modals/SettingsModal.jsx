import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Bell, Sparkles, Volume2, ShieldCheck, Download, User, CheckCircle2, QrCode } from 'lucide-react';
import { Button } from '../ui/Primitives';
import html2canvas from 'html2canvas';

export const SettingsModal = ({ isOpen, onClose, user, avatarUrl, onAvatarUpload }) => {
    const [appSettings, setAppSettings] = useState(() => {
        const saved = localStorage.getItem('app_settings');
        return saved ? JSON.parse(saved) : {
            soundEnabled: true,
            soundType: 'modern',
            popupStyle: 'glass',
            notificationDuration: 3000,
            darkMode: false,
            currency: 'INR',
            precision: 2,
            autoSync: true,
            statsViewMode: 'month'
        };
    });

    const [showID, setShowID] = useState(false);
    const idCardRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('app_settings', JSON.stringify(appSettings));
    }, [appSettings]);

    const downloadID = async () => {
        if (!idCardRef.current) return;
        const canvas = await html2canvas(idCardRef.current, {
            backgroundColor: null,
            scale: 2
        });
        const link = document.createElement('a');
        link.download = `OrangeID_${user?.user_metadata?.full_name?.replace(' ', '_') || 'Member'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}
            />

            <AnimatePresence>
                {!showID ? (
                    <motion.div
                        key="settings-panel"
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        className="relative w-[90%] h-[90%] bg-[#fcfcfc] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-15px_rgba(0,0,0,0.3)] flex flex-col"
                    >
                        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">App Configuration</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Preferences & Digital Identity</p>
                            </div>
                            <button onClick={onClose} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 pt-6 space-y-8 overflow-y-auto custom-scrollbar">
                            {/* Profile & ID Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-5 bg-orange-50 rounded-[2rem] border border-orange-100">
                                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('settings-avatar-input').click()}>
                                        <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity text-white">
                                            <Camera size={18} />
                                        </div>
                                        <input id="settings-avatar-input" type="file" className="hidden" onChange={onAvatarUpload} accept="image/*" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-900 truncate tracking-tight">{user?.user_metadata?.full_name || 'Orange Client'}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold truncate opacity-70">{user?.email}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowID(true)}
                                    className="flex items-center justify-between gap-4 p-5 bg-slate-900 rounded-[2rem] text-white hover:scale-[1.02] transition-transform shadow-xl shadow-slate-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-xl"><ShieldCheck size={20} className="text-orange-400" /></div>
                                        <div className="text-left">
                                            <h4 className="text-sm font-black tracking-tight">Digital Orange ID</h4>
                                            <p className="text-[9px] font-bold text-white/50 uppercase">Verified Member</p>
                                        </div>
                                    </div>
                                    <QrCode size={20} className="text-white/30" />
                                </button>
                            </div>

                            {/* Alert Settings */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Alerts & Intelligence</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-xl shadow-sm"><Volume2 size={18} className="text-orange-500" /></div>
                                                <span className="font-black text-xs text-slate-700 uppercase tracking-tight">Audio Signals</span>
                                            </div>
                                            <button
                                                onClick={() => setAppSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${appSettings.soundEnabled ? 'bg-orange-600' : 'bg-slate-300'}`}
                                            >
                                                <motion.div
                                                    animate={{ x: appSettings.soundEnabled ? 26 : 2 }}
                                                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                                />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Modern', 'Retro', 'Subtle'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setAppSettings(s => ({ ...s, soundType: type.toLowerCase() }))}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${appSettings.soundType === type.toLowerCase() ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-xl shadow-sm"><Sparkles size={18} className="text-purple-500" /></div>
                                            <span className="font-black text-xs text-slate-700 uppercase tracking-tight">Financial Precision</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {[0, 1, 2].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setAppSettings(s => ({ ...s, precision: p }))}
                                                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${appSettings.precision === p ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    {p} Decimals
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-indigo-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md border border-white/20">
                                            <ShieldCheck size={32} className="text-indigo-200" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black tracking-tight leading-none mb-1">Elite Protocol Mastery</h4>
                                            <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-[0.2em]">Priority Encryption & Advanced Analytics Active</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowID(true)}
                                        className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-xl"
                                    >
                                        Open Identity Node
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">System Behavior</h4>
                                        <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Auto-Cloud Sync</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Real-time verification</p>
                                                </div>
                                                <button
                                                    onClick={() => setAppSettings(s => ({ ...s, autoSync: !s.autoSync }))}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${appSettings.autoSync ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                >
                                                    <motion.div
                                                        animate={{ x: appSettings.autoSync ? 26 : 2 }}
                                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                                                <div>
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Dark Protocol</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Battery saving mode</p>
                                                </div>
                                                <button
                                                    onClick={() => setAppSettings(s => ({ ...s, darkMode: !s.darkMode }))}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${appSettings.darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                                >
                                                    <motion.div
                                                        animate={{ x: appSettings.darkMode ? 26 : 2 }}
                                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Visual Dynamics</h4>
                                        <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                            <div className="flex justify-between mb-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alert Lifetime</label>
                                                <span className="text-[10px] font-black text-orange-600">{(appSettings.notificationDuration / 1000).toFixed(1)}s</span>
                                            </div>
                                            <input
                                                type="range" min="1000" max="8000" step="500"
                                                value={appSettings.notificationDuration}
                                                onChange={(e) => setAppSettings(s => ({ ...s, notificationDuration: parseInt(e.target.value) }))}
                                                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-orange-500 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2.5rem] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-2xl"><Sparkles size={20} className="text-purple-400" /></div>
                                    <div>
                                        <h4 className="text-sm font-black text-white tracking-tight">Fluid Interface</h4>
                                        <p className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Smart Theme Adaptation</p>
                                    </div>
                                </div>
                                <span className="bg-emerald-500 text-[8px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-50">
                            <Button onClick={onClose} className="w-full py-5 text-lg shadow-2xl rounded-[2rem]">
                                Save Configuration
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="id-card-view"
                        initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="relative w-full max-w-sm flex flex-col items-center gap-8"
                    >
                        <div
                            ref={idCardRef}
                            className="w-full aspect-[1/1.5] bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden border-[12px] border-white/10"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full -ml-32 -mb-32 blur-[100px] opacity-40"></div>

                            <div className="relative h-full flex flex-col justify-between z-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Orange</h2>
                                        <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.4em] mt-1">Identity Node</p>
                                    </div>
                                    <div className="bg-white/10 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                                        <CheckCircle2 size={24} className="text-emerald-500" />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-48 h-48 rounded-[3rem] border-[6px] border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden mb-8 bg-slate-800 relative group">
                                        <img src={avatarUrl} alt="User" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                                    </div>
                                    <h3 className="text-3xl font-black text-white text-center tracking-tighter leading-none mb-3 drop-shadow-lg">{user?.user_metadata?.full_name || 'Orange Member'}</h3>
                                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-2.5 rounded-full shadow-xl">
                                        <Sparkles size={14} className="text-yellow-400" />
                                        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">verified authority</span>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Clearance</p>
                                            <p className="text-[11px] font-black text-white uppercase tracking-tight">Level 5 Admin</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Joined</p>
                                            <p className="text-[11px] font-black text-white uppercase tracking-tight">{new Date().getFullYear()}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-white/10 pt-8">
                                        <div>
                                            <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 font-mono">system.auth.node</p>
                                            <p className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                                Active Session
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded-[1.5rem] shadow-2xl transform hover:scale-105 transition-transform">
                                            <QrCode size={54} className="text-slate-900" />
                                        </div>
                                    </div>
                                    <p className="text-[8px] text-white/20 font-mono text-center opacity-40 select-none tracking-widest">
                                        {user?.id?.match(/.{1,4}/g).join('-').toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full">
                            <Button
                                onClick={downloadID}
                                variant="secondary"
                                className="flex-1 bg-white text-slate-900 hover:bg-slate-100 py-4 shadow-xl"
                            >
                                <Download size={20} className="mr-2" /> Download ID
                            </Button>
                            <Button
                                onClick={() => setShowID(false)}
                                className="flex-1 bg-slate-800 text-white hover:bg-slate-700 py-4 shadow-xl border border-white/10"
                            >
                                <RotateCcw size={20} className="mr-2" /> Return
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const RotateCcw = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);
