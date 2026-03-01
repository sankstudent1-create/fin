
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, BarChart3, Settings, Wallet, TrendingUp, TrendingDown,
    Plus, Search, Calendar, ChevronDown, ChevronLeft, Download, Share2,
    Receipt, ScanLine, Headphones, Loader2, X, Check, ShieldCheck,
    FileText, Eye, Palette, Printer, Sparkles, Tag, Bot, Mic
} from 'lucide-react';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { AIChatbot } from '../components/modals/AIChatbot';
import { VoiceAssistantModal } from '../components/modals/VoiceAssistantModal';
import { supabase } from '../config/supabase';
import { StatCard } from '../components/dashboard/StatCard';
import { TransactionItem } from '../components/dashboard/TransactionItem';
import { TrendBarChart } from '../components/dashboard/TrendBarChart';
import { AnalyticsDashboard } from '../components/dashboard/Analytics';
import { CalculatorModal } from '../components/dashboard/Calculators';
import { PrintView, PrintStyles, AnalyticsReport as PrintableReport } from '../components/dashboard/PrintView';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactDOM from 'react-dom/client';
import { SettingsModal, getUserPrefs } from '../components/modals/SettingsModal';
import { ReceiptScanner } from '../components/modals/ReceiptScanner';
import { SupportModal } from '../components/modals/SupportModal';
import { DigitalIDModal } from '../components/modals/DigitalIDModal';
import { CategoryManager, fetchCategories, getCategoryIcon, getCategoryColor } from '../components/modals/CategoryManager';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { createPDF, getPDFFile } from '../utils/pdfGenerator';
import { generateCalculatorPDF } from '../utils/reportGenerator';
import { playSound } from '../hooks/useSoundEngine';
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

// Removed PDF_VARIANTS since only one premium style is needed

