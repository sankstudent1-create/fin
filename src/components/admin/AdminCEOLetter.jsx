import React from 'react';

export const AdminCEOLetter = ({ user, stats, customMessage, subject, includeStats = true, imageUrl }) => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div style={{ padding: '40px', background: '#ffffff', color: '#1e293b', fontFamily: 'Outfit, sans-serif', width: '210mm', minHeight: '297mm', position: 'relative', boxSizing: 'border-box' }}>
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap');`}
            </style>
            {/* Header / Letterpad Branding */}
            <div style={{ borderBottom: '2px solid #f97316', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a', fontWeight: '900', letterSpacing: '-1px' }}>Orange<span style={{ color: '#f97316' }}>Finance</span></h1>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official Administrative Communication</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#64748b' }}>Orange Finance Headquarters</p>
                    <p style={{ margin: 0 }}>Pune, India</p>
                    <p style={{ margin: 0 }}>sanketwanveinfosystems@gmail.com</p>
                    <p style={{ margin: 0, marginTop: '4px', fontWeight: 'bold', color: '#0f172a' }}>Date: {today}</p>
                </div>
            </div>

            {/* Content */}
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 2px 0' }}>To: {user.full_name || 'Valued Member'}</p>
                <p style={{ color: '#64748b', margin: '0 0 30px 0' }}>{user.email}</p>

                <h2 style={{ fontSize: '18px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', fontWeight: '800' }}>
                    {subject || 'Notice of Account Summary & Performance'}
                </h2>

                <p style={{ marginBottom: '15px', fontWeight: '500' }}>Dear {user.full_name || 'Member'},</p>

                <p style={{ marginBottom: '25px', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.7', color: '#475569' }}>
                    {customMessage || "We are writing to provide you with an official summary of your account. Below is an overview of your activity."}
                </p>

                {imageUrl && (
                    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <img src={imageUrl} alt="Campaign Attachment" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', border: '1px solid #e2e8f0', objectFit: 'contain' }} />
                    </div>
                )}

                {includeStats && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px 20px', margin: '30px 0', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                        <div>
                            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>Total Income</p>
                            <p style={{ fontSize: '22px', color: '#10b981', fontWeight: '900', margin: 0 }}>₹{stats?.income?.toLocaleString() || '0'}</p>
                        </div>
                        <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                        <div>
                            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>Total Expense</p>
                            <p style={{ fontSize: '22px', color: '#f43f5e', fontWeight: '900', margin: 0 }}>₹{stats?.expense?.toLocaleString() || '0'}</p>
                        </div>
                        <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                        <div>
                            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>Net Balance</p>
                            <p style={{ fontSize: '22px', color: '#0f172a', fontWeight: '900', margin: 0 }}>₹{stats?.balance?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                )}

                {includeStats && (
                    <p style={{ marginBottom: '15px', fontWeight: '500' }}>Please review these figures to ensure they align with your personal records. Our continuous commitment is to ensure the absolute integrity and security of your financial data.</p>
                )}
                <p style={{ fontWeight: '500' }}>If you require any assistance, our dedicated support team is available to help you immediately. Thank you for choosing Orange Finance.</p>
            </div>

            {/* Footer / Signature */}
            <div style={{ marginTop: '70px', paddingBottom: '40px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '500' }}>Sincerely,</p>
                {/* Auto Generated Sign */}
                <div style={{ fontFamily: "'Alex Brush', cursive", fontSize: '48px', color: '#0f172a', marginBottom: '5px', transform: 'rotate(-4deg)' }}>
                    Sanket
                </div>
                <p style={{ margin: 0, fontWeight: '900', fontSize: '14px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' }}>Sanket</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Chief Executive Officer</p>
                <p style={{ margin: '0 0 30px 0', fontSize: '11px', color: '#f97316', fontWeight: 'bold' }}>Orange Finance HQ</p>
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
