import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Activity, MapPin, MonitorSmartphone, Clock, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { AdminMapAnimation } from './AdminMapAnimation';

export const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalTimeSpent: 0,
        uniqueDevices: 0,
    });
    const [recentSessions, setRecentSessions] = useState([]);

    // Banner Settings State
    const [settings, setSettings] = useState({
        show_support_banner: false,
        support_title: '',
        support_message: '',
        support_image_url: ''
    });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch global settings
            const { data: appSettings } = await supabase.from('app_settings').select('*').eq('id', 1).single();
            if (appSettings) setSettings(appSettings);

            // Fetch aggregate stats
            const { count: sessionCount } = await supabase.from('app_sessions').select('*', { count: 'exact', head: true });
            const { count: deviceCount } = await supabase.from('user_devices').select('*', { count: 'exact', head: true });
            // Sum time spent
            const { data: timeData } = await supabase.from('app_sessions').select('time_spent_seconds');
            const totalSecs = timeData?.reduce((acc, curr) => acc + (curr.time_spent_seconds || 0), 0) || 0;

            setStats({
                totalSessions: sessionCount || 0,
                uniqueDevices: deviceCount || 0,
                totalTimeSpent: totalSecs
            });

            // Fetch recent sessions
            const { data: latest } = await supabase.from('app_sessions')
                .select('*, user_devices(device_name, os, browser)')
                .order('session_start', { ascending: false })
                .limit(20);

            setRecentSessions(latest || []);
        } catch (err) {
            console.error("Error loading analytics:", err);
        }
        setLoading(false);
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            await supabase.from('app_settings').upsert({
                id: 1,
                ...settings,
                updated_at: new Date().toISOString()
            });
            alert('Settings saved successfully!');
        } catch (err) {
            alert('Failed to save settings.');
        }
        setSavingSettings(false);
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Sessions</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.totalSessions}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Time Spent</p>
                        <h3 className="text-3xl font-black text-slate-900">
                            {Math.floor(stats.totalTimeSpent / 3600)}h {Math.floor((stats.totalTimeSpent % 3600) / 60)}m
                        </h3>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <MonitorSmartphone size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Unique Devices</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.uniqueDevices}</h3>
                    </div>
                </div>
            </div>

            {/* Map Animation Section */}
            <AdminMapAnimation sessions={recentSessions} />

            {/* Platform Settings */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <ImageIcon className="text-orange-500" /> Homescreen Announcement Settings
                </h2>
                <div className="space-y-4 max-w-2xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.show_support_banner}
                            onChange={e => setSettings({ ...settings, show_support_banner: e.target.checked })}
                            className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500 border-slate-300"
                        />
                        <span className="font-bold text-slate-700">Enable Homescreen Pop-up Modal</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Title</label>
                            <input
                                type="text"
                                value={settings.support_title}
                                onChange={e => setSettings({ ...settings, support_title: e.target.value })}
                                placeholder="e.g. Server Maintenance"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Image URL (Optional)</label>
                            <input
                                type="text"
                                value={settings.support_image_url}
                                onChange={e => setSettings({ ...settings, support_image_url: e.target.value })}
                                placeholder="https://..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Message Body</label>
                        <textarea
                            value={settings.support_message}
                            onChange={e => setSettings({ ...settings, support_message: e.target.value })}
                            placeholder="Type your message here..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 outline-none resize-none"
                        />
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                    >
                        {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Settings
                    </button>
                </div>
            </div>

            {/* Live Session Logs */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <MapPin className="text-emerald-500" /> Recent User Activity Logs
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                                <th className="p-4 font-black rounded-tl-xl">Start Time</th>
                                <th className="p-4 font-black">User ID</th>
                                <th className="p-4 font-black">Device</th>
                                <th className="p-4 font-black">Location (IP)</th>
                                <th className="p-4 font-black text-right rounded-tr-xl">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSessions.map((s, i) => (
                                <tr key={s.id} className={`text-xs font-bold border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                    <td className="p-4 text-slate-600">{new Date(s.session_start).toLocaleString()}</td>
                                    <td className="p-4 text-slate-400 font-mono text-[10px] truncate max-w-[100px]" title={s.user_id}>{s.user_id}</td>
                                    <td className="p-4 text-slate-700">
                                        {s.user_devices ? `${s.user_devices.device_name} (${s.user_devices.os})` : 'Unknown'}
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        {s.geo_location || 'Unknown'} <span className="text-[10px] text-slate-400 ml-1">({s.ip_address || '—'})</span>
                                    </td>
                                    <td className="p-4 text-right text-slate-600 font-mono">
                                        {Math.floor(s.time_spent_seconds / 60)}m {s.time_spent_seconds % 60}s
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
