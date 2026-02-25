
export const playSound = (type = 'click') => {
    if (localStorage.getItem('sound_enabled') === 'false') return;
    try {
        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.volume = 0.5;
        audio.play().catch(() => { });
    } catch (e) {
        // Silent fail
    }
};
