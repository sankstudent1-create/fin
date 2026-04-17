
import React from 'react';
import { motion } from 'framer-motion';

export const TrendBarChart = ({ transactions, type = 'expense', range = 7 }) => {
    // Process data based on range (days)
    const dailyData = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = range - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        d.setHours(0, 0, 0, 0);
        dailyData.push({
            date: new Date(d),
            label: range <= 7
                ? d.toLocaleDateString('en-US', { weekday: 'short' })
                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            val: 0
        });
    }

    // Aggregate transaction amounts per day
    transactions.filter(t => t.type === type).forEach(t => {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        const dayRecord = dailyData.find(d => d.date.toDateString() === tDate.toDateString());
        if (dayRecord) {
            dayRecord.val += parseFloat(t.amount) || 0;
        }
    });

    const maxVal = Math.max(...dailyData.map(d => d.val), 1);
    const hasData = dailyData.some(d => d.val > 0);

    // Determine how many bars to show (max 14 labels)
    const showLabels = range <= 14;
    const barMaxWidth = range <= 7 ? 'max-w-[20px]' : range <= 14 ? 'max-w-[14px]' : 'max-w-[10px]';

    return (
        <div className="h-48 w-full relative pt-6">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
                {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (
                    <div key={i} className="w-full border-t border-dashed border-white/5 relative">
                        {i < 4 && (
                            <span className="absolute -top-3 right-0 text-[9px] text-slate-500 tabular-nums select-none">
                                ₹{Math.round(maxVal * tick).toLocaleString()}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-0 pl-0 pr-4">
                {dailyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                        <div className={`w-full ${barMaxWidth} h-full flex items-end relative rounded-t-full bg-white/5 overflow-hidden`}>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: hasData ? `${Math.max((d.val / maxVal) * 100, d.val > 0 ? 6 : 2)}%` : '2%' }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100, delay: i * 0.04 }}
                                className={`w-full rounded-t-full transition-all duration-300 relative ${type === 'expense'
                                    ? 'bg-gradient-to-t from-rose-500 to-rose-300 group-hover:from-rose-600 group-hover:to-rose-400'
                                    : 'bg-gradient-to-t from-emerald-500 to-emerald-300 group-hover:from-emerald-600 group-hover:to-emerald-400'
                                    } ${d.val === 0 ? 'opacity-30' : 'opacity-100'}`}
                            >
                                {/* Glow on hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 rounded-t-full" />
                            </motion.div>
                        </div>

                        {/* Tooltip */}
                        {d.val > 0 && (
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 bg-white/10 backdrop-blur-3xl text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-30 border border-white/10">
                                <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white/20 border-r border-b border-white/10 rotate-45" />
                                ₹{d.val.toLocaleString()}
                            </div>
                        )}

                        {/* Label */}
                        {showLabels && (
                            <p className="text-[9px] font-bold uppercase text-slate-500 mt-2 text-center w-full truncate select-none">{d.label}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* No Data State */}
            {!hasData && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <p className="text-xs font-bold text-slate-400 bg-[#181A20]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">No {type} data in this period</p>
                </div>
            )}
        </div>
    );
};
