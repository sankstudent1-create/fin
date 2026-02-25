
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, Target, Flame, Shield, Wallet, ArrowUpRight, ArrowDownLeft, Award, BarChart3 } from 'lucide-react';
import { TrendBarChart } from './TrendBarChart';

export const AnalyticsDashboard = ({ transactions }) => {
    const analytics = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');

        const totalIncome = income.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const totalExpense = expenses.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

        // Category breakdown
        const expenseByCategory = {};
        expenses.forEach(t => {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + parseFloat(t.amount);
        });
        const sortedCategories = Object.entries(expenseByCategory)
            .sort((a, b) => b[1] - a[1]);
        const topCategory = sortedCategories[0] || ['None', 0];

        // Income breakdown
        const incomeByCategory = {};
        income.forEach(t => {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + parseFloat(t.amount);
        });
        const sortedIncome = Object.entries(incomeByCategory)
            .sort((a, b) => b[1] - a[1]);

        // Monthly spending trend
        const monthlySpending = {};
        expenses.forEach(t => {
            const month = new Date(t.date).toLocaleString('en-US', { month: 'short' });
            monthlySpending[month] = (monthlySpending[month] || 0) + parseFloat(t.amount);
        });

        // Average transaction
        const avgExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
        const avgIncome = income.length > 0 ? totalIncome / income.length : 0;

        // Financial health score (0-100)
        let healthScore = 50;
        if (savingsRate > 30) healthScore += 25;
        else if (savingsRate > 15) healthScore += 15;
        else if (savingsRate > 0) healthScore += 5;
        else healthScore -= 15;
        if (totalIncome > totalExpense) healthScore += 15;
        if (expenses.length > 0 && totalExpense / expenses.length < totalIncome * 0.1) healthScore += 10;
        healthScore = Math.min(100, Math.max(0, healthScore));

        const healthLabel = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Average' : 'Needs Attention';
        const healthColor = healthScore >= 80 ? 'emerald' : healthScore >= 60 ? 'blue' : healthScore >= 40 ? 'amber' : 'rose';

        return {
            totalIncome, totalExpense, savingsRate,
            topCategory, sortedCategories, sortedIncome,
            avgExpense, avgIncome,
            healthScore, healthLabel, healthColor,
            txCount: transactions.length,
            incomeCount: income.length,
            expenseCount: expenses.length,
        };
    }, [transactions]);

    const categoryColors = [
        'bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
        'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500'
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };
    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Hero Stats Row */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Savings Rate */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-50 rounded-full opacity-50" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Target size={24} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Savings Rate</p>
                        </div>
                        <h2 className={`text-6xl font-black tracking-tighter mb-4 ${analytics.savingsRate >= 20 ? 'text-emerald-600' : analytics.savingsRate >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {analytics.savingsRate.toFixed(1)}%
                        </h2>
                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(Math.max(analytics.savingsRate, 0), 100)}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${analytics.savingsRate >= 20 ? 'bg-emerald-500' : analytics.savingsRate >= 0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-3">
                            {analytics.savingsRate >= 20 ? '🎉 Great savings habit!' :
                                analytics.savingsRate >= 0 ? '⚡ Room for improvement' :
                                    '⚠️ Spending exceeds income'}
                        </p>
                    </div>
                </div>

                {/* Top Expense Category */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-50 rounded-full opacity-50" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                                <Flame size={24} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Expense</p>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{analytics.topCategory[0]}</h2>
                        <p className="text-2xl font-bold text-orange-600">₹{analytics.topCategory[1].toLocaleString()}</p>
                        <p className="text-xs text-slate-400 mt-3">
                            {analytics.totalExpense > 0 ? `${((analytics.topCategory[1] / analytics.totalExpense) * 100).toFixed(0)}% of total spending` : 'No expenses yet'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Financial Health Score */}
            <motion.div variants={item} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className={`p-3 bg-${analytics.healthColor}-50 text-${analytics.healthColor}-600 rounded-2xl`}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Financial Health Score</h3>
                    </div>
                </div>
                <div className="flex items-center gap-12">
                    <div className="relative w-32 h-32">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="42" strokeWidth="8" fill="none" className="stroke-slate-100" />
                            <motion.circle
                                cx="50" cy="50" r="42"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                className={`stroke-${analytics.healthColor}-500`}
                                style={{ stroke: analytics.healthColor === 'emerald' ? '#10b981' : analytics.healthColor === 'blue' ? '#3b82f6' : analytics.healthColor === 'amber' ? '#f59e0b' : '#f43f5e' }}
                                initial={{ strokeDasharray: '264', strokeDashoffset: '264' }}
                                animate={{ strokeDashoffset: 264 - (264 * analytics.healthScore / 100) }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-900">{analytics.healthScore}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">/100</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className={`text-2xl font-black mb-2`} style={{ color: analytics.healthColor === 'emerald' ? '#10b981' : analytics.healthColor === 'blue' ? '#3b82f6' : analytics.healthColor === 'amber' ? '#f59e0b' : '#f43f5e' }}>
                            {analytics.healthLabel}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                            <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transactions</p>
                                <p className="text-xl font-black text-slate-900">{analytics.txCount}</p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-2xl text-center">
                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Avg Income</p>
                                <p className="text-xl font-black text-emerald-700">₹{Math.round(analytics.avgIncome).toLocaleString()}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-2xl text-center">
                                <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider mb-1">Avg Expense</p>
                                <p className="text-xl font-black text-orange-700">₹{Math.round(analytics.avgExpense).toLocaleString()}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl text-center">
                                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider mb-1">Net Saved</p>
                                <p className="text-xl font-black text-blue-700">₹{Math.round(analytics.totalIncome - analytics.totalExpense).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Breakdown */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><ArrowUpRight size={20} /></div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expense Breakdown</h3>
                    </div>
                    <div className="space-y-4">
                        {analytics.sortedCategories.slice(0, 6).map(([cat, amount], i) => {
                            const pct = analytics.totalExpense > 0 ? (amount / analytics.totalExpense) * 100 : 0;
                            return (
                                <div key={cat} className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${categoryColors[i % categoryColors.length]}`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-slate-700">{cat}</span>
                                            <span className="text-sm font-black text-slate-900">₹{amount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                                className={`h-full rounded-full ${categoryColors[i % categoryColors.length]}`}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 w-10 text-right">{pct.toFixed(0)}%</span>
                                </div>
                            );
                        })}
                        {analytics.sortedCategories.length === 0 && (
                            <p className="text-center text-sm text-slate-400 py-8">No expense data yet</p>
                        )}
                    </div>
                </div>

                {/* Income Breakdown */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ArrowDownLeft size={20} /></div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Income Sources</h3>
                    </div>
                    <div className="space-y-4">
                        {analytics.sortedIncome.slice(0, 6).map(([cat, amount], i) => {
                            const pct = analytics.totalIncome > 0 ? (amount / analytics.totalIncome) * 100 : 0;
                            return (
                                <div key={cat} className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${categoryColors[i % categoryColors.length]}`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-slate-700">{cat}</span>
                                            <span className="text-sm font-black text-emerald-700">₹{amount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                                className="h-full rounded-full bg-emerald-500"
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 w-10 text-right">{pct.toFixed(0)}%</span>
                                </div>
                            );
                        })}
                        {analytics.sortedIncome.length === 0 && (
                            <p className="text-center text-sm text-slate-400 py-8">No income data yet</p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Trend Charts Side by Side */}
            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart3 size={16} className="text-rose-500" /> Expense Trend
                    </h3>
                    <TrendBarChart transactions={transactions} type="expense" />
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart3 size={16} className="text-emerald-500" /> Income Trend
                    </h3>
                    <TrendBarChart transactions={transactions} type="income" />
                </div>
            </motion.div>
        </motion.div>
    );
};
