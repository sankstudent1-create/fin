
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://joanfonaixkgbpbyuwch.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvYW5mb25haXhrZ2JwYnl1d2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjk2NjQsImV4cCI6MjA4NzYwNTY2NH0.KpWdsdb5oWStJMZsmE1dJyqRCqDVD4tfN-d3IVn2yec";

// ─── DIAGNOSTICS ────────────────────────────────────────────────────────────
// Reads VITE_ env at build time. At runtime it falls back to the hardcoded values.
// Check window.__FIN_DIAG__ in DevTools console for live status.
window.__FIN_DIAG__ = {
    supabaseUrl,
    envUrl: import.meta.env.VITE_SUPABASE_URL || '⚠️ NOT SET (using hardcoded)',
    envKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set via env' : '⚠️ NOT SET (using hardcoded)',
    status: 'checking…',
    errors: [],
};

// Pretty startup banner
console.group('%c🟠 Orange Finance — Startup Diagnostics', 'font-size:14px;font-weight:bold;color:#ea580c');
console.log('%cSupabase URL  :', 'font-weight:bold;color:#64748b', supabaseUrl);
console.log('%cAnon Key      :', 'font-weight:bold;color:#64748b', supabaseKey.slice(0, 30) + '…');
console.log('%cVITE_URL env  :', 'font-weight:bold;color:#64748b', window.__FIN_DIAG__.envUrl);
console.log('%cVITE_KEY env  :', 'font-weight:bold;color:#64748b', window.__FIN_DIAG__.envKey);
console.groupEnd();

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: {
        // Intercept every fetch to log errors
        fetch: async (url, options) => {
            const start = Date.now();
            try {
                const res = await fetch(url, options);
                const ms = Date.now() - start;

                if (!res.ok) {
                    // Clone response so we can still read the body downstream
                    const clone = res.clone();
                    const body = await clone.json().catch(() => ({}));
                    const msg = `[${res.status}] ${url.split('/').slice(-2).join('/')} — ${body?.message || body?.error || 'Unknown error'}`;
                    console.error('%c🔴 Supabase Error', 'color:#ef4444;font-weight:bold', msg, { url, body, ms });
                    window.__FIN_DIAG__.errors.push({ time: new Date().toISOString(), msg, status: res.status });
                    window.__FIN_DIAG__.status = 'error';
                } else {
                    console.debug('%c🟢 Supabase OK', 'color:#22c55e;font-weight:bold',
                        url.split('/').slice(-2).join('/'), `${Date.now() - start}ms`);
                    if (window.__FIN_DIAG__.status !== 'error') window.__FIN_DIAG__.status = 'ok';
                }
                return res;
            } catch (err) {
                const ms = Date.now() - start;
                const msg = err?.message || 'Network error (ERR_CONNECTION_TIMED_OUT / blocked)';
                console.error('%c🔴 Supabase NETWORK FAIL', 'color:#ef4444;font-weight:bold;font-size:13px', msg, { url, ms });
                console.error('%c   Possible causes:', 'color:#f97316',
                    '\n   1. Supabase project is PAUSED (free tier)',
                    '\n   2. Domain not whitelisted in Supabase Auth → URL Configuration',
                    '\n   3. Local ISP/firewall blocking the connection',
                    '\n   4. Wrong VITE_SUPABASE_URL env variable',
                    `\n\n   Run in console: window.__FIN_DIAG__ to see full status`
                );
                window.__FIN_DIAG__.errors.push({ time: new Date().toISOString(), msg, url, ms });
                window.__FIN_DIAG__.status = 'network_fail';
                throw err;
            }
        },
    },
});

// ─── CONNECTIVITY PING ───────────────────────────────────────────────────────
// Fires once on load — result shows in console as "Supabase PING"
(async () => {
    try {
        const t0 = Date.now();
        // Auth health endpoint — works without any DB tables
        const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
            headers: { apikey: supabaseKey },
            signal: AbortSignal.timeout(8000),
        });
        const ms = Date.now() - t0;
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
            console.log('%c✅ Supabase PING OK', 'color:#16a34a;font-weight:bold;font-size:13px', `${ms}ms`, body);
            window.__FIN_DIAG__.ping = { ok: true, ms, body };
            window.__FIN_DIAG__.status = 'connected';
        } else {
            console.warn('%c⚠️ Supabase PING returned error', 'color:#d97706;font-weight:bold', res.status, body);
            window.__FIN_DIAG__.ping = { ok: false, status: res.status, body };
        }
    } catch (err) {
        console.error('%c❌ Supabase PING FAILED — project unreachable', 'color:#ef4444;font-weight:bold;font-size:13px',
            '\nError:', err.message,
            '\nFix: Resume project at https://supabase.com/dashboard/project/joanfonaixkgbpbyuwch'
        );
        window.__FIN_DIAG__.ping = { ok: false, error: err.message };
    }
})();
