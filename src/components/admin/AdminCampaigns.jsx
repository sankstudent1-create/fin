import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../config/supabase';
import { Loader2, Mail, Users, ArrowRight, Filter, SortDesc, Send, CheckCircle, Search, Image as ImageIcon, X } from 'lucide-react';
import { AdminCEOLetter } from './AdminCEOLetter';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactDOM from 'react-dom/client';

export const AdminCampaigns = ({ users, showToast }) => {
    const [allUserStats, setAllUserStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());

    // Filters and sort
    const [sortBy, setSortBy] = useState('balance_desc'); // balance_desc, income_desc, expense_desc, name_asc
    const [search, setSearch] = useState('');

    // Campaign details
    const [subject, setSubject] = useState('Official Account Summary & Status');
    const [customMessage, setCustomMessage] = useState('');
    const [includeStats, setIncludeStats] = useState(true);
    const [imageUrl, setImageUrl] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState(0);

    const templates = [
        {
            label: 'Keep Investing (Tips)',
            subject: 'Unlock Your Future: Smart Investing Strategies',
            message: 'Consistency is the key to wealth generation. Even small investments, when compounded over time, can yield magnificent results. As part of Orange Finance, we strongly advise automating a portion of your monthly savings directly into diverse investment vehicles. Stay strong and keep investing for your financial future.',
            includeStats: true
        },
        {
            label: 'Keep Saving (Encouragement)',
            subject: 'Great Job: Keep Building Your Savings',
            message: 'We noticed your disciplined approach to managing your finances! Saving effectively is the most crucial step toward financial independence. Ensure you always maintain a 6-month emergency fund, and continue making intelligent spending decisions. We are proud of your progress on Orange Finance.',
            includeStats: true
        },
        {
            label: 'Annual Status Report',
            subject: 'Confidential: Your Annual Financial Report',
            message: 'Enclosed is the official comprehensive review of your entire financial trajectory over the past year. We have carefully aggregated your income and expenses to provide a transparent overview. Please review to refine your budgeting plans for the upcoming year.',
            includeStats: true
        },
        {
            label: 'Monthly Status Report',
            subject: 'Confidential: Your Monthly Financial Report',
            message: 'Enclosed is your detailed transaction summary for the preceding month. Please review your balance and ensure your expenses align closely with your designated budgeting goals.',
            includeStats: true
        },
        {
            label: 'Festival / Occasion Greetings',
            subject: 'Happy Festivities from Orange Finance!',
            message: 'The entire executive team at Orange Finance wishes you and your family abundant joy and prosperity this festive season! As you celebrate, remember that true wealth belongs to those who spread happiness. We value your continued trust and membership with us. Have a wonderful celebration!',
            includeStats: false
        }
    ];

    const applyTemplate = (e) => {
        const val = e.target.value;
        if (val === '') return;
        setSubject(templates[val].subject);
        setCustomMessage(templates[val].message);
        setIncludeStats(templates[val].includeStats);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast('Image size should be less than 2MB', 'error');
            return;
        }

        setIsUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `campaigns/${fileName}`;

            // We upload to 'campaigns' bucket. User must create this public bucket.
            const { error: uploadError } = await supabase.storage.from('campaigns').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('campaigns').getPublicUrl(filePath);
            setImageUrl(urlData.publicUrl);
            showToast('Image attached successfully', 'success');
        } catch (error) {
            console.error('Image upload error:', error);
            showToast("Failed to upload image. Ensure you created a public 'campaigns' storage bucket in Supabase.", "error");
        } finally {
            setIsUploadingImage(false);
            e.target.value = ''; // Reset input
        }
    };

    useEffect(() => {
        loadAllStats();
    }, []);

    const loadAllStats = async () => {
        setLoading(true);
        try {
            const { data: txs, error } = await supabase.from('transactions').select('user_id, type, amount');
            if (error) throw error;

            const stats = {};
            if (txs) {
                txs.forEach(tx => {
                    if (!stats[tx.user_id]) stats[tx.user_id] = { income: 0, expense: 0, balance: 0 };
                    if (tx.type === 'income') {
                        stats[tx.user_id].income += Number(tx.amount);
                        stats[tx.user_id].balance += Number(tx.amount);
                    } else {
                        stats[tx.user_id].expense += Number(tx.amount);
                        stats[tx.user_id].balance -= Number(tx.amount);
                    }
                });
            }
            setAllUserStats(stats);
        } catch (err) {
            console.error(err);
            showToast('Failed to load global transaction data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const sortedAndFilteredUsers = useMemo(() => {
        let result = [...users];

        // Filter by search
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(u =>
                u.email.toLowerCase().includes(lowerSearch) ||
                (u.full_name && u.full_name.toLowerCase().includes(lowerSearch))
            );
        }

        // Sort
        result.sort((a, b) => {
            const statsA = allUserStats[a.id] || { income: 0, expense: 0, balance: 0 };
            const statsB = allUserStats[b.id] || { income: 0, expense: 0, balance: 0 };

            if (sortBy === 'balance_desc') return statsB.balance - statsA.balance;
            if (sortBy === 'income_desc') return statsB.income - statsA.income;
            if (sortBy === 'expense_desc') return statsB.expense - statsA.expense;
            if (sortBy === 'name_asc') return (a.full_name || a.email).localeCompare(b.full_name || b.email);
            return 0;
        });

        return result;
    }, [users, allUserStats, search, sortBy]);

    const handleSelectAll = () => {
        if (selectedUserIds.size === sortedAndFilteredUsers.length) {
            setSelectedUserIds(new Set()); // Deselect all
        } else {
            setSelectedUserIds(new Set(sortedAndFilteredUsers.map(u => u.id))); // Select all current
        }
    };

    const toggleSelectUser = (id) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedUserIds(newSet);
    };

    // Advanced Branded PDF Generator
    const generateCEOLetterPDF = async (user, stats) => {
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;left:-9999px;top:0;background:#fff;z-index:-1;';
        document.body.appendChild(container);

        const root = ReactDOM.createRoot(container);
        await new Promise((resolve) => {
            root.render(
                <AdminCEOLetter user={user} stats={stats} customMessage={customMessage} subject={subject} includeStats={includeStats} imageUrl={imageUrl} />
            );
            setTimeout(resolve, 800); // Wait for render
        });

        const canvas = await html2canvas(container.firstChild, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, windowWidth: 794 });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        root.unmount();
        document.body.removeChild(container);

        // Return Base64 string without the data URL prefix
        const pdfBase64Data = pdf.output('datauristring').split(',')[1];
        return pdfBase64Data;
    };

    const handleSendCampaign = async () => {
        if (selectedUserIds.size === 0) return alert("Select at least one user.");
        if (!window.confirm(`Send branded CEO Letter to ${selectedUserIds.size} users?`)) return;

        setIsSending(true);
        setSendProgress(0);
        let successCount = 0;

        const targetUsers = users.filter(u => selectedUserIds.has(u.id));

        for (let i = 0; i < targetUsers.length; i++) {
            const user = targetUsers[i];
            const stats = allUserStats[user.id] || { income: 0, expense: 0, balance: 0 };

            try {
                // 1. Generate unique PDF for this user
                const pdfBase64 = await generateCEOLetterPDF(user, stats);

                // 2. Send via Email API
                const res = await fetch('/api/send-report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: user.email,
                        subject: subject,
                        reportName: `OrangeFinance_Summary_${user.full_name?.replace(/\s+/g, '_') || 'User'}.pdf`,
                        filterLabel: 'Official Account Performance Report',
                        stats: stats,
                        pdfBase64: pdfBase64
                    })
                });

                if (res.ok) {
                    successCount++;
                } else {
                    console.error(`Failed to send to ${user.email}`);
                }
            } catch (err) {
                console.error(`Error processing ${user.email}:`, err);
            }

            setSendProgress(Math.floor(((i + 1) / targetUsers.length) * 100));
        }

        setIsSending(false);
        showToast(`Campaign Complete: Sent ${successCount} out of ${targetUsers.length} emails.`, 'success');
        setSelectedUserIds(new Set()); // Clear selection
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Targeting & Filters */}
            <div className="w-full lg:w-2/3 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900">Custom Email Targeting</h2>
                    <div className="flex gap-2">
                        <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                            <SortDesc size={16} className="text-slate-400 mx-2" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-700 outline-none pr-2 py-1"
                            >
                                <option value="balance_desc">Highest Balance</option>
                                <option value="income_desc">Highest Income</option>
                                <option value="expense_desc">Highest Expense</option>
                                <option value="name_asc">Alphabetical</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 size={32} className="animate-spin mb-4 text-orange-500" />
                        <p className="text-sm font-bold">Analyzing global transaction data...</p>
                    </div>
                ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-900 text-white sticky top-0 z-10">
                                    <tr className="text-[10px] uppercase tracking-widest font-black">
                                        <th className="p-3 w-10 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.size === sortedAndFilteredUsers.length && sortedAndFilteredUsers.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                                            />
                                        </th>
                                        <th className="p-3">User</th>
                                        <th className="p-3 text-right">Income</th>
                                        <th className="p-3 text-right">Expense</th>
                                        <th className="p-3 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedAndFilteredUsers.map((u, i) => {
                                        const stats = allUserStats[u.id] || { income: 0, expense: 0, balance: 0 };
                                        const isSelected = selectedUserIds.has(u.id);
                                        return (
                                            <tr key={u.id} className={`text-xs font-bold border-b border-slate-100 cursor-pointer hover:bg-orange-50/50 transition-colors ${isSelected ? 'bg-orange-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`} onClick={() => toggleSelectUser(u.id)}>
                                                <td className="p-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => { }} // Handled by tr onClick
                                                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <p className="text-slate-900 truncate max-w-[150px]">{u.full_name || 'No Name'}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{u.email}</p>
                                                </td>
                                                <td className="p-3 text-right text-emerald-600 font-mono">₹{stats.income.toLocaleString()}</td>
                                                <td className="p-3 text-right text-rose-600 font-mono">₹{stats.expense.toLocaleString()}</td>
                                                <td className={`p-3 text-right font-black font-mono ${stats.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>₹{stats.balance.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span>Showing {sortedAndFilteredUsers.length} targeted users.</span>
                    <span className="text-orange-500 flex items-center gap-2"><CheckCircle size={16} /> {selectedUserIds.size} Selected for Campaign</span>
                </div>
            </div>

            {/* Right: Message Composer & Send */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Mail size={16} className="text-orange-500" /> CEOPad Branded Email
                    </h3>

                    <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                        This campaign attaches a premium, watermarked PDF on the CEO letterpad. Each PDF is <b>auto-generated per user</b> containing their exact Income, Expense, and Balance data dynamically.
                    </p>

                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Quick Templates</label>
                        <select
                            onChange={applyTemplate}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">-- Choose a predefined template --</option>
                            {templates.map((tpl, idx) => (
                                <option key={idx} value={idx}>{tpl.label}</option>
                            ))}
                        </select>
                    </div>

                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Notice Subject</label>
                    <input
                        type="text"
                        className="w-full mb-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g. Important: Account Summary"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />

                    <div className="flex items-center gap-4 mb-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeStats}
                                onChange={(e) => setIncludeStats(e.target.checked)}
                                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300"
                            />
                            Show User's Financial Stats in CEO Letter
                        </label>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1"><ImageIcon size={14} /> Embed Image (Optional)</label>
                        {imageUrl ? (
                            <div className="relative w-full h-32 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                                <img src={imageUrl} alt="Campaign Attachment" className="max-h-full max-w-full object-contain p-2" />
                                <button
                                    onClick={() => setImageUrl('')}
                                    className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative w-full p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer group">
                                {isUploadingImage ? (
                                    <Loader2 size={24} className="animate-spin text-orange-500" />
                                ) : (
                                    <>
                                        <ImageIcon size={24} className="mb-2 text-slate-400 group-hover:text-orange-500 transition-colors" />
                                        <span className="text-xs font-bold text-slate-600">Click to upload image</span>
                                        <span className="text-[10px] text-slate-400 mt-1">&lt; 2MB (Needs public 'campaigns' bucket)</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploadingImage}
                                    title=""
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                />
                            </div>
                        )}
                    </div>

                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Letter Body</label>
                    <textarea
                        className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Write a specialized message to appear inside the CEO letter body..."
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                    />

                    {isSending ? (
                        <div className="mt-6">
                            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-500 to-rose-500 h-3 rounded-full transition-all duration-300" style={{ width: `${sendProgress}%` }}></div>
                            </div>
                            <p className="text-center text-xs font-bold text-slate-500 animate-pulse">Generating & dispatching emails... {sendProgress}%</p>
                        </div>
                    ) : (
                        <button
                            onClick={handleSendCampaign}
                            disabled={selectedUserIds.size === 0}
                            className={`w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black transition-all shadow-xl ${selectedUserIds.size > 0
                                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            <Send size={16} /> Launch Campaign to {selectedUserIds.size} Users
                        </button>
                    )}
                </div>

                <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
                    <h4 className="text-xs font-black text-orange-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Users size={14} /> Campaign Pro-Tip
                    </h4>
                    <p className="text-xs text-orange-700 font-medium leading-relaxed">
                        Use the filters on the left to target specific groups. For example, select all users with the "Highest Expenses" and send them an advisory letter, or thank users with the "Highest Balances" for their prudent financial management.
                    </p>
                </div>
            </div>
        </div>
    );
};
