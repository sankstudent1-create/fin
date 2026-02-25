
import { useEffect, useState } from 'react';
// import { supabase } from '../config/supabase';

export const useOfflineSync = (supabase, session) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState('idle');

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setSyncStatus('syncing');
            // Mock sync
            setTimeout(() => setSyncStatus('synced'), 2000);
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Also poll data or sync queue if offline mode was real
    // For now, just return online status

    return { isOnline, syncStatus };
};
