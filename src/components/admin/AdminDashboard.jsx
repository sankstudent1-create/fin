import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { LogOut, Users, FileText, Database, ShieldCheck, Search, Loader2, Trash2, Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboard = ({ session, onLogout }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [toast, setToast] = useState(null);

    // Selected user tabs
    const [activeUserTab, setActiveUserTab] = useState('data'); // 'data' | 'actions'
    const [userTransactions, setUserTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('admin_get_all_users');
            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Failed to load users:', err);
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadUserTransactions = async (userId) => {
        setLoadingTx(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });
            if (error) throw error;
            setUserTransactions(data || []);
        } catch (err) {
            showToast('Failed to load transactions', 'error');
        } finally {
            setLoadingTx(false);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setActiveUserTab('data');
        loadUserTransactions(user.id);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("CRITICAL WARNING: This will permanently delete the user and ALL their data! Proceed?")) return;
        try {
            const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
            if (error) throw error;
            showToast('User deleted permanently', 'success');
            setSelectedUser(null);
            loadUsers();
        } catch (err) {
            showToast(err.message || 'Failed to delete user', 'error');
        }
    };

    const handleDeleteTransaction = async (txId) => {
        if (!window.confirm("Delete this transaction?")) return;
        try {
            const { error } = await supabase.from('transactions').delete().eq('id', txId);
            if (error) throw error;
            setUserTransactions(prev => prev.filter(t => t.id !== txId));
            showToast('Transaction deleted', 'success');
        } catch (err) {
            showToast('Failed to delete transaction', 'error');
        }
    };

    const handleGenerateUserReport = async () => {
        // Implement report generation logic to email users
        if (!window.confirm(`Send an automated activity email to ${selectedUser.email}?`)) return;

        // This is a placeholder since rendering the full Analytics PDF for another user 
        // requires rendering the chart components. For an admin panel, a summary email can be sent.
        try {
            setLoadingTx(true);
            const res = await fetch('/api/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedUser.email,
                    subject: 'Message from Orange Finance Admin',
                    reportName: 'Admin_Notification.pdf',
                    filterLabel: 'System Notification',
                    stats: { income: 0, expense: 0, balance: 0 },
                    pdfBase64: 'JVB...' // dummy or real generated base64 
                })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            showToast('Email sent to user', 'success');
        } catch (err) {
            showToast('Failed to send email. Check API logs.', 'error');
        } finally {
            setLoadingTx(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 font-['Outfit']">
            {/* Topbar */}
            <div className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                            <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
                                Admin Console <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black border border-rose-500/30">SuperUser</span>
                            </h1>
                            <p className="text-[11px] text-slate-400 font-medium">Logged in as {session.user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-slate-600"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
                {/* Users List Sidebar */}
                <div className="w-full md:w-[350px] flex flex-col gap-4">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search users by email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-700"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-2 px-2">
                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Total Users</span>
                            <span className="text-xs font-black text-slate-700">{users.length}</span>
                        </div>

                        {loading ? (
                            <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
                        ) : (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredUsers.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleSelectUser(u)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border text-left ${selectedUser?.id === u.id
                                                ? 'bg-slate-900 border-slate-800 shadow-md transform scale-[1.02]'
                                                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-tr flex-shrink-0 ${selectedUser?.id === u.id ? 'from-orange-500 to-rose-500 text-white' : 'from-slate-200 to-slate-100 text-slate-600'}`}>
                                            {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="truncate">
                                            <p className={`text-sm font-bold truncate ${selectedUser?.id === u.id ? 'text-white' : 'text-slate-900'}`}>{u.full_name || 'No Name'}</p>
                                            <p className={`text-[10px] font-semibold truncate ${selectedUser?.id === u.id ? 'text-slate-400' : 'text-slate-500'}`}>{u.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {selectedUser ? (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            {/* User Profile Header */}
                            <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-2xl border-2 border-white shadow-md overflow-hidden">
                                        {selectedUser.avatar_url ? (
                                            <img src={selectedUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-400">
                                                {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">{selectedUser.full_name || 'Anonymous User'}</h2>
                                        <p className="text-sm font-semibold text-slate-500">{selectedUser.email}</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                            Joined {new Date(selectedUser.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteUser(selectedUser.id)}
                                    className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                >
                                    <Trash2 size={14} /> Delete User
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                                <button
                                    onClick={() => setActiveUserTab('data')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeUserTab === 'data' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <Database size={14} /> Finance Data
                                </button>
                                <button
                                    onClick={() => setActiveUserTab('actions')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeUserTab === 'actions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <Send size={14} /> Admin Actions
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeUserTab === 'data' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transaction History</h3>
                                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{userTransactions.length} Total</span>
                                    </div>

                                    {loadingTx ? (
                                        <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
                                    ) : userTransactions.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl">
                                            <p className="text-sm font-bold text-slate-400">No transactions recorded by this user.</p>
                                        </div>
                                    ) : (
                                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                                                        <th className="p-3 font-black">Date</th>
                                                        <th className="p-3 font-black">Title</th>
                                                        <th className="p-3 font-black">Category</th>
                                                        <th className="p-3 font-black text-right">Amount</th>
                                                        <th className="p-3 font-black text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userTransactions.map((tx, i) => (
                                                        <tr key={tx.id} className={`text-xs font-bold border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                                            <td className="p-3 text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                                                            <td className="p-3 text-slate-900 truncate max-w-[150px]">{tx.title}</td>
                                                            <td className="p-3 text-slate-600">{tx.category}</td>
                                                            <td className={`p-3 text-right font-black font-mono ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <button onClick={() => handleDeleteTransaction(tx.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:border-rose-200">
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeUserTab === 'actions' && (
                                <div className="space-y-4">
                                    <div className="p-5 border border-slate-200 rounded-2xl flex items-center justify-between bg-slate-50">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900">Email System Notification</h4>
                                                <p className="text-xs font-medium text-slate-500 mt-0.5">Send a direct message or dummy report to this user.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleGenerateUserReport}
                                            className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
                                        >
                                            <Send size={14} /> Send Email
                                        </button>
                                    </div>
                                    <div className="p-5 border border-yellow-200 rounded-2xl flex items-center justify-between bg-yellow-50">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-yellow-900">Force Password Reset</h4>
                                                <p className="text-xs font-medium text-yellow-700 mt-0.5">Send password reset instructions via email.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm("Send reset password email?")) {
                                                    const { error } = await supabase.auth.resetPasswordForEmail(selectedUser.email);
                                                    if (error) showToast("Failed to send reset email.", "error");
                                                    else showToast("Reset email sent.", "success");
                                                }
                                            }}
                                            className="px-5 py-2.5 bg-yellow-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-yellow-700 transition-all"
                                        >
                                            Send Reset Link
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 min-h-[500px]">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                <Users size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-slate-500 mb-2">No User Selected</h3>
                            <p className="text-sm font-medium text-slate-400 max-w-sm">
                                Search and select a user from the sidebar to view their full data, manage transactions, and execute administrative actions.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl z-50 text-sm font-bold ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-emerald-400'
                            }`}
                    >
                        {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
