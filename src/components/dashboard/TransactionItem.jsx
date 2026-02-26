
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
    { bg: 'bg-cyan-100', text: 'text-cyan-600' },
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
            whileHover={{ scale: 1.01 }}
            onClick={() => onEdit && onEdit(transaction)}
            className="group relative flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
        >
            {/* Category Icon / Emoji */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg ${color.bg} ${color.text}`}>
                {isEmoji
                    ? <span className="text-xl leading-none">{iconKey}</span>
                    : Icon && <Icon size={18} />
                }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{transaction.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${color.bg} ${color.text}`}>
                        {transaction.category}
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400">{getRelativeDate(transaction.date)}</span>
                </div>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-2 shrink-0">
                <span className={`font-bold text-base tabular-nums ${isExpense ? 'text-slate-800' : 'text-emerald-600'}`}>
                    {isExpense ? '-' : '+'}₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
                </span>
            </div>

            {/* Hover Actions */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white/95 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-3 gap-1.5 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(transaction); }}
                    className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all"
                >
                    <Pencil size={13} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(transaction.id); }}
                    className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-rose-100 hover:text-rose-600 transition-all"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </motion.div>
    );
};
