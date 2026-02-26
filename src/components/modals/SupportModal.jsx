import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Coffee, Zap, Star, ArrowRight, Sparkles } from 'lucide-react';
import { handlePayment } from '../../utils/razorpay';

const TIERS = [
    { amt: 49, label: 'Coffee', emoji: '☕', desc: 'Buy us a coffee', color: 'amber', gradient: 'from-amber-400 to-orange-400' },
    { amt: 199, label: 'Supporter', emoji: '⚡', desc: 'Keep the lights on', color: 'blue', gradient: 'from-blue-400 to-indigo-500', popular: true },
    { amt: 499, label: 'Champion', emoji: '🌟', desc: 'You\'re a hero!', color: 'violet', gradient: 'from-violet-500 to-purple-600' },
];

export const SupportModal = ({ isOpen, onClose, user }) => {
    const [customAmount, setCustomAmount] = useState('');
    const [selected, setSelected] = useState(199);
    const [loading, setLoading] = useState(false);

    const donate = async (amt) => {
        if (!amt || amt < 1) return;
        setLoading(true);
        handlePayment({
            amount: amt,
            user,
            onSuccess: () => {
                localStorage.setItem(`donated_${user?.id}`, 'true');
                setLoading(false);
                onClose();
            },
            onError: () => {
                setLoading(false);
                alert('Payment canceled or failed. Please try again.');
            },
        });
    };

    if (!isOpen) return null;

    const finalAmt = customAmount ? parseInt(customAmount) : selected;

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
                className="w-full sm:max-w-md bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 sm:hidden">
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
                <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-rose-400 to-pink-500" />

                <div className="px-6 pb-8 pt-6 sm:px-8 sm:pb-10">
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

                    {/* Donate Button */}
                    <button
                        onClick={() => donate(finalAmt)}
                        disabled={loading || !finalAmt || finalAmt < 1}
                        className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Heart size={16} className="fill-white" />
                        {loading ? 'Opening Payment…' : `Donate ₹${finalAmt || '—'}`}
                        {!loading && <ArrowRight size={16} />}
                    </button>

                    <p className="text-center text-[10px] text-slate-300 font-medium mt-4">
                        Powered by Razorpay · 100% Secure · No subscription
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};
