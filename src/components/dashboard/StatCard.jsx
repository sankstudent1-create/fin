
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const FORMAT_INR = (v) => {
    const n = Math.abs(v || 0);
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
};

const CONFIGS = {
    income: {
        gradient: 'from-emerald-500 to-teal-500',
        light: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-100',
        badge: 'bg-emerald-100 text-emerald-700',
        glow: 'shadow-emerald-500/10',
        label: 'Total Income',
    },
    expense: {
        gradient: 'from-rose-500 to-pink-500',
        light: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-100',
        badge: 'bg-rose-100 text-rose-700',
        glow: 'shadow-rose-500/10',
        label: 'Total Expense',
    },
    balance: {
        gradient: 'from-violet-500 to-indigo-500',
        light: 'bg-violet-50',
        text: 'text-violet-600',
        border: 'border-violet-100',
        badge: 'bg-violet-100 text-violet-700',
        glow: 'shadow-violet-500/10',
        label: 'Net Balance',
    },
};

export const StatCard = ({ label, value = 0, icon: Icon, type = 'balance', onClick }) => {
    const cfg = CONFIGS[type] || CONFIGS.balance;
    const isNeg = value < 0;
    const Trend = type === 'income' ? TrendingUp : type === 'expense' ? TrendingDown : null;

    return (
        <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={`relative bg-white rounded-2xl sm:rounded-3xl border ${cfg.border} shadow-sm hover:shadow-lg ${cfg.glow} transition-all cursor-pointer overflow-hidden p-4 sm:p-5 flex flex-col gap-3`}
        >
            {/* Icon */}
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${cfg.gradient} shadow-sm`}>
                <Icon size={18} className="text-white" strokeWidth={2.5} />
            </div>

            {/* Value */}
            <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className={`font-bold text-lg sm:text-xl tracking-tight ${isNeg ? 'text-rose-600' : 'text-slate-900'}`}>
                    {isNeg ? '-' : ''}{FORMAT_INR(Math.abs(value))}
                </p>
            </div>

            {/* Trend Badge */}
            {Trend && (
                <div className={`absolute top-3 right-3 p-1.5 rounded-lg ${cfg.light}`}>
                    <Trend size={12} className={cfg.text} />
                </div>
            )}

            {/* Decorative gradient bar at bottom */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${cfg.gradient} opacity-50`} />
        </motion.div>
    );
};
