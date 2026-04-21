import React from 'react';

/* ================================================================== */
/*  HELPERS                                                             */
/* ================================================================== */
const fmt = (v) => `₹${Math.round(v || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDay = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/* ================================================================== */
/*  INLINE PRINT STYLES                                                 */
/* ================================================================== */
export const PrintStyles = () => (
    <style>{`
        /* Fonts are preloaded in index.html (already cached) */
        @page { size: A4 portrait; margin: 0; }

        #print-root *, #print-root-export *, #print-root-temp * {
            font-family: 'Outfit', -apple-system, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
        }
        #print-root h1, #print-root h2, #print-root h3,
        #print-root-export h1, #print-root-export h2, #print-root-export h3,
        .mont { font-family: 'Outfit', sans-serif !important; }

        .print-page {
            width: 210mm;
            padding: 12mm 14mm;
            background: #fff;
            position: relative;
        }
        .pg-break { page-break-after: always; break-after: page; }
        .no-break  { page-break-inside: avoid; break-inside: avoid; }

        /* Shared gradient */
        .grad-orange { background: linear-gradient(135deg,#f97316 0%,#ec4899 100%); }
        .grad-dark   { background: linear-gradient(135deg,#0f172a 0%,#1e293b 100%); }
    `}</style>
);

/* ================================================================== */
/*  SHARED: PAGE HEADER                                                 */
/* ================================================================== */
const PageHeader = ({ user, subtitle, page, totalPages }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderBottom: '2px solid #0f172a', paddingBottom: 14, marginBottom: 24
    }}>
        {/* Brand */}
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                <div style={{
                    width: 30, height: 30, background: 'linear-gradient(135deg,#f97316,#ec4899)',
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <span style={{ color: 'white', fontSize: 13, fontWeight: 900 }}>₹</span>
                </div>
                <span className="mont" style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.035em' }}>
                    Orange Finance
                </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                    background: '#fff7ed', color: '#ea580c', fontSize: 8, fontWeight: 800,
                    padding: '2px 9px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>
                    {subtitle}
                </span>
                {page && (
                    <span style={{ color: '#cbd5e1', fontSize: 8, fontWeight: 600 }}>
                        Page {page} of {totalPages}
                    </span>
                )}
            </div>
        </div>
        {/* User meta */}
        <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 8, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
                Prepared for
            </p>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                {user?.user_metadata?.full_name || 'Investor'}
            </p>
            <p style={{ fontSize: 9, color: '#64748b' }}>{fmtDay(new Date())}</p>
        </div>
    </div>
);

/* ================================================================== */
/*  SHARED: PAGE FOOTER                                                 */
/* ================================================================== */
// Inline footers instead of absolute so it doesn't overlap text when flowing naturally
const PageFooter = () => (
    <div style={{
        marginTop: 40,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid #e2e8f0', paddingTop: 10
    }}>
        <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>
            Orange Finance · Generated automatically
        </span>
        <span style={{ fontSize: 8, color: '#cbd5e1', fontWeight: 600 }}>
            orangefin.com
        </span>
    </div>
);

/* ================================================================== */
/*  CALCULATOR REPORT  (2 pages)                                        */
/* ================================================================== */
export const CalculatorReport = ({ data, user }) => {
    if (!data) return null;
    const { toolName, inputs, result } = data;

    const netTotal = result.netTotal || 0;
    const invested = result.invested || 0;
    const returns = result.returns || 0;
    const tax = result.tax || 0;
    const projs = result.projections || [];

    const multiplier = invested > 0 ? (netTotal / invested).toFixed(2) : '—';
    const gainPct = invested > 0 ? ((returns / invested) * 100).toFixed(1) : '0';
    const invPct = (invested + returns) > 0 ? (invested / (invested + returns) * 100) : 50;
    const retPct = 100 - invPct;

    // Tool-specific tax label
    const isPPF = toolName?.toLowerCase().includes('ppf');
    const isEquity = toolName?.toLowerCase().includes('sip') || toolName?.toLowerCase().includes('lumpsum');

    /* ── Page 1 ──────────────────────────────────────────────── */
    return (
        <>
            <div className="print-page" style={{ paddingBottom: '30mm' }}>
                <PrintStyles />
                <PageHeader user={user} subtitle="Investment Report" page={1} totalPages={2} />

                {/* Tool name eyebrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 4, height: 16, background: '#f97316', borderRadius: 4 }} />
                    <p style={{
                        fontSize: 10, color: '#f97316', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.15em'
                    }}>
                        {toolName} Analysis
                    </p>
                </div>
                
                <h1 className="mont" style={{
                    fontSize: 32, fontWeight: 900, color: '#0f172a',
                    letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 24
                }}>
                    Projection Summary
                </h1>

                {/* ── PREMIUM HERO DARK CARD ──────────── */}
                <div className="no-break" style={{
                    background: '#0f172a', borderRadius: 24, padding: '32px',
                    marginBottom: 24, position: 'relative', overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}>
                    {/* Brand Watermark */}
                    <div style={{ 
                        position: 'absolute', top: -30, right: -20, fontSize: 120, 
                        fontWeight: 900, color: 'rgba(255,255,255,0.02)', pointerEvents: 'none' 
                    }}>
                        FIN
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 24, marginBottom: 28 }}>
                            {/* Maturity Card */}
                            <div style={{ 
                                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                                borderRadius: 16, padding: '20px'
                            }}>
                                <p style={{ fontSize: 9, color: '#fdb777', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Net Maturity Value</p>
                                <p className="mont" style={{ fontSize: 28, fontWeight: 950, color: 'white', letterSpacing: '-0.02em' }}>{fmt(netTotal)}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#f97316', color: 'white' }}>High Growth</span>
                                    {tax > 0 && <span style={{ fontSize: 8, color: '#fca5a5', fontWeight: 600 }}>Net after tax</span>}
                                </div>
                            </div>

                            {/* Invested */}
                            <div style={{ padding: '8px 4px' }}>
                                <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Total Capital</p>
                                <p className="mont" style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>{fmt(invested)}</p>
                                <p style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Principal amount</p>
                            </div>

                            {/* Returns */}
                            <div style={{ padding: '8px 4px' }}>
                                <p style={{ fontSize: 9, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Wealth Gain</p>
                                <p className="mont" style={{ fontSize: 22, fontWeight: 900, color: '#34d399' }}>+{fmt(returns)}</p>
                                <p style={{ fontSize: 10, color: '#10b981', fontWeight: 700, marginTop: 4 }}>{gainPct}% ROI</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#f97316' }} />
                                        <span style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 600 }}>Principal ({invPct.toFixed(0)}%)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#34d399' }} />
                                        <span style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 600 }}>Profit ({retPct.toFixed(0)}%)</span>
                                    </div>
                                </div>
                                <span style={{ fontSize: 9, color: '#64748b', fontWeight: 800 }}>FUNDING RATIO</span>
                            </div>
                            <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', display: 'flex' }}>
                                <div style={{ width: `${invPct}%`, height: '100%', background: '#f97316' }} />
                                <div style={{ width: `${retPct}%`, height: '100%', background: '#34d399' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16, marginBottom: 24 }}>
                    {/* Left: Inputs */}
                    <div className="no-break" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, padding: '24px' }}>
                        <h3 style={{ fontSize: 10, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Input Parameters</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {Object.entries(inputs).map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                                    <span className="mont" style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Insights */}
                    <div className="no-break" style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 20, padding: '24px' }}>
                        <h3 style={{ fontSize: 10, fontWeight: 900, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Investment Insights</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ background: 'white', borderRadius: 12, padding: '12px 16px', border: '1px solid #dee5ff' }}>
                                <p style={{ fontSize: 9, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>WEALTH MULTIPLIER</p>
                                <p className="mont" style={{ fontSize: 24, fontWeight: 950, color: '#0f172a' }}>{multiplier}× <span style={{ fontSize: 12, color: '#10b981' }}>Total Assets</span></p>
                            </div>
                            <div style={{ background: 'white', borderRadius: 12, padding: '12px 16px', border: '1px solid #dee5ff' }}>
                                <p style={{ fontSize: 9, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>MONTHLY AVG GROWTH</p>
                                <p className="mont" style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{fmt(returns / (inputs['Duration (Years)'] * 12 || 120))}/mo</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                    <p style={{ fontSize: 8, color: '#92400e', lineHeight: 1.5 }}>
                        **Disclaimer:** This report is for informational purposes. Market investments are subject to risk. Returns projected are estimated based on your inputs and do not guarantee future performance. Tax estimates follow FY 2025-26 guidelines.
                    </p>
                </div>

                <PageFooter />
            </div>

            {/* ── PAGE 2 — Year-wise Analysis ──────────────────────── */}
            <div className="print-page pg-break" style={{ paddingBottom: '20mm' }}>
                <PageHeader user={user} subtitle="Yearly Breakdown" page={2} totalPages={2} />
                
                <h2 className="mont" style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: 16 }}>
                    Growth Trajectory
                </h2>

                {/* Section label */}
                <p style={{
                    fontSize: 8, color: '#f97316', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.15em', marginBottom: 12
                }}>
                    Compounding at work — {gainPct}% total returns · {multiplier}× multiplier
                </p>

                {/* Projections table */}
                {projs.length > 0 ? (
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                            <thead>
                                <tr style={{ background: '#0f172a' }}>
                                    {['Year', 'Invested (₹)', 'Profit / Returns (₹)', 'Growth %', 'Total Value (₹)'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '10px 13px',
                                            textAlign: i === 0 ? 'left' : 'right',
                                            fontSize: 8, fontWeight: 800, color: '#94a3b8',
                                            textTransform: 'uppercase', letterSpacing: '0.08em'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {projs.map((p, i) => {
                                    const profit = p.total - p.invested;
                                    const growthPct = p.invested > 0 ? ((profit / p.invested) * 100).toFixed(1) : '0';
                                    return (
                                        <tr key={i} style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            background: i % 2 === 0 ? 'white' : '#fafafa'
                                        }}>
                                            <td style={{
                                                padding: '8px 13px', fontWeight: 700,
                                                color: '#374151', fontSize: 11
                                            }}>
                                                Year {p.year}
                                            </td>
                                            <td style={{
                                                padding: '8px 13px', textAlign: 'right',
                                                color: '#64748b', fontFamily: 'monospace'
                                            }}>
                                                {fmt(p.invested)}
                                            </td>
                                            <td style={{
                                                padding: '8px 13px', textAlign: 'right',
                                                color: '#10b981', fontWeight: 700,
                                                fontFamily: 'monospace'
                                            }}>
                                                +{fmt(profit)}
                                            </td>
                                            <td style={{ padding: '8px 13px', textAlign: 'right' }}>
                                                <span style={{
                                                    fontSize: 9, fontWeight: 700, padding: '2px 7px',
                                                    borderRadius: 99,
                                                    background: profit > 0 ? '#ecfdf5' : '#f1f5f9',
                                                    color: profit > 0 ? '#065f46' : '#64748b'
                                                }}>
                                                    +{growthPct}%
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '8px 13px', textAlign: 'right',
                                                fontWeight: 900, color: '#0f172a', fontSize: 12,
                                                fontFamily: 'monospace'
                                            }}>
                                                {fmt(p.total)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Summary footer */}
                            <tfoot>
                                <tr style={{ background: '#f97316' }}>
                                    <td colSpan={2} style={{
                                        padding: '10px 13px', fontSize: 9,
                                        fontWeight: 800, color: 'white'
                                    }}>
                                        Final Maturity
                                    </td>
                                    <td style={{
                                        padding: '10px 13px', textAlign: 'right',
                                        fontWeight: 800, color: 'white', fontSize: 10
                                    }}>
                                        +{fmt(returns)} profit
                                    </td>
                                    <td style={{
                                        padding: '10px 13px', textAlign: 'right',
                                        fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontSize: 9
                                    }}>
                                        {gainPct}%
                                    </td>
                                    <td style={{
                                        padding: '10px 13px', textAlign: 'right',
                                        fontWeight: 900, color: 'white', fontSize: 14
                                    }}>
                                        {fmt(netTotal)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                        <p style={{ fontSize: 12 }}>No year-wise projections available for this tool.</p>
                    </div>
                )}

                {/* Key takeaways */}
                <div className="no-break" style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 12, marginTop: 20
                }}>
                    {[
                        { label: 'Total Invested', value: fmt(invested), color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
                        { label: 'Wealth Created', value: `+${fmt(returns)}`, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
                        { label: 'Net Maturity', value: fmt(netTotal), color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
                    ].map(({ label, value, color, bg, border }) => (
                        <div key={label} style={{
                            background: bg, border: `1px solid ${border}`,
                            borderRadius: 12, padding: '12px 14px', textAlign: 'center'
                        }}>
                            <p style={{
                                fontSize: 8, fontWeight: 700, color, textTransform: 'uppercase',
                                letterSpacing: '0.1em', marginBottom: 4
                            }}>{label}</p>
                            <p className="mont" style={{
                                fontSize: 16, fontWeight: 900, color: '#0f172a',
                                letterSpacing: '-0.02em'
                            }}>{value}</p>
                        </div>
                    ))}
                </div>

                <PageFooter page={2} total={2} />
            </div>
        </>
    );
};

/* ================================================================== */
/*  ANALYTICS CATEGORY BREAKDOWN                                        */
/* ================================================================== */
const CategoryBreakdown = ({ transactions, type }) => {
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
        <div style={{
            background: bg, border: `1px solid ${border}`, borderRadius: 14,
            padding: '14px 16px'
        }} className="no-break">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                <div style={{ width: 3, height: 14, background: barColor, borderRadius: 4 }} />
                <span style={{
                    fontSize: 8, fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.12em', color: textColor
                }}>
                    {isIncome ? 'Income' : 'Expense'} Breakdown
                </span>
            </div>
            {sorted.map(([name, val], i) => {
                const pct = total > 0 ? (val / total) * 100 : 0;
                return (
                    <div key={i} style={{ marginBottom: 9 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#374151' }}>{name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: textColor }}>
                                {fmt(val)}{' '}
                                <span style={{ color: '#9ca3af', fontWeight: 400 }}>({pct.toFixed(0)}%)</span>
                            </span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(0,0,0,0.07)', borderRadius: 99 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99 }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ================================================================== */
/*  ANALYTICS REPORT  (2 pages)                                         */
/* ================================================================== */
export const AnalyticsReport = ({ user, stats, transactions, filterLabel }) => (
    <>
        {/* Single flowing page */}
        <div className="print-page" style={{ paddingBottom: '10mm' }}>
            <PrintStyles />
            <PageHeader user={user} subtitle="Financial Report" />

            {/* Filter label */}
            {filterLabel && (
                <p style={{
                    fontSize: 9, color: '#f97316', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.15em', marginBottom: 4
                }}>
                    Period: {filterLabel}
                </p>
            )}
            <h1 className="mont" style={{
                fontSize: 26, fontWeight: 900, color: '#0f172a',
                letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 22
            }}>
                Spending Analysis
            </h1>

            {/* 3 Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}
                className="no-break">
                {[
                    { label: 'Net Balance', value: stats.balance, color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
                    { label: 'Total Income', value: stats.income, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
                    { label: 'Total Expense', value: stats.expense, color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3' },
                ].map(({ label, value, color, bg, border }) => (
                    <div key={label} style={{
                        background: bg, border: `1px solid ${border}`,
                        borderRadius: 14, padding: '14px 16px'
                    }} className="no-break">
                        <p style={{
                            fontSize: 8, fontWeight: 800, color, textTransform: 'uppercase',
                            letterSpacing: '0.12em', marginBottom: 5
                        }}>{label}</p>
                        <p className="mont" style={{
                            fontSize: 20, fontWeight: 900, color: '#0f172a',
                            letterSpacing: '-0.03em'
                        }}>
                            {fmt(Math.abs(value))}
                        </p>
                        {value < 0 && <p style={{ fontSize: 8, color: '#f43f5e', fontWeight: 600, marginTop: 2 }}>Deficit</p>}
                    </div>
                ))}
            </div>

            {/* Savings Rate + Count */}
            {stats.income > 0 && (
                <div className="no-break" style={{
                    background: '#0f172a', borderRadius: 14, padding: '14px 18px', marginBottom: 20,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <p style={{
                            fontSize: 8, color: '#64748b', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.12em', marginBottom: 2
                        }}>Savings Rate</p>
                        <p className="mont" style={{
                            fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em',
                            color: stats.balance >= 0 ? '#34d399' : '#f87171'
                        }}>
                            {((stats.balance / stats.income) * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p style={{
                            fontSize: 8, color: '#64748b', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.12em', marginBottom: 2
                        }}>Expense Ratio</p>
                        <p className="mont" style={{
                            fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em',
                            color: '#f87171'
                        }}>
                            {stats.income > 0 ? ((stats.expense / stats.income) * 100).toFixed(1) : '0'}%
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{
                            fontSize: 8, color: '#64748b', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2
                        }}>
                            Transactions
                        </p>
                        <p className="mont" style={{
                            fontSize: 22, fontWeight: 900, color: 'white',
                            letterSpacing: '-0.03em'
                        }}>
                            {transactions.length}
                        </p>
                    </div>
                </div>
            )}

            {/* Category Breakdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}
                className="no-break">
                <CategoryBreakdown transactions={transactions} type="income" />
                <CategoryBreakdown transactions={transactions} type="expense" />
            </div>

            {/* Transactions Section */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #e2e8f0'
            }}>
                <h2 className="mont" style={{
                    fontSize: 16, fontWeight: 900, color: '#0f172a',
                    letterSpacing: '-0.03em', margin: 0
                }}>
                    Transaction Log
                </h2>
                <span style={{
                    fontSize: 8, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    {filterLabel || 'All Time'} · {transactions.length} records
                </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                <thead>
                    <tr style={{ background: '#0f172a' }}>
                        {['Date', 'Description', 'Category', 'Type', 'Amount'].map((h, i) => (
                            <th key={h} style={{
                                padding: '9px 12px',
                                textAlign: i >= 4 ? 'right' : 'left',
                                fontSize: 8, fontWeight: 800, color: '#94a3b8',
                                textTransform: 'uppercase', letterSpacing: '0.1em'
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((t, i) => (
                        <tr key={i} style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: i % 2 === 0 ? 'white' : '#fafafa'
                        }}>
                            <td style={{
                                padding: '7px 12px', color: '#64748b', fontWeight: 500,
                                fontSize: 9, whiteSpace: 'nowrap'
                            }}>
                                {fmtDate(t.date)}
                            </td>
                            <td style={{
                                padding: '7px 12px', fontWeight: 600, color: '#0f172a',
                                maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {t.title}
                            </td>
                            <td style={{
                                padding: '7px 12px', fontSize: 8, color: '#64748b',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                {t.category}
                            </td>
                            <td style={{ padding: '7px 12px' }}>
                                <span style={{
                                    fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                                    background: t.type === 'income' ? '#ecfdf5' : '#fff1f2',
                                    color: t.type === 'income' ? '#065f46' : '#881337',
                                    textTransform: 'uppercase', letterSpacing: '0.06em'
                                }}>
                                    {t.type}
                                </span>
                            </td>
                            <td style={{
                                padding: '7px 12px', textAlign: 'right', fontWeight: 800,
                                color: t.type === 'income' ? '#10b981' : '#f43f5e',
                                fontSize: 11, fontFamily: 'monospace'
                            }}>
                                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                        <td colSpan={4} style={{
                            padding: '9px 12px', fontSize: 9,
                            fontWeight: 800, color: '#374151'
                        }}>
                            Net Balance
                        </td>
                        <td style={{
                            padding: '9px 12px', textAlign: 'right', fontSize: 13,
                            fontWeight: 900, fontFamily: 'monospace',
                            color: stats.balance >= 0 ? '#10b981' : '#f43f5e'
                        }}>
                            {stats.balance >= 0 ? '+' : ''}{fmt(stats.balance)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <PageFooter />
        </div>
    </>
);

/* ================================================================== */
/*  ROOT EXPORT                                                         */
/* ================================================================== */
export const PrintView = ({ user, stats, transactions, filterLabel, calculatorData, isPrinting }) => (
    <div id="print-root" className={isPrinting ? 'print-active' : 'print-only'} style={{ fontFamily: "'Outfit', sans-serif" }}>
        {calculatorData
            ? <CalculatorReport data={calculatorData} user={user} />
            : <AnalyticsReport user={user} stats={stats} transactions={transactions} filterLabel={filterLabel} />
        }
    </div>
);
