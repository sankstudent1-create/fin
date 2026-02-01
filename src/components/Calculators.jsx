import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins, Lock, ShieldCheck, Percent, RotateCcw, Download, Mail, Share2 } from 'lucide-react';
import { generateCalculatorPDF, generateEmailLink } from '../utils/reportGenerator';

// --- Calculation Logic ---

// --- Calculation Logic ---

const calculateSIP = (p, n, r, er = 0) => {
    const netR = r - er;
    const i = netR / 100 / 12;
    const invested = p * n;
    const total = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const returns = total - invested;

    const taxableGains = Math.max(0, returns - 125000);
    const tax = taxableGains * 0.125;

    // Projections
    const projections = [];
    for (let y = 1; y <= Math.ceil(n / 12); y++) {
        const months = y * 12;
        const currentTotal = p * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
        projections.push({ year: y, invested: p * months, total: currentTotal });
    }

    return { invested, total, returns, tax, netTotal: total - tax, projections };
};

const calculateLumpsum = (p, n, r, er = 0) => {
    const netR = r - er;
    const total = p * Math.pow(1 + netR / 100, n);
    const returns = total - p;

    const taxableGains = Math.max(0, returns - 125000);
    const tax = taxableGains * 0.125;

    const projections = [];
    for (let y = 1; y <= n; y++) {
        projections.push({ year: y, invested: p, total: p * Math.pow(1 + netR / 100, y) });
    }

    return { invested: p, total, returns, tax, netTotal: total - tax, projections };
};

const calculateFD = (p, n, r) => {
    const total = p * Math.pow(1 + r / 100, n);
    const returns = total - p;
    const tax = returns * 0.10;

    const projections = [];
    for (let y = 1; y <= n; y++) {
        projections.push({ year: y, invested: p, total: p * Math.pow(1 + r / 100, y) });
    }

    return { invested: p, total, returns, tax, netTotal: total - tax, projections };
};

const calculatePPF = (p, n) => {
    const r = 7.1;
    let total = 0;
    let invested = 0;
    const projections = [];
    for (let y = 1; y <= n; y++) {
        total = (total + p) * (1 + r / 100);
        invested += p;
        projections.push({ year: y, invested, total });
    }
    return { invested, total, returns: total - invested, tax: 0, netTotal: total, projections };
};

const calculateSimpleInterest = (p, n, r) => {
    const interest = (p * r * n) / 100;
    const projections = [];
    for (let y = 1; y <= n; y++) {
        const curInt = (p * r * y) / 100;
        projections.push({ year: y, invested: p, total: p + curInt });
    }
    return { invested: p, total: p + interest, returns: interest, tax: interest * 0.10, netTotal: (p + interest) - (interest * 0.10), projections };
};

// --- Component ---

