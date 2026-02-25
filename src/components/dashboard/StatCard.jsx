
import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ label, value, icon: Icon, type = 'balance', onClick }) => {
    const getColors = () => {
        switch (type) {
            case 'income': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'expense': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        }
    };

    const colors = getColors();

    return (
        <motion.div
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colors}`}>
                    <Icon size={24} />
                </div>
                {type !== 'balance' && (
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colors}`}>
                        {type}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    ₹{value?.toLocaleString() || '0'}
                </h3>
            </div>

            {/* Decorative background circle */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform ${colors.split(' ')[0].replace('bg-', 'bg-')}`} />
        </motion.div>
    );
};