export const Dashboard = ({ session }) => {
    // Analytics/Activity Tracking
    useActivityTracker(session);

    // State
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
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
    const [showChatbot, setShowChatbot] = useState(false);
    const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
    const [isListeningTx, setIsListeningTx] = useState(false);

    // --- PWA SHORTCUT HANDLER ---
    // When user taps a shortcut from home screen, the URL has ?action=xxx
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        if (action) {
            // Clean the URL so it doesn't re-trigger on reload
            window.history.replaceState({}, document.title, '/');
            // Use a small delay to ensure Dashboard is fully mounted
            setTimeout(() => {
                switch (action) {
                    case 'add-expense':
                        setTxForm(prev => ({ ...prev, type: 'expense' }));
                        setShowTransaction(true);
                        break;
                    case 'add-income':
                        setTxForm(prev => ({ ...prev, type: 'income' }));
                        setShowTransaction(true);
                        break;
                    case 'scan-receipt':
                        setShowScanner(true);
                        break;
                    case 'ai-chat':
                        setShowChatbot(true);
                        break;
                }
            }, 300);
        }
    }, []);

    // Check if user is admin
    useEffect(() => {
        const checkAdmin = async () => {
            if (!session?.user) return;
            const { data, error } = await supabase.rpc('is_admin');
            if (!error && data) {
                setIsAdmin(true);
            }
        };
        checkAdmin();
    }, [session]);

    // Transaction form state
    const [txForm, setTxForm] = useState({ title: '', amount: '', type: 'expense', category: 'Other', date: new Date().toISOString().split('T')[0] });

    // PDF / sharing state
    const [isPrinting, setIsPrinting] = useState(false);
    const [previewZoom, setPreviewZoom] = useState(1);
    const [printVariant, setPrintVariant] = useState('classic');
    const [isSharing, setIsSharing] = useState(false);
    const [calculatorPrintData, setCalculatorPrintData] = useState(null);
    const [showThemePicker, setShowThemePicker] = useState(false);

    // Toast
    const [toast, setToast] = useState(null);

    // Avatar
    const [avatarUrl, setAvatarUrl] = useState('');

    const user = session?.user;
    const { isOnline, syncStatus, pendingCount, queueInsert, queueDelete, queueUpdate } = useOfflineSync(supabase, session);

    // saving state for Add/Edit button spinner
    const [savingTx, setSavingTx] = useState(false);

    // --- TOAST HELPER (uses user preferences) ---
    const showToast = (message, type = 'success') => {
        const prefs = getUserPrefs();
        if (!prefs.notification_enabled) return;

        // Play Sound Effect if enabled
        if (prefs.sound_enabled) {
            const vol = (prefs.sound_volume || 70) / 100;
            const dur = prefs.sound_duration || 300;
            if (type === 'error' && prefs.sound_on_error) {
                playSound('alert', vol, dur);
            } else if (message.toLowerCase().includes('delete') && prefs.sound_on_delete) {
                playSound('alert', vol, dur);
            } else if (type === 'success' && prefs.sound_on_success) {
                playSound(prefs.sound_effect || 'chime', vol, dur);
            } else if (prefs.sound_on_tx) {
                playSound(prefs.sound_effect || 'chime', vol, dur);
            }
        }

        setToast({ message, type, style: prefs.popup_style || 'pill', position: prefs.popup_position || 'bottom' });
        setTimeout(() => setToast(null), prefs.popup_duration || 3000);
    };

    // --- WORD-TO-NUMBER CONVERTER ---
    const wordToNumber = (text) => {
        const ones = {
            zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
            ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
            seventeen: 17, eighteen: 18, nineteen: 19
        };
        const tens = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
        const scales = {
            hundred: 100, thousand: 1000, lakh: 100000, lac: 100000, lakhs: 100000, million: 1000000,
            crore: 10000000, crores: 10000000, k: 1000
        };
        let t = text.toLowerCase().replace(/[,₹$]/g, '').replace(/\band\b/g, ' ')
            .replace(/\ba\s+(hundred|thousand|lakh|lac|million|crore)/g, 'one $1').trim();
        const directNum = t.match(/^(\d+(?:\.\d+)?)$/);
        if (directNum) return parseFloat(directNum[1]);
        const mixedPattern = /(\d+(?:\.\d+)?)\s*(hundred|thousand|lakh|lakhs|lac|million|crore|crores|k)\b/gi;
        let mixedMatch, mixedResult = 0, hasMixed = false;
        while ((mixedMatch = mixedPattern.exec(t)) !== null) {
            hasMixed = true;
            mixedResult += parseFloat(mixedMatch[1]) * (scales[mixedMatch[2].toLowerCase()] || 1);
        }
        if (hasMixed) {
            const remaining = t.replace(/(\d+(?:\.\d+)?)\s*(hundred|thousand|lakh|lakhs|lac|million|crore|crores|k)\b/gi, '').trim();
            const trail = remaining.match(/(\d+(?:\.\d+)?)/);
            if (trail) mixedResult += parseFloat(trail[1]);
            return mixedResult;
        }
        const words = t.split(/\s+/);
        let result = 0, current = 0, hasWordNum = false;
        for (const word of words) {
            if (ones[word] !== undefined) { current += ones[word]; hasWordNum = true; }
            else if (tens[word] !== undefined) { current += tens[word]; hasWordNum = true; }
            else if (word === 'hundred') { current = (current || 1) * 100; hasWordNum = true; }
            else if (scales[word] && scales[word] >= 1000) { current = (current || 1) * scales[word]; result += current; current = 0; hasWordNum = true; }
        }
        result += current;
        if (hasWordNum && result > 0) return result;
        const digitMatch = text.match(/(\d+(?:\.\d+)?)/);
        return digitMatch ? parseFloat(digitMatch[1]) : 0;
    };

    // --- SMART AUTO-CATEGORIZATION (default + user custom categories) ---
    const autoCategorize = (title) => {
        if (!title) return 'Other';
        const t = title.toLowerCase();
        const kwMap = {
            'Food': ['starbucks', 'food', 'swiggy', 'zomato', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'dining', 'eat', 'lunch', 'dinner', 'breakfast', 'snack', 'bakery', 'kitchen', 'biryani', 'dominos', 'mcdonalds', 'kfc'],
            'Transport': ['uber', 'ola', 'taxi', 'cab', 'bus', 'train', 'metro', 'fuel', 'petrol', 'diesel', 'parking', 'flight', 'auto', 'rickshaw', 'rapido'],
            'Shopping': ['amazon', 'flipkart', 'clothes', 'grocery', 'walmart', 'myntra', 'shopping', 'mall', 'store', 'dmart', 'reliance', 'bigbasket', 'meesho', 'ajio'],
            'Entertainment': ['netflix', 'spotify', 'subscription', 'movie', 'prime', 'hotstar', 'disney', 'youtube', 'gaming', 'game', 'cinema', 'theatre', 'concert'],
            'Bills': ['bill', 'electricity', 'water', 'wifi', 'internet', 'recharge', 'broadband', 'jio', 'airtel', 'vi', 'bsnl', 'gas', 'rent', 'emi', 'loan'],
            'Health': ['health', 'doctor', 'pharmacy', 'medical', 'medicine', 'hospital', 'clinic', 'apollo', 'dental', 'gym', 'fitness'],
            'Salary': ['salary', 'wage', 'bonus', 'paycheck', 'stipend', 'freelance'],
            'Travel': ['travel', 'hotel', 'booking', 'trip', 'vacation', 'holiday', 'oyo', 'makemytrip', 'goibibo', 'airbnb'],
            'Investment': ['invest', 'mutual fund', 'stock', 'share', 'sip', 'fd', 'fixed deposit', 'ppf', 'nps', 'gold', 'crypto', 'bitcoin'],
            'Education': ['education', 'course', 'tuition', 'school', 'college', 'book', 'udemy', 'coursera', 'exam', 'study'],
            'Groceries': ['grocery', 'vegetables', 'fruits', 'dmart', 'bigbasket', 'blinkit', 'zepto', 'instamart'],
            'Fuel': ['fuel', 'petrol', 'diesel', 'cng', 'gas station'],
            'Insurance': ['insurance', 'lic', 'premium', 'policy'],
            'Subscriptions': ['subscription', 'monthly', 'annual', 'renewal'],
            'Personal': ['personal', 'self', 'grooming'],
            'Gifts': ['gift', 'present', 'birthday', 'anniversary'],
            'Kids': ['kids', 'child', 'baby', 'diaper', 'toy'],
            'Pets': ['pet', 'dog', 'cat', 'vet'],
            'Beauty': ['beauty', 'salon', 'parlour', 'spa', 'cosmetic', 'makeup'],
        };
        for (const [cat, kws] of Object.entries(kwMap)) {
            if (kws.some(kw => t.includes(kw))) return cat;
        }
        // Check user-added custom categories
        if (userCategories && userCategories.length > 0) {
            for (const cat of userCategories) {
                const name = (cat.name || cat).toLowerCase();
                if (t.includes(name)) return cat.name || cat;
            }
        }
        return txForm.category;
    };

    const handleVoiceTransaction = async () => {
        const groqKey = import.meta.env.VITE_GROQ_API_KEY;

        if (!groqKey) {
            showToast('Voice requires VITE_GROQ_API_KEY in .env', 'error');
            return;
        }

        // Use MediaRecorder + Groq Whisper (works on ALL browsers)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Don't force webm, let browser pick (iOS Safari doesn't support webm recording)
            const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {};
            const mediaRecorder = new MediaRecorder(stream, options);
            const audioChunks = [];

            setIsListeningTx(true);
            showToast('🎤 Recording... Speak now! (5 seconds)', 'info');

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop()); // Release mic
                showToast('⏳ Transcribing with AI...', 'info');

                try {
                    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/mp4' });
                    const fileExtension = mediaRecorder.mimeType.includes('webm') ? 'webm' : 'm4a';
                    const formData = new FormData();
                    formData.append('file', audioBlob, `voice.${fileExtension}`);
                    formData.append('model', 'whisper-large-v3-turbo');
                    formData.append('language', 'en');

                    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${groqKey}` },
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error(`Whisper error: ${response.status}`);
                    }

                    const data = await response.json();
                    const transcript = data.text?.trim();

                    if (!transcript) {
                        showToast("Didn't catch that. Try speaking louder and clearly.", 'error');
                        setIsListeningTx(false);
                        return;
                    }

                    console.log('Whisper transcript:', transcript);
                    processVoiceText(transcript);
                } catch (err) {
                    console.error('Whisper transcription error:', err);
                    showToast('Transcription failed. Please try again.', 'error');
                }
                setIsListeningTx(false);
            };

            mediaRecorder.start();

            // Auto-stop after 5 seconds
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 5000);

        } catch (err) {
            console.error('Mic access error:', err);
            setIsListeningTx(false);
            if (err.name === 'NotAllowedError') {
                showToast('Microphone access denied. Allow mic in browser settings.', 'error');
            } else {
                showToast('Could not access microphone. Check permissions.', 'error');
            }
        }
    };

    const processVoiceText = (rawText) => {
        const text = rawText.toLowerCase();

        // Extract amount using word-to-number (handles "fifteen", "2 lakh", "fifty thousand", etc.)
        const amountPhrases = [
            /(?:spent|paid|cost|for|of|worth|was)\s+(.+?)(?:\s+(?:on|for|at|in|to|rupees?|rs|bucks?)|$)/i,
            /(?:earned|received|got|salary|income|credited)\s+(.+?)(?:\s+(?:from|as|today|this)|$)/i,
            /(\d[\d,\.]*\s*(?:lakh|lac|lakhs?|thousand|hundred|k|crore|crores?)?)/i,
        ];
        let amount = 0;
        for (const pattern of amountPhrases) {
            const match = text.match(pattern);
            if (match) {
                const parsed = wordToNumber(match[1]);
                if (parsed > 0) { amount = parsed; break; }
            }
        }
        if (amount === 0) amount = wordToNumber(text);

        const category = autoCategorize(text);
        const isIncome = /(?:earned|received|got|income|salary|paid me|credited|refund|bonus|stipend|freelance)/i.test(text);

        setTxForm(prev => ({
            ...prev,
            title: rawText.charAt(0).toUpperCase() + rawText.slice(1),
            amount: amount > 0 ? amount.toString() : '',
            category: category || 'Other',
            type: isIncome ? 'income' : 'expense'
        }));

        showToast(`✅ Voice: ${isIncome ? 'Income' : 'Expense'} ₹${amount || '—'} → ${category}`, 'success');
    };

    // --- DATA FETCHING ---
    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        // Load cached data immediately (offline support)
        const cached = localStorage.getItem(`cached_tx_${user.id}`);
        if (cached) {
            setTransactions(JSON.parse(cached));
            setLoading(false);
        }

        if (isOnline) {
            const t0 = Date.now();
            console.debug('%c📦 Fetching transactions…', 'color:#f97316;font-weight:bold', { userId: user.id });
            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false });

                const ms = Date.now() - t0;
                if (error) {
                    console.error('%c🔴 transactions fetch error', 'color:#ef4444;font-weight:bold', {
                        message: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint,
                        ms,
                    });
                    // Hint for common errors
                    if (error.code === '42P01') console.error('   ↳ Table "transactions" does not exist — did you run supabase_setup_NEW.sql?');
                    if (error.code === 'PGRST301') console.error('   ↳ RLS policy blocked the query. Check Supabase → Auth → Policies.');
                } else {
                    console.debug('%c✅ transactions loaded', 'color:#22c55e;font-weight:bold', `${data.length} rows in ${ms}ms`);
                    setTransactions(data);
                    localStorage.setItem(`cached_tx_${user.id}`, JSON.stringify(data));
                }
            } catch (err) {
                console.error('%c🔴 transactions network error', 'color:#ef4444;font-weight:bold', err.message);
            }
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
        if (!txForm.title || !txForm.amount || savingTx) return;
        const newTx = {
            user_id: user.id,
            title: txForm.title.trim(),
            amount: parseFloat(txForm.amount),
            type: txForm.type,
            category: txForm.category,
            date: txForm.date
        };

        setSavingTx(true);

        if (editTransaction) {
            // Optimistic update
            setTransactions(prev => prev.map(t => t.id === editTransaction.id ? { ...t, ...newTx } : t));
            setShowTransaction(false);
            setEditTransaction(null);
            setTxForm({ title: '', amount: '', type: 'expense', category: 'Other', date: new Date().toISOString().split('T')[0] });

            if (isOnline) {
                const { error } = await supabase.from('transactions').update(newTx).eq('id', editTransaction.id);
                if (error) {
                    showToast('Update failed: ' + error.message, 'error');
                    // Revert
                    setTransactions(prev => prev.map(t => t.id === editTransaction.id ? { ...t, ...editTransaction } : t));
                } else {
                    showToast('Transaction updated! ✏️');
                    // Sync cache
                    const cached = JSON.parse(localStorage.getItem(`cached_tx_${user.id}`) || '[]');
                    localStorage.setItem(`cached_tx_${user.id}`, JSON.stringify(
                        cached.map(t => t.id === editTransaction.id ? { ...t, ...newTx } : t)
                    ));
                }
            } else {
                queueUpdate(editTransaction.id, newTx);
                showToast('Saved offline — will sync when online 📶');
            }
        } else {
            // Optimistic: add a temp local entry immediately
            const localId = `local_${Date.now()}`;
            const localTx = { ...newTx, id: localId, _pending: true };
            setTransactions(prev => [localTx, ...prev]);
            setShowTransaction(false);
            setTxForm({ title: '', amount: '', type: 'expense', category: 'Other', date: new Date().toISOString().split('T')[0] });

            if (isOnline) {
                const { data, error } = await supabase.from('transactions').insert([newTx]).select();
                if (error) {
                    // Remove optimistic entry on failure
                    setTransactions(prev => prev.filter(t => t.id !== localId));
                    showToast('Save failed: ' + error.message, 'error');
                    if (error.code === '42P01') console.error('Table "transactions" does not exist. Run supabase_setup_NEW.sql.');
                } else if (data?.[0]) {
                    // Replace local entry with real one from DB
                    setTransactions(prev => prev.map(t => t.id === localId ? data[0] : t));
                    showToast('Transaction added! ✅');

                    // Update cache
                    const cached = JSON.parse(localStorage.getItem(`cached_tx_${user.id}`) || '[]');
                    localStorage.setItem(`cached_tx_${user.id}`, JSON.stringify([data[0], ...cached.filter(t => t.id !== localId)]));
                }

                // Increment category usage_count (fire-and-forget)
                const cat = userCategories.find(c => c.name === txForm.category);
                if (cat?.id) {
                    supabase.from('categories').update({ usage_count: (cat.usage_count || 0) + 1 }).eq('id', cat.id);
                    setUserCategories(prev => prev.map(c => c.id === cat.id ? { ...c, usage_count: (c.usage_count || 0) + 1 } : c));
                }
            } else {
                // Queue for later sync
                queueInsert(newTx);
                showToast('Saved offline — will sync when online 📶');
                // Keep the optimistic entry as-is (marked _pending)
            }
        }

        setSavingTx(false);
    };

    const handleDeleteTransaction = async (id) => {
        // Optimistic remove
        const tx = transactions.find(t => t.id === id);
        setTransactions(prev => prev.filter(t => t.id !== id));

        if (isOnline) {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) {
                // Revert
                if (tx) setTransactions(prev => [tx, ...prev]);
                showToast('Delete failed: ' + error.message, 'error');
            } else {
                showToast('Transaction deleted', 'info');
                // Update cache
                const cached = JSON.parse(localStorage.getItem(`cached_tx_${user.id}`) || '[]');
                localStorage.setItem(`cached_tx_${user.id}`, JSON.stringify(cached.filter(t => t.id !== id)));
            }
        } else {
            queueDelete(id);
            showToast('Deleted offline — will sync when online 📶');
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

    // High-quality PDF Generator (html2canvas)
    const generateHighQualityPDF = async () => {
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;left:-9999px;top:0;width:210mm;background:#fff;z-index:-1;';
        document.body.appendChild(container);

        const root = ReactDOM.createRoot(container);
        await new Promise((resolve) => {
            root.render(
                <div id="print-root-export">
                    <PrintStyles />
                    <PrintableReport
                        user={user}
                        stats={stats}
                        transactions={filteredTransactions}
                        filterLabel={filterLabel}
                    />
                </div>
            );
            setTimeout(resolve, 1500);
        });

        const element = container.querySelector('#print-root-export');
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: 794,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pageHeight = 297;
        let yOffset = 0;

        while (yOffset < pdfHeight) {
            if (yOffset > 0) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfWidth, pdfHeight);
            yOffset += pageHeight;
        }

        root.unmount();
        document.body.removeChild(container);

        const pdfBlob = pdf.output('blob');
        return new File([pdfBlob], `OrangeFin_Report_${(filterLabel || 'All_Time').replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
    };

    // Calculator PDF → uses window.print() via PrintView (same premium design as analytics)
    const handleCalcPrint = (toolName, inputData, result) => {
        // Build inputs display object (filter out empty/zero values)
        const inputLabels = {
            amount: toolName.includes('SIP') ? 'Monthly Investment (₹)' : 'Investment Amount (₹)',
            duration: 'Time Period (Years)',
            rate: 'Expected Return Rate (%)',
            expense_ratio: 'Expense Ratio (%)',
        };
        const inputs = Object.fromEntries(
            Object.entries(inputLabels)
                .filter(([k]) => inputData[k] && parseFloat(inputData[k]) > 0)
                .map(([k, label]) => [label, inputData[k]])
        );

        setCalculatorPrintData({ toolName, inputs, result });
        setPrintVariant('classic');   // uses the CalculatorReport component inside PrintView
        setIsPrinting(true);
        setShowCalculator(null);      // close modal so it doesn't bleed into print
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
            setCalculatorPrintData(null);
        }, 600);
    };

    // Download analytics report as high-quality PDF
    const handleDownloadReport = async () => {
        setIsSharing(true); // Reuse isSharing state for loading spinner on the UI
        try {
            const file = await generateHighQualityPDF();
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
        setIsSharing(false);
    };

    // Share report
    const handleShare = async () => {
        setIsSharing(true);
        try {
            const file = await generateHighQualityPDF();
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Financial Report',
                    text: 'My financial report from Orange Finance'
                });
            } else {
                // fallback to download
                const url = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Report downloaded (Share not supported)! 📊');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share error:', err);
                showToast('Share failed: ' + err.message, 'error');
            }
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
            const publicUrl = urlData.publicUrl;
            // Save URL to Supabase auth user metadata so it persists across sessions
            await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
            setAvatarUrl(publicUrl);
            showToast('Profile photo updated! 📸');
        } else {
            console.error('Avatar upload error:', uploadError);
            showToast('Upload failed: ' + uploadError.message, 'error');
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
                                <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight">Orange Finance</h1>
                                {/* ── Online / Offline / Syncing chip ── */}
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {syncStatus === 'syncing' ? (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Syncing…</span>
                                        </>
                                    ) : syncStatus === 'synced' ? (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Synced ✓</span>
                                        </>
                                    ) : syncStatus === 'offline' || !isOnline ? (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                                                Offline{pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Online</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowSupport(true)}
                                className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                            >
                                <Headphones size={20} />
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => window.location.href = '/admin'}
                                    className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-all border border-rose-100"
                                >
                                    <ShieldCheck size={20} />
                                </button>
                            )}
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
                                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Financial Tools</h2>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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
                                            <Loader2 className="animate-spin text-orange-400" size={28} />
                                        </div>
                                    ) : filteredTransactions.length === 0 ? (
                                        <div className="text-center py-16">
                                            <Receipt className="mx-auto text-slate-200 mb-4" size={48} />
                                            <p className="text-sm font-semibold text-slate-400">No transactions yet</p>
                                            <p className="text-xs text-slate-300 mt-1">Tap the + button to add your first one</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <AnimatePresence>
                                                {filteredTransactions.slice(0, 20).map(tx => (
                                                    <TransactionItem
                                                        key={tx.id}
                                                        transaction={tx}
                                                        categories={userCategories}
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

                                {/* Report Actions */}
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900">Financial Report</h3>
                                            <p className="text-[10px] text-slate-400 font-medium">Export or preview your data</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={handleDownloadReport}
                                            disabled={isSharing}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95 min-w-[120px]"
                                        >
                                            {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                            {isSharing ? 'Generating...' : 'Download'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCalculatorPrintData(null);
                                                setPreviewZoom(1);
                                                setIsPrinting(true);
                                            }}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                                        >
                                            <Eye size={14} /> Preview
                                        </button>
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
                                onClick={() => setShowVoiceAssistant(true)}
                                className="flex flex-col items-center gap-0.5 py-2.5 px-4 sm:px-5 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
                            >
                                <Mic size={20} strokeWidth={1.5} />
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">Voice</span>
                            </button>
                            <button
                                onClick={() => setShowChatbot(true)}
                                className="flex flex-col items-center gap-0.5 py-2.5 px-4 sm:px-5 rounded-2xl text-slate-400 hover:text-rose-600 transition-all active:scale-90 relative"
                            >
                                <Bot size={20} strokeWidth={1.5} />
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">Chat</span>
                                <span className="absolute top-2 right-[18px] flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
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
                                            onChange={e => {
                                                const newTitle = e.target.value;
                                                setTxForm(prev => ({
                                                    ...prev,
                                                    title: newTitle,
                                                    category: autoCategorize(newTitle)
                                                }));
                                            }}
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
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={handleVoiceTransaction}
                                                className={`w-full flex items-center justify-center gap-3 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm ${isListeningTx ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                                            >
                                                <Mic size={16} />
                                                {isListeningTx ? "Listening... Speak now" : "Voice to Transaction (Try 'I spent 15 on a taxi')"}
                                            </button>

                                            <button
                                                onClick={() => { setShowTransaction(false); setTimeout(() => setShowScanner(true), 200); }}
                                                className="w-full flex items-center justify-center gap-3 bg-orange-50 text-orange-600 px-5 py-3 rounded-2xl text-xs font-bold hover:bg-orange-100 transition-colors shadow-sm"
                                            >
                                                <ScanLine size={16} />
                                                Scan receipt instead
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-1">
                                    <button
                                        onClick={handleAddTransaction}
                                        disabled={savingTx || !txForm.title || !txForm.amount}
                                        className={`w-full py-4 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${txForm.type === 'income'
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                                            : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800'
                                            }`}
                                    >
                                        {savingTx ? (
                                            <><Loader2 size={20} className="animate-spin" /> Saving…</>
                                        ) : editTransaction ? (
                                            '✓ Update Transaction'
                                        ) : isOnline ? (
                                            '+ Add Transaction'
                                        ) : (
                                            '+ Add Offline (will sync)'
                                        )}
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
                    transactions={filteredTransactions}
                    stats={stats}
                    filterLabel={filterLabel}
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

                {/* AI Chatbot component */}
                <AIChatbot
                    isOpen={showChatbot}
                    onClose={() => setShowChatbot(false)}
                    transactions={filteredTransactions}
                    userName={firstName}
                />

                {/* Voice Assistant component */}
                <VoiceAssistantModal
                    isOpen={showVoiceAssistant}
                    onClose={() => setShowVoiceAssistant(false)}
                    transactions={filteredTransactions}
                    userName={firstName}
                />

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
                        className="fixed inset-0 z-[9998] bg-slate-100 overflow-y-auto no-print flex flex-col"
                    >
                        {/* Preview toolbar */}
                        <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200 px-6 py-3 flex items-center justify-between no-print">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsPrinting(false)}
                                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <Eye size={18} className="text-orange-500" />
                                <span className="text-sm font-bold text-slate-800">
                                    Report Preview
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Zoom controls */}
                                <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setPreviewZoom(z => Math.max(0.5, z - 0.25))}
                                        className="p-1 px-2 hover:bg-white rounded-md text-slate-500 font-bold transition-colors"
                                    >-</button>
                                    <span className="text-xs font-bold w-12 text-center text-slate-600">{Math.round(previewZoom * 100)}%</span>
                                    <button
                                        onClick={() => setPreviewZoom(z => Math.min(2, z + 0.25))}
                                        className="p-1 px-2 hover:bg-white rounded-md text-slate-500 font-bold transition-colors"
                                    >+</button>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDownloadReport}
                                        disabled={isSharing}
                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-5 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        <span className="hidden sm:inline">{isSharing ? 'Generating...' : 'Download'}</span>
                                    </button>
                                    <button
                                        onClick={() => setIsPrinting(false)}
                                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                                    >
                                        <X size={14} /> <span className="hidden sm:inline">Close</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Render full PrintView here for preview with zoom */}
                        <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center">
                            <div
                                className="bg-white shadow-xl max-w-[210mm] w-full transition-transform origin-top"
                                style={{ transform: `scale(${previewZoom})`, marginBottom: `${(previewZoom - 1) * 100}%` }}
                            >
                                <PrintView
                                    user={user}
                                    stats={stats}
                                    transactions={filteredTransactions}
                                    filterLabel={filterLabel}
                                    calculatorData={null}
                                    isPrinting={true}
                                    variant="classic"
                                />
                            </div>
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
