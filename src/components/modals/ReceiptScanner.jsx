import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, UploadCloud } from 'lucide-react';
import Tesseract from 'tesseract.js';

// Smart receipt parsing using Groq AI (text-based, after OCR)
const parseWithGroq = async (ocrText, groqKey) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert receipt parser. Given OCR text from a receipt image, extract:
1. The TOTAL amount paid (number only, no currency symbols). Look for keywords like "Total", "Grand Total", "Amount Due", "Net Amount", "Balance Due", "Subtotal". Pick the largest final total.
2. The Category (choose one: Food, Shopping, Transport, Utilities, Entertainment, Health, Education, Personal Care, Bills, or Other).
3. A short vendor/store name.

IMPORTANT: Return ONLY a JSON object, no other text. Format: {"amount": 5.50, "category": "Food", "title": "Starbucks"}`
                },
                {
                    role: 'user',
                    content: `Parse this receipt text:\n\n${ocrText}`
                }
            ],
            max_tokens: 150,
            temperature: 0.1,
        }),
    });

    if (!response.ok) {
        throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();
    let text = data.choices[0]?.message?.content || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
};

// Fallback: Smart regex-based parsing when AI is unavailable
const parseWithRegex = (ocrText) => {
    const text = ocrText.toLowerCase();

    // Find the total amount - look for keywords near numbers
    const totalPatterns = [
        /(?:grand\s*total|total\s*amount|amount\s*due|net\s*amount|balance\s*due|total)\s*[:\-]?\s*[₹$€£]?\s*([\d,]+\.?\d*)/i,
        /[₹$€£]\s*([\d,]+\.\d{2})/g,
        /([\d,]+\.\d{2})/g,
    ];

    let amount = 0;
    for (const pattern of totalPatterns) {
        const matches = ocrText.match(pattern);
        if (matches) {
            // For total-keyword patterns, grab the captured group
            const match = pattern.exec(ocrText);
            if (match && match[1]) {
                amount = parseFloat(match[1].replace(/,/g, ''));
                break;
            }
            // For generic number patterns, pick the largest (likely the total)
            if (matches.length > 0) {
                const amounts = matches.map(m => parseFloat(m.replace(/[₹$€£,\s]/g, ''))).filter(n => !isNaN(n) && n > 0);
                if (amounts.length > 0) {
                    amount = Math.max(...amounts);
                    break;
                }
            }
        }
    }

    // Category detection
    let category = 'Shopping';
    if (/food|restaurant|cafe|coffee|starbucks|swiggy|zomato|pizza|burger|dine|eat|kitchen|bakery/i.test(text)) category = 'Food';
    else if (/uber|ola|taxi|cab|fuel|petrol|diesel|parking|metro|bus|train|flight/i.test(text)) category = 'Transport';
    else if (/pharmacy|medicine|hospital|doctor|clinic|health|medical|apollo/i.test(text)) category = 'Health';
    else if (/electricity|water|gas|wifi|internet|broadband|recharge|bill|jio|airtel/i.test(text)) category = 'Bills';
    else if (/netflix|amazon prime|spotify|movie|cinema|ticket|entertainment/i.test(text)) category = 'Entertainment';
    else if (/amazon|flip|kart|myntra|mall|grocery|store|mart|reliance|dmart|bigbasket/i.test(text)) category = 'Shopping';

    // Title: try to find the store name (usually first meaningful line)
    const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 2 && l.length < 50);
    let title = 'Scanned Receipt';
    if (lines.length > 0) {
        // Skip lines that are just numbers or dates
        const nameLine = lines.find(l => !/^\d+[\.\-\/]/.test(l) && !/^(date|time|tel|ph|fax|gstin|gst)/i.test(l));
        if (nameLine) title = nameLine.slice(0, 40);
    }

    return { amount, category, title };
};

export const ReceiptScanner = ({ isOpen, onClose, onScanComplete }) => {
    const fileRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [progressStatus, setProgressStatus] = useState("Analyzing receipt...");
    const [progress, setProgress] = useState(0);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setScanning(true);
            setProgress(0);
            setProgressStatus("Reading receipt text...");

            try {
                // Step 1: OCR with Tesseract
                const { data: { text: ocrText } } = await Tesseract.recognize(file, 'eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 70)); // 0-70% for OCR
                        }
                    }
                });

                if (!ocrText || ocrText.trim().length < 5) {
                    alert("Couldn't read any text from the image. Please try a clearer photo.");
                    setScanning(false);
                    return;
                }

                console.log("OCR Text:", ocrText);
                setProgress(75);

                // Step 2: Parse with AI or fallback to regex
                let parsedData;
                const groqKey = import.meta.env.VITE_GROQ_API_KEY;

                if (groqKey) {
                    try {
                        setProgressStatus("AI is analyzing the receipt...");
                        parsedData = await parseWithGroq(ocrText, groqKey);
                        setProgress(95);
                    } catch (aiErr) {
                        console.warn("Groq AI parsing failed, using smart regex:", aiErr.message);
                        setProgressStatus("Using smart parser...");
                        parsedData = parseWithRegex(ocrText);
                    }
                } else {
                    setProgressStatus("Parsing receipt data...");
                    parsedData = parseWithRegex(ocrText);
                }

                setProgress(100);

                onScanComplete({
                    amount: Number(parsedData.amount) || 0,
                    category: parsedData.category || 'Shopping',
                    title: parsedData.title || 'Scanned Receipt',
                    date: new Date().toISOString()
                });
                setScanning(false);
                onClose();

            } catch (err) {
                console.error("Scanner Error:", err);
                setScanning(false);
                alert("Failed to scan receipt. Please try again with a clearer image.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                onClick={onClose}
            >
                <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center relative" onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                        <X size={20} />
                    </button>

                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        {scanning ? (
                            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                        ) : (
                            <Camera size={32} className="text-orange-500" />
                        )}
                        {scanning && <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2">Scan Receipt</h3>
                    <p className="text-slate-500 mb-8 text-sm">Upload a receipt image and our AI will extract the total amount, categorize the expense, and find the vendor name.</p>

                    {scanning ? (
                        <div className="mb-6 flex flex-col items-center">
                            <p className="font-bold text-orange-500 mb-2 animate-pulse text-sm">{progressStatus}</p>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden w-full mb-1">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400">{progress}%</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => document.getElementById('cameraInput').click()}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                            >
                                <Camera size={20} /> Take Photo
                            </button>
                            <button
                                onClick={() => document.getElementById('galleryInput').click()}
                                className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-none active:scale-95"
                            >
                                <UploadCloud size={20} /> Upload Image
                            </button>
                        </div>
                    )}

                    <input id="cameraInput" type="file" onChange={handleFile} className="hidden" accept="image/*" capture="environment" />
                    <input id="galleryInput" type="file" onChange={handleFile} className="hidden" accept="image/*" />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
