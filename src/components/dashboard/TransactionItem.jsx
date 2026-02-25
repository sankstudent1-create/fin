
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Trash2, Calendar } from 'lucide-react';
import { ICON_MAP } from '../../config/constants';

export const TransactionItem = ({ transaction, categories, onEdit, onDelete }) => {
    // Helper to get icon
    const category = categories.find(c => c.name === transaction.category) || {};
    const Icon = ICON_MAP[category.icon_key] || Coins;

    const isExpense = transaction.type === 'expense';
    const date = new Date(transaction.date);

    // Relative Date Logic
    const getRelativeDate = (d) => {
        const now = new Date();
        const diff = now - d;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onEdit && onEdit(transaction)}
            className="group relative flex items-center justify-between p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
        >
            <div className="flex items-center gap-4 z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isExpense ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm">{transaction.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{transaction.category}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            {getRelativeDate(date)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 z-10">
                <span className={`font-black text-lg ${isExpense ? 'text-slate-900' : 'text-emerald-500'}`}>
                    {isExpense ? '- ' : '+ '}₹{parseFloat(transaction.amount).toLocaleString()}
                </span>
            </div>

            {/* Hover Actions */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-4 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(transaction.id); }}
                    className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:scale-110"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </motion.div>
    );
};
