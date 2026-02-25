
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, QrCode, Fingerprint, Calendar } from 'lucide-react';

export const DigitalIDModal = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;

    const domain = window.location.hostname;
    const joinDate = new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[500] bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center p-6"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, rotateY: 90 }} animate={{ scale: 1, rotateY: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 20 }}
                        className="max-w-md w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Stripe */}
                        <div className="h-32 bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            <div className="absolute bottom-4 left-6 text-white">
                                <h2 className="text-2xl font-black italic tracking-tight">Fin.ID</h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Swinfosystems Identity</p>
                            </div>
                            <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-colors text-white">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Avatar & Info */}
                        <div className="px-8 pb-8 -mt-12 relative">
                            <div className="flex justify-between items-end mb-6">
                                <div className="w-24 h-24 rounded-[1.5rem] border-4 border-white shadow-xl overflow-hidden bg-white">
                                    <img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="mb-2 text-right">
                                    <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 mb-1">
                                        <ShieldCheck size={12} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Verified</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Identity Name</label>
                                    <h3 className="text-2xl font-black text-slate-900 leading-none">{user?.user_metadata?.full_name || 'Anonymous User'}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Access ID</label>
                                        <p className="font-mono text-sm font-bold text-slate-600 truncate bg-slate-50 p-2 rounded-lg">{user?.id?.slice(0, 8) || 'xxxx-xxxx'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Registered On</label>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                                            <Calendar size={14} className="text-orange-500" />
                                            {joinDate}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Domain Authority</label>
                                    <p className="font-medium text-slate-800 border-b-2 border-slate-100 pb-1">{domain || 'localhost'}</p>
                                </div>

                                {/* QR Code Simulation */}
                                <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white mt-4">
                                    <div>
                                        <Fingerprint size={32} className="text-orange-500 mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Biometric Hash</p>
                                        <p className="text-xs font-mono opacity-80 mt-1">0x8F...3A2</p>
                                    </div>
                                    <div className="bg-white p-2 rounded-xl">
                                        <QrCode size={40} className="text-slate-900" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Powered by Swinfosystems Secure Core</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