export const CalculatorModal = ({ toolId, onClose, onPrint, onShare, t }) => {
    const [data, setData] = useState({ amount: '', duration: '', rate: '', expense_ratio: '1' });
    const [result, setResult] = useState(null);
    const [showDetailed, setShowDetailed] = useState(false);

    const tools = {
        sip: { name: 'SIP Calculator', icon: TrendingUp, color: 'text-blue-600', desc: 'Equity Mutual Fund (MF)' },
        lumpsum: { name: 'Lumpsum Calculator', icon: Coins, color: 'text-emerald-600', desc: 'One-time MF Investment' },
        fd: { name: 'Fixed Deposit', icon: Lock, color: 'text-amber-600', desc: 'Secure Bank Savings' },
        ppf: { name: 'PPF Calculator', icon: ShieldCheck, color: 'text-indigo-600', desc: 'Tax-Free Govt Scheme' },
        interest: { name: 'Interest Calculator', icon: Percent, color: 'text-slate-600', desc: 'Simple Loan Interest' },
    };

    const currentTool = tools[toolId];

    const handleCalculate = () => {
        const p = parseFloat(data.amount);
        const n = parseFloat(data.duration);
        const r = parseFloat(data.rate);
        const er = parseFloat(data.expense_ratio) || 0;

        if (!p || !n) return;

        let res = { invested: 0, total: 0, returns: 0, tax: 0, netTotal: 0, projections: [] };

        switch (toolId) {
            case 'sip':
                res = calculateSIP(p, n * 12, r || 12, er);
                break;
            case 'lumpsum':
                res = calculateLumpsum(p, n, r || 12, er);
                break;
            case 'fd':
                res = calculateFD(p, n, r || 6.5);
                break;
            case 'ppf':
                res = calculatePPF(p, n);
                break;
            case 'interest':
                res = calculateSimpleInterest(p, n, r || 10);
                break;
            default:
                break;
        }
        setResult({ ...res, detailed: showDetailed });
    };

    useEffect(() => { setResult(null); }, [toolId]);

    if (!currentTool) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] animate-slide-up hide-scrollbar" onClick={e => e.stopPropagation()}>

                {/* Header - Sticky */}
                <div className="sticky top-0 z-20 bg-orange-50/90 backdrop-blur-md p-6 flex items-center justify-between border-b border-orange-100">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 bg-white rounded-xl shadow-sm ${currentTool.color}`}>
                            <currentTool.icon size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{t(`tool_${toolId}`)}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t(`${toolId}_desc`)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-orange-100 text-gray-400 shadow-sm transition-colors">✕</button>
                </div>

                {/* content */}
                <div className="p-6 space-y-4">
                    {toolId === 'ppf' && <div className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg">ℹ️ {t('ppf_info')}</div>}

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            {toolId === 'sip' ? t('monthly_invest') : toolId === 'ppf' ? t('yearly_invest') : t('invest_amt')}
                        </label>
                        <input
                            type="number"
                            value={data.amount}
                            onChange={e => setData({ ...data, amount: e.target.value })}
                            className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 font-bold text-gray-800 outline-none focus:ring-2 ring-orange-100"
                            placeholder="5000"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('time_period')}</label>
                        <input
                            type="number"
                            value={data.duration}
                            onChange={e => setData({ ...data, duration: e.target.value })}
                            className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 font-bold text-gray-800 outline-none focus:ring-2 ring-orange-100"
                            placeholder="5"
                        />
                    </div>

                    {(toolId === 'sip' || toolId === 'lumpsum') && (
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('exp_ratio')}</label>
                            <input
                                type="number"
                                step="0.1"
                                value={data.expense_ratio}
                                onChange={e => setData({ ...data, expense_ratio: e.target.value })}
                                className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 font-bold text-gray-800 outline-none focus:ring-2 ring-orange-100"
                                placeholder="1.0"
                            />
                        </div>
                    )}

                    {toolId !== 'ppf' && (
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('return_rate')}</label>
                            <input
                                type="number"
                                value={data.rate}
                                onChange={e => setData({ ...data, rate: e.target.value })}
                                className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 font-bold text-gray-800 outline-none focus:ring-2 ring-orange-100"
                                placeholder={toolId === 'fd' ? '6.5' : '12'}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div>
                            <p className="text-xs font-bold text-gray-800">{t('detailed_report')}</p>
                        </div>
                        <button
                            onClick={() => setShowDetailed(!showDetailed)}
                            className={`w-10 h-6 rounded-full transition-colors relative ${showDetailed ? 'bg-orange-500' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showDetailed ? 'left-5' : 'left-1'}`} />
                        </button>
                    </div>

                    <button onClick={handleCalculate} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl mt-2 hover:bg-gray-800 active:scale-95 transition-all shadow-lg">
                        {t('calculate')}
                    </button>
                </div>

                {/* Result */}
                {result && (
                    <div className="bg-orange-50/50 p-6 border-t border-orange-100">
                        <div className="flex justify-between items-end mb-4">
                            <h4 className="font-bold text-gray-800">{t('projection')}</h4>
                            <button onClick={() => setResult(null)} className="text-xs text-orange-600 flex items-center gap-1 hover:underline"><RotateCcw size={12} /> {t('reset')}</button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center mb-3">
                            <div className="bg-white p-2 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{t('invested')}</p>
                                <p className="font-bold text-gray-800">₹{Math.round(result.invested).toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-emerald-500 font-bold uppercase">{t('wealth_created')}</p>
                                <p className="font-bold text-emerald-600">+₹{Math.round(result.returns).toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-red-50">
                                <p className="text-[10px] text-red-500 font-bold uppercase">{t('est_tax')}</p>
                                <p className="font-bold text-red-600">-₹{Math.round(result.tax).toLocaleString()}</p>
                            </div>
                            <div className="bg-orange-50 p-2 rounded-xl border border-orange-200">
                                <p className="text-[10px] text-orange-500 font-bold uppercase">{t('net_value')}</p>
                                <p className="font-bold text-orange-600">₹{Math.round(result.netTotal).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => onPrint(t(`tool_${toolId}`), data, result)}
                                className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-800"
                            >
                                <Download size={14} /> {t('pdf_report')}
                            </button>
                            <button
                                onClick={() => onShare(t(`tool_${toolId}`), data, result)}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                            >
                                <Share2 size={14} /> {t('share')}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
