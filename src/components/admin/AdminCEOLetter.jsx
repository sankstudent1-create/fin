import React from 'react';

export const AdminCEOLetter = ({ user, stats, customMessage }) => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div style={{ padding: '40px', background: '#ffffff', color: '#1e293b', fontFamily: 'Arial, sans-serif', width: '210mm', minHeight: '297mm', position: 'relative', boxSizing: 'border-box' }}>
            {/* Header / Letterpad Branding */}
            <div style={{ borderBottom: '2px solid #f97316', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a', fontWeight: '900', letterSpacing: '-1px' }}>Orange<span style={{ color: '#f97316' }}>Finance</span></h1>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Official Administrative Communication</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#64748b' }}>Orange Finance Headquarters</p>
                    <p style={{ margin: 0 }}>Global Tech Park, Block B</p>
                    <p style={{ margin: 0 }}>support@orangefinance.com</p>
                    <p style={{ margin: 0, marginTop: '4px', fontWeight: 'bold', color: '#0f172a' }}>Date: {today}</p>
                </div>
            </div>

            {/* Content */}
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 2px 0' }}>To: {user.full_name || 'Valued Member'}</p>
                <p style={{ color: '#64748b', margin: '0 0 30px 0' }}>{user.email}</p>

                <h2 style={{ fontSize: '16px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Notice of Account Summary & Performance</h2>

                <p style={{ marginBottom: '15px' }}>Dear {user.full_name || 'Member'},</p>

                <p style={{ marginBottom: '25px', whiteSpace: 'pre-wrap' }}>
                    {customMessage || "We are writing to provide you with an official summary of your financial account performance. At Orange Finance, we believe in complete transparency and empowering our users with actionable insights. Below is an overview of your financial activity."}
                </p>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '25px 20px', margin: '30px 0', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <div>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', margin: '0 0 5px 0' }}>Total Income</p>
                        <p style={{ fontSize: '20px', color: '#10b981', fontWeight: '900', margin: 0 }}>₹{stats?.income?.toLocaleString() || '0'}</p>
                    </div>
                    <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                    <div>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', margin: '0 0 5px 0' }}>Total Expense</p>
                        <p style={{ fontSize: '20px', color: '#f43f5e', fontWeight: '900', margin: 0 }}>₹{stats?.expense?.toLocaleString() || '0'}</p>
                    </div>
                    <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                    <div>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', margin: '0 0 5px 0' }}>Net Balance</p>
                        <p style={{ fontSize: '20px', color: '#0f172a', fontWeight: '900', margin: 0 }}>₹{stats?.balance?.toLocaleString() || '0'}</p>
                    </div>
                </div>

                <p style={{ marginBottom: '15px' }}>Please review these figures to ensure they align with your personal records. Our continuous commitment is to ensure the absolute integrity and security of your financial data.</p>
                <p>If you require any assistance, our dedicated support team is available to help you immediately. Thank you for choosing Orange Finance.</p>
            </div>

            {/* Footer / Signature */}
            <div style={{ marginTop: '80px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Sincerely,</p>
                {/* Auto Generated Sign */}
                <div style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive", fontSize: '38px', color: '#0f172a', marginBottom: '5px', transform: 'rotate(-2deg)' }}>
                    SvkWanve
                </div>
                <p style={{ margin: 0, fontWeight: '900', fontSize: '13px', color: '#0f172a' }}>Sanket Wanve</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Chief Executive Officer</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#f97316', fontWeight: 'bold' }}>Orange Finance HQ</p>
            </div>

            {/* Watermark */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '120px', color: 'rgba(249, 115, 22, 0.03)', fontWeight: '900', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0 }}>
                ORANGE FINANCE
            </div>
            {/* Confidentially Notice footer */}
            <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '15px', fontSize: '9px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.5' }}>
                This is an officially electronically generated document for the designated member only. It contains sensitive financial information. If you received this in error, please discard immediately.
            </div>
        </div>
    );
};
