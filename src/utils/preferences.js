const PREFS_KEY = 'orange_fin_prefs';
const DEFAULT_PREFS = {
    sound_enabled: true, sound_volume: 70, sound_duration: 300,
    sound_effect: 'chime',
    sound_on_tx: true, sound_on_delete: true, sound_on_success: true,
    notification_enabled: true, popup_duration: 3000,
    popup_style: 'pill', popup_position: 'bottom',
    theme: 'light', biometric_enabled: false,
    ui_density: 'normal',
};

export const getUserPrefs = () => {
    try {
        const s = localStorage.getItem(PREFS_KEY);
        return s ? { ...DEFAULT_PREFS, ...JSON.parse(s) } : { ...DEFAULT_PREFS };
    } catch {
        return { ...DEFAULT_PREFS };
    }
};

export const saveUserPrefs = (p) => {
    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    } catch (e) {
        console.error("Save prefs error:", e);
    }
};
