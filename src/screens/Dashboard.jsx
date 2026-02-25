
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, BarChart3, Settings, Wallet, TrendingUp, TrendingDown,
    Plus, Search, Calendar, ChevronDown, Download, Share2,
    Receipt, ScanLine, Headphones, Loader2, X, Check,
    FileText, Eye, Palette, Printer, Sparkles, Tag
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { StatCard } from '../components/dashboard/StatCard';
import { TransactionItem } from '../components/dashboard/TransactionItem';
import { TrendBarChart } from '../components/dashboard/TrendBarChart';
import { AnalyticsDashboard } from '../components/dashboard/Analytics';
import { CalculatorModal } from '../components/dashboard/Calculators';
import { PrintView } from '../components/dashboard/PrintView';
import { SettingsModal, getUserPrefs } from '../components/modals/SettingsModal';
import { ReceiptScanner } from '../components/modals/ReceiptScanner';
import { SupportModal } from '../components/modals/SupportModal';
import { DigitalIDModal } from '../components/modals/DigitalIDModal';
import { CategoryManager, fetchCategories, getCategoryIcon, getCategoryColor } from '../components/modals/CategoryManager';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { createPDF, getPDFFile, getCalcPDFFile } from '../utils/pdfGenerator';
import { generateCalculatorPDF } from '../utils/reportGenerator';
import { MONTH_NAMES, TOOLS, DEFAULT_CATEGORIES, ICON_MAP } from '../config/constants';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 200 } }
};

// Filter periods
const FILTER_OPTIONS = [
    { id: 'all', label: 'All Time', days: null },
    { id: '7d', label: 'Last 7 Days', days: 7 },
    { id: '30d', label: 'Last 30 Days', days: 30 },
    { id: '90d', label: 'Last 90 Days', days: 90 },
    { id: 'thisMonth', label: 'This Month', days: null },
    { id: 'lastMonth', label: 'Last Month', days: null },
];

// PDF variant options with theme colors for the selector
const PDF_VARIANTS = [
    { id: 'classic', label: 'Classic', desc: 'Professional & clean', emoji: '📄', gradient: 'from-slate-800 to-slate-600' },
    { id: 'creative', label: 'Creative', desc: 'Fun & colorful', emoji: '🎨', gradient: 'from-orange-500 to-rose-500' },
    { id: 'ocean', label: 'Ocean', desc: 'Dark & elegant', emoji: '🌊', gradient: 'from-indigo-600 to-blue-500' },
    { id: 'emerald', label: 'Emerald', desc: 'Clean & simple', emoji: '💎', gradient: 'from-emerald-500 to-teal-500' },
];

