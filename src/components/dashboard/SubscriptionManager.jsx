import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, TrendingUp, CheckCircle2, RotateCw } from 'lucide-react';
import { ICON_MAP } from '../../config/constants';

export const SubscriptionManager = ({ transactions }) => {
    // Detect recurring transactions (same title, same amount, roughly 30 days apart)
    const subscriptions = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Group by title and amount (fuzzy match)
        const groups = {};

        // Only look at expenses
        const expenses = transactions.filter(t => t.type === 'expense');

        expenses.forEach(t => {
            // Create a key: normalize title and round amount
            const titleWord = t.title.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
            if (titleWord.length < 3) return; // ignore very short words
            const amount = Math.round(t.amount);
            const key = `${titleWord}_${amount}`;

            if (!groups[key]) {
                groups[key] = {
                    title: t.title,
                    amount: t.amount,
                    category: t.category,
                    dates: [],
                };
            }
            groups[key].dates.push(new Date(t.date));
        });

        const activeSubs = [];

        Object.values(groups).forEach(group => {
            if (group.dates.length >= 2) {
                // Sort dates newest first
                group.dates.sort((a, b) => b - a);

                // Check if the most recent gap is roughly 30 days (25-35 days) or 1 year (350-380 days)
                let isRecurring = false;
                let cycle = '';

                for (let i = 0; i < group.dates.length - 1; i++) {
                    const diffTime = Math.abs(group.dates[i] - group.dates[i + 1]);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays >= 25 && diffDays <= 35) {
                        isRecurring = true;
                        cycle = 'Monthly';
                        break;
                    } else if (diffDays >= 350 && diffDays <= 380) {
                        isRecurring = true;
                        cycle = 'Yearly';
                        break;
                    }
                }

                if (isRecurring) {
                    const lastPaid = group.dates[0];
                    const nextDue = new Date(lastPaid);
                    if (cycle === 'Monthly') nextDue.setMonth(nextDue.getMonth() + 1);
                    else nextDue.setFullYear(nextDue.getFullYear() + 1);

                    const daysUntilDue = Math.ceil((nextDue - new Date()) / (1000 * 60 * 60 * 24));

                    activeSubs.push({
                        ...group,
                        cycle,
                        lastPaid,
                        nextDue,
                        daysUntilDue,
                        isActive: daysUntilDue <= 30 && daysUntilDue >= -5 // If overdue more than 5 days, maybe cancelled
                    });
                }
            }
        });

        // Hardcode detection based on common subscription keywords even if only 1 payment found
        const knownSubs = ['netflix', 'spotify', 'amazon prime', 'hotstar', 'youtube premium', 'gym', 'wifi', 'broadband', 'jio', 'airtel'];
        expenses.forEach(t => {
            const isKnown = knownSubs.some(sub => t.title.toLowerCase().includes(sub));
            if (isKnown) {
                // check if already added
                const alreadyAdded = activeSubs.some(s => s.title.toLowerCase().includes(t.title.toLowerCase().split(' ')[0]));
                if (!alreadyAdded) {
                    const lastPaid = new Date(t.date);
                    const nextDue = new Date(lastPaid);
                    nextDue.setMonth(nextDue.getMonth() + 1);
                    const daysUntilDue = Math.ceil((nextDue - new Date()) / (1000 * 60 * 60 * 24));

                    if (daysUntilDue <= 30 && daysUntilDue >= -15) {
                        activeSubs.push({
                            title: t.title,
                            amount: t.amount,
                            category: t.category,
                            cycle: 'Monthly (Auto-detected)',
                            lastPaid,
                            nextDue,
                            daysUntilDue,
                            isActive: true
                        });
                    }
                }
            }
        });

        return activeSubs.sort((a, b) => a.daysUntilDue - b.daysUntilDue).filter(s => s.isActive);
    }, [transactions]);

    const totalMonthly = subscriptions.reduce((sum, sub) => sum + (sub.cycle.includes('Monthly') ? sub.amount : sub.amount / 12), 0);

    return (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <RotateCw className="text-rose-500" size={24} />
                            Subscriptions
                        </h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">AI-detected recurring payments</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Monthly</p>
                        <p className="text-2xl font-black text-rose-500">₹{totalMonthly.toFixed(2)}</p>
                    </div>
                </div>

                {subscriptions.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Calendar className="text-slate-300 mx-auto mb-3" size={40} />
                        <h3 className="text-lg font-bold text-slate-600">No Subscriptions Detected</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">We analyze your history to find recurring bills. None found yet!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {subscriptions.map((sub, idx) => {
                            const Icon = ICON_MAP[sub.category] || ICON_MAP['Other'];
                            let statusClass = "bg-emerald-100 text-emerald-600";
                            let statusIcon = <CheckCircle2 size={16} />;
                            let statusText = `Due in ${sub.daysUntilDue} days`;

                            if (sub.daysUntilDue < 0) {
                                statusClass = "bg-rose-100 text-rose-600";
                                statusIcon = <AlertCircle size={16} />;
                                statusText = `Overdue by ${Math.abs(sub.daysUntilDue)} days`;
                            } else if (sub.daysUntilDue <= 5) {
                                statusClass = "bg-amber-100 text-amber-600";
                                statusIcon = <AlertCircle size={16} />;
                                statusText = `Due very soon (${sub.daysUntilDue}d)`;
                            }

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                                            <Icon className="text-slate-600" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{sub.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200">{sub.cycle}</span>
                                                <span className={`text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-md ${statusClass}`}>
                                                    {statusIcon} {statusText}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-800 text-xl">₹{sub.amount}</p>
                                        <p className="text-xs text-slate-400 font-medium">Last: {sub.lastPaid.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
