import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Primitives';

export const StatCard = ({ label, value, type, icon: Icon }) => (
    <Card className="hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{label}</span>
            <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-50 text-emerald-500' :
                    type === 'expense' ? 'bg-rose-50 text-rose-500' :
                        'bg-blue-50 text-blue-500'
                }`}>
                <Icon size={16} />
            </div>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            ₹ {value.toLocaleString()}
        </h2>
    </Card>
);
