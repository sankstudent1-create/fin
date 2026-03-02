import { useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';

// Helper to get or create a unique device ID
const getDeviceId = () => {
    let devId = localStorage.getItem('device_id');
    if (!devId) {
        devId = crypto.randomUUID ? crypto.randomUUID() : 'dev_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device_id', devId);
    }
    return devId;
};

// Helper to parse basic device info
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return { deviceName: `${os} Device`, browser, os };
};

export const useActivityTracker = (session) => {
    const sessionIdRef = useRef(null);

    useEffect(() => {
        if (!session || !navigator.onLine) return;

        let interval;
        const initTracking = async () => {
            const deviceId = getDeviceId();
            const { deviceName, browser, os } = getDeviceInfo();

            try {
                // 1. Upsert Device Info
                await supabase.from('user_devices').upsert({
                    device_id: deviceId,
                    user_id: session.user.id,
                    device_name: deviceName,
                    browser,
                    os,
                    last_active: new Date().toISOString()
                }, { onConflict: 'device_id' });

                let geo_location_data = {
                    loc: 'Unknown Location',
                    lat: null,
                    lon: null
                };
                let ip_address = 'Unknown';
                try {
                    const res = await fetch('https://ipapi.co/json/');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.ip) ip_address = data.ip;
                        if (data.city) {
                            geo_location_data = {
                                loc: `${data.city}, ${data.region}, ${data.country_name}`,
                                lat: data.latitude,
                                lon: data.longitude
                            };
                        }
                    }
                } catch (e) {
                    console.log('Geo fetch failed, skipping geo log');
                }

                // 3. Create Session Record
                const { data: sessionData, error } = await supabase.from('app_sessions').insert({
                    user_id: session.user.id,
                    device_id: deviceId,
                    ip_address,
                    geo_location: JSON.stringify(geo_location_data)
                }).select().single();

                if (sessionData && !error) {
                    sessionIdRef.current = sessionData.id;

                    // 4. Start Heartbeat (Add 30 seconds to the DB every 30 seconds)
                    interval = setInterval(async () => {
                        if (navigator.onLine && sessionIdRef.current) {
                            await supabase.rpc('update_session_time', {
                                p_session_id: sessionIdRef.current,
                                p_seconds: 30
                            });
                        }
                    }, 30000);

                    // Push permission check is now explicitly handled in Dashboard.jsx UI
                }
            } catch (err) {
                console.error("Activity tracking error:", err);
            }
        };

        initTracking();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [session]);
};
