const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playTone = (freq, type, duration, volume = 0.1) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
};

export const playSound = (type = 'modern') => {
    const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
    if (settings.soundEnabled === false) return;

    const actualType = settings.soundType || type;

    switch (actualType) {
        case 'retro':
            playTone(880, 'square', 0.1, 0.05);
            setTimeout(() => playTone(1760, 'square', 0.1, 0.05), 50);
            break;
        case 'subtle':
            playTone(440, 'sine', 0.3, 0.05);
            break;
        case 'modern':
        default:
            playTone(1200, 'triangle', 0.1, 0.05);
            setTimeout(() => playTone(1500, 'triangle', 0.2, 0.05), 80);
            break;
    }
};
