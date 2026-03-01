import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { title, body, icon, url, targetUserIds } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Missing title or body for notification' });
        }

        // Initialize VAPID Keys
        const publicVapidKey = process.env.VITE_VAPID_PUBLIC_KEY;
        const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
        const subject = process.env.VAPID_SUBJECT || 'mailto:admin@swinfosystems.online';

        if (!publicVapidKey || !privateVapidKey) {
            return res.status(500).json({ error: 'Web Push VAPID keys are not configured in environment variables (VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY).' });
        }

        webPush.setVapidDetails(subject, publicVapidKey, privateVapidKey);

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch subscriptions from database
        let query = supabase.from('user_devices').select('push_subscription, user_id, device_name').not('push_subscription', 'is', null);

        // If targeting specific users, filter the query
        if (targetUserIds && Array.isArray(targetUserIds) && targetUserIds.length > 0) {
            query = query.in('user_id', targetUserIds);
        }

        const { data: devices, error } = await query;

        if (error) {
            console.error('Database fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch subscriptions' });
        }

        const validSubscriptions = devices.filter(d => d.push_subscription && d.push_subscription.endpoint);

        if (validSubscriptions.length === 0) {
            return res.status(200).json({ success: true, message: 'No valid push subscriptions found for target audience.', sentCount: 0 });
        }

        const payload = JSON.stringify({
            title,
            body,
            icon: icon || 'https://fin.swinfosystems.online/favicon.ico',
            data: { url: url || '/' }
        });

        let successCount = 0;
        let failCount = 0;

        // Send notifications in parallel
        await Promise.all(validSubscriptions.map(async (device) => {
            try {
                await webPush.sendNotification(device.push_subscription, payload);
                successCount++;
            } catch (err) {
                console.error('Push Notice Error for user', device.user_id, ':', err.statusCode);
                failCount++;
                // If subscription expired/unsubscribed (410), we could optionally delete it from DB here
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabase.from('user_devices').update({ push_subscription: null }).eq('user_id', device.user_id).eq('device_name', device.device_name);
                }
            }
        }));

        return res.status(200).json({
            success: true,
            message: `Push notification broadcast complete.`,
            sentCount: successCount,
            failCount: failCount
        });

    } catch (err) {
        console.error('System error in push notify:', err);
        return res.status(500).json({ error: 'Internal server failure broadcasting' });
    }
}
