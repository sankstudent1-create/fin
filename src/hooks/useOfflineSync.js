import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export const useOfflineSync = (supabase, userId, onSyncComplete) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const syncData = async () => {
            if (!isOnline || !userId || !supabase) return;

            const pendingTxKey = `pending_tx_${userId}`;
            const pendingCatKey = `pending_cat_${userId}`;

            const pendingTx = JSON.parse(localStorage.getItem(pendingTxKey) || '[]');
            const pendingCat = JSON.parse(localStorage.getItem(pendingCatKey) || '[]');

            if (pendingTx.length === 0 && pendingCat.length === 0) return;

            setIsSyncing(true);

            // 1. Sync Categories
            for (const action of pendingCat) {
                try {
                    if (action.action === 'INSERT') {
                        await supabase.from('categories').insert([action.data]);
                    } else if (action.action === 'DELETE') {
                        await supabase.from('categories').delete().eq('id', action.id);
                    }
                } catch (e) { console.error("Cat Sync error:", e); }
            }
            localStorage.setItem(pendingCatKey, JSON.stringify([]));

            // 2. Sync Transactions
            for (const action of pendingTx) {
                try {
                    if (action.action === 'INSERT') {
                        const { id, ...dataToInsert } = action.data;
                        await supabase.from('transactions').insert([dataToInsert]);
                    } else if (action.action === 'DELETE') {
                        await supabase.from('transactions').delete().eq('id', action.id);
                    } else if (action.action === 'UPDATE') {
                        const { id, ...updates } = action.data;
                        await supabase.from('transactions').update(updates).eq('id', id);
                    }
                } catch (e) { console.error("Tx Sync error:", e); }
            }

            localStorage.setItem(pendingTxKey, JSON.stringify([]));
            setIsSyncing(false);

            if (onSyncComplete) onSyncComplete();

            // Trigger success visuals
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f97316', '#fb923c', '#fdba74']
            });
        };

        if (isOnline) syncData();
    }, [isOnline, userId, supabase]);

    return { isOnline, isSyncing };
};
