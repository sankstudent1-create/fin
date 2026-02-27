import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, StopCircle, RefreshCcw, Volume2, Settings2, ShieldAlert } from 'lucide-react';

export const VoiceAssistantModal = ({ isOpen, onClose, userName, transactions }) => {
    const [state, setState] = useState('idle'); // idle, listening, processing, speaking
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [conversation, setConversation] = useState([]);
    const [showDiagnostics, setShowDiagnostics] = useState(false);

    // Diagnostics State
    const [logs, setLogs] = useState([]);
    const [dbLevel, setDbLevel] = useState(-100);
    const [audioSupport, setAudioSupport] = useState({});

    // Core refs to survive renders
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);

    // Timer refs
    const silenceTimerRef = useRef(null);
    const maxRecordTimerRef = useRef(null);
    const checkSilenceFrameRef = useRef(null);

    // State flags
    const isSpeakingRef = useRef(false);
    const isAutoModeRef = useRef(true);

    const addLog = (msg, type = 'info') => {
        console.log(`[Voice ${type}]`, msg);
        setLogs(prev => [...prev.slice(-15), { time: new Date().toLocaleTimeString(), msg, type }]);
    };

    // Initializer and Cleanup
    useEffect(() => {
        // Build diagnostics info
        const support = {
            speechSynthesis: 'speechSynthesis' in window,
            AudioContext: ('AudioContext' in window || 'webkitAudioContext' in window),
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            MediaRecorder: 'MediaRecorder' in window,
            userAgent: navigator.userAgent.slice(0, 50) + "..."
        };
        setAudioSupport(support);

        // Pre-warm the voices list early
        if (support.speechSynthesis) {
            window.speechSynthesis.getVoices();
            addLog("TTS Voices pre-warmed.");
        }

        if (!isOpen) {
            stopEverything();
        } else {
            addLog("Modal Opened.");
            // On mobile, the very first user interaction sets up the audio.
            // But we can only unlock it safely on a synchronous button click.
        }

        return () => {
            stopEverything();
        };
    }, [isOpen]);

    // Force unlock TTS on iOS/Safari by playing silent audio
    const unlockAudio = () => {
        if (!window.speechSynthesis) return;
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
        addLog("Audio contextual unlock triggered natively.", "success");
    };

    const initStreamAndListen = async () => {
        isAutoModeRef.current = true;
        try {
            if (!streamRef.current) {
                addLog("Requesting mic permissions...");
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                streamRef.current = stream;
                addLog("Microphone stream acquired.", "success");
            }
            if (!audioContextRef.current) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContextRef.current = new AudioContext();
                addLog(`AudioContext initialized (${audioContextRef.current.state}).`);
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
                addLog("AudioContext resumed.", "success");
            }
            if (!analyserRef.current) {
                const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
                const analyser = audioContextRef.current.createAnalyser();
                analyser.minDecibels = -90; // highly sensitive to pick up whispers
                analyser.smoothingTimeConstant = 0.2;
                source.connect(analyser);
                analyserRef.current = analyser;
                addLog("VAD Analyser connected.");
            }
            startListening();
        } catch (err) {
            console.error(err);
            setAiResponse('Mic access denied or error occurred.');
            addLog(`Mic Error: ${err.message}`, "error");
            setState('idle');
        }
    };

    const stopEverything = () => {
        isAutoModeRef.current = false;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (checkSilenceFrameRef.current) cancelAnimationFrame(checkSilenceFrameRef.current);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (maxRecordTimerRef.current) clearTimeout(maxRecordTimerRef.current);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
            analyserRef.current = null;
        }

        window.speechSynthesis.cancel();
        setState('idle');
        addLog("Hardware components shut down.");
    };

    const startListening = () => {
        if (!streamRef.current || !isOpen) return;

        isAutoModeRef.current = true;
        window.speechSynthesis.cancel(); // kill any overlapping TTS
        setState('listening');
        setTranscript('');
        setAiResponse('');
        audioChunksRef.current = [];
        isSpeakingRef.current = false;

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (maxRecordTimerRef.current) clearTimeout(maxRecordTimerRef.current);
        if (checkSilenceFrameRef.current) cancelAnimationFrame(checkSilenceFrameRef.current);

        // Mobile fallback for looping
        const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } :
            MediaRecorder.isTypeSupported('audio/mp4') ? { mimeType: 'audio/mp4' } : {};
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
        addLog(`Started recording using ${options.mimeType || 'default'} type.`);

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (maxRecordTimerRef.current) clearTimeout(maxRecordTimerRef.current);
            if (checkSilenceFrameRef.current) cancelAnimationFrame(checkSilenceFrameRef.current);

            addLog(`Recording stopped. Chunks: ${audioChunksRef.current.length}`);

            // Only process if we caught audio and we still want to continue
            if (audioChunksRef.current.length > 0 && isAutoModeRef.current && isOpen) {
                processAudio();
            } else {
                if (isAutoModeRef.current && isOpen) startListening();
                else setState('idle');
            }
        };

        mediaRecorderRef.current.start();

        // VAD (Voice Activity Detection)
        try {
            const analyser = analyserRef.current;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const checkSilence = () => {
                if (mediaRecorderRef.current?.state !== 'recording') return;

                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const average = sum / dataArray.length;

                // Update DB level for diagnostics purely for visuals
                setDbLevel(average);

                if (average > 8) { // Speech detected
                    if (!isSpeakingRef.current) {
                        isSpeakingRef.current = true;
                        addLog(`Voice detected! DB Avg: ${average.toFixed(1)}`);
                    }

                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                        silenceTimerRef.current = null;
                    }
                    if (maxRecordTimerRef.current) {
                        clearTimeout(maxRecordTimerRef.current); // Lift the idle rule since they started speaking
                        maxRecordTimerRef.current = null;
                    }
                } else if (isSpeakingRef.current) {
                    // They were speaking, now they stopped
                    if (!silenceTimerRef.current) {
                        silenceTimerRef.current = setTimeout(() => {
                            if (mediaRecorderRef.current?.state === 'recording') {
                                addLog("Silence timeout reached. Submitting...");
                                mediaRecorderRef.current.stop();
                            }
                        }, 1200); // Wait 1.2s to ensure they are done speaking
                    }
                }
                checkSilenceFrameRef.current = requestAnimationFrame(checkSilence);
            };
            checkSilenceFrameRef.current = requestAnimationFrame(checkSilence);
        } catch (e) {
            addLog(`VAD error: ${e.message}`, "error");
        }

        // Failsafe: if completely silent for 15s, stop and restart loop
        maxRecordTimerRef.current = setTimeout(() => {
            if (mediaRecorderRef.current?.state === 'recording') {
                addLog("15s timeout hit (no speech detected), resetting loop.");
                mediaRecorderRef.current.stop();
            }
        }, 15000);
    };

    const processAudio = async () => {
        if (!isOpen) return;
        setState('processing');
        const groqKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!groqKey) {
            setAiResponse("Groq API key is missing.");
            addLog("Missing VITE_GROQ_API_KEY environment variable.", "error");
            setState('idle');
            return;
        }

        try {
            // 1. STT (Whisper)
            addLog("Uploading to Whisper STT...");
            const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType || 'audio/mp4' });
            const fileExt = mediaRecorderRef.current.mimeType?.includes('webm') ? 'webm' : 'm4a';
            const formData = new FormData();
            formData.append('file', audioBlob, `voice.${fileExt}`);
            formData.append('model', 'whisper-large-v3-turbo');
            formData.append('language', 'en');

            const sttRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${groqKey}` },
                body: formData,
            });

            if (!sttRes.ok) throw new Error(`Whisper Error: ${sttRes.status} ${sttRes.statusText}`);
            const sttData = await sttRes.json();
            const text = sttData.text?.trim();

            if (!text) {
                addLog("Whisper returned empty string. Background noise?", "warning");
                // Background noise/silence caught - just loop back silently!
                if (isAutoModeRef.current && isOpen) {
                    startListening();
                } else {
                    setState('idle');
                }
                return;
            }

            setTranscript(text);
            addLog(`User said: "${text}"`, "success");

            // 2. Generate Response (LLM)
            addLog("Requesting Llama AI response...");
            const summary = transactions.slice(0, 5).map(t => `${t.type}: ₹${t.amount} on ${t.category}`).join(', ');

            const completionRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: `You are OrangeFin Voice Assistant. You speak exclusively in English, but act completely natural and conversational like a human on the phone. Do NOT use markdown. Reply in ONE short, snappy sentence max. User name: ${userName || 'user'}. Recent transactions summary: ${summary}` },
                        ...conversation,
                        { role: 'user', content: text }
                    ],
                    max_tokens: 150,
                    temperature: 0.6,
                }),
            });

            if (!completionRes.ok) {
                const errData = await completionRes.json();
                throw new Error(errData.error?.message || `Llama Error: ${completionRes.status}`);
            }
            const aiData = await completionRes.json();
            const reply = aiData.choices[0]?.message?.content || "Hmm, I didn't quite get that.";

            addLog(`AI reply received: "${reply}"`, "success");
            setConversation(prev => [...prev.slice(-6), { role: 'user', content: text }, { role: 'assistant', content: reply }]);
            setAiResponse(reply);
            speakText(reply);

        } catch (err) {
            console.error(err);
            setAiResponse(err.message || "Something went wrong.");
            addLog(`Failure: ${err.message}`, "error");

            // Loop back on error after a brief delay so we don't break the session
            if (isAutoModeRef.current && isOpen) {
                setTimeout(startListening, 3000);
            } else {
                setState('idle');
            }
        }
    };

    const speakText = (text) => {
        if (!isOpen) return;
        setState('speaking');

        // Stripping markdown & emojis for TTS engine
        const cleanText = text.replace(/[*_#`~]/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

        if (!cleanText.trim()) {
            addLog("Nothing to speak (text was barren). Restarting listen.");
            if (isAutoModeRef.current && isOpen) startListening();
            else setState('idle');
            return;
        }

        addLog(`Starting TTS: "${cleanText}"`);

        // Ensure iOS/Safari hasn't killed the speech engine by calling resume
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Prioritize Indian English Voices (en-IN)
        const voices = window.speechSynthesis.getVoices();
        let preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN') || v.name.includes('India'));

        // Fallbacks
        if (!preferredVoice) preferredVoice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Female'));
        if (!preferredVoice) preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Samantha')));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
            addLog(`Assigned Voice: ${preferredVoice.name}`, "success");
        } else {
            addLog("No preferred voice, using default.", "warning");
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            addLog("TTS .onstart fired.", "success");
            // Clear the safety timeout if speech successfully starts
            if (window._ttsSafetyTimeout) clearTimeout(window._ttsSafetyTimeout);
        };

        const handleComplete = () => {
            if (window._ttsSafetyTimeout) clearTimeout(window._ttsSafetyTimeout);
            if (isAutoModeRef.current && isOpen) {
                setTimeout(startListening, 300); // Back into the loop
            } else {
                setState('idle');
            }
        };

        utterance.onend = () => {
            addLog("TTS .onend fired.", "success");
            handleComplete();
        };

        utterance.onerror = (e) => {
            addLog(`TTS .onerror Fired! Event: ${e.error}`, "error");
            handleComplete();
        };

        window.activeSpeechUtterance = utterance; // GC fix
        window.speechSynthesis.speak(utterance);

        // Hardware failsafe if onstart/onend never fires (iOS bug)
        const words = cleanText.split(' ').length;
        const estimatedDurationMs = Math.max(3000, words * 450);

        window._ttsSafetyTimeout = setTimeout(() => {
            setState(s => {
                if (s === 'speaking') {
                    addLog(`Safety timeout hit (${estimatedDurationMs}ms). Forcing loop restart.`, "warning");
                    if (isAutoModeRef.current && isOpen) setTimeout(startListening, 100);
                    return 'idle';
                }
                return s;
            });
        }, estimatedDurationMs + 4000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-[2rem] w-full max-w-sm md:max-w-4xl max-h-[90vh] p-6 text-center relative overflow-hidden flex flex-col items-center shadow-2xl flex-shrink-0"
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors z-20">
                        <X size={20} />
                    </button>
                    <button onClick={() => setShowDiagnostics(!showDiagnostics)} className={`absolute top-4 left-4 p-2 rounded-full transition-colors z-20 ${showDiagnostics ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                        <Settings2 size={20} />
                    </button>

                    {/* Dynamic background blobs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-50 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

                    <div className={`flex w-full transition-all duration-300 ${showDiagnostics ? 'flex-col md:flex-row gap-6' : 'flex-col justify-center max-w-sm mx-auto'}`}>

                        {/* MAIN UI COLUMN */}
                        <div className={`flex flex-col items-center flex-1 w-full ${showDiagnostics ? 'md:max-w-xs' : ''}`}>
                            <h2 className="text-xl font-black text-slate-800 mb-8 relative z-10 w-full">Voice Assistant</h2>

                            {/* Avatar Ring Animation */}
                            <div className="relative mb-6 flex justify-center w-full z-10">
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

                                <div className="relative w-24 h-24 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-full flex items-center justify-center shadow-xl z-20">
                                    {state === 'listening' ? <Mic size={40} className="text-white" /> :
                                        state === 'processing' ? <RefreshCcw size={36} className="text-white animate-spin" /> :
                                            state === 'speaking' ? <Volume2 size={40} className="text-white animate-pulse" /> :
                                                <Mic size={40} className="text-white opacity-90" />}
                                </div>
                            </div>

                            <div className="h-44 w-full relative z-10 flex flex-col items-center space-y-4">
                                {state === 'listening' && <p className="text-rose-500 font-bold animate-pulse text-lg">Listening...</p>}
                                {state === 'processing' && <p className="text-indigo-500 font-bold animate-pulse text-lg">Processing...</p>}

                                {/* Display real-time transcript or reply */}
                                {(state === 'speaking' || state === 'idle' || state === 'listening') && transcript && (
                                    <div className="flex flex-col gap-3 w-full text-left overflow-y-auto max-h-36 custom-scrollbar px-2">
                                        <p className="text-xs font-bold text-slate-400 bg-slate-50 p-2 rounded-lg self-end max-w-[90%] break-words border border-slate-100/60 shadow-sm">🗣️ "{transcript}"</p>
                                        {aiResponse && (
                                            <p className="font-semibold text-slate-800 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/80 self-start max-w-[95%] break-words shadow-sm">
                                                {aiResponse}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 w-full relative z-10 flex flex-col gap-2">
                                {state === 'idle' ? (
                                    <button
                                        onClick={() => {
                                            unlockAudio(); // Critical for iOS Safari TTS fix
                                            initStreamAndListen();
                                        }}
                                        className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                                    >
                                        <Mic size={20} /> Tap to Start
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            stopEverything();
                                        }}
                                        className="w-full bg-rose-100 text-rose-600 font-bold py-3.5 rounded-xl hover:bg-rose-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <StopCircle size={20} /> Stop Conversation
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* DIAGNOSTICS COLUMN (Hidden by default) */}
                        {showDiagnostics && (
                            <div className="flex-1 w-full bg-slate-900 rounded-2xl p-4 text-left overflow-hidden flex flex-col h-[400px] md:h-auto shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] border border-slate-800 relative z-10">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                                    <h3 className="text-emerald-400 font-mono text-sm font-bold flex items-center gap-2">
                                        <ShieldAlert size={16} /> SYSTEM DIAGNOSTICS
                                    </h3>
                                    <div className="flex gap-2 text-[10px] font-mono text-slate-400 font-bold bg-slate-800 px-2 py-1 rounded">
                                        Vol: {dbLevel.toFixed(1)} dB Bar:
                                        <div className="w-16 h-3 bg-slate-700 rounded overflow-hidden relative">
                                            <div className="absolute top-0 bottom-0 left-0 bg-emerald-500" style={{ width: `${Math.min(100, (dbLevel / 100) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mb-4 bg-slate-800 p-2 rounded">
                                    <div>State: <span className="text-white">{state}</span></div>
                                    <div>Looping: <span className={isAutoModeRef.current ? "text-emerald-400" : "text-rose-400"}>{isAutoModeRef.current ? 'ON' : 'OFF'}</span></div>
                                    <div>Chunks: <span className="text-indigo-300">{audioChunksRef.current.length}</span></div>
                                    <div>TTS Supp: <span className={audioSupport.speechSynthesis ? "text-emerald-400" : "text-rose-400"}>{audioSupport.speechSynthesis ? 'Yes' : 'No'}</span></div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-1.5 flex flex-col-reverse">
                                    {[...logs].reverse().map((log, i) => (
                                        <div key={i} className={`border-b border-slate-800/50 pb-1 ${log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-300' : log.type === 'warning' ? 'text-orange-300' : 'text-slate-300'}`}>
                                            <span className="text-slate-600 mr-2">[{log.time}]</span>
                                            {log.msg}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence >
    );
};
