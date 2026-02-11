import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Scan, Image as ImageIcon, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { Button } from '../ui/Primitives';

export const ReceiptScanner = ({ isOpen, onClose, onScanComplete }) => {
    const [file, setFile] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [preview, setPreview] = useState(null);
    const [extracted, setExtracted] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setExtracted(null);
        }
    };

    const runOCR = async () => {
        if (!file) return;
        setScanning(true);
        try {
            const { data: { text } } = await Tesseract.recognize(file, 'eng');

            const amountMatch = text.match(/(?:total|amt|amount|rs|₹)\s*[:.]?\s*(\d+(?:[.,]\d{2})?)/i);
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;

            const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/);
            const date = dateMatch ? dateMatch[1] : new Date().toLocaleDateString();

            const titleMatch = text.split('\n')[0].trim();

            setExtracted({ title: titleMatch || 'Scanned Receipt', amount, date });
        } catch (err) {
            console.error(err);
            alert("Scan failed. Try again.");
        } finally {
            setScanning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Scan className="text-orange-500" /> AI Scanner
                        </h2>
                        <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={20} /></button>
                    </div>

                    {!preview ? (
                        <div
                            onClick={() => document.getElementById('receipt-input').click()}
                            className="border-4 border-dashed border-orange-100 rounded-[2rem] p-12 text-center cursor-pointer hover:bg-orange-50 transition-colors group"
                        >
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <ImageIcon className="text-orange-600" size={32} />
                            </div>
                            <p className="font-bold text-gray-600">Upload Receipt</p>
                            <p className="text-xs text-gray-400 mt-2">Supports PNG, JPG</p>
                            <input id="receipt-input" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative rounded-2xl overflow-hidden border-2 border-orange-100 h-48 bg-gray-50 shadow-inner">
                                <img src={preview} className="w-full h-full object-contain" alt="Preview" />
                                <button onClick={() => setPreview(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm hover:bg-black/70"><X size={16} /></button>
                            </div>

                            {scanning ? (
                                <div className="text-center py-6">
                                    <Loader2 className="animate-spin mx-auto text-orange-500 mb-2" size={32} />
                                    <p className="font-bold text-gray-600">Extracting Data...</p>
                                </div>
                            ) : extracted ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-3">
                                    <h4 className="text-[10px] font-bold text-orange-800 uppercase tracking-widest">Extracted Info</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">Description</span>
                                        <span className="font-bold text-gray-900">{extracted.title}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">Amount</span>
                                        <span className="font-bold text-orange-600 text-xl">₹ {extracted.amount}</span>
                                    </div>
                                    <Button
                                        variant="orange"
                                        onClick={() => { onScanComplete(extracted); onClose(); }}
                                        className="w-full mt-2"
                                    >
                                        Confirm & Add
                                    </Button>
                                </motion.div>
                            ) : (
                                <Button onClick={runOCR} variant="orange" className="w-full py-4 shadow-xl">
                                    Start AI Extraction
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
