import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, Edit2, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export const GoalsSystem = ({ userId, onGoalComplete }) => {
    const [goals, setGoals] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ name: '', target: '', saved: '', color: 'rose' });

    // Load goals
    useEffect(() => {
        if (!userId) return;
        const stored = localStorage.getItem(`fin_goals_${userId}`);
        if (stored) setGoals(JSON.parse(stored));
    }, [userId]);

    // Save goals
    useEffect(() => {
        if (!userId) return;
        localStorage.setItem(`fin_goals_${userId}`, JSON.stringify(goals));
    }, [goals, userId]);

    const handleAdd = (e) => {
        e.preventDefault();
        const target = parseFloat(form.target);
        const saved = parseFloat(form.saved) || 0;

        if (!form.name || target <= 0) return;

        const newGoal = {
            id: Date.now().toString(),
            name: form.name,
            target,
            saved,
            color: form.color,
            completed: saved >= target
        };

        setGoals([...goals, newGoal]);
        setIsAdding(false);
        setForm({ name: '', target: '', saved: '', color: 'rose' });

        if (newGoal.completed && onGoalComplete) {
            onGoalComplete();
        }
    };

    const handleUpdateProgress = (id, amountToAdd) => {
        setGoals(goals.map(g => {
            if (g.id === id) {
                const newSaved = g.saved + amountToAdd;
                const completed = newSaved >= g.target;
                if (!g.completed && completed && onGoalComplete) {
                    onGoalComplete(); // Trigger confetti!
                }
                return { ...g, saved: Math.min(newSaved, g.target), completed };
            }
            return g;
        }));
    };

    const handleDelete = (id) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const colors = [
        { id: 'rose', bg: 'bg-rose-500', light: 'bg-rose-100', text: 'text-rose-500' },
        { id: 'orange', bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-500' },
        { id: 'blue', bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-500' },
        { id: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-500' },
        { id: 'purple', bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-500' }
    ];

    return (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 z-0 pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Target className="text-emerald-500" size={24} />
                        Savings Goals
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Visualize your financial envelopes</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-emerald-500 hover:rotate-90 transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} />
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAdd}
                        className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700">New Goal</h3>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Name</label>
                                <input required type="text" placeholder="e.g. New Car, Emergency Fund" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Amount (₹)</label>
                                <input required type="number" min="1" placeholder="50000" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-medium font-mono" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Color Envelope:</label>
                            <div className="flex gap-2">
                                {colors.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setForm({ ...form, color: c.id })}
                                        className={`w-8 h-8 rounded-full ${c.bg} ${form.color === c.id ? 'ring-4 ring-offset-2 ring-' + c.id + '-500' : ''} transition-all border-2 border-white shadow-sm`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
                            Create Envelope
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {goals.length === 0 && !isAdding ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <TrendingUp className="text-slate-300 mx-auto mb-3" size={40} />
                    <h3 className="text-lg font-bold text-slate-600">No Goals Set</h3>
                    <p className="text-slate-400 text-sm mt-1">Start tracking towards your dreams today.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {goals.map(goal => {
                        const col = colors.find(c => c.id === goal.color) || colors[0];
                        const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100)) || 0;

                        return (
                            <motion.div
                                layout
                                key={goal.id}
                                className={`relative p-6 rounded-2xl bg-white border flex flex-col justify-between ${goal.completed ? 'border-emerald-200 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-100 shadow-sm'} group`}
                            >
                                <button onClick={() => handleDelete(goal.id)} className="absolute top-4 right-4 p-1.5 bg-slate-100 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-500 transition-all scale-75 group-hover:scale-100">
                                    <X size={14} />
                                </button>

                                <div className="mb-4">
                                    <h3 className="font-extrabold text-slate-800 text-xl tracking-tight mb-1 pr-6 truncate">{goal.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1">
                                        {goal.completed ? <><CheckCircle2 size={12} className="text-emerald-500" /> Goal Reached</> : 'In Progress'}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-2xl font-black ${col.text}`}>₹{goal.saved.toLocaleString('en-IN')}</span>
                                            <span className="text-sm font-bold text-slate-400">/ ₹{goal.target.toLocaleString('en-IN')}</span>
                                        </div>
                                        <span className={`text-sm font-black ${col.text}`}>{pct}%</span>
                                    </div>

                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden w-full relative mb-4">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, type: "spring" }}
                                            className={`h-full ${col.bg} rounded-full`}
                                            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)' }}
                                        />
                                    </div>

                                    {!goal.completed && (
                                        <div className="flex gap-2 justify-center">
                                            <button onClick={() => handleUpdateProgress(goal.id, 500)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${col.light} ${col.text} hover:opacity-80 transition-all`}>+ ₹500</button>
                                            <button onClick={() => handleUpdateProgress(goal.id, 1000)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${col.light} ${col.text} hover:opacity-80 transition-all`}>+ ₹1000</button>
                                            <button onClick={() => handleUpdateProgress(goal.id, 5000)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${col.light} ${col.text} hover:opacity-80 transition-all`}>+ ₹5K</button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