export const Dashboard = ({ session }) => {
    // State
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('30d');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Modal states
    const [showSettings, setShowSettings] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [showDigitalID, setShowDigitalID] = useState(false);
    const [showTransaction, setShowTransaction] = useState(false);
    const [showCalculator, setShowCalculator] = useState(null);
    const [editTransaction, setEditTransaction] = useState(null);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [userCategories, setUserCategories] = useState([]);

    // Transaction form state
    const [txForm, setTxForm] = useState({ title: '', amount: '', type: 'expense', category: 'Other', date: new Date().toISOString().split('T')[0] });

    // PDF / sharing state
    const [isPrinting, setIsPrinting] = useState(false);
    const [printVariant, setPrintVariant] = useState('classic');
    const [isSharing, setIsSharing] = useState(false);
    const [calculatorPrintData, setCalculatorPrintData] = useState(null);
    const [showThemePicker, setShowThemePicker] = useState(false);

    // Toast
    const [toast, setToast] = useState(null);

    // Avatar
    const [avatarUrl, setAvatarUrl] = useState('');

    const user = session?.user;
    const { isOnline } = useOfflineSync(supabase, session);

    // --- TOAST HELPER (uses user preferences) ---
    const showToast = (message, type = 'success') => {
        const prefs = getUserPrefs();
        if (!prefs.notification_enabled) return;
        setToast({ message, type, style: prefs.popup_style || 'pill', position: prefs.popup_position || 'bottom' });
        setTimeout(() => setToast(null), prefs.popup_duration || 3000);
    };

    // --- DATA FETCHING ---
    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const cached = localStorage.getItem(`cached_tx_${user.id}`);
            if (cached) {
                setTransactions(JSON.parse(cached));
                setLoading(false);
            }

            if (isOnline) {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false });

                if (!error && data) {
                    setTransactions(data);
                    localStorage.setItem(`cached_tx_${user.id}`, JSON.stringify(data));
                }
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
        setLoading(false);
    }, [user, isOnline]);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    // Fetch categories from Supabase on mount
    useEffect(() => {
        if (user?.id) {
            fetchCategories(user.id).then(cats => setUserCategories(cats));
        }
    }, [user?.id]);

    // Avatar URL
    useEffect(() => {
        if (user) {
            setAvatarUrl(user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`);
        }
    }, [user]);

    // --- FILTERED DATA ---
    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];
        const now = new Date();

        const opt = FILTER_OPTIONS.find(f => f.id === filterPeriod);
        if (opt) {
            if (opt.days) {
                const cutoff = new Date();
                cutoff.setDate(now.getDate() - opt.days);
                filtered = filtered.filter(t => new Date(t.date) >= cutoff);
            } else if (opt.id === 'thisMonth') {
                filtered = filtered.filter(t => {
                    const d = new Date(t.date);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                });
            } else if (opt.id === 'lastMonth') {
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const endOfLast = new Date(now.getFullYear(), now.getMonth(), 0);
                filtered = filtered.filter(t => {
                    const d = new Date(t.date);
                    return d >= lastMonth && d <= endOfLast;
                });
            }
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.category?.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [transactions, filterPeriod, searchQuery]);

    const stats = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        return { income, expense, balance: income - expense };
    }, [filteredTransactions]);

    const filterLabel = FILTER_OPTIONS.find(f => f.id === filterPeriod)?.label || 'All Time';

    // --- CRUD ---
    const handleAddTransaction = async () => {
        if (!txForm.title || !txForm.amount) return;
        const newTx = {
            user_id: user.id,
            title: txForm.title,
            amount: parseFloat(txForm.amount),
            type: txForm.type,
            category: txForm.category,
            date: txForm.date
        };

        if (editTransaction) {
            const { error } = await supabase.from('transactions').update(newTx).eq('id', editTransaction.id);
            if (!error) {
                setTransactions(prev => prev.map(t => t.id === editTransaction.id ? { ...t, ...newTx } : t));
                showToast('Transaction updated! ✏️');
            }
        } else {
            const { data, error } = await supabase.from('transactions').insert([newTx]).select();
            if (!error && data) {
                setTransactions(prev => [data[0], ...prev]);
                showToast('Transaction added! ✅');

                // Increment category usage_count
                const cat = userCategories.find(c => c.name === txForm.category);
                if (cat?.id) {
                    supabase.from('categories').update({ usage_count: (cat.usage_count || 0) + 1 }).eq('id', cat.id).then(() => {
                        setUserCategories(prev => prev.map(c => c.id === cat.id ? { ...c, usage_count: (c.usage_count || 0) + 1 } : c));
                    });
                }
            }
        }

        setShowTransaction(false);
        setEditTransaction(null);
        setTxForm({ title: '', amount: '', type: 'expense', category: 'Other', date: new Date().toISOString().split('T')[0] });
    };

    const handleDeleteTransaction = async (id) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (!error) {
            setTransactions(prev => prev.filter(t => t.id !== id));
            showToast('Transaction deleted', 'info');
        }
    };

    const handleEditTransaction = (tx) => {
        setEditTransaction(tx);
        setTxForm({
            title: tx.title,
            amount: tx.amount.toString(),
            type: tx.type,
            category: tx.category,
            date: tx.date
        });
        setShowTransaction(true);
    };

    // --- PDF & SHARING (FIXED) ---

    // Analytics Report → uses window.print() with PrintView (hide everything else via CSS)
    const handlePrintReport = (variant) => {
        setPrintVariant(variant);
        setCalculatorPrintData(null);
        setIsPrinting(true);
        // Close any open modals so they don't bleed into print
        setShowCalculator(null);
        setShowThemePicker(false);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 600);
    };

    // Calculator PDF → uses jsPDF direct download (NO window.print — no popup leak)
    const handleCalcPrint = (toolName, data, result) => {
        try {
            // Use jsPDF to generate and directly save the PDF
            const file = getCalcPDFFile(toolName, data, result, user);
            // Create a blob URL and trigger download
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`${toolName} PDF downloaded! 📄`);
        } catch (err) {
            console.error('PDF generation error:', err);
            showToast('PDF generation failed', 'error');
        }
    };

    // Download analytics report as PDF file using jsPDF
    const handleDownloadReport = () => {
        try {
            const file = getPDFFile(filteredTransactions, stats, user, filterLabel);
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Report downloaded! 📊');
        } catch (err) {
            console.error('Download error:', err);
            showToast('Download failed', 'error');
        }
    };

    // Share report
    const handleShare = async () => {
        setIsSharing(true);
        try {
            const file = getPDFFile(filteredTransactions, stats, user, filterLabel);
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], title: 'Financial Report', text: 'My financial report from Orange Finance' });
            } else {
                // fallback to download
                const doc = createPDF(filteredTransactions, stats, user, filterLabel);
                doc.save(`Fin_Report_${Date.now()}.pdf`);
            }
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Share error:', err);
        }
        setIsSharing(false);
    };

    // Share calculator result
    const handleCalcShare = async (toolName, data, result) => {
        setIsSharing(true);
        try {
            const file = getCalcPDFFile(toolName, data, result, user);
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], title: `${toolName} Report`, text: `${toolName} projection from Orange Finance` });
            } else {
                generateCalculatorPDF(toolName, data, result);
            }
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Share error:', err);
        }
        setIsSharing(false);
    };

    // Avatar upload
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop();
        const filePath = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
        if (!uploadError) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(urlData.publicUrl);
        }
    };

    // Greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

    return (
        <>
            {/* PRINT VIEW (Hidden, shown only during print) */}
            <PrintView
                user={user}
                stats={stats}
                transactions={filteredTransactions}
                filterLabel={filterLabel}
                calculatorData={calculatorPrintData}
                isPrinting={isPrinting}
                variant={printVariant}
            />

            {/* MAIN APP — gets hidden during print via CSS */}
            <div className={`${isPrinting ? 'print-hide' : ''} min-h-screen bg-slate-50 font-['Outfit'] antialiased`} data-print-hide="true">

                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Wallet className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Orange Finance</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {isOnline ? '🟢 Online' : '🔴 Offline'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowScanner(true)}
                                className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                            >
                                <ScanLine size={20} />
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-orange-300 transition-all"
                            >
                                <img src={avatarUrl} alt="U" className="w-full h-full object-cover" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28">
                    <AnimatePresence mode="wait">
                        {activeTab === 'home' && (
                            <motion.div
                                key="home"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0 }}
                                className="space-y-8"
                            >
                                {/* Greeting */}
                                <motion.div variants={itemVariants} className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            {getGreeting()}, <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">{firstName}</span> 👋
                                        </h2>
                                        <p className="text-sm text-slate-400 font-medium mt-1">Here's your financial overview</p>
                                    </div>
                                    {/* Quick filter chip */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                            className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 border border-slate-100 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <Calendar size={14} />
                                            {filterLabel}
                                            <ChevronDown size={14} className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {showFilterDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 min-w-[180px]"
                                                >
                                                    {FILTER_OPTIONS.map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => { setFilterPeriod(opt.id); setShowFilterDropdown(false); }}
                                                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${filterPeriod === opt.id ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}
                                                        >
                                                            {opt.label}
                                                            {filterPeriod === opt.id && <Check size={14} />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                                {/* Stats */}
                                <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
                                    <StatCard label="Balance" value={stats.balance} icon={Wallet} type="balance" onClick={() => setActiveTab('reports')} />
                                    <StatCard label="Income" value={stats.income} icon={TrendingUp} type="income" />
                                    <StatCard label="Expense" value={stats.expense} icon={TrendingDown} type="expense" />
                                </motion.div>

                                {/* Tools Section */}
                                <motion.div variants={itemVariants}>
                                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Financial Tools</h2>
                                    <div className="grid grid-cols-5 gap-3">
                                        {TOOLS.map(tool => (
                                            <motion.button
                                                key={tool.id}
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setShowCalculator(tool.id)}
                                                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2"
                                            >
                                                <div className={`p-3 rounded-2xl ${tool.bg}`}>
                                                    <tool.icon size={20} className={tool.color} />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">{tool.name}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Bar Chart */}
                                <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Weekly Trend</h3>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-rose-400" />Expense
                                            </span>
                                        </div>
                                    </div>
                                    <TrendBarChart transactions={filteredTransactions} type="expense" />
                                </motion.div>

                                {/* Recent Transactions */}
                                <motion.div variants={itemVariants}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Recent Transactions</h2>
                                    </div>

                                    {/* Search */}
                                    <div className="relative mb-4">
                                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Search transactions..."
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-14 pr-4 py-4 text-sm font-medium text-slate-700 outline-none focus:border-orange-300 focus:shadow-lg focus:shadow-orange-500/5 transition-all"
                                        />
                                    </div>

                                    {/* Transaction List */}
                                    {loading ? (
                                        <div className="flex justify-center py-16">
                                            <Loader2 className="animate-spin text-orange-500" size={32} />
                                        </div>
                                    ) : filteredTransactions.length === 0 ? (
                                        <div className="text-center py-16">
                                            <Receipt className="mx-auto text-slate-200 mb-4" size={48} />
                                            <p className="text-sm font-bold text-slate-400">No transactions found</p>
                                            <p className="text-xs text-slate-300 mt-1">Add your first transaction to get started</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <AnimatePresence>
                                                {filteredTransactions.slice(0, 20).map(tx => (
                                                    <TransactionItem
                                                        key={tx.id}
                                                        transaction={tx}
                                                        categories={DEFAULT_CATEGORIES}
                                                        onDelete={() => handleDeleteTransaction(tx.id)}
                                                        onEdit={() => handleEditTransaction(tx)}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}

                        {activeTab === 'reports' && (
                            <motion.div
                                key="reports"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-8"
                            >
                                {/* Report Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Deep Dive Analytics</h2>
                                        <p className="text-sm text-slate-400 font-medium mt-1">Insights & reports for your finances</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Share */}
                                        <button
                                            onClick={handleShare}
                                            disabled={isSharing}
                                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50"
                                        >
                                            {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                                            Share
                                        </button>
                                    </div>
                                </div>

                                {/* PDF Theme Selector — IMPROVED UI */}
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                                                <Palette size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900">Print Themes</h3>
                                                <p className="text-[10px] text-slate-400 font-medium">Choose a style, then view or print</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePrintReport(printVariant)}
                                                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95"
                                            >
                                                <Printer size={14} /> Print
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCalculatorPrintData(null);
                                                    setPrintVariant(printVariant);
                                                    setIsPrinting(true);
                                                }}
                                                className="flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                                            >
                                                <Eye size={14} /> Preview
                                            </button>
                                        </div>
                                    </div>

                                    {/* Theme Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {PDF_VARIANTS.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => setPrintVariant(v.id)}
                                                className={`relative group p-4 rounded-2xl text-center transition-all border-2 ${printVariant === v.id
                                                    ? 'border-orange-400 bg-orange-50 shadow-lg shadow-orange-500/10 scale-[1.02]'
                                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                                                    }`}
                                            >
                                                {/* Active indicator */}
                                                {printVariant === v.id && (
                                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                                                        <Check size={10} className="text-white" strokeWidth={3} />
                                                    </div>
                                                )}
                                                {/* Color swatch */}
                                                <div className={`w-full h-8 rounded-xl bg-gradient-to-r ${v.gradient} mb-3 shadow-sm`} />
                                                <span className="text-xs font-black text-slate-700 block">{v.label}</span>
                                                <span className="text-[9px] font-medium text-slate-400 block mt-0.5">{v.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Analytics Dashboard */}
                                <AnalyticsDashboard transactions={filteredTransactions} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Bottom Navigation — Premium Glassmorphism */}
                <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] pointer-events-none">
                    <div className="px-3 pb-2 sm:pb-3">
                        <div className="max-w-lg mx-auto bg-white/80 backdrop-blur-2xl rounded-[1.75rem] shadow-[0_-4px_40px_rgba(0,0,0,0.08)] border border-white/60 flex items-center justify-between px-2 sm:px-3 py-1.5 pointer-events-auto relative">
                            {/* Left tabs */}
                            {[
                                { id: 'home', icon: Home, label: 'Home' },
                                { id: 'reports', icon: BarChart3, label: 'Analytics' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex flex-col items-center gap-0.5 py-2.5 px-4 sm:px-5 rounded-2xl transition-all active:scale-90 ${activeTab === tab.id
                                        ? 'text-orange-600'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="navIndicator"
                                            className="absolute inset-0 bg-orange-50 rounded-2xl"
                                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        />
                                    )}
                                    <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} className="relative z-10" />
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider relative z-10">{tab.label}</span>
                                </button>
                            ))}

                            {/* Center FAB */}
                            <div className="relative -mt-7 mx-1">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full blur-xl opacity-40 scale-75" />
                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.88 }}
                                    onClick={() => { setEditTransaction(null); setTxForm({ title: '', amount: '', type: 'expense', category: 'Other', date: new Date().toISOString().split('T')[0] }); setShowTransaction(true); }}
                                    className="relative w-[52px] h-[52px] sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 via-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/30 ring-4 ring-white"
                                >
                                    <Plus size={24} strokeWidth={3} />
                                </motion.button>
                            </div>

                            {/* Right tabs */}
                            <button
                                onClick={() => setShowSupport(true)}
                                className="flex flex-col items-center gap-0.5 py-2.5 px-4 sm:px-5 rounded-2xl text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                            >
                                <Headphones size={20} strokeWidth={1.5} />
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">Help</span>
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="flex flex-col items-center gap-0.5 py-2.5 px-4 sm:px-5 rounded-2xl text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                            >
                                <Settings size={20} strokeWidth={1.5} />
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========= MODALS — all get data-print-hide so they NEVER appear in print ========= */}
            <div data-print-hide="true" className={isPrinting ? 'print-hide' : ''}>
                <AnimatePresence>
                    {/* Add/Edit Transaction Modal — Premium Design */}
                    {showTransaction && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
                            onClick={() => setShowTransaction(false)}
                        >
                            <motion.div
                                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                                className="bg-white w-full sm:max-w-md sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Drag Handle */}
                                <div className="flex justify-center pt-3 sm:hidden">
                                    <div className="w-10 h-1 bg-slate-200 rounded-full" />
                                </div>

                                {/* Header */}
                                <div className="flex justify-between items-center px-6 pt-5 pb-3 sm:px-8 sm:pt-8">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{editTransaction ? 'Edit Transaction' : 'New Transaction'}</h3>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                            {editTransaction ? 'Update the details below' : 'Track your money flow'}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowTransaction(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Body (scrollable) */}
                                <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8 space-y-5">
                                    {/* Type Toggle — Expense / Income */}
                                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                                        {['expense', 'income'].map(type => {
                                            const isActive = txForm.type === type;
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => setTxForm({ ...txForm, type })}
                                                    className={`relative flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${isActive
                                                        ? (type === 'expense'
                                                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                                            : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20')
                                                        : 'text-slate-400'
                                                        }`}
                                                >
                                                    {type === 'expense' ? '↓ ' : '↑ '}{type}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Amount — Big Input */}
                                    <div className="bg-slate-50 rounded-2xl p-5 text-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Amount</label>
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-3xl font-black text-slate-300">₹</span>
                                            <input
                                                type="number"
                                                value={txForm.amount}
                                                onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                                                placeholder="0"
                                                className="bg-transparent text-center text-4xl font-black text-slate-900 outline-none w-40 placeholder:text-slate-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Description</label>
                                        <input
                                            type="text"
                                            value={txForm.title}
                                            onChange={e => setTxForm({ ...txForm, title: e.target.value })}
                                            placeholder="e.g. Grocery shopping"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-900 outline-none focus:border-orange-400 transition-all"
                                        />
                                    </div>

                                    {/* Category Picker — Visual Grid */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                            <button
                                                onClick={() => { setShowTransaction(false); setTimeout(() => setShowCategoryManager(true), 200); }}
                                                className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                                            >
                                                <Settings size={10} /> Manage
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                            {userCategories
                                                .filter(cat => cat.type === txForm.type || !cat.type)
                                                .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
                                                .slice(0, 12)
                                                .map(cat => {
                                                    const CatIcon = getCategoryIcon(cat.name, userCategories);
                                                    const catColor = getCategoryColor(cat.name);
                                                    const isActive = txForm.category === cat.name;
                                                    return (
                                                        <button
                                                            key={cat.name}
                                                            onClick={() => setTxForm({ ...txForm, category: cat.name })}
                                                            className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl text-center transition-all ${isActive
                                                                ? `${catColor.bg} ring-2 ring-orange-400 shadow-sm scale-[1.02]`
                                                                : 'bg-slate-50 hover:bg-slate-100'
                                                                }`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? `${catColor.text}` : 'text-slate-400'
                                                                }`}>
                                                                {cat.isEmoji ? <span className="text-lg">{cat.icon_key}</span> : (CatIcon && <CatIcon size={16} />)}
                                                            </div>
                                                            <span className={`text-[9px] font-bold truncate w-full ${isActive ? 'text-slate-800' : 'text-slate-400'
                                                                }`}>
                                                                {cat.name}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Date</label>
                                        <input
                                            type="date"
                                            value={txForm.date}
                                            onChange={e => setTxForm({ ...txForm, date: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-900 outline-none focus:border-orange-400 transition-all"
                                        />
                                    </div>

                                    {/* Quick Actions */}
                                    {!editTransaction && (
                                        <button
                                            onClick={() => { setShowTransaction(false); setTimeout(() => setShowScanner(true), 200); }}
                                            className="w-full flex items-center gap-3 bg-orange-50 text-orange-600 px-5 py-3 rounded-2xl text-xs font-bold hover:bg-orange-100 transition-colors"
                                        >
                                            <ScanLine size={16} />
                                            Scan receipt instead
                                        </button>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-1">
                                    <button
                                        onClick={handleAddTransaction}
                                        className={`w-full py-4 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-xl ${txForm.type === 'income'
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                                            : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800'
                                            }`}
                                    >
                                        {editTransaction ? '✓ Update Transaction' : '+ Add Transaction'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Calculator Modal */}
                {showCalculator && (
                    <CalculatorModal
                        toolId={showCalculator}
                        onClose={() => setShowCalculator(null)}
                        onPrint={handleCalcPrint}
                        onShare={handleCalcShare}
                        isSharing={isSharing}
                    />
                )}

                {/* Settings Modal */}
                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    user={user}
                    avatarUrl={avatarUrl}
                    onAvatarUpload={handleAvatarUpload}
                    onOpenDigitalID={() => { setShowSettings(false); setShowDigitalID(true); }}
                />

                {/* Scanner Modal */}
                {showScanner && (
                    <ReceiptScanner
                        isOpen={showScanner}
                        onClose={() => setShowScanner(false)}
                        onScanComplete={(data) => {
                            setTxForm({ ...txForm, title: data.title || '', amount: data.amount?.toString() || '', category: data.category || 'Other' });
                            setShowScanner(false);
                            setShowTransaction(true);
                        }}
                    />
                )}

                {/* Support Modal */}
                <SupportModal
                    isOpen={showSupport}
                    onClose={() => setShowSupport(false)}
                    user={user}
                />

                {/* Digital ID Modal */}
                {showDigitalID && (
                    <DigitalIDModal
                        isOpen={showDigitalID}
                        onClose={() => setShowDigitalID(false)}
                        user={user}
                    />
                )}

                {/* Category Manager Modal */}
                <AnimatePresence>
                    <CategoryManager
                        isOpen={showCategoryManager}
                        onClose={() => setShowCategoryManager(false)}
                        onCategoriesChange={(cats) => setUserCategories(cats)}
                        userId={user?.id}
                    />
                </AnimatePresence>
            </div>

            {/* Print Preview Overlay (when user clicks Preview) */}
            <AnimatePresence>
                {isPrinting && !calculatorPrintData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998] bg-white overflow-y-auto no-print"
                    >
                        {/* Preview toolbar */}
                        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-3 flex items-center justify-between no-print">
                            <div className="flex items-center gap-3">
                                <Eye size={18} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-600">
                                    Preview — <span className="text-orange-500">{PDF_VARIANTS.find(v => v.id === printVariant)?.label}</span>
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { window.print(); }}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                                >
                                    <Printer size={14} /> Print This
                                </button>
                                <button
                                    onClick={() => setIsPrinting(false)}
                                    className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                                >
                                    <X size={14} /> Close
                                </button>
                            </div>
                        </div>
                        {/* Render full PrintView here for preview */}
                        <div className="max-w-4xl mx-auto">
                            <PrintView
                                user={user}
                                stats={stats}
                                transactions={filteredTransactions}
                                filterLabel={filterLabel}
                                calculatorData={null}
                                isPrinting={true}
                                variant={printVariant}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOAST — Configurable via Settings */}
            <AnimatePresence>
                {toast && (() => {
                    const isTop = toast.position === 'top';
                    const colorClass = toast.type === 'error'
                        ? 'bg-rose-500 text-white shadow-rose-500/30'
                        : toast.type === 'info'
                            ? 'bg-slate-800 text-white shadow-slate-800/30'
                            : 'bg-emerald-500 text-white shadow-emerald-500/30';

                    const styleMap = {
                        pill: 'rounded-full px-6 py-3 max-w-xs',
                        card: 'rounded-2xl px-6 py-4 shadow-2xl max-w-sm border border-white/20',
                        minimal: 'rounded-lg px-5 py-2.5 max-w-xs',
                        banner: 'rounded-2xl px-6 py-3 w-[85vw] max-w-md',
                    };
                    const shapeClass = styleMap[toast.style] || styleMap.pill;

                    return (
                        <motion.div
                            initial={{ y: isTop ? -80 : 80, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: isTop ? -80 : 80, opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                            className={`fixed ${isTop ? 'top-6' : 'bottom-24'} left-1/2 -translate-x-1/2 z-[9999] pointer-events-none`}
                        >
                            <div className={`text-sm font-bold flex items-center justify-center gap-3 ${shapeClass} ${colorClass}`}>
                                {toast.type === 'error' ? <X size={16} /> : <Check size={16} />}
                                {toast.message}
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </>
    );
};
