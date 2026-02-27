import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, StopCircle, RefreshCcw, Volume2 } from 'lucide-react';

export const VoiceAssistantModal = ({ isOpen, onClose, userName, transactions }) => {
    const [state, setState] = useState('idle'); // idle, listening, processing, speaking
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const isSpeakingRef = useRef(false);

    // Stop speaking/recording when closed
    useEffect(() => {
        if (!isOpen) {
            stopEverything();
        } else {
            // Auto start listening on open
            startListening();
        }
    }, [isOpen]);

    const stopEverything = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        window.speechSynthesis.cancel();
        setState('idle');
    };

    const startListening = async () => {
        window.speechSynthesis.cancel(); // stop any ongoing speech
        setState('listening');
        setTranscript('');
        setAiResponse('');
        audioChunks.current = [];
        isSpeakingRef.current = false;
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // iOS compatible MIME type fallback
            const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {};
            mediaRecorder.current = new MediaRecorder(stream, options);

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                if (audioContextRef.current) {
                    audioContextRef.current.close().catch(() => { });
                    audioContextRef.current = null;
                }
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                if (audioChunks.current.length > 0) {
                    processAudio();
                } else {
                    setState('idle');
                }
            };

            mediaRecorder.current.start();

            // Set up Voice Activity Detection (VAD)
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioContext();
                audioContextRef.current = audioCtx;
                const source = audioCtx.createMediaStreamSource(stream);
                const analyser = audioCtx.createAnalyser();
                analyser.minDecibels = -60;
                analyser.smoothingTimeConstant = 0.2;
                source.connect(analyser);

                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const checkSilence = () => {
                    if (mediaRecorder.current?.state !== 'recording') return;

                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                    const average = sum / dataArray.length;

                    if (average > 10) { // Sound detected
                        isSpeakingRef.current = true;
                        if (silenceTimerRef.current) {
                            clearTimeout(silenceTimerRef.current);
                            silenceTimerRef.current = null;
                        }
                    } else if (isSpeakingRef.current) { // Was speaking, now silent
                        if (!silenceTimerRef.current) {
                            silenceTimerRef.current = setTimeout(() => {
                                if (mediaRecorder.current?.state === 'recording') {
                                    mediaRecorder.current.stop();
                                }
                            }, 1800); // Stop after 1.8 seconds of silence
                        }
                    }
                    requestAnimationFrame(checkSilence);
                };
                requestAnimationFrame(checkSilence);
            } catch (e) {
                console.log("VAD not supported, fallback to 10s max", e);
                setTimeout(() => {
                    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
                        mediaRecorder.current.stop();
                    }
                }, 10000);
            }
        } catch (err) {
            console.error('Mic error:', err);
            setAiResponse('Microphone access denied or error occurred.');
            setState('idle');
        }
    };

    const processAudio = async () => {
        setState('processing');
        const groqKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!groqKey) {
            setAiResponse("Groq API key is missing. Add VITE_GROQ_API_KEY.");
            setState('idle');
            return;
        }

        try {
            // 1. STT (Whisper)
            const audioBlob = new Blob(audioChunks.current, { type: mediaRecorder.current.mimeType || 'audio/mp4' });
            const fileExt = mediaRecorder.current.mimeType?.includes('webm') ? 'webm' : 'm4a';
            const formData = new FormData();
            formData.append('file', audioBlob, `voice.${fileExt}`);
            formData.append('model', 'whisper-large-v3-turbo');
            formData.append('language', 'en');

            const sttRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${groqKey}` },
                body: formData,
            });

            if (!sttRes.ok) throw new Error("Transcription failed.");
            const sttData = await sttRes.json();
            const text = sttData.text?.trim();

            if (!text) {
                setAiResponse("I didn't catch that. Could you try again?");
                speakText("I didn't catch that. Could you try again?");
                return;
            }

            setTranscript(text);

            // 2. Generate Response (LLM)
            const summary = transactions.slice(0, 10).map(t => `${t.type}: ₹${t.amount} on ${t.category}`).join(', ');

            const completionRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: `You are OrangeFin Voice Assistant. Be VERY concise, conversational, and helpful. Answer in 1 or 2 short sentences. User name: ${userName || 'user'}. Recent transactions summary: ${summary}` },
                        { role: 'user', content: text }
                    ],
                    max_tokens: 100,
                    temperature: 0.5,
                }),
            });

            if (!completionRes.ok) throw new Error("AI generation failed.");
            const aiData = await completionRes.json();
            const reply = aiData.choices[0]?.message?.content || "I couldn't process that.";

            setAiResponse(reply);
            speakText(reply);

        } catch (err) {
            console.error(err);
            setAiResponse("Something went wrong processing your voice request.");
            setState('idle');
        }
    };

    const speakText = (text) => {
        setState('speaking');

        // Clean text of emojis and bold markdown before speaking
        const cleanText = text.replace(/[*_#]/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

        if (!cleanText.trim()) {
            setState('idle');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Try getting a decent voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Male') || v.name.includes('Female')));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.05; // Slightly faster
        utterance.pitch = 1.0;

        utterance.onend = () => {
            setState('idle');
        };
        utterance.onerror = () => {
            setState('idle');
        };

        // Anti-GC bug fix for some browsers
        window.activeSpeechUtterance = utterance;

        window.speechSynthesis.speak(utterance);

        // Fallback safety timeout if browser fails to trigger onend
        const words = cleanText.split(' ').length;
        const estimatedDurationMs = Math.max(3000, words * 450);
        setTimeout(() => {
            setState(s => s === 'speaking' ? 'idle' : s);
        }, estimatedDurationMs + 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-[2rem] w-full max-w-sm p-8 text-center relative overflow-hidden flex flex-col items-center shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors z-20">
                        <X size={20} />
                    </button>

                    {/* Dynamic background blobs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-50 rounded-full blur-2xl -ml-16 -mb-16" />

                    <h2 className="text-xl font-black text-slate-800 mb-8 relative z-10">Voice Assistant</h2>

                    {/* Avatar Ring Animation */}
                    <div className="relative mb-8 z-10 flex justify-center w-full">
                        {state === 'listening' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-24 h-24 bg-rose-100 rounded-full" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="absolute w-28 h-28 bg-orange-50 rounded-full" />
                            </div>
                        )}
                        {state === 'processing' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-28 h-28 border-4 border-dashed border-indigo-200 rounded-full" />
                            </div>
                        )}
                        {state === 'speaking' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-24 h-24 bg-emerald-100 rounded-full" />
                            </div>
                        )}

                        <div className="relative w-20 h-20 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-full flex items-center justify-center shadow-xl z-20">
                            {state === 'listening' ? <Mic size={36} className="text-white" /> :
                                state === 'processing' ? <RefreshCcw size={32} className="text-white animate-spin" /> :
                                    state === 'speaking' ? <Volume2 size={36} className="text-white animate-pulse" /> :
                                        <Mic size={36} className="text-white opacity-90" />}
                        </div>
                    </div>

                    <div className="h-32 w-full relative z-10 flex flex-col items-center justify-center space-y-4">
                        {state === 'listening' && <p className="text-rose-500 font-bold animate-pulse text-lg">Listening...</p>}
                        {state === 'processing' && <p className="text-indigo-500 font-bold animate-pulse text-lg">Processing...</p>}

                        {(state === 'speaking' || state === 'idle') && transcript && (
                            <div className="flex flex-col gap-2 w-full text-left">
                                <p className="text-xs font-bold text-slate-400 bg-slate-50 p-2 rounded-lg self-end w-3/4 break-words">🗣️ "{transcript}"</p>
                                {aiResponse && (
                                    <p className="font-semibold text-slate-800 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 self-start w-[90%] break-words">
                                        {aiResponse}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex gap-3 w-full relative z-10">
                        {state === 'listening' ? (
                            <button
                                onClick={() => {
                                    if (mediaRecorder.current) mediaRecorder.current.stop();
                                }}
                                className="flex-1 bg-rose-100 text-rose-600 font-bold py-3.5 rounded-xl hover:bg-rose-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <StopCircle size={20} /> Stop
                            </button>
                        ) : (
                            <button
                                onClick={startListening}
                                className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                            >
                                Speak Again
                            </button>
                        )}
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
