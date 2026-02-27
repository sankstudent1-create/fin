import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ArrowRight, QrCode, Smartphone, Copy, Check, ExternalLink, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const UPI_ID = 'agriwadi464881.rzp@icici';
const MERCHANT_NAME = 'Agriwadi - Swinfosystems';
const APP_NAME = 'Orange Finance';

const TIERS = [
    { amt: 49, label: 'Coffee', emoji: '☕', desc: 'Buy us a coffee', gradient: 'from-amber-400 to-orange-400' },
    { amt: 199, label: 'Supporter', emoji: '⚡', desc: 'Keep the lights on', gradient: 'from-blue-400 to-indigo-500', popular: true },
    { amt: 499, label: 'Champion', emoji: '🌟', desc: 'You\'re a hero!', gradient: 'from-violet-500 to-purple-600' },
];

const UPI_APPS = [
    { name: 'Google Pay', scheme: 'tez://upi/', pkg: 'com.google.android.apps.nbu.paisa.user', icon: '💳', color: 'from-blue-500 to-blue-600' },
    { name: 'PhonePe', scheme: 'phonepe://pay', pkg: 'com.phonepe.app', icon: '💜', color: 'from-indigo-500 to-purple-600' },
    { name: 'Paytm', scheme: 'paytmmp://pay', pkg: 'net.one97.paytm', icon: '🔵', color: 'from-sky-400 to-blue-500' },
    { name: 'BHIM', scheme: 'upi://pay', pkg: 'in.org.npci.upiapp', icon: '🇮🇳', color: 'from-orange-500 to-red-500' },
    { name: 'Any UPI App', scheme: 'upi://pay', pkg: null, icon: '📱', color: 'from-slate-600 to-slate-800' },
];

const buildUpiUrl = (amount) => {
    const params = new URLSearchParams({
        pa: UPI_ID,
        pn: MERCHANT_NAME,
        tn: `Support ${APP_NAME}`,
        cu: 'INR',
    });
    if (amount) params.set('am', amount.toString());
    return `upi://pay?${params.toString()}`;
};

export const SupportModal = ({ isOpen, onClose, user }) => {
    const [customAmount, setCustomAmount] = useState('');
    const [selected, setSelected] = useState(199);
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(true);

    const finalAmt = customAmount ? parseInt(customAmount) : selected;
    const upiUrl = useMemo(() => buildUpiUrl(finalAmt), [finalAmt]);

    const handleCopyUPI = () => {
        navigator.clipboard?.writeText(UPI_ID).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleOpenApp = (app) => {
        const params = new URLSearchParams({
            pa: UPI_ID,
            pn: MERCHANT_NAME,
            tn: `Support ${APP_NAME}`,
            cu: 'INR',
        });
        if (finalAmt) params.set('am', finalAmt.toString());

        // Use the generic upi:// scheme for "Any UPI App" or the specific app scheme
        const url = `upi://pay?${params.toString()}`;

        // Try to open via intent on Android
        if (/android/i.test(navigator.userAgent) && app.pkg) {
            const intentUrl = `intent://pay?${params.toString()}#Intent;scheme=upi;package=${app.pkg};end`;
            window.location.href = intentUrl;
        } else {
            window.location.href = url;
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-slate-900/70 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 60, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 60, opacity: 0, scale: 0.97 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="w-full sm:max-w-md bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 sm:hidden shrink-0">
                    <div className="w-10 h-1 bg-slate-200 rounded-full" />
                </div>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 sm:top-6 sm:right-6 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors z-10"
                >
                    <X size={16} />
                </button>

                {/* Hero gradient strip */}
                <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-rose-400 to-pink-500 shrink-0" />

                <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8 sm:pb-10">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Heart size={22} className="text-white fill-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">Support Us</h2>
                            <p className="text-xs text-slate-400 font-medium">Orange Finance by Swinfosystems</p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                        We build this app with ❤️ to help you track every rupee. Your support keeps us going and new features coming!
                    </p>

                    {/* Tier Cards */}
                    <div className="grid grid-cols-3 gap-2.5 mb-5">
                        {TIERS.map(tier => (
                            <button
                                key={tier.amt}
                                onClick={() => { setSelected(tier.amt); setCustomAmount(''); }}
                                className={`relative p-3.5 rounded-2xl border-2 text-center transition-all ${selected === tier.amt && !customAmount
                                    ? 'border-orange-400 bg-orange-50 scale-[1.03] shadow-lg shadow-orange-500/10'
                                    : 'border-slate-100 bg-slate-50/60 hover:border-slate-200'
                                    }`}
                            >
                                {tier.popular && (
                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                        Popular
                                    </span>
                                )}
                                <div className="text-2xl mb-1">{tier.emoji}</div>
                                <p className="text-lg font-bold text-slate-900">₹{tier.amt}</p>
                                <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{tier.desc}</p>
                            </button>
                        ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="flex gap-2.5 mb-6">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
                            <input
                                type="number"
                                placeholder="Custom amount"
                                value={customAmount}
                                onChange={(e) => { setCustomAmount(e.target.value); setSelected(null); }}
                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-orange-300 rounded-xl py-3 pl-8 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* QR Code Section */}
                    {showQR && finalAmt > 0 && (
                        <div className="bg-gradient-to-br from-slate-50 to-orange-50/50 rounded-3xl p-6 mb-5 border border-slate-100">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <QrCode size={16} className="text-orange-500" />
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Scan to Pay ₹{finalAmt}</p>
                            </div>
                            <div className="flex justify-center mb-4">
                                <div className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
                                    <QRCodeSVG
                                        value={upiUrl}
                                        size={180}
                                        level="M"
                                        bgColor="#ffffff"
                                        fgColor="#0f172a"
                                        includeMargin={false}
                                    />
                                </div>
                            </div>
                            {/* UPI ID with copy */}
                            <div className="flex items-center justify-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-100 mx-auto w-fit">
                                <span className="text-xs font-mono font-bold text-slate-600">{UPI_ID}</span>
                                <button
                                    onClick={handleCopyUPI}
                                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Open UPI App Buttons */}
                    <div className="mb-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Or Pay via App</p>
                        <div className="grid grid-cols-3 gap-2">
                            {UPI_APPS.slice(0, 3).map(app => (
                                <button
                                    key={app.name}
                                    onClick={() => handleOpenApp(app)}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all active:scale-95"
                                >
                                    <span className="text-2xl">{app.icon}</span>
                                    <span className="text-[10px] font-bold text-slate-600">{app.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {UPI_APPS.slice(3).map(app => (
                                <button
                                    key={app.name}
                                    onClick={() => handleOpenApp(app)}
                                    className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all active:scale-95"
                                >
                                    <span className="text-lg">{app.icon}</span>
                                    <span className="text-xs font-bold text-slate-600">{app.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Direct UPI Pay Button (opens system UPI picker) */}
                    <a
                        href={upiUrl}
                        className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98] transition-all"
                    >
                        <Smartphone size={16} />
                        Pay ₹{finalAmt || '—'} via UPI
                        <ArrowRight size={16} />
                    </a>

                    {/* Footer */}
                    <div className="flex items-center justify-center gap-2 mt-5">
                        <Shield size={12} className="text-slate-300" />
                        <p className="text-[10px] text-slate-300 font-medium">
                            Payment Partner: Agriwadi · 100% Secure UPI · No subscription
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
