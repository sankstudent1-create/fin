/**
 * useOfflineSync — real offline transaction queue with localStorage + sync
 * 
 * Strategy:
 * - When OFFLINE: rejected Supabase saves get queued to localStorage
 * - When coming back ONLINE: queue is flushed automatically
 * - syncStatus: 'idle' | 'syncing' | 'synced' | 'offline' | 'error'
 */

import { useEffect, useState, useCallback, useRef } from 'react';

const QUEUE_KEY = 'of_offline_queue';
const SYNC_COOLDOWN_MS = 2000;

const loadQueue = () => {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
};
const saveQueue = (q) => localStorage.setItem(QUEUE_KEY, JSON.stringify(q));

export const useOfflineSync = (supabase, session) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState(navigator.onLine ? 'idle' : 'offline');
    const [pendingCount, setPendingCount] = useState(() => loadQueue().length);
    const syncing = useRef(false);

    /* ── Flush the offline queue ─────────────────────────────── */
    const flushQueue = useCallback(async () => {
        if (syncing.current || !session?.user) return;
        const queue = loadQueue();
        if (queue.length === 0) {
            setSyncStatus('idle');
            return;
        }

        syncing.current = true;
        setSyncStatus('syncing');
        console.log(`[OfflineSync] Flushing ${queue.length} queued transactions…`);

        const remaining = [];
        for (const item of queue) {
            try {
                if (item.op === 'insert') {
                    // Extract only the fields Supabase expects (don't send _queued, _pending, or id)
                    const { _queued, _pending, id, ...dbData } = item.data;
                    const { error } = await supabase.from('transactions').insert([dbData]).select();
                    if (error) { remaining.push(item); console.warn('[OfflineSync] Retry failed:', error.message); }
                    else console.log('[OfflineSync] Synced insert:', dbData.title);
                } else if (item.op === 'update') {
                    const { error } = await supabase.from('transactions').update(item.data).eq('id', item.id);
                    if (error) { remaining.push(item); }
                } else if (item.op === 'delete') {
                    const { error } = await supabase.from('transactions').delete().eq('id', item.id);
                    if (error) { remaining.push(item); }
                }
            } catch {
                remaining.push(item);
            }
        }

        saveQueue(remaining);
        setPendingCount(remaining.length);
        setSyncStatus(remaining.length === 0 ? 'synced' : 'error');

        // Reset to 'idle' after 3s
        setTimeout(() => setSyncStatus(isOnline ? 'idle' : 'offline'), 3000);

        syncing.current = false;
    }, [supabase, session, isOnline]);

    /* ── Online / offline events ─────────────────────────────── */
    useEffect(() => {
        const onOnline = () => {
            setIsOnline(true);
            setSyncStatus('syncing');
            // Small delay so Supabase connection settles
            setTimeout(flushQueue, SYNC_COOLDOWN_MS);
        };
        const onOffline = () => {
            setIsOnline(false);
            setSyncStatus('offline');
        };

        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, [flushQueue]);

    /* ── On mount: flush any leftover queue if online ─────────── */
    useEffect(() => {
        if (navigator.onLine && session?.user) {
            const q = loadQueue();
            if (q.length > 0) {
                setSyncStatus('syncing');
                setTimeout(flushQueue, 1000);
            }
        }
    }, [session?.user?.id]); // eslint-disable-line

    /* ── Queue helpers (called by Dashboard) ─────────────────── */
    const queueInsert = useCallback((data) => {
        const queue = loadQueue();
        // Give it a temporary negative id so we can track it
        const item = { op: 'insert', data: { ...data, _queued: true }, _localId: `local_${Date.now()}` };
        queue.push(item);
        saveQueue(queue);
        setPendingCount(queue.length);
        return item._localId;
    }, []);

    const queueDelete = useCallback((id) => {
        const queue = loadQueue();
        queue.push({ op: 'delete', id });
        saveQueue(queue);
        setPendingCount(queue.length);
    }, []);

    const queueUpdate = useCallback((id, data) => {
        const queue = loadQueue();
        queue.push({ op: 'update', id, data });
        saveQueue(queue);
        setPendingCount(queue.length);
    }, []);

    return {
        isOnline,
        syncStatus,
        pendingCount,
        flushQueue,
        queueInsert,
        queueDelete,
        queueUpdate,
    };
};
