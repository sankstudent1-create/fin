import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const CalendarHeatmap = ({ transactions }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { daysInMonth, startDay, monthName, year, dayData, totalSpent, highestDay } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-11
        const monthName = currentDate.toLocaleString('default', { month: 'long' });

        // Days in month
        const daysInDte = new Date(year, month + 1, 0).getDate();
        // Day of week the month starts on (0=Sun, 1=Mon, etc) Let's make Monday=0 for standard EU/IN grids
        let startDay = new Date(year, month, 1).getDay() - 1;
        if (startDay === -1) startDay = 6; // Sunday becomes 6

        // Gather expenses
        const expenses = transactions.filter(t => t.type === 'expense');

        const dayMap = {};
        let total = 0;
        let highest = 0;

        for (let i = 1; i <= daysInDte; i++) {
            dayMap[i] = { amount: 0, count: 0, isToday: false, isFuture: false };
        }

        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        expenses.forEach(t => {
            const tDate = new Date(t.date);
            if (tDate.getMonth() === month && tDate.getFullYear() === year) {
                const day = tDate.getDate();
                if (dayMap[day]) {
                    dayMap[day].amount += parseFloat(t.amount);
                    dayMap[day].count += 1;
                    total += parseFloat(t.amount);
                    if (dayMap[day].amount > highest) highest = dayMap[day].amount;
                }
            }
        });

        // Mark today & future
        for (let i = 1; i <= daysInDte; i++) {
            if (isCurrentMonth) {
                if (i === today.getDate()) dayMap[i].isToday = true;
                if (i > today.getDate()) dayMap[i].isFuture = true;
            } else if (currentDate > today) {
                dayMap[i].isFuture = true;
            }
        }

        return { daysInMonth: daysInDte, startDay, monthName, year, dayData: dayMap, totalSpent: total, highestDay: highest };
    }, [transactions, currentDate]);

    const handlePrev = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNext = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleToday = () => setCurrentDate(new Date());

    // Generate grid array
    const blanks = Array(startDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
    const totalCells = [...blanks, ...days];

    const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

    return (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 mt-8 mb-8 relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="text-blue-500" size={24} />
                        Spending Calendar
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">High spend = Red, Zero spend = Green</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200">
                    <button onClick={handlePrev} className="p-2 rounded-full hover:bg-white hover:shadow-sm text-slate-500 transition-all"><ChevronLeft size={16} /></button>
                    <button onClick={handleToday} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${isCurrentMonth ? 'bg-blue-500 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}>
                        {monthName} {year}
                    </button>
                    <button onClick={handleNext} className="p-2 rounded-full hover:bg-white hover:shadow-sm text-slate-500 transition-all"><ChevronRight size={16} /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="text-center text-[10px] uppercase font-black tracking-widest text-slate-400 pb-2">{d}</div>
                ))}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${year}-${monthName}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="col-span-7 grid grid-cols-7 gap-2 sm:gap-4"
                    >
                        {totalCells.map((day, idx) => {
                            if (day === null) return <div key={`blank-${idx}`} className="h-16 rounded-2xl bg-slate-50/50" />;

                            const data = dayData[day];
                            let bgColor = "bg-slate-50 border-slate-100 hover:border-slate-300";
                            let textColor = "text-slate-600";
                            let info = null;

                            if (data.isFuture) {
                                bgColor = "bg-slate-50/50 border-transparent opacity-50";
                                textColor = "text-slate-300";
                            } else if (data.amount === 0) {
                                // No spend day
                                bgColor = "bg-emerald-50 border-emerald-100 hover:border-emerald-300";
                                textColor = "text-emerald-700";
                                info = <Check size={12} className="text-emerald-500 mx-auto mt-1" />;
                            } else {
                                // Spent money - calculate intensity
                                const intensity = highestDay > 0 ? (data.amount / highestDay) : 0;

                                if (intensity > 0.6) {
                                    bgColor = "bg-rose-100 border-rose-200 hover:border-rose-400";
                                    textColor = "text-rose-800";
                                } else if (intensity > 0.3) {
                                    bgColor = "bg-orange-50 border-orange-200 hover:border-orange-400";
                                    textColor = "text-orange-800";
                                } else {
                                    bgColor = "bg-amber-50 border-amber-100 hover:border-amber-300";
                                    textColor = "text-amber-800";
                                }
                                info = <span className={`text-[10px] font-black block mt-0.5 truncate px-1 ${textColor}`}>₹{Math.round(data.amount)}</span>;
                            }

                            return (
                                <div
                                    key={day}
                                    className={`h-14 sm:h-16 lg:h-20 rounded-xl sm:rounded-2xl border transition-all flex flex-col items-center justify-center relative cursor-default ${bgColor} ${data.isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                    title={data.amount > 0 ? `₹${data.amount} spent across ${data.count} transactions` : 'No spending'}
                                >
                                    <span className={`text-xs sm:text-sm font-black ${textColor}`}>{day}</span>
                                    {info}
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-200" /> ₹0</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-md bg-amber-50 border border-amber-200" /> Low</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-md bg-rose-100 border border-rose-200" /> High</span>
                </div>
                <div>Total: <span className="text-slate-800">₹{totalSpent.toLocaleString('en-IN')}</span></div>
            </div>
        </div>
    );
};
