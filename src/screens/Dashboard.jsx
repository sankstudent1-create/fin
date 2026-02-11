import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Wallet, PieChart, LayoutDashboard, LogOut, Settings,
    Scan, Download, WifiOff, RefreshCw, Sparkles, ArrowDownLeft,
    ArrowUpRight, X, Star, Search, CheckCircle2, Heart
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { TransactionItem } from '../components/dashboard/TransactionItem';
import { TrendBarChart } from '../components/dashboard/TrendBarChart';
import { PrintView } from '../components/dashboard/PrintView';
import { SettingsModal } from '../components/modals/SettingsModal';
import { ReceiptScanner } from '../components/modals/ReceiptScanner';
import { Button, Card } from '../components/ui/Primitives';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { CalculatorModal } from '../components/dashboard/Calculators';
import { AnalyticsDashboard } from '../components/dashboard/Analytics';
import { ICON_MAP, DEFAULT_CATEGORIES, TOOLS, MONTH_NAMES } from '../config/constants';
import { playSound } from '../utils/alerts';

export const Dashboard = ({ session, supabase }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (successMsg) {
            const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
            const timer = setTimeout(() => setSuccessMsg(''), settings.notificationDuration || 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [editingTx, setEditingTx] = useState(null);

    // Forms
    const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', type: 'expense' });
    const [catForm, setCatForm] = useState({ name: '', icon_key: 'Star', type: 'expense', isEmoji: false });

    const [avatarUrl, setAvatarUrl] = useState(session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`);
    const fileInputRef = useRef(null);

    // Filters
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [analysisType, setAnalysisType] = useState('expense');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTool, setSelectedTool] = useState(null);
    const [calculatorPrintData, setCalculatorPrintData] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [pdfVariant, setPdfVariant] = useState('classic');
    const [statsViewMode, setStatsViewMode] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('app_settings') || '{}');
        return saved.statsViewMode || 'month';
    });

    // Fetch Data
    const fetchData = async () => {
        const cacheKeyTx = `cached_tx_${session.user.id}`;
        const cacheKeyCat = `cached_cat_${session.user.id}`;

        const cachedTx = localStorage.getItem(cacheKeyTx);
        const cachedCat = localStorage.getItem(cacheKeyCat);
        if (cachedTx) setTransactions(JSON.parse(cachedTx));
        if (cachedCat) setCategories([...DEFAULT_CATEGORIES, ...JSON.parse(cachedCat)]);

        if (!navigator.onLine) { setLoading(false); return; }

        try {
            const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
            const { data: catData } = await supabase.from('categories').select('*').order('usage_count', { ascending: false });

            if (txData) {
                setTransactions(txData);
                localStorage.setItem(cacheKeyTx, JSON.stringify(txData));
            }
            if (catData) {
                const customCats = catData.filter(c => !DEFAULT_CATEGORIES.some(d => d.name === c.name));
                setCategories([...DEFAULT_CATEGORIES, ...customCats]);
                localStorage.setItem(cacheKeyCat, JSON.stringify(customCats));
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const { isOnline, isSyncing } = useOfflineSync(supabase, session.user.id, fetchData);

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleSaveTx = async () => {
        if (!formData.amount || !formData.title) return;
        const txData = {
            user_id: session.user.id,
            title: formData.title,
            amount: parseFloat(formData.amount),
            category: formData.category,
            type: formData.type,
            date: new Date().toISOString()
        };

        if (navigator.onLine) {
            if (editingTx) {
                await supabase.from('transactions').update(txData).eq('id', editingTx.id);
                setSuccessMsg('Entry Updated! ✨');
            } else {
                await supabase.from('transactions').insert([txData]);
                setSuccessMsg('Transaction Captured! 💸');
            }
            playSound();
        } else {
            const pendingKey = `pending_tx_${session.user.id}`;
            const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
            pending.push({ action: editingTx ? 'UPDATE' : 'INSERT', data: editingTx ? { ...txData, id: editingTx.id } : txData });
            localStorage.setItem(pendingKey, JSON.stringify(pending));
            setSuccessMsg('Saved Offline 📡');
            playSound('subtle');
        }

        setShowModal(false);
        setEditingTx(null);
        setFormData({ title: '', amount: '', category: 'Food', type: 'expense' });
        fetchData();
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this transaction?')) return;
        if (navigator.onLine) {
            await supabase.from('transactions').delete().eq('id', id);
            setSuccessMsg('Entry Removed 🗑️');
            playSound('subtle');
        } else {
            const pendingKey = `pending_tx_${session.user.id}`;
            const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
            pending.push({ action: 'DELETE', id });
            localStorage.setItem(pendingKey, JSON.stringify(pending));
        }
        fetchData();
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fileName = `${session.user.id}-${Date.now()}`;
        await supabase.storage.from('avatars').upload(fileName, file);
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
        setAvatarUrl(data.publicUrl);
    };

    // List Filtering (Search + Date)
    const displayTx = useMemo(() => {
        return transactions.filter(t => {
            const d = new Date(t.date);
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDate = (filterMonth === 'all' || d.getMonth() === filterMonth) &&
                d.getFullYear() === filterYear;
            return matchesSearch && matchesDate;
        });
    }, [transactions, filterMonth, filterYear, searchQuery]);

    // Stats Filtering (Date ONLY - for top bars)
    const statsTx = useMemo(() => {
        return transactions.filter(t => {
            const d = new Date(t.date);
            const matchesYear = d.getFullYear() === filterYear;
            if (statsViewMode === 'year') return matchesYear;
            return matchesYear && (filterMonth === 'all' || d.getMonth() === filterMonth);
        });
    }, [transactions, filterMonth, filterYear, statsViewMode]);

    const stats = useMemo(() => {
        const inc = statsTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const exp = statsTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { income: inc, expense: exp, balance: inc - exp };
    }, [statsTx]);

    const reportData = useMemo(() => {
        const grouped = {};
        statsTx.filter(t => t.type === analysisType).forEach(t => {
            grouped[t.category] = (grouped[t.category] || 0) + t.amount;
        });
        return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    }, [statsTx, analysisType]);

    const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

    const appSettings = JSON.parse(localStorage.getItem('app_settings') || '{}');

    return (
        <div className="flex h-screen bg-bg-warm overflow-hidden">
            {/* Global Toasts */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className={`fixed bottom-24 lg:bottom-12 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-4xl px-8 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 pointer-events-auto no-print
                            ${appSettings.popupStyle === 'brutal' ? 'rounded-none border-4 border-slate-900 bg-orange-500 text-white' :
                                appSettings.popupStyle === 'soft' ? 'rounded-full bg-indigo-50 text-indigo-600 border-4 border-indigo-100' :
                                    'glass-panel bg-white/80 backdrop-blur-3xl border-white/60 text-slate-800'}`}
                    >
                        <div className={`p-3 rounded-2xl ${appSettings.popupStyle === 'brutal' ? 'bg-white text-slate-900' : 'bg-orange-100 text-orange-600'}`}>
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="flex-1">
                            <span className="font-black tracking-tight text-lg uppercase block">{successMsg}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Transaction Verified Successfully</p>
                        </div>
                        <button onClick={() => setSuccessMsg('')} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                            <LogOut size={16} className="rotate-90" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <PrintView
                user={session.user}
                stats={stats}
                transactions={statsTx}
                filterLabel={statsViewMode === 'year' ? `Yearly (${filterYear})` : (filterMonth === 'all' ? 'All Time' : MONTH_NAMES[filterMonth])}
                calculatorData={calculatorPrintData}
                isPrinting={isPrinting}
                variant={pdfVariant}
            />

            <AnimatePresence>
                {selectedTool && (
                    <CalculatorModal
                        toolId={selectedTool}
                        pdfVariant={pdfVariant}
                        setPdfVariant={setPdfVariant}
                        onClose={() => setSelectedTool(null)}
                        onPrint={(name, inputs, result) => {
                            setCalculatorPrintData({ toolName: name, inputs, result });
                            setIsPrinting(true);
                            setTimeout(() => {
                                window.print();
                                setIsPrinting(false);
                                setCalculatorPrintData(null);
                            }, 500);
                        }}
                        onShare={(name, inputs, result) => {
                            // Basic alert for now, can implement real share if needed
                            alert("Sharing feature coming soon! You can use the Print/PDF option for now.");
                        }}
                    />
                )}
            </AnimatePresence>
            {/* Sidebar */}
            <aside className="hidden lg:flex w-64 glass-panel flex-col p-6 z-20 no-print">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-md">
                        <Wallet size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Orange</h1>
                </div>
                <nav className="space-y-2 flex-1">
                    <button
                        onClick={() => setActiveTab('home')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <PieChart size={20} /> Reports
                    </button>
                </nav>
                <div className="mt-auto pt-6 border-t border-orange-50 space-y-4">
                    <button
                        onClick={async () => {
                            const { handlePayment } = await import('../utils/razorpay');
                            const userName = session.user?.user_metadata?.full_name || 'Supporter';
                            handlePayment({
                                amount: 500,
                                user: session.user,
                                description: `Support by ${userName} to fin by swinfosystems`,
                                notes: { "Infrastructure Support": "agriwadi" },
                                onSuccess: () => setSuccessMsg("Thank you for your support! 🧡"),
                                onError: (err) => alert("Support failed: " + err.description)
                            });
                        }}
                        className="w-full flex items-center justify-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-orange-50/50 py-3 rounded-2xl hover:bg-orange-50 transition-all group"
                    >
                        <Heart size={14} className="group-hover:scale-125 transition-transform fill-orange-500" /> Support Mission
                    </button>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="w-full flex items-center justify-center gap-2 text-red-500 text-sm font-medium hover:bg-red-50 py-2 rounded-lg transition-colors"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-print relative">
                <div className="max-w-6xl mx-auto px-6 py-8 pb-32 lg:pb-8">

                    <header className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:border-orange-400 transition-colors"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-orange-600/50 uppercase tracking-widest">{greeting}</p>
                                <h2 className="text-2xl font-black text-gray-900 leading-none">{session.user.user_metadata.full_name?.split(' ')[0]}</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex bg-white/50 backdrop-blur-sm p-1 rounded-2xl border border-white shadow-sm no-print">
                                {['month', 'year'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setStatsViewMode(mode)}
                                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statsViewMode === mode ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                {!isOnline && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2 bg-rose-100 text-rose-600 px-3 py-1.5 rounded-full text-[10px] font-bold"
                                    >
                                        <WifiOff size={14} /> Offline
                                    </motion.div>
                                )}
                                {isSyncing && (
                                    <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-bold">
                                        <RefreshCw size={14} className="animate-spin" /> Syncing
                                    </div>
                                )}
                                <button onClick={() => setShowSettings(true)} className="p-3 bg-white rounded-2xl border border-orange-50 shadow-sm text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all scale-hover">
                                    <Settings size={20} />
                                </button>
                            </div>
                        </div>
                    </header>

                    <AnimatePresence mode="wait">
                        {activeTab === 'home' ? (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="space-y-10"
                            >
                                {/* Bento Grid Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard label="Total Balance" value={stats.balance} icon={Wallet} />
                                    <StatCard label="Income" value={stats.income} type="income" icon={ArrowDownLeft} />
                                    <StatCard label="Expense" value={stats.expense} type="expense" icon={ArrowUpRight} />
                                </div>

                                {/* Tools Section */}
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Financial Tools</h3>
                                        <Button variant="orange" className="text-[10px] py-1.5 px-4" onClick={() => setShowScanner(true)}>
                                            <Scan size={14} className="mr-2 inline" /> AI Scan
                                        </Button>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-1 px-1">
                                        {TOOLS.map(t => (
                                            <Card
                                                key={t.id}
                                                onClick={() => setSelectedTool(t.id)}
                                                className="min-w-[120px] flex flex-col items-center gap-3 py-6 glass-panel border-white/40 cursor-pointer hover:border-orange-200 active:scale-95 transition-all group"
                                            >
                                                <div className={`p-4 rounded-2xl ${t.bg} ${t.color} shadow-inner group-hover:scale-110 transition-transform`}>
                                                    <t.icon size={24} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{t.name}</span>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                Recent Transactions
                                                <span className="text-[10px] text-gray-400 font-normal">History</span>
                                            </h3>
                                            <div className="relative w-full sm:w-48">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="Search..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2 bg-white/50 border border-orange-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto hide-scrollbar pr-2">
                                            <AnimatePresence initial={false}>
                                                {displayTx.slice(0, 20).map(t => (
                                                    <TransactionItem
                                                        key={t.id}
                                                        t={t}
                                                        categories={categories}
                                                        onEdit={(tx) => { setEditingTx(tx); setFormData({ ...tx, amount: tx.amount.toString() }); setShowModal(true); }}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                            {transactions.length === 0 && (
                                                <div className="text-center py-20 border-2 border-dashed border-orange-100 rounded-[2.5rem]">
                                                    <Sparkles className="mx-auto text-orange-200 mb-4" size={40} />
                                                    <p className="text-gray-400 font-bold">Start tracking today!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Card className="glass-panel">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Trend</h4>
                                            <div className="flex bg-gray-100/50 p-1 rounded-xl">
                                                <button onClick={() => setAnalysisType('expense')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${analysisType === 'expense' ? 'bg-white shadow text-orange-600' : 'text-gray-400'}`}>Exp</button>
                                                <button onClick={() => setAnalysisType('income')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${analysisType === 'income' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'}`}>Inc</button>
                                            </div>
                                        </div>
                                        <TrendBarChart transactions={statsTx} type={analysisType} />
                                    </Card>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="reports"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Analytics</h2>
                                        <p className="text-sm text-gray-500 font-medium">Detailed financial insights</p>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-2xl shadow-inner border border-white/40 mr-2 flex-wrap sm:flex-nowrap">
                                            {['classic', 'creative', 'modern', 'minimalist', 'neon', 'retro'].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setPdfVariant(v)}
                                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${pdfVariant === v ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} className="bg-white border-none rounded-xl text-xs font-bold px-4 py-2 shadow-sm shadow-orange-500/5 cursor-pointer">
                                            <option value="all">Full Year</option>
                                            {MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m}</option>)}
                                        </select>
                                        <Button
                                            onClick={() => {
                                                setIsPrinting(true);
                                                setTimeout(() => {
                                                    window.print();
                                                    setIsPrinting(false);
                                                }, 300);
                                            }}
                                            variant="primary"
                                            className="text-xs"
                                        >
                                            <Download size={14} className="mr-2 inline" /> Export PDF
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <AnalyticsDashboard transactions={statsTx} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Nav */}
            <nav className="lg:hidden fixed bottom-6 left-6 right-6 glass-panel p-2 rounded-[2.5rem] flex justify-between items-center z-50 no-print border-white/60 shadow-2xl">
                <button onClick={() => setActiveTab('home')} className={`flex-1 py-4 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'home' ? 'text-orange-600' : 'text-gray-400'}`}><LayoutDashboard size={24} /></button>
                <div className="relative -top-10">
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-20 h-20 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl border-8 border-bg-warm scale-active"
                    >
                        <Plus size={32} />
                    </button>
                </div>
                <button
                    onClick={async () => {
                        const { handlePayment } = await import('../utils/razorpay');
                        const userName = session.user?.user_metadata?.full_name || 'Supporter';
                        handlePayment({
                            amount: 500,
                            user: session.user,
                            description: `Support by ${userName} to fin by swinfosystems`,
                            notes: { "Infrastructure Support": "agriwadi" },
                            onSuccess: () => setSuccessMsg("Thank you for your support! 🧡"),
                            onError: (err) => alert("Support failed: " + err.description)
                        });
                    }}
                    className="flex-1 py-4 rounded-2xl flex items-center justify-center text-orange-500"
                >
                    <Heart size={24} className="fill-orange-500" />
                </button>
                <button onClick={() => setActiveTab('reports')} className={`flex-1 py-4 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'reports' ? 'text-orange-600' : 'text-gray-400'}`}><PieChart size={24} /></button>
            </nav>

            {/* Modals */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} user={session.user} avatarUrl={avatarUrl} onAvatarUpload={handleAvatarUpload} />
            <ReceiptScanner isOpen={showScanner} onClose={() => setShowScanner(false)} onScanComplete={(data) => { setFormData({ ...data, amount: data.amount.toString(), category: 'Shopping', type: 'expense' }); setShowModal(true); }} />

            {/* Transaction Modal (Add/Edit) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center no-print">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md bg-white rounded-t-[3rem] p-10 shadow-2xl h-[90vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{editingTx ? 'Edit' : 'New'}</h2>
                                <button onClick={() => setShowModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X size={24} /></button>
                            </div>

                            <div className="flex bg-gray-100/50 p-1.5 rounded-2xl mb-10">
                                {['expense', 'income'].map(t => (
                                    <button key={t} onClick={() => setFormData({ ...formData, type: t })} className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === t ? 'bg-white shadow-xl text-gray-900' : 'text-gray-400'}`}>{t}</button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-10">
                                <div className="text-center">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Amount</label>
                                    <div className="flex justify-center items-center gap-3 mt-4">
                                        <span className="text-4xl text-orange-500 font-extrabold">₹</span>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                            className="text-6xl font-black text-gray-900 w-48 text-center bg-transparent outline-none placeholder-gray-200"
                                            placeholder="0"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 block">Category</label>
                                    <div className="grid grid-cols-4 gap-4">
                                        {categories.filter(c => c.type === formData.type).slice(0, 8).map(cat => {
                                            const Icon = ICON_MAP[cat.icon_key] || Star;
                                            const selected = formData.category === cat.name;
                                            return (
                                                <button
                                                    key={cat.name}
                                                    onClick={() => setFormData({ ...formData, category: cat.name })}
                                                    className="flex flex-col items-center gap-2"
                                                >
                                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${selected ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 scale-110' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                                                        {cat.isEmoji ? <span className="text-2xl">{cat.icon_key}</span> : <Icon size={24} />}
                                                    </div>
                                                    <span className={`text-[10px] font-bold ${selected ? 'text-gray-900' : 'text-gray-400'}`}>{cat.name}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-4 pb-10">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Description</label>
                                    <input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50 p-5 rounded-3xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-orange-100 transition-all border border-transparent"
                                        placeholder="What was this for?"
                                    />
                                    <Button onClick={handleSaveTx} variant="primary" className="w-full py-5 text-lg shadow-2xl mt-4">
                                        {editingTx ? 'Update Entry' : 'Create Entry'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
