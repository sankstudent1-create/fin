/**
 * useSoundEngine — Web Audio API sound engine
 * Works 100% offline (no MP3 files needed — synthesized tones)
 * All settings stored in localStorage key: 'of_sound_prefs'
 */

const SOUND_KEY = 'of_sound_prefs';

export const SOUND_EFFECTS = {
    chime: { label: '🔔 Chime', desc: 'Classic bell' },
    pop: { label: '🫧 Pop', desc: 'Soft bubble' },
    coin: { label: '🪙 Coin', desc: 'Coin clink' },
    success: { label: '✅ Success', desc: 'Rising tone' },
    alert: { label: '🔴 Alert', desc: 'Attention ping' },
    swoosh: { label: '💨 Swoosh', desc: 'Sweep' },
    blip: { label: '📡 Blip', desc: 'Tech beep' },
};

export const DEFAULT_SOUND_PREFS = {
    enabled: true,
    volume: 0.7,      // 0–1
    effect: 'chime',  // key from SOUND_EFFECTS
    duration_ms: 350,      // how long the sound plays
    on_transaction: true,
    on_delete: true,
    on_success: true,
    on_error: true,
};

export const loadSoundPrefs = () => {
    try {
        const raw = localStorage.getItem(SOUND_KEY);
        return raw ? { ...DEFAULT_SOUND_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_SOUND_PREFS };
    } catch { return { ...DEFAULT_SOUND_PREFS }; }
};

export const saveSoundPrefs = (prefs) => {
    localStorage.setItem(SOUND_KEY, JSON.stringify(prefs));
};

/* ── Low-level synth ───────────────────────────────────────────── */
let _ctx = null;
const getCtx = () => {
    if (!_ctx || _ctx.state === 'closed') {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
};

const ramp = (param, from, to, start, end) => {
    param.setValueAtTime(from, start);
    param.exponentialRampToValueAtTime(Math.max(to, 0.0001), end);
};

/**
 * Synthesize and play a named effect.
 * @param {string} effect  — key in SOUND_EFFECTS
 * @param {number} volume  — 0–1
 * @param {number} dur_ms  — approx duration in ms (for multi-note effects)
 */
export const playSound = (effect = 'chime', volume = 0.7, dur_ms = 350) => {
    try {
        const ctx = getCtx();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, ctx.currentTime);

        const vol = Math.min(Math.max(volume, 0), 1) * 0.4; // cap so it's not jarring
        const dur = dur_ms / 1000;
        const now = ctx.currentTime;

        switch (effect) {
            case 'pop': {
                const o = ctx.createOscillator();
                o.type = 'sine';
                o.frequency.setValueAtTime(800, now);
                o.frequency.exponentialRampToValueAtTime(300, now + 0.07);
                o.connect(gain);
                ramp(gain.gain, 0, vol, now, now + 0.01);
                ramp(gain.gain, vol, 0.001, now + 0.01, now + 0.08);
                o.start(now); o.stop(now + 0.1);
                break;
            }
            case 'coin': {
                [0, 0.04, 0.08].forEach((offset, i) => {
                    const o = ctx.createOscillator();
                    o.type = 'triangle';
                    o.frequency.setValueAtTime(1200 + i * 200, now + offset);
                    o.connect(gain);
                    ramp(gain.gain, 0, vol, now + offset, now + offset + 0.01);
                    ramp(gain.gain, vol, 0.001, now + offset + 0.01, now + offset + 0.12);
                    o.start(now + offset); o.stop(now + offset + 0.14);
                });
                break;
            }
            case 'success': {
                [[523, 0], [659, 0.12], [784, 0.24]].forEach(([freq, offset]) => {
                    const o = ctx.createOscillator();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + offset);
                    o.connect(gain);
                    ramp(gain.gain, 0, vol, now + offset, now + offset + 0.02);
                    ramp(gain.gain, vol, 0.001, now + offset + 0.02, now + offset + 0.18);
                    o.start(now + offset); o.stop(now + offset + 0.2);
                });
                break;
            }
            case 'alert': {
                [0, 0.15, 0.3].forEach((offset) => {
                    const o = ctx.createOscillator();
                    o.type = 'square';
                    o.frequency.setValueAtTime(880, now + offset);
                    o.connect(gain);
                    ramp(gain.gain, 0, vol * 0.6, now + offset, now + offset + 0.01);
                    ramp(gain.gain, vol * 0.6, 0.001, now + offset + 0.01, now + offset + 0.12);
                    o.start(now + offset); o.stop(now + offset + 0.12);
                });
                break;
            }
            case 'swoosh': {
                const o = ctx.createOscillator();
                const f = ctx.createBiquadFilter();
                f.type = 'bandpass';
                f.frequency.setValueAtTime(200, now);
                f.frequency.exponentialRampToValueAtTime(3000, now + dur);
                o.type = 'sawtooth';
                o.frequency.setValueAtTime(80, now);
                o.connect(f); f.connect(gain);
                ramp(gain.gain, 0, vol * 0.5, now, now + 0.05);
                ramp(gain.gain, vol * 0.5, 0.001, now + 0.05, now + dur);
                o.start(now); o.stop(now + dur + 0.05);
                break;
            }
            case 'blip': {
                const o = ctx.createOscillator();
                o.type = 'square';
                o.frequency.setValueAtTime(1400, now);
                o.connect(gain);
                ramp(gain.gain, 0, vol * 0.5, now, now + 0.005);
                ramp(gain.gain, vol * 0.5, 0.001, now + 0.005, now + 0.06);
                o.start(now); o.stop(now + 0.07);
                break;
            }
            case 'chime':
            default: {
                // Two-tone chime
                [[523, 0], [784, 0.1]].forEach(([freq, offset]) => {
                    const o = ctx.createOscillator();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + offset);
                    const env = ctx.createGain();
                    env.gain.setValueAtTime(0, now + offset);
                    env.gain.linearRampToValueAtTime(vol, now + offset + 0.02);
                    env.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
                    o.connect(env); env.connect(ctx.destination);
                    o.start(now + offset); o.stop(now + offset + dur + 0.05);
                });
                break;
            }
        }
    } catch (e) {
        console.warn('SoundEngine error:', e);
    }
};

/* ── Convenience players ────────────────────────────────────────── */
export const playSoundForEvent = (event, prefs) => {
    if (!prefs?.enabled) return;
    const map = {
        transaction: prefs.on_transaction,
        delete: prefs.on_delete,
        success: prefs.on_success,
        error: prefs.on_error,
    };
    if (!map[event]) return;

    const effect = event === 'delete' ? 'alert'
        : event === 'error' ? 'alert'
            : prefs.effect;
    playSound(effect, prefs.volume, prefs.duration_ms);
};
