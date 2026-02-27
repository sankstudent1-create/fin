import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Image, UploadCloud, CheckCircle2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const ReceiptScanner = ({ isOpen, onClose, onScanComplete }) => {
    const fileRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [progressStatus, setProgressStatus] = useState("Analyzing receipt...");

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setScanning(true);
            setProgressStatus("Uploading image...");

            try {
                // Read file as Base64 format
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = async () => {
                    setProgressStatus("Google Gemini is analyzing...");
                    const base64data = reader.result.split(',')[1];

                    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                    if (!apiKey) {
                        alert("Gemini API Key missing! Please add VITE_GEMINI_API_KEY to your .env file.");
                        setScanning(false);
                        return;
                    }

                    // Initialize Gemini
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                    const prompt = `Analyze this receipt image. Your task is to extract three pieces of information:
                    1. The total amount paid (number only, no currency symbols).
                    2. The Category of the expense (choose the best fit: Food, Shopping, Transport, Utilities, Entertainment, Health, Education, Personal Care, Bills, or Other).
                    3. A very short title or Vendor name (e.g. "Starbucks Coffee", "Walmart").
                    
                    IMPORTANT: Return the response strictly as a JSON object, with no markdown formatting or extra text.
                    Format: {"amount": 5.50, "category": "Food", "title": "Starbucks"}`;

                    const imageParts = [
                        {
                            inlineData: {
                                data: base64data,
                                mimeType: file.type
                            }
                        }
                    ];

                    const result = await model.generateContent([prompt, ...imageParts]);
                    const response = await result.response;
                    let text = response.text();

                    // Clean up any potential markdown backticks that Gemini sometimes returns
                    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

                    try {
                        const parsedData = JSON.parse(text);
                        onScanComplete({
                            amount: Number(parsedData.amount) || 0,
                            category: parsedData.category || 'Shopping',
                            title: parsedData.title || 'Scanned Receipt',
                            date: new Date().toISOString()
                        });
                        setScanning(false);
                        onClose();
                    } catch (parseError) {
                        console.error("Failed to parse Gemini JSON:", text);
                        alert("Failed to parse receipt correctly. Please try again with a clearer image.");
                        setScanning(false);
                    }
                };
            } catch (err) {
                console.error("Gemini Error:", err);
                setScanning(false);
                alert("Failed to analyze receipt. Check your connection and try again.");
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
                <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
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
                    <p className="text-slate-500 mb-8 text-sm">Upload an image and our AI will instantly extract the total amount, categorize the expense, and find the vendor name.</p>

                    {scanning ? (
                        <div className="mb-6 flex flex-col items-center">
                            <p className="font-bold text-orange-500 mb-4 animate-pulse">{progressStatus}</p>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full relative">
                                <motion.div
                                    className="absolute top-0 bottom-0 left-0 w-1/2 bg-orange-500 rounded-full"
                                    animate={{ left: ["-50%", "100%"] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileRef.current.click()}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                        >
                            <UploadCloud size={20} /> Select Receipt
                        </button>
                    )}

                    <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*" />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
