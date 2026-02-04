import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export const AnalyticsDashboard = ({ transactions, categories, showOnly = null, t }) => {
    // 1. Prepare Data for Bar Chart (Last 7 days)
    const processDataForBar = () => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dayTxs = transactions.filter(t => t.date && t.date.startsWith(date));
            const income = dayTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const expense = dayTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
            return {
                name: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                income,
                expense
            };
        });
    };

    // 2. Prepare Data for Expense Pie Chart
    const processDataForPie = () => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const grouped = {};
        expenses.forEach(t => {
            grouped[t.category] = (grouped[t.category] || 0) + t.amount;
        });

        return Object.keys(grouped).map(k => ({
            name: k,
            value: grouped[k]
        })).sort((a, b) => b.value - a.value).slice(0, 6);
    };

    // 3. Prepare Data for Income Pie Chart
    const processDataForIncomePie = () => {
        const income = transactions.filter(t => t.type === 'income');
        const grouped = {};
        income.forEach(t => {
            grouped[t.category] = (grouped[t.category] || 0) + t.amount;
        });

        return Object.keys(grouped).map(k => ({
            name: k,
            value: grouped[k]
        })).sort((a, b) => b.value - a.value).slice(0, 6);
    };

    const barData = processDataForBar();
    const pieData = processDataForPie();
    const incomePieData = processDataForIncomePie();
    const COLORS = ['#064e3b', '#065f46', '#0d9488', '#2dd4bf', '#99f6e4', '#ccfbf1'];
    const EXPENSE_COLORS = ['#450a0a', '#991b1b', '#dc2626', '#f87171', '#fca5a5', '#fee2e2'];

    const TrendSection = (
        <div className="w-full h-full flex flex-col">
            <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900">{t('weekly_flow')}</h4>
                <p className="text-xs text-gray-400">{t('income_vs_expense')}</p>
            </div>
            <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <Tooltip
                            cursor={{ fill: '#fff7ed', radius: 8 }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="income" name={t('income')} fill="#064e3b" radius={[6, 6, 0, 0]} barSize={20} />
                        <Bar dataKey="expense" name={t('expense')} fill="#450a0a" radius={[6, 6, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    const IncomePieSection = (
        <div className="w-full h-full flex flex-col">
            <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900">{t('income_segmentation')}</h4>
                <p className="text-xs text-gray-400">{t('top_categories')}</p>
            </div>
            <div className="flex-1 min-h-[300px] w-full flex items-center justify-center">
                {incomePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={incomePieData}
                                innerRadius="60%"
                                outerRadius="80%"
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {incomePieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(val) => <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">{val}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-300">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                            <PieChart size={32} />
                        </div>
                        <p className="text-sm font-medium">{t('no_tx')}</p>
                    </div>
                )}
            </div>
        </div>
    );

    const PieSection = (
        <div className="w-full h-full flex flex-col">
            <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900">{t('expense_segmentation')}</h4>
                <p className="text-xs text-gray-400">{t('top_categories')}</p>
            </div>
            <div className="flex-1 min-h-[300px] w-full flex items-center justify-center">
                {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
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
                                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(val) => <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">{val}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-300">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                            <PieChart size={32} />
                        </div>
                        <p className="text-sm font-medium">{t('no_expenses')}</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (showOnly === 'trend') return TrendSection;
    if (showOnly === 'pie') return PieSection;
    if (showOnly === 'income_pie') return IncomePieSection;

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-orange-50 warm-shadow">
                {TrendSection}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-orange-50 warm-shadow">
                    {IncomePieSection}
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-orange-50 warm-shadow">
                    {PieSection}
                </div>
            </div>
        </div>
    );
};
