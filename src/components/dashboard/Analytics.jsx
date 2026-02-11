import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';

export const AnalyticsDashboard = ({ transactions, type = 'monthly' }) => {
    // Colors inspired by the FinTech premium aesthetic
    const COLORS = ['#10b981', '#f43f5e', '#0ea5e9', '#f59e0b', '#8b5cf6', '#64748b'];
    const INCOME_COLOR = '#10b981'; // emerald-500
    const EXPENSE_COLOR = '#f43f5e'; // rose-500

    const barData = useMemo(() => {
        // Last 14 days for more "indepth" view
        const data = [];
        for (let i = 13; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayTxs = transactions.filter(t => t.date && t.date.startsWith(dateStr));
            const income = dayTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const expense = dayTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

            data.push({
                name: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                income,
                expense
            });
        }
        return data;
    }, [transactions]);

    const pieData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const grouped = {};
        expenses.forEach(t => {
            grouped[t.category] = (grouped[t.category] || 0) + t.amount;
        });

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [transactions]);

    const incomeBySource = useMemo(() => {
        const incomes = transactions.filter(t => t.type === 'income');
        const grouped = {};
        incomes.forEach(t => {
            grouped[t.category] = (grouped[t.category] || 0) + t.amount;
        });

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const [hasMounted, setHasMounted] = React.useState(false);
    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return <div className="space-y-8 h-full animate-pulse"><div className="h-64 bg-slate-100 rounded-[2.5rem]"></div></div>;

    return (
        <div className="space-y-8 h-full">
            {/* Cashflow Momentum - Bar Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/50 shadow-sm"
            >
                <div className="mb-6">
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Cashflow Momentum</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inflow vs Outflow • Last 14 Days</p>
                </div>
                <div className="h-64 w-full min-h-[256px]">
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc', radius: 8 }}
                                contentStyle={{
                                    borderRadius: '1.5rem',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                                itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                            />
                            <Bar dataKey="income" name="Inflow" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} barSize={15} />
                            <Bar dataKey="expense" name="Outflow" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Outflow Segmentation - Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/50 shadow-sm"
                >
                    <div className="mb-6">
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Expense Split</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Top Outflow Categories</p>
                    </div>
                    <div className="h-64 w-full min-h-[256px]">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius="60%"
                                        outerRadius="80%"
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        formatter={(val) => <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider ml-1">{val}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                <p className="text-xs font-black uppercase">No Data Available</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Inflow Analysis */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/50 shadow-sm"
                >
                    <div className="mb-6">
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Income Sources</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Inflow Distribution</p>
                    </div>
                    <div className="space-y-4 max-h-[256px] overflow-y-auto pr-2 custom-scrollbar">
                        {incomeBySource.length > 0 ? incomeBySource.map((item, i) => {
                            const totalIncome = incomeBySource.reduce((acc, curr) => acc + curr.value, 0);
                            const percent = (item.value / totalIncome) * 100;
                            return (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tighter">
                                        <span className="text-slate-700">{item.name}</span>
                                        <span className="text-emerald-600">₹{item.value.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            className="h-full bg-emerald-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-300">
                                <p className="text-xs font-black uppercase">No Income Records</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
