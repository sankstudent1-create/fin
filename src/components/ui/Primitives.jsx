
import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-95",
        secondary: "bg-white text-slate-900 border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50",
        danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100",
        ghost: "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 ${className}`} {...props}>
            {children}
        </div>
    );
};
