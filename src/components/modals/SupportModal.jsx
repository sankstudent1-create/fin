import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, ArrowRight } from 'lucide-react';
import { handlePayment } from '../../utils/razorpay';

export const SupportModal = ({ isOpen, onClose, user }) => {
    const [customAmount, setCustomAmount] = useState('');

    const donate = async (amt) => {
        handlePayment({
            amount: amt,
            user: user,
            onSuccess: () => {
                localStorage.setItem(`donated_${user.id}`, 'true');
                onClose();
            },
            onError: (err) => {
                alert("Payment canceled or failed.");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="max-w-xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                </button>

                <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                        <Heart size={40} className="text-orange-500 fill-orange-500" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">Support Our Mission</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-10">
                        Fin by Swinfosystems is built with love. Support us to keep the servers running and features coming!
                        <br /><span className="text-xs uppercase tracking-widest text-orange-400 font-bold mt-2 block">Powered by Agriwadi</span>
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[100, 500, 1000].map(amt => (
                            <button
                                key={amt}
                                onClick={() => donate(amt)}
                                className="bg-slate-50 hover:bg-orange-500 hover:text-white border-2 border-slate-100 hover:border-orange-400 p-6 rounded-2xl transition-all group"
                            >
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50 group-hover:opacity-100">Tier {amt === 100 ? 'I' : amt === 500 ? 'II' : 'III'}</p>
                                <p className="text-2xl font-black italic">₹{amt}</p>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <input
                            type="number"
                            placeholder="Custom Amount..."
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold focus:border-orange-200 outline-none"
                        />
                        <button
                            onClick={() => customAmount && donate(parseInt(customAmount))}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                        >
                            GO <ArrowRight size={18} />
                        </button>
                    </div>

                    <button onClick={onClose} className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">
                        Maybe Later
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
