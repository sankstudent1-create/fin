
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Image, UploadCloud, CheckCircle2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

export const ReceiptScanner = ({ isOpen, onClose, onScanComplete }) => {
    const fileRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setScanning(true);
            Tesseract.recognize(
                file,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
                    }
                }
            ).then(({ data: { text } }) => {
                // Basic extraction logic (regex for amount)
                const amountMatch = text.match(/[\d,]+\.\d{2}/);
                const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;

                // Simulate category extraction
                const category = text.toLowerCase().includes('food') ? 'Food' : 'Shopping';

                onScanComplete({ amount, category, title: 'Scanned Receipt', date: new Date().toISOString() });
                setScanning(false);
                onClose();
            }).catch(err => {
                console.error(err);
                setScanning(false);
                alert("Failed to scan receipt.");
            });
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
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        {scanning ? (
                            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                        ) : (
                            <Camera size={32} className="text-orange-500" />
                        )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2">Scan Receipt</h3>
                    <p className="text-slate-500 mb-8 text-sm">Upload an image to auto-detect amount and category</p>

                    {scanning ? (
                        <div className="mb-6">
                            <p className="font-bold text-orange-500 mb-2">{progress}% Analyzing...</p>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileRef.current.click()}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                        >
                            <UploadCloud size={20} /> Select Image
                        </button>
                    )}

                    <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*" />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
