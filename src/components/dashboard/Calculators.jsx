
import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins, Lock, ShieldCheck, Percent, RotateCcw, Download, Mail, Share2, Loader2, X, Info, ChevronDown, ChevronUp, IndianRupee, Scale, FileText, Calendar } from 'lucide-react';
import { generateEmailLink } from '../../utils/reportGenerator';

// --- TRANSLATIONS (English Fallback) ---
const EN_Translations = {
    tool_sip: "SIP", tool_lumpsum: "Lumpsum", tool_fd: "Fixed Deposit", tool_ppf: "PPF", tool_interest: "Interest",
    sip_desc: "Equity Mutual Fund (MF)", lumpsum_desc: "One-time MF Investment", fd_desc: "Secure Bank Savings",
    ppf_desc: "Tax-Free Govt Scheme", interest_desc: "Simple Loan Interest",
    monthly_invest: "Monthly Investment (₹)", yearly_invest: "Yearly Investment (₹)", invest_amt: "Investment Amount (₹)",
    time_period: "Time Period (Years)", exp_ratio: "Expense Ratio (%)", return_rate: "Exp. Return Rate (% p.a)",
    ppf_info: "PPF uses fixed Govt rate ~7.1%", projection: "Projection", reset: "Reset",
    pdf_report: "PDF Report", est_tax: "Est. Tax",
    calc_subject: "Projection", calc_share_text: "I calculated my investment return on Orange Finance.",
    analysis_projections: "Investment Analysis & Projections", report_generated: "Report Generated",
    invested: "Invested", wealth_created: "Wealth Created", net_value: "Net Maturity Value",
    calculate: "Calculate", detailed_report: "Detailed Report", share: "Share", generating: "Generating..."
};

const t = (key) => EN_Translations[key] || key;

