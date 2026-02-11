import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Coins, Lock, ShieldCheck, Percent,
    RotateCcw, Download, Share2, Loader2, X, Calculator
} from 'lucide-react';

const calculateSIP = (p, n, r, er = 0) => {
    const netR = r - er;
    const i = netR / 100 / 12;
    const invested = p * n;
    const total = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const returns = total - invested;
    const taxableGains = Math.max(0, returns - 125000);
    const tax = taxableGains * 0.125;
    return { invested, total, returns, tax, netTotal: total - tax };
};

const calculateLumpsum = (p, n, r, er = 0) => {
    const netR = r - er;
    const total = p * Math.pow(1 + netR / 100, n);
    const returns = total - p;
    const taxableGains = Math.max(0, returns - 125000);
    const tax = taxableGains * 0.125;
    return { invested: p, total, returns, tax, netTotal: total - tax };
};

const calculateFD = (p, n, r) => {
    const total = p * Math.pow(1 + r / 100, n);
    const returns = total - p;
    const tax = returns * 0.10;
    return { invested: p, total, returns, tax, netTotal: total - tax };
};

const calculatePPF = (p, n) => {
    const r = 7.1;
    let total = 0;
    let invested = 0;
    for (let y = 1; y <= n; y++) {
        total = (total + p) * (1 + r / 100);
        invested += p;
    }
    return { invested, total, returns: total - invested, tax: 0, netTotal: total };
};

const calculateSimpleInterest = (p, n, r) => {
    const interest = (p * r * n) / 100;
    return { invested: p, total: p + interest, returns: interest, tax: interest * 0.10, netTotal: (p + interest) - (interest * 0.10) };
};

export const CalculatorModal = ({ toolId, onClose, onPrint, onShare, isSharing, pdfVariant, setPdfVariant }) => {
    const [data, setData] = useState({ amount: '', duration: '', rate: '', expense_ratio: '1' });
    const [result, setResult] = useState(null);

    const tools = {
        sip: { name: 'SIP Calculator', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Monthly Equity Investment' },
        lumpsum: { name: 'Lumpsum', icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'One-time Investment' },
        fd: { name: 'Fixed Deposit', icon: Lock, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Secure Bank Savings' },
        ppf: { name: 'PPF Calculator', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Public Provident Fund' },
        interest: { name: 'Simple Interest', icon: Percent, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Basic Interest Calculation' },
    };

    const currentTool = tools[toolId];

    const handleCalculate = () => {
        const p = parseFloat(data.amount);
        const n = parseFloat(data.duration);
        const r = parseFloat(data.rate);
        const er = parseFloat(data.expense_ratio) || 0;

        if (!p || !n) return;

        let res = null;
        switch (toolId) {
            case 'sip': res = calculateSIP(p, n * 12, r || 12, er); break;
            case 'lumpsum': res = calculateLumpsum(p, n, r || 12, er); break;
            case 'fd': res = calculateFD(p, n, r || 6.5); break;
            case 'ppf': res = calculatePPF(p, n); break;
            case 'interest': res = calculateSimpleInterest(p, n, r || 10); break;
        }
        setResult(res);
    };

    if (!currentTool) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 no-print text-sans">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
                layoutId={`tool-${toolId}`}
                className="relative bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white/40 max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl ${currentTool.bg} flex items-center justify-center ${currentTool.color} shadow-inner`}>
                            <currentTool.icon size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{currentTool.name}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currentTool.desc}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setPdfVariant('classic')}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${pdfVariant === 'classic' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                                Classic
                            </button>
                            <button
                                onClick={() => setPdfVariant('creative')}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${pdfVariant === 'creative' ? 'bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                                Fun ✨
                            </button>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                <div className="p-8 pt-4 space-y-6 overflow-y-auto custom-scrollbar">
                    {toolId === 'ppf' && (
                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-3">
                            <ShieldCheck className="text-indigo-600 shrink-0" size={18} />
                            <p className="text-[11px] font-bold text-indigo-700 leading-relaxed uppercase tracking-tight">PPF uses a semi-fixed Govt interest rate (currently ~7.1%). Maturity is tax-free.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Investment Amount (₹)</label>
                            <input
                                type="number"
                                value={data.amount}
                                onChange={e => setData({ ...data, amount: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 focus:border-orange-500 focus:bg-white transition-all outline-none"
                                placeholder="e.g. 5000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Duration (Years)</label>
                            <input
                                type="number"
                                value={data.duration}
                                onChange={e => setData({ ...data, duration: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 focus:border-orange-500 focus:bg-white transition-all outline-none"
                                placeholder="e.g. 10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {toolId !== 'ppf' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Expected Return (%)</label>
                                <input
                                    type="number"
                                    value={data.rate}
                                    onChange={e => setData({ ...data, rate: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 focus:border-orange-500 focus:bg-white transition-all outline-none"
                                    placeholder={toolId === 'fd' ? '6.5' : '12'}
                                />
                            </div>
                        )}
                        {(toolId === 'sip' || toolId === 'lumpsum') && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Expense Ratio (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={data.expense_ratio}
                                    onChange={e => setData({ ...data, expense_ratio: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 focus:border-orange-500 focus:bg-white transition-all outline-none"
                                    placeholder="1.0"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleCalculate}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Calculator size={20} />
                        GENERATE ANALYSIS
                    </button>

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6 pt-6 border-t border-slate-100"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Invested</p>
                                        <p className="text-lg font-black text-slate-900">₹{Math.round(result.invested).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Returns</p>
                                        <p className="text-lg font-black text-emerald-700">+₹{Math.round(result.returns).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-rose-50/50 p-4 rounded-3xl border border-rose-100">
                                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Est. Tax</p>
                                        <p className="text-lg font-black text-rose-700">-₹{Math.round(result.tax).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-orange-500 p-4 rounded-3xl shadow-lg shadow-orange-500/20">
                                        <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">Net Value</p>
                                        <p className="text-lg font-black text-white">₹{Math.round(result.netTotal).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => onPrint(currentTool.name, data, result)}
                                        className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95"
                                    >
                                        <Download size={18} />
                                        PDF REPORT
                                    </button>
                                    <button
                                        onClick={() => onShare(currentTool.name, data, result)}
                                        disabled={isSharing}
                                        className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isSharing ? <Loader2 className="animate-spin text-orange-500" /> : <Share2 size={20} />}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
