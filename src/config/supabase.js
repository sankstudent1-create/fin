
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://joanfonaixkgbpbyuwch.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvYW5mb25haXhrZ2JwYnl1d2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjk2NjQsImV4cCI6MjA4NzYwNTY2NH0.KpWdsdb5oWStJMZsmE1dJyqRCqDVD4tfN-d3IVn2yec";

// ─── DEV-ONLY diagnostics ─────────────────────────────────────────────────────
// NOTE: The anon/public key is intentionally public (it's safe, controlled by RLS).
// We only expose it in DEV mode — never log it in production.
const IS_DEV = import.meta.env.DEV;

if (IS_DEV) {
    window.__FIN_DIAG__ = {
        supabaseUrl,
        envUrl: import.meta.env.VITE_SUPABASE_URL || '⚠️ NOT SET (using hardcoded fallback)',
        envKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set via env' : '⚠️ NOT SET (using hardcoded fallback)',
        status: 'checking…',
        errors: [],
    };

    console.group('%c🟠 Orange Finance — Dev Diagnostics', 'font-size:13px;font-weight:bold;color:#ea580c');
    console.log('%cSupabase URL :', 'font-weight:bold;color:#64748b', supabaseUrl);
    console.log('%cVITE_URL env :', 'font-weight:bold;color:#64748b', window.__FIN_DIAG__.envUrl);
    console.log('%cVITE_KEY env :', 'font-weight:bold;color:#64748b', window.__FIN_DIAG__.envKey);
    console.groupEnd();
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: {
        fetch: async (url, options) => {
            const start = Date.now();
            try {
                const res = await fetch(url, options);
                const ms = Date.now() - start;

                if (!res.ok) {
                    const clone = res.clone();
                    const body = await clone.json().catch(() => ({}));
                    const path = url.split('/').slice(-2).join('/');
                    const msg = `[${res.status}] ${path} — ${body?.message || body?.error || 'Unknown error'}`;

                    // Always log errors (even in production — no sensitive data in error messages)
                    console.error('%c🔴 Supabase Error', 'color:#ef4444;font-weight:bold', msg);

                    if (IS_DEV) {
                        console.error('   Detail:', { url, body, ms });
                        if (window.__FIN_DIAG__) {
                            window.__FIN_DIAG__.errors.push({ time: new Date().toISOString(), msg, status: res.status });
                            window.__FIN_DIAG__.status = 'error';
                        }
                    }
                } else if (IS_DEV) {
                    console.debug('%c🟢 Supabase', 'color:#22c55e', url.split('/').slice(-2).join('/'), `${ms}ms`);
                    if (window.__FIN_DIAG__ && window.__FIN_DIAG__.status !== 'error') {
                        window.__FIN_DIAG__.status = 'ok';
                    }
                }
                return res;
            } catch (err) {
                const ms = Date.now() - start;
                const msg = err?.message || 'Network error';

                // Always log network failures
                console.error('%c🔴 Supabase Network Error', 'color:#ef4444;font-weight:bold', msg);

                if (IS_DEV) {
                    console.error('   Possible causes:', [
                        '1. Supabase project is PAUSED (free tier → resume at supabase.com/dashboard)',
                        '2. Domain not whitelisted: Auth → URL Configuration → add your domain',
                        '3. ISP/firewall blocking the connection',
                        '4. Wrong VITE_SUPABASE_URL env variable',
                    ].join('\n   '));
                    if (window.__FIN_DIAG__) {
                        window.__FIN_DIAG__.errors.push({ time: new Date().toISOString(), msg, url, ms });
                        window.__FIN_DIAG__.status = 'network_fail';
                    }
                }
                throw err;
            }
        },
    },
});

// ─── Connectivity ping — DEV only ────────────────────────────────────────────
if (IS_DEV) {
    (async () => {
        try {
            const t0 = Date.now();
            const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
                headers: { apikey: supabaseKey },
                signal: AbortSignal.timeout(8000),
            });
            const ms = Date.now() - t0;
            const body = await res.json().catch(() => ({}));
            if (res.ok) {
                console.log('%c✅ Supabase PING OK', 'color:#16a34a;font-weight:bold', `${ms}ms`, body.name || '');
                if (window.__FIN_DIAG__) { window.__FIN_DIAG__.ping = { ok: true, ms }; window.__FIN_DIAG__.status = 'connected'; }
            } else {
                console.warn('%c⚠️ Supabase PING error', 'color:#d97706', res.status);
                if (window.__FIN_DIAG__) window.__FIN_DIAG__.ping = { ok: false, status: res.status };
            }
        } catch (err) {
            console.error('%c❌ Supabase PING FAILED', 'color:#ef4444;font-weight:bold', err.message);
            console.error('   Fix: Resume project at https://supabase.com/dashboard/project/joanfonaixkgbpbyuwch');
            if (window.__FIN_DIAG__) window.__FIN_DIAG__.ping = { ok: false, error: err.message };
        }
    })();
}
