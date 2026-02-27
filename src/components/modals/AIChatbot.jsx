import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Loader2, Mic, AlertTriangle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Retry helper with exponential backoff
const callWithRetry = async (fn, retries = 2, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota');
            if (is429 && i < retries - 1) {
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
            } else {
                throw err;
            }
        }
    }
};

// ── Groq API call (free, generous limits) ──
const callGroq = async (messages, apiKey) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: messages,
            max_tokens: 1024,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq error ${response.status}: ${errorData?.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I couldn't generate a response.";
};

// ── Gemini API call ──
const callGemini = async (userText, systemPrompt, chatHistory, apiKey) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const history = chatHistory.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
        history: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "Understood! I'm ready to help as your AI Financial Advisor. 🧡" }] },
            ...history
        ]
    });

    const result = await callWithRetry(() => chat.sendMessage(userText));
    return result.response.text();
};

export const AIChatbot = ({ isOpen, onClose, transactions, userName }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hi ${userName || 'there'}! 👋 I'm your AI Financial Advisor.\n\nAsk me anything like:\n• "How much did I spend this month?"\n• "What's my top spending category?"\n• "Give me tips to save money"` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [activeProvider, setActiveProvider] = useState(null); // Track which AI provider worked

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const buildSystemPrompt = () => {
        const txSummary = transactions.slice(0, 50).map(t => `${t.date}: ${t.title} - ₹${t.amount} (${t.category}, ${t.type})`).join('\n');
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0);

        const catBreakdown = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            catBreakdown[t.category] = (catBreakdown[t.category] || 0) + parseFloat(t.amount);
        });
        const catSummary = Object.entries(catBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(0)}`)
            .join(', ');

        return `You are a helpful, expert AI Financial Advisor for an app called Orange Finance. 
The user's name is ${userName || 'User'}. 
Here is their financial data:
Total Income: ₹${totalIncome.toFixed(2)}
Total Expenses: ₹${totalExpense.toFixed(2)}
Balance: ₹${(totalIncome - totalExpense).toFixed(2)}
Category Breakdown (Expenses): ${catSummary || 'No expenses yet'}

Recent Transactions (latest 50):
${txSummary || 'No transactions yet'}

Answer the user's questions about their finances accurately, warmly, and concisely. Keep responses short (under 3 paragraphs). Use emojis. If they ask for advice, give practical financial tips based on their actual spending patterns. Answer in plain text.`;
    };

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const groqKey = import.meta.env.VITE_GROQ_API_KEY;
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const systemPrompt = buildSystemPrompt();

        let responseText = null;
        let usedProvider = null;

        // Strategy: Try last successful provider first, then try the other
        const providers = activeProvider === 'gemini'
            ? ['gemini', 'groq']
            : ['groq', 'gemini']; // Default to Groq first (more reliable free tier)

        for (const provider of providers) {
            try {
                if (provider === 'groq' && groqKey) {
                    console.log('🟢 Trying Groq...');
                    const groqMessages = [
                        { role: 'system', content: systemPrompt },
                        ...messages.slice(1).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
                        { role: 'user', content: text }
                    ];
                    responseText = await callGroq(groqMessages, groqKey);
                    usedProvider = 'groq';
                    break;
                } else if (provider === 'gemini' && geminiKey) {
                    console.log('🟡 Trying Gemini...');
                    responseText = await callGemini(text, systemPrompt, messages.slice(1), geminiKey);
                    usedProvider = 'gemini';
                    break;
                }
            } catch (err) {
                console.warn(`❌ ${provider} failed:`, err.message?.slice(0, 120));
                continue;
            }
        }

        if (responseText) {
            setActiveProvider(usedProvider);
            setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
        } else {
            // No keys configured at all, or both failed
            if (!groqKey && !geminiKey) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '⚠️ No AI API key configured!\n\nPlease add at least one of these to your .env file:\n• VITE_GROQ_API_KEY (recommended, free at console.groq.com)\n• VITE_GEMINI_API_KEY (free at aistudio.google.com)'
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '⏳ Both AI providers are currently rate-limited. Please wait about 60 seconds and try again.'
                }]);
            }
        }

        setIsLoading(false);
    };

    const toggleVoiceInput = async () => {
        if (isListening) {
            setIsListening(false);
            return;
        }

        const groqKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!groqKey) {
            alert('Voice requires VITE_GROQ_API_KEY in your .env');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {};
            const mediaRecorder = new MediaRecorder(stream, options);
            const audioChunks = [];

            setIsListening(true);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                setIsListening(false);

                try {
                    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/mp4' });
                    const fileExt = mediaRecorder.mimeType.includes('webm') ? 'webm' : 'm4a';
                    const formData = new FormData();
                    formData.append('file', audioBlob, `voice.${fileExt}`);
                    formData.append('model', 'whisper-large-v3-turbo');
                    formData.append('language', 'en');

                    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${groqKey}` },
                        body: formData,
                    });

                    if (!response.ok) throw new Error(`Whisper error: ${response.status}`);

                    const data = await response.json();
                    const transcript = data.text?.trim();

                    if (transcript) {
                        setInput(transcript);
                        handleSend(transcript);
                    }
                } catch (err) {
                    console.error('Whisper error:', err);
                }
            };

            mediaRecorder.start();
            // Auto-stop after 5 seconds
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') mediaRecorder.stop();
            }, 5000);

        } catch (err) {
            setIsListening(false);
            console.error('Mic error:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-sm sm:p-6 sm:flex sm:items-center sm:justify-center p-0"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-white w-full sm:w-[450px] sm:h-[600px] h-[90vh] mt-[10vh] sm:mt-0 sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-inner">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg leading-tight">AI Advisor</h3>
                                <p className="text-xs text-orange-100 font-medium">
                                    {activeProvider === 'groq' ? 'Powered by Llama 3.3' : activeProvider === 'gemini' ? 'Powered by Gemini' : 'AI Financial Advisor'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors active:scale-95">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
                        {messages.map((msg, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-900' : 'bg-gradient-to-br from-orange-400 to-rose-400'}`}>
                                        {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                                    </div>
                                    <div className={`p-3.5 rounded-[1.25rem] text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="flex items-end gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center shrink-0 shadow-sm">
                                        <Bot size={14} className="text-white" />
                                    </div>
                                    <div className="bg-white border border-slate-100 p-4 rounded-[1.25rem] rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleVoiceInput}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                            >
                                <Mic size={20} />
                            </button>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask anything about your finances..."
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-4 pr-12 py-3.5 text-sm font-medium text-slate-700 outline-none focus:border-orange-300 focus:bg-white transition-all shadow-inner"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 transition-all hover:bg-orange-600 active:scale-95"
                                >
                                    <Send size={16} className="ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
