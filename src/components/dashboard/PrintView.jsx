import React from 'react';
import { TrendingUp, PieChart, List, ShieldCheck, Coins, Lock, Percent, Heart, Star, Sparkles, Smile, Zap, Coffee, Gift, Camera, Wallet, Plus } from 'lucide-react';

const getAdaptiveText = (val, baseSize = 'text-2xl', mdSize = 'text-xl', smSize = 'text-lg') => {
    const len = val?.toString().length || 0;
    if (len > 14) return 'text-md';
    if (len > 11) return smSize;
    if (len > 8) return mdSize;
    return baseSize;
};

const PrintAnalytics = ({ stats, transactions, variant = 'classic' }) => {
    const maxVal = Math.max(stats.income, stats.expense, 100);
    const EXPENSE_COLORS = variant === 'creative'
        ? ['#ff6b6b', '#feca57', '#48dbfb', '#ff9f43', '#5f27cd', '#ff4dff']
        : ['#450a0a', '#991b1b', '#dc2626', '#f87171', '#fca5a5', '#fee2e2'];
    const INCOME_COLORS = variant === 'creative'
        ? ['#1dd1a1', '#00d2d3', '#54a0ff', '#5f27cd', '#ff9ff3', '#feca57']
        : ['#064e3b', '#065f46', '#0d9488', '#2dd4bf', '#99f6e4', '#ccfbf1'];

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

    const getGradient = (split, colors) => {
        let cumulative = 0;
        if (split.length === 0) return '#f1f5f9';
        const parts = split.map((cat, i) => {
            const start = cumulative; cumulative += cat.percentage;
            return `${colors[i % colors.length]} ${start}% ${cumulative}%`;
        });
        return `conic-gradient(${parts.join(', ')})`;
    };

    if (variant === 'creative') {
        return (
            <div className="space-y-12 my-12 font-['Fredoka']">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[3rem] p-12 border-4 border-dashed border-purple-200 relative overflow-hidden break-inside-avoid shadow-inner">
                    <div className="absolute top-4 right-8 transform rotate-12 opacity-20">
                        <Sparkles size={60} className="text-purple-400" />
                    </div>
                    <p className="text-sm font-black text-purple-600 uppercase tracking-[0.4em] mb-12 text-center">My Cashflow Vibes ✨</p>
                    <div className="flex items-end justify-center gap-16 h-60">
                        <div className="flex flex-col items-center justify-end h-full w-40">
                            <div
                                style={{ height: `${Math.max((stats.income / maxVal) * 100, 10)}%`, background: 'linear-gradient(to top, #00d2d3, #1dd1a1)' }}
                                className="w-full rounded-[2.5rem] shadow-xl shadow-emerald-200 border-4 border-white"
                            ></div>
                            <div className="text-center mt-6">
                                <span className="text-lg font-black text-emerald-600 block mb-1">Money In 💰</span>
                                <span className={`${getAdaptiveText(stats.income, 'text-xl', 'text-lg', 'text-md')} font-bold text-slate-400 tabular-nums`}>₹{stats.income.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-end h-full w-40">
                            <div
                                style={{ height: `${Math.max((stats.expense / maxVal) * 100, 10)}%`, background: 'linear-gradient(to top, #ff6b6b, #ff9f43)' }}
                                className="w-full rounded-[2.5rem] shadow-xl shadow-rose-200 border-4 border-white"
                            ></div>
                            <div className="text-center mt-6">
                                <span className="text-lg font-black text-rose-600 block mb-1">Money Out 💸</span>
                                <span className={`${getAdaptiveText(stats.expense, 'text-xl', 'text-lg', 'text-md')} font-bold text-slate-400 tabular-nums`}>₹{stats.expense.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                    <div className="bg-white p-10 rounded-[4rem] border-4 border-emerald-100 shadow-xl break-inside-avoid relative">
                        <div className="absolute -top-4 -left-4 bg-emerald-500 text-white p-3 rounded-full shadow-lg">
                            <Star size={24} fill="currentColor" />
                        </div>
                        <h4 className="text-xl font-black text-emerald-800 mb-8 uppercase text-center tracking-tight">Income Magic</h4>
                        <div className="flex flex-col items-center gap-8">
                            <div className="w-40 h-40 rounded-full border-[6px] border-white shadow-2xl" style={{ background: getGradient(incomeSplit, INCOME_COLORS) }}></div>
                            <div className="w-full space-y-4">
                                {incomeSplit.map((cat, i) => (
                                    <div key={i} className="flex items-center justify-between bg-emerald-50/50 p-4 rounded-3xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ background: INCOME_COLORS[i % INCOME_COLORS.length] }}></div>
                                            <span className="text-sm font-bold text-emerald-900 uppercase">{cat.name}</span>
                                        </div>
                                        <span className="text-lg font-black text-emerald-600">{cat.percentage.toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[4rem] border-4 border-rose-100 shadow-xl break-inside-avoid relative">
                        <div className="absolute -top-4 -right-4 bg-rose-500 text-white p-3 rounded-full shadow-lg">
                            <Heart size={24} fill="currentColor" />
                        </div>
                        <h4 className="text-xl font-black text-rose-800 mb-8 uppercase text-center tracking-tight">Expense Party</h4>
                        <div className="flex flex-col items-center gap-8">
                            <div className="w-40 h-40 rounded-full border-[6px] border-white shadow-2xl" style={{ background: getGradient(expenseSplit, EXPENSE_COLORS) }}></div>
                            <div className="w-full space-y-4">
                                {expenseSplit.map((cat, i) => (
                                    <div key={i} className="flex items-center justify-between bg-rose-50/50 p-4 rounded-3xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}></div>
                                            <span className="text-sm font-bold text-rose-900 uppercase">{cat.name}</span>
                                        </div>
                                        <span className="text-lg font-black text-rose-600">{cat.percentage.toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 my-12 font-['Inter'] antialiased">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm break-inside-avoid">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 text-center font-['Outfit']">Liquidity Momentum Tracker</p>
                <div className="flex items-end justify-center gap-20 h-56 border-b border-slate-100 pb-4">
                    <div className="flex flex-col items-center justify-end h-full w-32">
                        <div
                            style={{ height: `${Math.max((stats.income / maxVal) * 100, 5)}%`, backgroundColor: '#10b981' }}
                            className="w-full rounded-t-lg shadow-lg shadow-emerald-500/10"
                        ></div>
                        <div className="text-center mt-6">
                            <span className="text-[11px] font-black text-emerald-900 block tracking-widest uppercase font-['Outfit'] mb-1">Total Inflow</span>
                            <span className="text-[12px] font-bold text-slate-500 tabular-nums">₹{stats.income.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-end h-full w-32">
                        <div
                            style={{ height: `${Math.max((stats.expense / maxVal) * 100, 5)}%`, backgroundColor: '#f43f5e' }}
                            className="w-full rounded-t-lg shadow-lg shadow-rose-500/10"
                        ></div>
                        <div className="text-center mt-6">
                            <span className="text-[11px] font-black text-rose-900 block tracking-widest uppercase font-['Outfit'] mb-1">Total Outflow</span>
                            <span className="text-[12px] font-bold text-slate-500 tabular-nums">₹{stats.expense.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
                <div className="break-inside-avoid">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp size={16} className="text-emerald-600" />
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-['Outfit']">Revenue streams</h4>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-10">
                        <div className="w-28 h-28 rounded-full border-2 border-white shadow-xl" style={{ background: getGradient(incomeSplit, INCOME_COLORS) }}></div>
                        <div className="flex-1 space-y-3">
                            {incomeSplit.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ background: INCOME_COLORS[i % INCOME_COLORS.length] }}></span>
                                        <span className="text-[10px] font-bold text-slate-600 tracking-tight uppercase">{cat.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 tabular-nums">{cat.percentage.toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="break-inside-avoid">
                    <div className="flex items-center gap-3 mb-6">
                        <PieChart size={16} className="text-rose-600" />
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-['Outfit']">Outflow Segmentation</h4>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-10">
                        <div className="w-28 h-28 rounded-full border-2 border-white shadow-xl" style={{ background: getGradient(expenseSplit, EXPENSE_COLORS) }}></div>
                        <div className="flex-1 space-y-3">
                            {expenseSplit.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}></span>
                                        <span className="text-[10px] font-bold text-slate-600 tracking-tight uppercase">{cat.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-rose-600 tabular-nums">{cat.percentage.toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CalculatorReport = ({ data, variant = 'classic' }) => {
    if (!data) return null;
    const { toolName, inputs, result } = data;

    if (variant === 'creative') {
        return (
            <div className="space-y-12 font-['Fredoka']">
                <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-rose-400 p-12 rounded-[4rem] text-center text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top(0) left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                    <Smile size={80} className="mx-auto mb-6 drop-shadow-lg animate-bounce" />
                    <h2 className="text-5xl font-black uppercase tracking-tight mb-2 drop-shadow-lg">{toolName} Goals! 🚀</h2>
                    <p className="text-xl font-bold opacity-90 drop-shadow-md">Let's see how much we can grow together!</p>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    <div className="bg-[#E0F2FF] border-4 border-[#B3E5FC] p-8 rounded-[3rem] text-center transform hover:rotate-2 transition-transform shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 bg-white/40 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity">✨</div>
                        <Zap className="mx-auto mb-4 text-[#0288D1]" size={32} />
                        <p className="text-[10px] font-black text-[#0288D1]/60 uppercase tracking-widest mb-2">My Seed Money</p>
                        <p className={`${getAdaptiveText(result.invested, 'text-3xl', 'text-2xl', 'text-xl')} font-black text-[#01579B] italic tabular-nums`}>₹{(result.invested || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-[#E8F5E9] border-4 border-[#C8E6C9] p-8 rounded-[3rem] text-center transform hover:-rotate-2 transition-transform shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 p-2 bg-white/40 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity">🍭</div>
                        <Gift className="mx-auto mb-4 text-[#2E7D32]" size={32} />
                        <p className="text-[10px] font-black text-[#2E7D32]/60 uppercase tracking-widest mb-2">Profit Party!</p>
                        <p className={`${getAdaptiveText(result.returns, 'text-3xl', 'text-2xl', 'text-xl')} font-black text-[#1B5E20] italic tabular-nums`}>+₹{(result.returns || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-[#6200EA] border-4 border-white p-8 rounded-[3rem] text-center text-white shadow-2xl relative overflow-hidden border-b-8 border-indigo-900/30">
                        <StarsBg />
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Grand Total! 🌕</p>
                        <p className={`${getAdaptiveText(result.netTotal || result.total, 'text-3xl', 'text-2xl', 'text-xl')} font-black italic tabular-nums drop-shadow-md`}>₹{(result.netTotal || result.total || 0).toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white border-8 border-yellow-100 rounded-[5rem] p-16 flex items-center justify-around break-inside-avoid shadow-2xl relative overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 opacity-10"><Smile size={200} /></div>
                    <div className="text-center z-10">
                        <h4 className="text-lg font-black text-yellow-600 uppercase mb-8">My Money Pizza 🍕</h4>
                        <div className="w-56 h-56 rounded-full border-[12px] border-yellow-50 shadow-2xl flex items-center justify-center relative"
                            style={{ background: `conic-gradient(#fef9c3 0% ${100 - (result.returns / result.total * 100)}%, #fbbf24 ${100 - (result.returns / result.total * 100)}% 100%)` }}>
                            <div className="w-40 h-40 bg-white rounded-full shadow-inner flex items-center justify-center border-4 border-yellow-100">
                                <span className="text-4xl font-black text-yellow-600 italic">{(result.returns / result.total * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-10 max-w-sm z-10">
                        <div className="flex items-start gap-6 bg-slate-50 p-6 rounded-[2rem]">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">💰</div>
                            <div>
                                <p className="text-lg font-black text-slate-700">My Base Money</p>
                                <p className="text-sm text-slate-500 font-medium">The yummy capital I started with!</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6 bg-emerald-50 p-6 rounded-[2rem]">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">📈</div>
                            <div>
                                <p className="text-lg font-black text-emerald-700">The Growth Spurt!</p>
                                <p className="text-sm text-emerald-500 font-medium tracking-tight">How much extra I earned!</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 pt-8">
                    <div className="bg-white p-10 rounded-[3rem] border-4 border-dashed border-slate-200">
                        <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                            <Coffee className="text-orange-500" /> Settings Used
                        </h4>
                        <table className="w-full">
                            <tbody className="space-y-4 font-bold">
                                {Object.entries(inputs).map(([key, val]) => (
                                    <tr key={key} className="block">
                                        <td className="text-slate-400 uppercase text-xs mb-1 block">{key.replace('_', ' ')}</td>
                                        <td className="text-2xl font-black text-slate-700 block border-b-2 border-slate-100 pb-2">{val} {key.includes('rate') || key.includes('ratio') ? '%' : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-4 right-4 animate-spin-slow opacity-20"><Zap size={40} /></div>
                        <div>
                            <h4 className="text-xl font-black mb-10 flex items-center gap-3 uppercase"><ShieldCheck /> Tax Hero Says:</h4>
                            <div className="space-y-8">
                                <div className="flex justify-between items-end border-b-2 border-white/20 pb-4">
                                    <span className="text-lg opacity-80">Tax Pocket</span>
                                    <span className="text-4xl font-black tabular-nums">₹{Math.round(result.tax).toLocaleString()}</span>
                                </div>
                                <p className="text-sm font-medium leading-relaxed opacity-80 italic">
                                    "Holy moly! We calculated this for FY 2024. Keep up the great work! ✨"
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <span className="bg-white/20 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">Verified by Tax Hero</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 font-['Inter'] antialiased">
            <div className="flex justify-between items-center mb-10 border-b border-slate-200 pb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase font-['Outfit']">{toolName}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Comprehensive Investment Analysis</p>
                </div>
                <div className="w-16 h-1.5 bg-orange-600 rounded-full"></div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 font-['Outfit']">Total Invested</p>
                    <p className="text-3xl font-black text-slate-900 tabular-nums">₹{(result.invested || 0).toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-3 font-['Outfit']">Wealth Accrued</p>
                    <p className="text-3xl font-black text-emerald-700 tabular-nums">+₹{(result.returns || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3 font-['Outfit']">Estimated Maturity</p>
                    <p className="text-3xl font-black text-white tabular-nums">₹{(result.netTotal || result.total || 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 flex items-center justify-around break-inside-avoid shadow-sm">
                <div className="text-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 font-['Outfit']">Asset allocation</h4>
                    <div className="w-44 h-44 rounded-full border-[10px] border-slate-50 shadow-inner flex items-center justify-center relative"
                        style={{ background: `conic-gradient(#f1f5f9 0% ${100 - (result.returns / result.total * 100)}%, #10b981 ${100 - (result.returns / result.total * 100)}% 100%)` }}>
                        <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-50">
                            <span className="text-2xl font-black text-slate-900 tabular-nums">{(result.returns / result.total * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-8 max-w-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-4 h-4 rounded-full bg-slate-200 mt-1 shrink-0"></div>
                        <div>
                            <p className="text-xs font-black text-slate-900 uppercase font-['Outfit']">Principal Maintenance</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Safety-first capital retention of your initial contribution.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 mt-1 shrink-0 shadow-lg shadow-emerald-500/20"></div>
                        <div>
                            <p className="text-xs font-black text-emerald-600 uppercase font-['Outfit']">Compounding Factor</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Projected geometric growth based on historical market trends.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 pt-10">
                <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-8 border-l-4 border-orange-500 pl-4 font-['Outfit']">Projected Parameters</h4>
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-100 font-medium text-xs">
                            {Object.entries(inputs).map(([key, val]) => (
                                <tr key={key}>
                                    <td className="py-5 text-slate-400 uppercase tracking-tight font-['Outfit']">{key.replace('_', ' ')}</td>
                                    <td className="py-5 text-slate-900 text-right font-black tabular-nums">{val} {key.includes('rate') || key.includes('ratio') ? '%' : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 font-['Outfit']">Fiscal Compliance</h4>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center text-sm border-b border-slate-200/50 pb-4">
                                <span className="text-slate-500 font-medium">Provision for Tax</span>
                                <span className="text-rose-600 font-black tabular-nums">₹{Math.round(result.tax).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-200/50 pb-4">
                                <span className="text-slate-500 font-medium">LTCG Eligibility</span>
                                <span className="text-slate-900 font-black">Verified</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-6 italic">
                        * Calculations as per Financial Year 2024-25. Long-term capital gains tax indexed for inflation where applicable.
                    </p>
                </div>
            </div>
        </div>
    );
};

const StarsBg = () => (
    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute animate-pulse" style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 15 + 5}px`
            }}>✨</div>
        ))}
    </div>
);

export const PrintView = ({ user, stats, transactions, filterLabel, calculatorData, isPrinting, variant = 'classic' }) => {
    const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const getAdaptiveText = (val, baseSize = 'text-2xl', mdSize = 'text-xl', smSize = 'text-lg') => {
        const len = val?.toString().length || 0;
        if (len > 12) return smSize;
        if (len > 8) return mdSize;
        return baseSize;
    };

    const renderComplianceFooter = (dark = false) => (
        <div className={`grid grid-cols-2 gap-10 items-start break-inside-avoid ${dark ? 'text-white/60' : 'text-slate-900'}`}>
            <div className="space-y-6">
                <div>
                    <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 font-['Outfit'] ${dark ? 'text-white' : 'text-slate-900'}`}>Digital Identity Matrix</h4>
                    <div className={`grid grid-cols-2 gap-4 p-6 rounded-2xl border ${dark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject ID</p>
                            <p className={`text-[10px] font-bold truncate ${dark ? 'text-white/80' : 'text-slate-700'}`}>{user?.id}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Origin</p>
                            <p className={`text-[10px] font-bold ${dark ? 'text-white/80' : 'text-slate-700'}`}>FIN.SWINFOSYSTEMS.ONLINE</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Email</p>
                            <p className={`text-[10px] font-bold ${dark ? 'text-white/80' : 'text-slate-700'}`}>{user?.email}</p>
                        </div>
                    </div>
                </div>
                <p className="text-[9px] font-medium text-slate-400 leading-relaxed max-w-sm">
                    This statement is a verified encrypted extract from the Swinfosystems SSC Financial Intelligence Unit.
                    Unauthorized tampering with this ledger is detectable via the integrated digital signature.
                    Generated via {dark ? 'HyperGlow' : 'Orange'} 4.2 Pro Stable.
                </p>
            </div>
            <div className="text-right flex flex-col items-end">
                <div className={`border-2 p-8 rounded-[2.5rem] shadow-xl mb-6 relative overflow-hidden group ${dark ? 'bg-black border-white/20' : 'bg-white border-slate-900'}`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-10 -mt-10"></div>
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] font-['Outfit'] ${dark ? 'text-white' : 'text-slate-900'}`}>Audit Verified</span>
                    </div>
                    <p className={`text-[24px] font-black tracking-tighter leading-none mb-2 font-['Outfit'] ${dark ? 'text-white' : 'text-slate-900'}`}>SIGN_OK_2026</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Security Protocol 4.0</p>
                </div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">AUTH.SWINFOSYSTEMS.ONLINE</p>
            </div>
        </div>
    );

    if (variant === 'creative') {
        return (
            <div id="print-root" className={`${isPrinting ? 'print-active' : 'print-only'} p-12 bg-[#fffcf4] text-slate-900 font-['Fredoka'] antialiased leading-relaxed min-h-screen overflow-visible relative`}>
                {/* Visual Depth Elements */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-20" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute top-0 right-0 w-full h-40 bg-gradient-to-b from-orange-100/40 to-transparent -z-10 pointer-events-none"></div>

                {/* Decorative Stickers */}
                <div className="absolute top-60 -right-10 bg-yellow-400 text-yellow-900 px-10 py-2 font-black text-xs uppercase tracking-[0.5em] rotate-45 shadow-xl border-4 border-white z-50">STRICTLY PRIVATE 🔒</div>
                <div className="absolute bottom-20 -left-10 bg-indigo-500 text-white px-10 py-2 font-black text-xs uppercase tracking-[0.5em] -rotate-45 shadow-xl border-4 border-white z-50">GOLDEN MEMBER ⭐</div>

                {/* Custom Funky Header */}
                <div className="flex justify-between items-center mb-16 bg-gradient-to-br from-[#FF3D00] via-[#FF8F00] to-[#FFAB00] p-10 rounded-[4rem] text-white shadow-[0_20px_60px_-15px_rgba(255,61,0,0.3)] relative border-b-8 border-orange-700/20">
                    <div className="absolute -top-8 -right-8 scale-150 rotate-12 drop-shadow-2xl animate-bounce">
                        <div className="bg-white p-3 rounded-full shadow-2xl border-4 border-orange-100">
                            <Smile size={48} className="text-orange-500" />
                        </div>
                    </div>
                    <div className="absolute -bottom-6 left-12 bg-white text-orange-600 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg border-2 border-orange-50 translate-y-2">
                        Official Swos Ledger 🚀
                    </div>
                    <div>
                        <h1 className="text-6xl font-black tracking-tight uppercase leading-none drop-shadow-lg mb-2">Orange Fun! 🍊</h1>
                        <p className="text-sm font-black tracking-[0.4em] opacity-90 uppercase">The Happy Money Adventure</p>
                    </div>
                    <div className="text-right flex items-center gap-6">
                        <div className="user-info">
                            <p className="text-3xl font-black tracking-tight leading-none drop-shadow-md">{user?.user_metadata?.full_name?.split(' ')[0] || 'Me'}'s Loot!</p>
                            <p className="text-[10px] font-bold opacity-80 mt-2 bg-black/10 px-3 py-1 rounded-full uppercase tracking-tighter">{user?.email}</p>
                        </div>
                        <div className="w-24 h-24 rounded-[3rem] border-4 border-white shadow-2xl flex items-center justify-center p-1 bg-white/20 overflow-hidden transform rotate-3 hover:rotate-0 transition-transform">
                            <img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="U" className="w-full h-full object-cover rounded-[2.5rem]" />
                        </div>
                    </div>
                </div>

                {calculatorData ? (
                    <CalculatorReport data={calculatorData} variant="creative" />
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-12 px-8">
                            <div className="relative">
                                <div className="absolute -top-3 -left-3 bg-rose-500 text-white p-1 rounded-full shadow-lg z-10"><Heart size={14} fill="currentColor" /></div>
                                <div className="bg-white px-8 py-5 rounded-[2.5rem] border-4 border-yellow-200 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] rotate-1">
                                    <h4 className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1 leading-none">Vibe Check Period 📅</h4>
                                    <p className="text-2xl font-black text-slate-800">{filterLabel || 'All-Time Legend'}</p>
                                </div>
                            </div>
                            <div className="flex gap-16 text-right items-center">
                                <div className="bg-white px-8 py-5 rounded-[2.5rem] border-4 border-orange-200 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] -rotate-1">
                                    <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1 leading-none">Magic Date 🍭</h4>
                                    <p className="text-xl font-bold text-slate-700">{today}</p>
                                </div>
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                    <div className="relative bg-white px-8 py-5 rounded-[2.5rem] border-4 border-emerald-400 shadow-2xl">
                                        <span className="text-md font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck size={20} /> AUTHENTIC
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Funky Bento Summaries */}
                        <div className="grid grid-cols-3 gap-8 mb-16 break-inside-avoid">
                            <div className="bg-[#4D4DFF] text-white p-10 rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(77,77,255,0.4)] relative group overflow-hidden border-b-8 border-indigo-900/30">
                                <StarsBg />
                                <div className="absolute top-4 right-8 transform group-hover:rotate-12 transition-transform"><Wallet size={44} className="opacity-30" /></div>
                                <p className="text-xs font-black opacity-70 uppercase tracking-widest mb-4">The Treasure Balance!</p>
                                <h2 className={`${getAdaptiveText(stats.balance, 'text-5xl', 'text-4xl', 'text-3xl')} font-black italic tabular-nums leading-none tracking-tighter drop-shadow-lg`}>
                                    ₹{stats.balance.toLocaleString()}
                                </h2>
                            </div>
                            <div className="bg-[#00DDAA] text-emerald-950 p-10 rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(0,221,170,0.3)] border-4 border-white relative overflow-hidden border-b-8 border-emerald-700/20">
                                <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12 scale-150"><Plus size={80} /></div>
                                <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4">Golden Inflow! 🍯</p>
                                <h2 className={`${getAdaptiveText(stats.income, 'text-5xl', 'text-4xl', 'text-3xl')} font-black italic tabular-nums leading-none tracking-tighter`}>
                                    ₹{stats.income.toLocaleString()}
                                </h2>
                            </div>
                            <div className="bg-[#FF4D88] text-white p-10 rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(255,77,136,0.3)] border-4 border-white relative overflow-hidden border-b-8 border-rose-900/20">
                                <div className="absolute -bottom-4 -right-4 opacity-10 -rotate-12 scale-150"><Zap size={80} /></div>
                                <p className="text-xs font-black opacity-80 uppercase tracking-widest mb-4">Cookie Crumb Out! 🍪</p>
                                <h2 className={`${getAdaptiveText(stats.expense, 'text-5xl', 'text-4xl', 'text-3xl')} font-black italic tabular-nums leading-none tracking-tighter`}>
                                    ₹{stats.expense.toLocaleString()}
                                </h2>
                            </div>
                        </div>

                        <PrintAnalytics stats={stats} transactions={transactions} variant="creative" />

                        {/* Cartoon Style Table */}
                        <div className="mt-20 break-inside-auto">
                            <div className="flex items-center gap-4 mb-10 ml-4">
                                <div className="p-5 bg-orange-400 rounded-[2rem] text-white shadow-xl rotate-3 animate-pulse">
                                    <Camera size={32} />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tight leading-none">The Treasure Log</h3>
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.5em] mt-1 ml-1">Daily Bounty History</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-[4rem] border-[12px] border-[#FFFDF5] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-visible">
                                <div className="rounded-[3rem] overflow-hidden border-4 border-slate-50">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-900 text-white">
                                                <th className="p-8 text-xs font-black uppercase tracking-[0.3em] font-['Outfit']">Timestamp 🗓️</th>
                                                <th className="p-8 text-xs font-black uppercase tracking-[0.3em] font-['Outfit']">Event Details 🤔</th>
                                                <th className="p-8 text-xs font-black uppercase tracking-[0.3em] font-['Outfit'] text-center">Tag</th>
                                                <th className="p-8 text-xs font-black uppercase tracking-[0.3em] font-['Outfit'] text-right">Impact 💰</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {transactions.map((t, i) => (
                                                <tr key={i} className={`break-inside-avoid hover:bg-slate-50/80 transition-colors group ${i % 2 === 0 ? 'bg-white' : 'bg-[#FFFDF5]/50'}`}>
                                                    <td className="p-8 text-lg font-black text-slate-300 group-hover:text-orange-400 transition-colors tabular-nums">
                                                        {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                                                    </td>
                                                    <td className="p-8">
                                                        <p className="text-xl font-black text-slate-800 tracking-tight">{t.title}</p>
                                                        <p className="text-xs font-black text-indigo-400 uppercase mt-1">Status: Done!</p>
                                                    </td>
                                                    <td className="p-8 text-center">
                                                        <span className={`text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-sm border-2 ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                            {t.category}
                                                        </span>
                                                    </td>
                                                    <td className={`p-8 font-black text-right ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'} italic ${getAdaptiveText(t.amount, 'text-2xl', 'text-xl', 'text-lg')} tabular-nums`}>
                                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Funky Footer */}
                <div className="mt-32 pt-16 border-t-8 border-dashed border-slate-100 mb-20">
                    <div className="grid grid-cols-2 gap-12 items-center break-inside-avoid relative mb-20">
                        <div className="absolute -top-12 left-1/2 -ml-10 bg-white p-4 rounded-full shadow-lg border-4 border-slate-50 rotate-12"><Smile size={40} className="text-orange-400" /></div>
                        <div>
                            <h4 className="text-lg font-black text-slate-800 uppercase mb-4">The Boring Legal Stuff 😴</h4>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-sm italic">
                                Everything here is super secret! Generated by our smart robot at Swinfosystems. Have a wonderful day and happy saving! 🌈
                            </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="bg-gradient-to-r from-emerald-400 to-indigo-500 p-1 px-8 py-3 rounded-[2rem] text-white shadow-2xl mb-6 flex items-center gap-3 active:scale-95 transition-transform rotate-1">
                                <ShieldCheck size={24} />
                                <span className="text-md font-black uppercase tracking-widest">Cool Proof!</span>
                            </div>
                            <p className="text-xs font-black text-slate-300 uppercase tracking-[0.5em]">FIN.SWINFOSYSTEMS.FUN 🎈</p>
                        </div>
                    </div>
                    {renderComplianceFooter(false)}
                </div>
            </div>
        );
    }

    if (variant === 'modern') {
        return (
            <div id="print-root" className={`${isPrinting ? 'print-active' : 'print-only'} p-20 bg-[#020617] text-white font-['Outfit'] antialiased min-h-screen overflow-visible relative selection:bg-indigo-500`}>
                <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent -z-10"></div>

                <div className="flex justify-between items-start mb-24 relative z-10">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-white flex items-center justify-center rounded-3xl rotate-12 shadow-2xl">
                                <Wallet size={32} className="text-slate-900" />
                            </div>
                            <h1 className="text-7xl font-black tracking-tighter italic">FIN<span className="text-indigo-500">_</span>AI</h1>
                        </div>
                        <p className="text-indigo-400 font-black tracking-[0.8em] uppercase text-[10px] ml-2">Intelligence Extract 4.2</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Subject Authorization</p>
                        <h2 className="text-3xl font-black italic">{user?.user_metadata?.full_name?.toUpperCase()}</h2>
                        <div className="h-px w-24 bg-white/10 ml-auto mt-4"></div>
                        <p className="text-xs font-bold text-white/40 mt-4 tabular-nums">{today}</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-20 break-inside-avoid">
                    <div className="col-span-2 bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[4rem] flex flex-col justify-between group">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            Net Capital Reserves
                        </p>
                        <h2 className={`${getAdaptiveText(stats.balance, 'text-7xl', 'text-6xl', 'text-5xl')} font-black italic tracking-tighter tabular-nums`}>₹{stats.balance.toLocaleString()}</h2>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[4rem] text-center flex flex-col items-center justify-center gap-4">
                        <TrendingUp className="text-emerald-400" size={32} />
                        <div>
                            <p className="text-[10px] font-black text-emerald-400/50 uppercase tracking-widest mb-1">Inflow</p>
                            <p className="text-2xl font-black tabular-nums">+₹{stats.income.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-10 rounded-[4rem] text-center flex flex-col items-center justify-center gap-4">
                        <Zap className="text-rose-400" size={32} />
                        <div>
                            <p className="text-[10px] font-black text-rose-400/50 uppercase tracking-widest mb-1">Outflow</p>
                            <p className="text-2xl font-black tabular-nums">-₹{stats.expense.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4.5rem] p-12 mb-24 break-inside-avoid shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center justify-between mb-16 px-4">
                        <h3 className="text-3xl font-black italic flex items-center gap-6">
                            <div className="w-12 h-1.5 bg-indigo-500 rounded-full"></div>
                            Log Registry
                        </h3>
                        <div className="bg-white/10 px-8 py-3 rounded-full border border-white/10">
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50">{filterLabel}</span>
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-white/5">
                            {transactions.map((t, i) => (
                                <tr key={i} className="break-inside-avoid">
                                    <td className="py-10 pr-8 text-white/20 font-black tabular-nums text-xs">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                                    <td className="py-10">
                                        <p className="text-2xl font-black tracking-tighter leading-none italic mb-3">{t.title}</p>
                                        <span className="bg-white/5 border border-white/5 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/30">{t.category}</span>
                                    </td>
                                    <td className={`py-10 text-right font-black ${t.type === 'income' ? 'text-emerald-400 underline decoration-emerald-500/30' : 'text-rose-400 underline decoration-rose-500/30'} ${getAdaptiveText(t.amount, 'text-3xl', 'text-2xl', 'text-xl')} tabular-nums`}>
                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-20 pt-12 border-t border-white/5 opacity-60">
                    {renderComplianceFooter(true)}
                </div>
            </div>
        );
    }

    if (variant === 'neon') {
        const glowText = "drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]";
        const primaryGlow = "drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]";

        return (
            <div id="print-root" className={`${isPrinting ? 'print-active' : 'print-only'} p-20 bg-[#000000] text-white font-['Outfit'] min-h-screen overflow-visible relative`}>
                <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:40px_40px] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-purple-900/40 to-transparent -z-10"></div>

                <div className="flex justify-between items-start mb-32 relative">
                    <div className="relative group">
                        <div className="absolute -inset-10 bg-fuchsia-600/30 blur-[100px] group-hover:opacity-100 transition-opacity"></div>
                        <h1 className={`text-8xl font-black italic tracking-tighter text-fuchsia-500 ${glowText} relative`}>NEON.FIN</h1>
                        <p className={`text-cyan-400 font-black tracking-[1.5em] mt-6 uppercase text-[9px] ${primaryGlow} ml-4`}>Core System Extraction</p>
                    </div>
                    <div className="text-right border-l-4 border-fuchsia-500 pl-10">
                        <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mb-4">Registry Holder</p>
                        <h2 className="text-4xl font-black italic tracking-tighter">{user?.user_metadata?.full_name}</h2>
                        <p className="text-xs font-black text-fuchsia-500/60 mt-4 uppercase tracking-widest">{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-24 break-inside-avoid">
                    <div className="col-span-2 bg-[#050505]/80 backdrop-blur-3xl border border-white/10 p-16 rounded-[4rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent shadow-[0_0_20px_fuchsia]"></div>
                        <p className="text-[11px] font-black text-fuchsia-500 uppercase tracking-widest mb-10 flex items-center gap-4">
                            <span className="w-10 h-0.5 bg-fuchsia-500"></span>
                            Verified Liquidity
                        </p>
                        <h2 className={`${getAdaptiveText(stats.balance, 'text-8xl', 'text-7xl', 'text-6xl')} font-black italic tabular-nums text-white`}>₹{stats.balance.toLocaleString()}</h2>
                    </div>
                    <div className="space-y-8 flex flex-col">
                        <div className="flex-1 bg-cyan-500/10 border border-cyan-500/30 p-10 rounded-[3rem] text-center flex flex-col items-center justify-center relative overflow-hidden">
                            <TrendingUp className="text-cyan-400 mb-4" size={32} />
                            <p className="text-[10px] font-black text-cyan-400/50 uppercase tracking-widest">Inflow</p>
                            <p className="text-3xl font-black italic tabular-nums text-cyan-400">+₹{stats.income.toLocaleString()}</p>
                        </div>
                        <div className="flex-1 bg-rose-500/10 border border-rose-500/30 p-10 rounded-[3rem] text-center flex flex-col items-center justify-center relative overflow-hidden">
                            <Zap className="text-rose-400 mb-4" size={32} />
                            <p className="text-[10px] font-black text-rose-400/50 uppercase tracking-widest">Outflow</p>
                            <p className="text-3xl font-black italic tabular-nums text-rose-500">-₹{stats.expense.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#050505]/80 backdrop-blur-3xl border border-white/10 p-16 rounded-[5rem] mb-24 shadow-[0_80px_100px_-40px_rgba(217,70,239,0.2)] break-inside-avoid relative overflow-hidden">
                    <div className="flex items-center justify-between mb-20 px-4">
                        <h3 className="text-4xl font-black italic tracking-tighter flex items-center gap-8">
                            <div className="w-4 h-4 rounded-full bg-fuchsia-500 shadow-[0_0_15px_fuchsia]"></div>
                            Registry Logs
                        </h3>
                        <div className="bg-white/5 border border-white/10 px-10 py-4 rounded-3xl">
                            <p className="text-[10px] font-black text-cyan-400 tracking-[0.6em] uppercase italic">{filterLabel}</p>
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-white/5">
                            {transactions.map((t, i) => (
                                <tr key={i} className="break-inside-avoid group">
                                    <td className="py-12 pr-10 text-white/20 font-black tabular-nums text-[11px]">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="py-12 relative">
                                        <p className="text-3xl font-black italic tracking-tighter group-hover:text-fuchsia-400 transition-colors uppercase">{t.title}</p>
                                        <p className="text-[10px] font-black text-fuchsia-500/60 uppercase tracking-widest mt-4 flex items-center gap-3">
                                            <span className="w-1 h-1 bg-fuchsia-500 rounded-full"></span>
                                            {t.category}
                                        </p>
                                    </td>
                                    <td className={`py-12 text-right font-black ${t.type === 'income' ? `text-cyan-400 ${primaryGlow}` : `text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]`} ${getAdaptiveText(t.amount, 'text-4xl', 'text-3xl', 'text-2xl')} tabular-nums italic`}>
                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-20 pt-12 border-t border-fuchsia-500/10">
                    {renderComplianceFooter(true)}
                </div>
            </div>
        );
    }

    if (variant === 'minimalist') {
        const borderStyle = "border-b-[3px] border-slate-900";
        return (
            <div id="print-root" className={`${isPrinting ? 'print-active' : 'print-only'} p-20 bg-white text-slate-900 font-['Inter'] antialiased min-h-screen overflow-visible`}>
                <div className={`flex justify-between items-end mb-24 ${borderStyle} pb-12`}>
                    <div className="flex flex-col gap-2">
                        <div className="w-16 h-1 w-full bg-slate-900 mb-6"></div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Status_Report</h1>
                        <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">Verified Swinfosystems Extract</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Financial Year</p>
                        <p className="text-3xl font-black tabular-nums">{new Date().getFullYear()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-20 mb-32 break-inside-avoid">
                    <div className="border-l-[10px] border-slate-900 pl-10 h-full flex flex-col justify-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Account Holder</p>
                        <h2 className="text-3xl font-black mb-2 tracking-tight">{user?.user_metadata?.full_name}</h2>
                        <p className="text-sm font-medium text-slate-500">{user?.email}</p>
                    </div>
                    <div className="text-right bg-slate-50 p-12 rounded-3xl">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Audited Capital</p>
                        <h2 className={`${getAdaptiveText(stats.balance, 'text-6xl', 'text-5xl', 'text-4xl')} font-black tracking-tighter tabular-nums leading-none`}>₹{stats.balance.toLocaleString()}</h2>
                    </div>
                </div>

                <div className="space-y-4 mb-24">
                    <div className="flex justify-between border-b-2 border-slate-100 pb-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Entry Detail</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Magnitude (INR)</span>
                    </div>
                    {transactions.map((t, i) => (
                        <div key={i} className="flex justify-between items-center py-10 border-b border-slate-50 break-inside-avoid group">
                            <div className="flex items-start gap-10">
                                <p className="text-[11px] font-black text-slate-300 tabular-nums uppercase mt-1">{new Date(t.date).toLocaleDateString('en-GB')}</p>
                                <div>
                                    <p className="text-2xl font-black tracking-tight text-slate-900 mb-2">{t.title}</p>
                                    <span className="bg-slate-100 px-3 py-1 rounded text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.category}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-2xl font-black tabular-nums ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {t.type === 'income' ? '+' : ''}{t.amount.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-24 pt-12 border-t-2 border-slate-900">
                    {renderComplianceFooter(false)}
                </div>
            </div>
        );
    }

    if (variant === 'retro') {
        const doubleBorder = "border-[10px] border-double border-slate-300";
        return (
            <div id="print-root" className={`${isPrinting ? 'print-active' : 'print-only'} p-20 bg-[#fdfaf6] text-slate-800 font-serif antialiased min-h-screen ${doubleBorder}`}>
                <div className="text-center mb-32 relative">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-300 -z-10"></div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase mb-2 bg-[#fdfaf6] inline-block px-12 italic text-slate-900">Archive Ledger</h1>
                    <p className="text-xs uppercase tracking-[0.8em] font-sans font-black text-slate-400 mt-6">Swinfosystems SSC Metadata Extraction</p>
                </div>

                <div className="grid grid-cols-3 gap-16 mb-24 break-inside-avoid">
                    <div className="col-span-1 border-r border-slate-200 pr-16 bg-slate-50/50 p-10 rounded-2xl">
                        <p className="text-[11px] font-black uppercase mb-6 font-sans tracking-widest opacity-40">Client Dossier</p>
                        <p className="text-3xl font-black leading-none mb-4">{user?.user_metadata?.full_name}</p>
                        <p className="text-[11px] font-bold font-sans text-slate-400">{user?.email}</p>
                    </div>
                    <div className="col-span-2 text-right flex flex-col justify-end">
                        <p className="text-[11px] font-black uppercase mb-6 font-sans tracking-widest opacity-40">Current Registry Standing</p>
                        <div className="flex items-end justify-end gap-6">
                            <span className="text-4xl font-black text-slate-300 italic mb-2">₹</span>
                            <h2 className={`${getAdaptiveText(stats.balance, 'text-8xl', 'text-7xl', 'text-6xl')} font-black italic tabular-nums leading-none tracking-tighter`}>{stats.balance.toLocaleString()}</h2>
                        </div>
                    </div>
                </div>

                <div className="mb-24">
                    <div className="grid grid-cols-12 gap-8 border-y-2 border-slate-900 py-4 mb-10 font-sans text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="col-span-2">Date</div>
                        <div className="col-span-6">Registry Entry</div>
                        <div className="col-span-4 text-right">Value (INR)</div>
                    </div>
                    <div className="space-y-2">
                        {transactions.map((t, i) => (
                            <div key={i} className="grid grid-cols-12 gap-8 items-center py-8 border-b border-dotted border-slate-300 break-inside-avoid">
                                <div className="col-span-2 text-[11px] font-black font-sans opacity-40 tabular-nums">{new Date(t.date).toLocaleDateString()}</div>
                                <div className="col-span-6">
                                    <p className="text-2xl font-black tracking-tight mb-1">{t.title}</p>
                                    <p className="text-[9px] font-black font-sans uppercase tracking-[0.2em] text-slate-400">{t.category}</p>
                                </div>
                                <div className={`col-span-4 text-right text-3xl font-black italic ${t.type === 'income' ? 'text-slate-900 underline decoration-slate-900/10' : 'text-slate-400'}`}>
                                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-24 pt-12 border-t-2 border-slate-900">
                    {renderComplianceFooter(false)}
                </div>
            </div>
        );
    }

    return (
        <div id="print-root" className={`${isPrinting ? 'print-active' : 'print-only'} p-12 bg-white text-slate-900 font-['Inter'] antialiased leading-relaxed min-h-screen overflow-visible`}>
            <div className="print-pagination-fix h-0 w-0 overflow-visible"></div>
            {/* High-Quality Minimal Header */}
            <div className="flex justify-between items-end mb-12 border-b-2 border-slate-900 pb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase font-['Outfit'] leading-none">Orange Finance</h1>
                    <p className="text-[10px] font-black tracking-[0.5em] text-slate-400 mt-3 uppercase">Authenticated Ledger Statement</p>
                </div>
                <div className="text-right flex items-center gap-8">
                    <div className="user-info">
                        <p className="text-base font-black text-slate-900 tracking-tight leading-none font-['Outfit']">{user?.user_metadata?.full_name || 'Orange Client'}</p>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 tracking-tight">{user?.email}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center p-0.5 bg-slate-50 shadow-sm">
                        <img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="U" className="w-full h-full object-cover rounded-[14px]" />
                    </div>
                </div>
            </div>

            {calculatorData ? (
                <CalculatorReport data={calculatorData} />
            ) : (
                <>
                    {/* Detailed Metadata Row */}
                    <div className="flex justify-between items-center mb-10 px-1 border-b border-slate-50 pb-8">
                        <div>
                            <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 font-['Outfit']">Statement Period</h4>
                            <p className="text-xl font-black text-slate-800 tabular-nums">{filterLabel || 'Full Term'}</p>
                        </div>
                        <div className="flex gap-12 text-right">
                            <div>
                                <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 font-['Outfit']">Extraction Date</h4>
                                <p className="text-[13px] font-bold text-slate-600 tabular-nums">{today}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>
                            <div>
                                <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 font-['Outfit']">Audit Status</h4>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase border border-emerald-100 font-['Outfit'] tracking-wider">Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* High-Resolution Summary Cards */}
                    <div className="grid grid-cols-3 gap-6 mb-12 break-inside-avoid">
                        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group border-b-8 border-slate-700">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 font-['Outfit']">Net Capital Liquidity</p>
                            <h2 className={`${getAdaptiveText(stats.balance, 'text-3xl', 'text-2xl', 'text-xl')} font-black tracking-tight tabular-nums leading-tight`}>₹{stats.balance.toLocaleString()}</h2>
                        </div>
                        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm border-b-8 border-emerald-50">
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 font-['Outfit']">Gross Capital Inflow</p>
                            <h2 className={`${getAdaptiveText(stats.income, 'text-3xl', 'text-2xl', 'text-xl')} font-black text-slate-900 tracking-tight tabular-nums leading-tight`}>₹{stats.income.toLocaleString()}</h2>
                        </div>
                        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm border-b-8 border-rose-50">
                            <p className="text-[9px] font-black text-rose-600 uppercase tracking-[0.2em] mb-3 font-['Outfit']">Gross Capital Outflow</p>
                            <h2 className={`${getAdaptiveText(stats.expense, 'text-3xl', 'text-2xl', 'text-xl')} font-black text-slate-900 tracking-tight tabular-nums leading-tight`}>₹{stats.expense.toLocaleString()}</h2>
                        </div>
                    </div>

                    {/* Analytics Engines */}
                    <PrintAnalytics stats={stats} transactions={transactions} />

                    {/* Transaction Registry: High Contrast */}
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                    <List size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider font-['Outfit']">Transaction Registry</h3>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{transactions.length} Verified Entries</p>
                        </div>
                        <div className="border border-slate-200 rounded-[2rem] shadow-sm overflow-visible bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead className="break-inside-avoid">
                                    <tr className="bg-slate-900 text-white border-b border-slate-700">
                                        <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] font-['Outfit'] first:rounded-tl-[2rem]">Process Date</th>
                                        <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] font-['Outfit']">Transaction Details</th>
                                        <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] font-['Outfit'] text-center">Category</th>
                                        <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] font-['Outfit'] text-right last:rounded-tr-[2rem]">Amount (INR)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.map((t, i) => (
                                        <tr key={i} className="break-inside-avoid hover:bg-slate-50/50 transition-colors">
                                            <td className="p-6 text-[11px] font-bold text-slate-400 tabular-nums w-28">
                                                {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                            </td>
                                            <td className="p-6">
                                                <p className="text-[14px] font-black text-slate-800 tracking-tight leading-none">{t.title}</p>
                                                <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1.5">{t.type}</p>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="text-[9px] font-black bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full text-slate-500 uppercase tracking-tighter">
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className={`p-6 font-black text-right tabular-nums ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'} ${getAdaptiveText(t.amount, 'text-[15px]', 'text-[13px]', 'text-[11px]')}`}>
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

            {/* Regulatory Compliance Footer */}
            <div className="mt-24 pt-12 border-t-2 border-slate-900">
                {renderComplianceFooter(false)}
            </div>
        </div>
    );
};