// --- INDIAN TAX INFO FOR EACH SCHEME (FY 2025-26) ---
const SCHEME_TAX_INFO = {
    sip: {
        name: "SIP (Systematic Investment Plan)",
        section: "Equity Mutual Fund",
        taxRules: [
            { label: "Holding Period for LTCG", value: "> 12 months per unit" },
            { label: "LTCG Tax Rate", value: "12.5% (on gains > ₹1.25L/year)" },
            { label: "STCG Tax Rate", value: "20% (if sold within 12 months)" },
            { label: "Indexation Benefit", value: "Not Available" },
            { label: "TDS", value: "Not applicable on equity MFs" },
        ],
        exemptions: [
            "LTCG up to ₹1,25,000 per financial year is fully exempt from tax",
            "Each SIP installment is treated as a separate purchase — holding period is calculated per unit",
            "No TDS is deducted on equity mutual fund redemptions",
            "Dividend income from MFs is taxable at slab rate under new regime",
        ],
        tip: "💡 Hold your equity SIP units for more than 12 months to qualify for the lower 12.5% LTCG rate instead of 20% STCG."
    },
    lumpsum: {
        name: "Lumpsum Investment",
        section: "Equity Mutual Fund (One-time)",
        taxRules: [
            { label: "Holding for LTCG", value: "> 12 months" },
            { label: "LTCG Tax Rate", value: "12.5% (gains > ₹1.25L)" },
            { label: "STCG Tax Rate", value: "20%" },
            { label: "Indexation Benefit", value: "Not Available" },
            { label: "Surcharge", value: "Applicable based on total income" },
        ],
        exemptions: [
            "First ₹1,25,000 of LTCG in a financial year is completely tax-free",
            "No Section 80C deduction available for equity MF investments",
            "For debt MFs purchased after April 2023, all gains taxed at slab rate",
            "Hybrid funds with >35% equity get LTCG treatment after 24 months",
        ],
        tip: "💡 If holding >12 months, only gains exceeding ₹1.25L are taxed. Strategic harvest gains annually to stay within the exempt limit."
    },
    fd: {
        name: "Fixed Deposit (FD)",
        section: "Income from Other Sources",
        taxRules: [
            { label: "Interest Taxation", value: "Fully taxable at slab rate" },
            { label: "TDS Threshold (< 60 yrs)", value: "₹50,000/year (FY 2025-26)" },
            { label: "TDS Threshold (≥ 60 yrs)", value: "₹1,00,000/year" },
            { label: "TDS Rate (with PAN)", value: "10%" },
            { label: "TDS Rate (without PAN)", value: "20%" },
        ],
        exemptions: [
            "5-Year Tax Saver FD qualifies for Section 80C deduction up to ₹1.5L (Old Regime only)",
            "Senior citizens get ₹50,000 deduction under Section 80TTB on interest income",
            "Submit Form 15G/15H to avoid TDS if total income is below taxable limit",
            "Under New Tax Regime, no Section 80C benefit is available",
            "FD interest is taxed on accrual basis, not on maturity",
        ],
        tip: "💡 If your income is below ₹12L (new regime), submit Form 15G to bank to avoid TDS deduction on FD interest."
    },
    ppf: {
        name: "Public Provident Fund (PPF)",
        section: "EEE — Exempt-Exempt-Exempt",
        taxRules: [
            { label: "Contribution Deduction", value: "Sec 80C up to ₹1.5L/year" },
            { label: "Interest Earned", value: "100% Tax Free" },
            { label: "Maturity Amount", value: "100% Tax Free" },
            { label: "Current Rate (2025-26)", value: "7.1% p.a. compounded yearly" },
            { label: "Lock-in Period", value: "15 years (partial withdrawal from Year 7)" },
        ],
        exemptions: [
            "PPF enjoys EEE (Exempt-Exempt-Exempt) status — no tax at any stage",
            "Investment up to ₹1,50,000/year deductible under Section 80C (Old Regime)",
            "Interest earned is completely exempt under Section 10(11)",
            "Maturity proceeds are fully tax-free regardless of amount",
            "Maximum investment limit: ₹1,50,000 per financial year",
            "Available under both Old and New tax regime (but 80C only in Old Regime)",
        ],
        tip: "💡 PPF is the safest tax-free investment. Even interest is not taxed. Ideal for long-term goals like retirement or child education."
    },
    interest: {
        name: "Simple Interest Calculator",
        section: "Income from Other Sources",
        taxRules: [
            { label: "Interest Income Tax", value: "Taxed at slab rate" },
            { label: "Section 80TTA (Savings)", value: "₹10,000 exempt (< 60 yrs)" },
            { label: "Section 80TTB (Senior)", value: "₹50,000 exempt (≥ 60 yrs)" },
            { label: "TDS Applicability", value: "Based on source of interest" },
            { label: "Reporting", value: "Must declare in ITR" },
        ],
        exemptions: [
            "Interest from savings accounts up to ₹10,000 is exempt under 80TTA for non-seniors",
            "Senior citizens get up to ₹50,000 exemption under 80TTB on all interest",
            "Interest from PPF, Sukanya Samriddhi is fully exempt",
            "Interest from Tax-Free Bonds issued by Govt entities is fully exempt",
        ],
        tip: "💡 Always report all interest income in your ITR. Use Form 15G/H if eligible to prevent TDS deduction."
    }
};

// --- Calculation Logic ---

const calculateSIP = (p, n, r, er = 0) => {
    const netR = r - er;
    const i = netR / 100 / 12;
    const invested = p * n;
    const total = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const returns = total - invested;

    // LTCG: 12.5% on gains exceeding ₹1.25L
    const taxableGains = Math.max(0, returns - 125000);
    const tax = taxableGains * 0.125;

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
    // FD interest taxed at slab rate. Use 10% TDS as estimate
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
    const tax = interest * 0.10;
    return { invested: p, total: p + interest, returns: interest, tax, netTotal: (p + interest) - tax, projections };
};

