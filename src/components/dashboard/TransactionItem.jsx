import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Star } from 'lucide-react';
import { ICON_MAP } from '../../config/constants';

export const TransactionItem = ({ t, categories, onEdit, onDelete }) => {
    const cat = categories.find(c => c.name === t.category);
    const CatIcon = ICON_MAP[cat?.icon_key] || Star;
    const isEmoji = cat?.isEmoji;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            onClick={() => onEdit(t)}
            className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-gray-50 shadow-sm flex items-center justify-between group hover:border-orange-200 hover:bg-white transition-all cursor-pointer active:scale-95"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                    } text-xl shadow-inner`}>
                    {isEmoji ? cat.icon_key : <CatIcon size={20} />}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm truncate w-32 tracking-tight">{t.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        {t.category} • {t.date ? new Date(t.date).toLocaleDateString() : 'Syncing...'}
                    </p>
                </div>
            </div>
            <div className="text-right flex items-center gap-3">
                <div>
                    <span className={`block font-black text-sm tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'
                        }`}>
                        {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                    </span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                    className="text-gray-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </motion.div>
    );
};
