import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Loader2, MonitorSmartphone, Send, Image as ImageIcon, Link2, Sparkles, X, CheckCircle, AlertTriangle } from 'lucide-react';

export const AdminPush = ({ users, showToast }) => {
    const [title, setTitle] = useState('Message from Orange Finance HQ');
    const [message, setMessage] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // UI State
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // AI Content
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Targeting
    const [targetType, setTargetType] = useState('all'); // all, active_only, specific
    const [targetUsers, setTargetUsers] = useState([]);

    const activeDeviceCount = users.filter(u => u.push_subscribed).length; // Just dummy approximation if not tracked directly in users array

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
            const fileName = `push_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `campaigns/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('campaigns').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('campaigns').getPublicUrl(filePath);
            setImageUrl(urlData.publicUrl);
            showToast('Image attached to push successfully', 'success');
        } catch (error) {
            console.error('Image upload error:', error);
            showToast("Failed to upload image. Ensure public 'campaigns' storage bucket exists.", "error");
        } finally {
            setIsUploadingImage(false);
            e.target.value = ''; // Reset input
        }
    };

    const generateAIContent = async () => {
        if (!aiPrompt.trim()) return;
        setIsGeneratingAI(true);
        try {
            const promptContext = `Write a short, engaging push notification body (max 2 sentences, ~120 chars) for an app called Orange Finance based on this idea: "${aiPrompt}". No hashtags.`;

            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'user', content: promptContext }
                    ],
                    temperature: 0.7
                })
            });
            const data = await res.json();
            if (data.choices && data.choices[0]) {
                const text = data.choices[0].message.content.trim().replace(/^"|"$/g, '');
                setMessage(text);
                showToast('AI Content Generated', 'success');
            }
        } catch (e) {
            console.error('Groq AI error:', e);
            showToast('Failed to generate AI content.', 'error');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleSendPush = async () => {
        if (!title.trim() || !message.trim()) {
            return showToast("Title and message are required for push.", "error");
        }

        if (!window.confirm("Broadcast this push notification globally?")) return;

        setIsSending(true);
        try {
            const payload = {
                title,
                body: message,
                icon: 'https://fin.swinfosystems.online/favicon.ico'
            };

            if (linkUrl.trim()) payload.url = linkUrl.trim();
            if (imageUrl.trim()) payload.image = imageUrl.trim();

            const res = await fetch('/api/send-push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to send');
            }

            showToast(`Broadcast Complete! Reached ${data.sentCount} devices.`, 'success');

            // Clear form
            setMessage('');
            setTitle('Message from Orange Finance HQ');
            setImageUrl('');
            setLinkUrl('');
        } catch (err) {
            showToast(err.message, "error");
        }
        setIsSending(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-black">
                            <MonitorSmartphone size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Push Notification Hub</h2>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
                                Global Device Broadcast Center
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Title & Link */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Notification Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Special Offer!"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Link2 size={14} /> Action Link (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    onChange={e => setLinkUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* Message & AI */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest">Body Message</label>
                                <span className="text-[10px] font-bold text-slate-400">{message.length}/150 chars</span>
                            </div>

                            <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl flex gap-2">
                                <Sparkles size={16} className="text-purple-500 shrink-0 mt-1" />
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        placeholder="AI: Tell users about our new dark mode feature..."
                                        className="flex-1 bg-white px-3 py-2 rounded-lg border border-purple-200 text-xs font-bold focus:outline-none"
                                        onKeyDown={e => e.key === 'Enter' && generateAIContent()}
                                    />
                                    <button
                                        onClick={generateAIContent}
                                        disabled={isGeneratingAI || !aiPrompt.trim()}
                                        className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                    >
                                        {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : 'Generate'}
                                    </button>
                                </div>
                            </div>

                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                maxLength={150}
                                placeholder="Type the push notification text here..."
                                className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none resize-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                        </div>

                        {/* Big Image Feature */}
                        <div>
                            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ImageIcon size={14} /> Rich Media Image (Optional)
                            </label>

                            <div className="mt-2">
                                {imageUrl ? (
                                    <div className="relative w-full h-48 bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden group">
                                        <img src={imageUrl} alt="Push Attachment" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => setImageUrl('')}
                                                className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-rose-600 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all"
                                            >
                                                <X size={14} /> Remove Image
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        <div className="relative flex-1 p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-purple-50 hover:border-purple-300 transition-colors cursor-pointer group">
                                            {isUploadingImage ? (
                                                <Loader2 size={24} className="animate-spin text-purple-500" />
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 text-slate-400 group-hover:text-purple-500 group-hover:scale-110 transition-all">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700">Upload Image</span>
                                                    <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">JPG/PNG &lt; 2MB</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                disabled={isUploadingImage}
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center gap-2">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center px-4">OR PASTE URL</p>
                                            <input
                                                type="text"
                                                value={imageUrl}
                                                onChange={e => setImageUrl(e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 mt-2">
                                * Rich Media Images are supported differently across iOS, Android, and Web. Keep aspect ratio ~ 2:1 for best results.
                            </p>
                        </div>

                    </div>
                </div>

            </div>

            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                {/* Preview Card */}
                <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-800 text-white relative overflow-hidden">
                    {/* Fake device notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl"></div>

                    <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center justify-center gap-2 mb-8 mt-2">
                        <MonitorSmartphone size={12} /> Live Preview
                    </h3>

                    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative">
                        {imageUrl && (
                            <div className="h-32 w-full bg-slate-700 overflow-hidden">
                                <img src={imageUrl} alt="Push Header" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-4 flex gap-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                                {/* Fake app icon */}
                                <div className="w-5 h-5 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Orange Finance</span>
                                    <span className="text-[9px] text-slate-500">now</span>
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-1 text-white pr-2">{title || 'Message from Orange Finance HQ'}</h4>
                                <p className="text-xs text-slate-300 leading-snug line-clamp-2">{message || 'Type your message on the left to see the live preview here.'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-purple-50 rounded-[2rem] p-6 border border-purple-100">
                    <h4 className="text-sm font-black text-purple-900 flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-purple-500" /> VAPID Ready
                    </h4>
                    <p className="text-xs text-purple-700 font-medium leading-relaxed mb-6">
                        Your push notification center is connected to the web-push VAPID gateway. It will securely broadcast directly to active user devices.
                    </p>

                    <button
                        onClick={handleSendPush}
                        disabled={isSending || !message.trim()}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-black transition-all shadow-xl ${message.trim()
                                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/30 transform hover:-translate-y-1'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {isSending ? (
                            <><Loader2 size={18} className="animate-spin" /> Broadcasting...</>
                        ) : (
                            <><Send size={18} /> Launch Global Alert</>
                        )}
                    </button>

                    {isSending && (
                        <p className="text-center text-[10px] font-bold text-purple-600 animate-pulse mt-4">
                            Establishing secure gateway connections...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