// --- TAX INFO CARD COMPONENT ---
const TaxInfoCard = ({ toolId }) => {
    const [expanded, setExpanded] = useState(false);
    const info = SCHEME_TAX_INFO[toolId];
    if (!info) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] border border-indigo-100 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-5 flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                        <Scale size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-indigo-700 uppercase tracking-wider leading-tight">Indian Tax Info (FY 2025-26)</p>
                        <p className="text-[10px] text-indigo-400 font-bold mt-0.5">{info.section}</p>
                    </div>
                </div>
                {expanded ? <ChevronUp size={18} className="text-indigo-400" /> : <ChevronDown size={18} className="text-indigo-400" />}
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-2">
                    {/* Tax Rules Grid */}
                    <div className="bg-white rounded-2xl p-4 space-y-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={12} /> Tax Rules
                        </h4>
                        {info.taxRules.map((rule, i) => (
                            <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                <span className="text-slate-500 font-medium">{rule.label}</span>
                                <span className="text-slate-900 font-black text-right">{rule.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Exemptions */}
                    <div className="bg-white rounded-2xl p-4">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShieldCheck size={12} /> Tax Benefits & Exemptions
                        </h4>
                        <ul className="space-y-2">
                            {info.exemptions.map((ex, i) => (
                                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
                                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                    {ex}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro Tip */}
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-[11px] font-medium text-amber-800 leading-relaxed">
                        {info.tip}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

export const CalculatorModal = ({ toolId, onClose, onPrint, onDownload, onShare, isSharing, showToast, t: propT }) => {
    const [data, setData] = useState({ 
        amount: toolId === 'age' ? '' : '5000', 
        duration: toolId === 'age' ? '' : '10', 
        rate: '12', 
        expense_ratio: '1' 
    });
    const [result, setResult] = useState(null);
    const [showDetailed, setShowDetailed] = useState(false);
    const [showProjections, setShowProjections] = useState(false);

    const translate = propT || t;

    const tools = {
        sip: { name: 'SIP Calculator', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 border-blue-100', desc: 'Equity Mutual Fund' },
        lumpsum: { name: 'Lumpsum Calculator', icon: Coins, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'One-time Investment' },
        fd: { name: 'Fixed Deposit', icon: Lock, color: 'text-amber-600 bg-amber-50 border-amber-100', desc: 'Secure Bank Savings' },
        ppf: { name: 'PPF Scheme', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', desc: 'Tax-Free Govt Scheme' },
        interest: { name: 'Interest', icon: Percent, color: 'text-slate-600 bg-slate-50 border-slate-100', desc: 'Simple Loan Interest' },
        age: { name: 'Age Calculator', icon: Calendar, color: 'text-pink-600 bg-pink-50 border-pink-100', desc: 'Birthday & Life Stats' },
    };

    const currentTool = tools[toolId];

    const handleCalculate = () => {
        const p = parseFloat(data.amount);
        const n = parseFloat(data.duration);
        const r = parseFloat(data.rate);
        const er = parseFloat(data.expense_ratio) || 0;

        if (!p && toolId !== 'age') {
            return;
        }

        let res = { invested: 0, total: 0, returns: 0, tax: 0, netTotal: 0, projections: [] };

        switch (toolId) {
            case 'sip':
                res = calculateSIP(p, (n || 10) * 12, r || 12, er);
                break;
            case 'lumpsum':
                res = calculateLumpsum(p, n || 10, r || 12, er);
                break;
            case 'fd':
                res = calculateFD(p, n || 5, r || 6.5);
                break;
            case 'ppf':
                res = calculatePPF(p, n || 15);
                break;
            case 'interest':
                res = calculateSimpleInterest(p, n || 1, r || 10);
                break;
            default:
                break;
        }
        setResult({ ...res, detailed: showDetailed });
    };

    useEffect(() => { 
        setResult(null); 
        if (toolId !== 'age') {
            setData({ amount: '5000', duration: '10', rate: '12', expense_ratio: '1' });
            setTimeout(handleCalculate, 100);
        } else {
            // Default to Year 2000 for Age Calculator
            const defaultDOB = '2000-01-01';
            setData({ amount: defaultDOB, duration: '', rate: '', expense_ratio: '1' });
        }
    }, [toolId]);

    if (!currentTool) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="glass-panel w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] animate-slide-up hide-scrollbar border border-white/10" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="sticky top-0 z-20 bg-[#0B0C10]/95 backdrop-blur-xl p-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl shadow-sm border ${currentTool.color}`}>
                            <currentTool.icon size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">{translate(`tool_${toolId}`)}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{translate(`${toolId}_desc`)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* AGE CALCULATOR — special inline UI */}
                {toolId === 'age' ? (
                    <AgeCalculator 
                        onPrint={onPrint} 
                        translate={translate} 
                        onShare={onShare} 
                        isSharing={isSharing}
                    />
                ) : (
                    <>
                        <div className="p-8 space-y-6">
                            {toolId === 'ppf' && (
                                <div className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-2">
                                    <ShieldCheck size={16} /> {translate('ppf_info')} • EEE Status — Fully Tax Free
                                </div>
                            )}

                            {/* Tax Info Card */}
                            <TaxInfoCard toolId={toolId} />

                            <div className="space-y-4">
                                <div className="group">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                                        {toolId === 'sip' ? translate('monthly_invest') : toolId === 'ppf' ? translate('yearly_invest') : translate('invest_amt')}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={data.amount}
                                            onChange={e => setData({ ...data, amount: e.target.value })}
                                            className="w-full glass-panel input-glow pl-10 pr-4 py-4 font-bold text-white transition-all text-lg"
                                            placeholder="5000"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{translate('time_period')}</label>
                                    <input
                                        type="number"
                                        value={data.duration}
                                        onChange={e => setData({ ...data, duration: e.target.value })}
                                        className="w-full glass-panel input-glow px-6 py-4 font-bold text-white transition-all text-lg"
                                        placeholder={toolId === 'ppf' ? '15' : '5'}
                                    />
                                </div>

                                {(toolId === 'sip' || toolId === 'lumpsum') && (
                                    <div className="group">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{translate('exp_ratio')}</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.expense_ratio}
                                            onChange={e => setData({ ...data, expense_ratio: e.target.value })}
                                            className="w-full glass-panel input-glow px-6 py-4 font-bold text-white transition-all text-lg"
                                            placeholder="1.0"
                                        />
                                    </div>
                                )}

                                {toolId !== 'ppf' && (
                                    <div className="group">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{translate('return_rate')}</label>
                                        <input
                                            type="number"
                                            value={data.rate}
                                            onChange={e => setData({ ...data, rate: e.target.value })}
                                            className="w-full glass-panel input-glow px-6 py-4 font-bold text-white transition-all text-lg"
                                            placeholder={toolId === 'fd' ? '6.5' : '12'}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">{translate('detailed_report')}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetailed(!showDetailed)}
                                    className={`w-12 h-7 rounded-full transition-all relative ${showDetailed ? 'bg-orange-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${showDetailed ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            <button
                                onClick={handleCalculate}
                                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black py-4 rounded-2xl shadow-[0_8px_30px_rgba(249,115,22,0.4)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.6)] active:scale-95 transition-all glass-panel text-lg tracking-tight"
                            >
                                {translate('calculate')}
                            </button>
                        </div>

                        {/* Result */}
                        {result && (
                            <div className="border-t border-slate-100">
                                {/* Gradient Hero Card */}
                                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 relative overflow-hidden">
                                    {/* Decorative circles */}
                                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
                                    <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-0.5">{translate('projection')}</p>
                                                <p className="text-xs text-white/60">{currentTool.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setResult(null)}
                                                className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 hover:text-white/90 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                <RotateCcw size={11} /> Reset
                                            </button>
                                        </div>

                                        {/* Net Value — Hero Number */}
                                        <div className="mb-6">
                                            <p className="text-white/60 text-xs mb-1">{translate('net_value')}</p>
                                            <p className="text-4xl font-bold text-white tracking-tight">₹{Math.round(result.netTotal).toLocaleString('en-IN')}</p>
                                        </div>

                                        {/* Progress Bar — Invested vs Returns */}
                                        {(() => {
                                            const total = result.invested + result.returns;
                                            const invPct = total > 0 ? (result.invested / total) * 100 : 0;
                                            return (
                                                <div>
                                                    <div className="flex justify-between text-[10px] text-white/50 mb-1.5">
                                                        <span>Invested</span>
                                                        <span>Returns</span>
                                                    </div>
                                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all"
                                                            style={{ width: `${invPct}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-white/60 mt-1.5 font-semibold">
                                                        <span>₹{Math.round(result.invested).toLocaleString('en-IN')}</span>
                                                        <span className="text-emerald-400">+₹{Math.round(result.returns).toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Metric Cards Row */}
                                <div className="p-5 sm:p-6 space-y-5">
                                    <div className="grid grid-cols-3 gap-2.5">
                                        <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translate('invested')}</p>
                                            <p className="font-bold text-slate-800 text-sm">₹{Math.round(result.invested).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="bg-emerald-50 rounded-2xl p-3.5 text-center border border-emerald-100">
                                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider mb-1">{translate('wealth_created')}</p>
                                            <p className="font-bold text-emerald-700 text-sm">+₹{Math.round(result.returns).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="bg-rose-50 rounded-2xl p-3.5 text-center border border-rose-100">
                                            <p className="text-[9px] font-bold text-rose-400 uppercase tracking-wider mb-1">{translate('est_tax')}</p>
                                            <p className="font-bold text-rose-600 text-sm">-₹{Math.round(result.tax).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>

                                    {/* Returns multiplier badge */}
                                    {result.invested > 0 && (
                                        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl px-4 py-3">
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
                                                <TrendingUp size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-orange-500 font-semibold">Total Return</p>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {((result.returns / result.invested) * 100).toFixed(1)}% gain · {(result.netTotal / result.invested).toFixed(2)}x your money
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tax Treatment Summary */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100/60">
                                        <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <IndianRupee size={12} /> Tax Treatment
                                        </h4>
                                        {toolId === 'ppf' ? (
                                            <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                                ✅ EEE Status — Your entire ₹{Math.round(result.netTotal).toLocaleString('en-IN')} is 100% TAX FREE
                                            </div>
                                        ) : toolId === 'sip' || toolId === 'lumpsum' ? (
                                            <div className="space-y-1.5 text-xs">
                                                {[
                                                    ['Total Gains', `₹${Math.round(result.returns).toLocaleString('en-IN')}`, 'text-slate-800'],
                                                    ['LTCG Exempt (₹1.25L)', `-₹${Math.min(Math.round(result.returns), 125000).toLocaleString('en-IN')}`, 'text-emerald-600'],
                                                    ['Taxable @ 12.5%', `₹${Math.max(0, Math.round(result.returns - 125000)).toLocaleString('en-IN')}`, 'text-amber-600'],
                                                    ['Est. LTCG Tax', `₹${Math.round(result.tax).toLocaleString('en-IN')}`, 'text-rose-600 font-bold'],
                                                ].map(([label, val, valColor]) => (
                                                    <div key={label} className="flex justify-between items-center bg-white/70 px-3 py-2 rounded-lg">
                                                        <span className="text-slate-500">{label}</span>
                                                        <span className={valColor}>{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5 text-xs">
                                                {[
                                                    ['Interest Earned', `₹${Math.round(result.returns).toLocaleString('en-IN')}`, 'text-slate-800'],
                                                    ['TDS @ 10% (est.)', `₹${Math.round(result.tax).toLocaleString('en-IN')}`, 'text-rose-600'],
                                                ].map(([label, val, valColor]) => (
                                                    <div key={label} className="flex justify-between items-center bg-white/70 px-3 py-2 rounded-lg">
                                                        <span className="text-slate-500">{label}</span>
                                                        <span className={valColor}>{val}</span>
                                                    </div>
                                                ))}
                                                <p className="text-[10px] text-slate-400 mt-1 italic">* Actual tax depends on income slab</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Year-wise Projections */}
                                    {result.projections?.length > 0 && (
                                        <div>
                                            <button
                                                onClick={() => setShowProjections(!showProjections)}
                                                className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors mb-3"
                                            >
                                                {showProjections ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                {showProjections ? 'Hide' : 'Show'} Year-wise Projections
                                            </button>
                                            {showProjections && (
                                                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="bg-slate-50">
                                                                {['Year', 'Invested', 'Value', 'Growth'].map(h => (
                                                                    <th key={h} className={`p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${h === 'Year' ? 'text-left' : 'text-right'}`}>{h}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {result.projections.map((p, i) => {
                                                                const gain = p.invested > 0 ? (((p.total - p.invested) / p.invested) * 100).toFixed(1) : '0';
                                                                return (
                                                                    <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                                                                        <td className="p-3 font-semibold text-slate-500">Yr {p.year}</td>
                                                                        <td className="p-3 text-right text-slate-600 tabular-nums">₹{Math.round(p.invested).toLocaleString('en-IN')}</td>
                                                                        <td className="p-3 text-right font-semibold text-slate-900 tabular-nums">₹{Math.round(p.total).toLocaleString('en-IN')}</td>
                                                                        <td className={`p-3 text-right font-semibold tabular-nums ${p.total > p.invested ? 'text-emerald-600' : 'text-slate-400'}`}>+{gain}%</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-1 px-5 pb-4 sm:px-6">
                                        {onDownload && (
                                            <button
                                                onClick={() => onDownload(translate(`tool_${toolId}`), data, result)}
                                                disabled={isSharing}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isSharing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                                {isSharing ? translate('generating') : translate('pdf_report')}
                                            </button>
                                        )}
                                        {onPrint && (
                                            <button
                                                onClick={() => onPrint(translate(`tool_${toolId}`), data, result)}
                                                className="w-14 items-center justify-center bg-white border border-slate-100 hidden sm:flex rounded-2xl text-slate-400 hover:text-slate-600 transition-all font-bold"
                                                title="Print"
                                            >
                                                <Info size={18} />
                                            </button>
                                        )}
                                        {onShare && (
                                            <button
                                                onClick={() => onShare(translate(`tool_${toolId}`), data, result)}
                                                disabled={isSharing}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                {isSharing ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />}
                                                {isSharing ? 'Sharing…' : 'Share'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  AGE CALCULATOR COMPONENT                                            */
/* ------------------------------------------------------------------ */
const ZODIAC = [
    { sign: 'Capricorn', emoji: '♑', from: [12, 22], to: [1, 19] },
    { sign: 'Aquarius', emoji: '♒', from: [1, 20], to: [2, 18] },
    { sign: 'Pisces', emoji: '♓', from: [2, 19], to: [3, 20] },
    { sign: 'Aries', emoji: '♈', from: [3, 21], to: [4, 19] },
    { sign: 'Taurus', emoji: '♉', from: [4, 20], to: [5, 20] },
    { sign: 'Gemini', emoji: '♊', from: [5, 21], to: [6, 20] },
    { sign: 'Cancer', emoji: '♋', from: [6, 21], to: [7, 22] },
    { sign: 'Leo', emoji: '♌', from: [7, 23], to: [8, 22] },
    { sign: 'Virgo', emoji: '♍', from: [8, 23], to: [9, 22] },
    { sign: 'Libra', emoji: '♎', from: [9, 23], to: [10, 22] },
    { sign: 'Scorpio', emoji: '♏', from: [10, 23], to: [11, 21] },
    { sign: 'Sagittarius', emoji: '♐', from: [11, 22], to: [12, 21] },
];

const getZodiac = (month, day) => {
    for (const z of ZODIAC) {
        const [fm, fd] = z.from;
        const [tm, td] = z.to;
        if (fm <= tm) { if (month === fm && day >= fd || month === tm && day <= td) return z; }
        else { if (month === fm && day >= fd || month === tm && day <= td) return z; }
    }
    return ZODIAC[0];
};

const AgeCalculator = ({ onPrint, onShare, isSharing, translate }) => {
    const [dob, setDob] = useState('');
    const [ageData, setAgeData] = useState(null);
    const [now, setNow] = useState(new Date());

    useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

    useEffect(() => {
        if (!dob) { setAgeData(null); return; }
        const birth = new Date(dob);
        if (isNaN(birth) || birth > now) { setAgeData(null); return; }

        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();
        if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }

        const diff = now - birth;
        const totalDays = Math.floor(diff / 86400000);
        const totalWeeks = Math.floor(totalDays / 7);
        const totalHours = Math.floor(diff / 3600000);
        const totalMonths = years * 12 + months;
        const totalSeconds = Math.floor(diff / 1000);

        const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBday <= now) nextBday.setFullYear(now.getFullYear() + 1);
        const daysLeft = Math.ceil((nextBday - now) / 86400000);
        const isBirthday = birth.getDate() === now.getDate() && birth.getMonth() === now.getMonth();
        const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate());

        setAgeData({ years, months, days, totalDays, totalWeeks, totalHours, totalMonths, totalSeconds, daysLeft: isBirthday ? 0 : daysLeft, isBirthday, zodiac, birth });
    }, [dob, now]);

    return (
        <div className="p-6 space-y-5">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Date of Birth</label>
                <input
                    type="date"
                    value={dob}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => setDob(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-semibold text-slate-900 text-base outline-none focus:border-pink-400 focus:bg-white transition-all"
                />
            </div>

            {ageData ? (
                <>
                    {ageData.isBirthday && (
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-2xl text-center font-bold text-sm">
                            🎉 Happy Birthday! Have an amazing day!
                        </div>
                    )}

                    {/* Hero */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400" />
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3">Your Exact Age</p>
                        <div className="flex items-end justify-center gap-4">
                            <div><p className="text-5xl font-black tracking-tight">{ageData.years}</p><p className="text-[9px] text-white/40 uppercase tracking-wider mt-1">Years</p></div>
                            <div className="mb-4 text-white/20 text-2xl">·</div>
                            <div><p className="text-3xl font-bold text-pink-400">{ageData.months}</p><p className="text-[9px] text-white/40 uppercase tracking-wider mt-1">Months</p></div>
                            <div className="mb-4 text-white/20 text-2xl">·</div>
                            <div><p className="text-3xl font-bold text-pink-300">{ageData.days}</p><p className="text-[9px] text-white/40 uppercase tracking-wider mt-1">Days</p></div>
                        </div>
                        <p className="text-xs text-white/30 mt-4">
                            Born on {ageData.birth.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {[
                            { label: 'Total Days', value: ageData.totalDays.toLocaleString('en-IN'), color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                            { label: 'Total Weeks', value: ageData.totalWeeks.toLocaleString('en-IN'), color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { label: 'Total Hours', value: ageData.totalHours.toLocaleString('en-IN'), color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                            { label: 'Total Months', value: ageData.totalMonths.toLocaleString('en-IN'), color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                        ].map(({ label, value, color, bg, border }) => (
                            <div key={label} className={`${bg} ${border} border rounded-2xl p-4 text-center`}>
                                <p className={`text-lg font-black ${color} tabular-nums`}>{value}</p>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Birthday + Zodiac */}
                    <div className="flex gap-2.5">
                        <div className="flex-1 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-rose-500">{ageData.isBirthday ? '🎂' : ageData.daysLeft}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{ageData.isBirthday ? "Today!" : 'Days to Birthday'}</p>
                        </div>
                        <div className="flex-1 bg-violet-50 border border-violet-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl">{ageData.zodiac.emoji}</p>
                            <p className="text-sm font-bold text-violet-700 mt-0.5">{ageData.zodiac.sign}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Zodiac Sign</p>
                        </div>
                    </div>

                    {/* Live seconds */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Seconds alive ⏱️</span>
                        <span className="text-sm font-black text-slate-800 tabular-nums font-mono">{ageData.totalSeconds.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Age Actions */}
                    <div className="flex gap-2.5 pt-2 mb-4">
                        <button
                            onClick={() => onPrint?.('Age Report', { 'Date of Birth': dob }, ageData)}
                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={16} /> Print Report
                        </button>
                        <button
                            onClick={() => onShare?.('Age Report', { 'Date of Birth': dob }, ageData)}
                            disabled={isSharing}
                            className="w-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                        >
                            {isSharing ? <Loader2 size={18} className="animate-spin text-orange-500" /> : <Share2 size={18} />}
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-10">
                    <div className="text-5xl mb-3">🎂</div>
                    <p className="text-sm font-semibold text-slate-400 font-outfit">Enter your date of birth above</p>
                    <p className="text-xs text-slate-300 mt-1 font-outfit">See your exact age, zodiac, next birthday & more</p>
                </div>
            )}
        </div>
    );
};
