import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { supabase } from '../../config/supabase';

export const BannerModal = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();
            if (!error && data) {
                setSettings(data);
            }
        };
        if (isOpen) fetchSettings();
    }, [isOpen]);

    if (!isOpen || !settings || !settings.show_support_banner) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-[#181A20]/80 backdrop-blur-3xl border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                onClick={e => e.stopPropagation()}
            >
                {settings.support_image_url && (
                    <div className="w-full h-48 bg-slate-100 flex-shrink-0 relative">
                        <img
                            src={settings.support_image_url}
                            alt="Announcement"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="p-6 relative">
                    {!settings.support_image_url && (
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <h2 className="text-xl font-black text-white mb-2 pr-8 leading-tight">
                        {settings.support_title || "Announcement"}
                    </h2>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed whitespace-pre-wrap">
                        {settings.support_message}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 transition-all text-shadow-sm"
                    >
                        Got it
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
