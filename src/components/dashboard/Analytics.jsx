
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Target, Flame, Shield,
    ArrowUpRight, ArrowDownLeft, BarChart3, Zap
} from 'lucide-react';
import { TrendBarChart } from './TrendBarChart';

/* ── SVG Donut Chart ────────────────────────────────────────────── */
const PALETTE = [
    '#f97316', '#6366f1', '#10b981', '#ec4899', '#f59e0b',
    '#3b82f6', '#14b8a6', '#8b5cf6', '#ef4444', '#22c55e'
];

const DonutChart = ({ segments, size = 140, thickness = 22, label, sub }) => {
    const R = (size - thickness) / 2;
    const C = size / 2;
    const cir = 2 * Math.PI * R;

    const total = segments.reduce((s, g) => s + g.value, 0);
    let offset = 0;

    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle cx={C} cy={C} r={R} fill="none"
                    stroke="#f1f5f9" strokeWidth={thickness} />
                {/* Segments */}
                {segments.map((seg, i) => {
                    const pct = total > 0 ? seg.value / total : 0;
                    const dash = pct * cir;
                    const gap = cir - dash;
                    const el = (
                        <circle key={i} cx={C} cy={C} r={R}
                            fill="none"
                            stroke={PALETTE[i % PALETTE.length]}
                            strokeWidth={thickness}
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="butt" />
                    );
                    offset += dash;
                    return el;
                })}
            </svg>
            {/* Centre label */}
            <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{label}</span>
                {sub && <span style={{ fontSize: 9, color: '#94a3b8', marginTop: 2, fontWeight: 600 }}>{sub}</span>}
            </div>
        </div>
    );
};

/* ── Mini Donut (inline) ────────────────────────────────────────── */
const MiniDonut = ({ segments, size = 56, thickness = 10 }) => {
    const R = (size - thickness) / 2;
    const C = size / 2;
    const cir = 2 * Math.PI * R;
    const total = segments.reduce((s, g) => s + g.value, 0);
    let off = 0;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
            <circle cx={C} cy={C} r={R} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
            {segments.map((seg, i) => {
                const dash = total > 0 ? (seg.value / total) * cir : 0;
                const el = (
                    <circle key={i} cx={C} cy={C} r={R}
                        fill="none" stroke={PALETTE[i % PALETTE.length]}
                        strokeWidth={thickness}
                        strokeDasharray={`${dash} ${cir - dash}`}
                        strokeDashoffset={-off} />
                );
                off += dash;
                return el;
            })}
        </svg>
    );
};

/* ── Framer variants ───────────────────────────────────────────── */
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fade = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

