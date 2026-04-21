import React from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const FORMAT_INR = (v) => {
    const n = Math.abs(v || 0);
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
};

const CONFIGS = {
    income: {
        gradient: 'from-amber-400 to-orange-500',
        light: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/20',
        glow: 'rgba(249, 115, 22, 0.15)',
        label: 'Total Income',
    },
    expense: {
        gradient: 'from-rose-400 to-red-500',
        light: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        glow: 'rgba(244, 63, 94, 0.15)',
        label: 'Total Expense',
    },
    balance: {
        gradient: 'from-orange-500 to-rose-500',
        light: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/20',
        glow: 'rgba(249, 115, 22, 0.2)',
        label: 'Net Balance',
    },
};

export const StatCard = ({ label, value = 0, icon: Icon, type = 'balance', onClick }) => {
    const cfg = CONFIGS[type] || CONFIGS.balance;
    const isNeg = value < 0;
    const Trend = type === 'income' ? TrendingUp : type === 'expense' ? TrendingDown : null;

    // Spotlight active glow
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            className={`group relative rounded-3xl glass-panel border-main overflow-hidden p-6 flex flex-col gap-4 cursor-pointer transition-all duration-300`}
        >
            {/* Spotlight Glow Effect on Hover */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            250px circle at ${mouseX}px ${mouseY}px,
                            ${cfg.glow},
                            transparent 80%
                        )
                    `,
                }}
            />

            {/* Icon */}
            <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center bg-gradient-to-br ${cfg.gradient} shadow-[0_0_20px_${cfg.glow}] relative z-10`}>
                <Icon size={22} className="text-white drop-shadow-md" strokeWidth={2.5} />
            </div>

            {/* Value (Uses Space Grotesk via font-mono) */}
            <div className="relative z-10 mt-2">
                <p className="text-xs font-bold text-dim uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className={`font-mono font-bold text-3xl tracking-tight ${isNeg ? 'text-rose-500' : 'text-main drop-shadow-sm'}`}>
                    {isNeg ? '-' : ''}{FORMAT_INR(Math.abs(value))}
                </p>
            </div>

            {/* Trend Badge */}
            {Trend && (
                <div className={`absolute top-6 right-6 p-2 rounded-xl ${cfg.light} backdrop-blur-md border border-main`}>
                    <Trend size={16} className={cfg.text} />
                </div>
            )}
        </motion.div>
    );
};
