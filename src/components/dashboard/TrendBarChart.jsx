import React from 'react';
import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';

export const TrendBarChart = ({ transactions, type }) => {
    // Show last 10 transactions of this type
    const filtered = transactions
        .filter(t => t.type === type)
        .slice(0, 10)
        .reverse();

    const max = Math.max(...filtered.map(t => t.amount), 100);

    if (filtered.length === 0) return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <PieChart size={32} className="mb-2 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No data for chart</p>
        </div>
    );

    return (
        <div className="flex items-end justify-between h-56 w-full gap-3 mt-8 px-2">
            {filtered.map((t, i) => (
                <div key={i} className="flex flex-col items-center flex-1 h-full group">
                    {/* Bar Container */}
                    <div className="relative flex-1 w-full flex items-end">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(t.amount / max) * 100}%` }}
                            transition={{ type: "spring", stiffness: 100, damping: 20, delay: i * 0.05 }}
                            className={`w-full max-w-[12px] mx-auto rounded-t-lg transition-all duration-300 shadow-sm relative ${type === 'income'
                                    ? 'bg-gradient-to-t from-emerald-500 to-emerald-300'
                                    : 'bg-gradient-to-t from-rose-500 to-rose-300'
                                } group-hover:brightness-110 group-hover:shadow-lg`}
                        >
                            {/* Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-20 shadow-xl pointer-events-none border border-white/20">
                                ₹{t.amount.toLocaleString()}
                            </div>
                        </motion.div>
                    </div>

                    {/* Date Label - Outside the animated bar */}
                    <div className="mt-4 text-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            {t.date ? new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '?'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
