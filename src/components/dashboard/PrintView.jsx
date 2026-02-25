import React from 'react';
import { TrendingUp, PieChart, ShieldCheck, Smile, Zap, Gift, Wallet, Plus, Camera, Coffee, Heart, Star, Sparkles } from 'lucide-react';

// --- HELPER: Adaptive Text Size ---
const getAdaptiveText = (val, baseSize = 'text-2xl', mdSize = 'text-xl', smSize = 'text-lg') => {
    const len = val?.toString().length || 0;
    if (len > 14) return 'text-md';
    if (len > 11) return smSize;
    if (len > 8) return mdSize;
    return baseSize;
};

// --- COMPONENT: Calculator Report (Premium UI) ---
const CalculatorReport = ({ data }) => {
    if (!data) return null;
    const { toolName, inputs, result } = data;

    return (
        <div className="space-y-12 font-['Inter'] antialiased text-slate-900">
            {/* Header Section */}
            <div className="flex justify-between items-end border-b-4 border-orange-500 pb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 mb-2">{toolName}</h1>
                    <div className="flex items-center gap-3">
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Analysis Report</span>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">FY 2025-26</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Generated On</p>
                    <p className="text-lg font-black text-slate-800">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {/* Hero Summary Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                <div className="relative z-10">
                    <h3 className="text-sm font-black text-white/50 uppercase tracking-[0.4em] mb-10 border-b border-white/10 pb-4 inline-block">Projection Summary</h3>

                    <div className="grid grid-cols-3 gap-12">
                        {/* Invested */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Invested</p>
                            <p className="text-3xl font-black tabular-nums tracking-tight">₹{Math.round(result.invested).toLocaleString()}</p>
                        </div>

                        {/* Returns */}
                        <div>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Wealth Gained</p>
                            <p className="text-3xl font-black text-emerald-400 tabular-nums tracking-tight">+₹{Math.round(result.returns).toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-emerald-500/60 mt-1">
                                {(result.invested > 0 ? (result.returns / result.invested * 100).toFixed(1) : 0)}% Return
                            </p>
                        </div>

                        {/* Total */}
                        <div className="bg-white/10 rounded-2xl p-4 -my-4 border border-white/10">
                            <p className="text-xs font-black text-orange-200 uppercase tracking-widest mb-1">Maturity Value</p>
                            <p className="text-3xl font-black text-white tabular-nums tracking-tight">₹{Math.round(result.netTotal || result.total || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Tax Info Row */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-300">
                            <ShieldCheck size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Est. Tax: ₹{Math.round(result.tax || 0).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Based on current tax regime</span>
                    </div>
                </div>
            </div>

            {/* Inputs & Charts Grid */}
            <div className="grid grid-cols-3 gap-10">
                {/* Parameters Table */}
                <div className="col-span-1 bg-slate-50 border border-slate-100 rounded-[2rem] p-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Configuration</h4>
                    <div className="space-y-4">
                        {Object.entries(inputs).map(([key, val]) => (
                            <div key={key} className="flex flex-col border-b border-slate-200 last:border-0 pb-3 last:pb-0">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</span>
                                <span className="text-lg font-black text-slate-800 tabular-nums">{val} {key.includes('rate') || key.includes('ratio') ? '%' : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Projection Table */}
                <div className="col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest pl-2 border-l-4 border-emerald-500">Year-wise Growth</h4>
                    </div>
                    {result.projections && (
                        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 px-6">Year</th>
                                        <th className="p-4 px-6">Invested</th>
                                        <th className="p-4 px-6 text-emerald-600">Profit</th>
                                        <th className="p-4 px-6 text-right">Total Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {result.projections.slice(0, 8).map((p, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 px-6 font-bold text-slate-500">Year {p.year}</td>
                                            <td className="p-4 px-6 font-bold text-slate-700 tabular-nums">₹{Math.round(p.invested).toLocaleString()}</td>
                                            <td className="p-4 px-6 font-bold text-emerald-600 tabular-nums">+₹{Math.round(p.total - p.invested).toLocaleString()}</td>
                                            <td className="p-4 px-6 font-black text-slate-900 text-right tabular-nums">₹{Math.round(p.total).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {result.projections.length > 8 && (
                                <div className="p-3 text-center text-xs font-bold text-slate-400 bg-slate-50 border-t border-slate-100">
                                    + {result.projections.length - 8} more years included in full export
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-[10px] text-slate-400 leading-relaxed italic">
                <strong>Disclaimer:</strong> This projection is for illustration purposes only. Returns are not guaranteed and will vary based on market performance. Tax estimations are based on FY 2025-26 rules and may change. Please consult a financial advisor before investing.
            </div>
        </div>
    );
};

// --- COMPONENT: Analytics Charts ---
const PrintAnalytics = ({ stats, transactions }) => {
    const maxVal = Math.max(stats.income, stats.expense, 100);

    // Calculate category splits
    const processSplit = (type) => {
        const filterTxs = transactions.filter(tx => tx.type === type);
        const grouped = {};
        filterTxs.forEach(tx => { grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount; });
        const total = Object.values(grouped).reduce((a, b) => a + b, 0);
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value, percentage: (value / (total || 1)) * 100 }))
            .sort((a, b) => b.value - a.value).slice(0, 5);
    };

    const expenseSplit = processSplit('expense');
    const incomeSplit = processSplit('income');

    return (
        <div className="grid grid-cols-2 gap-12 mt-12 mb-12">
            {/* Income Card */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8 break-inside-avoid">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-emerald-500" size={20} />
                    <h4 className="text-sm font-black text-emerald-900 uppercase tracking-wide">Inflow Analysis</h4>
                </div>
                <div className="space-y-4">
                    {incomeSplit.map((cat, i) => (
                        <div key={i} className="flex justify-between items-center relative">
                            <div className="flex items-center gap-3 z-10">
                                <span className="text-xs font-bold text-emerald-800 uppercase w-24 truncate">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-3 z-10">
                                <span className="text-xs font-bold text-emerald-600">{cat.percentage.toFixed(0)}%</span>
                                <span className="text-xs font-black text-slate-900 tabular-nums">₹{cat.value.toLocaleString()}</span>
                            </div>
                            {/* Bar background */}
                            <div className="absolute left-0 bottom-0 top-0 bg-emerald-200/20 rounded-lg -z-0" style={{ width: `${cat.percentage}%` }}></div>
                        </div>
                    ))}
                    {incomeSplit.length === 0 && <p className="text-xs text-emerald-400 italic">No income data available.</p>}
                </div>
            </div>

            {/* Expense Card */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-[2rem] p-8 break-inside-avoid">
                <div className="flex items-center gap-3 mb-6">
                    <PieChart className="text-rose-500" size={20} />
                    <h4 className="text-sm font-black text-rose-900 uppercase tracking-wide">Outflow Analysis</h4>
                </div>
                <div className="space-y-4">
                    {expenseSplit.map((cat, i) => (
                        <div key={i} className="flex justify-between items-center relative">
                            <div className="flex items-center gap-3 z-10">
                                <span className="text-xs font-bold text-rose-800 uppercase w-24 truncate">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-3 z-10">
                                <span className="text-xs font-bold text-rose-600">{cat.percentage.toFixed(0)}%</span>
                                <span className="text-xs font-black text-slate-900 tabular-nums">₹{cat.value.toLocaleString()}</span>
                            </div>
                            <div className="absolute left-0 bottom-0 top-0 bg-rose-200/20 rounded-lg -z-0" style={{ width: `${cat.percentage}%` }}></div>
                        </div>
                    ))}
                    {expenseSplit.length === 0 && <p className="text-xs text-rose-400 italic">No expense data available.</p>}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: Main Print View ---
export const PrintView = ({ user, stats, transactions, filterLabel, calculatorData, isPrinting, variant = 'classic' }) => {

    // --- VARIANT: CREATIVE (Legacy Fun Theme) ---
    if (variant === 'creative') {
        return (
            <div id="print-root" className={`${isPrinting ? 'print-active' : 'print-only'} p-12 bg-[#fffcf4] text-slate-900 font-['Fredoka'] antialiased leading-relaxed min-h-screen`}>
                <div className="border-4 border-dashed border-orange-200 rounded-[3rem] p-8 min-h-[90vh]">
                    {/* Fun Header */}
                    <div className="flex justify-between items-center mb-16">
                        <div className="bg-orange-400 text-white px-8 py-4 rounded-[2rem] shadow-xl rotate-2">
                            <h1 className="text-4xl font-black uppercase tracking-tight">Orange Fun! 🍊</h1>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-orange-900 text-2xl">{user?.user_metadata?.full_name}'s Report</p>
                            <p className="font-bold text-orange-400">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {calculatorData ? (
                        // Creative Calculator Not Implemented for Brevity - Fallback to Standard
                        <CalculatorReport data={calculatorData} />
                    ) : (
                        <>
                            {/* Fun Stats */}
                            <div className="grid grid-cols-3 gap-8 mb-16">
                                <div className="bg-indigo-500 text-white p-8 rounded-[2rem] shadow-lg transform hover:scale-105 transition-transform text-center">
                                    <Smile size={40} className="mx-auto mb-4" />
                                    <p className="font-bold opacity-80 uppercase tracking-widest text-xs mb-2">My Balance</p>
                                    <h2 className="text-4xl font-black tabular-nums">₹{stats.balance.toLocaleString()}</h2>
                                </div>
                                <div className="bg-emerald-400 text-emerald-900 p-8 rounded-[2rem] shadow-lg transform hover:scale-105 transition-transform text-center">
                                    <TrendingUp size={40} className="mx-auto mb-4" />
                                    <p className="font-bold opacity-80 uppercase tracking-widest text-xs mb-2">Money In</p>
                                    <h2 className="text-4xl font-black tabular-nums">+₹{stats.income.toLocaleString()}</h2>
                                </div>
                                <div className="bg-rose-400 text-white p-8 rounded-[2rem] shadow-lg transform hover:scale-105 transition-transform text-center">
                                    <PieChart size={40} className="mx-auto mb-4" />
                                    <p className="font-bold opacity-80 uppercase tracking-widest text-xs mb-2">Money Out</p>
                                    <h2 className="text-4xl font-black tabular-nums">-₹{stats.expense.toLocaleString()}</h2>
                                </div>
                            </div>
                            <PrintAnalytics stats={stats} transactions={transactions} />
                        </>
                    )}
                </div>
            </div>
        );
    }

    // --- VARIANT: CORPORATE (New Professional Theme) ---
    if (variant === 'corporate') {
        return (
            <div id="print-root" className={`${isPrinting ? 'print-active' : 'print-only'} bg-white text-slate-800 font-['Inter'] antialiased min-h-screen`}>
                {/* Corporate Header */}
                <div className="bg-slate-900 text-white p-16 pb-24 clip-path-slant relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight uppercase mb-2">Orange Finance</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Corporate Ledger Report</p>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/10 px-6 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                                <p className="text-xl font-bold">{user?.user_metadata?.full_name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-16 -mt-16">
                    {calculatorData ? (
                        <div className="bg-white rounded-[2rem] shadow-xl p-10 border border-slate-100">
                            <CalculatorReport data={calculatorData} />
                        </div>
                    ) : (
                        <>
                            {/* Corporate Stats Cards */}
                            <div className="grid grid-cols-3 gap-8 mb-12">
                                <div className="bg-white p-8 rounded-[1.5rem] shadow-xl border-l-8 border-slate-900">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Net Balance</p>
                                    <h2 className={`${getAdaptiveText(stats.balance)} font-black text-slate-900 tabular-nums`}>₹{stats.balance.toLocaleString()}</h2>
                                </div>
                                <div className="bg-white p-8 rounded-[1.5rem] shadow-lg border-l-8 border-emerald-600">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Credit</p>
                                    <h2 className={`${getAdaptiveText(stats.income)} font-black text-emerald-700 tabular-nums`}>₹{stats.income.toLocaleString()}</h2>
                                </div>
                                <div className="bg-white p-8 rounded-[1.5rem] shadow-lg border-l-8 border-rose-600">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Debit</p>
                                    <h2 className={`${getAdaptiveText(stats.expense)} font-black text-rose-700 tabular-nums`}>₹{stats.expense.toLocaleString()}</h2>
                                </div>
                            </div>

                            <PrintAnalytics stats={stats} transactions={transactions} />

                            {/* Corporate Table */}
                            <div className="mt-12">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 py-3 border-b-2 border-slate-900 inline-block">Transaction Record</h3>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest">
                                        <tr>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Description</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {transactions.map((t, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-bold text-slate-500 tabular-nums">{new Date(t.date).toLocaleDateString()}</td>
                                                <td className="p-4 font-bold text-slate-800">{t.title}</td>
                                                <td className="p-4 text-xs font-bold text-slate-500 uppercase">{t.category}</td>
                                                <td className={`p-4 font-black text-right tabular-nums ${t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // --- VARIANT: EXECUTIVE (New Minimal Serif Theme) ---
    if (variant === 'executive') {
        return (
            <div id="print-root" className={`${isPrinting ? 'print-active' : 'print-only'} p-20 bg-white text-black font-serif antialiased min-h-screen`}>
                <div className="border-b-4 border-black pb-8 mb-16 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-bold tracking-tighter mb-2">Statement.</h1>
                        <p className="text-xs font-sans font-bold tracking-[0.3em] uppercase text-gray-500">Orange Finance Executive Report</p>
                    </div>
                    <div className="text-right font-sans">
                        <p className="text-sm font-bold">{user?.user_metadata?.full_name}</p>
                        <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {calculatorData ? (
                    <CalculatorReport data={calculatorData} />
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-20 mb-20">
                            <div>
                                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Net Position</p>
                                <h2 className="text-6xl font-bold tabular-nums">₹{stats.balance.toLocaleString()}</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                                    <span className="font-sans text-xs font-bold uppercase tracking-widest text-gray-500">Inflow</span>
                                    <span className="text-2xl font-bold text-emerald-800 tabular-nums">₹{stats.income.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                                    <span className="font-sans text-xs font-bold uppercase tracking-widest text-gray-500">Outflow</span>
                                    <span className="text-2xl font-bold text-rose-800 tabular-nums">₹{stats.expense.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-16">
                            <PrintAnalytics stats={stats} transactions={transactions} />
                        </div>

                        <div>
                            <h3 className="font-bold text-2xl mb-8 italic">Transaction Log</h3>
                            <div className="border-t-2 border-black">
                                {transactions.map((t, i) => (
                                    <div key={i} className="py-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors px-2">
                                        <div className="w-24 font-sans text-xs font-bold text-gray-400 tabular-nums">{new Date(t.date).toLocaleDateString()}</div>
                                        <div className="flex-1 px-8">
                                            <p className="font-bold text-lg">{t.title}</p>
                                            <p className="font-sans text-[10px] text-gray-400 uppercase tracking-widest mt-1">{t.category}</p>
                                        </div>
                                        <div className={`font-bold text-xl tabular-nums ${t.type === 'income' ? 'text-emerald-900' : 'text-rose-900'}`}>
                                            {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // --- VARIANT: CLASSIC (Default) ---
    return (
        <div id="print-root" className={`${isPrinting ? 'print-active' : 'print-only'} p-12 bg-white text-slate-900 font-['Inter'] antialiased min-h-screen`}>
            {/* Minimal Clean Header */}
            <div className="flex justify-between items-center mb-12 border-b border-slate-200 pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">Orange Finance</h1>
                        <p className="text-xs font-medium text-slate-500">Personal Ledger</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{user?.user_metadata?.full_name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
            </div>

            {calculatorData ? (
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <CalculatorReport data={calculatorData} />
                </div>
            ) : (
                <>
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-12 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Balance</p>
                            <h2 className="text-4xl font-black text-slate-900 tabular-nums">₹{stats.balance.toLocaleString()}</h2>
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="flex items-center gap-4 justify-end">
                                <span className="text-xs font-bold text-slate-400 uppercase">Income</span>
                                <span className="text-lg font-black text-emerald-600 tabular-nums">+₹{stats.income.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-4 justify-end">
                                <span className="text-xs font-bold text-slate-400 uppercase">Expense</span>
                                <span className="text-lg font-black text-rose-600 tabular-nums">-₹{stats.expense.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <PrintAnalytics stats={stats} transactions={transactions} />

                    <div className="mt-12">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Transactions</h3>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Description</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.map((t, i) => (
                                        <tr key={i}>
                                            <td className="p-4 text-slate-500 tabular-nums">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold text-slate-800">{t.title}</td>
                                            <td className="p-4 text-slate-500 text-xs uppercase font-bold">{t.category}</td>
                                            <td className={`p-4 font-black text-right tabular-nums ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
                Generated by Orange Finance • Secure & Private
            </div>
        </div>
    );
};
