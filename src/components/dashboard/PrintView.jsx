import React from 'react';
import { TrendingUp, TrendingDown, PieChart, ShieldCheck, Wallet } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  HELPERS                                                             */
/* ------------------------------------------------------------------ */
const fmt = (v) => `₹${Math.round(v || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/* ------------------------------------------------------------------ */
/*  PRINT-ONLY: @page styles injected via <style>                      */
/* ------------------------------------------------------------------ */
const PrintStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @page {
            size: A4 portrait;
            margin: 0;
        }
        #print-root * {
            font-family: 'Inter', -apple-system, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .pg-break { page-break-after: always; break-after: page; }
        .no-break  { page-break-inside: avoid; break-inside: avoid; }
        .print-page {
            width: 210mm;
            min-height: 297mm;
            padding: 14mm 16mm;
            box-sizing: border-box;
            background: white;
        }
        /* Accent bar on dark card */
        .accent-bar {
            background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
        }
    `}</style>
);

/* ------------------------------------------------------------------ */
/*  ANALYTICS BREAKDOWN                                                 */
/* ------------------------------------------------------------------ */
const CategoryBreakdown = ({ transactions, type, color }) => {
    const filtered = transactions.filter(t => t.type === type);
    const grouped = {};
    filtered.forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + Number(t.amount); });
    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (sorted.length === 0) return null;

    const isIncome = type === 'income';
    const bg = isIncome ? '#ecfdf5' : '#fff1f2';
    const barColor = isIncome ? '#10b981' : '#f43f5e';
    const textColor = isIncome ? '#065f46' : '#881337';
    const border = isIncome ? '#a7f3d0' : '#fecdd3';

    return (
        <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '16px 20px' }} className="no-break">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 4, height: 18, background: barColor, borderRadius: 4 }} />
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: textColor }}>
                    {isIncome ? 'Income' : 'Expense'} Breakdown
                </span>
            </div>
            {sorted.map(([name, val], i) => {
                const pct = total > 0 ? (val / total) * 100 : 0;
                return (
                    <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{name}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: textColor }}>{fmt(val)} <span style={{ color: '#9ca3af', fontWeight: 500 }}>({pct.toFixed(0)}%)</span></span>
                        </div>
                        <div style={{ height: 5, background: '#e5e7eb', borderRadius: 99 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99 }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  CALCULATOR REPORT PAGE                                              */
/* ------------------------------------------------------------------ */
const CalculatorReport = ({ data, user }) => {
    if (!data) return null;
    const { toolName, inputs, result } = data;
    const multiplier = result.invested > 0 ? (result.netTotal / result.invested).toFixed(2) : '—';
    const gainPct = result.invested > 0 ? ((result.returns / result.invested) * 100).toFixed(1) : '0';
    const invPct = (result.invested + result.returns) > 0
        ? (result.invested / (result.invested + result.returns) * 100)
        : 50;

    return (
        <div className="print-page">
            <PrintStyles />

            {/* ── PAGE HEADER ─────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #1e293b', paddingBottom: 16, marginBottom: 28 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#f97316,#ec4899)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontSize: 14, fontWeight: 800 }}>₹</span>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>Orange Finance</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ background: '#fff7ed', color: '#ea580c', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Investment Report</span>
                        <span style={{ color: '#94a3b8', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>FY 2025–26</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Generated for</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{user?.user_metadata?.full_name || 'Investor'}</p>
                    <p style={{ fontSize: 10, color: '#64748b' }}>{fmtDate(new Date())}</p>
                </div>
            </div>

            {/* ── TOOL TITLE ─────────────────────── */}
            <p style={{ fontSize: 11, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Analysis · {toolName}</p>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: 24, lineHeight: 1.1 }}>Projection Summary</h1>

            {/* ── DARK HERO CARD ─────────────────── */}
            <div style={{ background: '#0f172a', borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }} className="no-break">
                {/* Accent bar */}
                <div className="accent-bar" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '20px 20px 0 0' }} />
                {/* Circles */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
                <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(249,115,22,0.08)' }} />

                <div style={{ position: 'relative' }}>
                    {/* Grid — 3 columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
                        <div>
                            <p style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Total Invested</p>
                            <p style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>{fmt(result.invested)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 9, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Wealth Created</p>
                            <p style={{ fontSize: 22, fontWeight: 900, color: '#34d399', letterSpacing: '-0.03em' }}>+{fmt(result.returns)}</p>
                            <p style={{ fontSize: 10, color: '#6ee7b7', marginTop: 2 }}>{gainPct}% total return · {multiplier}× money</p>
                        </div>
                        <div style={{ background: 'rgba(249,115,22,0.15)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(249,115,22,0.25)' }}>
                            <p style={{ fontSize: 9, color: '#fdba74', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Net Maturity Value</p>
                            <p style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>{fmt(result.netTotal)}</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            <span>Invested {invPct.toFixed(0)}%</span>
                            <span>Est. Tax: {fmt(result.tax)}</span>
                            <span>Returns {(100 - invPct).toFixed(0)}%</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${invPct}%`, background: 'linear-gradient(90deg,#f97316,#fbbf24)', borderRadius: 99 }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2-COL: Inputs + Year-wise ─────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }} className="no-break">
                {/* Inputs */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 18px' }}>
                    <p style={{ fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Parameters</p>
                    {Object.entries(inputs).map(([label, val]) => (
                        <div key={label} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 8 }}>
                            <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</p>
                            <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{val}{label.includes('%') ? '%' : ''}</p>
                        </div>
                    ))}
                </div>

                {/* Projections table */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ width: 3, height: 14, background: '#10b981', borderRadius: 4 }} />
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Year-wise Growth</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                {['Year', 'Invested', 'Profit', 'Total Value'].map((h, i) => (
                                    <th key={h} style={{ padding: '8px 12px', textAlign: i === 0 ? 'left' : 'right', fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(result.projections || []).slice(0, 10).map((p, i) => (
                                <tr key={i} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                    <td style={{ padding: '7px 12px', fontWeight: 600, color: '#64748b' }}>Year {p.year}</td>
                                    <td style={{ padding: '7px 12px', textAlign: 'right', color: '#374151' }}>{fmt(p.invested)}</td>
                                    <td style={{ padding: '7px 12px', textAlign: 'right', color: '#10b981', fontWeight: 700 }}>+{fmt(p.total - p.invested)}</td>
                                    <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{fmt(p.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(result.projections?.length || 0) > 10 && (
                        <div style={{ padding: '8px 12px', background: '#f8fafc', fontSize: 9, color: '#94a3b8', fontWeight: 600, textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                            + {result.projections.length - 10} more years
                        </div>
                    )}
                </div>
            </div>

            {/* ── DISCLAIMER ─────────────────────── */}
            <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                <p style={{ fontSize: 9, color: '#92400e', lineHeight: 1.6 }}>
                    <strong>Disclaimer:</strong> This projection is for illustration only. Returns are not guaranteed and depend on market conditions. Tax estimates are based on FY 2025-26 rules. Please consult a registered financial advisor before making investment decisions.
                </p>
            </div>

            {/* ── FOOTER ─────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Generated by Orange Finance · Powered by Swinfosystems</span>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>{fmtDate(new Date())}</span>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  ANALYTICS REPORT PAGE (Classic)                                     */
/* ------------------------------------------------------------------ */
const AnalyticsReport = ({ user, stats, transactions, filterLabel }) => {
    const txByMonth = {};
    transactions.forEach(t => {
        const key = new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (!txByMonth[key]) txByMonth[key] = { income: 0, expense: 0 };
        txByMonth[key][t.type] += Number(t.amount);
    });
    const months = Object.entries(txByMonth).slice(-6);

    return (
        <>
            {/* PAGE 1 — Summary */}
            <div className="print-page">
                <PrintStyles />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 28 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#f97316,#ec4899)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: 'white', fontSize: 14, fontWeight: 800 }}>₹</span>
                            </div>
                            <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>Orange Finance</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ background: '#fff7ed', color: '#ea580c', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Financial Report</span>
                            {filterLabel && <span style={{ color: '#94a3b8', fontSize: 9, fontWeight: 700, padding: '3px 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{filterLabel}</span>}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Prepared for</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{user?.user_metadata?.full_name || 'User'}</p>
                        <p style={{ fontSize: 10, color: '#64748b' }}>{user?.email}</p>
                        <p style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{fmtDate(new Date())}</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }} className="no-break">
                    {[
                        { label: 'Net Balance', value: stats.balance, color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
                        { label: 'Total Income', value: stats.income, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
                        { label: 'Total Expense', value: stats.expense, color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3' },
                    ].map(({ label, value, color, bg, border }) => (
                        <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 18px' }} className="no-break">
                            <p style={{ fontSize: 9, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>{label}</p>
                            <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>{fmt(Math.abs(value))}</p>
                            {value < 0 && <p style={{ fontSize: 9, color: '#f43f5e', fontWeight: 600, marginTop: 2 }}>Deficit</p>}
                        </div>
                    ))}
                </div>

                {/* Saving Rate */}
                {stats.income > 0 && (
                    <div style={{ background: '#0f172a', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-break">
                        <div>
                            <p style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Savings Rate</p>
                            <p style={{ fontSize: 22, fontWeight: 900, color: stats.balance >= 0 ? '#34d399' : '#f87171', letterSpacing: '-0.03em' }}>
                                {stats.income > 0 ? ((stats.balance / stats.income) * 100).toFixed(1) : '0'}%
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 9, color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Transactions Tracked</p>
                            <p style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>{transactions.length}</p>
                        </div>
                    </div>
                )}

                {/* Category Breakdowns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }} className="no-break">
                    <CategoryBreakdown transactions={transactions} type="income" />
                    <CategoryBreakdown transactions={transactions} type="expense" />
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                    <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Orange Finance · Swinfosystems · Confidential</span>
                    <span style={{ fontSize: 9, color: '#94a3b8' }}>Page 1 of 2</span>
                </div>
            </div>

            {/* PAGE 2 — Transactions */}
            <div className="print-page pg-break">
                {/* Mini header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>Transaction Log</h2>
                    <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{filterLabel || 'All Time'}</span>
                </div>

                {/* Transaction table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                        <tr style={{ background: '#0f172a' }}>
                            {['Date', 'Description', 'Category', 'Type', 'Amount'].map((h, i) => (
                                <th key={h} style={{ padding: '10px 12px', textAlign: i >= 4 ? 'right' : 'left', fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                <td style={{ padding: '8px 12px', color: '#64748b', fontWeight: 500, fontSize: 10, whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                                <td style={{ padding: '8px 12px', fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.category}</td>
                                <td style={{ padding: '8px 12px' }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: t.type === 'income' ? '#ecfdf5' : '#fff1f2', color: t.type === 'income' ? '#065f46' : '#881337', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        {t.type}
                                    </span>
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: t.type === 'income' ? '#10b981' : '#f43f5e', fontSize: 12 }}>
                                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                            <td colSpan={4} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 800, color: '#374151' }}>Net Balance</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 14, fontWeight: 900, color: stats.balance >= 0 ? '#10b981' : '#f43f5e' }}>{stats.balance >= 0 ? '+' : ''}{fmt(stats.balance)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 20 }}>
                    <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Orange Finance · Swinfosystems · Confidential</span>
                    <span style={{ fontSize: 9, color: '#94a3b8' }}>Page 2 of 2</span>
                </div>
            </div>
        </>
    );
};

/* ------------------------------------------------------------------ */
/*  ROOT EXPORT                                                         */
/* ------------------------------------------------------------------ */
export const PrintView = ({ user, stats, transactions, filterLabel, calculatorData, isPrinting }) => {
    return (
        <div id="print-root" className={isPrinting ? 'print-active' : 'print-only'}>
            {calculatorData
                ? <CalculatorReport data={calculatorData} user={user} />
                : <AnalyticsReport user={user} stats={stats} transactions={transactions} filterLabel={filterLabel} />
            }
        </div>
    );
};