const fmt = (v) => {
    const n = Math.abs(v || 0);
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

/* ================================================================== */
export const AnalyticsDashboard = ({ transactions }) => {
    const a = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');

        const totalIncome = income.reduce((s, t) => s + parseFloat(t.amount), 0);
        const totalExpense = expenses.reduce((s, t) => s + parseFloat(t.amount), 0);
        const savings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

        const expByCat = {};
        expenses.forEach(t => { expByCat[t.category] = (expByCat[t.category] || 0) + parseFloat(t.amount); });
        const sortedExp = Object.entries(expByCat).sort((a, b) => b[1] - a[1]);

        const incByCat = {};
        income.forEach(t => { incByCat[t.category] = (incByCat[t.category] || 0) + parseFloat(t.amount); });
        const sortedInc = Object.entries(incByCat).sort((a, b) => b[1] - a[1]);

        let healthScore = 50;
        if (savingsRate > 30) healthScore += 25;
        else if (savingsRate > 15) healthScore += 15;
        else if (savingsRate > 0) healthScore += 5;
        else healthScore -= 15;
        if (totalIncome > totalExpense) healthScore += 15;
        if (expenses.length > 0 && totalExpense / expenses.length < totalIncome * 0.1) healthScore += 10;
        healthScore = Math.min(100, Math.max(0, healthScore));

        const healthColor = healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#6366f1' : healthScore >= 40 ? '#f59e0b' : '#f43f5e';
        const healthLabel = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Average' : 'Needs Attention';

        return {
            totalIncome, totalExpense, savings, savingsRate,
            sortedExp, sortedInc,
            topExpCat: sortedExp[0] || ['—', 0],
            avgExp: expenses.length > 0 ? totalExpense / expenses.length : 0,
            avgInc: income.length > 0 ? totalIncome / income.length : 0,
            healthScore, healthColor, healthLabel,
            txCount: transactions.length,
            incCount: income.length,
            expCount: expenses.length,
        };
    }, [transactions]);

    const expSegments = a.sortedExp.slice(0, 6).map(([, v]) => ({ value: v }));
    const incSegments = a.sortedInc.slice(0, 6).map(([, v]) => ({ value: v }));

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

            {/* ── ROW 1: Savings Rate + Top Expense ───────────────── */}
            <motion.div variants={fade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Savings rate card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-50 opacity-60" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Target size={20} /></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Savings Rate</p>
                        </div>
                        <div className="flex items-end gap-4 mb-4">
                            <p className={`text-5xl font-black tracking-tighter ${a.savingsRate >= 20 ? 'text-emerald-600' : a.savingsRate >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {a.savingsRate.toFixed(1)}%
                            </p>
                            <div className="mb-1.5">
                                <p className="text-xs text-slate-400">{fmt(a.savings)} saved</p>
                            </div>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(Math.max(a.savingsRate, 0), 100)}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className={`h-full rounded-full ${a.savingsRate >= 20 ? 'bg-emerald-500' : a.savingsRate >= 0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2.5">
                            {a.savingsRate >= 20 ? '🎉 Great savings habit!' : a.savingsRate >= 0 ? '⚡ Room for improvement' : '⚠️ Spending exceeds income'}
                        </p>
                    </div>
                </div>

                {/* Top Expense */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-orange-50 opacity-60" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><Flame size={20} /></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Expense</p>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight mb-1">{a.topExpCat[0]}</p>
                        <p className="text-xl font-bold text-orange-600 mb-3">{fmt(a.topExpCat[1])}</p>
                        <p className="text-xs text-slate-400">
                            {a.totalExpense > 0
                                ? `${((a.topExpCat[1] / a.totalExpense) * 100).toFixed(0)}% of total spending`
                                : 'No expenses yet'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── ROW 2: Donut Charts ──────────────────────────────── */}
            <motion.div variants={fade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expense donut */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><ArrowUpRight size={18} /></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expense Breakdown</p>
                    </div>
                    <div className="flex items-center gap-5">
                        <DonutChart
                            segments={expSegments.length ? expSegments : [{ value: 1 }]}
                            size={130} thickness={20}
                            label={fmt(a.totalExpense)}
                            sub="Total"
                        />
                        <div className="flex-1 space-y-2 min-w-0">
                            {a.sortedExp.slice(0, 6).map(([cat, val], i) => (
                                <div key={cat} className="flex items-center gap-2">
                                    <div style={{ background: PALETTE[i % PALETTE.length] }}
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-700 truncate">{cat}</span>
                                            <span className="text-xs font-bold text-slate-900 ml-2 tabular-nums">{fmt(val)}</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-100 rounded-full mt-0.5">
                                            <div className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${a.totalExpense > 0 ? (val / a.totalExpense) * 100 : 0}%`,
                                                    background: PALETTE[i % PALETTE.length]
                                                }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {a.sortedExp.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No data yet</p>}
                        </div>
                    </div>
                </div>

                {/* Income donut */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><ArrowDownLeft size={18} /></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Income Sources</p>
                    </div>
                    <div className="flex items-center gap-5">
                        <DonutChart
                            segments={incSegments.length ? incSegments : [{ value: 1 }]}
                            size={130} thickness={20}
                            label={fmt(a.totalIncome)}
                            sub="Total"
                        />
                        <div className="flex-1 space-y-2 min-w-0">
                            {a.sortedInc.slice(0, 6).map(([cat, val], i) => (
                                <div key={cat} className="flex items-center gap-2">
                                    <div style={{ background: PALETTE[i % PALETTE.length] }}
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-700 truncate">{cat}</span>
                                            <span className="text-xs font-bold text-emerald-700 ml-2 tabular-nums">{fmt(val)}</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-100 rounded-full mt-0.5">
                                            <div className="h-full rounded-full bg-emerald-500 transition-all"
                                                style={{ width: `${a.totalIncome > 0 ? (val / a.totalIncome) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {a.sortedInc.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No data yet</p>}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── ROW 3: Health Score ──────────────────────────────── */}
            <motion.div variants={fade}>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2.5 rounded-xl" style={{ background: `${a.healthColor}18` }}>
                            <Shield size={20} style={{ color: a.healthColor }} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Health Score</p>
                    </div>
                    <div className="flex items-center gap-8">
                        {/* Circular gauge */}
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                <circle cx="50" cy="50" r="42" strokeWidth="9" fill="none" stroke="#f1f5f9" />
                                <motion.circle
                                    cx="50" cy="50" r="42" strokeWidth="9" fill="none"
                                    strokeLinecap="round"
                                    style={{ stroke: a.healthColor }}
                                    initial={{ strokeDasharray: '264', strokeDashoffset: '264' }}
                                    animate={{ strokeDashoffset: 264 - (264 * a.healthScore / 100) }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-900">{a.healthScore}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">/100</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-2xl font-black mb-1" style={{ color: a.healthColor }}>{a.healthLabel}</p>
                            <p className="text-xs text-slate-400 mb-4">Based on savings rate, income vs. expense ratio</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Transactions', val: a.txCount, color: 'text-slate-800', bg: 'bg-slate-50' },
                                    { label: 'Avg Income', val: fmt(a.avgInc), color: 'text-emerald-700', bg: 'bg-emerald-50' },
                                    { label: 'Avg Expense', val: fmt(a.avgExp), color: 'text-rose-700', bg: 'bg-rose-50' },
                                    { label: 'Net Saved', val: fmt(a.savings), color: 'text-indigo-700', bg: 'bg-indigo-50' },
                                ].map(({ label, val, color, bg }) => (
                                    <div key={label} className={`${bg} p-3 rounded-2xl text-center`}>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                                        <p className={`text-base font-black ${color}`}>{val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── ROW 4: Trend Charts ──────────────────────────────── */}
            <motion.div variants={fade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <BarChart3 size={14} className="text-rose-500" /> Expense Trend (monthly)
                    </h3>
                    <TrendBarChart transactions={transactions} type="expense" />
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <BarChart3 size={14} className="text-emerald-500" /> Income Trend (monthly)
                    </h3>
                    <TrendBarChart transactions={transactions} type="income" />
                </div>
            </motion.div>

            {/* ── ROW 5: Mini Income vs Expense donut ─────────────── */}
            <motion.div variants={fade}>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 rounded-t-3xl" />
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Income vs Expense</p>
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wider mb-1">Income</p>
                                    <p className="text-xl font-black text-emerald-400">{fmt(a.totalIncome)}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div>
                                    <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wider mb-1">Expense</p>
                                    <p className="text-xl font-black text-rose-400">{fmt(a.totalExpense)}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div>
                                    <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wider mb-1">Net</p>
                                    <p className={`text-xl font-black ${a.savings >= 0 ? 'text-white' : 'text-rose-400'}`}>{fmt(a.savings)}</p>
                                </div>
                            </div>
                            {/* Balance bar */}
                            {a.totalIncome > 0 && (
                                <div className="mt-4 w-48">
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-emerald-400 rounded-l-full"
                                            style={{ width: `${Math.min((a.totalIncome / (a.totalIncome + a.totalExpense)) * 100, 100)}%` }} />
                                        <div className="h-full bg-rose-400 flex-1 rounded-r-full" />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-white/30 mt-1">
                                        <span>Income</span><span>Expense</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <MiniDonut
                            segments={[
                                { value: a.totalIncome },
                                { value: a.totalExpense },
                            ].filter(s => s.value > 0)}
                            size={80} thickness={14}
                        />
                    </div>
                </div>
            </motion.div>

        </motion.div>
    );
};
