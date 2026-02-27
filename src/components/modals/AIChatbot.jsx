import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Loader2, Mic } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const AIChatbot = ({ isOpen, onClose, transactions, userName }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hi ${userName || 'there'}! I'm your AI Financial Advisor. Ask me anything about your spending, trends, or tips to save money.` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize SpeechRecognition if available
    const [isListening, setIsListening] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                setMessages(prev => [...prev, { role: 'assistant', content: "Error: Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file." }]);
                setIsLoading(false);
                return;
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Prepare context
            const txSummary = transactions.map(t => `${t.date}: ${t.title} - ₹${t.amount} (${t.category}, ${t.type})`).join('\n');
            const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0);
            const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0);

            const systemPrompt = `You are a helpful, expert AI Financial Advisor for an app called Orange Finance. 
The user's name is ${userName || 'User'}. 
Here is their financial data:
Total Income: ₹${totalIncome}
Total Expenses: ₹${totalExpense}
Balance: ₹${totalIncome - totalExpense}

Recent Transactions:
${txSummary.slice(0, 3000)} // Limiting to latest transactions if too many to avoid token limits

Answer the user's questions about their finances accurately, warmly, and concisely. Keep responses short (under 3 paragraphs). Use emojis. If they ask for advice, give practical financial tips based on their actual spending patterns in the data provided. Answer in plain text, but you can use markdown for bolding or bullet points.`;

            // Build chat history for context
            const history = messages.slice(1).map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: "Understood. I am ready to help as the AI Financial Advisor." }] },
                    ...history
                ]
            });

            const result = await chat.sendMessage(text);
            const responseText = result.response.text();

            setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);

        } catch (error) {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Oops! I'm having trouble connecting to my brain right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsListening(false);
            // Auto send after speaking
            handleSend(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
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
                                <p className="text-xs text-orange-100 font-medium">Powered by Gemini</p>
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
