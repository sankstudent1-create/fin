import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Card = ({ children, className, ...props }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className={cn("bg-white p-6 rounded-[2rem] border border-orange-50 shadow-sm transition-all", className)}
        {...props}
    >
        {children}
    </motion.div>
);

export const Button = ({ children, className, variant = 'primary', ...props }) => {
    const variants = {
        primary: "bg-gray-900 text-white hover:bg-black",
        orange: "bg-orange-500 text-white hover:bg-orange-600",
        ghost: "bg-gray-50 text-gray-500 hover:bg-gray-100",
        outline: "bg-white border border-gray-200 text-gray-700 hover:border-orange-200 hover:text-orange-500"
    };

    return (
        <button
            className={cn(
                "px-4 py-2 rounded-xl font-bold transition-all scale-hover active:scale-95 disabled:opacity-50",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
