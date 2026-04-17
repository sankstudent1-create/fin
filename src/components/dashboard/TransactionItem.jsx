
import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Trash2, Pencil } from 'lucide-react';
import { ICON_MAP, AVAILABLE_ICONS } from '../../config/constants';

// Resolve any icon_key (lucide name or category name) → component
const resolveIcon = (iconKey) => {
    if (!iconKey) return Coins;
    // Direct map lookup (e.g. "Shopping", "Food")
    if (ICON_MAP[iconKey]) return ICON_MAP[iconKey];
    // Lucide component name lookup (e.g. "ShoppingBag", "Car")
    const found = AVAILABLE_ICONS.find(i => i.name === iconKey);
    return found?.component || Coins;
};

// Category color palette — hash category name to a consistent color
const PALETTE = [
    { bg: 'bg-rose-100', text: 'text-rose-600' },
    { bg: 'bg-orange-100', text: 'text-orange-600' },
    { bg: 'bg-amber-100', text: 'text-amber-600' },
    { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { bg: 'bg-teal-100', text: 'text-teal-600' },
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
    { bg: 'bg-pink-100', text: 'text-pink-600' },
    { bg: 'bg-orange-100', text: 'text-orange-600' },
];

const hashColor = (str = '') => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
};

export const TransactionItem = ({ transaction, categories = [], onEdit, onDelete }) => {
    // Find full category object from the live userCategories array
    const catObj = categories.find(c => c.name === transaction.category);

    const isEmoji = catObj?.is_emoji || false;
    const iconKey = catObj?.icon_key || transaction.category;
    const Icon = isEmoji ? null : resolveIcon(iconKey);
    const color = hashColor(transaction.category);

    const isExpense = transaction.type === 'expense';

    // Relative date
    const getRelativeDate = (d) => {
        const date = new Date(d);
        const now = new Date();
        const diff = Math.floor((now - date) / 86400000);
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        if (diff < 7) return date.toLocaleDateString('en-IN', { weekday: 'short' });
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            whileHover={{ scale: 1.02, x: 2 }}
            onClick={() => onEdit && onEdit(transaction)}
            className="group relative flex items-center gap-4 p-4 glass-panel border-white/5 hover:border-orange-500/30 hover:bg-white/5 transition-all cursor-pointer overflow-hidden rounded-2xl"
        >
            {/* Category Icon / Emoji */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-lg bg-white/5 border border-white/10 ${color.text} shadow-inner`}>
                {isEmoji
                    ? <span className="text-2xl leading-none drop-shadow-md">{iconKey}</span>
                    : Icon && <Icon size={20} className="drop-shadow-[0_0_8px_currentColor]" />
                }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-100 text-[15px] truncate tracking-wide">{transaction.title}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 ${color.text} uppercase tracking-wider`}>
                        {transaction.category}
                    </span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[10px] font-medium text-slate-400">{getRelativeDate(transaction.date)}</span>
                </div>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-2 shrink-0">
                <span className={`font-mono font-bold text-lg tracking-tight ${isExpense ? 'text-slate-200' : 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]'}`}>
                    {isExpense ? '-' : '+'}₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
                </span>
            </div>

            {/* Hover Actions */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#181A20] via-[#181A20]/90 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-300 flex items-center justify-end pr-4 gap-2 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(transaction); }}
                    className="p-2 bg-white/10 text-orange-400 rounded-xl hover:bg-orange-500/20 hover:scale-110 transition-all border border-orange-500/20"
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(transaction.id); }}
                    className="p-2 bg-white/10 text-rose-400 rounded-xl hover:bg-rose-500/20 hover:scale-110 transition-all border border-rose-500/20"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
};
